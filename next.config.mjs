/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      //絶対pathで表示できる
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'articlepostapp.s3.ap-northeast-1.amazonaws.com',
          port: '',
          pathname: '/**',
        },
      ],
    },
    logging: {
      fetches: {
        fullUrl: true,
      },
    },};

export default nextConfig;
