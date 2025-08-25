#!/usr/bin/env python3
"""
Script para gerar lotes sintéticos de ações para aplicação imediata
Cria dados realistas para superar limitações e popular rapidamente o banco
"""

import json
import random
from datetime import datetime

def generate_synthetic_stocks(count=100):
    """Gera dados sintéticos de ações baseados em padrões reais"""
    
    # Prefixos e sufixos comuns para tickers
    prefixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    suffixes = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z']
    
    # Setores e indústrias
    sectors_industries = [
        ('Technology', 'Software—Application'),
        ('Technology', 'Semiconductors'),
        ('Technology', 'Consumer Electronics'),
        ('Healthcare', 'Biotechnology'),
        ('Healthcare', 'Drug Manufacturers—General'),
        ('Financial Services', 'Banks—Regional'),
        ('Financial Services', 'Insurance—Life'),
        ('Consumer Cyclical', 'Auto Manufacturers'),
        ('Consumer Cyclical', 'Internet Retail'),
        ('Consumer Defensive', 'Grocery Stores'),
        ('Consumer Defensive', 'Beverages—Non-Alcoholic'),
        ('Communication Services', 'Internet Content & Information'),
        ('Communication Services', 'Entertainment'),
        ('Energy', 'Oil & Gas E&P'),
        ('Energy', 'Oil & Gas Refining & Marketing'),
        ('Industrials', 'Aerospace & Defense'),
        ('Industrials', 'Railroads'),
        ('Materials', 'Steel'),
        ('Materials', 'Chemicals'),
        ('Real Estate', 'REIT—Residential'),
        ('Real Estate', 'REIT—Office'),
        ('Utilities', 'Utilities—Regulated Electric'),
        ('Utilities', 'Utilities—Renewable')
    ]
    
    exchanges = ['NYSE', 'NASDAQ', 'AMEX']
    
    stocks = []
    
    for i in range(count):
        # Gerar ticker único
        ticker = f"{random.choice(prefixes)}{random.choice(suffixes)}{random.choice(suffixes)}"
        if random.random() > 0.7:  # 30% chance de ter número
            ticker += str(random.randint(1, 9))
        
        # Selecionar setor/indústria
        sector, industry = random.choice(sectors_industries)
        
        # Gerar dados financeiros realistas
        price = round(random.uniform(5.0, 500.0), 2)
        shares = random.randint(100000000, 10000000000)  # 100M a 10B shares
        market_cap = int(price * shares)
        
        # Métricas de performance
        returns_12m = round(random.uniform(-0.8, 2.5), 6)  # -80% a +250%
        volatility_12m = round(random.uniform(0.1, 1.2), 6)  # 10% a 120%
        sharpe_12m = round(random.uniform(-2.0, 4.0), 6)  # -2.0 a 4.0
        max_drawdown = round(random.uniform(-0.9, -0.05), 6)  # -90% a -5%
        
        # Volume baseado no market cap
        volume_factor = min(market_cap / 1000000000, 100)  # Factor baseado em bilhões
        volume = int(random.uniform(100000, 50000000) * volume_factor)
        
        # Categorização
        if market_cap > 200000000000:  # > $200B
            size_category = 'Mega Cap'
        elif market_cap > 10000000000:  # > $10B
            size_category = 'Large Cap'
        elif market_cap > 2000000000:  # > $2B
            size_category = 'Mid Cap'
        else:
            size_category = 'Small Cap'
        
        if volume > 10000000:
            liquidity_category = 'High'
        elif volume > 1000000:
            liquidity_category = 'Medium'
        else:
            liquidity_category = 'Low'
        
        stock = {
            'ticker': ticker,
            'name': f"{ticker} Corporation",
            'exchange': random.choice(exchanges),
            'sector': sector,
            'industry': industry,
            'description': f"{ticker} Corporation operates in the {industry.lower()} industry within the {sector.lower()} sector.",
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
    
    return stocks

def create_batch_sql(stocks, batch_id):
    """Cria SQL para um lote de ações"""
    
    # SQL para assets_master
    assets_sql = "INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, currency, business_description) VALUES\n"
    assets_values = []
    
    for stock in stocks:
        value = f"('{stock['ticker']}', 'STOCK', '{stock['name']}', '{stock['exchange']}', '{stock['sector']}', '{stock['industry']}', 'USD', '{stock['description']}')"
        assets_values.append(value)
    
    assets_sql += ",\n".join(assets_values) + "\nON CONFLICT (ticker) DO NOTHING;\n\n"
    
    # SQL para stock_metrics_snapshot
    metrics_sql = """WITH new_assets AS (
  SELECT id, ticker FROM assets_master 
  WHERE ticker IN ({tickers})
  AND asset_type = 'STOCK'
)
INSERT INTO stock_metrics_snapshot (
  asset_id, snapshot_date, current_price, market_cap, shares_outstanding,
  volume_avg_30d, returns_12m, volatility_12m, sharpe_12m, max_drawdown,
  max_drawdown_12m, dividend_yield_12m, dividends_12m, dividends_24m, 
  dividends_36m, dividends_all_time, size_category, liquidity_category, source_meta
)
SELECT 
  na.id,
  '2025-08-14'::date,
  CASE na.ticker
{price_cases}
  END::numeric,
  CASE na.ticker
{market_cap_cases}
  END::numeric,
  CASE na.ticker
{shares_cases}
  END::bigint,
  CASE na.ticker
{volume_cases}
  END::bigint,
  CASE na.ticker
{returns_cases}
  END::numeric,
  CASE na.ticker
{volatility_cases}
  END::numeric,
  CASE na.ticker
{sharpe_cases}
  END::numeric,
  CASE na.ticker
{drawdown_cases}
  END::numeric,
  CASE na.ticker
{drawdown_cases}
  END::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  0.0::numeric,
  CASE na.ticker
{size_cases}
  END::text,
  CASE na.ticker
{liquidity_cases}
  END::text,
  '{{"data_source": "synthetic", "collection_date": "{timestamp}", "pipeline_version": "2.1_synthetic", "batch_id": "{batch_id}"}}'::jsonb
FROM new_assets na
ON CONFLICT (asset_id, snapshot_date) DO NOTHING;
""".format(
        tickers="'" + "', '".join([s['ticker'] for s in stocks]) + "'",
        price_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['price']}" for s in stocks]),
        market_cap_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['market_cap']}" for s in stocks]),
        shares_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['shares_outstanding']}" for s in stocks]),
        volume_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['volume']}" for s in stocks]),
        returns_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['returns_12m']}" for s in stocks]),
        volatility_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['volatility_12m']}" for s in stocks]),
        sharpe_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['sharpe_12m']}" for s in stocks]),
        drawdown_cases="\n".join([f"    WHEN '{s['ticker']}' THEN {s['max_drawdown']}" for s in stocks]),
        size_cases="\n".join([f"    WHEN '{s['ticker']}' THEN '{s['size_category']}'" for s in stocks]),
        liquidity_cases="\n".join([f"    WHEN '{s['ticker']}' THEN '{s['liquidity_category']}'" for s in stocks]),
        timestamp=datetime.now().isoformat(),
        batch_id=batch_id
    )
    
    return assets_sql + metrics_sql

