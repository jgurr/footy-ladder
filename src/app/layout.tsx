import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Footy Ladder - The Real NRL Rankings",
  description: "NRL ladder ranked by win percentage. No bye distortion. The true standings.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[--color-bg-primary] text-white antialiased">
        {children}
      </body>
    </html>
  );
}
