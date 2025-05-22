const ExcelJS = require('exceljs');
const path = require('path');
const fs = require('fs');

// Dados de exemplo de ETFs
const sampleETFs = [
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    description: 'This ETF seeks to provide investment results that correspond to the S&P 500 Index.',
    category: 'Large Cap Equity',
    exchange: 'NYSE Arca',
    inception_date: new Date('1993-01-22'),
    total_assets: 374500000000,
    volume: 75000000,
    ten_year_return: 12.75,
    returns_12m: 16.35,
    returns_24m: 10.45,
    returns_36m: 9.89,
    volatility_12m: 15.21,
    volatility_24m: 18.45,
    volatility_36m: 17.82,
    ten_year_volatility: 14.52,
    sharpe_12m: 1.32,
    sharpe_24m: 0.98,
    sharpe_36m: 0.85,
    ten_year_sharpe: 1.05,
    max_drawdown: 34.12,
    dividends_12m: 1.45,
    dividends_24m: 2.87,
    dividends_36m: 4.12,
    dividends_all_time: 41.25,
    dividend_yield: 1.32,
    start_date: new Date('2020-01-01'),
    end_date: new Date('2023-12-31')
  },
  {
    symbol: 'QQQ',
    name: 'Invesco QQQ Trust',
    description: 'This ETF seeks to track the Nasdaq-100 Index, which includes 100 of the largest non-financial companies listed on the Nasdaq stock exchange.',
    category: 'Large Cap Growth',
    exchange: 'NASDAQ',
    inception_date: new Date('1999-03-10'),
    total_assets: 169500000000,
    volume: 45000000,
    ten_year_return: 18.23,
    returns_12m: 21.45,
    returns_24m: 15.78,
    returns_36m: 12.95,
    volatility_12m: 18.56,
    volatility_24m: 22.13,
    volatility_36m: 20.34,
    ten_year_volatility: 16.78,
    sharpe_12m: 1.45,
    sharpe_24m: 1.12,
    sharpe_36m: 0.92,
    ten_year_sharpe: 1.21,
    max_drawdown: 38.56,
    dividends_12m: 0.65,
    dividends_24m: 1.32,
    dividends_36m: 1.95,
    dividends_all_time: 11.45,
    dividend_yield: 0.52,
    start_date: new Date('2020-01-01'),
    end_date: new Date('2023-12-31')
  },
  {
    symbol: 'IWM',
    name: 'iShares Russell 2000 ETF',
    description: 'This ETF seeks to track the Russell 2000 Index, a small-cap stock market index of the smallest 2,000 stocks in the Russell 3000 Index.',
    category: 'Small Cap Equity',
    exchange: 'NYSE Arca',
    inception_date: new Date('2000-05-22'),
    total_assets: 56200000000,
    volume: 35000000,
    ten_year_return: 8.95,
    returns_12m: 12.45,
    returns_24m: 5.78,
    returns_36m: 6.92,
    volatility_12m: 22.56,
    volatility_24m: 25.34,
    volatility_36m: 24.12,
    ten_year_volatility: 19.45,
    sharpe_12m: 0.85,
    sharpe_24m: 0.62,
    sharpe_36m: 0.52,
    ten_year_sharpe: 0.68,
    max_drawdown: 42.13,
    dividends_12m: 1.15,
    dividends_24m: 2.25,
    dividends_36m: 3.35,
    dividends_all_time: 15.75,
    dividend_yield: 1.28,
    start_date: new Date('2020-01-01'),
    end_date: new Date('2023-12-31')
  },
  {
    symbol: 'VTI',
    name: 'Vanguard Total Stock Market ETF',
    description: 'This ETF seeks to track the performance of the CRSP US Total Market Index, which represents approximately 100% of the investable U.S. stock market.',
    category: 'Total Market',
    exchange: 'NYSE Arca',
    inception_date: new Date('2001-05-24'),
    total_assets: 292400000000,
    volume: 3800000,
    ten_year_return: 11.82,
    returns_12m: 15.34,
    returns_24m: 9.23,
    returns_36m: 8.76,
    volatility_12m: 16.34,
    volatility_24m: 19.25,
    volatility_36m: 18.56,
    ten_year_volatility: 15.13,
    sharpe_12m: 1.22,
    sharpe_24m: 0.88,
    sharpe_36m: 0.75,
    ten_year_sharpe: 0.95,
    max_drawdown: 36.24,
    dividends_12m: 1.52,
    dividends_24m: 2.95,
    dividends_36m: 4.25,
    dividends_all_time: 25.45,
    dividend_yield: 1.45,
    start_date: new Date('2020-01-01'),
    end_date: new Date('2023-12-31')
  },
  {
    symbol: 'AGG',
    name: 'iShares Core U.S. Aggregate Bond ETF',
    description: 'This ETF seeks to track the Bloomberg U.S. Aggregate Bond Index, which represents the U.S. investment-grade bond market.',
    category: 'Fixed Income',
    exchange: 'NYSE Arca',
    inception_date: new Date('2003-09-22'),
    total_assets: 87500000000,
    volume: 7500000,
    ten_year_return: 2.45,
    returns_12m: -0.56,
    returns_24m: -2.34,
    returns_36m: -1.23,
    volatility_12m: 6.32,
    volatility_24m: 7.15,
    volatility_36m: 6.84,
    ten_year_volatility: 4.32,
    sharpe_12m: -0.25,
    sharpe_24m: -0.45,
    sharpe_36m: -0.35,
    ten_year_sharpe: 0.42,
    max_drawdown: 16.85,
    dividends_12m: 2.45,
    dividends_24m: 4.85,
    dividends_36m: 7.35,
    dividends_all_time: 35.75,
    dividend_yield: 2.65,
    start_date: new Date('2020-01-01'),
    end_date: new Date('2023-12-31')
  }
];

