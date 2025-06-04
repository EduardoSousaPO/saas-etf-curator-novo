import { PrismaClient } from '@prisma/client';
import * as XLSX from 'xlsx';
import axios from 'axios';
import * as path from 'path';
import dotenv from 'dotenv';
import { setTimeout } from 'timers/promises'; // Node.js 16+

dotenv.config({ path: path.resolve(__dirname, '../.env') }); // Garante que o .env correto seja carregado

const prisma = new PrismaClient();

const fmpApiKey = process.env.FMP_API_KEY;
const MAX_SYMBOLS_TO_PROCESS = parseInt(process.env.MAX_SYMBOLS_SEED || '100', 10);

if (!fmpApiKey) {
  throw new Error('Variável de ambiente FMP_API_KEY não configurada no .env');
}

interface ExcelSymbol {
  symbol: string;
  name?: string; // Opcional, pode vir do Excel
}

// Interface para os dados esperados da FMP API /v3/etf/profile/{symbol}
// Baseado na estrutura comum e no script import-etfs.ts original
interface FMPProfileData {
  symbol: string;
  name?: string;
  description?: string;
  category?: string; // Mapear para etfClass da FMP se disponível, ou manter category
  assetClass?: string; // Pode ser útil para determinar a categoria geral
  exchange?: string;
  inceptionDate?: string; // Formato YYYY-MM-DD
  totalAssets?: number;
  etfCompany?: string;
  avgVolume?: number; // Mapeia para o nosso volume
  expenseRatio?: number;
  priceToEarningsRatio?: number; // Mapeia para pe_ratio
  priceToBookRatio?: number; // Mapeia para price_to_book
  dividendYield?: number; // Já é um percentual, mas a FMP pode retornar como decimal (0.05 = 5%)
  beta?: number; // Mapeia para beta_3y se for o beta de 3 anos
  holdingsCount?: number; // Mapeia para number_of_holdings
  // Outros campos que a FMP pode retornar no profile e que podem ser úteis
  yearHigh?: number;
  yearLow?: number;
  priceAvg50?: number;
  priceAvg200?: number;
  marketCap?: number;
  lastDiv?: number; // Último dividendo pago
  // ... quaisquer outros campos que a FMP retorna e você quer armazenar em fmp_data
}

async function readSymbolsFromExcel(filePath: string): Promise<ExcelSymbol[]> {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData: any[] = XLSX.utils.sheet_to_json(sheet);

    // Assegurar que a coluna 'symbol' existe e é string
    return jsonData.map(row => ({
      symbol: String(row.Symbol || row.symbol).trim().toUpperCase(), // Normalizar para maiúsculas e remover espaços
      name: row.Name || row.name
    })).filter(s => s.symbol); // Filtrar símbolos vazios
  } catch (error) {
    console.error('❌ Erro ao ler arquivo Excel:', filePath, error);
    throw error;
  }
}

async function fetchFMPData(symbol: string): Promise<FMPProfileData | null> {
  try {
    const url = `https://financialmodelingprep.com/api/v3/etf/profile/${symbol}?apikey=${fmpApiKey}`;
    const response = await axios.get<FMPProfileData[]>(url);

    if (!response.data || response.data.length === 0) {
      console.warn(`⚠️ Nenhum dado encontrado na FMP para ${symbol}`);
      return null;
    }
    // A API FMP retorna um array, mesmo para um único símbolo no profile
    return response.data[0];
  } catch (error: any) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(`🤷‍♂️ ETF ${symbol} não encontrado na FMP (404).`);
    } else if (axios.isAxiosError(error) && error.response?.status === 401) {
        console.error(`❌ Erro de autorização com a API FMP. Verifique sua API Key.`);
        // Parar o script se a chave for inválida para não gastar cota
        throw new Error("FMP API Key inválida ou problema de autorização.");
    } else {
        console.error(`❌ Erro ao buscar dados da FMP para ${symbol}:`, error.message);
    }
    return null;
  }
}

// Função para converter string de data (YYYY-MM-DD) para objeto Date ou retornar null
function parseDate(dateString: string | undefined | null): Date | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
}

