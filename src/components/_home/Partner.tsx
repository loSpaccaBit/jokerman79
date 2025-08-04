import Image from "next/image";
import { Card, CardContent } from "../ui/card";
import { MarkdownRenderer } from "../shared/MarkdownRenderer";

interface Partner {
    img: string,
    imgAlt: string,
    name: string,
    text: string,
    isReversed?: boolean
}

export function Partner({ img, imgAlt, name, text, isReversed = false }: Partner) {
    return (
        <Card className="overflow-hidden mx-4 md:mx-8">
            {/* Layout alternato: normale o invertito */}
            <div className={`flex flex-col ${isReversed ? 'md:flex-row-reverse' : 'md:flex-row'}`}>
                {/* Immagine più grande con margini - aspect ratio flessibile */}
                <div className={`relative h-48 md:h-64 md:w-80 md:flex-shrink-0 ${isReversed ? 'md:ml-8' : 'md:mr-8'}`}>
                    <div className="w-full h-full rounded-2xl overflow-hidden bg-background p-4">
                        <div className="relative w-full h-full">
                            <Image
                                src={img}
                                alt={imgAlt}
                                fill
                                className="object-contain"
                                sizes="(max-width: 768px) 100vw, 320px"
                            />
                        </div>
                    </div>
                </div>

                {/* Contenuto con testo lungo */}
                <CardContent className="p-6 md:p-8 flex-1">
                    <h3 className="font-tanker text-xl md:text-2xl text-primary mb-4">
                        {name}
                    </h3>

                    {/* Testo RichText da Strapi */}
                    <div className="text-muted-foreground leading-relaxed text-sm md:text-base">
                        {text ? (
                            <MarkdownRenderer
                                content={text}
                                className="prose prose-sm md:prose-base dark:prose-invert max-w-none [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_a]:cursor-pointer hover:[&_a]:text-primary/80"
                            />
                        ) : (
                            <p>Nessun testo disponibile</p>
                        )}
                    </div>
                </CardContent>
            </div>
        </Card>
    );
}