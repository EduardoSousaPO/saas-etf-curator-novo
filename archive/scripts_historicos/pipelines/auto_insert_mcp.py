#!/usr/bin/env python3
"""
Inserção Automática de ETFs no Supabase via MCP
"""

import json
import time
from datetime import datetime

def load_etf_data():
    """Carrega dados dos ETFs"""
    with open('complete_pipeline_results_v2_20250626_192643.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def prepare_insert_query(etf):
    """Prepara query de inserção para um ETF"""
    try:
        # Escapa aspas simples
        def escape_sql(value):
            if value is None:
                return 'NULL'
            if isinstance(value, str):
                return f"'{value.replace(chr(39), chr(39)+chr(39))}'"
            return str(value)
        
        # Prepara valores
        values = {
            'symbol': escape_sql(etf.get('symbol')),
            'name': escape_sql(etf.get('name')),
            'description': escape_sql(etf.get('description', '')[:500] if etf.get('description') else ''),
            'isin': escape_sql(etf.get('isin')),
            'assetclass': escape_sql(etf.get('assetclass')),
            'domicile': escape_sql(etf.get('domicile')),
            'website': escape_sql(etf.get('website')),
            'etfcompany': escape_sql(etf.get('etfcompany')),
            'expenseratio': etf.get('expenseratio') if etf.get('expenseratio') else 'NULL',
            'totalasset': etf.get('totalasset') if etf.get('totalasset') else 'NULL',
            'avgvolume': etf.get('avgvolume') if etf.get('avgvolume') else 'NULL',
            'inceptiondate': f"to_timestamp({etf.get('inceptiondate')})" if etf.get('inceptiondate') else 'NULL',
            'nav': etf.get('nav') if etf.get('nav') else 'NULL',
            'navcurrency': escape_sql(etf.get('navcurrency')),
            'holdingscount': etf.get('holdingscount') if etf.get('holdingscount') else 'NULL',
            'returns_12m': etf.get('returns_12m') if etf.get('returns_12m') else 'NULL',
            'volatility_12m': etf.get('volatility_12m') if etf.get('volatility_12m') else 'NULL',
            'returns_24m': etf.get('returns_24m') if etf.get('returns_24m') else 'NULL',
            'volatility_24m': etf.get('volatility_24m') if etf.get('volatility_24m') else 'NULL',
            'returns_36m': etf.get('returns_36m') if etf.get('returns_36m') else 'NULL',
            'volatility_36m': etf.get('volatility_36m') if etf.get('volatility_36m') else 'NULL',
            'returns_5y': etf.get('returns_5y') if etf.get('returns_5y') else 'NULL',
            'ten_year_return': etf.get('ten_year_return') if etf.get('ten_year_return') else 'NULL',
            'ten_year_volatility': etf.get('ten_year_volatility') if etf.get('ten_year_volatility') else 'NULL',
            'sharpe_12m': etf.get('sharpe_12m') if etf.get('sharpe_12m') else 'NULL',
            'sharpe_24m': etf.get('sharpe_24m') if etf.get('sharpe_24m') else 'NULL',
            'sharpe_36m': etf.get('sharpe_36m') if etf.get('sharpe_36m') else 'NULL',
            'ten_year_sharpe': etf.get('ten_year_sharpe') if etf.get('ten_year_sharpe') else 'NULL',
            'max_drawdown': etf.get('max_drawdown') if etf.get('max_drawdown') else 'NULL',
            'dividends_12m': etf.get('dividends_12m') if etf.get('dividends_12m') else 'NULL',
            'dividends_24m': etf.get('dividends_24m') if etf.get('dividends_24m') else 'NULL',
            'dividends_36m': etf.get('dividends_36m') if etf.get('dividends_36m') else 'NULL',
            'dividends_all_time': etf.get('dividends_all_time') if etf.get('dividends_all_time') else 'NULL',
            'size_category': escape_sql(etf.get('size_category')),
            'liquidity_category': escape_sql(etf.get('liquidity_category')),
            'etf_type': escape_sql(etf.get('etf_type'))
        }
        
        # Monta query
        query = f"""
        INSERT INTO etfs_ativos_reais (
            symbol, name, description, isin, assetclass, domicile, website, etfcompany,
            expenseratio, totalasset, avgvolume, inceptiondate, nav, navcurrency, holdingscount,
            returns_12m, volatility_12m, returns_24m, volatility_24m, returns_36m, volatility_36m,
            returns_5y, ten_year_return, ten_year_volatility, sharpe_12m, sharpe_24m, sharpe_36m,
            ten_year_sharpe, max_drawdown, dividends_12m, dividends_24m, dividends_36m,
            dividends_all_time, size_category, liquidity_category, etf_type, updatedat
        ) VALUES (
            {values['symbol']}, {values['name']}, {values['description']}, {values['isin']},
            {values['assetclass']}, {values['domicile']}, {values['website']}, {values['etfcompany']},
            {values['expenseratio']}, {values['totalasset']}, {values['avgvolume']}, {values['inceptiondate']},
            {values['nav']}, {values['navcurrency']}, {values['holdingscount']},
            {values['returns_12m']}, {values['volatility_12m']}, {values['returns_24m']}, {values['volatility_24m']},
            {values['returns_36m']}, {values['volatility_36m']}, {values['returns_5y']}, {values['ten_year_return']},
            {values['ten_year_volatility']}, {values['sharpe_12m']}, {values['sharpe_24m']}, {values['sharpe_36m']},
            {values['ten_year_sharpe']}, {values['max_drawdown']}, {values['dividends_12m']}, {values['dividends_24m']},
            {values['dividends_36m']}, {values['dividends_all_time']}, {values['size_category']},
            {values['liquidity_category']}, {values['etf_type']}, NOW()
        );
        """
        
        return query.strip()
        
    except Exception as e:
        print(f"Erro ao preparar query para {etf.get('symbol', 'UNKNOWN')}: {e}")
        return None

def main():
    """Função principal"""
    print("🚀 INICIANDO INSERÇÃO AUTOMÁTICA VIA MCP")
    print("=" * 50)
    
    # Carrega dados
    data = load_etf_data()
    print(f"📊 Total de ETFs carregados: {len(data)}")
    
    # Teste com primeiro ETF
    first_etf = data[0]
    print(f"🧪 Testando com primeiro ETF: {first_etf['symbol']} - {first_etf['name']}")
    
    # Prepara query de teste
    test_query = prepare_insert_query(first_etf)
    if test_query:
        print("✅ Query preparada com sucesso!")
        print("📝 Primeiras linhas da query:")
        print(test_query[:200] + "...")
        
        # Salva query de teste
        with open('test_insert_query.sql', 'w', encoding='utf-8') as f:
            f.write(test_query)
        print("💾 Query salva em: test_insert_query.sql")
        
        return True
    else:
        print("❌ Erro ao preparar query")
        return False

if __name__ == "__main__":
    main() 
"""
Inserção Automática de ETFs no Supabase via MCP
"""

import json
import time
from datetime import datetime

def load_etf_data():
    """Carrega dados dos ETFs"""
    with open('complete_pipeline_results_v2_20250626_192643.json', 'r', encoding='utf-8') as f:
        return json.load(f)

def prepare_insert_query(etf):
    """Prepara query de inserção para um ETF"""
    try:
        # Escapa aspas simples
        def escape_sql(value):
            if value is None:
                return 'NULL'
            if isinstance(value, str):
                return f"'{value.replace(chr(39), chr(39)+chr(39))}'"
            return str(value)
        
        # Prepara valores
        values = {
            'symbol': escape_sql(etf.get('symbol')),
            'name': escape_sql(etf.get('name')),
            'description': escape_sql(etf.get('description', '')[:500] if etf.get('description') else ''),
            'isin': escape_sql(etf.get('isin')),
            'assetclass': escape_sql(etf.get('assetclass')),
            'domicile': escape_sql(etf.get('domicile')),
            'website': escape_sql(etf.get('website')),
            'etfcompany': escape_sql(etf.get('etfcompany')),
            'expenseratio': etf.get('expenseratio') if etf.get('expenseratio') else 'NULL',
            'totalasset': etf.get('totalasset') if etf.get('totalasset') else 'NULL',
            'avgvolume': etf.get('avgvolume') if etf.get('avgvolume') else 'NULL',
            'inceptiondate': f"to_timestamp({etf.get('inceptiondate')})" if etf.get('inceptiondate') else 'NULL',
            'nav': etf.get('nav') if etf.get('nav') else 'NULL',
            'navcurrency': escape_sql(etf.get('navcurrency')),
            'holdingscount': etf.get('holdingscount') if etf.get('holdingscount') else 'NULL',
            'returns_12m': etf.get('returns_12m') if etf.get('returns_12m') else 'NULL',
            'volatility_12m': etf.get('volatility_12m') if etf.get('volatility_12m') else 'NULL',
            'returns_24m': etf.get('returns_24m') if etf.get('returns_24m') else 'NULL',
            'volatility_24m': etf.get('volatility_24m') if etf.get('volatility_24m') else 'NULL',
            'returns_36m': etf.get('returns_36m') if etf.get('returns_36m') else 'NULL',
            'volatility_36m': etf.get('volatility_36m') if etf.get('volatility_36m') else 'NULL',
            'returns_5y': etf.get('returns_5y') if etf.get('returns_5y') else 'NULL',
            'ten_year_return': etf.get('ten_year_return') if etf.get('ten_year_return') else 'NULL',
            'ten_year_volatility': etf.get('ten_year_volatility') if etf.get('ten_year_volatility') else 'NULL',
            'sharpe_12m': etf.get('sharpe_12m') if etf.get('sharpe_12m') else 'NULL',
            'sharpe_24m': etf.get('sharpe_24m') if etf.get('sharpe_24m') else 'NULL',
            'sharpe_36m': etf.get('sharpe_36m') if etf.get('sharpe_36m') else 'NULL',
            'ten_year_sharpe': etf.get('ten_year_sharpe') if etf.get('ten_year_sharpe') else 'NULL',
            'max_drawdown': etf.get('max_drawdown') if etf.get('max_drawdown') else 'NULL',
            'dividends_12m': etf.get('dividends_12m') if etf.get('dividends_12m') else 'NULL',
            'dividends_24m': etf.get('dividends_24m') if etf.get('dividends_24m') else 'NULL',
            'dividends_36m': etf.get('dividends_36m') if etf.get('dividends_36m') else 'NULL',
            'dividends_all_time': etf.get('dividends_all_time') if etf.get('dividends_all_time') else 'NULL',
            'size_category': escape_sql(etf.get('size_category')),
            'liquidity_category': escape_sql(etf.get('liquidity_category')),
            'etf_type': escape_sql(etf.get('etf_type'))
        }
        
        # Monta query
        query = f"""
        INSERT INTO etfs_ativos_reais (
            symbol, name, description, isin, assetclass, domicile, website, etfcompany,
            expenseratio, totalasset, avgvolume, inceptiondate, nav, navcurrency, holdingscount,
            returns_12m, volatility_12m, returns_24m, volatility_24m, returns_36m, volatility_36m,
            returns_5y, ten_year_return, ten_year_volatility, sharpe_12m, sharpe_24m, sharpe_36m,
            ten_year_sharpe, max_drawdown, dividends_12m, dividends_24m, dividends_36m,
            dividends_all_time, size_category, liquidity_category, etf_type, updatedat
        ) VALUES (
            {values['symbol']}, {values['name']}, {values['description']}, {values['isin']},
            {values['assetclass']}, {values['domicile']}, {values['website']}, {values['etfcompany']},
            {values['expenseratio']}, {values['totalasset']}, {values['avgvolume']}, {values['inceptiondate']},
            {values['nav']}, {values['navcurrency']}, {values['holdingscount']},
            {values['returns_12m']}, {values['volatility_12m']}, {values['returns_24m']}, {values['volatility_24m']},
            {values['returns_36m']}, {values['volatility_36m']}, {values['returns_5y']}, {values['ten_year_return']},
            {values['ten_year_volatility']}, {values['sharpe_12m']}, {values['sharpe_24m']}, {values['sharpe_36m']},
            {values['ten_year_sharpe']}, {values['max_drawdown']}, {values['dividends_12m']}, {values['dividends_24m']},
            {values['dividends_36m']}, {values['dividends_all_time']}, {values['size_category']},
            {values['liquidity_category']}, {values['etf_type']}, NOW()
        );
        """
        
        return query.strip()
        
    except Exception as e:
        print(f"Erro ao preparar query para {etf.get('symbol', 'UNKNOWN')}: {e}")
        return None

def main():
    """Função principal"""
    print("🚀 INICIANDO INSERÇÃO AUTOMÁTICA VIA MCP")
    print("=" * 50)
    
    # Carrega dados
    data = load_etf_data()
    print(f"📊 Total de ETFs carregados: {len(data)}")
    
    # Teste com primeiro ETF
    first_etf = data[0]
    print(f"🧪 Testando com primeiro ETF: {first_etf['symbol']} - {first_etf['name']}")
    
    # Prepara query de teste
    test_query = prepare_insert_query(first_etf)
    if test_query:
        print("✅ Query preparada com sucesso!")
        print("📝 Primeiras linhas da query:")
        print(test_query[:200] + "...")
        
        # Salva query de teste
        with open('test_insert_query.sql', 'w', encoding='utf-8') as f:
            f.write(test_query)
        print("💾 Query salva em: test_insert_query.sql")
        
        return True
    else:
        print("❌ Erro ao preparar query")
        return False

if __name__ == "__main__":
    main() 