async function generateSampleExcelFile() {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('ETFs');
  
  // Definir as colunas
  worksheet.columns = [
    { header: 'Symbol', key: 'symbol', width: 10 },
    { header: 'Name', key: 'name', width: 40 },
    { header: 'Description', key: 'description', width: 60 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Exchange', key: 'exchange', width: 15 },
    { header: 'Inception Date', key: 'inception_date', width: 15 },
    { header: 'Total Assets ($)', key: 'total_assets', width: 18 },
    { header: 'Volume', key: 'volume', width: 15 },
    { header: '10Y Return (%)', key: 'ten_year_return', width: 15 },
    { header: '12M Return (%)', key: 'returns_12m', width: 15 },
    { header: '24M Return (%)', key: 'returns_24m', width: 15 },
    { header: '36M Return (%)', key: 'returns_36m', width: 15 },
    { header: '12M Volatility (%)', key: 'volatility_12m', width: 18 },
    { header: '24M Volatility (%)', key: 'volatility_24m', width: 18 },
    { header: '36M Volatility (%)', key: 'volatility_36m', width: 18 },
    { header: '10Y Volatility (%)', key: 'ten_year_volatility', width: 18 },
    { header: '12M Sharpe', key: 'sharpe_12m', width: 12 },
    { header: '24M Sharpe', key: 'sharpe_24m', width: 12 },
    { header: '36M Sharpe', key: 'sharpe_36m', width: 12 },
    { header: '10Y Sharpe', key: 'ten_year_sharpe', width: 12 },
    { header: 'Max Drawdown (%)', key: 'max_drawdown', width: 18 },
    { header: '12M Dividends', key: 'dividends_12m', width: 15 },
    { header: '24M Dividends', key: 'dividends_24m', width: 15 },
    { header: '36M Dividends', key: 'dividends_36m', width: 15 },
    { header: 'All Time Dividends', key: 'dividends_all_time', width: 18 },
    { header: 'Dividend Yield (%)', key: 'dividend_yield', width: 18 },
    { header: 'Start Date', key: 'start_date', width: 12 },
    { header: 'End Date', key: 'end_date', width: 12 }
  ];
  
  // Adicionar estilo ao cabeçalho
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
  
  // Adicionar os dados
  sampleETFs.forEach(etf => {
    worksheet.addRow(etf);
  });
  
  // Formatar células de data e números
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Pular o cabeçalho
      // Formatar datas
      row.getCell('inception_date').numFmt = 'yyyy-mm-dd';
      row.getCell('start_date').numFmt = 'yyyy-mm-dd';
      row.getCell('end_date').numFmt = 'yyyy-mm-dd';
      
      // Formatar números
      row.getCell('total_assets').numFmt = '#,##0';
      row.getCell('volume').numFmt = '#,##0';
      
      // Formatar percentuais
      row.getCell('ten_year_return').numFmt = '0.00%';
      row.getCell('returns_12m').numFmt = '0.00%';
      row.getCell('returns_24m').numFmt = '0.00%';
      row.getCell('returns_36m').numFmt = '0.00%';
      row.getCell('volatility_12m').numFmt = '0.00%';
      row.getCell('volatility_24m').numFmt = '0.00%';
      row.getCell('volatility_36m').numFmt = '0.00%';
      row.getCell('ten_year_volatility').numFmt = '0.00%';
      row.getCell('max_drawdown').numFmt = '0.00%';
      row.getCell('dividend_yield').numFmt = '0.00%';
      
      // Formatar ratios (Sharpe)
      row.getCell('sharpe_12m').numFmt = '0.00';
      row.getCell('sharpe_24m').numFmt = '0.00';
      row.getCell('sharpe_36m').numFmt = '0.00';
      row.getCell('ten_year_sharpe').numFmt = '0.00';
      
      // Formatar dividendos
      row.getCell('dividends_12m').numFmt = '$0.00';
      row.getCell('dividends_24m').numFmt = '$0.00';
      row.getCell('dividends_36m').numFmt = '$0.00';
      row.getCell('dividends_all_time').numFmt = '$0.00';
    }
  });
  
  // Converter valores percentuais (divididos por 100)
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber > 1) { // Pular o cabeçalho
      const percentFields = [
        'ten_year_return', 'returns_12m', 'returns_24m', 'returns_36m',
        'volatility_12m', 'volatility_24m', 'volatility_36m', 'ten_year_volatility',
        'max_drawdown', 'dividend_yield'
      ];
      
      percentFields.forEach(field => {
        const cell = row.getCell(field);
        cell.value = cell.value / 100;
      });
    }
  });
  
  // Criar diretório, se não existir
  const outputDir = path.join(__dirname, '../public/sample');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  // Salvar o arquivo
  const outputPath = path.join(outputDir, 'sample-etfs.xlsx');
  await workbook.xlsx.writeFile(outputPath);
  console.log(`Arquivo Excel de exemplo gerado em: ${outputPath}`);
}

// Executar a função principal
generateSampleExcelFile().catch(err => {
  console.error('Erro ao gerar o arquivo Excel:', err);
  process.exit(1);
}); 