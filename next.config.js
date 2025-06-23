/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  
  // Forçar carregamento das variáveis de ambiente
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    DIRECT_URL: process.env.DIRECT_URL,
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    OPENAI_API_KEY: process.env.OPENAI_API_KEY,
    FMP_API_KEY: process.env.FMP_API_KEY,
    MERCADOPAGO_ACCESS_TOKEN: process.env.MERCADOPAGO_ACCESS_TOKEN,
    MERCADOPAGO_PUBLIC_KEY: process.env.MERCADOPAGO_PUBLIC_KEY,
  },
  
  // Configurações experimentais para melhor performance
  experimental: {
    // Removido @prisma/client que causa conflitos na Vercel
    optimizePackageImports: [],
  },

  // Headers para CORS se necessário
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ],
      },
    ];
  },

  // Configuração webpack para resolver path aliases e outros problemas
  webpack: (config, { dev, isServer }) => {
    // Configurar path aliases explicitamente
    config.resolve.alias = {
      ...config.resolve.alias,
      '@': require('path').resolve(__dirname, 'src'),
    };
    
    if (dev && !isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Ignorar arquivos da pasta mobile (React Native)
    config.module.rules.push({
      test: /\.tsx?$/,
      exclude: /mobile/,
    });
    
    return config;
  },

  // Transpile specific packages that might cause issues
  transpilePackages: ['recharts'],
  
  // Disable source maps in production to save memory
  productionBrowserSourceMaps: false,
  
  // ESLint configuration
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
    dirs: ['src'], // Only run ESLint on the 'src' directory
  },
  
  // TypeScript configuration
  typescript: {
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    ignoreBuildErrors: true,
  },
  
  // Optimize images
  images: {
    domains: [],
    unoptimized: true, // Disable Next.js image optimization to save memory
  },
};

module.exports = nextConfig; 