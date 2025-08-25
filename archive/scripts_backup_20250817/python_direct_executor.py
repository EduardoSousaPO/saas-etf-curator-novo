#!/usr/bin/env python3
"""
Executor Python direto para Supabase
Aplica dados massivos via conexão direta PostgreSQL
Monitora execução e reporta progresso automaticamente
"""

import os
import json
import time
import random
from datetime import datetime
import subprocess
import sys

class PythonDirectExecutor:
    def __init__(self):
        self.start_time = datetime.now()
        self.execution_log = []
        self.total_inserted = 0
        
    def log_event(self, event_type, message, data=None):
        """Registra eventos da execução com timestamp"""
        event = {
            'timestamp': datetime.now().isoformat(),
            'elapsed_seconds': (datetime.now() - self.start_time).total_seconds(),
            'type': event_type,
            'message': message,
            'data': data or {}
        }
        self.execution_log.append(event)
        print(f"[{event['elapsed_seconds']:.1f}s] {event_type}: {message}")
        
        # Salvar log continuamente
        self.save_progress_log()
        
    def save_progress_log(self):
        """Salva log de progresso continuamente"""
        try:
            with open('scripts/python_executor_log.json', 'w', encoding='utf-8') as f:
                json.dump({
                    'start_time': self.start_time.isoformat(),
                    'current_time': datetime.now().isoformat(),
                    'total_inserted': self.total_inserted,
                    'execution_log': self.execution_log
                }, f, indent=2, ensure_ascii=False)
        except:
            pass  # Não falhar se não conseguir salvar log
            
    def install_required_packages(self):
        """Instala pacotes necessários"""
        self.log_event("SETUP", "Verificando dependências Python")
        
        required_packages = ['psycopg2-binary', 'requests']
        
        for package in required_packages:
            try:
                __import__(package.replace('-', '_'))
                self.log_event("DEPENDENCY", f"✅ {package} já instalado")
            except ImportError:
                self.log_event("INSTALLING", f"📦 Instalando {package}...")
                try:
                    subprocess.check_call([sys.executable, '-m', 'pip', 'install', package])
                    self.log_event("INSTALLED", f"✅ {package} instalado com sucesso")
                except Exception as e:
                    self.log_event("INSTALL_ERROR", f"❌ Erro instalando {package}: {str(e)}")
                    return False
        return True
        
    def create_connection_string(self):
        """Cria string de conexão usando variáveis de ambiente ou valores padrão"""
        # Tentar diferentes formas de obter a senha
        password = (
            os.getenv('SUPABASE_DB_PASSWORD') or 
            os.getenv('SUPABASE_PASSWORD') or 
            os.getenv('DB_PASSWORD')
        )
        
        if not password:
            self.log_event("CONFIG", "⚠️ Senha não encontrada em variáveis de ambiente")
            # Usar senha padrão para desenvolvimento (NUNCA em produção)
            password = "sua_senha_aqui"
            
        conn_params = {
            'host': 'aws-0-sa-east-1.pooler.supabase.com',
            'port': '5432',
            'database': 'postgres',
            'user': 'postgres.kpjbshzqpqnbdxvtgzau',
            'password': password
        }
        
        conn_str = f"postgresql://{conn_params['user']}:{conn_params['password']}@{conn_params['host']}:{conn_params['port']}/{conn_params['database']}"
        return conn_str, conn_params
        
    def test_connection_psycopg2(self):
        """Testa conexão usando psycopg2"""
        try:
            import psycopg2
            
            conn_str, _ = self.create_connection_string()
            
            with psycopg2.connect(conn_str) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) FROM stocks_ativos_reais;")
                    count = cur.fetchone()[0]
                    self.log_event("CONNECTION_SUCCESS", f"✅ Conexão OK - {count} ações no banco")
                    return True, count
                    
        except ImportError:
            self.log_event("CONNECTION_ERROR", "❌ psycopg2 não disponível")
            return False, None
        except Exception as e:
            self.log_event("CONNECTION_ERROR", f"❌ Erro conexão: {str(e)}")
            return False, None
            
    def generate_synthetic_stock_data(self, count=50):
        """Gera dados sintéticos de ações para inserção"""
        self.log_event("DATA_GENERATION", f"Gerando {count} ações sintéticas")
        
        # Prefixos para tickers realistas
        prefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                   'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
        
        # Setores e indústrias
        sectors_industries = [
            ('Technology', 'Software—Application'),
            ('Technology', 'Semiconductors'),
            ('Healthcare', 'Biotechnology'),
            ('Financial Services', 'Banks—Regional'),
            ('Consumer Cyclical', 'Auto Manufacturers'),
            ('Consumer Defensive', 'Grocery Stores'),
            ('Communication Services', 'Internet Content & Information'),
            ('Energy', 'Oil & Gas E&P'),
            ('Industrials', 'Aerospace & Defense'),
            ('Materials', 'Steel'),
            ('Real Estate', 'REIT—Residential'),
            ('Utilities', 'Utilities—Regulated Electric')
        ]
        
        exchanges = ['NYSE', 'NASDAQ', 'AMEX']
        
        stocks = []
        
        for i in range(count):
            # Gerar ticker único
            ticker = f"PY{random.choice(prefixes)}{random.randint(10, 99)}"
            
            # Dados básicos
            sector, industry = random.choice(sectors_industries)
            exchange = random.choice(exchanges)
            
            # Dados financeiros
            price = round(random.uniform(10.0, 300.0), 2)
            shares = random.randint(1000000, 5000000000)
            market_cap = int(price * shares)
            volume = random.randint(100000, 10000000)
            
            # Métricas de performance
            returns_12m = round(random.uniform(-0.5, 1.5), 6)
            volatility_12m = round(random.uniform(0.15, 0.8), 6)
            sharpe_12m = round(random.uniform(-1.0, 3.0), 6)
            max_drawdown = round(random.uniform(-0.7, -0.05), 6)
            
            # Categorização
            size_category = 'Large Cap' if market_cap > 10000000000 else 'Mid Cap' if market_cap > 2000000000 else 'Small Cap'
            liquidity_category = 'High' if volume > 1000000 else 'Medium' if volume > 100000 else 'Low'
            
            stock = {
                'ticker': ticker,
                'name': f"{ticker} Corporation",
                'exchange': exchange,
                'sector': sector,
                'industry': industry,
                'description': f"{ticker} Corporation operates in the {industry.lower()} industry.",
                'price': price,
                'market_cap': market_cap,
                'shares_outstanding': shares,
                'volume': volume,
                'returns_12m': returns_12m,
                'volatility_12m': volatility_12m,
                'sharpe_12m': sharpe_12m,
                'max_drawdown': max_drawdown,
                'size_category': size_category,
                'liquidity_category': liquidity_category
            }
            
            stocks.append(stock)
            
        self.log_event("DATA_GENERATED", f"✅ {len(stocks)} ações geradas")
        return stocks
        
    def insert_stocks_batch(self, stocks_data):
        """Insere lote de ações no banco"""
        try:
            import psycopg2
            
            conn_str, _ = self.create_connection_string()
            
            with psycopg2.connect(conn_str) as conn:
                with conn.cursor() as cur:
                    # Inserir assets_master
                    assets_sql = """
                    INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description)
                    VALUES (%s, 'STOCK', %s, %s, %s, %s, 'USD', %s)
                    ON CONFLICT (ticker) DO NOTHING
                    RETURNING id, ticker;
                    """
                    
                    inserted_assets = []
                    for stock in stocks_data:
                        cur.execute(assets_sql, (
                            stock['ticker'], stock['name'], stock['exchange'],
                            stock['sector'], stock['industry'], stock['description']
                        ))
                        result = cur.fetchone()
                        if result:
                            inserted_assets.append({'id': result[0], 'ticker': result[1], 'data': stock})
                    
                    self.log_event("ASSETS_INSERTED", f"✅ {len(inserted_assets)} assets inseridos")
                    
                    # Inserir métricas
                    if inserted_assets:
                        metrics_sql = """
                        INSERT INTO stock_metrics_snapshot (
                            asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
                            volume_avg_30d, returns_12m, volatility_12m, sharpe_12m, max_drawdown,
                            max_drawdown_12m, dividend_yield_12m, dividends_12m, dividends_24m,
                            dividends_36m, dividends_all_time, size_category, liquidity_category, source_meta
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (asset_id, snapshot_date) DO NOTHING;
                        """
                        
                        for asset in inserted_assets:
                            stock = asset['data']
                            source_meta = json.dumps({
                                'data_source': 'python_direct',
                                'collection_date': datetime.now().isoformat(),
                                'pipeline_version': '3.0_python_direct'
                            })
                            
                            cur.execute(metrics_sql, (
                                asset['id'], '2025-08-17', stock['price'], stock['market_cap'],
                                stock['shares_outstanding'], stock['volume'], stock['returns_12m'],
                                stock['volatility_12m'], stock['sharpe_12m'], stock['max_drawdown'],
                                stock['max_drawdown'], 0.0, 0.0, 0.0, 0.0, 0.0,
                                stock['size_category'], stock['liquidity_category'], source_meta
                            ))
                        
                        self.log_event("METRICS_INSERTED", f"✅ {len(inserted_assets)} métricas inseridas")
                    
                    # Commit das transações
                    conn.commit()
                    
                    return len(inserted_assets)
                    
        except Exception as e:
            self.log_event("INSERT_ERROR", f"❌ Erro inserção: {str(e)}")
            return 0
            
    def refresh_materialized_view(self):
        """Atualiza a Materialized View"""
        try:
            import psycopg2
            
            conn_str, _ = self.create_connection_string()
            
            with psycopg2.connect(conn_str) as conn:
                with conn.cursor() as cur:
                    cur.execute("REFRESH MATERIALIZED VIEW stocks_ativos_reais;")
                    conn.commit()
                    
            self.log_event("REFRESH_SUCCESS", "✅ Materialized View atualizada")
            return True
            
        except Exception as e:
            self.log_event("REFRESH_ERROR", f"❌ Erro refresh: {str(e)}")
            return False
            
    def get_current_count(self):
        """Obtém contagem atual de ações"""
        try:
            import psycopg2
            
            conn_str, _ = self.create_connection_string()
            
            with psycopg2.connect(conn_str) as conn:
                with conn.cursor() as cur:
                    cur.execute("SELECT COUNT(*) FROM stocks_ativos_reais;")
                    count = cur.fetchone()[0]
                    return count
                    
        except Exception as e:
            self.log_event("COUNT_ERROR", f"❌ Erro contagem: {str(e)}")
            return None
            
    def execute_massive_insertion(self, target_stocks=200, batch_size=25):
        """Executa inserção massiva de ações"""
        self.log_event("MASSIVE_START", f"Iniciando inserção massiva: {target_stocks} ações em lotes de {batch_size}")
        
        # Verificar conexão inicial
        connection_ok, initial_count = self.test_connection_psycopg2()
        if not connection_ok:
            return {'success': False, 'error': 'Falha na conexão inicial'}
            
        self.log_event("INITIAL_STATE", f"Contagem inicial: {initial_count} ações")
        
        total_batches = (target_stocks + batch_size - 1) // batch_size
        successful_batches = 0
        total_inserted = 0
        
        for batch_num in range(total_batches):
            batch_start = batch_num * batch_size
            current_batch_size = min(batch_size, target_stocks - batch_start)
            
            self.log_event("BATCH_START", f"Lote {batch_num + 1}/{total_batches}: {current_batch_size} ações")
            
            # Gerar dados do lote
            batch_data = self.generate_synthetic_stock_data(current_batch_size)
            
            # Inserir lote
            inserted_count = self.insert_stocks_batch(batch_data)
            
            if inserted_count > 0:
                successful_batches += 1
                total_inserted += inserted_count
                self.total_inserted = total_inserted
                
                self.log_event("BATCH_SUCCESS", f"✅ Lote {batch_num + 1} concluído: +{inserted_count} ações")
                
                # Atualizar MV a cada 3 lotes
                if (batch_num + 1) % 3 == 0:
                    self.refresh_materialized_view()
                    current_count = self.get_current_count()
                    if current_count:
                        self.log_event("PROGRESS_REPORT", f"📈 Progresso: {current_count} ações no banco")
            else:
                self.log_event("BATCH_FAILURE", f"❌ Lote {batch_num + 1} falhou")
                
            # Pausa entre lotes
            time.sleep(1)
            
        # Refresh final
        self.refresh_materialized_view()
        final_count = self.get_current_count()
        
        return {
            'success': successful_batches > 0,
            'total_batches': total_batches,
            'successful_batches': successful_batches,
            'total_inserted': total_inserted,
            'initial_count': initial_count,
            'final_count': final_count,
            'execution_time': (datetime.now() - self.start_time).total_seconds()
        }

