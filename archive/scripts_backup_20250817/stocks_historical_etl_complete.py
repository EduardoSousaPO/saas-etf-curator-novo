#!/usr/bin/env python3
"""
PIPELINE ETL COMPLETO - AÇÕES AMERICANAS COM DADOS HISTÓRICOS
Coleta preços históricos 10 anos + cálculo de todas as 18 métricas essenciais
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import sys
import warnings
from typing import Dict, List, Optional, Tuple
import time

warnings.filterwarnings('ignore')

class StocksHistoricalETL:
    """Pipeline ETL completo para ações com dados históricos e métricas avançadas"""
    
    def __init__(self):
        self.risk_free_rate = 0.045  # Taxa livre de risco 4.5% (Treasury 10Y)
        self.trading_days_year = 252
        
        # Ações de teste (expandir depois para 2.460)
        self.test_symbols = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'NVDA', 'META', 'BRK-B', 'JNJ', 'JPM']
        
        # Períodos para cálculo
        self.periods = {
            '12m': 252,    # 1 ano
            '24m': 504,    # 2 anos  
            '36m': 756,    # 3 anos
            '5y': 1260,    # 5 anos
            '10y': 2520    # 10 anos
        }
        
        self.results = {
            'assets_master': [],
            'stock_prices_daily': [],
            'stock_metrics_snapshot': [],
            'success_count': 0,
            'error_count': 0,
            'errors': []
        }
    
    def fetch_stock_info(self, symbol: str) -> Dict:
        """Coleta informações básicas da ação"""
        try:
            stock = yf.Ticker(symbol)
            info = stock.info
            
            return {
                'ticker': symbol,
                'asset_type': 'STOCK',
                'name': info.get('longName', info.get('shortName', symbol)),
                'exchange': info.get('exchange', 'NASDAQ'),
                'sector': info.get('sector'),
                'industry': info.get('industry'),
                'currency': info.get('currency', 'USD'),
                'business_description': info.get('longBusinessSummary'),
                'website': info.get('website'),
                'headquarters': f"{info.get('city', '')}, {info.get('state', '')}, {info.get('country', '')}".strip(', '),
                'employees_count': info.get('fullTimeEmployees'),
                'ceo_name': None,  # Não disponível via yfinance
                'market_cap': info.get('marketCap'),
                'shares_outstanding': info.get('sharesOutstanding'),
                'float_shares': info.get('floatShares')
            }
        except Exception as e:
            print(f"❌ Erro ao buscar info de {symbol}: {e}")
            return {
                'ticker': symbol,
                'asset_type': 'STOCK',
                'name': symbol,
                'exchange': 'NASDAQ',
                'sector': None,
                'industry': None,
                'currency': 'USD'
            }
    
    def fetch_historical_data(self, symbol: str, period: str = "10y") -> Optional[pd.DataFrame]:
        """Coleta dados históricos da ação"""
        try:
            stock = yf.Ticker(symbol)
            hist = stock.history(period=period, auto_adjust=True)
            
            if hist.empty:
                print(f"⚠️ Sem dados históricos para {symbol}")
                return None
                
            # Limpar dados
            hist = hist.dropna()
            hist.index = hist.index.date  # Converter para date apenas
            
            print(f"✅ {symbol}: {len(hist)} dias de dados históricos coletados")
            return hist
            
        except Exception as e:
            print(f"❌ Erro ao buscar histórico de {symbol}: {e}")
            return None
    
    def calculate_returns(self, prices: pd.Series, periods: Dict[str, int]) -> Dict[str, float]:
        """Calcula retornos para diferentes períodos"""
        returns = {}
        
        for period_name, days in periods.items():
            try:
                if len(prices) >= days:
                    start_price = prices.iloc[-days]
                    end_price = prices.iloc[-1]
                    period_return = (end_price / start_price) - 1
                    returns[f'returns_{period_name}'] = round(period_return, 6)
                else:
                    returns[f'returns_{period_name}'] = None
            except:
                returns[f'returns_{period_name}'] = None
                
        return returns
    
    def calculate_volatility(self, prices: pd.Series, periods: Dict[str, int]) -> Dict[str, float]:
        """Calcula volatilidade anualizada para diferentes períodos"""
        volatilities = {}
        
        # Calcular retornos diários
        daily_returns = prices.pct_change().dropna()
        
        for period_name, days in periods.items():
            try:
                if len(daily_returns) >= days:
                    period_returns = daily_returns.tail(days)
                    volatility = period_returns.std() * np.sqrt(self.trading_days_year)
                    volatilities[f'volatility_{period_name}'] = round(volatility, 6)
                else:
                    volatilities[f'volatility_{period_name}'] = None
            except:
                volatilities[f'volatility_{period_name}'] = None
                
        return volatilities
    
    def calculate_sharpe_ratios(self, prices: pd.Series, periods: Dict[str, int]) -> Dict[str, float]:
        """Calcula Sharpe Ratio para diferentes períodos"""
        sharpe_ratios = {}
        daily_returns = prices.pct_change().dropna()
        
        for period_name, days in periods.items():
            try:
                if len(daily_returns) >= days:
                    period_returns = daily_returns.tail(days)
                    
                    # Retorno anualizado
                    annualized_return = (1 + period_returns.mean()) ** self.trading_days_year - 1
                    
                    # Volatilidade anualizada
                    annualized_volatility = period_returns.std() * np.sqrt(self.trading_days_year)
                    
                    # Sharpe Ratio
                    if annualized_volatility > 0:
                        sharpe = (annualized_return - self.risk_free_rate) / annualized_volatility
                        sharpe_ratios[f'sharpe_{period_name}'] = round(sharpe, 4)
                    else:
                        sharpe_ratios[f'sharpe_{period_name}'] = None
                else:
                    sharpe_ratios[f'sharpe_{period_name}'] = None
            except:
                sharpe_ratios[f'sharpe_{period_name}'] = None
                
        return sharpe_ratios
    
    def calculate_max_drawdown(self, prices: pd.Series) -> float:
        """Calcula Maximum Drawdown"""
        try:
            # Calcular peak running maximum
            peak = prices.expanding(min_periods=1).max()
            
            # Calcular drawdown
            drawdown = (prices - peak) / peak
            
            # Maximum drawdown (mais negativo)
            max_dd = drawdown.min()
            
            return round(max_dd, 6)
        except:
            return None
    
    def fetch_dividend_data(self, symbol: str) -> Dict[str, float]:
        """Coleta dados de dividendos"""
        try:
            stock = yf.Ticker(symbol)
            dividends = stock.dividends
            
            if dividends.empty:
                return {
                    'dividends_12m': 0.0,
                    'dividends_24m': 0.0,
                    'dividends_36m': 0.0,
                    'dividends_all_time': 0.0,
                    'dividend_yield_12m': 0.0
                }
            
            # Filtrar por períodos
            now = datetime.now()
            
            # Últimos 12 meses
            div_12m = dividends[dividends.index >= (now - timedelta(days=365))].sum()
            
            # Últimos 24 meses  
            div_24m = dividends[dividends.index >= (now - timedelta(days=730))].sum()
            
            # Últimos 36 meses
            div_36m = dividends[dividends.index >= (now - timedelta(days=1095))].sum()
            
            # Todos os tempos
            div_all_time = dividends.sum()
            
            return {
                'dividends_12m': round(div_12m, 4),
                'dividends_24m': round(div_24m, 4),
                'dividends_36m': round(div_36m, 4),
                'dividends_all_time': round(div_all_time, 4)
            }
            
        except Exception as e:
            print(f"⚠️ Erro ao buscar dividendos de {symbol}: {e}")
            return {
                'dividends_12m': 0.0,
                'dividends_24m': 0.0,
                'dividends_36m': 0.0,
                'dividends_all_time': 0.0
            }
    
    def calculate_dividend_yield(self, dividends_12m: float, current_price: float) -> float:
        """Calcula dividend yield"""
        try:
            if current_price > 0:
                return round((dividends_12m / current_price), 6)
            return 0.0
        except:
            return 0.0
    
    def process_stock(self, symbol: str) -> bool:
        """Processa uma ação completa com todos os dados e métricas"""
        try:
            print(f"\n🔄 Processando {symbol}...")
            
            # 1. Buscar informações básicas
            stock_info = self.fetch_stock_info(symbol)
            asset_id = len(self.results['assets_master']) + 1
            stock_info['id'] = asset_id
            
            # 2. Buscar dados históricos
            historical_data = self.fetch_historical_data(symbol)
            if historical_data is None or historical_data.empty:
                print(f"❌ Sem dados históricos para {symbol}")
                self.results['error_count'] += 1
                return False
            
            # 3. Preparar dados de preços para inserção
            for date, row in historical_data.iterrows():
                price_record = {
                    'asset_id': asset_id,
                    'date': str(date),
                    'open': round(float(row['Open']), 4),
                    'high': round(float(row['High']), 4),
                    'low': round(float(row['Low']), 4),
                    'close': round(float(row['Close']), 4),
                    'adj_close': round(float(row['Close']), 4),  # yfinance já ajusta
                    'volume': int(row['Volume']) if not pd.isna(row['Volume']) else 0
                }
                self.results['stock_prices_daily'].append(price_record)
            
            # 4. Calcular métricas
            prices = historical_data['Close']
            current_price = float(prices.iloc[-1])
            
            # Retornos
            returns = self.calculate_returns(prices, self.periods)
            
            # Volatilidades  
            volatilities = self.calculate_volatility(prices, self.periods)
            
            # Sharpe Ratios
            sharpe_ratios = self.calculate_sharpe_ratios(prices, self.periods)
            
            # Maximum Drawdown
            max_drawdown = self.calculate_max_drawdown(prices)
            
            # Dividendos
            dividend_data = self.fetch_dividend_data(symbol)
            dividend_yield = self.calculate_dividend_yield(dividend_data['dividends_12m'], current_price)
            
            # Volume médio 30 dias
            volume_30d = int(historical_data['Volume'].tail(30).mean()) if len(historical_data) >= 30 else None
            
            # 5. Montar registro de métricas
            metrics_record = {
                'asset_id': asset_id,
                'snapshot_date': str(datetime.now().date()),
                'current_price': round(current_price, 4),
                'market_cap': stock_info.get('market_cap'),
                'shares_outstanding': stock_info.get('shares_outstanding'),
                'float_shares': stock_info.get('float_shares'),
                'volume_avg_30d': volume_30d,
                
                # Retornos (18 métricas essenciais)
                **returns,
                **volatilities, 
                **sharpe_ratios,
                'max_drawdown': max_drawdown,
                **dividend_data,
                'dividend_yield_12m': dividend_yield,
                
                # Metadados
                'quality_score': 85,  # Score padrão, pode ser melhorado
                'size_category': 'Large Cap' if stock_info.get('market_cap', 0) > 10e9 else 'Mid Cap',
                'liquidity_category': 'High' if volume_30d and volume_30d > 1e6 else 'Medium',
                'source_meta': json.dumps({
                    'data_source': 'yfinance',
                    'collection_date': datetime.now().isoformat(),
                    'historical_days': len(historical_data),
                    'pipeline_version': '1.0'
                }),
                'calculated_at': datetime.now().isoformat()
            }
            
            # 6. Armazenar resultados
            self.results['assets_master'].append(stock_info)
            self.results['stock_metrics_snapshot'].append(metrics_record)
            self.results['success_count'] += 1
            
            print(f"✅ {symbol} processado: {len(historical_data)} dias, preço ${current_price:.2f}")
            return True
            
        except Exception as e:
            error_msg = f"Erro ao processar {symbol}: {str(e)}"
            print(f"❌ {error_msg}")
            self.results['errors'].append(error_msg)
            self.results['error_count'] += 1
            return False
    
    def generate_sql_inserts(self) -> str:
        """Gera comandos SQL para inserção no Supabase"""
        sql_commands = []
        
        # 1. Assets Master
        sql_commands.append("-- INSERÇÃO EM ASSETS_MASTER")
        for asset in self.results['assets_master']:
            values = []
            for field in ['ticker', 'asset_type', 'name', 'exchange', 'sector', 'industry', 'currency', 
                         'business_description', 'website', 'headquarters', 'employees_count', 'ceo_name']:
                value = asset.get(field)
                if value is None:
                    values.append('NULL')
                elif isinstance(value, str):
                    # Escapar aspas simples
                    escaped_value = value.replace("'", "''")
                    values.append(f"'{escaped_value}'")
                else:
                    values.append(str(value))
            
            sql = f"""INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description, website, headquarters, employees_count, ceo_name) 
