/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['imgproxy.iris.to', 'lh3.googleusercontent.com', 'ui-avatars.com', 'imgur.com', 'i.imgur.com' , 'gateway.pinata.cloud', 'ivory-eligible-hamster-305.mypinata.cloud'],
  },
};

module.exports = nextConfig;
