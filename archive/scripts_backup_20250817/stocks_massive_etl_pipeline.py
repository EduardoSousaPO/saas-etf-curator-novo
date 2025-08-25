#!/usr/bin/env python3
"""
PIPELINE ETL MASSIVO - 2.460 AÇÕES AMERICANAS
Sistema escalável com processamento em lotes, rate limiting e recuperação de erros
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import sys
import warnings
import time
import logging
import csv
from typing import Dict, List, Optional, Tuple, Set
import threading
import queue
import sqlite3
from pathlib import Path

warnings.filterwarnings('ignore')

class MassiveStocksETL:
    """Pipeline ETL massivo para 2.460 ações americanas"""
    
    def __init__(self):
        self.risk_free_rate = 0.045  # Taxa livre de risco 4.5%
        self.trading_days_year = 252
        
        # Configurações de processamento
        self.batch_size = 50  # Processar 50 ações por vez
        self.rate_limit_delay = 1.0  # 1 segundo entre requisições
        self.max_retries = 3
        self.timeout_seconds = 30
        
        # Períodos para cálculo
        self.periods = {
            '12m': 252,    # 1 ano
            '24m': 504,    # 2 anos  
            '36m': 756,    # 3 anos
            '5y': 1260,    # 5 anos
            '10y': 2520    # 10 anos
        }
        
        # Configurar logging
        self.setup_logging()
        
        # Banco local para checkpoint/recovery
        self.setup_checkpoint_db()
        
        # Estatísticas
        self.stats = {
            'total_stocks': 0,
            'processed': 0,
            'successful': 0,
            'failed': 0,
            'skipped': 0,
            'start_time': None,
            'errors': [],
            'current_batch': 0,
            'total_batches': 0
        }
        
        # Resultados
        self.results = {
            'assets_master': [],
            'stock_metrics_snapshot': [],
            'failed_symbols': [],
            'processing_log': []
        }
    
    def setup_logging(self):
        """Configurar sistema de logging"""
        log_filename = f"massive_etl_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log"
        
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(levelname)s - %(message)s',
            handlers=[
                logging.FileHandler(log_filename, encoding='utf-8'),
                logging.StreamHandler(sys.stdout)
            ]
        )
        self.logger = logging.getLogger(__name__)
        self.logger.info("🚀 Massive Stocks ETL Pipeline iniciado")
    
    def setup_checkpoint_db(self):
        """Configurar banco SQLite para checkpoints"""
        self.checkpoint_db = "stocks_etl_checkpoint.db"
        conn = sqlite3.connect(self.checkpoint_db)
        
        conn.execute("""
            CREATE TABLE IF NOT EXISTS processing_status (
                symbol TEXT PRIMARY KEY,
                status TEXT,
                processed_at TIMESTAMP,
                error_message TEXT,
                retry_count INTEGER DEFAULT 0
            )
        """)
        
        conn.execute("""
            CREATE TABLE IF NOT EXISTS batch_progress (
                batch_id INTEGER PRIMARY KEY,
                batch_size INTEGER,
                completed_at TIMESTAMP,
                success_count INTEGER,
                error_count INTEGER
            )
        """)
        
        conn.commit()
        conn.close()
        self.logger.info(f"💾 Checkpoint database configurado: {self.checkpoint_db}")
    
    def load_stocks_from_csv(self, csv_path: str) -> List[Dict]:
        """Carregar ações do arquivo CSV"""
        stocks = []
        
        try:
            with open(csv_path, 'r', encoding='latin-1') as file:
                reader = csv.DictReader(file, delimiter=';')
                
                for row in reader:
                    # Filtrar linhas válidas (não #CAMPO!)
                    if (row.get('ticker') and 
                        row.get('ticker') != '#CAMPO!' and 
                        row.get('ticker').strip()):
                        
                        # Limpar dados
                        symbol = row.get('ticker', '').strip()
                        name = row.get('symbol', '').split('(')[0].strip()
                        sector = row.get('Setor', '').strip() if row.get('Setor') != '#CAMPO!' else None
                        description = row.get('Descrição', '').strip() if row.get('Descrição') != '#CAMPO!' else None
                        
                        if symbol and len(symbol) <= 10:  # Filtro básico de sanidade
                            stocks.append({
                                'symbol': symbol,
                                'name': name,
                                'sector': sector,
                                'description': description
                            })
            
            self.logger.info(f"📊 {len(stocks)} ações válidas carregadas do CSV")
            return stocks
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao carregar CSV: {e}")
            return []
    
    def get_processed_symbols(self) -> Set[str]:
        """Obter símbolos já processados com sucesso"""
        conn = sqlite3.connect(self.checkpoint_db)
        cursor = conn.execute(
            "SELECT symbol FROM processing_status WHERE status = 'success'"
        )
        processed = {row[0] for row in cursor.fetchall()}
        conn.close()
        return processed
    
    def get_failed_symbols(self) -> Set[str]:
        """Obter símbolos que falharam (para retry)"""
        conn = sqlite3.connect(self.checkpoint_db)
        cursor = conn.execute(
            "SELECT symbol FROM processing_status WHERE status = 'failed' AND retry_count < ?"
            , (self.max_retries,)
        )
        failed = {row[0] for row in cursor.fetchall()}
        conn.close()
        return failed
    
    def update_processing_status(self, symbol: str, status: str, error_msg: str = None):
        """Atualizar status de processamento"""
        conn = sqlite3.connect(self.checkpoint_db)
        
        if status == 'failed':
            conn.execute("""
                INSERT OR REPLACE INTO processing_status 
                (symbol, status, processed_at, error_message, retry_count)
                VALUES (?, ?, ?, ?, COALESCE((SELECT retry_count FROM processing_status WHERE symbol = ?) + 1, 1))
            """, (symbol, status, datetime.now(), error_msg, symbol))
        else:
            conn.execute("""
                INSERT OR REPLACE INTO processing_status 
                (symbol, status, processed_at, error_message, retry_count)
                VALUES (?, ?, ?, ?, 0)
            """, (symbol, status, datetime.now(), error_msg))
        
        conn.commit()
        conn.close()
    
    def fetch_stock_info(self, symbol: str) -> Optional[Dict]:
        """Coleta informações básicas da ação com retry"""
        for attempt in range(self.max_retries):
            try:
                stock = yf.Ticker(symbol)
                info = stock.info
                
                # Validação básica
                if not info or len(info) < 5:
                    raise ValueError(f"Dados insuficientes para {symbol}")
                
                return {
                    'ticker': symbol,
                    'asset_type': 'STOCK',
                    'name': info.get('longName', info.get('shortName', symbol)),
                    'exchange': info.get('exchange', 'UNKNOWN'),
                    'sector': info.get('sector'),
                    'industry': info.get('industry'),
                    'business_description': info.get('longBusinessSummary'),
                    'headquarters': f"{info.get('city', '')}, {info.get('state', '')}, {info.get('country', '')}".strip(', '),
                    'employees_count': info.get('fullTimeEmployees'),
                    'market_cap': info.get('marketCap'),
                    'shares_outstanding': info.get('sharesOutstanding')
                }
                
            except Exception as e:
                self.logger.warning(f"⚠️ Tentativa {attempt + 1} falhou para {symbol}: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.rate_limit_delay * (attempt + 1))
                else:
                    return None
        
        return None
    
    def fetch_historical_data(self, symbol: str, period: str = "10y") -> Optional[pd.DataFrame]:
        """Coleta dados históricos com retry"""
        for attempt in range(self.max_retries):
            try:
                stock = yf.Ticker(symbol)
                hist = stock.history(period=period, auto_adjust=True, timeout=self.timeout_seconds)
                
                if hist.empty or len(hist) < 100:  # Mínimo 100 dias
                    raise ValueError(f"Dados históricos insuficientes para {symbol}")
                
                hist = hist.dropna()
                hist.index = hist.index.date
                return hist
                
            except Exception as e:
                self.logger.warning(f"⚠️ Histórico tentativa {attempt + 1} falhou para {symbol}: {e}")
                if attempt < self.max_retries - 1:
                    time.sleep(self.rate_limit_delay * (attempt + 1))
                else:
                    return None
        
        return None
    
    def calculate_all_metrics(self, symbol: str, hist_data: pd.DataFrame, stock_info: Dict) -> Optional[Dict]:
        """Calcular todas as 18 métricas essenciais"""
        try:
            prices = hist_data['Close']
            current_price = float(prices.iloc[-1])
            daily_returns = prices.pct_change().dropna()
            
            metrics = {
                'current_price': round(current_price, 4),
                'market_cap': stock_info.get('market_cap'),
                'shares_outstanding': stock_info.get('shares_outstanding'),
                'volume_avg_30d': int(hist_data['Volume'].tail(30).mean()) if len(hist_data) >= 30 else None,
            }
            
            # Calcular retornos para diferentes períodos
            for period_name, days in self.periods.items():
                if len(prices) >= days:
                    start_price = prices.iloc[-days]
                    end_price = prices.iloc[-1]
                    period_return = (end_price / start_price) - 1
                    metrics[f'returns_{period_name}'] = round(period_return, 6)
                else:
                    metrics[f'returns_{period_name}'] = None
            
            # Calcular volatilidades
            for period_name, days in self.periods.items():
                if len(daily_returns) >= days:
                    period_returns = daily_returns.tail(days)
                    volatility = period_returns.std() * np.sqrt(self.trading_days_year)
                    metrics[f'volatility_{period_name}'] = round(volatility, 6)
                else:
                    metrics[f'volatility_{period_name}'] = None
            
            # Calcular Sharpe Ratios
            for period_name, days in self.periods.items():
                if (len(daily_returns) >= days and 
                    metrics.get(f'volatility_{period_name}') and 
                    metrics.get(f'volatility_{period_name}') > 0):
                    
                    period_returns = daily_returns.tail(days)
                    annualized_return = (1 + period_returns.mean()) ** self.trading_days_year - 1
                    annualized_volatility = metrics[f'volatility_{period_name}']
                    
                    sharpe = (annualized_return - self.risk_free_rate) / annualized_volatility
                    metrics[f'sharpe_{period_name}'] = round(sharpe, 4)
                else:
                    metrics[f'sharpe_{period_name}'] = None
            
            # Calcular Maximum Drawdown
            peak = prices.expanding(min_periods=1).max()
            drawdown = (prices - peak) / peak
            max_dd = drawdown.min()
            metrics['max_drawdown'] = round(max_dd, 6)
            metrics['max_drawdown_12m'] = round(max_dd, 6)  # Simplificado
            
            # Dividendos (simplificado - zeros por enquanto, pode ser melhorado)
            metrics.update({
                'dividends_12m': 0.0,
                'dividends_24m': 0.0,
                'dividends_36m': 0.0,
                'dividends_all_time': 0.0,
                'dividend_yield_12m': 0.0
            })
            
            # Categorização
            market_cap = metrics.get('market_cap', 0) or 0
            if market_cap > 10e9:
                size_cat = 'Large Cap'
            elif market_cap > 2e9:
                size_cat = 'Mid Cap'
            else:
                size_cat = 'Small Cap'
            
            volume_30d = metrics.get('volume_avg_30d', 0) or 0
            liquidity_cat = 'High' if volume_30d > 1e6 else 'Medium' if volume_30d > 100000 else 'Low'
            
            metrics.update({
                'size_category': size_cat,
                'liquidity_category': liquidity_cat,
                'snapshot_date': str(datetime.now().date()),
                'source_meta': json.dumps({
                    'data_source': 'yfinance',
                    'collection_date': datetime.now().isoformat(),
                    'historical_days': len(hist_data),
                    'pipeline_version': '2.0_massive'
                })
            })
            
            return metrics
            
        except Exception as e:
            self.logger.error(f"❌ Erro ao calcular métricas para {symbol}: {e}")
            return None
    
    def process_single_stock(self, stock_data: Dict) -> bool:
        """Processar uma única ação"""
        symbol = stock_data['symbol']
        
        try:
            self.logger.info(f"🔄 Processando {symbol}...")
            
            # 1. Buscar informações básicas
            stock_info = self.fetch_stock_info(symbol)
            if not stock_info:
                raise ValueError("Falha ao obter informações básicas")
            
            # Enriquecer com dados do CSV
            stock_info.update({
                'business_description': stock_data.get('description') or stock_info.get('business_description')
            })
            
            # 2. Buscar dados históricos
            hist_data = self.fetch_historical_data(symbol)
            if hist_data is None:
                raise ValueError("Falha ao obter dados históricos")
            
            # 3. Calcular métricas
            metrics = self.calculate_all_metrics(symbol, hist_data, stock_info)
            if not metrics:
                raise ValueError("Falha ao calcular métricas")
            
            # 4. Armazenar resultados
            asset_id = len(self.results['assets_master']) + 1
            stock_info['id'] = asset_id
            metrics['asset_id'] = asset_id
            
            self.results['assets_master'].append(stock_info)
            self.results['stock_metrics_snapshot'].append(metrics)
            
            # 5. Atualizar status
            self.update_processing_status(symbol, 'success')
            self.stats['successful'] += 1
            
            self.logger.info(f"✅ {symbol} processado com sucesso - ${metrics['current_price']:.2f}")
            return True
            
        except Exception as e:
            error_msg = str(e)
            self.logger.error(f"❌ Erro ao processar {symbol}: {error_msg}")
            
            self.update_processing_status(symbol, 'failed', error_msg)
            self.results['failed_symbols'].append({
                'symbol': symbol,
                'error': error_msg,
                'timestamp': datetime.now().isoformat()
            })
            self.stats['failed'] += 1
            return False
        
        finally:
            self.stats['processed'] += 1
            time.sleep(self.rate_limit_delay)  # Rate limiting
    
    def process_batch(self, batch_stocks: List[Dict], batch_id: int) -> Dict:
        """Processar um lote de ações"""
        batch_start = time.time()
        batch_success = 0
        batch_errors = 0
        
        self.logger.info(f"📦 LOTE {batch_id}: Processando {len(batch_stocks)} ações...")
        
        for i, stock in enumerate(batch_stocks, 1):
            self.logger.info(f"📊 Lote {batch_id} - Progresso: {i}/{len(batch_stocks)} ({i/len(batch_stocks)*100:.1f}%)")
            
            if self.process_single_stock(stock):
                batch_success += 1
            else:
                batch_errors += 1
        
        batch_duration = time.time() - batch_start
        
        # Salvar progresso do lote
        conn = sqlite3.connect(self.checkpoint_db)
        conn.execute("""
            INSERT INTO batch_progress (batch_id, batch_size, completed_at, success_count, error_count)
            VALUES (?, ?, ?, ?, ?)
        """, (batch_id, len(batch_stocks), datetime.now(), batch_success, batch_errors))
        conn.commit()
        conn.close()
        
        self.logger.info(f"✅ LOTE {batch_id} CONCLUÍDO: {batch_success} sucessos, {batch_errors} erros em {batch_duration:.1f}s")
        
        return {
            'batch_id': batch_id,
            'success_count': batch_success,
            'error_count': batch_errors,
            'duration': batch_duration
        }
    
    def save_results_to_sql(self, output_file: str = "massive_stocks_insert.sql"):
        """Salvar resultados em arquivo SQL"""
        sql_commands = []
        
        # Assets Master
        sql_commands.append("-- INSERÇÃO MASSIVA EM ASSETS_MASTER")
        for asset in self.results['assets_master']:
            values = []
            for field in ['ticker', 'asset_type', 'name', 'exchange', 'sector', 'industry', 
                         'business_description', 'headquarters', 'employees_count']:
                value = asset.get(field)
                if value is None:
                    values.append('NULL')
                elif isinstance(value, str):
                    escaped_value = value.replace("'", "''")[:1000]  # Limitar tamanho
                    values.append(f"'{escaped_value}'")
                else:
                    values.append(str(value))
            
            sql = f"""INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description, headquarters, employees_count) VALUES ({', '.join(values)});"""
            sql_commands.append(sql)
        
        # Stock Metrics Snapshot
        sql_commands.append("\\n-- INSERÇÃO MASSIVA EM STOCK_METRICS_SNAPSHOT")
        for metrics in self.results['stock_metrics_snapshot']:
            fields = ['asset_id', 'snapshot_date', 'current_price', 'market_cap', 'shares_outstanding', 
                     'volume_avg_30d', 'returns_12m', 'returns_24m', 'returns_36m', 'returns_5y', 
                     'ten_year_return', 'volatility_12m', 'volatility_24m', 'volatility_36m', 
                     'ten_year_volatility', 'sharpe_12m', 'sharpe_24m', 'sharpe_36m', 'ten_year_sharpe',
                     'max_drawdown', 'max_drawdown_12m', 'dividend_yield_12m', 'dividends_12m', 
                     'dividends_24m', 'dividends_36m', 'dividends_all_time', 'size_category', 
                     'liquidity_category', 'source_meta']
            
            values = []
            for field in fields:
                value = metrics.get(field)
                if value is None:
                    values.append('NULL')
                elif isinstance(value, str):
                    escaped_value = value.replace("'", "''")
                    values.append(f"'{escaped_value}'")
                else:
                    values.append(str(value))
            
            sql = f"""INSERT INTO stock_metrics_snapshot ({', '.join(fields)}) VALUES ({', '.join(values)});"""
            sql_commands.append(sql)
        
        # Refresh Materialized View
        sql_commands.append("\\n-- ATUALIZAR MATERIALIZED VIEW")
        sql_commands.append("REFRESH MATERIALIZED VIEW stocks_ativos_reais;")
        
        # Salvar arquivo
        with open(output_file, 'w', encoding='utf-8') as f:
            f.write('\\n'.join(sql_commands))
        
        self.logger.info(f"💾 Comandos SQL salvos em: {output_file}")
    
    def generate_report(self):
        """Gerar relatório final"""
        duration = time.time() - self.stats['start_time']
        
        report = {
            'execution_summary': {
                'total_stocks': self.stats['total_stocks'],
                'processed': self.stats['processed'],
                'successful': self.stats['successful'],
                'failed': self.stats['failed'],
                'success_rate': f"{(self.stats['successful']/self.stats['processed']*100):.1f}%" if self.stats['processed'] > 0 else "0%",
                'duration_minutes': f"{duration/60:.1f}",
                'stocks_per_minute': f"{self.stats['processed']/(duration/60):.1f}" if duration > 0 else "0"
            },
            'data_quality': {
                'assets_with_complete_info': len([a for a in self.results['assets_master'] if a.get('business_description')]),
                'assets_with_market_cap': len([m for m in self.results['stock_metrics_snapshot'] if m.get('market_cap')]),
                'assets_with_returns_12m': len([m for m in self.results['stock_metrics_snapshot'] if m.get('returns_12m') is not None]),
                'assets_with_volatility': len([m for m in self.results['stock_metrics_snapshot'] if m.get('volatility_12m') is not None])
            },
            'failed_symbols': self.results['failed_symbols'][:10],  # Primeiros 10 erros
            'timestamp': datetime.now().isoformat()
        }
        
        # Salvar relatório
        report_file = f"massive_etl_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"📊 Relatório salvo em: {report_file}")
        return report
    
    def run_massive_pipeline(self, csv_path: str):
        """Executar pipeline massivo completo"""
        self.stats['start_time'] = time.time()
        
        self.logger.info("🚀 INICIANDO PIPELINE ETL MASSIVO - 2.460 AÇÕES AMERICANAS")
        self.logger.info("=" * 80)
        
        # 1. Carregar ações do CSV
        all_stocks = self.load_stocks_from_csv(csv_path)
        self.stats['total_stocks'] = len(all_stocks)
        
        if not all_stocks:
            self.logger.error("❌ Nenhuma ação válida encontrada no CSV")
            return
        
        # 2. Filtrar ações já processadas
        processed_symbols = self.get_processed_symbols()
        failed_symbols = self.get_failed_symbols()
        
        # Incluir símbolos que falharam para retry
        pending_stocks = [
            stock for stock in all_stocks 
            if stock['symbol'] not in processed_symbols or stock['symbol'] in failed_symbols
        ]
        
        self.logger.info(f"📊 Total de ações: {len(all_stocks)}")
        self.logger.info(f"✅ Já processadas: {len(processed_symbols)}")
        self.logger.info(f"🔄 Para processar: {len(pending_stocks)}")
        
        if not pending_stocks:
            self.logger.info("🎉 Todas as ações já foram processadas!")
            return
        
        # 3. Processar em lotes
        total_batches = (len(pending_stocks) + self.batch_size - 1) // self.batch_size
        self.stats['total_batches'] = total_batches
        
        for batch_id in range(1, total_batches + 1):
            start_idx = (batch_id - 1) * self.batch_size
            end_idx = min(start_idx + self.batch_size, len(pending_stocks))
            batch_stocks = pending_stocks[start_idx:end_idx]
            
            self.stats['current_batch'] = batch_id
            
            # Processar lote
            batch_result = self.process_batch(batch_stocks, batch_id)
            
            # Status geral
            overall_progress = (self.stats['processed'] / len(pending_stocks)) * 100
            self.logger.info(f"📈 PROGRESSO GERAL: {overall_progress:.1f}% ({self.stats['processed']}/{len(pending_stocks)})")
            
            # Salvar resultados parciais a cada 10 lotes
            if batch_id % 10 == 0:
                partial_file = f"partial_results_batch_{batch_id}.sql"
                self.save_results_to_sql(partial_file)
                self.logger.info(f"💾 Resultados parciais salvos: {partial_file}")
        
        # 4. Gerar relatório final
        self.logger.info("=" * 80)
        self.logger.info("📊 GERANDO RELATÓRIO FINAL...")
        
        report = self.generate_report()
        
        # 5. Salvar SQL final
        self.save_results_to_sql("massive_stocks_final.sql")
        
        # 6. Exibir resumo
        self.logger.info("🎉 PIPELINE MASSIVO CONCLUÍDO!")
        self.logger.info(f"✅ Sucessos: {self.stats['successful']}")
        self.logger.info(f"❌ Falhas: {self.stats['failed']}")
        self.logger.info(f"📊 Taxa de sucesso: {report['execution_summary']['success_rate']}")
        self.logger.info(f"⏱️ Duração: {report['execution_summary']['duration_minutes']} minutos")
        self.logger.info(f"🚀 Velocidade: {report['execution_summary']['stocks_per_minute']} ações/minuto")

if __name__ == "__main__":
    # Inicializar pipeline
    etl = MassiveStocksETL()
    
    # Executar pipeline massivo
    csv_path = "../top_us_stocks_2025-07-29.csv"
    etl.run_massive_pipeline(csv_path)
    
    print("\\n🎉 PIPELINE MASSIVO CONCLUÍDO!")
    print("Verifique os arquivos gerados:")
    print("- massive_stocks_final.sql (comandos SQL)")
    print("- massive_etl_report_*.json (relatório)")
    print("- massive_etl_*.log (log detalhado)")
    print("- stocks_etl_checkpoint.db (checkpoint/recovery)")




