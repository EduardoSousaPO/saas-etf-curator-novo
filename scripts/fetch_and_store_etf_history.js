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

const BATCH_SIZE = 500;
const RATE_LIMIT_DELAY = 350; // ms entre requisições FMP
const YEARS_BACK = 10;

function filterLastNYears(data, years = 10) {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - years);
  return data.filter(item => new Date(item.date) >= cutoff);
}

async function fetchAllSymbols() {
  const { data, error } = await supabase
    .from('etf_list')
    .select('symbol')
    .order('symbol', { ascending: true });
  if (error) throw new Error('Erro ao buscar símbolos: ' + error.message);
  return data.map(row => row.symbol);
}

async function insertBatch(table, rows) {
  if (rows.length === 0) return;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from(table).upsert(batch);
    if (error) {
      console.error(`Erro ao inserir batch na tabela ${table}:`, error.message);
    }
  }
}

async function main() {
  const symbols = await fetchAllSymbols();
  console.log(`Total de ETFs encontrados: ${symbols.length}`);
  let totalPrices = 0, totalDivs = 0, totalErrors = 0;

  for (let idx = 0; idx < symbols.length; idx++) {
    const symbol = symbols[idx];
    try {
      console.log(`[${idx + 1}/${symbols.length}] Buscando histórico para ${symbol}...`);
      // Preços históricos
      const urlPrice = `https://financialmodelingprep.com/api/v3/historical-price-full/${symbol}?apikey=${FMP_API_KEY}`;
      const respPrice = await axios.get(urlPrice, { timeout: 20000 });
      let prices = respPrice.data && respPrice.data.historical ? respPrice.data.historical : [];
      prices = filterLastNYears(prices, YEARS_BACK);
      const priceRows = prices.map(day => ({
        symbol,
        date: day.date,
        open: day.open,
        high: day.high,
        low: day.low,
        close: day.close,
        adj_close: day.adjClose,
        volume: day.volume
      }));
      await insertBatch('etf_prices', priceRows);
      totalPrices += priceRows.length;

      // Dividendos históricos
      const urlDiv = `https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/${symbol}?apikey=${FMP_API_KEY}`;
      const respDiv = await axios.get(urlDiv, { timeout: 20000 });
      let divs = respDiv.data && respDiv.data.historical ? respDiv.data.historical : [];
      divs = filterLastNYears(divs, YEARS_BACK);
      const divRows = divs.map(div => ({
        symbol,
        date: div.date,
        dividend: div.dividend,
        adj_dividend: div.adjDividend,
        label: div.label
      }));
      await insertBatch('etf_dividends', divRows);
      totalDivs += divRows.length;
    } catch (err) {
      console.error(`Erro ao processar ${symbol}:`, err.message);
      totalErrors++;
    }
    await new Promise(res => setTimeout(res, RATE_LIMIT_DELAY));
  }
  console.log(`Processo concluído! Preços inseridos: ${totalPrices}, Dividendos inseridos: ${totalDivs}, Erros: ${totalErrors}`);
}

main(); 