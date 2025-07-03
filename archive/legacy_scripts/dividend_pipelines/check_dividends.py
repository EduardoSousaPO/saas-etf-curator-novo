import json

# Carregar dados
with open('dividends_production_complete_20250627_011735.json', 'r') as f:
    data = json.load(f)

# Verificar alguns ETFs específicos
test_symbols = ['JSML', 'BITC', 'EET', 'GURU', 'SPY', 'QQQ', 'VTI']
print('Valores dos dividendos no arquivo JSON:')
for result in data['results']:
    if result['symbol'] in test_symbols:
        print(f'{result["symbol"]}: ${result["dividends_12m"]:.4f}')

print(f'\nTotal de ETFs com dividendos > 0: {len([r for r in data["results"] if r["dividends_12m"] > 0])}') 