#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
MASSIVE CSV PARSER - IMPLEMENTAÇÃO AGRESSIVA
Corrige parsing do CSV das 2.460 ações americanas
"""

import pandas as pd
import re
import json
from datetime import datetime

def parse_csv_aggressively():
    """Parser agressivo do CSV original"""
    
    print("🚀 MASSIVE CSV PARSER - IMPLEMENTAÇÃO AGRESSIVA")
    print("=" * 60)
    
    csv_path = '../top_us_stocks_2025-07-29.csv'
    
    # Estratégia 1: Análise manual das primeiras linhas
    print("📋 FASE 1: ANÁLISE MANUAL DO FORMATO")
    print("-" * 40)
    
    try:
        with open(csv_path, 'r', encoding='latin-1') as f:
            lines = f.readlines()[:10]
        
        print(f"📄 Analisando primeiras 10 linhas:")
        for i, line in enumerate(lines):
            clean_line = line.strip()
            if clean_line:
                print(f"  {i+1:2d}: {clean_line[:100]}{'...' if len(clean_line) > 100 else ''}")
        
        # Detectar separador
        header = lines[0].strip()
        separators = [';', ',', '\t', '|']
        detected_sep = None
        
        for sep in separators:
            if header.count(sep) >= 5:  # Mínimo 6 colunas
                detected_sep = sep
                cols = header.split(sep)
                print(f"✅ Separador detectado: '{sep}' ({len(cols)} colunas)")
                print(f"📊 Colunas: {cols[:5]}...")
                break
        
        if not detected_sep:
            print("❌ Separador não detectado automaticamente")
            return False
            
    except Exception as e:
        print(f"❌ Erro na análise manual: {e}")
        return False
    
    # Estratégia 2: Parser robusto
    print(f"\n📋 FASE 2: PARSER ROBUSTO")
    print("-" * 40)
    
    try:
        # Tentar diferentes configurações
        configs = [
            {'sep': detected_sep, 'encoding': 'latin-1', 'quoting': 1},
            {'sep': detected_sep, 'encoding': 'utf-8', 'quoting': 1},
            {'sep': detected_sep, 'encoding': 'latin-1', 'quoting': 0},
            {'sep': detected_sep, 'encoding': 'cp1252', 'quoting': 1},
        ]
        
        df = None
        successful_config = None
        
        for i, config in enumerate(configs):
            try:
                print(f"  🧪 Testando configuração {i+1}: {config}")
                df = pd.read_csv(csv_path, 
                               on_bad_lines='skip',
                               **config)
                
                if len(df) > 1000:  # Mínimo esperado
                    successful_config = config
                    print(f"  ✅ Sucesso! {len(df)} linhas carregadas")
                    break
                else:
                    print(f"  ⚠️ Poucos dados: {len(df)} linhas")
                    
            except Exception as e:
                print(f"  ❌ Falhou: {str(e)[:50]}...")
        
        if df is None or len(df) < 100:
            print("❌ Todas as configurações falharam")
            return False
            
    except Exception as e:
        print(f"❌ Erro no parser robusto: {e}")
        return False
    
    # Estratégia 3: Limpeza e mapeamento de colunas
    print(f"\n📋 FASE 3: LIMPEZA E MAPEAMENTO")
    print("-" * 40)
    
    print(f"📊 DataFrame carregado:")
    print(f"  Linhas: {len(df)}")
    print(f"  Colunas: {len(df.columns)}")
    print(f"  Colunas: {list(df.columns)}")
    
    # Mostrar amostra dos dados
    print(f"\n📄 Primeiras 3 linhas:")
    print(df.head(3).to_string())
    
    # Mapear colunas automaticamente
    column_mapping = {}
    
    for col in df.columns:
        col_lower = str(col).lower()
        if any(word in col_lower for word in ['ticker', 'symbol']):
            if 'ticker' in col_lower:
                column_mapping['ticker'] = col
            elif not column_mapping.get('ticker'):
                column_mapping['ticker'] = col
        elif any(word in col_lower for word in ['name', 'company', 'empresa']):
            column_mapping['name'] = col
        elif any(word in col_lower for word in ['sector', 'setor']):
            column_mapping['sector'] = col
        elif any(word in col_lower for word in ['price', 'preço', 'preco']):
            column_mapping['price'] = col
        elif any(word in col_lower for word in ['market', 'cap', 'capitalização']):
            column_mapping['market_cap'] = col
        elif any(word in col_lower for word in ['desc', 'description', 'descrição']):
            column_mapping['description'] = col
    
    print(f"\n🗺️ Mapeamento de colunas:")
    for key, value in column_mapping.items():
        print(f"  {key}: {value}")
    
    # Estratégia 4: Processamento inteligente
    print(f"\n📋 FASE 4: PROCESSAMENTO INTELIGENTE")
    print("-" * 40)
    
    processed_stocks = []
    errors = 0
    
    for idx, row in df.iterrows():
        try:
            # Extrair ticker
            ticker = None
            if column_mapping.get('ticker'):
                ticker_raw = str(row[column_mapping['ticker']])
                # Extrair ticker usando regex (ex: "Apple (NASDAQ:AAPL)" -> "AAPL")
                ticker_match = re.search(r'\b([A-Z]{1,5})\b', ticker_raw)
                if ticker_match:
                    ticker = ticker_match.group(1)
                elif ticker_raw.isalpha() and len(ticker_raw) <= 5:
                    ticker = ticker_raw.upper()
            
            if not ticker or len(ticker) < 1:
                continue
            
            # Extrair nome da empresa
            name = ticker  # Default
            if column_mapping.get('name'):
                name_raw = str(row[column_mapping['name']])
                # Extrair nome antes do símbolo (ex: "Apple (NASDAQ:AAPL)" -> "Apple")
                name_match = re.match(r'^([^(]+)', name_raw)
                if name_match:
                    name = name_match.group(1).strip()
            
            # Extrair setor
            sector = 'Technology'  # Default
            if column_mapping.get('sector'):
                sector_raw = str(row[column_mapping['sector']])
                if sector_raw and sector_raw != 'nan':
                    sector = sector_raw.strip()
            
            # Extrair descrição
            description = f'American stock {ticker} in {sector} sector'
            if column_mapping.get('description'):
                desc_raw = str(row[column_mapping['description']])
                if desc_raw and desc_raw != 'nan' and len(desc_raw) > 10:
                    description = desc_raw[:1000]  # Limitar tamanho
            
            processed_stocks.append({
                'ticker': ticker,
                'name': name,
                'sector': sector,
                'description': description,
                'source_row': idx
            })
            
        except Exception as e:
            errors += 1
            if errors <= 5:  # Mostrar apenas os primeiros 5 erros
                print(f"  ⚠️ Erro linha {idx}: {str(e)[:50]}...")
    
    print(f"✅ Processamento concluído:")
    print(f"  Ações processadas: {len(processed_stocks)}")
    print(f"  Erros: {errors}")
    print(f"  Taxa de sucesso: {len(processed_stocks)/(len(df))*100:.1f}%")
    
    # Estratégia 5: Salvar dados processados
    print(f"\n📋 FASE 5: SALVANDO DADOS PROCESSADOS")
    print("-" * 40)
    
    # Salvar como JSON para uso posterior
    with open('processed_stocks.json', 'w', encoding='utf-8') as f:
        json.dump(processed_stocks, f, indent=2, ensure_ascii=False)
    
    # Salvar como CSV limpo
    df_clean = pd.DataFrame(processed_stocks)
    df_clean.to_csv('processed_stocks.csv', index=False, encoding='utf-8')
    
    print(f"✅ Dados salvos:")
    print(f"  📄 processed_stocks.json ({len(processed_stocks)} ações)")
    print(f"  📄 processed_stocks.csv ({len(processed_stocks)} ações)")
    
    # Mostrar amostra
    print(f"\n📊 AMOSTRA DOS DADOS PROCESSADOS:")
    print(df_clean.head(10).to_string())
    
    return len(processed_stocks)

if __name__ == "__main__":
    result = parse_csv_aggressively()
    if result:
        print(f"\n🎉 PARSER AGRESSIVO CONCLUÍDO COM SUCESSO!")
        print(f"📊 {result} ações prontas para processamento com yfinance")
    else:
        print(f"\n❌ PARSER AGRESSIVO FALHOU")




