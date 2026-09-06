import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LG U+ 오피스넷 견적서",
  description: "LG U+ 오피스넷 상품 견적서 자동 생성",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-gray-50">{children}</body>
    </html>
  );
}
