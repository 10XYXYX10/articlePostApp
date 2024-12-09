/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [
      {
        // 対象APIのパスパターン
        source: "/api/:path*",// src/app/api/ 配下にAPIルートにマッチ
        headers: [
          {
            // CORSを許可するオリジン
            key: "Access-Control-Allow-Origin",
            // すべてのオリジンを許可するなら * (アスタリスク)
            // ただセキュリティ的にはよろしくないので注意
            value: "https://article-post-app.vercel.app/",
          },
          {
            // 許可するメソッド
            key: "Access-Control-Allow-Methods",
            value: "GET,OPTIONS,POST,PUT,DELETE",
          },
          {
            // 許可するリクエストヘッダ
            key: "Access-Control-Allow-Headers",
            value: "Content-Type",
          },
        ],
      },
    ];
  },
  images: {
    //絶対pathで表示できる
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'articlepostappv2.s3.ap-northeast-1.amazonaws.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  logging: {
    fetches: {
      fullUrl: true,
    },
  }
};

export default nextConfig;
