#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
AGGRESSIVE YFINANCE PIPELINE - IMPLEMENTAÇÃO MASSIVA
Pipeline robusto para coletar dados reais de 2.458 ações via yfinance
Com métricas fundamentais, técnicas e histórico completo
"""

import yfinance as yf
import pandas as pd
import numpy as np
import json
import time
import requests
from datetime import datetime, timedelta
from concurrent.futures import ThreadPoolExecutor, as_completed
import warnings
warnings.filterwarnings('ignore')

class AggressiveYfinancePipeline:
    def __init__(self):
        self.processed_stocks = []
        self.failed_stocks = []
        self.batch_size = 25  # Lotes pequenos para MCP
        self.max_workers = 5  # Threads paralelas
        
    def calculate_financial_metrics(self, hist_data, info):
        """Calcula métricas financeiras avançadas"""
        if hist_data.empty:
            return {}
        
        try:
            # Dados históricos
            prices = hist_data['Close'].dropna()
            if len(prices) < 30:
                return {}
            
            # Returns em diferentes períodos
            current_price = prices.iloc[-1]
            returns = {}
            
            periods = {
                '1m': 21, '3m': 63, '6m': 126, '12m': 252, 
                '24m': 504, '36m': 756, '5y': 1260
            }
            
            for period, days in periods.items():
                if len(prices) >= days:
                    old_price = prices.iloc[-days]
                    returns[f'returns_{period}'] = ((current_price / old_price) - 1) * 100
            
            # Volatilidade (diferentes períodos)
            daily_returns = prices.pct_change().dropna()
            
            volatilities = {}
            for period, days in periods.items():
                if len(daily_returns) >= days:
                    vol_data = daily_returns.tail(days)
                    volatilities[f'volatility_{period}'] = vol_data.std() * np.sqrt(252) * 100
            
            # Sharpe Ratio (assumindo risk-free rate de 3%)
            risk_free_rate = 0.03
            sharpe_ratios = {}
            
            for period in ['12m', '24m', '36m', '5y']:
                if f'returns_{period}' in returns and f'volatility_{period}' in volatilities:
                    excess_return = (returns[f'returns_{period}'] / 100) - risk_free_rate
                    volatility = volatilities[f'volatility_{period}'] / 100
                    if volatility > 0:
                        sharpe_ratios[f'sharpe_{period}'] = excess_return / volatility
            
            # Maximum Drawdown
            rolling_max = prices.expanding().max()
            drawdown = (prices / rolling_max - 1) * 100
            max_drawdown = drawdown.min()
            
            # Maximum Drawdown 12m
            if len(prices) >= 252:
                recent_prices = prices.tail(252)
                recent_rolling_max = recent_prices.expanding().max()
                recent_drawdown = (recent_prices / recent_rolling_max - 1) * 100
                max_drawdown_12m = recent_drawdown.min()
            else:
                max_drawdown_12m = max_drawdown
            
            # Beta (vs SPY)
            try:
                spy_data = yf.download('^GSPC', period='1y', progress=False)['Close']
                if len(spy_data) > 100 and len(prices) > 100:
                    # Alinhar datas
                    common_dates = spy_data.index.intersection(prices.index)
                    if len(common_dates) > 100:
                        spy_returns = spy_data.loc[common_dates].pct_change().dropna()
                        stock_returns = prices.loc[common_dates].pct_change().dropna()
                        
                        if len(spy_returns) > 50 and len(stock_returns) > 50:
                            covariance = np.cov(stock_returns, spy_returns)[0][1]
                            spy_variance = np.var(spy_returns)
                            beta_12m = covariance / spy_variance if spy_variance > 0 else 1.0
                        else:
                            beta_12m = 1.0
                    else:
                        beta_12m = 1.0
                else:
                    beta_12m = 1.0
            except:
                beta_12m = 1.0
            
            # Volume médio
            if 'Volume' in hist_data.columns:
                volume_avg_30d = hist_data['Volume'].tail(30).mean()
            else:
                volume_avg_30d = info.get('averageVolume', 0)
            
            # Combinar todas as métricas
            metrics = {
                'current_price': float(current_price),
                'volume_avg_30d': int(volume_avg_30d) if volume_avg_30d else 0,
                'max_drawdown': float(max_drawdown),
                'max_drawdown_12m': float(max_drawdown_12m),
                'beta_12m': float(beta_12m)
            }
            
            metrics.update(returns)
            metrics.update(volatilities)
            metrics.update(sharpe_ratios)
            
            return metrics
            
        except Exception as e:
            print(f"    ⚠️ Erro no cálculo de métricas: {e}")
            return {}
    
    def extract_fundamental_metrics(self, info):
        """Extrai métricas fundamentais do yfinance"""
        fundamentals = {}
        
        # Métricas de valuation
        fundamentals['pe_ratio'] = info.get('trailingPE')
        fundamentals['forward_pe'] = info.get('forwardPE')
        fundamentals['pb_ratio'] = info.get('priceToBook')
        fundamentals['ps_ratio'] = info.get('priceToSalesTrailing12Months')
        fundamentals['peg_ratio'] = info.get('pegRatio')
        fundamentals['ev_ebitda'] = info.get('enterpriseToEbitda')
        
        # Métricas de rentabilidade
        fundamentals['roe'] = info.get('returnOnEquity')
        fundamentals['roa'] = info.get('returnOnAssets')
        fundamentals['roic'] = info.get('returnOnAssets')  # Aproximação
        
        # Margens
        fundamentals['gross_margin'] = info.get('grossMargins')
        fundamentals['operating_margin'] = info.get('operatingMargins')
        fundamentals['profit_margin'] = info.get('profitMargins')
        
        # Métricas de liquidez e endividamento
        fundamentals['current_ratio'] = info.get('currentRatio')
        fundamentals['quick_ratio'] = info.get('quickRatio')
        fundamentals['debt_to_equity'] = info.get('debtToEquity')
        
        # Crescimento
        fundamentals['revenue_growth_yoy'] = info.get('revenueGrowth')
        fundamentals['earnings_growth_yoy'] = info.get('earningsGrowth')
        
        # Dividendos
        fundamentals['dividend_yield_12m'] = info.get('dividendYield', 0) * 100 if info.get('dividendYield') else 0
        fundamentals['dividend_rate'] = info.get('dividendRate', 0)
        fundamentals['payout_ratio'] = info.get('payoutRatio')
        
        # Market data
        fundamentals['market_cap'] = info.get('marketCap', 0)
        fundamentals['enterprise_value'] = info.get('enterpriseValue')
        fundamentals['shares_outstanding'] = info.get('sharesOutstanding')
        
        # Limpar valores None
        return {k: v for k, v in fundamentals.items() if v is not None}
    
    def extract_company_info(self, info):
        """Extrai informações da empresa"""
        company_info = {}
        
        company_info['business_description'] = info.get('longBusinessSummary', '')[:2000]
        company_info['sector'] = info.get('sector', 'Technology')
        company_info['industry'] = info.get('industry', 'Technology')
        company_info['website'] = info.get('website', '')
        company_info['headquarters'] = f"{info.get('city', '')}, {info.get('state', '')}, {info.get('country', '')}"
        company_info['employees_count'] = info.get('fullTimeEmployees')
        company_info['exchange'] = info.get('exchange', 'NASDAQ')
        
        return company_info
    
    def process_single_stock(self, stock_data):
        """Processa uma única ação com yfinance"""
        ticker = stock_data['ticker']
        
        try:
            print(f"    📊 Processando {ticker}...")
            
            # Criar objeto yfinance
            stock = yf.Ticker(ticker)
            
            # Obter informações básicas
            try:
                info = stock.info
                if not info or 'symbol' not in info:
                    print(f"      ⚠️ {ticker}: Sem dados básicos")
                    return None
            except Exception as e:
                print(f"      ⚠️ {ticker}: Erro ao obter info - {e}")
                return None
            
            # Obter dados históricos (2 anos)
            try:
                hist_data = stock.history(period='2y', progress=False)
                if hist_data.empty:
                    print(f"      ⚠️ {ticker}: Sem dados históricos")
                    return None
            except Exception as e:
                print(f"      ⚠️ {ticker}: Erro ao obter histórico - {e}")
                return None
            
            # Calcular métricas financeiras
            financial_metrics = self.calculate_financial_metrics(hist_data, info)
            if not financial_metrics:
                print(f"      ⚠️ {ticker}: Erro no cálculo de métricas")
                return None
            
            # Extrair métricas fundamentais
            fundamental_metrics = self.extract_fundamental_metrics(info)
            
            # Extrair informações da empresa
            company_info = self.extract_company_info(info)
            
            # Combinar tudo
            result = {
                'ticker': ticker,
                'name': info.get('longName', stock_data.get('name', ticker)),
                'source_description': stock_data.get('description', ''),
                'yfinance_collected_at': datetime.now().isoformat(),
                **company_info,
                **financial_metrics,
                **fundamental_metrics
            }
            
            print(f"      ✅ {ticker}: Processado com sucesso")
            return result
            
        except Exception as e:
            print(f"      ❌ {ticker}: Erro geral - {e}")
            return None
    
    def process_batch(self, batch_stocks, batch_num, total_batches):
        """Processa um lote de ações"""
        
        print(f"\n📦 LOTE {batch_num}/{total_batches} - {len(batch_stocks)} ações")
        print(f"🎯 Ações: {', '.join([s['ticker'] for s in batch_stocks])}")
        print("-" * 50)
        
        batch_results = []
        
        # Processamento sequencial para evitar rate limiting
        for stock_data in batch_stocks:
            result = self.process_single_stock(stock_data)
            if result:
                batch_results.append(result)
            
            # Pausa pequena entre ações
            time.sleep(0.2)
        
        success_rate = len(batch_results) / len(batch_stocks) * 100
        print(f"📊 Lote {batch_num} concluído: {len(batch_results)}/{len(batch_stocks)} sucessos ({success_rate:.1f}%)")
        
        return batch_results
    
    def run_aggressive_pipeline(self, max_stocks=500):
        """Executa o pipeline agressivo"""
        
        print("🚀 AGGRESSIVE YFINANCE PIPELINE - INICIANDO")
        print("=" * 60)
        
        # Carregar ações processadas
        try:
            with open('processed_stocks.json', 'r', encoding='utf-8') as f:
                all_stocks = json.load(f)
            print(f"📂 Carregadas {len(all_stocks)} ações do CSV")
        except Exception as e:
            print(f"❌ Erro ao carregar ações: {e}")
            return False
        
        # Filtrar ações válidas (remover #CAMPO! e tickers inválidos)
        valid_stocks = []
        for stock in all_stocks:
            ticker = stock.get('ticker', '')
            if (ticker and 
                ticker != '#CAMPO!' and 
                len(ticker) <= 5 and 
                ticker.isalpha() and
                not ticker.startswith('#')):
                valid_stocks.append(stock)
        
        print(f"🔍 Ações válidas filtradas: {len(valid_stocks)}")
        
        # Limitar para teste/produção
        if max_stocks:
            valid_stocks = valid_stocks[:max_stocks]
            print(f"🎯 Processando primeiras {len(valid_stocks)} ações")
        
        # Dividir em lotes
        total_batches = (len(valid_stocks) + self.batch_size - 1) // self.batch_size
        print(f"📦 {total_batches} lotes de {self.batch_size} ações cada")
        
        # Processar lotes
        all_results = []
        
        for batch_num in range(1, total_batches + 1):
            start_idx = (batch_num - 1) * self.batch_size
            end_idx = min(start_idx + self.batch_size, len(valid_stocks))
            batch_stocks = valid_stocks[start_idx:end_idx]
            
            batch_results = self.process_batch(batch_stocks, batch_num, total_batches)
            all_results.extend(batch_results)
            
            # Salvar progresso a cada lote
            with open(f'yfinance_batch_{batch_num:03d}.json', 'w', encoding='utf-8') as f:
                json.dump(batch_results, f, indent=2, ensure_ascii=False)
            
            # Pausa entre lotes
            if batch_num < total_batches:
                print(f"⏸️ Pausa de 2 segundos...")
                time.sleep(2)
        
        # Salvar resultados finais
        print(f"\n📊 PIPELINE CONCLUÍDO!")
        print(f"✅ Ações processadas: {len(all_results)}")
        print(f"❌ Ações falharam: {len(valid_stocks) - len(all_results)}")
        print(f"📈 Taxa de sucesso: {len(all_results)/len(valid_stocks)*100:.1f}%")
        
        # Salvar dados finais
        with open('yfinance_complete_results.json', 'w', encoding='utf-8') as f:
            json.dump(all_results, f, indent=2, ensure_ascii=False)
        
        print(f"💾 Dados salvos: yfinance_complete_results.json")
        
        return len(all_results)

if __name__ == "__main__":
    pipeline = AggressiveYfinancePipeline()
    
    # Executar com limite para teste (500 ações)
    result = pipeline.run_aggressive_pipeline(max_stocks=100)  # Começar com 100
    
    if result:
        print(f"\n🎉 PIPELINE AGRESSIVO CONCLUÍDO!")
        print(f"📊 {result} ações processadas com dados reais do yfinance")
        print(f"🔄 Pronto para aplicação via MCP Supabase")
    else:
        print(f"\n❌ PIPELINE AGRESSIVO FALHOU")



