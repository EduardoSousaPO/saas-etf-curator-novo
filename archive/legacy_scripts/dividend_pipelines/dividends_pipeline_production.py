"""
Pipeline de Dividendos - PRODUÇÃO
Versão sem emojis para executar todos os 3.480 ETFs
"""

import yfinance as yf
import pandas as pd
import json
import time
from datetime import datetime
import logging

# Configurar logging sem emojis
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('dividends_production.log', encoding='utf-8'),
        logging.StreamHandler()
    ]
)

class DividendsProductionPipeline:
    def __init__(self):
        self.logger = logging.getLogger(__name__)
        self.processed_count = 0
        self.success_count = 0
        self.failed_etfs = []
        self.start_time = datetime.now()
        
    def get_dividends_robust(self, symbol: str) -> dict:
        """Coletar dividendos usando método robusto testado"""
        try:
            ticker = yf.Ticker(symbol)
            
            # Obter info básica
            try:
                info = ticker.info
                dividend_yield = info.get('dividendYield', 0)
                trailing_annual = info.get('trailingAnnualDividendRate', 0)
            except:
                dividend_yield = 0
                trailing_annual = 0
            
            # Obter histórico de dividendos
            dividends = ticker.dividends
            
            if dividends.empty:
                return {
                    'dividends_12m': 0,
                    'dividends_24m': 0,
                    'dividends_36m': 0,
                    'dividends_all_time': 0,
                    'dividend_yield': dividend_yield,
                    'trailing_annual': trailing_annual,
                    'total_payments': 0,
                    'status': 'no_dividends'
                }
            
            # Método robusto - últimos pagamentos
            total_payments = len(dividends)
            div_all_time = float(dividends.sum())
            
            # Últimos pagamentos (assumindo trimestral = 4 por ano)
            recent_4 = float(dividends.tail(4).sum()) if total_payments >= 4 else float(dividends.sum())
            recent_8 = float(dividends.tail(8).sum()) if total_payments >= 8 else float(dividends.sum())
            recent_12 = float(dividends.tail(12).sum()) if total_payments >= 12 else float(dividends.sum())
            
            result = {
                'dividends_12m': recent_4,  # Últimos 4 pagamentos (~12 meses)
                'dividends_24m': recent_8,  # Últimos 8 pagamentos (~24 meses)
                'dividends_36m': recent_12, # Últimos 12 pagamentos (~36 meses)
                'dividends_all_time': div_all_time,
                'dividend_yield': dividend_yield,
                'trailing_annual': trailing_annual,
                'total_payments': total_payments,
                'status': 'success'
            }
            
            # Considerar sucesso se tiver qualquer dividendo
            if recent_4 > 0 or div_all_time > 0:
                self.success_count += 1
            
            return result
            
        except Exception as e:
            self.logger.warning(f"Erro ao processar {symbol}: {str(e)}")
            self.failed_etfs.append(symbol)
            return {
                'dividends_12m': 0,
                'dividends_24m': 0,
                'dividends_36m': 0,
                'dividends_all_time': 0,
                'dividend_yield': 0,
                'trailing_annual': 0,
                'total_payments': 0,
                'status': 'error',
                'error': str(e)[:100]
            }
    
    def load_etfs_symbols(self) -> list:
        """Carregar símbolos dos ETFs do arquivo JSON do pipeline"""
        try:
            with open('complete_pipeline_results_v2_20250626_192643.json', 'r', encoding='utf-8') as f:
                data = json.load(f)
                symbols = [etf['symbol'] for etf in data]
                self.logger.info(f"Carregados {len(symbols)} simbolos ETF do pipeline")
                return symbols
        except Exception as e:
            self.logger.error(f"Erro ao carregar ETFs: {e}")
            return []
    
    def save_checkpoint(self, results: list, checkpoint_num: int):
        """Salvar checkpoint durante processamento"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'dividends_checkpoint_prod_{checkpoint_num:03d}_{timestamp}.json'
        
        checkpoint_data = {
            'checkpoint_info': {
                'checkpoint_number': checkpoint_num,
                'total_processed': len(results),
                'success_count': self.success_count,
                'failed_count': len(self.failed_etfs),
                'created_at': datetime.now().isoformat()
            },
            'results': results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(checkpoint_data, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Checkpoint {checkpoint_num} salvo: {filename}")
        return filename
    
    def run_production_pipeline(self, batch_size: int = 100, delay: float = 0.05) -> dict:
        """Executar pipeline de produção para todos os ETFs"""
        
        self.logger.info("INICIANDO PIPELINE DE PRODUCAO DE DIVIDENDOS")
        self.logger.info(f"Configuracao: batch_size={batch_size}, delay={delay}s")
        
        # Carregar ETFs
        etf_symbols = self.load_etfs_symbols()
        if not etf_symbols:
            self.logger.error("Nenhum ETF encontrado!")
            return {}
        
        total_etfs = len(etf_symbols)
        self.logger.info(f"Total de ETFs para processar: {total_etfs}")
        
        results = []
        checkpoint_interval = 500  # Checkpoint a cada 500 ETFs
        
        # Processar em batches
        for i in range(0, total_etfs, batch_size):
            batch = etf_symbols[i:i+batch_size]
            batch_num = (i // batch_size) + 1
            total_batches = (total_etfs + batch_size - 1) // batch_size
            
            self.logger.info(f"Batch {batch_num}/{total_batches}: Processando {len(batch)} ETFs (posicoes {i+1}-{min(i+batch_size, total_etfs)})")
            
            batch_start = time.time()
            
            for j, symbol in enumerate(batch):
                self.processed_count += 1
                
                # Processar dividendos
                dividends_data = self.get_dividends_robust(symbol)
                
                result = {
                    'symbol': symbol,
                    'processed_at': datetime.now().isoformat(),
                    'position': self.processed_count,
                    **dividends_data
                }
                
                results.append(result)
                
                # Log progresso detalhado para ETFs com dividendos
                if dividends_data['status'] == 'success' and dividends_data['dividends_12m'] > 0:
                    self.logger.info(f"  SUCCESS {symbol}: ${dividends_data['dividends_12m']:.4f} (12m) | {dividends_data['total_payments']} pagamentos")
                elif self.processed_count % 100 == 0:
                    elapsed = (datetime.now() - self.start_time).total_seconds()
                    rate = self.processed_count / elapsed
                    eta_seconds = (total_etfs - self.processed_count) / rate
                    eta_minutes = eta_seconds / 60
                    
                    self.logger.info(f"PROGRESSO: {self.processed_count}/{total_etfs} ({self.processed_count/total_etfs*100:.1f}%) | Com dividendos: {self.success_count} | ETA: {eta_minutes:.1f}min")
                
                # Delay para evitar rate limiting
                time.sleep(delay)
            
            batch_time = time.time() - batch_start
            self.logger.info(f"Batch {batch_num} concluido em {batch_time:.1f}s ({len(batch)/batch_time:.1f} ETFs/s)")
            
            # Checkpoint
            if self.processed_count % checkpoint_interval == 0:
                checkpoint_num = self.processed_count // checkpoint_interval
                self.save_checkpoint(results, checkpoint_num)
            
            # Delay entre batches
            time.sleep(0.5)
        
        # Estatísticas finais
        elapsed_total = (datetime.now() - self.start_time).total_seconds()
        success_rate = (self.success_count / total_etfs) * 100
        
        summary = {
            'total_etfs': total_etfs,
            'processed': self.processed_count,
            'with_dividends': self.success_count,
            'without_dividends': total_etfs - self.success_count,
            'success_rate': success_rate,
            'failed_etfs': len(self.failed_etfs),
            'processing_time_seconds': elapsed_total,
            'processing_time_minutes': elapsed_total / 60,
            'etfs_per_second': total_etfs / elapsed_total,
            'started_at': self.start_time.isoformat(),
            'completed_at': datetime.now().isoformat(),
            'method': 'robust_last_payments_production'
        }
        
        self.logger.info(f"PIPELINE CONCLUIDO!")
        self.logger.info(f"Processados: {total_etfs} ETFs em {elapsed_total/60:.1f} minutos")
        self.logger.info(f"Com dividendos: {self.success_count} ({success_rate:.1f}%)")
        self.logger.info(f"Velocidade: {total_etfs/elapsed_total:.1f} ETFs/segundo")
        
        return {
            'summary': summary,
            'results': results
        }
    
    def save_final_results(self, pipeline_results: dict) -> str:
        """Salvar resultados finais"""
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f'dividends_production_complete_{timestamp}.json'
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(pipeline_results, f, indent=2, ensure_ascii=False)
        
        self.logger.info(f"Resultados finais salvos: {filename}")
        
        # Criar resumo em texto
        summary_filename = f'dividends_production_summary_{timestamp}.txt'
        with open(summary_filename, 'w', encoding='utf-8') as f:
            summary = pipeline_results['summary']
            f.write("=== RESUMO DO PIPELINE DE DIVIDENDOS - PRODUCAO ===\n\n")
            f.write(f"Total de ETFs processados: {summary['total_etfs']}\n")
            f.write(f"ETFs com dividendos: {summary['with_dividends']} ({summary['success_rate']:.1f}%)\n")
            f.write(f"ETFs sem dividendos: {summary['without_dividends']}\n")
            f.write(f"Tempo de processamento: {summary['processing_time_minutes']:.1f} minutos\n")
            f.write(f"Velocidade: {summary['etfs_per_second']:.1f} ETFs/segundo\n")
            f.write(f"Iniciado em: {summary['started_at']}\n")
            f.write(f"Concluido em: {summary['completed_at']}\n")
        
        return filename

def main():
    """Função principal"""
    pipeline = DividendsProductionPipeline()
    
    print("PIPELINE DE DIVIDENDOS - PRODUCAO - ETF CURATOR")
    print("=" * 60)
    print("Processando 3.480 ETFs com dados REAIS de dividendos")
    print("Metodo: Ultimos pagamentos (robusto, testado)")
    print("Checkpoints automaticos a cada 500 ETFs")
    print("=" * 60)
    
    # Executar pipeline
    results = pipeline.run_production_pipeline(batch_size=100, delay=0.05)
    
    if results:
        # Salvar resultados
        filename = pipeline.save_final_results(results)
        
        print(f"\nPIPELINE CONCLUIDO COM SUCESSO!")
        print(f"Arquivo principal: {filename}")
        print(f"ETFs processados: {results['summary']['processed']}")
        print(f"ETFs com dividendos: {results['summary']['with_dividends']}")
        print(f"Taxa de sucesso: {results['summary']['success_rate']:.1f}%")
        print(f"Tempo total: {results['summary']['processing_time_minutes']:.1f} minutos")
    else:
        print("Pipeline falhou!")

if __name__ == "__main__":
    main() 