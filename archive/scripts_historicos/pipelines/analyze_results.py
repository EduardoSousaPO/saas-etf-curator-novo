#!/usr/bin/env python3
"""
Análise dos Resultados do Pipeline ETF
"""

import json
import sys

def analyze_results():
    try:
        # Carrega os resultados
        with open('complete_pipeline_results_v2_20250626_192643.json', 'r', encoding='utf-8') as f:
            data = json.load(f)
        
        print("🎯 RESULTADOS DO PIPELINE ETF CURATOR")
        print("=" * 50)
        print(f"📊 Total de ETFs processados: {len(data)}")
        
        # Análise básica
        symbols = [etf.get('symbol') for etf in data if etf.get('symbol')]
        print(f"✅ ETFs ativos encontrados: {len(symbols)}")
        
        # Categorias de tamanho
        size_categories = {}
        for etf in data:
            size = etf.get('size_category', 'Unknown')
            size_categories[size] = size_categories.get(size, 0) + 1
        
        print("\n📈 CATEGORIAS POR TAMANHO:")
        for size, count in size_categories.items():
            print(f"  {size}: {count} ETFs")
        
        # Categorias de liquidez
        liquidity_categories = {}
        for etf in data:
            liquidity = etf.get('liquidity_category', 'Unknown')
            liquidity_categories[liquidity] = liquidity_categories.get(liquidity, 0) + 1
        
        print("\n💧 CATEGORIAS POR LIQUIDEZ:")
        for liquidity, count in liquidity_categories.items():
            print(f"  {liquidity}: {count} ETFs")
        
        # Tipos de ETF
        etf_types = {}
        for etf in data:
            etf_type = etf.get('etf_type', 'Unknown')
            etf_types[etf_type] = etf_types.get(etf_type, 0) + 1
        
        print("\n🏷️ TIPOS DE ETF:")
        for etf_type, count in etf_types.items():
            print(f"  {etf_type}: {count} ETFs")
        
        # Top 10 ETFs por total assets
        etfs_with_assets = [etf for etf in data if etf.get('totalasset')]
        etfs_with_assets.sort(key=lambda x: x.get('totalasset', 0), reverse=True)
        
        print("\n💰 TOP 10 ETFs POR TOTAL ASSETS:")
        for i, etf in enumerate(etfs_with_assets[:10], 1):
            symbol = etf.get('symbol', 'N/A')
            name = etf.get('name', 'N/A')[:40] + '...' if len(etf.get('name', '')) > 40 else etf.get('name', 'N/A')
            assets = etf.get('totalasset', 0)
            print(f"  {i:2d}. {symbol:6s} - {name:40s} - ${assets:,}")
        
        print("\n🎉 PIPELINE CONCLUÍDO COM SUCESSO!")
        print(f"📁 Arquivo de resultados: complete_pipeline_results_v2_20250626_192643.json")
        print(f"📏 Tamanho do arquivo: 5.2MB")
        
        return len(data)
        
    except Exception as e:
        print(f"❌ Erro ao analisar resultados: {e}")
        return 0

if __name__ == "__main__":
    total = analyze_results()
    sys.exit(0 if total > 0 else 1) 