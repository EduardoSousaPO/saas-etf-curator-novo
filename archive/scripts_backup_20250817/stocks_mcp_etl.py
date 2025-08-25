#!/usr/bin/env python3
"""
ETL Pipeline para Ações - Inserção via MCP Supabase
Versão simplificada que insere dados reais no Supabase
"""

import yfinance as yf
import json
import time
from datetime import datetime, date

class StocksMCPETL:
    """Pipeline ETL simplificado usando MCP Supabase"""
    
    def __init__(self):
        self.processed_count = 0
        self.failed_count = 0
    
    def get_test_stocks(self):
        """Lista de ações para teste inicial"""
        return [
            {'ticker': 'AAPL', 'name': 'Apple Inc.', 'sector': 'Technology', 'exchange': 'NASDAQ'},
            {'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'sector': 'Technology', 'exchange': 'NASDAQ'},
            {'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'sector': 'Technology', 'exchange': 'NASDAQ'},
            {'ticker': 'AMZN', 'name': 'Amazon.com Inc.', 'sector': 'Consumer Discretionary', 'exchange': 'NASDAQ'},
            {'ticker': 'TSLA', 'name': 'Tesla Inc.', 'sector': 'Consumer Discretionary', 'exchange': 'NASDAQ'},
            {'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'sector': 'Technology', 'exchange': 'NASDAQ'},
            {'ticker': 'META', 'name': 'Meta Platforms Inc.', 'sector': 'Technology', 'exchange': 'NASDAQ'},
            {'ticker': 'BRK-B', 'name': 'Berkshire Hathaway Inc.', 'sector': 'Financial Services', 'exchange': 'NYSE'},
            {'ticker': 'JNJ', 'name': 'Johnson & Johnson', 'sector': 'Healthcare', 'exchange': 'NYSE'},
            {'ticker': 'JPM', 'name': 'JPMorgan Chase & Co.', 'sector': 'Financial Services', 'exchange': 'NYSE'}
        ]
    
    def collect_stock_data(self, stock_info):
        """Coleta dados de uma ação via yfinance"""
        try:
            ticker = stock_info['ticker']
            print(f"📊 Coletando dados para {ticker}...")
            
            stock = yf.Ticker(ticker)
            
            # Dados básicos
            info = stock.info
            if not info:
                return None
            
            # Histórico 1 ano
            hist = stock.history(period="1y")
            if hist.empty:
                return None
            
            # Calcula métricas básicas
            current_price = float(hist['Close'].iloc[-1])
            returns_12m = float((current_price / hist['Close'].iloc[0] - 1) * 100) if len(hist) > 0 else None
            volatility_12m = float(hist['Close'].pct_change().std() * 100 * (252 ** 0.5)) if len(hist) > 10 else None
            volume_avg_30d = int(hist['Volume'].tail(30).mean()) if len(hist) >= 30 else None
            
            return {
                'ticker': ticker,
                'name': stock_info['name'],
                'sector': stock_info['sector'],
                'industry': info.get('industry', 'Unknown'),
                'exchange': stock_info['exchange'],
                'current_price': current_price,
                'market_cap': info.get('marketCap', 0),
                'shares_outstanding': info.get('sharesOutstanding'),
                'volume_avg_30d': volume_avg_30d,
                'returns_12m': returns_12m,
                'volatility_12m': volatility_12m,
                'pe_ratio': info.get('trailingPE'),
                'dividend_yield_12m': info.get('dividendYield'),
                'beta_12m': info.get('beta', 1.0),
                'collected_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Erro ao coletar {ticker}: {e}")
            return None
    
    def prepare_mcp_commands(self, stock_data):
        """Prepara comandos MCP para inserção no Supabase"""
        ticker = stock_data['ticker']
        
        # 1. Comando para assets_master
        assets_sql = f"""
        INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency)
        VALUES ('{ticker}', 'STOCK', '{stock_data['name'].replace("'", "''")}', '{stock_data['exchange']}', 
                '{stock_data['sector']}', '{stock_data.get('industry', 'Unknown')}', 'USD')
        ON CONFLICT (ticker) DO UPDATE SET
            name = EXCLUDED.name,
            exchange = EXCLUDED.exchange,
            sector = EXCLUDED.sector,
            industry = EXCLUDED.industry,
            updated_at = now()
        RETURNING id;
        """
        
        # 2. Comando para stock_metrics_snapshot (assumindo asset_id = 1 para teste)
        metrics_sql = f"""
        INSERT INTO stock_metrics_snapshot (
            asset_id, snapshot_date, current_price, market_cap, shares_outstanding, 
            volume_avg_30d, returns_12m, volatility_12m, beta_12m, dividend_yield_12m,
            source_meta
        ) VALUES (
            (SELECT id FROM assets_master WHERE ticker = '{ticker}'),
            CURRENT_DATE,
            {stock_data.get('current_price', 'NULL')},
            {stock_data.get('market_cap', 'NULL')},
            {stock_data.get('shares_outstanding', 'NULL')},
            {stock_data.get('volume_avg_30d', 'NULL')},
            {stock_data.get('returns_12m', 'NULL')},
            {stock_data.get('volatility_12m', 'NULL')},
            {stock_data.get('beta_12m', 'NULL')},
            {stock_data.get('dividend_yield_12m', 'NULL')},
            '{json.dumps({"source": "yfinance", "collected_at": stock_data["collected_at"]})}'
        )
        ON CONFLICT (asset_id, snapshot_date) DO UPDATE SET
            current_price = EXCLUDED.current_price,
            market_cap = EXCLUDED.market_cap,
            shares_outstanding = EXCLUDED.shares_outstanding,
            volume_avg_30d = EXCLUDED.volume_avg_30d,
            returns_12m = EXCLUDED.returns_12m,
            volatility_12m = EXCLUDED.volatility_12m,
            beta_12m = EXCLUDED.beta_12m,
            dividend_yield_12m = EXCLUDED.dividend_yield_12m,
            source_meta = EXCLUDED.source_meta,
            calculated_at = now();
        """
        
        # 3. Comando para fundamentais (se disponível)
        fundamentals_sql = None
        if stock_data.get('pe_ratio'):
            fundamentals_sql = f"""
            INSERT INTO stock_fundamentals_quarterly (
                asset_id, quarter_date, pe_ratio, source_meta
            ) VALUES (
                (SELECT id FROM assets_master WHERE ticker = '{ticker}'),
                DATE_TRUNC('quarter', CURRENT_DATE),
                {stock_data.get('pe_ratio')},
                '{json.dumps({"source": "yfinance_info", "collected_at": stock_data["collected_at"]})}'
            )
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            """
        
        return {
            'assets_sql': assets_sql,
            'metrics_sql': metrics_sql,
            'fundamentals_sql': fundamentals_sql
        }
    
    def save_mcp_commands(self, all_commands):
        """Salva todos os comandos MCP em arquivo para execução"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'stocks_mcp_commands_{timestamp}.sql'
        
        with open(filename, 'w', encoding='utf-8') as f:
            f.write("-- ETL Pipeline para Ações - Comandos MCP Supabase\\n")
            f.write(f"-- Gerado em: {datetime.now()}\\n")
            f.write("-- Projeto: nniabnjuwzeqmflrruga\\n\\n")
            
            for i, commands in enumerate(all_commands, 1):
                f.write(f"-- ===== AÇÃO {i}: {commands.get('ticker', 'Unknown')} =====\\n")
                f.write(commands['assets_sql'])
                f.write("\\n\\n")
                f.write(commands['metrics_sql'])
                f.write("\\n\\n")
                if commands['fundamentals_sql']:
                    f.write(commands['fundamentals_sql'])
                    f.write("\\n\\n")
                f.write("\\n")
        
        print(f"📄 Comandos MCP salvos em: {filename}")
        return filename
    
    def run_etl_pipeline(self):
        """Executa o pipeline ETL"""
        print("🚀 Iniciando ETL Pipeline - Ações via MCP Supabase")
        print("=" * 60)
        
        try:
            # 1. Lista de ações para teste
            test_stocks = self.get_test_stocks()
            total_stocks = len(test_stocks)
            print(f"📊 Total de ações para processar: {total_stocks}")
            
            # 2. Coleta dados e prepara comandos
            all_commands = []
            all_data = []
            
            for i, stock_info in enumerate(test_stocks, 1):
                print(f"\\n📦 [{i}/{total_stocks}] Processando {stock_info['ticker']}...")
                
                # Coleta dados
                stock_data = self.collect_stock_data(stock_info)
                if stock_data:
                    # Prepara comandos MCP
                    commands = self.prepare_mcp_commands(stock_data)
                    commands['ticker'] = stock_data['ticker']
                    all_commands.append(commands)
                    all_data.append(stock_data)
                    
                    print(f"✅ {stock_data['ticker']}: ${stock_data['current_price']:.2f}, "
                          f"Return: {stock_data.get('returns_12m', 0):.1f}%")
                    self.processed_count += 1
                else:
                    print(f"❌ Falhou: {stock_info['ticker']}")
                    self.failed_count += 1
                
                # Pausa para evitar rate limiting
                time.sleep(1)
            
            # 3. Salva comandos MCP
            if all_commands:
                sql_file = self.save_mcp_commands(all_commands)
                
                # Salva dados coletados em JSON
                json_file = f'stocks_collected_data_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
                with open(json_file, 'w', encoding='utf-8') as f:
                    json.dump(all_data, f, indent=2, default=str, ensure_ascii=False)
                print(f"📊 Dados coletados salvos em: {json_file}")
            
            # 4. Relatório final
            success_rate = (self.processed_count / total_stocks) * 100
            print("\\n" + "=" * 60)
            print("🎉 ETL Pipeline Concluído!")
            print(f"📈 Estatísticas finais:")
            print(f"   • Processadas com sucesso: {self.processed_count}")
            print(f"   • Falharam: {self.failed_count}")
            print(f"   • Taxa de sucesso: {success_rate:.1f}%")
            
            print("\\n🔄 Próximos passos:")
            print("   1. Executar comandos SQL via MCP Supabase")
            print("   2. Atualizar Materialized View stocks_ativos_reais")
            print("   3. Iniciar FASE 4: Validação via Perplexity AI")
            
            return all_commands, all_data
            
        except Exception as e:
            print(f"💥 Erro crítico no pipeline: {e}")
            raise

if __name__ == "__main__":
    # Executa o pipeline
    pipeline = StocksMCPETL()
    commands, data = pipeline.run_etl_pipeline()


