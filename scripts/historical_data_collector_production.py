#!/usr/bin/env python3
"""
PIPELINE DE DADOS HISTÓRICOS - PRODUÇÃO
Coleta 10 anos de dados históricos para ações americanas via yfinance
Fase 1 do Plano de Execução Stocks Completo
"""

import yfinance as yf
import pandas as pd
import json
import time
from datetime import datetime, timedelta
from typing import List, Dict, Any
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('historical_collection.log'),
        logging.StreamHandler()
    ]
)

class HistoricalDataCollector:
    """Coletor de dados históricos para ações americanas"""
    
    def __init__(self):
        self.start_date = (datetime.now() - timedelta(days=3650)).strftime('%Y-%m-%d')  # 10 anos
        self.end_date = datetime.now().strftime('%Y-%m-%d')
        self.batch_size = 50  # Ações por lote
        self.delay_between_requests = 0.1  # 100ms entre requests
        self.retry_attempts = 3
        
    def get_priority_stocks(self) -> List[Dict[str, Any]]:
        """Obter lista de ações priorizadas por market cap"""
        
        # Top 20 ações identificadas na análise
        priority_stocks = [
            {'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'market_cap': 4455891353600},
            {'ticker': 'STK101', 'name': 'Apple Technology Corp', 'market_cap': 2800000000000},
            {'ticker': 'STK102', 'name': 'Microsoft Software Inc', 'market_cap': 2500000000000},
            {'ticker': 'AMD', 'name': 'Advanced Micro Devices, Inc.', 'market_cap': 2400000000000},
            {'ticker': 'STK108', 'name': 'Nvidia Graphics Corp', 'market_cap': 2200000000000},
            {'ticker': 'META', 'name': 'Meta Platforms, Inc.', 'market_cap': 1965894008832},
            {'ticker': 'STK105', 'name': 'Google Search Corp', 'market_cap': 1700000000000},
            {'ticker': 'STK103', 'name': 'Amazon E-commerce Corp', 'market_cap': 1600000000000},
            {'ticker': 'KO2', 'name': 'The Coca-Cola Company', 'market_cap': 1474494125253},
            {'ticker': 'ITW2', 'name': 'Illinois Tool Works Inc', 'market_cap': 1273734374813},
            {'ticker': 'ISRG2', 'name': 'Intuitive Surgical Inc', 'market_cap': 1234326849214},
            {'ticker': 'JNJ2', 'name': 'Johnson & Johnson', 'market_cap': 1185707110357},
            {'ticker': 'KMI', 'name': 'Kinder Morgan', 'market_cap': 1182096794107},
            {'ticker': 'BRK-B', 'name': 'Berkshire Hathaway Inc.', 'market_cap': 1032868724736},
            {'ticker': 'GS2', 'name': 'The Goldman Sachs Group Inc', 'market_cap': 990380882767},
            {'ticker': 'KNX', 'name': 'Knight-Swift Transportation Holdings', 'market_cap': 971437545257},
            {'ticker': 'HCA2', 'name': 'HCA Healthcare Inc', 'market_cap': 921611690194},
            {'ticker': 'STK106', 'name': 'Meta Social Corp', 'market_cap': 900000000000},
            {'ticker': 'HLT2', 'name': 'Hilton Worldwide Holdings Inc', 'market_cap': 821757425668},
            {'ticker': 'INTC2', 'name': 'Intel Corporation', 'market_cap': 813443053260}
        ]
        
        # Para teste inicial, usar ações reais conhecidas
        real_stocks = [
            {'ticker': 'AAPL', 'name': 'Apple Inc.', 'market_cap': 3000000000000},
            {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'market_cap': 2800000000000},
            {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'market_cap': 2000000000000},
            {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'market_cap': 1800000000000},
            {'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'market_cap': 1700000000000},
            {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'market_cap': 1200000000000},
            {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'market_cap': 900000000000},
            {'ticker': 'BRK-B', 'name': 'Berkshire Hathaway Inc.', 'market_cap': 800000000000},
            {'ticker': 'JPM', 'name': 'JPMorgan Chase & Co.', 'market_cap': 600000000000},
            {'ticker': 'JNJ', 'name': 'Johnson & Johnson', 'market_cap': 500000000000}
        ]
        
        return real_stocks
    
    def collect_stock_history(self, ticker: str) -> Dict[str, Any]:
        """Coletar histórico de uma ação específica"""
        
        for attempt in range(self.retry_attempts):
            try:
                logging.info(f"Coletando dados históricos para {ticker} (tentativa {attempt + 1})")
                
                stock = yf.Ticker(ticker)
                history = stock.history(
                    start=self.start_date,
                    end=self.end_date,
                    auto_adjust=True,
                    prepost=True
                )
                
                if history.empty:
                    logging.warning(f"Nenhum dado histórico encontrado para {ticker}")
                    return None
                
                # Processar dados
                history = history.reset_index()
                history['ticker'] = ticker
                
                # Converter para formato SQL
                records = []
                for _, row in history.iterrows():
                    record = {
                        'ticker': ticker,
                        'date': row['Date'].strftime('%Y-%m-%d'),
                        'open': float(row['Open']) if pd.notna(row['Open']) else None,
                        'high': float(row['High']) if pd.notna(row['High']) else None,
                        'low': float(row['Low']) if pd.notna(row['Low']) else None,
                        'close': float(row['Close']) if pd.notna(row['Close']) else None,
                        'adj_close': float(row['Close']) if pd.notna(row['Close']) else None,
                        'volume': int(row['Volume']) if pd.notna(row['Volume']) else None
                    }
                    records.append(record)
                
                logging.info(f"✅ {ticker}: {len(records)} registros coletados")
                return {
                    'ticker': ticker,
                    'records_count': len(records),
                    'date_range': f"{records[0]['date']} to {records[-1]['date']}",
                    'records': records
                }
                
            except Exception as e:
                logging.error(f"❌ Erro coletando {ticker} (tentativa {attempt + 1}): {e}")
                if attempt < self.retry_attempts - 1:
                    time.sleep(2 ** attempt)  # Backoff exponencial
                continue
        
        return None
    
    def generate_sql_insert(self, stock_data: Dict[str, Any]) -> str:
        """Gerar SQL INSERT para os dados coletados"""
        
        if not stock_data or not stock_data.get('records'):
            return None
        
        ticker = stock_data['ticker']
        records = stock_data['records']
        
        # Gerar VALUES para INSERT
        values = []
        for record in records:
            value = f"""(
                (SELECT id FROM assets_master WHERE ticker = '{ticker}' AND asset_type = 'STOCK'),
                '{record['date']}',
                {record['open'] or 'NULL'},
                {record['high'] or 'NULL'},
                {record['low'] or 'NULL'},
                {record['close'] or 'NULL'},
                {record['adj_close'] or 'NULL'},
                {record['volume'] or 'NULL'}
            )"""
            values.append(value)
        
        sql = f"""
        INSERT INTO stock_prices_daily (
            asset_id, date, open, high, low, close, adj_close, volume
        ) VALUES {','.join(values)}
        ON CONFLICT (asset_id, date) DO UPDATE SET
            open = EXCLUDED.open,
            high = EXCLUDED.high,
            low = EXCLUDED.low,
            close = EXCLUDED.close,
            adj_close = EXCLUDED.adj_close,
            volume = EXCLUDED.volume;
        """
        
        return sql
    
    def collect_batch(self, stocks: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Coletar dados para um lote de ações"""
        
        batch_results = {
            'timestamp': datetime.now().isoformat(),
            'total_stocks': len(stocks),
            'successful': 0,
            'failed': 0,
            'total_records': 0,
            'stocks_data': [],
            'sql_statements': []
        }
        
        for stock in stocks:
            ticker = stock['ticker']
            
            # Coletar dados históricos
            stock_data = self.collect_stock_history(ticker)
            
            if stock_data:
                batch_results['successful'] += 1
                batch_results['total_records'] += stock_data['records_count']
                batch_results['stocks_data'].append(stock_data)
                
                # Gerar SQL
                sql = self.generate_sql_insert(stock_data)
                if sql:
                    batch_results['sql_statements'].append(sql)
                
            else:
                batch_results['failed'] += 1
            
            # Delay entre requests
            time.sleep(self.delay_between_requests)
        
        return batch_results
    
    def run_collection(self):
        """Executar coleta completa"""
        
        logging.info("🚀 INICIANDO COLETA DE DADOS HISTÓRICOS")
        logging.info(f"Período: {self.start_date} a {self.end_date}")
        
        # Obter ações prioritárias
        priority_stocks = self.get_priority_stocks()
        logging.info(f"Total de ações para coleta: {len(priority_stocks)}")
        
        # Executar coleta para o primeiro lote (teste)
        test_batch = priority_stocks[:5]  # Primeiras 5 ações para teste
        
        logging.info(f"🧪 EXECUTANDO LOTE DE TESTE: {[s['ticker'] for s in test_batch]}")
        
        batch_results = self.collect_batch(test_batch)
        
        # Salvar resultados
        report_filename = f"historical_collection_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        
        with open(report_filename, 'w', encoding='utf-8') as f:
            json.dump(batch_results, f, indent=2, default=str)
        
        # Log do relatório
        logging.info("📊 RELATÓRIO DO LOTE DE TESTE:")
        logging.info(f"✅ Sucessos: {batch_results['successful']}/{batch_results['total_stocks']}")
        logging.info(f"❌ Falhas: {batch_results['failed']}/{batch_results['total_stocks']}")
        logging.info(f"📈 Total de registros: {batch_results['total_records']:,}")
        logging.info(f"💾 Relatório salvo: {report_filename}")
        
        return batch_results

def main():
    """Função principal"""
    collector = HistoricalDataCollector()
    results = collector.run_collection()
    
    print("\n🎯 COLETA DE TESTE CONCLUÍDA!")
    print(f"Sucessos: {results['successful']}/{results['total_stocks']}")
    print(f"Registros coletados: {results['total_records']:,}")
    print(f"Taxa de sucesso: {(results['successful']/results['total_stocks']*100):.1f}%")

if __name__ == "__main__":
    main()
