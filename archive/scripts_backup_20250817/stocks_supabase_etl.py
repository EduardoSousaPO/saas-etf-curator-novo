#!/usr/bin/env python3
"""
ETL Pipeline para Ações - Integração com Supabase via MCP
Coleta dados via yfinance e insere no Supabase usando as tabelas normalizadas
"""

import yfinance as yf
import pandas as pd
import json
import sys
import subprocess
import time
from datetime import datetime, date
from typing import Dict, List, Optional

class StocksSupabaseETL:
    """Pipeline ETL para ações com integração Supabase"""
    
    def __init__(self):
        self.project_id = "nniabnjuwzeqmflrruga"  # Projeto Supabase
        self.processed_count = 0
        self.failed_count = 0
        
    def load_stocks_from_csv(self) -> List[Dict]:
        """Carrega lista de ações do CSV com encoding correto"""
        try:
            print("📂 Carregando ações do CSV...")
            
            # Tenta diferentes encodings
            encodings = ['utf-8', 'latin-1', 'cp1252', 'iso-8859-1']
            df = None
            
            for encoding in encodings:
                try:
                    df = pd.read_csv("../top_us_stocks_2025-07-29.csv", sep=';', encoding=encoding)
                    print(f"✅ CSV carregado com encoding: {encoding}")
                    break
                except UnicodeDecodeError:
                    continue
            
            if df is None:
                raise Exception("Não foi possível carregar o CSV com nenhum encoding")
            
            # Limpa dados inválidos
            df = df[df['ticker'] != '#CAMPO!'].copy()
            df = df.dropna(subset=['ticker']).copy()
            
            # Extrai informações básicas
            df['clean_ticker'] = df['ticker'].str.strip()
            df['company_name'] = df['symbol'].str.extract(r'^([^(]+)')[0].str.strip()
            df['exchange'] = df['symbol'].str.extract(r'\\(([^:]+):')[0].str.strip()
            
            # Limpa setor
            if 'Setor' in df.columns:
                df['sector_clean'] = df['Setor'].str.strip()
            else:
                df['sector_clean'] = 'Unknown'
            
            # Remove tickers inválidos
            df = df[df['clean_ticker'].str.len() <= 5].copy()
            df = df[~df['clean_ticker'].str.contains(r'[^A-Z]', na=False)].copy()
            
            # Converte para lista de dicionários
            stocks = []
            for _, row in df.iterrows():
                stocks.append({
                    'ticker': row['clean_ticker'],
                    'name': row['company_name'] if pd.notna(row['company_name']) else row['clean_ticker'],
                    'exchange': row['exchange'] if pd.notna(row['exchange']) else 'Unknown',
                    'sector': row['sector_clean'] if pd.notna(row['sector_clean']) else 'Unknown'
                })
            
            print(f"📊 {len(stocks)} ações válidas carregadas")
            return stocks[:100]  # Processa apenas 100 para teste
            
        except Exception as e:
            print(f"❌ Erro ao carregar CSV: {e}")
            return []
    
    def get_stock_data_yfinance(self, ticker: str) -> Optional[Dict]:
        """Coleta dados de uma ação via yfinance"""
        try:
            stock = yf.Ticker(ticker)
            
            # Dados básicos
            info = stock.info
            if not info or 'symbol' not in info:
                return None
            
            # Histórico 1 ano para métricas básicas
            hist = stock.history(period="1y")
            if hist.empty:
                return None
            
            # Calcula métricas básicas
            current_price = float(hist['Close'].iloc[-1])
            returns_12m = float((current_price / hist['Close'].iloc[0] - 1) * 100) if len(hist) > 0 else None
            volatility_12m = float(hist['Close'].pct_change().std() * 100 * (252 ** 0.5)) if len(hist) > 10 else None
            
            # Volume médio 30 dias
            volume_avg_30d = int(hist['Volume'].tail(30).mean()) if len(hist) >= 30 else None
            
            return {
                'ticker': ticker,
                'name': info.get('longName', ticker),
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'exchange': info.get('exchange', 'Unknown'),
                'current_price': current_price,
                'market_cap': info.get('marketCap'),
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
    
    def insert_asset_master(self, stock_data: Dict) -> Optional[int]:
        """Insere ação na tabela assets_master via MCP Supabase"""
        try:
            # Prepara dados para inserção
            insert_data = {
                'ticker': stock_data['ticker'],
                'asset_type': 'STOCK',
                'name': stock_data['name'],
                'exchange': stock_data['exchange'],
                'sector': stock_data['sector'],
                'industry': stock_data.get('industry'),
                'currency': 'USD'
            }
            
            # Converte para SQL INSERT
            columns = ', '.join(insert_data.keys())
            values = []
            for value in insert_data.values():
                if value is None:
                    values.append('NULL')
                elif isinstance(value, str):
                    # Escapa aspas simples
                    escaped_value = value.replace("'", "''")
                    values.append(f"'{escaped_value}'")
                else:
                    values.append(str(value))
            
            values_str = ', '.join(values)
            
            sql = f"""
            INSERT INTO assets_master ({columns})
            VALUES ({values_str})
            ON CONFLICT (ticker) DO UPDATE SET
                name = EXCLUDED.name,
                exchange = EXCLUDED.exchange,
                sector = EXCLUDED.sector,
                industry = EXCLUDED.industry,
                updated_at = now()
            RETURNING id;
            """
            
            print(f"📝 Inserindo asset: {stock_data['ticker']}")
            return self.execute_supabase_sql(sql)
            
        except Exception as e:
            print(f"❌ Erro ao inserir asset {stock_data['ticker']}: {e}")
            return None
    
    def insert_stock_metrics(self, asset_id: int, stock_data: Dict):
        """Insere métricas na tabela stock_metrics_snapshot"""
        try:
            # Prepara dados das métricas
            metrics_data = {
                'asset_id': asset_id,
                'snapshot_date': date.today().isoformat(),
                'current_price': stock_data.get('current_price'),
                'market_cap': stock_data.get('market_cap'),
                'shares_outstanding': stock_data.get('shares_outstanding'),
                'volume_avg_30d': stock_data.get('volume_avg_30d'),
                'returns_12m': stock_data.get('returns_12m'),
                'volatility_12m': stock_data.get('volatility_12m'),
                'beta_12m': stock_data.get('beta_12m'),
                'dividend_yield_12m': stock_data.get('dividend_yield_12m'),
                'source_meta': json.dumps({
                    'source': 'yfinance',
                    'collected_at': stock_data['collected_at']
                })
            }
            
            # Remove valores None
            metrics_data = {k: v for k, v in metrics_data.items() if v is not None}
            
            # Converte para SQL
            columns = ', '.join(metrics_data.keys())
            values = []
            for value in metrics_data.values():
                if isinstance(value, str) and value != 'CURRENT_DATE':
                    values.append(f"'{value}'")
                else:
                    values.append(str(value))
            
            values_str = ', '.join(values)
            
            sql = f"""
            INSERT INTO stock_metrics_snapshot ({columns})
            VALUES ({values_str})
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
            
            print(f"📊 Inserindo métricas: {stock_data['ticker']}")
            return self.execute_supabase_sql(sql)
            
        except Exception as e:
            print(f"❌ Erro ao inserir métricas {stock_data['ticker']}: {e}")
            return None
    
    def insert_stock_fundamentals(self, asset_id: int, stock_data: Dict):
        """Insere fundamentais na tabela stock_fundamentals_quarterly"""
        try:
            if not stock_data.get('pe_ratio'):
                return  # Sem dados fundamentais
            
            fundamentals_data = {
                'asset_id': asset_id,
                'quarter_date': date.today().replace(day=1).isoformat(),  # Primeiro dia do mês atual
                'pe_ratio': stock_data.get('pe_ratio'),
                'source_meta': json.dumps({
                    'source': 'yfinance_info',
                    'collected_at': stock_data['collected_at']
                })
            }
            
            # Remove valores None
            fundamentals_data = {k: v for k, v in fundamentals_data.items() if v is not None}
            
            # Converte para SQL
            columns = ', '.join(fundamentals_data.keys())
            values = []
            for value in fundamentals_data.values():
                if isinstance(value, str):
                    values.append(f"'{value}'")
                else:
                    values.append(str(value))
            
            values_str = ', '.join(values)
            
            sql = f"""
            INSERT INTO stock_fundamentals_quarterly ({columns})
            VALUES ({values_str})
            ON CONFLICT (asset_id, quarter_date) DO UPDATE SET
                pe_ratio = EXCLUDED.pe_ratio,
                source_meta = EXCLUDED.source_meta;
            """
            
            print(f"📈 Inserindo fundamentais: {stock_data['ticker']}")
            return self.execute_supabase_sql(sql)
            
        except Exception as e:
            print(f"❌ Erro ao inserir fundamentais {stock_data['ticker']}: {e}")
            return None
    
    def execute_supabase_sql(self, sql: str):
        """Executa SQL no Supabase via subprocess (simulando MCP)"""
        try:
            # Em uma implementação real, usaria MCP Supabase
            # Por enquanto, apenas simula a execução
            print(f"🔄 Executando SQL: {sql[:100]}...")
            
            # Simula sucesso (em implementação real, executaria via MCP)
            return True
            
        except Exception as e:
            print(f"❌ Erro ao executar SQL: {e}")
            return None
    
    def process_stock(self, stock_info: Dict) -> bool:
        """Processa uma ação completa"""
        try:
            ticker = stock_info['ticker']
            print(f"\\n🔄 Processando: {ticker}")
            
            # 1. Coleta dados via yfinance
            stock_data = self.get_stock_data_yfinance(ticker)
            if not stock_data:
                print(f"❌ Falhou ao coletar dados: {ticker}")
                return False
            
            # Adiciona informações do CSV
            stock_data.update(stock_info)
            
            # 2. Insere na assets_master
            asset_id = self.insert_asset_master(stock_data)
            if not asset_id:
                print(f"❌ Falhou ao inserir asset: {ticker}")
                return False
            
            # Simula asset_id para teste
            asset_id = 1  # Em implementação real, viria do retorno da inserção
            
            # 3. Insere métricas
            self.insert_stock_metrics(asset_id, stock_data)
            
            # 4. Insere fundamentais (se disponível)
            self.insert_stock_fundamentals(asset_id, stock_data)
            
            print(f"✅ Processado com sucesso: {ticker}")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao processar {stock_info['ticker']}: {e}")
            return False
    
    def run_etl_pipeline(self):
        """Executa o pipeline ETL completo"""
        print("🚀 Iniciando ETL Pipeline - Ações para Supabase")
        print("=" * 60)
        
        try:
            # 1. Carrega lista de ações
            stocks_list = self.load_stocks_from_csv()
            if not stocks_list:
                print("❌ Nenhuma ação carregada do CSV")
                return
            
            total_stocks = len(stocks_list)
            print(f"📊 Total de ações para processar: {total_stocks}")
            
            # 2. Processa cada ação
            for i, stock_info in enumerate(stocks_list, 1):
                print(f"\\n📦 [{i}/{total_stocks}] Processando lote...")
                
                if self.process_stock(stock_info):
                    self.processed_count += 1
                else:
                    self.failed_count += 1
                
                # Pausa entre ações para evitar rate limiting
                time.sleep(1)
                
                # Pausa maior a cada 10 ações
                if i % 10 == 0:
                    print(f"⏸️ Pausa de 5 segundos... ({i}/{total_stocks} processadas)")
                    time.sleep(5)
            
            # 3. Relatório final
            success_rate = (self.processed_count / total_stocks) * 100
            print("\\n" + "=" * 60)
            print("🎉 ETL Pipeline Concluído!")
            print(f"📈 Estatísticas finais:")
            print(f"   • Processadas com sucesso: {self.processed_count}")
            print(f"   • Falharam: {self.failed_count}")
            print(f"   • Taxa de sucesso: {success_rate:.1f}%")
            
            # 4. Próximos passos
            print("\\n🔄 Próximos passos:")
            print("   1. Implementar inserção real via MCP Supabase")
            print("   2. Criar Materialized View refresh")
            print("   3. Executar validação via Perplexity AI")
            
        except Exception as e:
            print(f"💥 Erro crítico no pipeline: {e}")
            raise

if __name__ == "__main__":
    # Executa o pipeline
    pipeline = StocksSupabaseETL()
    pipeline.run_etl_pipeline()


