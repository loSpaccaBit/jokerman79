import React from 'react';
import DOMPurify from 'isomorphic-dompurify';

interface MarkdownRendererProps {
    content: string;
    className?: string;
    allowedTags?: string[];
    allowedAttributes?: { [key: string]: string[] };
}

/**
 * Componente per renderizzare markdown semplice con sanitizzazione XSS
 * Supporta headers, liste, paragrafi e formattazione base
 * Utilizza DOMPurify per prevenire attacchi XSS
 */
export function MarkdownRenderer({ 
    content, 
    className = '',
    allowedTags = ['h2', 'h3', 'h4', 'p', 'ul', 'ol', 'li', 'strong', 'em', 'a'],
    allowedAttributes = {
        'a': ['href', 'target', 'rel', 'class'],
        '*': ['class']
    }
}: MarkdownRendererProps) {
    const renderContent = (text: string) => {
        if (!text) return null;

        return text
            .split('\n\n')
            .map((paragraph, index) => {
                // Headers H2
                if (paragraph.startsWith('## ')) {
                    const headerText = sanitizeContent(paragraph.replace('## ', ''));
                    return (
                        <h2 key={index} className="text-xl md:text-2xl font-bold mt-6 mb-3 text-primary">
                            {headerText}
                        </h2>
                    );
                }

                // Headers H3
                if (paragraph.startsWith('### ')) {
                    return (
                        <h3 key={index} className="text-lg md:text-xl font-semibold mt-4 mb-2 text-primary">
                            {paragraph.replace('### ', '')}
                        </h3>
                    );
                }

                // Headers H4
                if (paragraph.startsWith('#### ')) {
                    return (
                        <h4 key={index} className="text-base md:text-lg font-medium mt-3 mb-2">
                            {paragraph.replace('#### ', '')}
                        </h4>
                    );
                }

                // Liste non ordinate
                if (paragraph.includes('- ')) {
                    const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                    return (
                        <ul key={index} className="list-disc pl-6 mb-4 space-y-1">
                            {items.map((item, i) => (
                                <li key={i} className="leading-relaxed">
                                    {formatInlineText(item.replace('- ', ''))}
                                </li>
                            ))}
                        </ul>
                    );
                }

                // Liste ordinate
                if (paragraph.match(/^\d+\. /)) {
                    const items = paragraph.split('\n').filter(line => line.match(/^\d+\. /));
                    return (
                        <ol key={index} className="list-decimal pl-6 mb-4 space-y-1">
                            {items.map((item, i) => (
                                <li key={i} className="leading-relaxed">
                                    {formatInlineText(item.replace(/^\d+\. /, ''))}
                                </li>
                            ))}
                        </ol>
                    );
                }

                // Paragrafi normali
                if (paragraph.trim()) {
                    return (
                        <p key={index} className="mb-4 leading-relaxed">
                            {formatInlineText(paragraph)}
                        </p>
                    );
                }

                return null;
            })
            .filter(Boolean);
    };

    // Sanitizza l'input per prevenire XSS
    const sanitizeContent = (text: string): string => {
        return DOMPurify.sanitize(text, {
            ALLOWED_TAGS: allowedTags,
            ALLOWED_ATTR: allowedAttributes as any, // Fix TypeScript issue
            KEEP_CONTENT: true,
            ALLOW_DATA_ATTR: false,
            FORBID_ATTR: ['style', 'onclick', 'onerror', 'onload', 'onmouseover'],
            FORBID_TAGS: ['script', 'object', 'embed', 'form', 'input', 'textarea', 'button', 'select'],
        });
    };

    // Formattazione inline (grassetto, corsivo) con sanitizzazione
    const formatInlineText = (text: string): React.ReactNode => {
        // Dividi il testo in parti processando i link separatamente
        const parts: React.ReactNode[] = [];
        let currentIndex = 0;
        
        // Trova tutti i link nel formato [text](url)
        const linkRegex = /\[([^\]]+)\]\(([^)]+)\)/g;
        let match;
        
        while ((match = linkRegex.exec(text)) !== null) {
            const [fullMatch, linkText, url] = match;
            const matchStart = match.index;
            
            // Aggiungi il testo prima del link
            if (matchStart > currentIndex) {
                const beforeText = text.slice(currentIndex, matchStart);
                parts.push(processTextFormatting(beforeText, parts.length));
            }
            
            // Normalizza l'URL
            let normalizedUrl = url.trim();
            if (normalizedUrl.startsWith('www.')) {
                normalizedUrl = `https://${normalizedUrl}`;
            } else if (!normalizedUrl.match(/^https?:\/\//)) {
                if (normalizedUrl.includes('.') && !normalizedUrl.includes(' ')) {
                    normalizedUrl = `https://${normalizedUrl}`;
                }
            }
            
            // Valida l'URL
            try {
                const urlObj = new URL(normalizedUrl);
                if (['http:', 'https:', 'mailto:'].includes(urlObj.protocol)) {
                    // Crea un link React sicuro
                    parts.push(
                        <a
                            key={parts.length}
                            href={normalizedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 underline underline-offset-2 cursor-pointer"
                        >
                            {linkText}
                        </a>
                    );
                } else {
                    // URL sospetto, mostra solo il testo
                    parts.push(processTextFormatting(linkText, parts.length));
                }
            } catch {
                // URL non valido, mostra solo il testo
                parts.push(processTextFormatting(linkText, parts.length));
            }
            
            currentIndex = matchStart + fullMatch.length;
        }
        
        // Aggiungi il testo rimanente
        if (currentIndex < text.length) {
            const remainingText = text.slice(currentIndex);
            parts.push(processTextFormatting(remainingText, parts.length));
        }
        
        return parts.length > 1 ? <>{parts}</> : parts[0] || text;
    };

    // Processa la formattazione del testo (grassetto, corsivo)
    const processTextFormatting = (text: string, key: number): React.ReactNode => {
        // Escape HTML entities
        let sanitizedText = text
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#x27;');

        // Apply markdown formatting
        sanitizedText = sanitizedText.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        sanitizedText = sanitizedText.replace(/\*(.*?)\*/g, '<em>$1</em>');

        // Final sanitization
        const finalSanitized = sanitizeContent(sanitizedText);
        return <span key={key} dangerouslySetInnerHTML={{ __html: finalSanitized }} />;
    };

    return (
        <div className={`prose prose-sm max-w-none ${className}`}>
            {renderContent(content)}
        </div>
    );
}
