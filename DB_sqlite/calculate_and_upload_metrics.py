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

# Funções de validação
def validate_prices(prices):
    """Valida se os preços são válidos para cálculos financeiros"""
    if len(prices) < 2:
        return False
    
    # Verificar se todos os preços são positivos
    if np.any(prices <= 0):
        return False
    
    # Verificar se há valores extremos (mudanças > 1000% em um dia)
    returns = np.diff(prices) / prices[:-1]
    if np.any(np.abs(returns) > 10):  # 1000% de mudança
        return False
    
    # Verificar se há NaN ou infinitos
    if np.any(~np.isfinite(prices)):
        return False
    
    return True

def safe_numeric_result(value, min_val=-10, max_val=10):
    """Garante que o resultado numérico está dentro de limites razoáveis"""
    if not np.isfinite(value):
        return np.nan
    
    if value < min_val or value > max_val:
        return np.nan
    
    return value

# Funções de cálculo corrigidas
def annualized_return(prices, years):
    if not validate_prices(prices) or years <= 0:
        return np.nan
    
    total_ret = (prices[-1] / prices[0]) ** (1/years) - 1
    return safe_numeric_result(total_ret, min_val=-0.95, max_val=5.0)

def total_return(prices):
    """CORRIGIDO: Lógica estava invertida"""
    if not validate_prices(prices):
        return np.nan
    
    total_ret = (prices[-1] / prices[0]) - 1
    return safe_numeric_result(total_ret, min_val=-0.95, max_val=5.0)

def annualized_volatility(returns, periods_per_year=252):
    if len(returns) < 2:
        return np.nan
    
    # Filtrar retornos extremos antes do cálculo
    filtered_returns = returns[np.abs(returns) <= 1.0]  # Máximo 100% de mudança por dia
    
    if len(filtered_returns) < 2:
        return np.nan
    
    vol = np.std(filtered_returns, ddof=1) * np.sqrt(periods_per_year)
    return safe_numeric_result(vol, min_val=0, max_val=2.0)

def sharpe_ratio(returns, risk_free_rate=0.0, periods_per_year=252):
    if len(returns) < 2:
        return np.nan
    
    # Filtrar retornos extremos
    filtered_returns = returns[np.abs(returns) <= 1.0]
    
    if len(filtered_returns) < 2:
        return np.nan
    
    mean_return = np.mean(filtered_returns)
    vol = np.std(filtered_returns, ddof=1)
    
    if vol == 0 or not np.isfinite(vol):
        return np.nan
    
    sharpe = (mean_return - risk_free_rate/periods_per_year) / vol * np.sqrt(periods_per_year)
    return safe_numeric_result(sharpe, min_val=-10, max_val=10)

def max_drawdown(prices):
    if not validate_prices(prices):
        return np.nan
    
    roll_max = np.maximum.accumulate(prices)
    drawdowns = (prices - roll_max) / roll_max
    mdd = drawdowns.min()
    
    return safe_numeric_result(mdd, min_val=-1.0, max_val=0)

def sum_dividends(df_div, start_date=None, end_date=None):
    if df_div.empty:
        return 0.0
    
    if start_date and end_date:
        mask = (df_div['date'] >= start_date) & (df_div['date'] <= end_date)
        total_div = df_div.loc[mask, 'dividend'].sum()
    else:
        total_div = df_div['dividend'].sum()
    
    # Validar dividendos (máximo $1000 por ação por período)
    if total_div < 0 or total_div > 1000:
        return 0.0
    
    return total_div

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
        # Filtrar preços inválidos
        df = df[df['adj_close'] > 0]
        df = df.dropna()
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
        # Filtrar dividendos inválidos
        df = df[df['dividend'] >= 0]
        df = df.dropna()
    return df

symbols = fetch_all_symbols()
print(f"Total de símbolos em etf_list (Supabase): {len(symbols)}")

