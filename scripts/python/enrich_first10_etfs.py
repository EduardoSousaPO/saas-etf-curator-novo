import os
import pandas as pd
from dotenv import load_dotenv
from supabase import create_client, Client
from fmpsdk.etf import etf_info
import time

# Carregar variáveis de ambiente
load_dotenv()
SUPABASE_URL = os.getenv('SUPABASE_URL')
SUPABASE_KEY = os.getenv('SUPABASE_KEY')
FMP_APIKEY = os.getenv('FMP_APIKEY')

if not SUPABASE_URL or not SUPABASE_KEY or not FMP_APIKEY:
    raise Exception('Configure SUPABASE_URL, SUPABASE_KEY e FMP_APIKEY no .env')

# Inicializar Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# Caminho do Excel
excel_path = os.path.abspath(os.path.join(os.path.dirname(__file__), '../../symbols_etfs_eua.xlsx'))

# Ler todos os símbolos do Excel
print('Lendo todos os símbolos do Excel...')
df = pd.read_excel(excel_path, sheet_name='Planilha1', usecols=['symbol', 'name'])
symbols = df['symbol'].dropna().unique().tolist()
print(f'Total de símbolos encontrados: {len(symbols)}')

# Buscar informações detalhadas na FMP e inserir no Supabase
total_upserts = 0
total_erros = 0
for idx, symbol in enumerate(symbols, 1):
    try:
        print(f'[{idx}/{len(symbols)}] Consultando FMP para {symbol}...')
        info_list = etf_info(FMP_APIKEY, symbol)
        if info_list and isinstance(info_list, list) and len(info_list) > 0:
            info = info_list[0]
            data = {
                'symbol': info.get('symbol'),
                'name': info.get('name'),
                'description': info.get('description'),
                'isin': info.get('isin'),
                'assetclass': info.get('assetClass'),
                'securitycusip': info.get('securityCusip'),
                'domicile': info.get('domicile'),
                'website': info.get('website'),
                'etfcompany': info.get('etfCompany'),
                'expenseratio': info.get('expenseRatio'),
                'assetsundermanagement': info.get('assetsUnderManagement'),
                'avgvolume': info.get('avgVolume'),
                'inceptiondate': info.get('inceptionDate'),
                'nav': info.get('nav'),
                'navcurrency': info.get('navCurrency'),
                'holdingscount': info.get('holdingsCount'),
                'updatedat': info.get('updatedAt'),
                'sectorslist': info.get('sectorsList')
            }
            data = {k: v for k, v in data.items() if v is not None}
            res = supabase.table('etf_list').upsert(data, on_conflict=['symbol']).execute()
            if res.data:
                total_upserts += 1
        else:
            print(f'{symbol}: nenhum dado detalhado retornado pela FMP.')
    except Exception as e:
        print(f'Erro ao processar {symbol}: {e}')
        total_erros += 1
    if idx % 10 == 0:
        print(f'Progresso: {idx}/{len(symbols)} ETFs processados.')
    time.sleep(0.25)  # Respeitar limites da FMP

print(f'Processo concluído! {total_upserts} ETFs detalhados inseridos/atualizados no Supabase. {total_erros} erros.') 