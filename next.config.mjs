/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
      //絶対pathで表示できる
      remotePatterns: [
        {
          protocol: 'https',
          hostname: 'static.lone-programmer-app.com',
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
