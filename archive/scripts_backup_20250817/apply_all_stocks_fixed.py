#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
Aplicar todas as ações diretamente via MCP Supabase
Versão corrigida para lidar com CSV problemático
"""

import pandas as pd
import json
import time
from datetime import datetime

def apply_all_stocks_fixed():
    """Aplica todas as ações do CSV via MCP Supabase"""
    
    print("🚀 APLICAÇÃO DIRETA DE TODAS AS AÇÕES - VERSÃO CORRIGIDA")
    print("=" * 60)
    
    # Carregar CSV com tratamento de erros
    try:
        print("📂 Carregando CSV das ações...")
        # Tentar diferentes estratégias de parsing
        df = pd.read_csv('../top_us_stocks_2025-07-29.csv', 
                        encoding='latin-1',
                        on_bad_lines='skip',
                        quoting=1,  # QUOTE_ALL
                        sep=',')
        print(f"✅ CSV carregado: {len(df)} ações encontradas")
        
        # Mostrar colunas disponíveis
        print(f"📋 Colunas encontradas: {list(df.columns)}")
        print(f"📄 Primeiras 3 linhas:")
        print(df.head(3))
        
    except Exception as e:
        print(f"❌ Erro ao carregar CSV: {e}")
        print("🔄 Tentando estratégia alternativa...")
        
        # Estratégia alternativa: ler linha por linha
        try:
            with open('../top_us_stocks_2025-07-29.csv', 'r', encoding='latin-1') as f:
                lines = f.readlines()
            
            print(f"📄 Total de linhas no arquivo: {len(lines)}")
            print("🔍 Primeiras 5 linhas:")
            for i, line in enumerate(lines[:5]):
                print(f"  {i+1}: {line.strip()}")
                
            # Tentar identificar o separador e formato
            header = lines[0].strip()
            separators = [',', ';', '\t', '|']
            
            for sep in separators:
                if sep in header:
                    cols = header.split(sep)
                    print(f"📊 Testando separador '{sep}': {len(cols)} colunas")
                    if len(cols) >= 5:  # Mínimo esperado
                        print(f"✅ Separador '{sep}' parece correto")
                        break
            
            return False
            
        except Exception as e2:
            print(f"❌ Erro na estratégia alternativa: {e2}")
            return False
    
    # Se chegou aqui, o CSV foi carregado com sucesso
    # Processar dados em lotes pequenos
    batch_size = 25  # Lotes menores para MCP
    total_batches = (len(df) + batch_size - 1) // batch_size
    
    print(f"\n📊 Processando {len(df)} ações em {total_batches} lotes")
    print("-" * 60)
    
    # Identificar colunas corretas
    ticker_col = None
    name_col = None
    sector_col = None
    desc_col = None
    price_col = None
    mcap_col = None
    
    # Mapear colunas baseado nos nomes
    for col in df.columns:
        col_lower = str(col).lower()
        if 'ticker' in col_lower:
            ticker_col = col
        elif 'symbol' in col_lower:
            name_col = col
        elif 'setor' in col_lower or 'sector' in col_lower:
            sector_col = col
        elif 'descrição' in col_lower or 'description' in col_lower:
            desc_col = col
        elif 'preço' in col_lower or 'price' in col_lower:
            price_col = col
        elif 'capitalização' in col_lower or 'market' in col_lower:
            mcap_col = col
    
    print(f"📋 Mapeamento de colunas:")
    print(f"  Ticker: {ticker_col}")
    print(f"  Name: {name_col}")
    print(f"  Sector: {sector_col}")
    print(f"  Description: {desc_col}")
    print(f"  Price: {price_col}")
    print(f"  Market Cap: {mcap_col}")
    
    if not ticker_col:
        print("❌ Coluna ticker não encontrada!")
        return False
    
    # Processar primeiro lote como teste
    print(f"\n🧪 TESTE - Processando primeiro lote (25 ações)")
    
    batch_df = df.head(25)
    sql_statements = []
    
    for idx, row in batch_df.iterrows():
        try:
            ticker = str(row[ticker_col]).strip().upper() if ticker_col else f"STOCK_{idx}"
            name = str(row[name_col]).replace("'", "''") if name_col and pd.notna(row[name_col]) else ticker
            sector = str(row[sector_col]).replace("'", "''") if sector_col and pd.notna(row[sector_col]) else 'Technology'
            description = str(row[desc_col]).replace("'", "''")[:1000] if desc_col and pd.notna(row[desc_col]) else f'Ação americana {ticker}'
            
            # SQL para inserir/atualizar
            sql = f"""
INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description)
VALUES ('{ticker}', 'STOCK', '{name}', 'NASDAQ', '{sector}', 'Technology', '{description}')
ON CONFLICT (ticker) DO UPDATE SET
  name = EXCLUDED.name,
  sector = EXCLUDED.sector,
  business_description = EXCLUDED.business_description;
"""
            sql_statements.append(sql)
            
        except Exception as e:
            print(f"⚠️ Erro ao processar linha {idx}: {e}")
    
    # Salvar SQL do teste
    test_sql = "\n".join(sql_statements)
    
    with open('test_batch_stocks.sql', 'w', encoding='utf-8') as f:
        f.write(test_sql)
    
    print(f"✅ SQL de teste gerado: test_batch_stocks.sql")
    print(f"📊 {len(sql_statements)} statements SQL criados")
    print(f"💡 Execute manualmente via MCP: mcp_supabase_execute_sql")
    
    return len(sql_statements)

if __name__ == "__main__":
    apply_all_stocks_fixed()



