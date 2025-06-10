import sqlite3
import pandas as pd
from datetime import datetime

DB_PATH = 'DB_sqlite/etf_data.sqlite'
REPORT_PATH = 'DB_sqlite/etf_coverage_report.csv'

conn = sqlite3.connect(DB_PATH)

# Buscar todos os símbolos
symbols = pd.read_sql('SELECT symbol FROM etf_list', conn)['symbol'].tolist()

rows = []
for symbol in symbols:
    # Preços
    df_prices = pd.read_sql(f"SELECT date FROM etf_prices WHERE symbol = ? ORDER BY date", conn, params=(symbol,))
    n_prices = len(df_prices)
    first_price_date = df_prices['date'].min() if n_prices > 0 else None
    last_price_date = df_prices['date'].max() if n_prices > 0 else None
    anos_cobertos = None
    if n_prices > 1:
        d1 = pd.to_datetime(first_price_date)
        d2 = pd.to_datetime(last_price_date)
        anos_cobertos = (d2 - d1).days / 365.25
    # Dividendos
    df_div = pd.read_sql(f"SELECT date FROM etf_dividends WHERE symbol = ? ORDER BY date", conn, params=(symbol,))
    n_dividends = len(df_div)
    first_div_date = df_div['date'].min() if n_dividends > 0 else None
    last_div_date = df_div['date'].max() if n_dividends > 0 else None
    rows.append({
        'symbol': symbol,
        'n_prices': n_prices,
        'first_price_date': first_price_date,
        'last_price_date': last_price_date,
        'anos_cobertos': anos_cobertos,
        'n_dividends': n_dividends,
        'first_div_date': first_div_date,
        'last_div_date': last_div_date
    })

# DataFrame e relatório
report = pd.DataFrame(rows)
report.to_csv(REPORT_PATH, index=False)

# Resumo
print(f"Total de ETFs: {len(symbols)}")
print(f"ETFs sem nenhum preço: {(report['n_prices']==0).sum()}")
print(f"ETFs com menos de 1 ano de histórico: {(report['anos_cobertos']<1).sum()}")
print(f"ETFs sem dividendos: {(report['n_dividends']==0).sum()}")
print(f"Relatório salvo em {REPORT_PATH}") 