#!/usr/bin/env python3
"""
Script para inserir dados sintéticos de ações rapidamente para testar o sistema
"""
import random
import json
from datetime import datetime, date, timedelta

def generate_synthetic_stock_data():
    """Gera dados sintéticos de ações para teste"""
    
    # Lista de tickers sintéticos baseados em empresas reais
    tickers = [
        'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA', 'META', 'NVDA', 'NFLX', 'CRM', 'ORCL',
        'IBM', 'INTC', 'AMD', 'QCOM', 'TXN', 'AVGO', 'CSCO', 'ADBE', 'NOW', 'UBER',
        'ABNB', 'COIN', 'RBLX', 'SNOW', 'PLTR', 'DDOG', 'CRWD', 'ZS', 'OKTA', 'TWLO',
        'SQ', 'PYPL', 'V', 'MA', 'AXP', 'JPM', 'BAC', 'WFC', 'C', 'GS',
        'MS', 'BLK', 'SCHW', 'CME', 'ICE', 'SPGI', 'MCO', 'TRV', 'AIG', 'PGR'
    ]
    
    # Setores e indústrias
    sectors = ['Technology', 'Healthcare', 'Financial Services', 'Consumer Cyclical', 'Industrials', 
               'Communication Services', 'Consumer Defensive', 'Energy', 'Basic Materials', 'Real Estate']
    
    industries = ['Software - Application', 'Semiconductors', 'Drug Manufacturers - General', 
                  'Banks - Diversified', 'Auto Manufacturers', 'Internet Retail', 'Biotechnology']
    
    exchanges = ['NMS', 'NYQ', 'NGM', 'NCM', 'ASE']
    
    # Gerar dados sintéticos
    stocks_data = []
    
    for i, ticker in enumerate(tickers[:500], 1):  # Gerar 500 ações
        sector = random.choice(sectors)
        industry = random.choice(industries)
        exchange = random.choice(exchanges)
        
        # Dados básicos da empresa
        stock_data = {
            'ticker': ticker,
            'asset_type': 'STOCK',
            'name': f'{ticker} Corporation',
            'exchange': exchange,
            'sector': sector,
            'industry': industry,
            'business_description': f'Synthetic description for {ticker} - A leading company in {industry}.',
            'headquarters': f'City, ST, United States',
            'employees_count': random.randint(1000, 500000)
        }
        
        # Métricas sintéticas
        current_price = round(random.uniform(10, 500), 2)
        market_cap = random.randint(1000000000, 3000000000000)  # 1B a 3T
        
        metrics_data = {
            'current_price': current_price,
            'market_cap': market_cap,
            'shares_outstanding': int(market_cap / current_price),
            'volume_avg_30d': random.randint(1000000, 100000000),
            'returns_12m': round(random.uniform(-50, 100), 2),
            'returns_24m': round(random.uniform(-60, 150), 2),
            'returns_36m': round(random.uniform(-70, 200), 2),
            'returns_5y': round(random.uniform(-80, 300), 2),
            'ten_year_return': round(random.uniform(-50, 500), 2),
            'volatility_12m': round(random.uniform(15, 80), 2),
            'volatility_24m': round(random.uniform(15, 85), 2),
            'volatility_36m': round(random.uniform(15, 90), 2),
            'ten_year_volatility': round(random.uniform(15, 95), 2),
            'sharpe_12m': round(random.uniform(-2, 3), 2),
            'sharpe_24m': round(random.uniform(-2, 3), 2),
            'sharpe_36m': round(random.uniform(-2, 3), 2),
            'ten_year_sharpe': round(random.uniform(-1, 4), 2),
            'max_drawdown': round(random.uniform(-80, -5), 2),
            'max_drawdown_12m': round(random.uniform(-60, -5), 2),
            'dividend_yield_12m': round(random.uniform(0, 8), 2) if random.random() > 0.3 else None,
            'dividends_12m': round(random.uniform(0, 10), 2) if random.random() > 0.3 else 0,
            'dividends_24m': round(random.uniform(0, 20), 2) if random.random() > 0.3 else 0,
            'dividends_36m': round(random.uniform(0, 30), 2) if random.random() > 0.3 else 0,
            'dividends_all_time': round(random.uniform(0, 100), 2) if random.random() > 0.3 else 0,
            'size_category': random.choice(['Large Cap', 'Mid Cap', 'Small Cap', 'Mega Cap']),
            'liquidity_category': random.choice(['High', 'Medium', 'Very High']),
            'source_meta': json.dumps({
                "provider": "synthetic", 
                "generated_at": datetime.now().isoformat(),
                "version": "1.0"
            })
        }
        
        stocks_data.append({
            'assets': stock_data,
            'metrics': metrics_data
        })
    
    return stocks_data

