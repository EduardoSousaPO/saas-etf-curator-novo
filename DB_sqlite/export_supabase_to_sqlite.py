"""
Script robusto para exportar as tabelas etf_list, etf_prices e etf_dividends do Supabase para um banco SQLite local,
garantindo que todos os dados foram copiados e validando a integridade.

Como usar:
1. Instale as dependências:
   pip install supabase pandas python-dotenv
2. Crie um arquivo .env na raiz do projeto com SUPABASE_URL e SUPABASE_KEY
3. Execute:
   python DB_sqlite/export_supabase_to_sqlite.py
"""
import os
import pandas as pd
import sqlite3
from supabase import create_client, Client
from dotenv import load_dotenv
import time

# Configurações
tables = ['etf_list', 'etf_prices', 'etf_dividends']
batch_size = 1000  # 1000 é o limite padrão do Supabase/PostgREST

# Carregar variáveis de ambiente
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(env_path)
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception('Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
DB_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), 'etf_data.sqlite'))

def fetch_table_all(table, batch_size=batch_size):
    all_data = []
    offset = 0
    while True:
        data = supabase.table(table).select('*').range(offset, offset+batch_size-1).execute()
        batch = data.data
        if not batch:
            break
        all_data.extend(batch)
        print(f"Lote baixado: {len(batch)} registros de {table} (offset {offset})")
        offset += batch_size
        time.sleep(0.05)  # Evita sobrecarga na API
        if len(batch) < batch_size:
            break  # Último lote
    print(f"Total baixado de {table}: {len(all_data)} registros.")
    return pd.DataFrame(all_data)

def recreate_tables(conn):
    # Apaga e recria as tabelas
    conn.execute("DROP TABLE IF EXISTS etf_list;")
    conn.execute("DROP TABLE IF EXISTS etf_prices;")
    conn.execute("DROP TABLE IF EXISTS etf_dividends;")
    conn.execute("""
    CREATE TABLE etf_list (
      symbol TEXT NOT NULL PRIMARY KEY,
      name TEXT,
      description TEXT,
      isin TEXT,
      assetclass TEXT,
      securitycusip TEXT,
      domicile TEXT,
      website TEXT,
      etfcompany TEXT,
      expenseratio NUMERIC,
      assetsundermanagement NUMERIC,
      avgvolume NUMERIC,
      inceptiondate DATE,
      nav NUMERIC,
      navcurrency TEXT,
      holdingscount INTEGER,
      updatedat TIMESTAMP,
      sectorslist TEXT
    );
    """)
    conn.execute("""
    CREATE TABLE etf_prices (
      symbol TEXT NOT NULL,
      date DATE NOT NULL,
      open NUMERIC,
      high NUMERIC,
      low NUMERIC,
      close NUMERIC,
      volume NUMERIC,
      nav NUMERIC,
      return_1m NUMERIC,
      return_3m NUMERIC,
      return_1y NUMERIC,
      adj_close NUMERIC,
      PRIMARY KEY (symbol, date)
    );
    """)
    conn.execute("""
    CREATE TABLE etf_dividends (
      symbol TEXT NOT NULL,
      date DATE NOT NULL,
      dividend NUMERIC,
      adj_dividend NUMERIC,
      label TEXT,
      PRIMARY KEY (symbol, date)
    );
    """)

def validate_counts(conn, table, expected_count):
    cur = conn.cursor()
    cur.execute(f"SELECT COUNT(*) FROM {table}")
    sqlite_count = cur.fetchone()[0]
    print(f"Linhas em {table} no SQLite: {sqlite_count}")
    if expected_count is not None and sqlite_count != expected_count:
        print(f"ALERTA: Divergência de linhas em {table}! Esperado: {expected_count}, SQLite: {sqlite_count}")
    else:
        print(f"OK: {table} copiado com sucesso.")

def main():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)
    with sqlite3.connect(DB_PATH) as conn:
        recreate_tables(conn)
        for table in tables:
            print(f"\nExportando {table}...")
            df = fetch_table_all(table)
            # Conversão especial para JSON/list
            if table == 'etf_list' and 'sectorslist' in df.columns:
                df['sectorslist'] = df['sectorslist'].apply(lambda x: str(x) if x is not None else None)
            df.to_sql(table, conn, if_exists='replace', index=False)
            # Validação: comparar linhas baixadas com inseridas
            validate_counts(conn, table, len(df))
    print("\nExportação e validação concluídas!")

if __name__ == "__main__":
    main() 