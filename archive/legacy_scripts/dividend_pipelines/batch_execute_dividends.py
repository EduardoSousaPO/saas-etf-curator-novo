#!/usr/bin/env python3
"""
Script otimizado para executar atualizações de dividendos em lotes
usando MCP Supabase de forma eficiente
"""

import os
import time
import json
from datetime import datetime

def get_batch_files():
    """Lista todos os arquivos batch_*.sql ordenados"""
    batch_files = []
    for filename in os.listdir('.'):
        if filename.startswith('batch_') and filename.endswith('_update.sql'):
            batch_num = int(filename.replace('batch_', '').replace('_update.sql', ''))
            batch_files.append((batch_num, filename))
    
    batch_files.sort(key=lambda x: x[0])
    return batch_files

def read_sql_file(filename):
    """Lê o conteúdo de um arquivo SQL"""
    with open(filename, 'r', encoding='utf-8') as f:
        return f.read().strip()

def create_mega_batch(start_batch, end_batch):
    """Cria um mega-batch combinando múltiplas queries"""
    batch_files = get_batch_files()
    
    # Filtrar batches no range
    selected_batches = [
        (num, filename) for num, filename in batch_files 
        if start_batch <= num <= end_batch
    ]
    
    if not selected_batches:
        return None
    
    # Combinar queries
    combined_queries = []
    for batch_num, filename in selected_batches:
        query = read_sql_file(filename)
        combined_queries.append(f"-- Batch {batch_num}\n{query}")
    
    return "\n\n".join(combined_queries)

def main():
    print("🚀 EXECUTOR DE LOTES DE DIVIDENDOS")
    print("=" * 45)
    
    batch_files = get_batch_files()
    print(f"📁 Total de batches disponíveis: {len(batch_files)}")
    
    if not batch_files:
        print("❌ Nenhum arquivo batch encontrado!")
        return
    
    print(f"   📊 Range: batch_001 até batch_{len(batch_files):03d}")
    
    # Opções de execução
    print(f"\n📋 OPÇÕES DE EXECUÇÃO:")
    print(f"   1. Executar todos os {len(batch_files)} batches")
    print(f"   2. Executar range específico")
    print(f"   3. Criar mega-batch (combinar múltiplos)")
    print(f"   4. Executar próximos 10 batches")
    print(f"   5. Status atual do banco")
    
    opcao = input(f"\n🤔 Escolha uma opção (1-5): ").strip()
    
    if opcao == "1":
        # Executar todos
        print(f"\n⚠️  Executar TODOS os {len(batch_files)} batches?")
        if input("Confirma? (s/N): ").lower() not in ['s', 'sim']:
            print("❌ Cancelado")
            return
        
        print(f"📝 Execute as queries dos arquivos batch_001_update.sql até batch_{len(batch_files):03d}_update.sql")
        print(f"💡 Use MCP Supabase para cada arquivo")
        
    elif opcao == "2":
        # Range específico
        start = int(input("Batch inicial (ex: 1): "))
        end = int(input("Batch final (ex: 10): "))
        
        mega_query = create_mega_batch(start, end)
        if mega_query:
            filename = f"mega_batch_{start:03d}_to_{end:03d}.sql"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(mega_query)
            print(f"✅ Mega-batch criado: {filename}")
            print(f"📝 Execute este arquivo no MCP Supabase")
        else:
            print("❌ Range inválido")
            
    elif opcao == "3":
        # Mega-batch customizado
        start = int(input("Batch inicial: "))
        end = int(input("Batch final: "))
        
        mega_query = create_mega_batch(start, end)
        if mega_query:
            filename = f"mega_batch_custom_{start:03d}_to_{end:03d}.sql"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(mega_query)
            print(f"✅ Mega-batch customizado criado: {filename}")
            print(f"📊 Batches {start}-{end} combinados")
            print(f"📝 Execute este arquivo no MCP Supabase")
        else:
            print("❌ Range inválido")
            
    elif opcao == "4":
        # Próximos 10
        mega_query = create_mega_batch(3, 12)  # Já executamos 1 e 2
        if mega_query:
            filename = "mega_batch_next_10.sql"
            with open(filename, 'w', encoding='utf-8') as f:
                f.write(mega_query)
            print(f"✅ Próximos 10 batches preparados: {filename}")
            print(f"📊 Batches 3-12 combinados")
            print(f"📝 Execute este arquivo no MCP Supabase")
        
    elif opcao == "5":
        # Status
        print(f"\n📊 VERIFICANDO STATUS DO BANCO...")
        print(f"💡 Execute esta query no MCP Supabase:")
        print(f"""
        SELECT 
            COUNT(*) as total_etfs,
            COUNT(CASE WHEN dividends_12m > 0 THEN 1 END) as etfs_com_dividendos,
            ROUND(COUNT(CASE WHEN dividends_12m > 0 THEN 1 END) * 100.0 / COUNT(*), 2) as percentual
        FROM etfs_ativos_reais;
        """)
        
    else:
        print("❌ Opção inválida")
        return
    
    print(f"\n🎯 Operação concluída!")

if __name__ == "__main__":
    main() 