async function main() {
  console.log('🌱 Iniciando o processo de seeding...');
  const excelFilePath = path.join(process.cwd(), 'symbols_etfs_eua.xlsx');
  const symbols = await readSymbolsFromExcel(excelFilePath);

  if (symbols.length === 0) {
    console.log('Nenhum símbolo encontrado no arquivo Excel. Encerrando o seeding.');
    return;
  }

  console.log(`📝 Total de ${symbols.length} símbolos lidos do Excel.`);
  const symbolsToProcess = symbols.slice(0, MAX_SYMBOLS_TO_PROCESS);
  console.log(`🔍 Processando os primeiros ${symbolsToProcess.length} símbolos (MAX_SYMBOLS_TO_PROCESS=${MAX_SYMBOLS_TO_PROCESS})...`);

  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;

  for (const [index, excelSymbol] of symbolsToProcess.entries()) {
    console.log(`
[${index + 1}/${symbolsToProcess.length}] Processando ${excelSymbol.symbol}...`);

    const fmpData = await fetchFMPData(excelSymbol.symbol);

    if (!fmpData) {
      notFoundCount++;
      // Pausa para evitar sobrecarga da API mesmo em erros não fatais
      await setTimeout(1100); // Pausa de ~1.1 segundo para respeitar limites de taxa (FMP grátis pode ter limites rígidos)
      continue;
    }

    try {
      const dataToUpsert = {
        symbol: fmpData.symbol.toUpperCase(), // Garantir consistência
        name: fmpData.name || excelSymbol.name, // Priorizar nome da FMP, fallback para Excel
        description: fmpData.description,
        category: fmpData.category || fmpData.assetClass, // Usar category ou assetClass da FMP
        exchange: fmpData.exchange,
        inception_date: parseDate(fmpData.inceptionDate),
        total_assets: fmpData.totalAssets,
        volume: fmpData.avgVolume, // FMP usa avgVolume
        expense_ratio: fmpData.expenseRatio,
        pe_ratio: fmpData.priceToEarningsRatio,
        price_to_book: fmpData.priceToBookRatio,
        dividend_yield: fmpData.dividendYield, // FMP pode retornar como 0.05 para 5%
        beta_3y: fmpData.beta, // Assumindo que o beta da FMP é o de 3 anos
        number_of_holdings: fmpData.holdingsCount,
        market_cap: fmpData.marketCap,
        // Métricas que não vêm diretamente do /profile, preencher com null ou calcular em etapa futura
        returns_12m: null,
        returns_24m: null,
        returns_36m: null,
        returns_5y: null,
        ten_year_return: null,
        volatility_12m: null,
        volatility_24m: null,
        volatility_36m: null,
        ten_year_volatility: null,
        max_drawdown: null,
        sharpe_12m: null,
        sharpe_24m: null,
        sharpe_36m: null,
        ten_year_sharpe: null,
        dividends_12m: fmpData.lastDiv, // A FMP /profile pode ter `lastDiv`, mas não `dividends_12m` agregado.
        dividends_24m: null,
        dividends_36m: null,
        dividends_all_time: null,
        start_date: null, // Precisaria de dados históricos
        end_date: null,   // Precisaria de dados históricos
        price: null, // Preço atual viria de outro endpoint (ex: quote)
        change: null,
        change_percentage: null,
        day_low: null,
        day_high: null,
        avg_volume: fmpData.avgVolume, // Já mapeado para 'volume'

        fmp_data: fmpData as any, // Armazena o objeto FMP completo
        updated_at: new Date(), // Definir explicitamente para upsert
      };

      await prisma.eTF.upsert({
        where: { symbol: excelSymbol.symbol },
        update: dataToUpsert,
        create: dataToUpsert,
      });

      console.log(`✅ ${excelSymbol.symbol} processado e salvo no banco.`);
      successCount++;
    } catch (dbError: any) {
      console.error(`❌ Erro ao salvar ${excelSymbol.symbol} no banco:`, dbError.message);
      errorCount++;
    }

    // Pausa para evitar sobrecarga da API
    await setTimeout(1100); // Pausa de ~1.1 segundo (FMP free tier é ~1 requisição/segundo)
  }

  console.log('\n🌱 Processo de seeding concluído.');
  console.log('RESUMO:');
  console.log(`  ✅ Símbolos processados com sucesso: ${successCount}`);
  console.log(`  ⚠️ Símbolos não encontrados na FMP: ${notFoundCount}`);
  console.log(`  ❌ Erros ao salvar no banco: ${errorCount}`);
}

main()
  .catch((e) => {
    console.error('❌ Erro fatal no script de seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 