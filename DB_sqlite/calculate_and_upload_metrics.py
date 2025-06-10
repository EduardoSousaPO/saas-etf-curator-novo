import os
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from supabase import create_client, Client
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv(os.path.abspath(os.path.join(os.path.dirname(__file__), '.env')))
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception('Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Funções de cálculo
def annualized_return(prices, years):
    if len(prices) < 2:
        return np.nan
    return (prices[-1] / prices[0]) ** (1/years) - 1

def total_return(prices):
    if len(prices) < 2:
        return (prices[-1] / prices[0]) - 1
    return np.nan

def annualized_volatility(returns, periods_per_year=252):
    return np.std(returns, ddof=1) * np.sqrt(periods_per_year)

def sharpe_ratio(returns, risk_free_rate=0.0, periods_per_year=252):
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
    if start_date and end_date:
        mask = (df_div['date'] >= start_date) & (df_div['date'] <= end_date)
        return df_div.loc[mask, 'dividend'].sum()
    return df_div['dividend'].sum()

# Buscar todos os símbolos do Supabase
def fetch_all_symbols():
    all_symbols = []
    offset = 0
    batch_size = 1000
    while True:
        res = supabase.table('etf_list').select('symbol').range(offset, offset+batch_size-1).execute()
        batch = [row['symbol'] for row in res.data]
        if not batch:
            break
        all_symbols.extend(batch)
        offset += batch_size
        if len(batch) < batch_size:
            break
    return all_symbols

def fetch_prices(symbol):
    all_data = []
    offset = 0
    batch_size = 1000
    while True:
        res = supabase.table('etf_prices').select('date, adj_close').eq('symbol', symbol).order('date', desc=False).range(offset, offset+batch_size-1).execute()
        batch = res.data
        if not batch:
            break
        all_data.extend(batch)
        offset += batch_size
        if len(batch) < batch_size:
            break
    df = pd.DataFrame(all_data)
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'])
    return df

def fetch_dividends(symbol):
    all_data = []
    offset = 0
    batch_size = 1000
    while True:
        res = supabase.table('etf_dividends').select('date, dividend').eq('symbol', symbol).order('date', desc=False).range(offset, offset+batch_size-1).execute()
        batch = res.data
        if not batch:
            break
        all_data.extend(batch)
        offset += batch_size
        if len(batch) < batch_size:
            break
    df = pd.DataFrame(all_data)
    if not df.empty:
        df['date'] = pd.to_datetime(df['date'])
    return df

symbols = fetch_all_symbols()
print(f"Total de símbolos em etf_list (Supabase): {len(symbols)}")

results = []
not_processed = []

for idx, symbol in enumerate(symbols, 1):
    try:
        df_prices = fetch_prices(symbol)
        if df_prices.empty or 'date' not in df_prices.columns or len(df_prices) < 2:
            not_processed.append(symbol)
            if idx <= 10:
                print(f"{symbol} não possui histórico suficiente para cálculo. Tamanho do histórico: {len(df_prices)}. Colunas: {df_prices.columns.tolist()}")
            continue
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
        df_div = fetch_dividends(symbol)
        if df_div.empty or 'date' not in df_div.columns:
            dividends_12m = dividends_24m = dividends_36m = dividends_all_time = 0.0
        else:
            df_div['date'] = pd.to_datetime(df_div['date'])
            dividends_12m = sum_dividends(df_div, today - pd.Timedelta(days=365), today)
            dividends_24m = sum_dividends(df_div, today - pd.Timedelta(days=730), today)
            dividends_36m = sum_dividends(df_div, today - pd.Timedelta(days=1095), today)
            dividends_all_time = sum_dividends(df_div)
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
        not_processed.append(symbol)

# DataFrame final
df_metrics = pd.DataFrame(results)

# Gravar no Supabase (upsert)
for i, row in df_metrics.iterrows():
    data = row.dropna().to_dict()
    try:
        supabase.table('calculated_metrics').upsert(data, on_conflict=['symbol']).execute()
    except Exception as e:
        print(f"Erro ao gravar {data.get('symbol', '')}: {e}")

print("\nMétricas calculadas e gravadas no Supabase com sucesso!")

# Conferência de quantidade de ETFs
print(f"\nTotal de símbolos em etf_list (Supabase): {len(symbols)}")
print(f"Total de ETFs processados: {len(df_metrics)}")
print(f"Total de ETFs não processados (sem histórico suficiente ou erro): {len(not_processed)}")
if not_processed:
    print("Exemplos de símbolos não processados:", not_processed[:10])

# Conferência de métricas nulas
for col in df_metrics.columns:
    if col != 'symbol':
        n_null = df_metrics[col].isnull().sum()
        print(f"{col}: {n_null} valores nulos")

# Conferência no Supabase
try:
    res = supabase.table('calculated_metrics').select('symbol').execute()
    if hasattr(res, 'data') and res.data is not None:
        print(f"Total de ETFs na tabela calculated_metrics do Supabase: {len(res.data)}")
    else:
        print("Não foi possível consultar a tabela calculated_metrics no Supabase.")
except Exception as e:
    print(f"Erro ao consultar calculated_metrics no Supabase: {e}")