import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clicked!",
  description: "Take a photo, make a thermal strip, and print it.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
