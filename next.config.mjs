/** @type {import('next').NextConfig} */
const nextConfig = {
  // Configuracion para Docker
  output: 'standalone',

  // Deshabilitar telemetria en produccion
  productionBrowserSourceMaps: false,

  // Configuracion de imagenes
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'i.pravatar.cc',
      },
    ],
  },
};

export default nextConfig;
