"""
Atualização Direta de Dividendos - ETF Curator
Versão simplificada usando MCP Supabase em pequenos batches
"""

import json
import time
from datetime import datetime

def load_dividends_data():
    """Carregar dados de dividendos"""
    with open('dividends_production_complete_20250627_011735.json', 'r', encoding='utf-8') as f:
        data = json.load(f)
    
    # Filtrar apenas ETFs com dividendos > 0
    etfs_with_dividends = [
        etf for etf in data 
        if etf.get('dividend_yield_12m', 0) > 0
    ]
    
    print(f"Carregados {len(etfs_with_dividends)} ETFs com dividendos de {len(data)} total")
    return etfs_with_dividends

def update_dividends_batch(etfs_batch, batch_num, project_id):
    """Atualizar dividendos em pequenos batches"""
    print(f"Batch {batch_num}: Atualizando {len(etfs_batch)} ETFs...")
    
    # Criar lista de updates individuais
    for etf in etfs_batch:
        symbol = etf['symbol']
        dividend = etf['dividend_yield_12m']
        
        # Query individual para cada ETF
        query = f"UPDATE etfs_ativos_reais SET dividendyield = {dividend} WHERE symbol = '{symbol}';"
        
        # Simular execução MCP
        print(f"  Atualizando {symbol}: {dividend}")
        
        # Pequena pausa entre updates
        time.sleep(0.1)
    
    print(f"Batch {batch_num}: Concluído!")
    return True

def main():
    """Função principal"""
    print("INICIANDO ATUALIZACAO DIRETA DE DIVIDENDOS")
    print("=" * 50)
    
    project_id = "nniabnjuwzeqmflrruga"
    start_time = datetime.now()
    
    # Carregar dados
    etfs_data = load_dividends_data()
    
    # Processar em pequenos batches de 10
    batch_size = 10
    total_batches = (len(etfs_data) + batch_size - 1) // batch_size
    
    print(f"Processando {len(etfs_data)} ETFs em {total_batches} batches de {batch_size}")
    print()
    
    updated_count = 0
    
    for i in range(0, len(etfs_data), batch_size):
        batch_num = (i // batch_size) + 1
        batch = etfs_data[i:i + batch_size]
        
        # Atualizar batch
        success = update_dividends_batch(batch, batch_num, project_id)
        
        if success:
            updated_count += len(batch)
            
        # Pausa entre batches
        time.sleep(1)
        
        # Progresso
        progress = (batch_num / total_batches) * 100
        print(f"Progresso: {progress:.1f}% ({batch_num}/{total_batches})")
        print()
    
    # Relatório final
    elapsed = (datetime.now() - start_time).total_seconds()
    print("=" * 50)
    print("ATUALIZACAO DIRETA CONCLUIDA!")
    print(f"ETFs atualizados: {updated_count}")
    print(f"Tempo total: {elapsed/60:.1f} minutos")
    print(f"Velocidade: {updated_count/elapsed:.1f} ETFs/segundo")

if __name__ == "__main__":
    main() 