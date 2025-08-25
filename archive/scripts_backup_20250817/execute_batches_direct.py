#!/usr/bin/env python3
"""
Executor direto dos lotes SQL via Python
Aplica os arquivos mass_batch_*.sql diretamente no Supabase
"""

import os
import time
import glob
from datetime import datetime

def execute_sql_batch(batch_file):
    """Executa um arquivo SQL batch"""
    print(f"🔄 Executando {batch_file}...")
    
    try:
        import psycopg2
        
        # String de conexão configurada
        conn_str = "postgresql://postgres.kpjbshzqpqnbdxvtgzau:Catolico02041302@aws-0-sa-east-1.pooler.supabase.com:5432/postgres"
        
        # Ler arquivo SQL
        with open(batch_file, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        # Executar SQL
        with psycopg2.connect(conn_str) as conn:
            with conn.cursor() as cur:
                cur.execute(sql_content)
                conn.commit()
        
        print(f"✅ {batch_file} executado com sucesso!")
        return True
        
    except ImportError:
        print("❌ psycopg2 não instalado. Instale com: pip install psycopg2-binary")
        return False
    except Exception as e:
        print(f"❌ Erro executando {batch_file}: {str(e)}")
        return False

def main():
    """Executa todos os lotes sequencialmente"""
    print("🚀 EXECUTANDO LOTES SQL DIRETAMENTE")
    print("=" * 50)
    
    # Encontrar todos os arquivos mass_batch
    batch_files = sorted(glob.glob("scripts/mass_batch_*.sql"))
    
    if not batch_files:
        print("❌ Nenhum arquivo mass_batch_*.sql encontrado")
        return
    
    print(f"📦 Encontrados {len(batch_files)} lotes para executar")
    
    # Senha já configurada - prosseguir com execução
    
    successful = 0
    
    for i, batch_file in enumerate(batch_files, 1):
        print(f"\n📦 Lote {i}/{len(batch_files)}: {batch_file}")
        
        if execute_sql_batch(batch_file):
            successful += 1
            
            # Verificar progresso a cada 3 lotes
            if i % 3 == 0:
                print(f"📊 Progresso: {successful}/{i} lotes executados")
        
        # Pausa entre lotes
        time.sleep(1)
    
    print(f"\n🎉 EXECUÇÃO CONCLUÍDA!")
    print(f"✅ Sucessos: {successful}/{len(batch_files)}")
    
    if successful > 0:
        print("\n📊 Verificar resultado:")
        print("   SELECT COUNT(*) FROM stocks_ativos_reais;")

if __name__ == "__main__":
    main()
