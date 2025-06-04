const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Carregar variáveis de ambiente
const envLocalPath = path.resolve(__dirname, '../.env.local');
const envPath = path.resolve(__dirname, '../.env');
if (fs.existsSync(envLocalPath)) {
  dotenv.config({ path: envLocalPath });
} else if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
} else {
  dotenv.config();
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;
const FMP_API_KEY = process.env.FMP_API_KEY || process.env.FMPAPIKEY;
if (!SUPABASE_URL || !SUPABASE_KEY || !FMP_API_KEY) {
  console.error('❌ Variáveis de ambiente não encontradas.');
  process.exit(1);
}
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function main() {
  // 1. Buscar os 10 primeiros símbolos da tabela etf_list
  const { data: etfs, error } = await supabase
    .from('etf_list')
    .select('symbol')
    .order('symbol', { ascending: true })
    .limit(10);
  if (error) {
    console.error('Erro ao buscar símbolos:', error.message);
    process.exit(1);
  }
  if (!etfs || etfs.length === 0) {
    console.error('Nenhum ETF encontrado na tabela etf_list.');
    process.exit(1);
  }

  // 2. Buscar histórico de preços de cada ETF
  for (const { symbol } of etfs) {
    try {
      console.log(`Buscando histórico de preços para ${symbol}...`);
      const url = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
      const resp = await axios.get(url, { timeout: 20000 });
      if (resp.data && resp.data.historical && resp.data.historical.length > 0) {
        console.log(`Histórico de ${symbol}: ${resp.data.historical.length} registros.`);
        // Exemplo: mostrar as 3 datas mais recentes
        resp.data.historical.slice(0, 3).forEach(day => {
          console.log(`  ${day.date}: close=${day.close}, volume=${day.volume}`);
        });
      } else {
        console.log(`Nenhum dado histórico encontrado para ${symbol}.`);
      }
    } catch (err) {
      console.error(`Erro ao buscar histórico para ${symbol}:`, err.message);
    }
    // Respeitar limites da FMP
    await new Promise(res => setTimeout(res, 300));
  }
}

main(); 