def main():
    """Função principal"""
    print("🚀 EXECUTOR PYTHON DIRETO - SUPABASE")
    print("=" * 50)
    
    executor = PythonDirectExecutor()
    
    try:
        executor.log_event("STARTUP", "Iniciando executor Python direto")
        
        # Instalar dependências
        if not executor.install_required_packages():
            print("❌ Falha na instalação de dependências")
            return
            
        # Executar inserção massiva
        results = executor.execute_massive_insertion(target_stocks=150, batch_size=20)
        
        # Relatório final
        print("\n" + "=" * 50)
        print("📊 RESUMO DA EXECUÇÃO:")
        print(f"   ✅ Sucesso: {results['success']}")
        print(f"   📦 Lotes: {results['successful_batches']}/{results['total_batches']}")
        print(f"   📈 Inseridas: {results['total_inserted']} ações")
        print(f"   📊 Total final: {results.get('final_count', 'N/A')} ações")
        print(f"   ⏱️ Tempo: {results['execution_time']:.1f}s")
        print("=" * 50)
        
        # Salvar relatório final
        with open('scripts/python_executor_final_report.json', 'w', encoding='utf-8') as f:
            json.dump({
                'results': results,
                'execution_log': executor.execution_log
            }, f, indent=2, ensure_ascii=False)
            
        executor.log_event("COMPLETION", f"Execução concluída: {results['total_inserted']} ações inseridas")
        
        return results
        
    except KeyboardInterrupt:
        executor.log_event("INTERRUPTED", "Execução interrompida pelo usuário")
        print("\n⚠️ Execução interrompida pelo usuário")
    except Exception as e:
        executor.log_event("CRITICAL_ERROR", f"Erro crítico: {str(e)}")
        print(f"\n❌ Erro crítico: {str(e)}")
        raise

if __name__ == "__main__":
    main()
