"""
Script para sincronizar a tabela calculated_metrics do SQLite (etf_data.sqlite)
com a tabela calculated_metrics do Supabase, sobrescrevendo por symbol.

Como usar:
1. Instale as dependências:
   pip install pandas supabase python-dotenv
2. Configure o .env na raiz do projeto com SUPABASE_URL e SUPABASE_KEY
3. Execute:
   python DB_sqlite/sync_calculated_metrics_to_supabase.py
"""
import os
import pandas as pd
import sqlite3
from supabase import create_client, Client
from dotenv import load_dotenv
from time import sleep
import math

DB_PATH = 'DB_sqlite/etf_data.sqlite'
TABLE = 'calculated_metrics'
BATCH_SIZE = 200

# Carregar variáveis de ambiente
env_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '.env'))
load_dotenv(env_path)
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
if not SUPABASE_URL or not SUPABASE_KEY:
    raise Exception('Configure SUPABASE_URL e SUPABASE_KEY no arquivo .env')

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

conn = sqlite3.connect(DB_PATH)
df = pd.read_sql(f'SELECT * FROM {TABLE}', conn)
df = df.where(pd.notnull(df), None)  # Converter NaN para None
print(f"Total de linhas a sincronizar: {len(df)}")

def nan_to_none(d):
    return {k: (None if isinstance(v, float) and math.isnan(v) else v) for k, v in d.items()}

erros = []
for i in range(0, len(df), BATCH_SIZE):
    batch_dicts = df.iloc[i:i+BATCH_SIZE].dropna(axis=1, how='all').to_dict(orient='records')
    batch = [nan_to_none(row) for row in batch_dicts]
    try:
        supabase.table(TABLE).upsert(batch, on_conflict=['symbol']).execute()
        print(f"Sincronizado {i+BATCH_SIZE if i+BATCH_SIZE < len(df) else len(df)} de {len(df)}...")
        sleep(0.2)  # evitar rate limit
    except Exception as e:
        print(f"Erro no batch {i//BATCH_SIZE}: {e}")
        erros.append(i//BATCH_SIZE)

print(f"\nSincronização concluída. Total de batches com erro: {len(erros)}")
if erros:
    print("Batches com erro:", erros) 