#!/usr/bin/env python3
"""
Script para dividir o arquivo SQL massivo em chunks menores e executar via MCP Supabase
"""
import os
import math

def split_sql_file(input_file, chunk_size_kb=50):
    """Divide o arquivo SQL em chunks menores"""
    
    chunk_size_bytes = chunk_size_kb * 1024
    
    with open(input_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Dividir por INSERT statements para manter integridade
    insert_statements = []
    current_statement = ""
    
    for line in content.split('\n'):
        if line.strip().startswith('INSERT INTO assets_master'):
            if current_statement:
                insert_statements.append(current_statement.strip())
            current_statement = line
        elif line.strip().startswith('INSERT INTO stock_metrics_snapshot'):
            if current_statement:
                insert_statements.append(current_statement.strip())
            current_statement = line
        elif line.strip().startswith('INSERT INTO stock_prices_daily'):
            if current_statement:
                insert_statements.append(current_statement.strip())
            current_statement = line
        elif line.strip() and not line.startswith('--'):
            current_statement += "\n" + line
    
    if current_statement:
        insert_statements.append(current_statement.strip())
    
    print(f"📊 Total de statements: {len(insert_statements)}")
    
    # Separar por tipo de tabela
    assets_statements = []
    metrics_statements = []
    prices_statements = []
    
    for stmt in insert_statements:
        if 'INSERT INTO assets_master' in stmt:
            assets_statements.append(stmt)
        elif 'INSERT INTO stock_metrics_snapshot' in stmt:
            metrics_statements.append(stmt)
        elif 'INSERT INTO stock_prices_daily' in stmt:
            prices_statements.append(stmt)
    
    print(f"📊 Assets: {len(assets_statements)}")
    print(f"📊 Metrics: {len(metrics_statements)}")
    print(f"📊 Prices: {len(prices_statements)}")
    
    # Criar chunks
    chunk_num = 1
    
    # Primeiro, todos os assets_master
    for i in range(0, len(assets_statements), 50):  # 50 statements por chunk
        chunk_content = "\n".join(assets_statements[i:i+50])
        chunk_filename = f"scripts/chunk_{chunk_num:02d}_assets.sql"
        
        with open(chunk_filename, 'w', encoding='utf-8') as f:
            f.write("-- CHUNK DE ASSETS_MASTER\n")
            f.write(chunk_content)
        
        print(f"✅ Chunk {chunk_num} criado: {chunk_filename} ({len(chunk_content)} chars)")
        chunk_num += 1
    
    # Depois, todos os stock_metrics_snapshot  
    for i in range(0, len(metrics_statements), 50):  # 50 statements por chunk
        chunk_content = "\n".join(metrics_statements[i:i+50])
        chunk_filename = f"scripts/chunk_{chunk_num:02d}_metrics.sql"
        
        with open(chunk_filename, 'w', encoding='utf-8') as f:
            f.write("-- CHUNK DE STOCK_METRICS_SNAPSHOT\n")
            f.write(chunk_content)
        
        print(f"✅ Chunk {chunk_num} criado: {chunk_filename} ({len(chunk_content)} chars)")
        chunk_num += 1
    
    # Por último, stock_prices_daily (em chunks menores devido ao volume)
    for i in range(0, len(prices_statements), 10):  # 10 statements por chunk (mais dados por statement)
        chunk_content = "\n".join(prices_statements[i:i+10])
        chunk_filename = f"scripts/chunk_{chunk_num:02d}_prices.sql"
        
        with open(chunk_filename, 'w', encoding='utf-8') as f:
            f.write("-- CHUNK DE STOCK_PRICES_DAILY\n")
            f.write(chunk_content)
        
        print(f"✅ Chunk {chunk_num} criado: {chunk_filename} ({len(chunk_content)} chars)")
        chunk_num += 1
    
    total_chunks = chunk_num - 1
    print(f"🎉 Total de chunks criados: {total_chunks}")
    
    return total_chunks

if __name__ == "__main__":
    input_file = "scripts/massive_stocks_final.sql"
    
    if not os.path.exists(input_file):
        print(f"❌ Arquivo não encontrado: {input_file}")
        exit(1)
    
    print("🔄 Dividindo arquivo SQL massivo em chunks...")
    total_chunks = split_sql_file(input_file)
    print(f"✅ Processo concluído! {total_chunks} chunks criados.")