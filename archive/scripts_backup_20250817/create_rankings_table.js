const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createRankingsTable() {
  try {
    console.log('🔧 Criando tabela etf_rankings...');
    
    // Executar a migration SQL
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS etf_rankings (
          id SERIAL PRIMARY KEY,
          category VARCHAR(50) NOT NULL,
          rank_position INTEGER NOT NULL,
          symbol VARCHAR(10) NOT NULL,
          value DECIMAL,
          percentage_value DECIMAL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          
          CONSTRAINT unique_category_rank UNIQUE (category, rank_position),
          CONSTRAINT unique_category_symbol UNIQUE (category, symbol)
      )
    `;
    
    // Criar índices
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_etf_rankings_category ON etf_rankings(category)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_etf_rankings_symbol ON etf_rankings(symbol)`;
    await prisma.$executeRaw`CREATE INDEX IF NOT EXISTS idx_etf_rankings_updated_at ON etf_rankings(updated_at)`;
    
    console.log('✅ Tabela etf_rankings criada com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createRankingsTable(); 