VALUES ({', '.join(values)});"""
            sql_commands.append(sql)
        
        # 2. Stock Prices Daily (amostra - primeiros 100 registros por ação)
        sql_commands.append("\n-- INSERÇÃO EM STOCK_PRICES_DAILY (AMOSTRA)")
        sql_commands.append("-- Nota: Para produção, usar COPY ou bulk insert para ~25k registros")
        
        # Agrupar por asset_id e pegar amostra
        prices_sample = {}
        for price in self.results['stock_prices_daily']:
            asset_id = price['asset_id']
            if asset_id not in prices_sample:
                prices_sample[asset_id] = []
            if len(prices_sample[asset_id]) < 10:  # Apenas 10 registros por ação para exemplo
                prices_sample[asset_id].append(price)
        
        for asset_id, prices in prices_sample.items():
            for price in prices:
                sql = f"""INSERT INTO stock_prices_daily (asset_id, date, open, high, low, close, adj_close, volume) 
VALUES ({price['asset_id']}, '{price['date']}', {price['open']}, {price['high']}, {price['low']}, {price['close']}, {price['adj_close']}, {price['volume']});"""
                sql_commands.append(sql)
        
        # 3. Stock Metrics Snapshot  
        sql_commands.append("\n-- INSERÇÃO EM STOCK_METRICS_SNAPSHOT")
        for metrics in self.results['stock_metrics_snapshot']:
            # Preparar valores com tratamento de NULL
            values = []
            fields = ['asset_id', 'snapshot_date', 'current_price', 'market_cap', 'shares_outstanding', 
                     'float_shares', 'volume_avg_30d', 'returns_12m', 'returns_24m', 'returns_36m', 
                     'returns_5y', 'ten_year_return', 'volatility_12m', 'volatility_24m', 'volatility_36m',
                     'ten_year_volatility', 'sharpe_12m', 'sharpe_24m', 'sharpe_36m', 'ten_year_sharpe',
                     'max_drawdown', 'dividends_12m', 'dividends_24m', 'dividends_36m', 'dividends_all_time',
                     'dividend_yield_12m', 'quality_score', 'size_category', 'liquidity_category', 
                     'source_meta', 'calculated_at']
            
            for field in fields:
                value = metrics.get(field)
                if value is None:
                    values.append('NULL')
                elif isinstance(value, str):
                    escaped_value = value.replace("'", "''")
                    values.append(f"'{escaped_value}'")
                else:
                    values.append(str(value))
            
            sql = f"""INSERT INTO stock_metrics_snapshot ({', '.join(fields)}) 
