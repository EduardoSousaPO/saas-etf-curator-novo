#!/usr/bin/env python3
"""
Script para atualizar dividendos usando conexão direta PostgreSQL
Conecta diretamente ao Supabase via psycopg2 e executa todas as atualizações
"""

import json
import time
import psycopg2
from datetime import datetime
import os

# Configurações de conexão Supabase
SUPABASE_CONFIG = {
    'host': 'aws-0-sa-east-1.pooler.supabase.com',
    'port': 6543,
    'database': 'postgres',
    'user': 'postgres.nniabnjuwzeqmflrruga',
    'password': None  # Será solicitada
}

def get_database_password():
    """Solicita a senha do banco de dados"""
    password = input("Digite a senha do banco Supabase: ")
    return password

def load_dividends_data():
    """Carrega os dados de dividendos do arquivo JSON"""
    print("📊 Carregando dados de dividendos...")
    with open('dividends_production_complete_20250627_011735.json', 'r') as f:
        data = json.load(f)
    
    # Filtrar apenas ETFs com dividendos > 0
    etfs_with_dividends = [
        etf for etf in data['results'] 
        if etf['dividends_12m'] > 0
    ]
    
    print(f"✅ {len(etfs_with_dividends)} ETFs com dividendos carregados")
    return etfs_with_dividends

def create_connection():
    """Cria conexão com o banco PostgreSQL"""
    password = get_database_password()
    
    try:
        conn = psycopg2.connect(
            host=SUPABASE_CONFIG['host'],
            port=SUPABASE_CONFIG['port'],
            database=SUPABASE_CONFIG['database'],
            user=SUPABASE_CONFIG['user'],
            password=password
        )
        
        # Configurar autocommit como False para usar transações
        conn.autocommit = False
        
        print("✅ Conexão com Supabase estabelecida com sucesso!")
        return conn
        
    except psycopg2.Error as e:
        print(f"❌ Erro ao conectar com o banco: {e}")
        return None

def create_batch_update_query(etfs_batch):
    """Cria query UPDATE para um batch de ETFs"""
    
    # Construir CASE statement
    case_statements = []
    symbols = []
    
    for etf in etfs_batch:
        symbol = etf['symbol'].replace("'", "''")  # Escapar aspas
        dividend = etf['dividends_12m']
        case_statements.append(f"    WHEN '{symbol}' THEN {dividend}")
        symbols.append(f"'{symbol}'")
    
    # Montar query completa
    query = f"""
UPDATE etfs_ativos_reais 
SET dividends_12m = CASE symbol
{chr(10).join(case_statements)}
END,
updatedat = NOW()
WHERE symbol IN ({', '.join(symbols)});
"""
    
    return query

