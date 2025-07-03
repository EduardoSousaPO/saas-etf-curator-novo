#!/usr/bin/env python3
"""
Script de teste para verificar conexão com Supabase - VERSÃO CORRIGIDA
"""

import psycopg2

# Configurações de conexão Supabase - CORRIGIDAS
SUPABASE_CONFIG = {
    'host': 'aws-0-sa-east-1.pooler.supabase.com',
    'port': 5432,  # Porta direta (não pgbouncer)
    'database': 'postgres',
    'user': 'postgres.nniabnjuwzeqmflrruga',
    'password': None,  # Será solicitada
    'sslmode': 'require'  # SSL obrigatório
}

def test_connection():
    """Testa a conexão com o banco"""
    password = input("Digite a senha do banco Supabase: ")
    
    try:
        print("🔄 Testando conexão com Supabase (porta 5432 + SSL)...")
        
        conn = psycopg2.connect(
            host=SUPABASE_CONFIG['host'],
            port=SUPABASE_CONFIG['port'],
            database=SUPABASE_CONFIG['database'],
            user=SUPABASE_CONFIG['user'],
            password=password,
            sslmode=SUPABASE_CONFIG['sslmode']
        )
        
        cursor = conn.cursor()
        
        # Teste simples: contar ETFs
        cursor.execute("SELECT COUNT(*) FROM etfs_ativos_reais;")
        total_etfs = cursor.fetchone()[0]
        
        # Teste: contar ETFs com dividendos
        cursor.execute("SELECT COUNT(*) FROM etfs_ativos_reais WHERE dividends_12m > 0;")
        etfs_com_dividendos = cursor.fetchone()[0]
        
        print("✅ Conexão estabelecida com sucesso!")
        print(f"📊 Total de ETFs no banco: {total_etfs}")
        print(f"💰 ETFs com dividendos: {etfs_com_dividendos}")
        print(f"📈 Percentual: {(etfs_com_dividendos/total_etfs)*100:.1f}%")
        
        cursor.close()
        conn.close()
        
        print("\n🎯 Conexão testada com sucesso!")
        print("✅ Configurações corretas encontradas!")
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao conectar: {e}")
        
        # Tentar sem SSL como fallback
        print("\n🔄 Tentando sem SSL...")
        try:
            conn = psycopg2.connect(
                host=SUPABASE_CONFIG['host'],
                port=SUPABASE_CONFIG['port'],
                database=SUPABASE_CONFIG['database'],
                user=SUPABASE_CONFIG['user'],
                password=password,
                sslmode='disable'
            )
            
            cursor = conn.cursor()
            cursor.execute("SELECT COUNT(*) FROM etfs_ativos_reais;")
            total_etfs = cursor.fetchone()[0]
            
            print("✅ Conexão sem SSL funcionou!")
            print(f"📊 Total de ETFs: {total_etfs}")
            
            cursor.close()
            conn.close()
            
        except psycopg2.Error as e2:
            print(f"❌ Erro sem SSL: {e2}")
            
            # Tentar porta 6543 como último recurso
            print("\n🔄 Tentando porta 6543...")
            try:
                conn = psycopg2.connect(
                    host=SUPABASE_CONFIG['host'],
                    port=6543,
                    database=SUPABASE_CONFIG['database'],
                    user=SUPABASE_CONFIG['user'],
                    password=password,
                    sslmode='prefer'
                )
                
                cursor = conn.cursor()
                cursor.execute("SELECT COUNT(*) FROM etfs_ativos_reais;")
                total_etfs = cursor.fetchone()[0]
                
                print("✅ Conexão porta 6543 funcionou!")
                print(f"📊 Total de ETFs: {total_etfs}")
                
                cursor.close()
                conn.close()
                
            except psycopg2.Error as e3:
                print(f"❌ Erro porta 6543: {e3}")
                print("\n💡 Soluções:")
                print("1. Verifique se o projeto Supabase está ativo")
                print("2. Confirme as credenciais no dashboard")
                print("3. Teste a conexão via Supabase Dashboard primeiro")

if __name__ == "__main__":
    test_connection() 