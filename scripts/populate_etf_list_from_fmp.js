/**
 * Script para popular a tabela etf_list no Supabase com todos os ETFs negociados nos EUA,
 * usando o endpoint oficial da FMP (/etf-list).
 *
 * - Busca todos os ETFs da FMP
 * - Filtra apenas os negociados nos EUA (exchange: NYSE ARCA, NASDAQ, NYSE)
 * - Substitui todos os registros atuais da tabela etf_list
 *
 * Dependências: @supabase/supabase-js, axios, dotenv
 */

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
  try {
    console.log('Buscando todos os ETFs da FMP...');
    const url = `https://financialmodelingprep.com/stable/etf-list?apikey=${FMP_API_KEY}`;
    const resp = await axios.get(url, { timeout: 30000 });
    if (!Array.isArray(resp.data)) {
      throw new Error('Resposta inesperada da FMP');
    }
    // Inserir todos os ETFs retornados (sem filtro por exchange)
    const etfs = resp.data.filter(etf => etf.symbol && etf.name);
    console.log(`Encontrados ${etfs.length} ETFs retornados pela FMP.`);

    // Limpar tabela etf_list
    console.log('Limpando tabela etf_list no Supabase...');
    await supabase.from('etf_list').delete().neq('symbol', '');

    // Inserir em lotes de 500
    const BATCH_SIZE = 500;
    for (let i = 0; i < etfs.length; i += BATCH_SIZE) {
      const batch = etfs.slice(i, i + BATCH_SIZE).map(etf => ({ symbol: etf.symbol, name: etf.name }));
      const { error } = await supabase.from('etf_list').insert(batch);
      if (error) {
        console.error(`Erro ao inserir lote ${i / BATCH_SIZE + 1}:`, error.message);
      } else {
        console.log(`Lote ${i / BATCH_SIZE + 1} inserido (${batch.length} ETFs).`);
      }
    }
    console.log('Tabela etf_list populada com sucesso!');
  } catch (err) {
    console.error('Erro no script:', err);
  }
}

main(); 