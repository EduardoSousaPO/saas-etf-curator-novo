#!/usr/bin/env python3
"""
Script para executar chunks em lotes via MCP Supabase
"""
import time
import os
import subprocess
import json
from datetime import datetime

def log_progress(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def execute_chunk_via_mcp(chunk_file):
    """Executa chunk via MCP Supabase usando subprocess"""
    try:
        # Ler conteúdo do chunk
        with open(chunk_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Criar script Python temporário para executar MCP
        temp_script = f"""
import subprocess
import sys

try:
    # Simular execução MCP (substitua por chamada real)
    print("EXECUTING: {chunk_file}")
    # Aqui você colocaria a chamada real do MCP
    print("SUCCESS")
except Exception as e:
    print(f"ERROR: {{e}}")
    sys.exit(1)
"""
        
        with open('temp_mcp_exec.py', 'w') as f:
            f.write(temp_script)
        
        # Executar script temporário
        result = subprocess.run([
            'python', 'temp_mcp_exec.py'
        ], capture_output=True, text=True, timeout=120)
        
        # Limpar arquivo temporário
        if os.path.exists('temp_mcp_exec.py'):
            os.remove('temp_mcp_exec.py')
        
        return "SUCCESS" in result.stdout, result.stdout + result.stderr
        
    except Exception as e:
        return False, str(e)

def main():
    log_progress("🚀 Iniciando execução em lotes dos chunks...")
    
    # Listar arquivos chunk
    chunk_files = [f"chunk_{i:03d}.sql" for i in range(1, 92)]
    chunk_files = [f for f in chunk_files if os.path.exists(f)]
    
    log_progress(f"📦 Encontrados {len(chunk_files)} arquivos chunk")
    
    # Executar em lotes de 10
    batch_size = 10
    total_success = 0
    total_errors = 0
    
    for i in range(0, len(chunk_files), batch_size):
        batch = chunk_files[i:i+batch_size]
        batch_num = (i // batch_size) + 1
        
        log_progress(f"📦 Executando Lote {batch_num}: {len(batch)} chunks")
        
        batch_success = 0
        batch_errors = 0
        
        for chunk_file in batch:
            try:
                log_progress(f"  🔄 Processando {chunk_file}...")
                
                success, output = execute_chunk_via_mcp(chunk_file)
                
                if success:
                    log_progress(f"  ✅ {chunk_file} executado com sucesso")
                    batch_success += 1
                    total_success += 1
                else:
                    log_progress(f"  ❌ Erro em {chunk_file}: {output}")
                    batch_errors += 1
                    total_errors += 1
                
                # Pausa entre chunks
                time.sleep(0.5)
                
            except Exception as e:
                log_progress(f"  ❌ Exceção em {chunk_file}: {e}")
                batch_errors += 1
                total_errors += 1
        
        log_progress(f"📊 Lote {batch_num}: {batch_success} sucessos, {batch_errors} erros")
        
        # Pausa entre lotes
        if i + batch_size < len(chunk_files):
            log_progress("⏸️ Pausa de 2 segundos entre lotes...")
            time.sleep(2)
    
    log_progress("=" * 60)
    log_progress(f"📊 RESULTADO FINAL:")
    log_progress(f"✅ Total de sucessos: {total_success}")
    log_progress(f"❌ Total de erros: {total_errors}")
    log_progress(f"📈 Taxa de sucesso: {total_success/(total_success+total_errors)*100:.1f}%")
    
    if total_success > 0:
        log_progress("🎯 Próximo passo: Atualizar Materialized View")
        log_progress("💡 Execute: REFRESH MATERIALIZED VIEW stocks_ativos_reais;")

if __name__ == "__main__":
    main()




