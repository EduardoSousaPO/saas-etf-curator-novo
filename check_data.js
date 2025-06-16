const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  console.log('🔍 Verificando dados de calculated_metrics_teste...');
  
  // Verificar alguns valores de retorno
  const returns = await prisma.calculated_metrics_teste.findMany({
    where: { returns_12m: { not: null } },
    select: { symbol: true, returns_12m: true },
    orderBy: { returns_12m: 'desc' },
    take: 5
  });
  
  console.log('�� Top 5 retornos 12m (valores brutos):');
  returns.forEach(r => console.log(`${r.symbol}: ${r.returns_12m} (raw value)`));
  
  // Verificar valores normais de retorno
  const normalReturns = await prisma.calculated_metrics_teste.findMany({
    where: { 
      returns_12m: { 
        not: null,
        gte: -1,
        lte: 1
      } 
    },
    select: { symbol: true, returns_12m: true },
    orderBy: { returns_12m: 'desc' },
    take: 5
  });
  
  console.log('📊 Retornos normais (entre -100% e 100%):');
  normalReturns.forEach(r => console.log(`${r.symbol}: ${r.returns_12m}`));
  
  // Verificar patrimônio em etf_list
  const assetsCount = await prisma.etf_list.count({
    where: { totalasset: { not: null } }
  });
  
  console.log(`💰 Total de ETFs com patrimônio: ${assetsCount}`);
  
  const assets = await prisma.etf_list.findMany({
    where: { totalasset: { not: null } },
    select: { symbol: true, totalasset: true },
    orderBy: { totalasset: 'desc' },
    take: 5
  });
  
  console.log('💰 Top 5 patrimônios:');
  assets.forEach(a => console.log(`${a.symbol}: $${a.totalasset}`));
  
  // Verificar se há dados de volume
  const volumeCount = await prisma.etf_list.count({
    where: { avgvolume: { not: null } }
  });
  
  console.log(`📈 Total de ETFs com volume: ${volumeCount}`);
  
  // Verificar dividendos
  const dividends = await prisma.calculated_metrics_teste.findMany({
    where: { dividends_12m: { not: null } },
    select: { symbol: true, dividends_12m: true },
    orderBy: { dividends_12m: 'desc' },
    take: 5
  });
  
  console.log('💵 Top 5 dividendos 12m:');
  dividends.forEach(d => console.log(`${d.symbol}: $${d.dividends_12m}`));
  
  await prisma.$disconnect();
}

checkData().catch(console.error); 