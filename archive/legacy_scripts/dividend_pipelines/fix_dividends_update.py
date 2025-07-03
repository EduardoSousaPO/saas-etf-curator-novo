#!/usr/bin/env python3
"""
Script para corrigir a atualização dos dividendos no Supabase
Usa MCP Supabase para garantir que as atualizações funcionem corretamente
"""

import json
import time
from datetime import datetime

def load_dividends_data():
    """Carrega os dados de dividendos do arquivo JSON"""
    with open('dividends_production_complete_20250627_011735.json', 'r') as f:
        data = json.load(f)
    
    # Filtrar apenas ETFs com dividendos > 0
    etfs_with_dividends = [
        etf for etf in data['results'] 
        if etf['dividends_12m'] > 0
    ]
    
    return etfs_with_dividends

def create_update_batches(etfs_data, batch_size=20):
    """Cria batches para atualização"""
    batches = []
    for i in range(0, len(etfs_data), batch_size):
        batch = etfs_data[i:i + batch_size]
        batches.append(batch)
    return batches

def generate_update_query(batch):
    """Gera query UPDATE otimizada para um batch"""
    # Construir CASE WHEN para cada ETF
    cases = []
    symbols = []
    
    for etf in batch:
        symbol = etf['symbol']
        dividend = etf['dividends_12m']
        cases.append(f"WHEN '{symbol}' THEN {dividend}")
        symbols.append(f"'{symbol}'")
    
    # Query UPDATE usando CASE
    query = f"""
    UPDATE etfs_ativos_reais 
    SET dividends_12m = CASE symbol
        {' '.join(cases)}
    END,
    updatedat = NOW()
    WHERE symbol IN ({', '.join(symbols)});
    """
    
    return query.strip()

def main():
    print("🔧 CORREÇÃO DA ATUALIZAÇÃO DE DIVIDENDOS")
    print("=" * 50)
    
    # Carregar dados
    print("📂 Carregando dados de dividendos...")
    etfs_data = load_dividends_data()
    print(f"   ✅ {len(etfs_data)} ETFs com dividendos carregados")
    
    # Criar batches
    batches = create_update_batches(etfs_data, batch_size=20)
    print(f"   📦 {len(batches)} batches criados")
    
    # Confirmar com usuário
    print(f"\n⚠️  ATENÇÃO: Vou atualizar {len(etfs_data)} ETFs no banco Supabase")
    print("   Isso irá corrigir os valores de dividends_12m que estão zerados")
    
    resposta = input("\n🤔 Deseja continuar? (s/N): ").strip().lower()
    if resposta not in ['s', 'sim', 'y', 'yes']:
        print("❌ Operação cancelada pelo usuário")
        return
    
    print(f"\n🚀 Iniciando correção...")
    print(f"   📊 {len(etfs_data)} ETFs para atualizar")
    print(f"   📦 {len(batches)} batches de ~20 ETFs cada")
    print(f"   ⏱️  Estimativa: ~{len(batches) * 3} segundos")
    
    start_time = time.time()
    updated_count = 0
    
    # Processar cada batch
    for i, batch in enumerate(batches, 1):
        print(f"\n[{i}/{len(batches)}] Processando batch com {len(batch)} ETFs...")
        
        # Gerar query
        query = generate_update_query(batch)
        
        # Mostrar alguns exemplos
        examples = [f"{etf['symbol']}: ${etf['dividends_12m']:.4f}" for etf in batch[:3]]
        if len(batch) > 3:
            examples.append(f"... e mais {len(batch) - 3} ETFs")
        print(f"    {', '.join(examples)}")
        
        # Salvar query para debug
        with open(f'batch_{i:03d}_update.sql', 'w') as f:
            f.write(query)
        
        print(f"    💾 Query salva: batch_{i:03d}_update.sql")
        print(f"    ⚡ Use MCP Supabase para executar a query")
        
        updated_count += len(batch)
        
        # Pausa entre batches
        if i < len(batches):
            time.sleep(1)
    
    elapsed_time = time.time() - start_time
    
    print(f"\n🎯 CORREÇÃO PREPARADA!")
    print(f"   📊 {updated_count} ETFs preparados para atualização")
    print(f"   📁 {len(batches)} arquivos SQL criados")
    print(f"   ⏱️  Tempo de preparação: {elapsed_time:.1f} segundos")
    
    print(f"\n📋 PRÓXIMOS PASSOS:")
    print(f"   1. Execute as queries SQL usando MCP Supabase")
    print(f"   2. Verifique se os dados foram atualizados corretamente")
    print(f"   3. Remova os arquivos batch_*.sql temporários")

if __name__ == "__main__":
    main() 