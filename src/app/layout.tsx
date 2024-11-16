import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const title = "記事投稿アプリケーション";
const description = "最新のNext.jsフレームワークを基盤に、堅牢なミドルウェア認証システムを実装。メール認証による二段階認証で、安全性を確保しながらもストレスのないユーザー体験を提供します。メディアコンテンツはAWS S3で管理し、CloudFrontによる CDN配信により、世界中のユーザーへ高速なコンテンツ配信を実現。モダンな技術スタックと信頼性の高いインフラで、快適な記事投稿プラットフォームを構築しています。";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title,
  description,
  openGraph: {
    title,
    description,
    url:appUrl,
    siteName:title,
    images: [
      {
        url: `${appUrl}/img/logo.png`,
        width: 240,
        height: 80,
        alt: title,
      },
    ],
    locale: 'ja_JP',
    type: 'website',
}, 
  twitter: {
    card: `summary`,
    title,
    description,
    creator: '@lone_rogrammer',
    images: [`${appUrl}/img/logo.jpg`],
  },
  robots: {
    index: true,
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

  
  return (
    <html lang="ja">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
