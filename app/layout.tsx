import type { Metadata } from "next";
import "./globals.css";
import Toaster from "@/components/Toaster";

export const metadata: Metadata = {
  title: "Floorplans - Transform Sketches into Professional Floorplans",
  description: "Convert napkin sketches, photos, and site plans into clean architectural floorplans",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}

