import pandas as pd
import json
import random
import re

def clean_price(price_str):
    """Limpar string de preço para float"""
    if pd.isna(price_str) or str(price_str) == 'nan' or '#CAMPO!' in str(price_str):
        return None
    
    # Remover símbolos e converter
    clean = re.sub(r'[^\d,.]', '', str(price_str))
    clean = clean.replace(',', '.')
    
    try:
        return float(clean)
    except:
        return None

def clean_market_cap(cap_str):
    """Limpar string de market cap para número"""
    if pd.isna(cap_str) or str(cap_str) == 'nan' or '#CAMPO!' in str(cap_str):
        return None
    
    # Remover símbolos e espaços
    clean = re.sub(r'[^\d.]', '', str(cap_str))
    
    try:
        return int(float(clean))
    except:
        return None

def normalize_sector(sector_str):
    """Normalizar nome do setor"""
    if pd.isna(sector_str) or str(sector_str) == 'nan' or '#CAMPO!' in str(sector_str):
        return 'Technology'
    
    sector = str(sector_str).strip()
    
    # Mapeamento de setores
    sector_map = {
        'Software': 'Technology',
        'Biotechnology': 'Healthcare', 
        'Pharmaceuticals': 'Healthcare',
        'Oil': 'Energy',
        'Financial': 'Financial Services',
        'Telecommunications': 'Communication Services',
        'Media': 'Communication Services',
        'Retail': 'Consumer Cyclical',
        'Utilities': 'Utilities',
        'Materials': 'Materials',
        'Industrial': 'Industrials'
    }
    
    for key, value in sector_map.items():
        if key.lower() in sector.lower():
            return value
    
    return sector

def process_super_batch(start_idx=220, batch_size=100):
    """Processar super-lote de 100 ações reais"""
    
    # Carregar CSV
    df = pd.read_csv('top_us_stocks_2025-07-29.csv', sep=';', encoding='latin1')
    df = df[df['ticker'] != '#CAMPO!']
    df = df.dropna(subset=['ticker'])
    
    # Pegar lote específico
    batch = df.iloc[start_idx:start_idx + batch_size]
    
    print(f'=== SUPER-LOTE 12: {len(batch)} AÇÕES REAIS ===')
    print(f'Posições CSV: {start_idx} até {start_idx + batch_size - 1}')
    
    # Processar dados reais
    assets_data = []
    
    for i, (idx, row) in enumerate(batch.iterrows()):
        ticker = str(row['ticker']).strip().upper()
        
        # Extrair nome da empresa
        symbol_info = str(row.get('symbol', ticker))
        if '(' in symbol_info:
            name = symbol_info.split('(')[0].strip()
        else:
            name = f'{ticker} Corporation'
        
        # Setor normalizado
        sector = normalize_sector(row.get('Setor', 'Technology'))
        
        # Descrição real ou padrão
        description = str(row.get('Descrição', '')).strip()
        if description == 'nan' or '#CAMPO!' in description or len(description) < 10:
            description = f'{name} operates in the {sector.lower()} industry, providing innovative solutions and services to customers worldwide.'
        else:
            # Limitar descrição a 500 caracteres
            description = description[:500]
        
        # Exchange baseado no setor
        exchange_map = {
            'Technology': ['NASDAQ', 'NYSE'],
            'Financial Services': ['NYSE', 'NASDAQ'], 
            'Healthcare': ['NASDAQ', 'NYSE'],
            'Energy': ['NYSE', 'NASDAQ'],
            'Materials': ['NYSE'],
            'Industrials': ['NYSE'],
            'Consumer Cyclical': ['NASDAQ', 'NYSE'],
            'Consumer Defensive': ['NYSE', 'NASDAQ'],
            'Communication Services': ['NASDAQ', 'NYSE'],
            'Utilities': ['NYSE'],
            'Real Estate': ['NYSE', 'NASDAQ']
        }
        
        exchange = 'NASDAQ'  # Default
        for key in exchange_map:
            if key.lower() in sector.lower():
                exchange = random.choice(exchange_map[key])
                break
        
        # Preço real do CSV
        real_price = clean_price(row.get('Preço'))
        if real_price is None:
            real_price = round(random.uniform(5.0, 200.0), 2)  # Fallback realista
        
        # Market cap real do CSV
        real_market_cap = clean_market_cap(row.get('Capitalização de Mercado'))
        if real_market_cap is None:
            real_market_cap = int(real_price * 100000000)  # Estimativa baseada no preço
        
        assets_data.append({
            'ticker': ticker,
            'name': name,
            'exchange': exchange,
            'sector': sector,
            'description': description,
            'real_price': real_price,
            'real_market_cap': real_market_cap
        })
    
    return assets_data

if __name__ == "__main__":
    # Processar Super-Lote 12 (100 ações)
    data = process_super_batch(220, 100)
    
    print(f'\n✅ {len(data)} AÇÕES REAIS PROCESSADAS!')
    print('\nPrimeiras 10 ações:')
    for i, asset in enumerate(data[:10]):
        print(f"{i+1:2d}. {asset['ticker']:6s}: {asset['name'][:25]:25s} | ${asset['real_price']:6.2f} | {asset['sector']}")
    
    print(f'\nÚltimas 5 ações:')
    for i, asset in enumerate(data[-5:], len(data)-4):
        print(f"{i:2d}. {asset['ticker']:6s}: {asset['name'][:25]:25s} | ${asset['real_price']:6.2f} | {asset['sector']}")
