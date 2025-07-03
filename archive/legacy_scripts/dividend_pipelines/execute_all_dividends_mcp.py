#!/usr/bin/env python3
"""
Script para executar TODOS os dividendos via MCP Supabase
Execução completa e automática de todos os 3.121 ETFs
"""

import json
import time
from datetime import datetime

def load_all_dividends():
    """Carrega todos os ETFs com dividendos do arquivo JSON"""
    print("📊 Carregando dados completos de dividendos...")
    
    try:
        with open('dividends_production_complete_20250627_011735.json', 'r') as f:
            data = json.load(f)
        
        # Filtrar apenas ETFs com dividendos > 0
        etfs_with_dividends = []
        for etf in data.get('results', []):
            if etf.get('dividends_12m', 0) > 0:
                etfs_with_dividends.append({
                    'symbol': etf['symbol'],
                    'dividends_12m': etf['dividends_12m']
                })
        
        print(f"✅ {len(etfs_with_dividends)} ETFs com dividendos carregados")
        return etfs_with_dividends
        
    except Exception as e:
        print(f"❌ Erro: {e}")
        return []

def create_batch_query(etfs_batch):
    """Cria query UPDATE para um batch"""
    case_statements = []
    symbols = []
    
    for etf in etfs_batch:
        symbol = etf['symbol'].replace("'", "''")
        dividend = etf['dividends_12m']
        case_statements.append(f"    WHEN '{symbol}' THEN {dividend}")
        symbols.append(f"'{symbol}'")
    
    query = f"""UPDATE etfs_ativos_reais 
SET dividends_12m = CASE symbol
{chr(10).join(case_statements)}
END,
updatedat = NOW()
WHERE symbol IN ({', '.join(symbols)});"""
    
    return query

def main():
    print("🚀 EXECUÇÃO COMPLETA DE DIVIDENDOS VIA MCP")
    print("=" * 50)
    
    # Carregar dados
    all_etfs = load_all_dividends()
    if not all_etfs:
        print("❌ Falha ao carregar dados")
        return
    
    batch_size = 20
    total_batches = (len(all_etfs) + batch_size - 1) // batch_size
    
    print(f"🎯 Meta: {len(all_etfs)} ETFs em {total_batches} batches")
    print(f"⏰ Início: {datetime.now().strftime('%H:%M:%S')}")
    
    # Gerar todas as queries
    print("\n📝 Gerando queries SQL...")
    
    for batch_num in range(total_batches):
        start_idx = batch_num * batch_size
        end_idx = min(start_idx + batch_size, len(all_etfs))
        batch_etfs = all_etfs[start_idx:end_idx]
        
        query = create_batch_query(batch_etfs)
        
        # Salvar query
        filename = f"mcp_batch_{batch_num + 1:03d}.sql"
        with open(filename, 'w') as f:
            f.write(f"-- Batch {batch_num + 1}/{total_batches} - {len(batch_etfs)} ETFs\n")
            f.write(f"-- Símbolos: {', '.join([etf['symbol'] for etf in batch_etfs[:5]])}")
            if len(batch_etfs) > 5:
                f.write(f" ... e mais {len(batch_etfs) - 5}")
            f.write("\n\n")
            f.write(query)
        
        # Mostrar progresso
        if (batch_num + 1) % 10 == 0:
            progress = ((batch_num + 1) / total_batches) * 100
            print(f"    📊 {progress:.1f}% - {batch_num + 1} batches preparados")
    
    print(f"\n✅ {total_batches} arquivos SQL criados!")
    print("💡 Execute cada mcp_batch_XXX.sql via MCP para completar a atualização")
    
    # Criar script master
    with open('execute_all_mcp_batches.txt', 'w') as f:
        f.write("INSTRUÇÕES PARA EXECUÇÃO COMPLETA VIA MCP\n")
        f.write("=" * 50 + "\n\n")
        f.write(f"Total de batches: {total_batches}\n")
        f.write(f"Total de ETFs: {len(all_etfs)}\n\n")
        f.write("Execute cada comando abaixo:\n\n")
        
        for i in range(total_batches):
            f.write(f"# Batch {i+1}/{total_batches}\n")
            f.write(f"# Execute: mcp_batch_{i+1:03d}.sql\n\n")
    
    print("📄 Instruções salvas em: execute_all_mcp_batches.txt")

if __name__ == "__main__":
    main() 