results = []
not_processed = []
corrupted_data_detected = []

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
        
        # Validar dados de preços antes de processar
        if not validate_prices(prices):
            corrupted_data_detected.append(symbol)
            print(f"⚠️ Dados corrompidos detectados para {symbol} - pulando...")
            continue
        
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
        
        # Retornos (usando função corrigida)
        returns_12m = total_return(get_period_prices(periods['12m'])[0])
        returns_24m = total_return(get_period_prices(periods['24m'])[0])
        returns_36m = total_return(get_period_prices(periods['36m'])[0])
        returns_5y = total_return(get_period_prices(periods['5y'])[0])
        ten_year_return = total_return(get_period_prices(periods['10y'])[0])
        
        # Volatilidade (com filtros)
        def get_period_returns(days):
            cutoff = today - pd.Timedelta(days=days)
            df_period = df_prices[df_prices['date'] >= cutoff]
            p = df_period['adj_close'].values
            if not validate_prices(p):
                return np.array([])
            return np.diff(p) / p[:-1]
        
        volatility_12m = annualized_volatility(get_period_returns(periods['12m']))
        volatility_24m = annualized_volatility(get_period_returns(periods['24m']))
        volatility_36m = annualized_volatility(get_period_returns(periods['36m']))
        ten_year_volatility = annualized_volatility(get_period_returns(periods['10y']))
        
        # Sharpe (com filtros)
        sharpe_12m = sharpe_ratio(get_period_returns(periods['12m']))
        sharpe_24m = sharpe_ratio(get_period_returns(periods['24m']))
        sharpe_36m = sharpe_ratio(get_period_returns(periods['36m']))
        ten_year_sharpe = sharpe_ratio(get_period_returns(periods['10y']))
        
        # Max Drawdown (com validação)
        mdd = max_drawdown(prices)
        
        # Dividendos (com validação)
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
successful_uploads = 0
failed_uploads = 0

for i, row in df_metrics.iterrows():
    data = row.dropna().to_dict()
    try:
        supabase.table('calculated_metrics').upsert(data, on_conflict=['symbol']).execute()
        successful_uploads += 1
    except Exception as e:
        print(f"Erro ao gravar {data.get('symbol', '')}: {e}")
        failed_uploads += 1

print("\n✅ Métricas calculadas e gravadas no Supabase com validações!")

# Relatório detalhado
print(f"\n📊 RELATÓRIO DE PROCESSAMENTO:")
print(f"Total de símbolos em etf_list: {len(symbols)}")
print(f"ETFs processados com sucesso: {len(df_metrics)}")
print(f"ETFs não processados (sem histórico): {len(not_processed)}")
print(f"ETFs com dados corrompidos detectados: {len(corrupted_data_detected)}")
print(f"Uploads bem-sucedidos: {successful_uploads}")
print(f"Uploads falharam: {failed_uploads}")

if corrupted_data_detected:
    print(f"\n⚠️ ETFs com dados corrompidos (filtrados): {corrupted_data_detected[:10]}")

if not_processed:
    print(f"\n📝 Exemplos de símbolos não processados: {not_processed[:10]}")

# Conferência de métricas nulas e outliers
print(f"\n🔍 ANÁLISE DE QUALIDADE DOS DADOS:")
for col in df_metrics.columns:
    if col != 'symbol':
        n_null = df_metrics[col].isnull().sum()
        if col in ['returns_12m', 'volatility_12m', 'sharpe_12m']:
            valid_data = df_metrics[col].dropna()
            if len(valid_data) > 0:
                min_val = valid_data.min()
                max_val = valid_data.max()
                print(f"{col}: {n_null} nulos, faixa: {min_val:.4f} a {max_val:.4f}")
            else:
                print(f"{col}: {n_null} nulos, sem dados válidos")

# Conferência no Supabase
try:
    res = supabase.table('calculated_metrics').select('symbol').execute()
    if hasattr(res, 'data') and res.data is not None:
        print(f"\nTotal de ETFs na tabela calculated_metrics do Supabase: {len(res.data)}")
    else:
        print("Não foi possível consultar a tabela calculated_metrics no Supabase.")
except Exception as e:
    print(f"Erro ao consultar calculated_metrics no Supabase: {e}")