VALUES ({', '.join(values)});"""
            sql_commands.append(sql)
        
        # 4. Refresh Materialized View
        sql_commands.append("\n-- ATUALIZAR MATERIALIZED VIEW")
        sql_commands.append("REFRESH MATERIALIZED VIEW stocks_ativos_reais;")
        
        return '\n'.join(sql_commands)
    
    def run_pipeline(self):
        """Executa pipeline completo"""
        print("🚀 INICIANDO PIPELINE ETL HISTÓRICO - AÇÕES AMERICANAS")
        print("=" * 60)
        
        start_time = time.time()
        
        for symbol in self.test_symbols:
            self.process_stock(symbol)
            time.sleep(1)  # Rate limiting
        
        end_time = time.time()
        duration = end_time - start_time
        
        print("\n" + "=" * 60)
        print("📊 RESULTADOS DO PIPELINE:")
        print(f"✅ Sucessos: {self.results['success_count']}")
        print(f"❌ Erros: {self.results['error_count']}")
        print(f"📈 Registros de preços: {len(self.results['stock_prices_daily'])}")
        print(f"⏱️ Tempo total: {duration:.1f}s")
        
        if self.results['errors']:
            print("\n🚨 Erros encontrados:")
            for error in self.results['errors']:
                print(f"  • {error}")
        
        # Gerar SQL
        sql_output = self.generate_sql_inserts()
        
        # Salvar em arquivo
        with open('stocks_historical_inserts.sql', 'w', encoding='utf-8') as f:
            f.write(sql_output)
        
        print(f"\n💾 Comandos SQL salvos em: stocks_historical_inserts.sql")
        
        return self.results

if __name__ == "__main__":
    etl = StocksHistoricalETL()
    results = etl.run_pipeline()
    
    print("\n🎉 PIPELINE CONCLUÍDO!")
    print(f"Dados prontos para inserção no Supabase.")




