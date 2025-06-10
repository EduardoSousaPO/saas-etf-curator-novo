"""
Script para calcular métricas financeiras dos ETFs no banco SQLite (etf_data.sqlite)
e popular a tabela calculated_metrics (estrutura igual ao Supabase).

Como usar:
1. Instale as dependências:
   pip install pandas numpy
2. Execute:
   python DB_sqlite/calculate_metrics_sqlite.py
"""
import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta

DB_PATH = 'DB_sqlite/etf_data.sqlite'
conn = sqlite3.connect(DB_PATH)

# Estrutura da tabela calculated_metrics
CREATE_TABLE = '''
CREATE TABLE IF NOT EXISTS calculated_metrics (
  symbol TEXT PRIMARY KEY,
  returns_12m NUMERIC,
  returns_24m NUMERIC,
  returns_36m NUMERIC,
  returns_5y NUMERIC,
  ten_year_return NUMERIC,
  volatility_12m NUMERIC,
  volatility_24m NUMERIC,
  volatility_36m NUMERIC,
  ten_year_volatility NUMERIC,
  sharpe_12m NUMERIC,
  sharpe_24m NUMERIC,
  sharpe_36m NUMERIC,
  ten_year_sharpe NUMERIC,
  max_drawdown NUMERIC,
  dividends_12m NUMERIC,
  dividends_24m NUMERIC,
  dividends_36m NUMERIC,
  dividends_all_time NUMERIC
);
'''
conn.execute(CREATE_TABLE)

symbols = pd.read_sql('SELECT symbol FROM etf_list', conn)['symbol'].tolist()

# Funções de cálculo

def total_return(prices):
    if len(prices) < 2:
        return np.nan
    return (prices[-1] / prices[0]) - 1

def annualized_volatility(returns, periods_per_year=252):
    if len(returns) < 2:
        return np.nan
    return np.std(returns, ddof=1) * np.sqrt(periods_per_year)

def sharpe_ratio(returns, risk_free_rate=0.0, periods_per_year=252):
    if len(returns) < 2:
        return np.nan
    mean_return = np.mean(returns)
    vol = np.std(returns, ddof=1)
    if vol == 0:
        return np.nan
    return (mean_return - risk_free_rate/periods_per_year) / vol * np.sqrt(periods_per_year)

def max_drawdown(prices):
    if len(prices) < 2:
        return np.nan
    roll_max = np.maximum.accumulate(prices)
    drawdowns = (prices - roll_max) / roll_max
    return drawdowns.min()

def sum_dividends(df_div, start_date=None, end_date=None):
    if df_div is None or df_div.empty:
        return 0.0
    if start_date and end_date:
        mask = (df_div['date'] >= start_date) & (df_div['date'] <= end_date)
        return df_div.loc[mask, 'dividend'].sum()
    return df_div['dividend'].sum()

results = []
for idx, symbol in enumerate(symbols, 1):
    try:
        df_prices = pd.read_sql(f"SELECT date, adj_close FROM etf_prices WHERE symbol = ? ORDER BY date", conn, params=(symbol,))
        if df_prices.empty or len(df_prices) < 2:
            continue
        df_prices['date'] = pd.to_datetime(df_prices['date'])
        df_prices = df_prices.sort_values('date')
        prices = df_prices['adj_close'].values
        returns = np.diff(prices) / prices[:-1]
        today = df_prices['date'].max()
        periods = {
            '12m': 365,
            '24m': 365*2,
            '36m': 365*3,
            '5y': 365*5,
            '10y': 365*10
        }
        def get_period_prices(days):
            cutoff = today - pd.Timedelta(days=days)
            df_period = df_prices[df_prices['date'] >= cutoff]
            return df_period['adj_close'].values, df_period['date'].values
        # Retornos
        returns_12m = total_return(get_period_prices(periods['12m'])[0])
        returns_24m = total_return(get_period_prices(periods['24m'])[0])
        returns_36m = total_return(get_period_prices(periods['36m'])[0])
        returns_5y = total_return(get_period_prices(periods['5y'])[0])
        ten_year_return = total_return(get_period_prices(periods['10y'])[0])
        # Volatilidade
        def get_period_returns(days):
            cutoff = today - pd.Timedelta(days=days)
            df_period = df_prices[df_prices['date'] >= cutoff]
            p = df_period['adj_close'].values
            if len(p) < 2:
                return np.array([])
            return np.diff(p) / p[:-1]
        volatility_12m = annualized_volatility(get_period_returns(periods['12m']))
        volatility_24m = annualized_volatility(get_period_returns(periods['24m']))
        volatility_36m = annualized_volatility(get_period_returns(periods['36m']))
        ten_year_volatility = annualized_volatility(get_period_returns(periods['10y']))
        # Sharpe
        sharpe_12m = sharpe_ratio(get_period_returns(periods['12m']))
        sharpe_24m = sharpe_ratio(get_period_returns(periods['24m']))
        sharpe_36m = sharpe_ratio(get_period_returns(periods['36m']))
        ten_year_sharpe = sharpe_ratio(get_period_returns(periods['10y']))
        # Max Drawdown (em todo o período)
        mdd = max_drawdown(prices)
        # Dividendos
        df_div = pd.read_sql(f"SELECT date, dividend FROM etf_dividends WHERE symbol = ? ORDER BY date", conn, params=(symbol,))
        if not df_div.empty:
            df_div['date'] = pd.to_datetime(df_div['date'])
            dividends_12m = sum_dividends(df_div, today - pd.Timedelta(days=365), today)
            dividends_24m = sum_dividends(df_div, today - pd.Timedelta(days=730), today)
            dividends_36m = sum_dividends(df_div, today - pd.Timedelta(days=1095), today)
            dividends_all_time = sum_dividends(df_div)
        else:
            dividends_12m = dividends_24m = dividends_36m = dividends_all_time = 0.0
        results.append({
            'symbol': symbol,
            'returns_12m': returns_12m,
            'returns_24m': returns_24m,
            'returns_36m': returns_36m,
            'returns_5y': returns_5y,
            'ten_year_return': ten_year_return,
            'volatility_12m': volatility_12m,
            'volatility_24m': volatility_24m,
            'volatility_36m': volatility_36m,
            'ten_year_volatility': ten_year_volatility,
            'sharpe_12m': sharpe_12m,
            'sharpe_24m': sharpe_24m,
            'sharpe_36m': sharpe_36m,
            'ten_year_sharpe': ten_year_sharpe,
            'max_drawdown': mdd,
            'dividends_12m': dividends_12m,
            'dividends_24m': dividends_24m,
            'dividends_36m': dividends_36m,
            'dividends_all_time': dividends_all_time
        })
        if idx % 100 == 0:
            print(f"{idx} ETFs processados...")
    except Exception as e:
        print(f"Erro ao processar {symbol}: {e}")

# DataFrame final
if results:
    df_metrics = pd.DataFrame(results)
    df_metrics.to_sql('calculated_metrics', conn, if_exists='replace', index=False, method='multi', chunksize=200)
    print(f"\nMétricas calculadas e gravadas para {len(df_metrics)} ETFs na tabela calculated_metrics do SQLite.")
    for col in df_metrics.columns:
        if col != 'symbol':
            n_null = df_metrics[col].isnull().sum()
            print(f"{col}: {n_null} valores nulos")
else:
    print("Nenhuma métrica calculada. Verifique se há dados suficientes no banco.") 