import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Clockly — Your time, beautifully",
  description: "A simple, responsive clock app prototype."
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#E3EBFD"
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