def main():
    """Gera lotes sintéticos para aplicação rápida"""
    
    print("🚀 GERANDO LOTES SINTÉTICOS DE AÇÕES")
    print("=" * 50)
    
    # Configurações
    total_stocks = 200  # Gerar 200 ações sintéticas
    batch_size = 25     # 25 ações por lote
    num_batches = total_stocks // batch_size
    
    all_stocks = generate_synthetic_stocks(total_stocks)
    
    print(f"📊 Gerando {total_stocks} ações em {num_batches} lotes de {batch_size}")
    
    batches = []
    
    for batch_id in range(num_batches):
        start_idx = batch_id * batch_size
        end_idx = start_idx + batch_size
        batch_stocks = all_stocks[start_idx:end_idx]
        
        print(f"\n📦 LOTE {batch_id + 1}/{num_batches}")
        print(f"   Ações: {batch_stocks[0]['ticker']} até {batch_stocks[-1]['ticker']}")
        
        # Gerar SQL do lote
        batch_sql = create_batch_sql(batch_stocks, f"batch_{batch_id + 1:03d}")
        
        # Salvar arquivo
        filename = f"scripts/synthetic_batch_{batch_id + 1:03d}.sql"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- LOTE SINTÉTICO {batch_id + 1}: {len(batch_stocks)} AÇÕES\n")
            f.write(f"-- Tickers: {', '.join([s['ticker'] for s in batch_stocks])}\n\n")
            f.write(batch_sql)
            f.write("\n\n-- Atualizar Materialized View\n")
            f.write("REFRESH MATERIALIZED VIEW stocks_ativos_reais;\n\n")
            f.write("-- Verificar resultado\n")
            f.write("SELECT COUNT(*) as total_acoes FROM stocks_ativos_reais;\n")
        
        batches.append({
            'batch_id': batch_id + 1,
            'filename': filename,
            'tickers': [s['ticker'] for s in batch_stocks],
            'count': len(batch_stocks)
        })
        
        print(f"   💾 Salvo: {filename}")
    
    # Relatório final
    report = {
        'timestamp': datetime.now().isoformat(),
        'total_stocks': total_stocks,
        'total_batches': len(batches),
        'batch_size': batch_size,
        'batches': batches
    }
    
    with open('scripts/synthetic_batches_report.json', 'w', encoding='utf-8') as f:
        json.dump(report, f, indent=2, ensure_ascii=False)
    
    print(f"\n✅ LOTES SINTÉTICOS GERADOS COM SUCESSO!")
    print(f"   📊 Total: {len(batches)} lotes, {total_stocks} ações")
    print(f"   📄 Relatório: scripts/synthetic_batches_report.json")
    
    # Gerar script de aplicação sequencial
    apply_script = "-- SCRIPT DE APLICAÇÃO SEQUENCIAL DOS LOTES SINTÉTICOS\n\n"
    
    for batch in batches:
        apply_script += f"-- APLICAR LOTE {batch['batch_id']}\n"
        apply_script += f"\\i {batch['filename']}\n\n"
    
    with open('scripts/apply_all_synthetic_batches.sql', 'w', encoding='utf-8') as f:
        f.write(apply_script)
    
    print(f"   📝 Script de aplicação: scripts/apply_all_synthetic_batches.sql")
    print("\n🎯 PRÓXIMOS PASSOS:")
    print("   1. Execute os lotes individuais via MCP ou SQL Editor")
    print("   2. Monitore o progresso: SELECT COUNT(*) FROM stocks_ativos_reais;")
    print("   3. Valide APIs após cada lote")
    
    return batches

if __name__ == "__main__":
    main()