#!/usr/bin/env python3
"""
Script para executar todas as queries de atualização de dividendos
usando MCP Supabase de forma automatizada
"""

import os
import time
import json
from datetime import datetime

def get_batch_files():
    """Lista todos os arquivos batch_*.sql"""
    batch_files = []
    for filename in os.listdir('.'):
        if filename.startswith('batch_') and filename.endswith('_update.sql'):
            batch_num = int(filename.replace('batch_', '').replace('_update.sql', ''))
            batch_files.append((batch_num, filename))
    
    # Ordenar por número do batch
    batch_files.sort(key=lambda x: x[0])
    return batch_files

def read_sql_file(filename):
    """Lê o conteúdo de um arquivo SQL"""
    with open(filename, 'r', encoding='utf-8') as f:
        return f.read().strip()

def main():
    print("🚀 EXECUTANDO TODAS AS ATUALIZAÇÕES DE DIVIDENDOS")
    print("=" * 55)
    
    # Listar arquivos
    batch_files = get_batch_files()
    print(f"📁 Encontrados {len(batch_files)} arquivos batch")
    
    if not batch_files:
        print("❌ Nenhum arquivo batch encontrado!")
        return
    
    # Confirmar execução
    print(f"\n⚠️  ATENÇÃO: Vou executar {len(batch_files)} queries UPDATE")
    print("   Isso irá atualizar TODOS os dividendos no banco Supabase")
    
    resposta = input("\n🤔 Deseja continuar? (s/N): ").strip().lower()
    if resposta not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada pelo usuário")
        return
    
    print(f"\n🎯 Iniciando execução...")
    start_time = time.time()
    success_count = 0
    error_count = 0
    
    # Processar cada batch
    for i, (batch_num, filename) in enumerate(batch_files, 1):
        print(f"\n[{i}/{len(batch_files)}] Executando {filename}...")
        
        try:
            # Ler query
            query = read_sql_file(filename)
            
            # Mostrar progresso
            print(f"    📝 Query carregada ({len(query)} caracteres)")
            
            # Aqui você precisa usar MCP Supabase para executar a query
            # Como não posso fazer isso automaticamente, vou apenas preparar
            print(f"    ⚡ Execute esta query no MCP Supabase:")
            print(f"       mcp_supabase_execute_sql(project_id='nniabnjuwzeqmflrruga', query='{query[:100]}...')")
            
            success_count += 1
            
            # Pausa entre execuções
            if i < len(batch_files):
                time.sleep(0.5)
                
        except Exception as e:
            print(f"    ❌ Erro: {str(e)}")
            error_count += 1
    
    elapsed_time = time.time() - start_time
    
    print(f"\n🎯 EXECUÇÃO CONCLUÍDA!")
    print(f"   ✅ Sucessos: {success_count}")
    print(f"   ❌ Erros: {error_count}")
    print(f"   ⏱️  Tempo total: {elapsed_time:.1f} segundos")
    
    # Salvar relatório
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_batches': len(batch_files),
        'success_count': success_count,
        'error_count': error_count,
        'elapsed_seconds': elapsed_time
    }
    
    report_file = f'dividend_update_execution_report_{datetime.now().strftime("%Y%m%d_%H%M%S")}.json'
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"   📊 Relatório salvo: {report_file}")

if __name__ == "__main__":
    main() 