def execute_dividends_update(conn, etfs_data):
    """Executa a atualização de dividendos em batches"""
    
    cursor = conn.cursor()
    batch_size = 100
    total_batches = (len(etfs_data) + batch_size - 1) // batch_size
    
    print(f"🚀 Iniciando atualização de {len(etfs_data)} ETFs em {total_batches} batches")
    print(f"⏰ Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    start_time = time.time()
    success_count = 0
    error_count = 0
    
    try:
        # Iniciar processamento direto (sem desabilitar triggers)
        print("🔧 Iniciando processamento direto...")
        
        for batch_num in range(total_batches):
            batch_start_time = time.time()
            
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, len(etfs_data))
            batch_etfs = etfs_data[start_idx:end_idx]
            
            print(f"[{batch_num + 1}/{total_batches}] Processando batch com {len(batch_etfs)} ETFs...")
            
            # Criar e executar query
            query = create_batch_update_query(batch_etfs)
            
            try:
                cursor.execute(query)
                rows_affected = cursor.rowcount
                success_count += rows_affected
                
                # Mostrar alguns ETFs do batch
                sample_etfs = batch_etfs[:3]
                sample_info = ", ".join([f"{etf['symbol']}: ${etf['dividends_12m']:.4f}" for etf in sample_etfs])
                if len(batch_etfs) > 3:
                    sample_info += f" ... e mais {len(batch_etfs) - 3} ETFs"
                
                print(f"    ✅ {rows_affected} ETFs atualizados: {sample_info}")
                
                # Commit a cada batch
                conn.commit()
                
                batch_time = time.time() - batch_start_time
                print(f"    ⏱️ Batch concluído em {batch_time:.1f}s")
                
                # Checkpoint a cada 10 batches
                if (batch_num + 1) % 10 == 0:
                    elapsed_time = (time.time() - start_time) / 60
                    progress = ((batch_num + 1) / total_batches) * 100
                    etfs_per_second = success_count / (time.time() - start_time)
                    
                    print(f"CHECKPOINT: {progress:.1f}% concluído")
                    print(f"           {success_count} ETFs atualizados")
                    print(f"           {elapsed_time:.1f} minutos decorridos")
                    print(f"           {etfs_per_second:.1f} ETFs/segundo")
                
                # Pausa pequena entre batches
                time.sleep(0.1)
                
            except psycopg2.Error as e:
                print(f"    ❌ Erro no batch {batch_num + 1}: {e}")
                error_count += len(batch_etfs)
                conn.rollback()  # Rollback apenas este batch
        
        # Finalização do processamento
        print("🔧 Processamento concluído...")
        
        # Verificação final
        print("\n🔍 Verificando resultados finais...")
        cursor.execute("""
            SELECT 
                COUNT(*) as total_etfs,
                COUNT(CASE WHEN dividends_12m > 0 THEN 1 END) as etfs_com_dividendos,
                ROUND(COUNT(CASE WHEN dividends_12m > 0 THEN 1 END) * 100.0 / COUNT(*), 2) as percentual
            FROM etfs_ativos_reais;
        """)
        
        result = cursor.fetchone()
        total_etfs, etfs_com_dividendos, percentual = result
        
        total_time = time.time() - start_time
        etfs_per_second = success_count / total_time
        
        print("=" * 60)
        print("🎉 ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!")
        print(f"📊 ETFs atualizados: {success_count}")
        print(f"📊 Total de ETFs no banco: {total_etfs}")
        print(f"📊 ETFs com dividendos: {etfs_com_dividendos} ({percentual}%)")
        print(f"⏱️ Tempo total: {total_time/60:.1f} minutos")
        print(f"🚀 Velocidade média: {etfs_per_second:.1f} ETFs/segundo")
        print(f"✅ Batches processados: {total_batches}")
        if error_count > 0:
            print(f"❌ Erros: {error_count}")
        print("=" * 60)
        
        # Salvar relatório
        report = {
            'timestamp': datetime.now().isoformat(),
            'etfs_atualizados': success_count,
            'total_etfs_banco': total_etfs,
            'etfs_com_dividendos': etfs_com_dividendos,
            'percentual_com_dividendos': float(percentual),
            'tempo_total_minutos': total_time / 60,
            'velocidade_etfs_segundo': etfs_per_second,
            'batches_processados': total_batches,
            'erros': error_count
        }
        
        report_file = f"dividends_psycopg2_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        print(f"📄 Relatório salvo: {report_file}")
        
    except Exception as e:
        print(f"❌ Erro geral: {e}")
        conn.rollback()
        
    finally:
        cursor.close()

def main():
    """Função principal"""
    print("🚀 ETF Curator - Atualização de Dividendos via PostgreSQL")
    print("=" * 60)
    
    # Verificar se o arquivo de dados existe
    if not os.path.exists('dividends_production_complete_20250627_011735.json'):
        print("❌ Arquivo de dados não encontrado: dividends_production_complete_20250627_011735.json")
        return
    
    # Carregar dados
    etfs_data = load_dividends_data()
    
    if not etfs_data:
        print("❌ Nenhum ETF com dividendos encontrado")
        return
    
    # Conectar ao banco
    conn = create_connection()
    if not conn:
        return
    
    try:
        # Confirmar execução
        print(f"\n⚠️ ATENÇÃO: Você está prestes a atualizar {len(etfs_data)} ETFs no banco de produção!")
        print("Esta operação irá modificar dados reais no Supabase.")
        
        confirm = input("\nDeseja continuar? (s/N): ").lower().strip()
        if confirm != 's':
            print("❌ Operação cancelada pelo usuário")
            return
        
        # Executar atualização
        execute_dividends_update(conn, etfs_data)
        
    finally:
        conn.close()
        print("🔌 Conexão com banco fechada")

if __name__ == "__main__":
    # Verificar se psycopg2 está instalado
    try:
        import psycopg2
    except ImportError:
        print("❌ psycopg2 não está instalado!")
        print("Execute: pip install psycopg2-binary")
        exit(1)
    
    main() 