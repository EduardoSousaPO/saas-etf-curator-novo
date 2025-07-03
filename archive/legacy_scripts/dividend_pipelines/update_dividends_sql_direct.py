#!/usr/bin/env python3
"""
Script otimizado para atualizar dividendos usando SQL direto
Executa todas as queries de uma vez no banco Supabase
"""

import json
import os
import time
from datetime import datetime

def load_dividends_data():
    """Carrega os dados de dividendos do arquivo JSON"""
    with open('dividends_production_complete_20250627_011735.json', 'r') as f:
        data = json.load(f)
    
    # Filtrar apenas ETFs com dividendos > 0
    etfs_with_dividends = [
        etf for etf in data['results'] 
        if etf['dividends_12m'] > 0
    ]
    
    return etfs_with_dividends

def create_mega_sql_update(etfs_data):
    """Cria uma única query SQL gigante com todos os updates"""
    
    # Dividir em chunks de 100 ETFs por query (limite do SQL)
    chunk_size = 100
    sql_queries = []
    
    for i in range(0, len(etfs_data), chunk_size):
        chunk = etfs_data[i:i + chunk_size]
        
        # Criar CASE statement para este chunk
        case_statements = []
        symbols = []
        
        for etf in chunk:
            symbol = etf['symbol']
            dividend = etf['dividends_12m']
            case_statements.append(f"WHEN '{symbol}' THEN {dividend}")
            symbols.append(f"'{symbol}'")
        
        # Criar query UPDATE
        sql = f"""UPDATE etfs_ativos_reais 
SET dividends_12m = CASE symbol
    {' '.join(case_statements)}
END,
updatedat = NOW()
WHERE symbol IN ({', '.join(symbols)});"""
        
        sql_queries.append(sql)
    
    return sql_queries

def save_sql_file(sql_queries):
    """Salva todas as queries em um arquivo SQL único"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"dividends_mega_update_{timestamp}.sql"
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write("-- MEGA UPDATE DE DIVIDENDOS - GERADO AUTOMATICAMENTE\n")
        f.write(f"-- Data: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        f.write(f"-- Total de queries: {len(sql_queries)}\n\n")
        
        for i, query in enumerate(sql_queries, 1):
            f.write(f"-- Batch {i}\n")
            f.write(query)
            f.write("\n\n")
    
    return filename

def main():
    print("🔄 CARREGANDO DADOS DE DIVIDENDOS...")
    etfs_data = load_dividends_data()
    print(f"📊 {len(etfs_data)} ETFs com dividendos encontrados")
    
    print("\n🔨 CRIANDO QUERIES SQL...")
    sql_queries = create_mega_sql_update(etfs_data)
    print(f"📝 {len(sql_queries)} queries SQL criadas")
    
    print("\n💾 SALVANDO ARQUIVO SQL...")
    filename = save_sql_file(sql_queries)
    print(f"✅ Arquivo salvo: {filename}")
    
    print(f"\n🎯 RESUMO:")
    print(f"   📊 ETFs a atualizar: {len(etfs_data)}")
    print(f"   📝 Queries geradas: {len(sql_queries)}")
    print(f"   📄 Arquivo SQL: {filename}")
    
    print(f"\n🚀 PRÓXIMOS PASSOS:")
    print(f"   1. Execute o arquivo SQL no Supabase")
    print(f"   2. Ou use o MCP Supabase para executar as queries")
    print(f"   3. Verifique os resultados no banco")

if __name__ == "__main__":
    main() 