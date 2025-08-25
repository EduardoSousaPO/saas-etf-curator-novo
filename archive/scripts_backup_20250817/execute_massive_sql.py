#!/usr/bin/env python3
"""
Script para executar o arquivo SQL massivo no Supabase via MCP
"""
import json
import subprocess
import sys
import time
import re

def execute_mcp_supabase(query):
    """Executa query no Supabase via MCP"""
    try:
        # Comando MCP para executar SQL
        cmd = [
            'python', '-c', f'''
import subprocess
import json

# Executar via MCP Supabase
result = subprocess.run([
    "mcp", "call", "supabase", "execute_sql",
    "--project_id", "nniabnjuwzeqmflrruga",
    "--query", """{query}"""
], capture_output=True, text=True, timeout=300)

if result.returncode == 0:
    print("SUCCESS")
    print(result.stdout)
else:
    print("ERROR")
    print(result.stderr)
'''
        ]
        
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
        
        if "SUCCESS" in result.stdout:
            return True, result.stdout
        else:
            return False, result.stderr
            
    except Exception as e:
        return False, str(e)

def main():
    print("🚀 Iniciando execução do SQL massivo...")
    
    # Ler arquivo SQL
    try:
        with open('massive_stocks_final.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except Exception as e:
        print(f"❌ Erro ao ler arquivo SQL: {e}")
        return
    
    # Dividir por comandos INSERT
    insert_commands = sql_content.split('INSERT INTO')
    
    print(f"📊 Total de comandos INSERT encontrados: {len(insert_commands)-1}")
    
    success_count = 0
    error_count = 0
    
    for i, command in enumerate(insert_commands[1:], 1):  # Skip primeiro elemento vazio
        try:
            # Reconstituir comando completo
            full_command = 'INSERT INTO' + command.strip()
            
            # Limitar tamanho do comando (máximo 50KB)
            if len(full_command) > 50000:
                print(f"⚠️  Comando {i} muito grande ({len(full_command)} chars), pulando...")
                continue
            
            print(f"🔄 Executando comando {i}/{len(insert_commands)-1}...")
            
            success, result = execute_mcp_supabase(full_command)
            
            if success:
                print(f"✅ Comando {i} executado com sucesso")
                success_count += 1
            else:
                print(f"❌ Erro no comando {i}: {result}")
                error_count += 1
            
            # Pequena pausa entre comandos
            time.sleep(0.5)
            
        except Exception as e:
            print(f"❌ Erro no comando {i}: {e}")
            error_count += 1
    
    print(f"\n📊 RESULTADO FINAL:")
    print(f"✅ Sucessos: {success_count}")
    print(f"❌ Erros: {error_count}")
    print(f"📈 Taxa de sucesso: {success_count/(success_count+error_count)*100:.1f}%")

if __name__ == "__main__":
    main()




