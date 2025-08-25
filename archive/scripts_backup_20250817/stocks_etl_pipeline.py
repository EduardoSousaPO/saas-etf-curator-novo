#!/usr/bin/env python3
"""
ETL Pipeline para Módulo de Ações Americanas - Vista
Coleta dados das 2.000 ações via yfinance e popula tabelas normalizadas

Fontes: yfinance (dados históricos/fundamentais)
Destino: Supabase (schema normalizado)
MCPs: Utilizará MCP Supabase para inserção dos dados
"""

import pandas as pd
import yfinance as yf
import numpy as np
from datetime import datetime, timedelta
import json
import time
import logging
from typing import Dict, List, Optional, Tuple
import sys
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import warnings
warnings.filterwarnings('ignore')

# Configuração de logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('stocks_etl_pipeline.log'),
        logging.StreamHandler(sys.stdout)
    ]
)
logger = logging.getLogger(__name__)

class StocksETLPipeline:
    """Pipeline ETL para processamento de ações americanas"""
    
    def __init__(self):
        self.csv_file = "top_us_stocks_2025-07-29.csv"
        self.processed_count = 0
        self.failed_count = 0
        self.batch_size = 50  # Processar em lotes de 50
        self.max_workers = 5   # Threads paralelas
        
        # Configurações de coleta
        self.period_10y = "10y"
        self.period_5y = "5y" 
        self.period_3y = "3y"
        self.period_2y = "2y"
        self.period_1y = "1y"
        
    def load_stocks_from_csv(self) -> pd.DataFrame:
        """Carrega lista de ações do arquivo CSV"""
        try:
            logger.info(f"Carregando ações do arquivo: {self.csv_file}")
            
            # Lê o CSV com separador correto
            df = pd.read_csv(self.csv_file, sep=';', encoding='utf-8')
            
            # Limpa dados inválidos
            df = df[df['ticker'] != '#CAMPO!'].copy()
            df = df.dropna(subset=['ticker']).copy()
            
            # Extrai informações básicas
            df['clean_ticker'] = df['ticker'].str.strip()
            df['company_name'] = df['symbol'].str.extract(r'^([^(]+)')[0].str.strip()
            df['exchange'] = df['symbol'].str.extract(r'\(([^:]+):')[0].str.strip()
            df['sector_clean'] = df['Setor'].str.strip() if 'Setor' in df.columns else 'Unknown'
            
            # Remove tickers inválidos
            df = df[df['clean_ticker'].str.len() <= 5].copy()  # Tickers muito longos são inválidos
            df = df[~df['clean_ticker'].str.contains(r'[^A-Z]', na=False)].copy()  # Apenas letras
            
            logger.info(f"Carregadas {len(df)} ações válidas do CSV")
            return df[['clean_ticker', 'company_name', 'exchange', 'sector_clean']].head(2000)
            
        except Exception as e:
            logger.error(f"Erro ao carregar CSV: {e}")
            raise
    
    def get_stock_data_yfinance(self, ticker: str) -> Optional[Dict]:
        """Coleta dados de uma ação via yfinance"""
        try:
            stock = yf.Ticker(ticker)
            
            # Coleta dados históricos (10 anos)
            hist_10y = stock.history(period=self.period_10y, auto_adjust=True)
            if hist_10y.empty:
                logger.warning(f"Sem dados históricos para {ticker}")
                return None
            
            # Dados básicos da empresa
            info = stock.info
            if not info or 'symbol' not in info:
                logger.warning(f"Sem informações básicas para {ticker}")
                return None
            
            # Calcula métricas derivadas
            metrics = self.calculate_stock_metrics(hist_10y, info)
            
            # Dados fundamentalistas básicos
            fundamentals = self.extract_fundamentals(info)
            
            return {
                'ticker': ticker,
                'info': info,
                'historical': hist_10y,
                'metrics': metrics,
                'fundamentals': fundamentals,
                'collected_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Erro ao coletar dados para {ticker}: {e}")
            return None
    
    def calculate_stock_metrics(self, hist_data: pd.DataFrame, info: Dict) -> Dict:
        """Calcula métricas derivadas dos dados históricos"""
        try:
            if hist_data.empty:
                return {}
            
            # Preços de fechamento ajustados
            prices = hist_data['Close']
            
            # Returns de diferentes períodos
            returns_1d = self.calculate_return(prices, days=1)
            returns_1w = self.calculate_return(prices, days=7)
            returns_1m = self.calculate_return(prices, days=30)
            returns_3m = self.calculate_return(prices, days=90)
            returns_6m = self.calculate_return(prices, days=180)
            returns_12m = self.calculate_return(prices, days=252)
            returns_24m = self.calculate_return(prices, days=504)
            returns_36m = self.calculate_return(prices, days=756)
            returns_5y = self.calculate_return(prices, days=1260)
            returns_10y = self.calculate_return(prices, days=2520)
            
            # Volatilidade
            volatility_12m = self.calculate_volatility(prices, days=252)
            volatility_24m = self.calculate_volatility(prices, days=504)
            volatility_36m = self.calculate_volatility(prices, days=756)
            volatility_10y = self.calculate_volatility(prices, days=2520)
            
            # Sharpe Ratio (assumindo risk-free rate de 4%)
            risk_free_rate = 0.04
            sharpe_12m = self.calculate_sharpe(returns_12m, volatility_12m, risk_free_rate)
            sharpe_24m = self.calculate_sharpe(returns_24m, volatility_24m, risk_free_rate)
            sharpe_36m = self.calculate_sharpe(returns_36m, volatility_36m, risk_free_rate)
            sharpe_10y = self.calculate_sharpe(returns_10y, volatility_10y, risk_free_rate)
            
            # Max Drawdown
            max_drawdown = self.calculate_max_drawdown(prices)
            
            # Beta (vs SPY como proxy do mercado)
            beta_12m = self.calculate_beta(prices)
            
            # Métricas técnicas
            rsi_14d = self.calculate_rsi(prices, period=14)
            ma_50d = self.calculate_moving_average(prices, period=50)
            ma_200d = self.calculate_moving_average(prices, period=200)
            
            current_price = float(prices.iloc[-1]) if len(prices) > 0 else None
            price_to_ma50 = (current_price / ma_50d) if current_price and ma_50d else None
            price_to_ma200 = (current_price / ma_200d) if current_price and ma_200d else None
            
            # Volume médio 30 dias
            volume_avg_30d = int(hist_data['Volume'].tail(30).mean()) if len(hist_data) >= 30 else None
            
            # Categorização por market cap
            market_cap = info.get('marketCap', 0)
            size_category = self.categorize_by_size(market_cap)
            
            # Categorização por liquidez
            liquidity_category = self.categorize_by_liquidity(volume_avg_30d, current_price)
            
            # Quality Score básico (0-100)
            quality_score = self.calculate_quality_score(info, returns_12m, volatility_12m, max_drawdown)
            
            return {
                'current_price': current_price,
                'market_cap': market_cap,
                'shares_outstanding': info.get('sharesOutstanding'),
                'float_shares': info.get('floatShares'),
                'volume_avg_30d': volume_avg_30d,
                
                # Returns
                'returns_1d': returns_1d,
                'returns_1w': returns_1w,
                'returns_1m': returns_1m,
                'returns_3m': returns_3m,
                'returns_6m': returns_6m,
                'returns_12m': returns_12m,
                'returns_24m': returns_24m,
                'returns_36m': returns_36m,
                'returns_5y': returns_5y,
                'ten_year_return': returns_10y,
                
                # Volatilidade
                'volatility_12m': volatility_12m,
                'volatility_24m': volatility_24m,
                'volatility_36m': volatility_36m,
                'ten_year_volatility': volatility_10y,
                
                # Sharpe
                'sharpe_12m': sharpe_12m,
                'sharpe_24m': sharpe_24m,
                'sharpe_36m': sharpe_36m,
                'ten_year_sharpe': sharpe_10y,
                
                # Risco
                'max_drawdown': max_drawdown,
                'beta_12m': beta_12m,
                
                # Dividendos
                'dividend_yield_12m': info.get('dividendYield'),
                'dividend_yield_ttm': info.get('trailingAnnualDividendYield'),
                'dividends_12m': info.get('dividendRate'),
                
                # Técnicas
                'rsi_14d': rsi_14d,
                'ma_50d': ma_50d,
                'ma_200d': ma_200d,
                'price_to_ma50': price_to_ma50,
                'price_to_ma200': price_to_ma200,
                
                # Categorização
                'size_category': size_category,
                'liquidity_category': liquidity_category,
                'quality_score': quality_score,
                
                # Auditoria
                'source_meta': {
                    'source': 'yfinance',
                    'collected_at': datetime.now().isoformat(),
                    'data_points': len(hist_data),
                    'period_covered': f"{hist_data.index[0].date()} to {hist_data.index[-1].date()}"
                }
            }
            
        except Exception as e:
            logger.error(f"Erro ao calcular métricas: {e}")
            return {}
    
    def extract_fundamentals(self, info: Dict) -> Dict:
        """Extrai dados fundamentalistas básicos"""
        try:
            return {
                'pe_ratio': info.get('trailingPE'),
                'peg_ratio': info.get('pegRatio'),
                'pb_ratio': info.get('priceToBook'),
                'ps_ratio': info.get('priceToSalesTrailing12Months'),
                'ev_ebitda': info.get('enterpriseToEbitda'),
                
                # Profitabilidade
                'roe': info.get('returnOnEquity'),
                'roa': info.get('returnOnAssets'),
                'gross_margin': info.get('grossMargins'),
                'operating_margin': info.get('operatingMargins'),
                'net_margin': info.get('profitMargins'),
                
                # Saúde financeira
                'debt_to_equity': info.get('debtToEquity'),
                'current_ratio': info.get('currentRatio'),
                'quick_ratio': info.get('quickRatio'),
                
                # Crescimento
                'revenue_growth_yoy': info.get('revenueGrowth'),
                'earnings_growth_yoy': info.get('earningsGrowth'),
                
                # Dados brutos
                'revenue': info.get('totalRevenue'),
                'net_income': info.get('netIncomeToCommon'),
                'total_debt': info.get('totalDebt'),
                'cash_and_equivalents': info.get('totalCash'),
                
                # Auditoria
                'source_meta': {
                    'source': 'yfinance_info',
                    'collected_at': datetime.now().isoformat()
                }
            }
        except Exception as e:
            logger.error(f"Erro ao extrair fundamentais: {e}")
            return {}
    
    def calculate_return(self, prices: pd.Series, days: int) -> Optional[float]:
        """Calcula retorno para um período específico"""
        try:
            if len(prices) < days:
                return None
            
            start_price = prices.iloc[-days]
            end_price = prices.iloc[-1]
            
            if start_price <= 0:
                return None
                
            return float((end_price / start_price - 1) * 100)
        except:
            return None
    
    def calculate_volatility(self, prices: pd.Series, days: int) -> Optional[float]:
        """Calcula volatilidade anualizada"""
        try:
            if len(prices) < days:
                return None
            
            returns = prices.tail(days).pct_change().dropna()
            if len(returns) < 10:
                return None
                
            return float(returns.std() * np.sqrt(252) * 100)  # Anualizada
        except:
            return None
    
    def calculate_sharpe(self, annual_return: Optional[float], volatility: Optional[float], 
                        risk_free_rate: float) -> Optional[float]:
        """Calcula Sharpe Ratio"""
        try:
            if annual_return is None or volatility is None or volatility == 0:
                return None
            
            excess_return = annual_return - (risk_free_rate * 100)
            return float(excess_return / volatility)
        except:
            return None
    
    def calculate_max_drawdown(self, prices: pd.Series) -> Optional[float]:
        """Calcula Maximum Drawdown"""
        try:
            if len(prices) < 10:
                return None
            
            peak = prices.expanding().max()
            drawdown = (prices - peak) / peak
            return float(drawdown.min() * 100)
        except:
            return None
    
    def calculate_beta(self, prices: pd.Series) -> Optional[float]:
        """Calcula Beta vs mercado (aproximação simples)"""
        try:
            if len(prices) < 252:
                return None
            
            # Simplificação: assumir beta médio de 1.0 para ações
            # Em implementação real, compararia com SPY
            returns = prices.tail(252).pct_change().dropna()
            if len(returns) < 100:
                return 1.0
            
            # Beta aproximado baseado na volatilidade relativa
            vol_stock = returns.std()
            vol_market = 0.15 / np.sqrt(252)  # Volatilidade típica do mercado
            
            return float(min(max(vol_stock / vol_market, 0.1), 3.0))  # Limita entre 0.1 e 3.0
        except:
            return 1.0
    
    def calculate_rsi(self, prices: pd.Series, period: int = 14) -> Optional[float]:
        """Calcula RSI (Relative Strength Index)"""
        try:
            if len(prices) < period + 1:
                return None
            
            delta = prices.diff()
            gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
            loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
            
            rs = gain / loss
            rsi = 100 - (100 / (1 + rs))
            
            return float(rsi.iloc[-1]) if not pd.isna(rsi.iloc[-1]) else None
        except:
            return None
    
    def calculate_moving_average(self, prices: pd.Series, period: int) -> Optional[float]:
        """Calcula média móvel"""
        try:
            if len(prices) < period:
                return None
            
            ma = prices.tail(period).mean()
            return float(ma) if not pd.isna(ma) else None
        except:
            return None
    
    def categorize_by_size(self, market_cap: Optional[int]) -> str:
        """Categoriza por tamanho de market cap"""
        if not market_cap:
            return "Unknown"
        
        if market_cap >= 200_000_000_000:  # $200B+
            return "Mega Cap"
        elif market_cap >= 10_000_000_000:  # $10B+
            return "Large Cap"
        elif market_cap >= 2_000_000_000:   # $2B+
            return "Mid Cap"
        elif market_cap >= 300_000_000:     # $300M+
            return "Small Cap"
        else:
            return "Micro Cap"
    
    def categorize_by_liquidity(self, volume_avg_30d: Optional[int], price: Optional[float]) -> str:
        """Categoriza por liquidez"""
        if not volume_avg_30d or not price:
            return "Unknown"
        
        dollar_volume = volume_avg_30d * price
        
        if dollar_volume >= 100_000_000:  # $100M+ daily
            return "High"
        elif dollar_volume >= 10_000_000:  # $10M+ daily
            return "Medium"
        elif dollar_volume >= 1_000_000:   # $1M+ daily
            return "Low"
        else:
            return "Very Low"
    
    def calculate_quality_score(self, info: Dict, returns_12m: Optional[float], 
                               volatility_12m: Optional[float], max_drawdown: Optional[float]) -> int:
        """Calcula score de qualidade (0-100)"""
        try:
            score = 50  # Base score
            
            # Profitabilidade (+/- 20 pontos)
            roe = info.get('returnOnEquity', 0)
            if roe and roe > 0.15:
                score += 15
            elif roe and roe > 0.10:
                score += 10
            elif roe and roe > 0.05:
                score += 5
            elif roe and roe < 0:
                score -= 15
            
            # Crescimento (+/- 15 pontos)
            revenue_growth = info.get('revenueGrowth', 0)
            if revenue_growth and revenue_growth > 0.20:
                score += 15
            elif revenue_growth and revenue_growth > 0.10:
                score += 10
            elif revenue_growth and revenue_growth > 0.05:
                score += 5
            elif revenue_growth and revenue_growth < -0.10:
                score -= 15
            
            # Saúde financeira (+/- 10 pontos)
            debt_to_equity = info.get('debtToEquity', 0)
            if debt_to_equity and debt_to_equity < 0.3:
                score += 10
            elif debt_to_equity and debt_to_equity < 0.6:
                score += 5
            elif debt_to_equity and debt_to_equity > 2.0:
                score -= 10
            
            # Performance ajustada ao risco (+/- 10 pontos)
            if returns_12m and volatility_12m:
                sharpe = returns_12m / volatility_12m if volatility_12m > 0 else 0
                if sharpe > 1.0:
                    score += 10
                elif sharpe > 0.5:
                    score += 5
                elif sharpe < -0.5:
                    score -= 10
            
            # Max drawdown (-5 pontos se muito alto)
            if max_drawdown and max_drawdown < -50:
                score -= 5
            
            return max(0, min(100, int(score)))
        except:
            return 50
    
    def process_stock_batch(self, stocks_batch: List[Dict]) -> List[Dict]:
        """Processa um lote de ações"""
        results = []
        
        with ThreadPoolExecutor(max_workers=self.max_workers) as executor:
            # Submete tarefas
            future_to_stock = {
                executor.submit(self.get_stock_data_yfinance, stock['clean_ticker']): stock 
                for stock in stocks_batch
            }
            
            # Coleta resultados
            for future in as_completed(future_to_stock):
                stock_info = future_to_stock[future]
                try:
                    stock_data = future.result()
                    if stock_data:
                        # Adiciona informações do CSV
                        stock_data['csv_info'] = stock_info
                        results.append(stock_data)
                        self.processed_count += 1
                        logger.info(f"✅ Processado: {stock_data['ticker']} ({self.processed_count})")
                    else:
                        self.failed_count += 1
                        logger.warning(f"❌ Falhou: {stock_info['clean_ticker']} ({self.failed_count})")
                        
                except Exception as e:
                    self.failed_count += 1
                    logger.error(f"❌ Erro ao processar {stock_info['clean_ticker']}: {e}")
                
                # Pausa para evitar rate limiting
                time.sleep(0.1)
        
        return results
    
    def save_to_json(self, data: List[Dict], filename: str):
        """Salva dados processados em JSON para backup"""
        try:
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, default=str, ensure_ascii=False)
            logger.info(f"Dados salvos em: {filename}")
        except Exception as e:
            logger.error(f"Erro ao salvar JSON: {e}")
    
    def run_etl_pipeline(self):
        """Executa o pipeline ETL completo"""
        logger.info("🚀 Iniciando ETL Pipeline para Ações Americanas")
        
        try:
            # 1. Carrega lista de ações
            stocks_df = self.load_stocks_from_csv()
            total_stocks = len(stocks_df)
            logger.info(f"📊 Total de ações para processar: {total_stocks}")
            
            # 2. Converte para lista de dicionários
            stocks_list = stocks_df.to_dict('records')
            
            # 3. Processa em lotes
            all_processed_data = []
            
            for i in range(0, len(stocks_list), self.batch_size):
                batch = stocks_list[i:i + self.batch_size]
                batch_num = (i // self.batch_size) + 1
                total_batches = (total_stocks + self.batch_size - 1) // self.batch_size
                
                logger.info(f"📦 Processando lote {batch_num}/{total_batches} ({len(batch)} ações)")
                
                # Processa lote
                batch_results = self.process_stock_batch(batch)
                all_processed_data.extend(batch_results)
                
                # Salva progresso
                if batch_results:
                    backup_file = f"stocks_etl_progress_batch_{batch_num}.json"
                    self.save_to_json(batch_results, backup_file)
                
                # Pausa entre lotes
                if i + self.batch_size < len(stocks_list):
                    logger.info("⏸️ Pausa de 30 segundos entre lotes...")
                    time.sleep(30)
            
            # 4. Salva resultado final
            final_file = f"stocks_etl_complete_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            self.save_to_json(all_processed_data, final_file)
            
            # 5. Relatório final
            success_rate = (self.processed_count / total_stocks) * 100
            logger.info("🎉 ETL Pipeline Concluído!")
            logger.info(f"📈 Estatísticas finais:")
            logger.info(f"   • Total processado: {self.processed_count}/{total_stocks}")
            logger.info(f"   • Taxa de sucesso: {success_rate:.1f}%")
            logger.info(f"   • Falharam: {self.failed_count}")
            logger.info(f"   • Arquivo final: {final_file}")
            
            return all_processed_data
            
        except Exception as e:
            logger.error(f"💥 Erro crítico no pipeline: {e}")
            raise

if __name__ == "__main__":
    # Executa o pipeline
    pipeline = StocksETLPipeline()
    pipeline.run_etl_pipeline()


