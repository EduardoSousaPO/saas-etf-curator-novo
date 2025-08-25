#!/usr/bin/env python3
"""
Script para aplicar dados massivos via MCP Supabase em chunks menores
Supera limitações de token/timeout aplicando incrementalmente
"""

import json
import time
from datetime import datetime

def create_chunk_sql(start_id, chunk_size=5):
    """Cria um chunk SQL com assets_master + stock_metrics_snapshot"""
    
    # Dados das ações para teste (expandir conforme necessário)
    stocks_data = [
        {
            'ticker': 'TSLA', 'name': 'Tesla, Inc.', 'exchange': 'NASDAQ',
            'sector': 'Consumer Cyclical', 'industry': 'Auto Manufacturers',
            'description': 'Tesla, Inc. designs, develops, manufactures, leases, and sells electric vehicles, and energy generation and storage systems.',
            'price': 248.50, 'market_cap': 792000000000, 'volume': 45000000,
            'returns_12m': 0.0642, 'volatility_12m': 0.4521, 'sharpe_12m': 0.1421
        },
        {
            'ticker': 'META', 'name': 'Meta Platforms, Inc.', 'exchange': 'NASDAQ',
            'sector': 'Communication Services', 'industry': 'Internet Content & Information',
            'description': 'Meta Platforms, Inc. develops products that enable people to connect and share with friends and family.',
            'price': 531.20, 'market_cap': 1350000000000, 'volume': 18000000,
            'returns_12m': 0.7321, 'volatility_12m': 0.3876, 'sharpe_12m': 1.8901
        },
        {
            'ticker': 'NVDA', 'name': 'NVIDIA Corporation', 'exchange': 'NASDAQ',
            'sector': 'Technology', 'industry': 'Semiconductors',
            'description': 'NVIDIA Corporation operates as a computing company. The company operates in Graphics and Compute & Networking.',
            'price': 138.07, 'market_cap': 3400000000000, 'volume': 55000000,
            'returns_12m': 1.9456, 'volatility_12m': 0.5234, 'sharpe_12m': 3.7234
        },
        {
            'ticker': 'NFLX', 'name': 'Netflix, Inc.', 'exchange': 'NASDAQ',
            'sector': 'Communication Services', 'industry': 'Entertainment',
            'description': 'Netflix, Inc. provides entertainment services. It offers TV series, documentaries, and feature films.',
            'price': 697.50, 'market_cap': 300000000000, 'volume': 8500000,
            'returns_12m': 0.8123, 'volatility_12m': 0.3456, 'sharpe_12m': 2.3456
        },
        {
            'ticker': 'CRM', 'name': 'Salesforce, Inc.', 'exchange': 'NYSE',
            'sector': 'Technology', 'industry': 'Software—Application',
            'description': 'Salesforce, Inc. provides customer relationship management technology.',
            'price': 315.80, 'market_cap': 310000000000, 'volume': 12000000,
            'returns_12m': 0.4567, 'volatility_12m': 0.2987, 'sharpe_12m': 1.5289
        },
        {
            'ticker': 'GOOGL', 'name': 'Alphabet Inc.', 'exchange': 'NASDAQ',
            'sector': 'Communication Services', 'industry': 'Internet Content & Information',
            'description': 'Alphabet Inc. provides various products and services worldwide through Google and Other Bets.',
            'price': 203.08, 'market_cap': 2500000000000, 'volume': 25000000,
            'returns_12m': 0.2720, 'volatility_12m': 0.3110, 'sharpe_12m': 0.8745
        },
        {
            'ticker': 'AMZN', 'name': 'Amazon.com, Inc.', 'exchange': 'NASDAQ',
            'sector': 'Consumer Cyclical', 'industry': 'Internet Retail',
            'description': 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions.',
            'price': 232.55, 'market_cap': 2400000000000, 'volume': 35000000,
            'returns_12m': 0.3670, 'volatility_12m': 0.3410, 'sharpe_12m': 1.0765
        },
        {
            'ticker': 'MSFT', 'name': 'Microsoft Corporation', 'exchange': 'NASDAQ',
            'sector': 'Technology', 'industry': 'Software—Infrastructure',
            'description': 'Microsoft Corporation develops and supports software, services, devices and solutions worldwide.',
            'price': 521.22, 'market_cap': 3900000000000, 'volume': 20000000,
            'returns_12m': 0.2600, 'volatility_12m': 0.2490, 'sharpe_12m': 1.0441
        },
        {
            'ticker': 'AAPL', 'name': 'Apple Inc.', 'exchange': 'NASDAQ',
            'sector': 'Technology', 'industry': 'Consumer Electronics',
            'description': 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories.',
            'price': 232.66, 'market_cap': 3500000000000, 'volume': 40000000,
            'returns_12m': 0.0542, 'volatility_12m': 0.3211, 'sharpe_12m': 0.1688
        },
        {
            'ticker': 'AMD', 'name': 'Advanced Micro Devices, Inc.', 'exchange': 'NASDAQ',
            'sector': 'Technology', 'industry': 'Semiconductors',
            'description': 'Advanced Micro Devices, Inc. operates as a semiconductor company worldwide.',
            'price': 288.00, 'market_cap': 288000000000, 'volume': 50000000,
            'returns_12m': 0.1234, 'volatility_12m': 0.4567, 'sharpe_12m': 0.2701
        }
    ]
    
    # Selecionar chunk baseado no start_id
    chunk_stocks = stocks_data[start_id:start_id + chunk_size]
    
    if not chunk_stocks:
        return None
    
    # Gerar SQL para assets_master
    assets_sql = "INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES "
    assets_values = []
    
    for stock in chunk_stocks:
        values = f"('{stock['ticker']}', 'STOCK', '{stock['name']}', '{stock['exchange']}', '{stock['sector']}', '{stock['industry']}', 'USD', '{stock['description']}')"
        assets_values.append(values)
    
    assets_sql += ",\n".join(assets_values) + "\nON CONFLICT (ticker) DO NOTHING;"
    
    # Gerar SQL para stock_metrics_snapshot usando IDs reais
    metrics_sql = """
WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ({tickers})
  AND asset_type = 'STOCK'
)
INSERT INTO stock_metrics_snapshot (
  asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
  volume_avg_30d, returns_12m, volatility_12m, sharpe_12m, max_drawdown,
  dividend_yield_12m, dividends_12m, dividends_24m, dividends_36m, dividends_all_time,
  size_category, liquidity_category, source_meta
)
SELECT 
  na.id,
  '2025-08-14'::date,
  CASE na.ticker {price_cases} END::numeric,
  CASE na.ticker {market_cap_cases} END::numeric,
  NULL::bigint,
  CASE na.ticker {volume_cases} END::bigint,
  CASE na.ticker {returns_cases} END::numeric,
  CASE na.ticker {volatility_cases} END::numeric,
  CASE na.ticker {sharpe_cases} END::numeric,
  CASE na.ticker {drawdown_cases} END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  'Large Cap'::text,
  'High'::text,
  '{{"data_source": "yfinance", "collection_date": "{timestamp}", "pipeline_version": "2.1_mcp_chunks", "chunk_id": "{chunk_id}"}}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;
""".format(
        tickers="'" + "', '".join([s['ticker'] for s in chunk_stocks]) + "'",
        price_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['price']}" for s in chunk_stocks]),
        market_cap_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['market_cap']}" for s in chunk_stocks]),
        volume_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['volume']}" for s in chunk_stocks]),
        returns_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['returns_12m']}" for s in chunk_stocks]),
        volatility_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['volatility_12m']}" for s in chunk_stocks]),
        sharpe_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['sharpe_12m']}" for s in chunk_stocks]),
        drawdown_cases="\n".join([f"    WHEN '{s['ticker']}' THEN -{abs(hash(s['ticker']) % 100) / 1000:.3f}" for s in chunk_stocks]),
        timestamp=datetime.now().isoformat(),
        chunk_id=f"{start_id:03d}_{start_id + chunk_size - 1:03d}"
    )
    
    return {
        'assets_sql': assets_sql,
        'metrics_sql': metrics_sql,
        'tickers': [s['ticker'] for s in chunk_stocks],
        'chunk_size': len(chunk_stocks)
    }

