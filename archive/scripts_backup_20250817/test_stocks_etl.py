#!/usr/bin/env python3
"""
Teste do ETL de Ações - Versão Simplificada
Testa a coleta de dados para algumas ações e inserção no Supabase via MCP
"""

import yfinance as yf
import pandas as pd
import json
import sys
from datetime import datetime

def test_yfinance_collection():
    """Testa coleta de dados via yfinance"""
    print("🧪 Testando coleta de dados via yfinance...")
    
    # Testa com algumas ações conhecidas
    test_tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA']
    
    results = []
    
    for ticker in test_tickers:
        try:
            print(f"📊 Coletando dados para {ticker}...")
            
            stock = yf.Ticker(ticker)
            
            # Dados básicos
            info = stock.info
            if not info:
                print(f"❌ Sem dados básicos para {ticker}")
                continue
            
            # Histórico 1 ano
            hist = stock.history(period="1y")
            if hist.empty:
                print(f"❌ Sem dados históricos para {ticker}")
                continue
            
            # Calcula algumas métricas básicas
            current_price = float(hist['Close'].iloc[-1])
            returns_12m = float((current_price / hist['Close'].iloc[0] - 1) * 100)
            volatility = float(hist['Close'].pct_change().std() * 100 * (252 ** 0.5))
            
            result = {
                'ticker': ticker,
                'name': info.get('longName', ticker),
                'sector': info.get('sector', 'Unknown'),
                'industry': info.get('industry', 'Unknown'),
                'exchange': info.get('exchange', 'Unknown'),
                'current_price': current_price,
                'market_cap': info.get('marketCap', 0),
                'returns_12m': returns_12m,
                'volatility_12m': volatility,
                'pe_ratio': info.get('trailingPE'),
                'dividend_yield': info.get('dividendYield'),
                'collected_at': datetime.now().isoformat()
            }
            
            results.append(result)
            print(f"✅ {ticker}: ${current_price:.2f}, Return: {returns_12m:.1f}%, Vol: {volatility:.1f}%")
            
        except Exception as e:
            print(f"❌ Erro ao processar {ticker}: {e}")
    
    # Salva resultados
    with open('test_stocks_results.json', 'w') as f:
        json.dump(results, f, indent=2, default=str)
    
    print(f"\n🎉 Teste concluído! {len(results)}/{len(test_tickers)} ações processadas com sucesso")
    print("📄 Resultados salvos em: test_stocks_results.json")
    
    return results

def load_csv_sample():
    """Carrega uma amostra do CSV de ações"""
    print("\n📂 Testando carregamento do CSV...")
    
    try:
        # Carrega o CSV
        csv_file = "../top_us_stocks_2025-07-29.csv"
        df = pd.read_csv(csv_file, sep=';', encoding='utf-8')
        
        print(f"📊 CSV carregado: {len(df)} linhas")
        print(f"📋 Colunas: {list(df.columns)}")
        
        # Limpa dados inválidos
        df_clean = df[df['ticker'] != '#CAMPO!'].copy()
        df_clean = df_clean.dropna(subset=['ticker']).copy()
        df_clean['clean_ticker'] = df_clean['ticker'].str.strip()
        
        # Remove tickers inválidos
        df_clean = df_clean[df_clean['clean_ticker'].str.len() <= 5].copy()
        df_clean = df_clean[~df_clean['clean_ticker'].str.contains(r'[^A-Z]', na=False)].copy()
        
        print(f"🧹 Após limpeza: {len(df_clean)} ações válidas")
        
        # Mostra amostra
        sample = df_clean[['ticker', 'symbol', 'Setor']].head(10)
        print("\n📋 Amostra das primeiras 10 ações:")
        for _, row in sample.iterrows():
            print(f"   • {row['ticker']}: {row['symbol']} ({row['Setor']})")
        
        return df_clean
        
    except Exception as e:
        print(f"❌ Erro ao carregar CSV: {e}")
        return None

if __name__ == "__main__":
    print("🚀 Iniciando teste do ETL de Ações")
    print("=" * 50)
    
    # Teste 1: yfinance
    yf_results = test_yfinance_collection()
    
    # Teste 2: CSV
    csv_data = load_csv_sample()
    
    print("\n" + "=" * 50)
    print("✅ Testes concluídos!")
    
    if yf_results:
        print(f"📊 yfinance: {len(yf_results)} ações coletadas")
    
    if csv_data is not None:
        print(f"📂 CSV: {len(csv_data)} ações válidas encontradas")
        
    print("\n🔄 Próximo passo: Implementar inserção no Supabase via MCP")


