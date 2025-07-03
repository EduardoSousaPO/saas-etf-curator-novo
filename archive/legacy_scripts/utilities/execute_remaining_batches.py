#!/usr/bin/env python3
"""
Script para executar MASSIVAMENTE todos os batches restantes
Execução otimizada de 18 até 157 (140 batches restantes)
"""

import glob
import time
from datetime import datetime

def get_remaining_batches(start_from=18):
    """Obtém todos os batches restantes a partir do número especificado"""
    all_batches = []
    
    for i in range(start_from, 158):  # 18 até 157
        filename = f'mcp_batch_{i:03d}.sql'
        try:
            with open(filename, 'r', encoding='utf-8') as f:
                content = f.read()
                
            # Extrair query UPDATE
            lines = content.split('\n')
            query_lines = []
            in_query = False
            
            for line in lines:
                if line.strip().startswith('UPDATE'):
                    in_query = True
                if in_query:
                    query_lines.append(line)
                    if line.strip().endswith(';'):
                        break
            
            query = '\n'.join(query_lines)
            all_batches.append({
                'batch_num': i,
                'filename': filename,
                'query': query
            })
            
        except Exception as e:
            print(f"❌ Erro ao processar {filename}: {e}")
    
    return all_batches

def print_batch_for_execution(batch):
    """Imprime o batch formatado para execução MCP"""
    print(f"\n# BATCH {batch['batch_num']}/157")
    print("# Execute via MCP:")
    print("mcp_supabase_execute_sql(")
    print('    project_id="nniabnjuwzeqmflrruga",')
    print(f'    query="""{batch["query"]}"""')
    print(")")
    print("-" * 50)

def main():
    print("🚀 EXECUÇÃO MASSIVA DOS BATCHES RESTANTES")
    print("=" * 60)
    
    # Obter batches restantes
    remaining_batches = get_remaining_batches(18)
    total_remaining = len(remaining_batches)
    
    print(f"📊 Status: 17/157 batches já executados (10.8%)")
    print(f"🎯 Restam: {total_remaining} batches para executar")
    print(f"📈 Meta: {total_remaining * 20} ETFs restantes")
    print(f"⏰ Início: {datetime.now().strftime('%H:%M:%S')}")
    
    print("\n" + "=" * 60)
    print("📝 QUERIES PARA EXECUÇÃO VIA MCP")
    print("=" * 60)
    
    # Imprimir todos os batches para execução
    for i, batch in enumerate(remaining_batches):
        print_batch_for_execution(batch)
        
        # Pausa a cada 10 batches para não sobrecarregar
        if (i + 1) % 10 == 0:
            progress = ((i + 1) / total_remaining) * 100
            print(f"\n📊 PROGRESSO: {progress:.1f}% - {i + 1}/{total_remaining} batches preparados")
            
            # Opção de continuar ou parar
            user_input = input("\n⏸️  Pressione ENTER para continuar ou 'q' para parar: ")
            if user_input.lower() == 'q':
                print("⏹️  Execução interrompida pelo usuário")
                break
    
    print(f"\n✅ TODOS OS {total_remaining} BATCHES FORAM PREPARADOS!")
    print("💡 Execute cada query via MCP para completar a atualização")
    print("🎉 Após executar todos: 3.121 ETFs com dividendos COMPLETOS!")

if __name__ == "__main__":
    main() 