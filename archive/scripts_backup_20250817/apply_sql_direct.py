#!/usr/bin/env python3
"""
Script para aplicar SQL diretamente via subprocess MCP
"""
import subprocess
import sys
import time

def execute_sql_via_mcp(sql_query):
    """Executa SQL via MCP Supabase"""
    try:
        # Usar subprocess para chamar MCP diretamente
        result = subprocess.run([
            sys.executable, '-c', f'''
import subprocess
import sys

# Comando MCP
cmd = [
    "python", "-m", "mcp_supabase", "execute_sql",
    "--project_id", "nniabnjuwzeqmflrruga", 
    "--query", """{sql_query.replace('"', '\\"')}"""
]

try:
    result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
    if result.returncode == 0:
        print("SUCCESS")
    else:
        print(f"ERROR: {{result.stderr}}")
except Exception as e:
    print(f"ERROR: {{e}}")
'''
        ], capture_output=True, text=True, timeout=180)
        
        return "SUCCESS" in result.stdout
        
    except Exception as e:
        print(f"Erro: {e}")
        return False

def main():
    print("🚀 Aplicando dados das ações no Supabase...")
    
    # Primeiro, vamos inserir dados básicos de algumas ações para teste
    test_inserts = [
        """INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency) 
           VALUES ('AAPL', 'STOCK', 'Apple Inc.', 'NASDAQ', 'Technology', 'Consumer Electronics', 'USD')
           ON CONFLICT (ticker) DO NOTHING;""",
        
        """INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency) 
           VALUES ('MSFT', 'STOCK', 'Microsoft Corporation', 'NASDAQ', 'Technology', 'Software', 'USD')
           ON CONFLICT (ticker) DO NOTHING;""",
        
        """INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency) 
           VALUES ('GOOGL', 'STOCK', 'Alphabet Inc.', 'NASDAQ', 'Technology', 'Internet Content & Information', 'USD')
           ON CONFLICT (ticker) DO NOTHING;"""
    ]
    
    print("🔄 Testando inserção de ações principais...")
    
    success_count = 0
    for i, sql in enumerate(test_inserts, 1):
        print(f"Inserindo ação {i}/3...")
        if execute_sql_via_mcp(sql):
            print(f"✅ Ação {i} inserida com sucesso")
            success_count += 1
        else:
            print(f"❌ Erro ao inserir ação {i}")
        time.sleep(1)
    
    print(f"\n📊 Resultado do teste: {success_count}/3 ações inseridas")
    
    if success_count > 0:
        print("\n✅ Teste bem-sucedido! O sistema está funcionando.")
        print("💡 O arquivo SQL completo está disponível em: massive_stocks_final.sql")
        print("📋 Para aplicar todos os dados, execute o arquivo em lotes menores.")
    else:
        print("\n❌ Teste falhou. Verifique a conexão com o Supabase.")

if __name__ == "__main__":
    main()




