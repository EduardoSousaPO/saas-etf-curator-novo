"""
Script de Limpeza do Projeto ETF Curator
Remove arquivos temporários e organiza o projeto
"""

import os
import glob
import shutil
from datetime import datetime

def cleanup_project():
    """Limpar arquivos temporários do projeto"""
    
    print("🧹 LIMPEZA DO PROJETO ETF CURATOR")
    print("=" * 50)
    
    # Arquivos IMPORTANTES para MANTER
    keep_files = {
        # Arquivos principais
        'complete_pipeline_results_v2_20250626_192643.json',  # Dados principais
        'etfs_eua.xlsx',  # Arquivo original
        'etfs_import_FINAL_20250626_232220.csv',  # CSV final que funcionou
        
        # Documentação
        'OPCOES_INSERCAO_RAPIDA.md',
        'EXECUCAO_OPCAO_1_COMPLETA.md',
        
        # Pipeline de dividendos atual
        'dividends_pipeline_production.py',
        'dividends_production.log',
    }
    
    # Padrões de arquivos para REMOVER
    remove_patterns = [
        # Testes de dividendos
        'test_dividends_*.py',
        'test_dividends_*.json',
        
        # Checkpoints antigos
        'dividends_checkpoint_*.json',
        'insertion_checkpoint_*.json',
        
        # Progresso do pipeline antigo
        'pipeline_progress_*.json',
        
        # CSVs intermediários com problemas
        'etfs_import_20250626_230750.csv',
        'etfs_import_CORRIGIDO_*.csv',
        
        # Logs antigos
        'insert_*.log',
        'execute_*.log',
        'mass_insert_*.log',
        'complete_mcp_*.log',
        'dividends_pipeline_full.log',
        
        # Arquivos de teste SQL
        'test_insert_query.sql',
        
        # Relatórios de inserção antigos
        'insertion_demo_report_*.json',
        'insert_*_real_*.log',
        
        # Scripts de teste de dividendos
        'dividends_pipeline_full.py',
        'dividends_pipeline_complete_*.json',
        'dividends_summary_*.txt',
        'monitor_dividends.py',
        'test_dividends_*.py',
    ]
    
    removed_files = []
    removed_size = 0
    
    # Remover arquivos da raiz
    print("\n📁 Limpando arquivos da raiz...")
    for pattern in remove_patterns:
        files = glob.glob(pattern)
        for file in files:
            if file not in keep_files and os.path.isfile(file):
                size = os.path.getsize(file)
                removed_size += size
                removed_files.append(f"{file} ({size/1024/1024:.1f}MB)")
                os.remove(file)
                print(f"  ❌ Removido: {file}")
    
    # Remover arquivos específicos da pasta scripts
    print("\n📁 Limpando pasta scripts...")
    scripts_remove_patterns = [
        'scripts/etf_results_*.json',
        'scripts/test_*.py',
        'scripts/debug_*.py',
        'scripts/analyze_*.py',
        'scripts/check_*.py',
        'scripts/etf_pipeline_real.py',  # Arquivo vazio
    ]
    
    for pattern in scripts_remove_patterns:
        files = glob.glob(pattern)
        for file in files:
            if os.path.isfile(file):
                size = os.path.getsize(file)
                removed_size += size
                removed_files.append(f"{file} ({size/1024/1024:.1f}MB)")
                os.remove(file)
                print(f"  ❌ Removido: {file}")
    
    # Remover cache Python
    print("\n📁 Limpando cache Python...")
    if os.path.exists('__pycache__'):
        shutil.rmtree('__pycache__')
        print("  ❌ Removido: __pycache__/")
    
    # Relatório final
    print("\n" + "=" * 50)
    print("✅ LIMPEZA CONCLUÍDA!")
    print(f"📊 Arquivos removidos: {len(removed_files)}")
    print(f"💾 Espaço liberado: {removed_size/1024/1024:.1f}MB")
    
    # Arquivos importantes mantidos
    print(f"\n📋 ARQUIVOS IMPORTANTES MANTIDOS:")
    for file in keep_files:
        if os.path.exists(file):
            size = os.path.getsize(file)
            print(f"  ✅ {file} ({size/1024/1024:.1f}MB)")
    
    # Estrutura final
    print(f"\n📁 ESTRUTURA FINAL LIMPA:")
    print("  ✅ complete_pipeline_results_v2_20250626_192643.json (dados principais)")
    print("  ✅ etfs_eua.xlsx (arquivo original)")
    print("  ✅ etfs_import_FINAL_20250626_232220.csv (CSV final)")
    print("  ✅ dividends_pipeline_production.py (pipeline atual)")
    print("  ✅ dividends_production.log (log atual)")
    print("  ✅ backup_etf_data_20250626/ (backup completo)")
    print("  ✅ Documentação (.md)")

if __name__ == "__main__":
    cleanup_project() 