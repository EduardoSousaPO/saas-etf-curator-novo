#!/usr/bin/env python3
"""
Script para executar o arquivo SQL mega-batch completo de dividendos
"""

import subprocess
import time
import json
from datetime import datetime

def execute_mcp_sql(sql_content):
    """Executa SQL usando MCP Supabase"""
    cmd = [
        'npx', 'mcp', 'run', 'mcp-server-supabase',
        'execute_sql',
        '--project_id', 'nniabnjuwzeqmflrruga',
        '--query', sql_content
    ]
    
    try:
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        if result.returncode == 0:
            return True, result.stdout
        else:
            return False, result.stderr
    except subprocess.TimeoutExpired:
        return False, "Timeout after 5 minutes"
    except Exception as e:
        return False, str(e)

def main():
    print("🚀 Executando mega-batch SQL de dividendos...")
    print(f"⏰ Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    # Ler o arquivo SQL
    try:
        with open('dividends_mega_update_20250627_115251.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except FileNotFoundError:
        print("❌ Arquivo SQL não encontrado!")
        return
    
    print(f"📄 Arquivo SQL carregado: {len(sql_content)} caracteres")
    
    # Dividir em chunks menores (cada batch UPDATE)
    batches = sql_content.split('-- Batch ')
    
    # Remover o primeiro elemento vazio
    if batches[0].strip() == '':
        batches = batches[1:]
    
    print(f"📊 Total de batches encontrados: {len(batches)}")
    
    success_count = 0
    total_batches = len(batches)
    
    for i, batch_content in enumerate(batches, 1):
        batch_sql = f"-- Batch {batch_content}"
        
        print(f"\n🔄 Executando Batch {i}/{total_batches}...")
        
        success, result = execute_mcp_sql(batch_sql)
        
        if success:
            print(f"✅ Batch {i} executado com sucesso")
            success_count += 1
        else:
            print(f"❌ Erro no Batch {i}: {result}")
        
        # Pausa entre batches
        if i < total_batches:
            time.sleep(1)
    
    print(f"\n🎯 RESUMO FINAL:")
    print(f"✅ Batches executados com sucesso: {success_count}/{total_batches}")
    print(f"❌ Batches com erro: {total_batches - success_count}")
    print(f"📈 Taxa de sucesso: {(success_count/total_batches)*100:.1f}%")
    print(f"⏰ Fim: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

if __name__ == "__main__":
    main() 