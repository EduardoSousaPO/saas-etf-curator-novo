import pandas as pd
import json
import random

def process_csv_batch(start_idx=200, batch_size=100):
    """Processar lote de ações do CSV"""
    
    # Carregar CSV
    df = pd.read_csv('top_us_stocks_2025-07-29.csv', sep=';', encoding='latin1')
    df = df[df['ticker'] != '#CAMPO!']
    df = df.dropna(subset=['ticker'])
    
    # Pegar lote específico
    batch = df.iloc[start_idx:start_idx + batch_size]
    
    print(f'=== SUPER-LOTE: {len(batch)} AÇÕES REAIS ===')
    
    # Processar dados
    assets_data = []
    
    for i, (idx, row) in enumerate(batch.iterrows()):
        ticker = str(row['ticker']).strip()
        symbol_info = str(row.get('symbol', ticker))
        name = symbol_info.split('(')[0].strip() if '(' in symbol_info else f'{ticker} Corporation'
        sector = str(row.get('Setor', 'Technology')).strip()
        description = str(row.get('Descrição', f'{name} operates in the {sector.lower()} industry.')).strip()[:500]
        
        # Limpar descrição
        if description == 'nan' or '#CAMPO!' in description:
            description = f'{name} operates in the {sector.lower()} industry, providing innovative solutions and services to customers worldwide.'
        
        # Mapear setores para exchanges realistas
        exchange_map = {
            'Technology': ['NASDAQ', 'NYSE'],
            'Financial': ['NYSE', 'NASDAQ'], 
            'Healthcare': ['NASDAQ', 'NYSE'],
            'Energy': ['NYSE', 'NASDAQ'],
            'Materials': ['NYSE'],
            'Industrials': ['NYSE'],
            'Consumer': ['NASDAQ', 'NYSE'],
            'Biotechnology': ['NASDAQ'],
            'Software': ['NASDAQ'],
            'Pharmaceuticals': ['NYSE', 'NASDAQ']
        }
        
        exchange = 'NASDAQ'
        for key in exchange_map:
            if key.lower() in sector.lower():
                exchange = random.choice(exchange_map[key])
                break
        
        # Normalizar setor
        sector_normalized = sector.replace('&', 'and').replace('  ', ' ').strip()
        
        assets_data.append({
            'ticker': ticker,
            'name': name,
            'exchange': exchange,
            'sector': sector_normalized,
            'description': description
        })
    
    return assets_data

if __name__ == "__main__":
    # Processar primeiras 20 ações como teste
    data = process_csv_batch(200, 20)
    
    print('\nPrimeiras 20 ações processadas:')
    for i, asset in enumerate(data):
        print(f"{i+1:2d}. {asset['ticker']:6s}: {asset['name'][:30]:30s} ({asset['exchange']}) - {asset['sector']}")
    
    print(f'\n✅ {len(data)} ações processadas com sucesso!')

