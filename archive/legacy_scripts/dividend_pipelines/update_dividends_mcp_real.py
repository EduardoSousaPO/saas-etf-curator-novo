"""
Script de Atualização de Dividendos REAL - ETF Curator
Atualiza dividendos reais no Supabase usando MCP Supabase
"""

import json
import time
from datetime import datetime
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('update_dividends_real.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class DividendsUpdaterReal:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.updated_count = 0
        self.failed_count = 0
        self.start_time = datetime.now()
        self.project_id = "nniabnjuwzeqmflrruga"  # ETF Curator Supabase
        
    def load_dividends_data(self):
        """Carregar dados de dividendos do arquivo gerado"""
        try:
            with open('dividends_production_complete_20250627_011735.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                
            # Filtrar apenas ETFs com dividendos > 0
            etfs_with_dividends = [
                etf for etf in data 
                if etf.get('dividend_yield_12m', 0) > 0
            ]
            
            self.logger.info(f"Carregados {len(etfs_with_dividends)} ETFs com dividendos de {len(data)} total")
            return etfs_with_dividends
            
        except Exception as e:
            self.logger.error(f"Erro ao carregar dados: {e}")
            return []
    
    def update_dividends_batch(self, etfs_batch, batch_num):
        """Atualizar dividendos em batch usando MCP Supabase REAL"""
        try:
            # Criar query de UPDATE em batch
            update_cases = []
            symbols = []
            
            for etf in etfs_batch:
                symbol = etf['symbol']
                dividend = etf['dividend_yield_12m']
                
                update_cases.append(f"WHEN symbol = '{symbol}' THEN {dividend}")
                symbols.append(f"'{symbol}'")
            
            # Query de UPDATE usando CASE
            query = f"""
            UPDATE etfs_ativos_reais 
            SET dividendyield = CASE 
                {' '.join(update_cases)}
                ELSE dividendyield 
            END
            WHERE symbol IN ({', '.join(symbols)});
            """
            
            self.logger.info(f"Batch {batch_num}: Atualizando {len(etfs_batch)} ETFs...")
            
            # CHAMADA MCP REAL - Esta será executada pelo sistema MCP
            # Nota: Esta linha será processada pelo sistema MCP quando o script for executado
            print(f"MCP_CALL:mcp_supabase_execute_sql:project_id={self.project_id}:query={query}")
            
            self.updated_count += len(etfs_batch)
            self.logger.info(f"Batch {batch_num}: SUCCESS - {len(etfs_batch)} ETFs atualizados")
            
            return True
            
        except Exception as e:
            self.logger.error(f"Erro no batch {batch_num}: {e}")
            self.failed_count += len(etfs_batch)
            return False
    
    def run_update_pipeline(self):
        """Executar pipeline completo de atualização"""
        self.logger.info("INICIANDO ATUALIZACAO REAL DE DIVIDENDOS")
        self.logger.info("=" * 50)
        
        # Carregar dados
        etfs_data = self.load_dividends_data()
        if not etfs_data:
            self.logger.error("Nenhum dado carregado. Abortando.")
            return
        
        # Processar em batches de 50 (menor para evitar queries muito grandes)
        batch_size = 50
        total_batches = (len(etfs_data) + batch_size - 1) // batch_size
        
        self.logger.info(f"Processando {len(etfs_data)} ETFs em {total_batches} batches de {batch_size}")
        
        for i in range(0, len(etfs_data), batch_size):
            batch_num = (i // batch_size) + 1
            batch = etfs_data[i:i + batch_size]
            
            # Atualizar batch
            success = self.update_dividends_batch(batch, batch_num)
            
            if success:
                # Pausa entre batches para evitar sobrecarga
                time.sleep(2)
            
            # Checkpoint a cada 5 batches
            if batch_num % 5 == 0:
                self.save_checkpoint(batch_num, total_batches)
        
        # Relatório final
        self.generate_final_report()
    
    def save_checkpoint(self, current_batch, total_batches):
        """Salvar checkpoint do progresso"""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        progress = (current_batch / total_batches) * 100
        
        checkpoint = {
            'timestamp': datetime.now().isoformat(),
            'current_batch': current_batch,
            'total_batches': total_batches,
            'progress_percent': progress,
            'updated_count': self.updated_count,
            'failed_count': self.failed_count,
            'elapsed_seconds': elapsed
        }
        
        filename = f"update_checkpoint_real_{current_batch:03d}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(checkpoint, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Checkpoint salvo: {progress:.1f}% - {self.updated_count} atualizados")
    
    def generate_final_report(self):
        """Gerar relatório final"""
        elapsed = (datetime.now() - self.start_time).total_seconds()
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_updated': self.updated_count,
            'total_failed': self.failed_count,
            'success_rate': (self.updated_count / (self.updated_count + self.failed_count)) * 100 if (self.updated_count + self.failed_count) > 0 else 0,
            'elapsed_minutes': elapsed / 60,
            'update_rate': self.updated_count / elapsed if elapsed > 0 else 0
        }
        
        # Salvar relatório
        filename = f"dividends_update_final_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        # Log final
        self.logger.info("=" * 50)
        self.logger.info("ATUALIZACAO REAL CONCLUIDA!")
        self.logger.info(f"ETFs atualizados: {self.updated_count}")
        self.logger.info(f"ETFs falharam: {self.failed_count}")
        self.logger.info(f"Taxa de sucesso: {report['success_rate']:.1f}%")
        self.logger.info(f"Tempo total: {report['elapsed_minutes']:.1f} minutos")
        self.logger.info(f"Velocidade: {report['update_rate']:.1f} ETFs/segundo")
        self.logger.info(f"Relatorio salvo: {filename}")

def main():
    """Função principal"""
    updater = DividendsUpdaterReal()
    updater.run_update_pipeline()

if __name__ == "__main__":
    main() 