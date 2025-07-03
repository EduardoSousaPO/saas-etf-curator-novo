#!/usr/bin/env python3
"""
Script de teste para verificar conexão com Supabase
"""

import psycopg2

# Configurações de conexão Supabase
SUPABASE_CONFIG = {
    'host': 'aws-0-sa-east-1.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.nniabnjuwzeqmflrruga',
    'password': None  # Será solicitada
}

def test_connection():
    """Testa a conexão com o banco"""
    password = input("Digite a senha do banco Supabase: ")
    
    try:
        print("🔄 Testando conexão com Supabase...")
        
        conn = psycopg2.connect(
            host=SUPABASE_CONFIG['host'],
            port=SUPABASE_CONFIG['port'],
            database=SUPABASE_CONFIG['database'],
            user=SUPABASE_CONFIG['user'],
            password=password
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
        print("Você pode executar o script principal: python update_dividends_psycopg2.py")
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao conectar: {e}")
        print("\n💡 Dicas:")
        print("- Verifique se a senha está correta")
        print("- Confirme se você tem acesso ao projeto Supabase")
        print("- Teste a conexão via dashboard web primeiro")

if __name__ == "__main__":
    test_connection() 