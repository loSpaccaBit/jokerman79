"use client";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import { cn } from "@/lib/utils";

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export function MarkdownRenderer({ content, className }: MarkdownRendererProps) {
  return (
    <div className={cn("prose prose-gray dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        components={{
          // Headings
          h1: ({ children }) => (
            <h1 className="text-4xl font-bold mt-12 mb-6 text-foreground border-b border-border pb-4">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-3xl font-semibold mt-10 mb-5 text-foreground border-b border-border/50 pb-3">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-2xl font-semibold mt-8 mb-4 text-foreground">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-xl font-medium mt-6 mb-3 text-foreground">
              {children}
            </h4>
          ),
          h5: ({ children }) => (
            <h5 className="text-lg font-medium mt-5 mb-2 text-foreground">
              {children}
            </h5>
          ),
          h6: ({ children }) => (
            <h6 className="text-base font-medium mt-4 mb-2 text-muted-foreground">
              {children}
            </h6>
          ),
          
          // Paragrafi
          p: ({ children }) => (
            <p className="mb-4 leading-relaxed text-foreground">
              {children}
            </p>
          ),
          
          // Liste
          ul: ({ children }) => (
            <ul className="list-disc pl-6 mb-6 space-y-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-6 mb-6 space-y-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-foreground leading-relaxed">
              {children}
            </li>
          ),
          
          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-primary/30 pl-6 py-4 my-6 bg-muted/30 rounded-r-lg italic">
              <div className="text-muted-foreground">
                {children}
              </div>
            </blockquote>
          ),
          
          // Code
          code: ({ inline, className, children, ...props }: any) => {
            const match = /language-(\w+)/.exec(className || '');
            
            if (inline) {
              return (
                <code 
                  className="bg-muted px-2 py-1 rounded text-sm font-mono text-primary"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            
            return (
              <div className="my-6">
                <pre className="bg-muted border rounded-lg p-4 overflow-x-auto">
                  <code 
                    className={`font-mono text-sm ${className}`}
                    {...props}
                  >
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          
          // Links
          a: ({ href, children }) => (
            <a 
              href={href}
              className="text-primary hover:text-primary/80 underline font-medium transition-colors"
              target={href?.startsWith('http') ? '_blank' : undefined}
              rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
            >
              {children}
            </a>
          ),
          
          // Immagini
          img: ({ src, alt }) => (
            <div className="my-8">
              <img 
                src={src} 
                alt={alt} 
                className="rounded-lg shadow-lg w-full h-auto border"
              />
              {alt && (
                <p className="text-sm text-muted-foreground text-center mt-2 italic">
                  {alt}
                </p>
              )}
            </div>
          ),
          
          // Tabelle
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto">
              <table className="w-full border-collapse border border-border rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50">
              {children}
            </thead>
          ),
          tbody: ({ children }) => (
            <tbody>
              {children}
            </tbody>
          ),
          tr: ({ children }) => (
            <tr className="border-b border-border hover:bg-muted/30 transition-colors">
              {children}
            </tr>
          ),
          th: ({ children }) => (
            <th className="border border-border px-4 py-3 text-left font-semibold text-foreground bg-muted/30">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-border px-4 py-3 text-foreground">
              {children}
            </td>
          ),
          
          // Linee orizzontali
          hr: () => (
            <hr className="border-t border-border my-8" />
          ),
          
          // Strong e Em
          strong: ({ children }) => (
            <strong className="font-bold text-foreground">
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
