import Image from "next/image";
import Link from "next/link";
import { Card, CardAction, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Calendar, User, Clock } from "lucide-react";

import { BlogPost } from "@/types/blog";

interface BlogPostCardProps {
    variant?: "full" | "grid";
    post: BlogPost; // OBBLIGATORIO - nessun dato mock!
}

export default function BlogPostCard({
    variant = "full",
    post
}: BlogPostCardProps) {
    const isGrid = variant === "grid";

    // Formatta la data
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('it-IT', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    return (
        <Link href={`/blog/${post.slug}`}>
            <Card className={`overflow-hidden cursor-pointer ${isGrid ? 'h-full flex flex-col' : ''
                }`}>
                {/* Immagine */}
                <div className={`relative overflow-hidden ${isGrid ? 'h-48' : 'h-64 md:h-80'
                    }`}>
                    {post.image && post.image.trim() !== '' && !post.image.includes('logo') ? (
                        <Image
                            src={post.image}
                            alt={post.title}
                            fill
                            className="object-cover"
                            sizes={isGrid
                                ? "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                : "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            }
                        />
                    ) : post.image && post.image.includes('logo') ? (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-8">
                            <Image
                                src={post.image}
                                alt="Jokerman79 Logo"
                                width={120}
                                height={120}
                                className="object-contain opacity-80"
                            />
                        </div>
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center p-8">
                            <div className="text-center">
                                <p className="text-sm text-muted-foreground font-tanker">{post.title}</p>
                                <p className="text-xs text-muted-foreground mt-1">{post.category || 'Blog'}</p>
                            </div>
                        </div>
                    )}

                    {/* Overlay con badges */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent">
                        <div className="absolute top-3 left-3 flex gap-2">
                            {post.isFeatured && (
                                <Badge className="bg-primary hover:bg-primary/90 text-primary-foreground font-tanker text-xs">
                                    IN EVIDENZA
                                </Badge>
                            )}
                            {post.category && (
                                <Badge variant="secondary" className="text-xs">
                                    {post.category}
                                </Badge>
                            )}
                        </div>

                        {post.readTime && (
                            <div className="absolute top-3 right-3">
                                <Badge variant="outline" className="bg-black/50 text-white border-white/30 text-xs flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {post.readTime}
                                </Badge>
                            </div>
                        )}
                    </div>
                </div>

                <CardContent className={`${isGrid ? 'flex-1 p-4' : 'p-6'}`}>
                    {/* Titolo */}
                    <CardTitle className={`font-tanker mb-3 line-clamp-2 ${isGrid ? 'text-lg' : 'text-2xl'
                        }`}>
                        {post.title}
                    </CardTitle>

                    {/* Excerpt */}
                    <p className={`text-muted-foreground leading-relaxed mb-4 ${isGrid ? 'text-sm line-clamp-3' : 'text-base line-clamp-4'
                        }`}>
                        {post.excerpt}
                    </p>

                    {/* Metadata */}
                    <div className={`flex items-center gap-4 text-xs text-muted-foreground ${isGrid ? 'mt-auto' : ''
                        }`}>
                        {post.author && (
                            <div className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                <span>{post.author}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            <span>{formatDate(post.publishedAt)}</span>
                        </div>
                    </div>
                </CardContent>

                {/* Action (solo in full variant) */}
                {!isGrid && (
                    <CardAction className="px-6 pb-6">
                        <Button className="w-full h-12 font-medium text-base">
                            📖 Leggi Articolo
                        </Button>
                    </CardAction>
                )}
            </Card>
        </Link>
    );
}