// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

declare global {
  // allow global "var" declarations
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Função para criar cliente Prisma com configuração robusta
const createPrismaClient = () => {
  console.log('🔗 Inicializando cliente Prisma...');
  
  // Verificar se DATABASE_URL está configurada
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL não configurada!');
    throw new Error('DATABASE_URL is required');
  }
  
  console.log('✅ DATABASE_URL encontrada:', process.env.DATABASE_URL.substring(0, 30) + '...');
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
    errorFormat: 'pretty',
    // Configurações de timeout e pool de conexões
    // __internal: {
    //   engine: {
    //     connectTimeout: 30000, // 30 segundos
    //     queryTimeout: 60000,   // 60 segundos
    //   },
    // },
  });
};

export const prisma =
  global.prisma ||
  createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

// Função para testar conexão
export async function testConnection() {
  try {
    console.log('🔍 Testando conexão com banco de dados...');
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Conexão com banco estabelecida com sucesso');
    return true;
  } catch (error) {
    console.error('❌ Erro na conexão com banco:', error);
    return false;
  }
}

// Graceful shutdown
process.on('beforeExit', async () => {
  console.log('🔌 Desconectando Prisma...');
  await prisma.$disconnect();
});

