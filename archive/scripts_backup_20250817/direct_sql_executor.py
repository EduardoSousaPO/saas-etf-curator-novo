#!/usr/bin/env python3
"""
Executor direto de SQL via conexão PostgreSQL
Aplica lotes diretamente no Supabase sem depender do MCP
"""

import os
import json
import time
import subprocess
from datetime import datetime

class DirectSQLExecutor:
    def __init__(self):
        self.start_time = datetime.now()
        self.execution_log = []
        
        # Configurações do Supabase (usar variáveis de ambiente em produção)
        self.db_config = {
            'host': 'aws-0-sa-east-1.pooler.supabase.com',
            'port': '5432',
            'database': 'postgres',
            'user': 'postgres.kpjbshzqpqnbdxvtgzau',
            # Senha deve ser fornecida via variável de ambiente
            'password': os.getenv('SUPABASE_DB_PASSWORD', '')
        }
        
    def log_event(self, event_type, message, data=None):
        """Registra eventos da execução"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'elapsed_seconds': (datetime.now() - self.start_time).total_seconds(),
            'type': event_type,
            'message': message,
            'data': data or {}
        }
        self.execution_log.append(event)
        print(f"[{event['elapsed_seconds']:.1f}s] {event_type}: {message}")
        
    def create_connection_string(self):
        """Cria string de conexão PostgreSQL"""
        if not self.db_config['password']:
            self.log_event("CONFIG_ERROR", "❌ Senha do banco não configurada (SUPABASE_DB_PASSWORD)")
            return None
            
        conn_str = (
            f"postgresql://{self.db_config['user']}:{self.db_config['password']}"
            f"@{self.db_config['host']}:{self.db_config['port']}/{self.db_config['database']}"
        )
        return conn_str
        
    def test_connection(self):
        """Testa conexão com o banco"""
        self.log_event("CONNECTION_TEST", "Testando conexão direta com Supabase")
        
        conn_str = self.create_connection_string()
        if not conn_str:
            return False
            
        try:
            # Tentar conexão via psql
            cmd = ['psql', conn_str, '-c', 'SELECT COUNT(*) FROM stocks_ativos_reais;']
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                count = result.stdout.strip().split('\n')[-2].strip()
                self.log_event("CONNECTION_SUCCESS", f"✅ Conexão OK - {count} ações no banco")
                return True
            else:
                self.log_event("CONNECTION_ERROR", f"❌ Erro psql: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            self.log_event("CONNECTION_ERROR", "❌ Timeout na conexão")
            return False
        except FileNotFoundError:
            self.log_event("CONNECTION_ERROR", "❌ psql não encontrado - tentando método alternativo")
            return self.test_connection_python()
        except Exception as e:
            self.log_event("CONNECTION_ERROR", f"❌ Erro inesperado: {str(e)}")
            return False
            
    def test_connection_python(self):
        """Testa conexão usando psycopg2 (se disponível)"""
        try:
            import psycopg2
            
            conn_str = self.create_connection_string()
            if not conn_str:
                return False
                
            with psycopg2.connect(conn_str) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) FROM stocks_ativos_reais;")
                    count = cur.fetchone()[0]
                    self.log_event("CONNECTION_SUCCESS", f"✅ Conexão Python OK - {count} ações no banco")
                    return True
                    
        except ImportError:
            self.log_event("CONNECTION_ERROR", "❌ psycopg2 não instalado")
            return False
        except Exception as e:
            self.log_event("CONNECTION_ERROR", f"❌ Erro Python: {str(e)}")
            return False
            
    def execute_sql_file_psql(self, sql_file):
        """Executa arquivo SQL via psql"""
        self.log_event("SQL_EXECUTION", f"Executando {sql_file} via psql")
        
        conn_str = self.create_connection_string()
        if not conn_str:
            return {'success': False, 'error': 'Conexão não disponível'}
            
        try:
            cmd = ['psql', conn_str, '-f', sql_file]
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=120)
            
            if result.returncode == 0:
                self.log_event("SQL_SUCCESS", f"✅ {sql_file} executado com sucesso")
                return {
                    'success': True,
                    'stdout': result.stdout,
                    'stderr': result.stderr
                }
            else:
                self.log_event("SQL_ERROR", f"❌ Erro executando {sql_file}: {result.stderr}")
                return {
                    'success': False,
                    'error': result.stderr,
                    'stdout': result.stdout
                }
                
        except subprocess.TimeoutExpired:
            self.log_event("SQL_ERROR", f"❌ Timeout executando {sql_file}")
            return {'success': False, 'error': 'Timeout'}
        except Exception as e:
            self.log_event("SQL_ERROR", f"❌ Erro inesperado: {str(e)}")
            return {'success': False, 'error': str(e)}
            
    def execute_sql_file_python(self, sql_file):
        """Executa arquivo SQL via Python"""
        try:
            import psycopg2
            
            conn_str = self.create_connection_string()
            if not conn_str:
                return {'success': False, 'error': 'Conexão não disponível'}
                
            with open(sql_file, 'r', encoding='utf-8') as f:
                sql_content = f.read()
                
            with psycopg2.connect(conn_str) as conn:
                with conn.cursor() as cur:
                    cur.execute(sql_content)
                    conn.commit()
                    
            self.log_event("SQL_SUCCESS", f"✅ {sql_file} executado via Python")
            return {'success': True}
            
        except ImportError:
            return {'success': False, 'error': 'psycopg2 não disponível'}
        except Exception as e:
            self.log_event("SQL_ERROR", f"❌ Erro Python: {str(e)}")
            return {'success': False, 'error': str(e)}
            
    def execute_batch_file(self, batch_file):
        """Executa um arquivo de lote"""
        self.log_event("BATCH_START", f"Iniciando execução de {batch_file}")
        
        # Tentar psql primeiro, depois Python
        result = self.execute_sql_file_psql(batch_file)
        
        if not result['success'] and 'psql não encontrado' in str(result.get('error', '')):
            result = self.execute_sql_file_python(batch_file)
            
        return result
        
    def monitor_progress(self):
        """Monitora progresso atual do banco"""
        self.log_event("MONITORING", "Verificando progresso atual")
        
        conn_str = self.create_connection_string()
        if not conn_str:
            return {'error': 'Conexão não disponível'}
            
        try:
            # Tentar via psql
            cmd = ['psql', conn_str, '-t', '-c', 
                   'SELECT COUNT(*) as total FROM stocks_ativos_reais;']
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=30)
            
            if result.returncode == 0:
                count = int(result.stdout.strip())
                self.log_event("PROGRESS", f"📊 Progresso atual: {count} ações no banco")
                return {'total_stocks': count}
            else:
                return {'error': result.stderr}
                
        except Exception as e:
            return {'error': str(e)}
            
    def execute_all_batches(self):
        """Executa todos os lotes sintéticos"""
        self.log_event("BATCH_EXECUTION", "Iniciando execução de todos os lotes")
        
        # Verificar lotes disponíveis
        batch_files = []
        for i in range(1, 9):
            batch_file = f"scripts/synthetic_batch_{i:03d}.sql"
            if os.path.exists(batch_file):
                batch_files.append(batch_file)
                
        self.log_event("BATCH_DISCOVERY", f"Encontrados {len(batch_files)} lotes")
        
        if not batch_files:
            self.log_event("BATCH_ERROR", "❌ Nenhum lote encontrado")
            return {'success': False, 'error': 'Nenhum lote encontrado'}
            
        # Testar conexão antes de começar
        if not self.test_connection():
            self.log_event("BATCH_ERROR", "❌ Falha na conexão - abortando execução")
            return {'success': False, 'error': 'Falha na conexão'}
            
        # Executar lotes
        successful_batches = 0
        failed_batches = 0
        
        for i, batch_file in enumerate(batch_files, 1):
            self.log_event("BATCH_PROCESSING", f"Processando lote {i}/{len(batch_files)}: {batch_file}")
            
            result = self.execute_batch_file(batch_file)
            
            if result['success']:
                successful_batches += 1
                self.log_event("BATCH_SUCCESS", f"✅ Lote {i} concluído com sucesso")
                
                # Monitorar progresso a cada 2 lotes
                if i % 2 == 0:
                    progress = self.monitor_progress()
                    if 'total_stocks' in progress:
                        self.log_event("PROGRESS_REPORT", f"📈 Total no banco: {progress['total_stocks']} ações")
            else:
                failed_batches += 1
                self.log_event("BATCH_FAILURE", f"❌ Lote {i} falhou: {result.get('error', 'Erro desconhecido')}")
                
            # Pausa entre lotes
            time.sleep(2)
            
        # Resultado final
        final_progress = self.monitor_progress()
        
        return {
            'success': successful_batches > 0,
            'total_batches': len(batch_files),
            'successful_batches': successful_batches,
            'failed_batches': failed_batches,
            'final_stock_count': final_progress.get('total_stocks', 'unknown'),
            'execution_time': (datetime.now() - self.start_time).total_seconds()
        }

def main():
    """Função principal"""
    print("🚀 EXECUTOR DIRETO SQL - SUPABASE")
    print("=" * 50)
    
    # Verificar se senha está configurada
    if not os.getenv('SUPABASE_DB_PASSWORD'):
        print("⚠️  ATENÇÃO: Variável SUPABASE_DB_PASSWORD não configurada")
        print("   Configure com: set SUPABASE_DB_PASSWORD=sua_senha")
        print("   Ou execute: $env:SUPABASE_DB_PASSWORD='sua_senha'")
        return
        
    executor = DirectSQLExecutor()
    
    try:
        executor.log_event("STARTUP", "Iniciando executor direto SQL")
        
        # Executar todos os lotes
        results = executor.execute_all_batches()
        
        # Relatório final
        print("\n" + "=" * 50)
        print("📊 RESUMO DA EXECUÇÃO:")
        print(f"   ✅ Sucesso: {results['success']}")
        print(f"   📦 Lotes: {results['successful_batches']}/{results['total_batches']}")
        print(f"   📈 Ações no banco: {results['final_stock_count']}")
        print(f"   ⏱️  Tempo: {results['execution_time']:.1f}s")
        print("=" * 50)
        
        # Salvar relatório
        with open('scripts/direct_sql_execution_report.json', 'w', encoding='utf-8') as f:
            json.dump({
                'results': results,
                'execution_log': executor.execution_log
            }, f, indent=2, ensure_ascii=False)
            
        return results
        
    except Exception as e:
        executor.log_event("CRITICAL_ERROR", f"Erro crítico: {str(e)}")
        raise

if __name__ == "__main__":
    main()
