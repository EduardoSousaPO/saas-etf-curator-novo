"""
Script para enriquecer o banco SQLite etf_data.sqlite com históricos de preços e dividendos de ETFs faltantes,
utilizando FMP (preferencial) e yfinance (fallback).

Como usar:
1. Instale as dependências:
   pip install requests yfinance pandas python-dotenv
2. Configure o .env com FMP_API_KEY (opcional)
3. Execute:
   python DB_sqlite/enrich_missing_etfs.py
"""
import os
import sqlite3
import pandas as pd
import requests
import yfinance as yf
from dotenv import load_dotenv
from time import sleep

DB_PATH = 'DB_sqlite/etf_data.sqlite'
REPORT_PATH = 'DB_sqlite/etf_coverage_report.csv'

load_dotenv()
FMP_API_KEY = os.getenv('FMP_API_KEY')

conn = sqlite3.connect(DB_PATH)

report = pd.read_csv(REPORT_PATH)

# Selecionar ETFs com menos de 1 ano de preços ou sem dividendos
missing = report[(report['n_prices'] < 252) | (report['n_dividends'] == 0)]
print(f"ETFs a enriquecer: {len(missing)}")

def insert_prices(symbol, df):
    df = df.copy()
    df['symbol'] = symbol
    df = df[['symbol', 'date', 'adj_close']]
    df.to_sql('etf_prices', conn, if_exists='append', index=False, method='multi')

def insert_dividends(symbol, df):
    df = df.copy()
    df['symbol'] = symbol
    df = df[['symbol', 'date', 'dividend']]
    df.to_sql('etf_dividends', conn, if_exists='append', index=False, method='multi')

def fetch_fmp(symbol):
    url = f"https://financialmodelingprep.com/api/v3/historical-price-full/{symbol}?apikey={FMP_API_KEY}&serietype=line"
    r = requests.get(url)
    if r.status_code != 200:
        return None, None
    data = r.json()
    if 'historical' not in data:
        return None, None
    df_prices = pd.DataFrame(data['historical'])
    if 'date' not in df_prices or 'adjClose' not in df_prices:
        return None, None
    df_prices = df_prices.rename(columns={'adjClose': 'adj_close'})
    df_prices = df_prices[['date', 'adj_close']]
    # Dividendos
    url_div = f"https://financialmodelingprep.com/api/v3/historical-price-full/stock_dividend/{symbol}?apikey={FMP_API_KEY}"
    r_div = requests.get(url_div)
    df_div = None
    if r_div.status_code == 200:
        data_div = r_div.json()
        if 'historical' in data_div:
            df_div = pd.DataFrame(data_div['historical'])
            if not df_div.empty and 'date' in df_div and 'dividend' in df_div:
                df_div = df_div[['date', 'dividend']]
            else:
                df_div = None
    return df_prices, df_div

def fetch_yf(symbol):
    t = yf.Ticker(symbol)
    df_prices = t.history(period='max')
    if df_prices.empty:
        return None, None
    df_prices = df_prices.reset_index()
    df_prices['date'] = df_prices['Date'].dt.strftime('%Y-%m-%d')
    df_prices = df_prices.rename(columns={'Adj Close': 'adj_close'})
    df_prices = df_prices[['date', 'adj_close']]
    # Dividendos
    df_div = t.dividends.reset_index()
    if not df_div.empty:
        df_div['date'] = df_div['Date'].dt.strftime('%Y-%m-%d')
        df_div = df_div.rename(columns={'Dividends': 'dividend'})
        df_div = df_div[['date', 'dividend']]
    else:
        df_div = None
    return df_prices, df_div

enriquecidos = []
erros = []
for idx, row in missing.iterrows():
    symbol = row['symbol']
    print(f"Enriquecendo {symbol}...")
    try:
        df_prices, df_div = None, None
        if FMP_API_KEY:
            df_prices, df_div = fetch_fmp(symbol)
            sleep(0.25)  # evitar rate limit
        if (df_prices is None or df_prices.empty) and (df_div is None or df_div is None):
            df_prices, df_div = fetch_yf(symbol)
        # Preços
        if df_prices is not None and not df_prices.empty:
            # Remover datas já existentes
            existing_dates = pd.read_sql(f"SELECT date FROM etf_prices WHERE symbol = ?", conn, params=(symbol,))['date'].tolist()
            df_prices = df_prices[~df_prices['date'].isin(existing_dates)]
            if not df_prices.empty:
                insert_prices(symbol, df_prices)
        # Dividendos
        if df_div is not None and not df_div.empty:
            existing_dates = pd.read_sql(f"SELECT date FROM etf_dividends WHERE symbol = ?", conn, params=(symbol,))['date'].tolist()
            df_div = df_div[~df_div['date'].isin(existing_dates)]
            if not df_div.empty:
                insert_dividends(symbol, df_div)
        if (df_prices is not None and not df_prices.empty) or (df_div is not None and not df_div.empty):
            enriquecidos.append(symbol)
        else:
            erros.append(symbol)
    except Exception as e:
        print(f"Erro ao enriquecer {symbol}: {e}")
        erros.append(symbol)
    if idx % 20 == 0:
        print(f"{idx} ETFs processados...")

print(f"\nTotal enriquecidos: {len(enriquecidos)}")
print(f"Total com erro ou sem dados: {len(erros)}")
if erros:
    print("Exemplos de símbolos com erro:", erros[:10]) 