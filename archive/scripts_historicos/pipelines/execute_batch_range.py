#!/usr/bin/env python3
"""
Script para executar um range específico de batches de dividendos
Otimizado para execução rápida via MCP Supabase
"""

import os
import re
import time
import logging
from pathlib import Path
from typing import List, Tuple

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

def read_batch_sql(file_path: Path) -> str:
    """Ler e limpar conteúdo SQL do arquivo de batch"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Extrair apenas o comando UPDATE (remover comentários)
        lines = content.split('\n')
        sql_lines = []
        
        for line in lines:
            line = line.strip()
            if line and not line.startswith('--'):
                sql_lines.append(line)
        
        return ' '.join(sql_lines)
        
    except Exception as e:
        logger.error(f"❌ Erro ao ler {file_path}: {str(e)}")
        return None

def execute_batch_range(start_batch: int, end_batch: int):
    """Executar range de batches especificado"""
    
    project_id = "nniabnjuwzeqmflrruga"
    
    logger.info(f"🚀 Executando batches {start_batch} a {end_batch}")
    logger.info(f"📊 Projeto Supabase: {project_id}")
    
    executed_count = 0
    failed_count = 0
    failed_batches = []
    
    start_time = time.time()
    
    for batch_num in range(start_batch, end_batch + 1):
        batch_file = Path(f'mcp_batch_{batch_num:03d}.sql')
        
        if not batch_file.exists():
            logger.warning(f"⚠️ Arquivo {batch_file} não encontrado")
            failed_count += 1
            failed_batches.append(batch_num)
            continue
        
        # Ler SQL
        sql_content = read_batch_sql(batch_file)
        if not sql_content:
            logger.error(f"❌ Falha ao ler batch {batch_num}")
            failed_count += 1
            failed_batches.append(batch_num)
            continue
        
        # Imprimir comando MCP para execução manual
        logger.info(f"🔄 Batch {batch_num}:")
        print(f"\n# BATCH {batch_num}")
        print("mcp_supabase_execute_sql(")
        print(f'    project_id="{project_id}",')
        print(f'    query="""{sql_content}"""')
        print(")")
        print()
        
        executed_count += 1
        
        # Delay pequeno entre batches
        time.sleep(0.5)
    
    # Relatório
    total_time = time.time() - start_time
    total_processed = executed_count + failed_count
    success_rate = (executed_count / total_processed) * 100 if total_processed > 0 else 0
    
    logger.info("=" * 60)
    logger.info(f"📊 RELATÓRIO - BATCHES {start_batch} a {end_batch}")
    logger.info("=" * 60)
    logger.info(f"✅ Batches processados: {executed_count}")
    logger.info(f"❌ Batches falharam: {failed_count}")
    logger.info(f"📈 Taxa de sucesso: {success_rate:.1f}%")
    logger.info(f"⏱️ Tempo total: {total_time:.2f}s")
    
    if failed_batches:
        logger.info(f"⚠️ Batches que falharam: {failed_batches}")

def main():
    """Função principal"""
    
    # Executar batches 64-73 (próximos 10)
    execute_batch_range(64, 73)

if __name__ == "__main__":
    main() 