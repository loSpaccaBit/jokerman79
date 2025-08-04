import { Metadata } from "next";
import { generateSEOMetadata, homePageSEO } from "@/lib/seo-metadata";
import { HomeContent } from "@/components/_home/HomeContent";

export const metadata: Metadata = generateSEOMetadata(homePageSEO);

export default function Home() {
  return <HomeContent />;
}