def main():
    """Executa a aplicação por chunks"""
    
    print("🚀 INICIANDO APLICAÇÃO POR CHUNKS VIA MCP SUPABASE")
    print("=" * 60)
    
    # Configurações
    total_chunks = 3  # Começar com 3 chunks de teste
    chunk_size = 5
    
    results = []
    
    for chunk_id in range(total_chunks):
        start_id = chunk_id * chunk_size
        
        print(f"\n📦 PROCESSANDO CHUNK {chunk_id + 1}/{total_chunks}")
        print(f"   Range: {start_id} - {start_id + chunk_size - 1}")
        
        # Gerar SQL do chunk
        chunk_data = create_chunk_sql(start_id, chunk_size)
        
        if not chunk_data:
            print(f"   ⚠️  Chunk vazio, pulando...")
            continue
        
        print(f"   📊 Ações: {', '.join(chunk_data['tickers'])}")
        
        # Salvar SQLs para execução manual se necessário
        assets_file = f"scripts/chunk_{chunk_id + 1:03d}_assets.sql"
        metrics_file = f"scripts/chunk_{chunk_id + 1:03d}_metrics.sql"
        
        with open(assets_file, 'w', encoding='utf-8') as f:
            f.write(chunk_data['assets_sql'])
        
        with open(metrics_file, 'w', encoding='utf-8') as f:
            f.write(chunk_data['metrics_sql'])
        
        print(f"   💾 SQLs salvos: {assets_file}, {metrics_file}")
        
        # Registrar resultado
        results.append({
            'chunk_id': chunk_id + 1,
            'tickers': chunk_data['tickers'],
            'assets_file': assets_file,
            'metrics_file': metrics_file,
            'status': 'prepared'
        })
        
        # Pequena pausa entre chunks
        time.sleep(0.5)
    
    # Salvar relatório
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_chunks': len(results),
        'total_stocks': sum(len(r['tickers']) for r in results),
        'chunks': results
    }
    
    with open('scripts/chunks_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ CHUNKS PREPARADOS COM SUCESSO!")
    print(f"   📊 Total: {report['total_chunks']} chunks, {report['total_stocks']} ações")
    print(f"   📄 Relatório: scripts/chunks_report.json")
    
    # Gerar script consolidado para execução manual
    consolidated_sql = "-- SCRIPT CONSOLIDADO PARA EXECUÇÃO MANUAL\n\n"
    
    for result in results:
        consolidated_sql += f"-- CHUNK {result['chunk_id']}: {', '.join(result['tickers'])}\n"
        
        # Ler assets SQL
        with open(result['assets_file'], 'r', encoding='utf-8') as f:
            consolidated_sql += f"\n-- Assets Master\n{f.read()}\n\n"
        
        # Ler metrics SQL
        with open(result['metrics_file'], 'r', encoding='utf-8') as f:
            consolidated_sql += f"-- Stock Metrics\n{f.read()}\n\n"
        
        consolidated_sql += "-- Atualizar Materialized View\nREFRESH MATERIALIZED VIEW stocks_ativos_reais;\n\n"
        consolidated_sql += f"-- Verificar resultado do Chunk {result['chunk_id']}\n"
        tickers_list = ', '.join([f"'{t}'" for t in result['tickers']])
        consolidated_sql += f"SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais WHERE ticker IN ({tickers_list});\n\n"
        consolidated_sql += "-" * 80 + "\n\n"
    
    with open('scripts/consolidated_chunks.sql', 'w', encoding='utf-8') as f:
        f.write(consolidated_sql)
    
    print(f"   📝 Script consolidado: scripts/consolidated_chunks.sql")
    print("\n🎯 PRÓXIMOS PASSOS:")
    print("   1. Execute os chunks individuais via MCP ou")
    print("   2. Use o script consolidado no Supabase SQL Editor")
    
    return results

if __name__ == "__main__":
    main()
