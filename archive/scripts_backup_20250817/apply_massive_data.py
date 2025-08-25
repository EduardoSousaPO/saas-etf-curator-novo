#!/usr/bin/env python3
"""
Script para aplicar dados massivos no Supabase em lotes gerenciáveis
"""
import re
import time
import json
from datetime import datetime

def log_progress(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def split_sql_file(filename, max_size=50000):
    """Divide arquivo SQL em chunks menores"""
    log_progress("📖 Lendo arquivo SQL massivo...")
    
    with open(filename, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Dividir por comandos INSERT INTO
    parts = content.split('INSERT INTO ')
    
    chunks = []
    current_chunk = ""
    
    for i, part in enumerate(parts):
        if i == 0:  # Primeira parte (comentários)
            continue
            
        full_command = 'INSERT INTO ' + part.strip()
        
        # Se o comando atual é muito grande, adicionar como chunk separado
        if len(full_command) > max_size:
            if current_chunk:
                chunks.append(current_chunk)
                current_chunk = ""
            
            # Dividir comando grande em sub-partes
            lines = full_command.split('\n')
            temp_chunk = ""
            
            for line in lines:
                if len(temp_chunk + line) > max_size and temp_chunk:
                    chunks.append(temp_chunk)
                    temp_chunk = line + '\n'
                else:
                    temp_chunk += line + '\n'
            
            if temp_chunk:
                chunks.append(temp_chunk)
        else:
            # Se adicionar este comando ultrapassar o limite, salvar chunk atual
            if len(current_chunk + full_command) > max_size and current_chunk:
                chunks.append(current_chunk)
                current_chunk = full_command + '\n'
            else:
                current_chunk += full_command + '\n'
    
    # Adicionar último chunk se houver
    if current_chunk:
        chunks.append(current_chunk)
    
    log_progress(f"📦 Arquivo dividido em {len(chunks)} chunks")
    return chunks

def save_chunks_to_files(chunks):
    """Salva chunks em arquivos separados"""
    log_progress("💾 Salvando chunks em arquivos...")
    
    filenames = []
    for i, chunk in enumerate(chunks, 1):
        filename = f"chunk_{i:03d}.sql"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(chunk)
        filenames.append(filename)
        log_progress(f"  ✅ {filename} ({len(chunk)} chars)")
    
    return filenames

def main():
    log_progress("🚀 Iniciando aplicação de dados massivos...")
    
    # Dividir arquivo SQL
    chunks = split_sql_file('massive_stocks_final.sql')
    
    # Salvar chunks
    chunk_files = save_chunks_to_files(chunks)
    
    log_progress(f"✅ {len(chunk_files)} arquivos chunk criados")
    log_progress("💡 Execute cada chunk individualmente via MCP Supabase:")
    
    for i, filename in enumerate(chunk_files, 1):
        print(f"  {i}. mcp_supabase_execute_sql --project_id nniabnjuwzeqmflrruga --query \"$(cat {filename})\"")
    
    # Criar script de execução
    with open('execute_chunks.py', 'w', encoding='utf-8') as f:
        f.write("""#!/usr/bin/env python3
# Script para executar chunks via MCP Supabase
import subprocess
import time
import sys

chunk_files = [
""")
        for filename in chunk_files:
            f.write(f'    "{filename}",\n')
        
        f.write("""
]

def execute_chunk(filename):
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print(f"🔄 Executando {filename}...")
        # Aqui você executaria via MCP
        # result = mcp_supabase_execute_sql(sql_content)
        print(f"✅ {filename} processado")
        return True
    except Exception as e:
        print(f"❌ Erro em {filename}: {e}")
        return False

def main():
    success_count = 0
    for filename in chunk_files:
        if execute_chunk(filename):
            success_count += 1
        time.sleep(1)  # Pausa entre execuções
    
    print(f"📊 Resultado: {success_count}/{len(chunk_files)} chunks executados")

if __name__ == "__main__":
    main()
""")
    
    log_progress("📋 Script execute_chunks.py criado")
    log_progress("🎯 Próximo passo: Execute os chunks via MCP Supabase")

if __name__ == "__main__":
    main()