def generate_sql_batches(stocks_data, batch_size=25):
    """Gera batches de SQL para inserção"""
    
    batches = []
    
    for i in range(0, len(stocks_data), batch_size):
        batch = stocks_data[i:i+batch_size]
        
        # SQL para assets_master
        assets_sql = "INSERT INTO assets_master (ticker, asset_type, name, exchange, sector, industry, business_description, headquarters, employees_count) VALUES\n"
        assets_values = []
        
        for stock in batch:
            assets = stock['assets']
            values = f"('{assets['ticker']}', '{assets['asset_type']}', '{assets['name']}', '{assets['exchange']}', '{assets['sector']}', '{assets['industry']}', '{assets['business_description']}', '{assets['headquarters']}', {assets['employees_count']})"
            assets_values.append(values)
        
        assets_sql += ",\n".join(assets_values)
        assets_sql += "\nON CONFLICT (ticker) DO UPDATE SET name = EXCLUDED.name, exchange = EXCLUDED.exchange, sector = EXCLUDED.sector, industry = EXCLUDED.industry, business_description = EXCLUDED.business_description, headquarters = EXCLUDED.headquarters, employees_count = EXCLUDED.employees_count;\n"
        
        # SQL para stock_metrics_snapshot
        metrics_sql = "INSERT INTO stock_metrics_snapshot (asset_id, snapshot_date, current_price, market_cap, shares_outstanding, volume_avg_30d, returns_12m, returns_24m, returns_36m, returns_5y, ten_year_return, volatility_12m, volatility_24m, volatility_36m, ten_year_volatility, sharpe_12m, sharpe_24m, sharpe_36m, ten_year_sharpe, max_drawdown, max_drawdown_12m, dividend_yield_12m, dividends_12m, dividends_24m, dividends_36m, dividends_all_time, size_category, liquidity_category, source_meta) VALUES\n"
        metrics_values = []
        
        for stock in batch:
            metrics = stock['metrics']
            ticker = stock['assets']['ticker']
            
            # Usar ROUND com CAST para NUMERIC
            values = f"""((SELECT id FROM assets_master WHERE ticker = '{ticker}'), CURRENT_DATE, 
            {metrics['current_price']}, {metrics['market_cap']}, {metrics['shares_outstanding']}, {metrics['volume_avg_30d']},
            {metrics['returns_12m']}, {metrics['returns_24m']}, {metrics['returns_36m']}, {metrics['returns_5y']}, {metrics['ten_year_return']},
            {metrics['volatility_12m']}, {metrics['volatility_24m']}, {metrics['volatility_36m']}, {metrics['ten_year_volatility']},
            {metrics['sharpe_12m']}, {metrics['sharpe_24m']}, {metrics['sharpe_36m']}, {metrics['ten_year_sharpe']},
            {metrics['max_drawdown']}, {metrics['max_drawdown_12m']}, {metrics['dividend_yield_12m'] if metrics['dividend_yield_12m'] else 'NULL'},
            {metrics['dividends_12m']}, {metrics['dividends_24m']}, {metrics['dividends_36m']}, {metrics['dividends_all_time']},
            '{metrics['size_category']}', '{metrics['liquidity_category']}', '{metrics['source_meta']}')"""
            metrics_values.append(values)
        
        metrics_sql += ",\n".join(metrics_values)
        metrics_sql += "\nON CONFLICT (asset_id, snapshot_date) DO UPDATE SET current_price = EXCLUDED.current_price, market_cap = EXCLUDED.market_cap, shares_outstanding = EXCLUDED.shares_outstanding, volume_avg_30d = EXCLUDED.volume_avg_30d, returns_12m = EXCLUDED.returns_12m, returns_24m = EXCLUDED.returns_24m, returns_36m = EXCLUDED.returns_36m, returns_5y = EXCLUDED.returns_5y, ten_year_return = EXCLUDED.ten_year_return, volatility_12m = EXCLUDED.volatility_12m, volatility_24m = EXCLUDED.volatility_24m, volatility_36m = EXCLUDED.volatility_36m, ten_year_volatility = EXCLUDED.ten_year_volatility, sharpe_12m = EXCLUDED.sharpe_12m, sharpe_24m = EXCLUDED.sharpe_24m, sharpe_36m = EXCLUDED.sharpe_36m, ten_year_sharpe = EXCLUDED.ten_year_sharpe, max_drawdown = EXCLUDED.max_drawdown, max_drawdown_12m = EXCLUDED.max_drawdown_12m, dividend_yield_12m = EXCLUDED.dividend_yield_12m, dividends_12m = EXCLUDED.dividends_12m, dividends_24m = EXCLUDED.dividends_24m, dividends_36m = EXCLUDED.dividends_36m, dividends_all_time = EXCLUDED.dividends_all_time, size_category = EXCLUDED.size_category, liquidity_category = EXCLUDED.liquidity_category, source_meta = EXCLUDED.source_meta;\n"
        
        batch_sql = assets_sql + "\n" + metrics_sql
        batches.append({
            'batch_num': len(batches) + 1,
            'sql': batch_sql,
            'count': len(batch)
        })
    
    return batches

if __name__ == "__main__":
    print("🔄 Gerando dados sintéticos de ações...")
    
    stocks_data = generate_synthetic_stock_data()
    print(f"✅ {len(stocks_data)} ações sintéticas geradas")
    
    print("🔄 Criando batches SQL...")
    batches = generate_sql_batches(stocks_data)
    
    print(f"✅ {len(batches)} batches SQL criados")
    
    # Salvar batches em arquivos
    for batch in batches:
        filename = f"scripts/synthetic_batch_{batch['batch_num']:02d}.sql"
        with open(filename, 'w', encoding='utf-8') as f:
            f.write(f"-- BATCH SINTÉTICO {batch['batch_num']} - {batch['count']} AÇÕES\n")
            f.write(batch['sql'])
        
        print(f"💾 Batch {batch['batch_num']} salvo: {filename}")
    
    print(f"\n🎉 CONCLUÍDO! {len(batches)} batches prontos para execução via MCP Supabase")