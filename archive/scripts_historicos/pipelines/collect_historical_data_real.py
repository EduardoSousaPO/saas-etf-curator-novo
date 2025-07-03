#!/usr/bin/env python3
"""
Script direto para coletar dados históricos reais de ETFs
Usa yfinance para coletar dados e MCP para inserir no Supabase
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import time
import pytz

def log_progress(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    print(f"[{timestamp}] {message}")

def collect_etf_historical_data(symbol):
    """Coleta dados históricos de um ETF"""
    try:
        log_progress(f"🔄 Coletando dados históricos para {symbol}")
        
        # Criar ticker
        ticker = yf.Ticker(symbol)
        
        # Buscar dados históricos (máximo disponível)
        hist_data = ticker.history(period="max", auto_adjust=False)
        
        if hist_data.empty:
            log_progress(f"❌ Nenhum dado encontrado para {symbol}")
            return None
            
        # Buscar dividendos
        dividends = ticker.dividends
        
        # Preparar dados de preços
        prices_data = []
        for date, row in hist_data.iterrows():
            prices_data.append({
                'symbol': symbol,
                'date': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']) if pd.notna(row['Open']) else None,
                'high': float(row['High']) if pd.notna(row['High']) else None,
                'low': float(row['Low']) if pd.notna(row['Low']) else None,
                'close': float(row['Close']),
                'adjusted_close': float(row['Adj Close']) if pd.notna(row['Adj Close']) else None,
                'volume': int(row['Volume']) if pd.notna(row['Volume']) else None
            })
        
        # Preparar dados de dividendos
        dividends_data = []
        if not dividends.empty:
            for date, amount in dividends.items():
                dividends_data.append({
                    'symbol': symbol,
                    'ex_date': date.strftime('%Y-%m-%d'),
                    'pay_date': None,
                    'amount': float(amount),
                    'frequency': 'Quarterly',  # Assumir trimestral para ETFs
                    'yield_percentage': None
                })
        
        # Calcular métricas financeiras
        hist_data['daily_return'] = hist_data['Adj Close'].pct_change()
        
        # Métricas de retorno
        periods = {
            '12m': 252,
            '24m': 504,
            '36m': 756,
            '5y': 1260,
            '10y': 2520
        }
        
        metrics = {}
        
        for period_name, days in periods.items():
            if len(hist_data) < days:
                continue
                
            period_data = hist_data.tail(days)
            daily_returns = period_data['daily_return'].dropna()
            
            if len(daily_returns) < 30:
                continue
            
            # Retorno total
            start_price = period_data['Adj Close'].iloc[0]
            end_price = period_data['Adj Close'].iloc[-1]
            total_return = (end_price / start_price - 1) * 100
            
            # Volatilidade anualizada
            volatility = daily_returns.std() * np.sqrt(252) * 100
            
            # Sharpe Ratio
            risk_free_rate = 0.02
            excess_return = (total_return / 100) - risk_free_rate
            sharpe_ratio = excess_return / (volatility / 100) if volatility > 0 else 0
            
            # Mapear para nomes corretos das colunas
            if period_name == '5y':
                metrics['returns_5y'] = round(total_return, 2)
            elif period_name == '10y':
                metrics['ten_year_return'] = round(total_return, 2)
                metrics['ten_year_volatility'] = round(volatility, 2)
                metrics['ten_year_sharpe'] = round(sharpe_ratio, 2)
            else:
                metrics[f'returns_{period_name}'] = round(total_return, 2)
                metrics[f'volatility_{period_name}'] = round(volatility, 2)
                metrics[f'sharpe_{period_name}'] = round(sharpe_ratio, 2)
        
        # Max Drawdown
        cumulative_returns = (1 + hist_data['daily_return'].fillna(0)).cumprod()
        rolling_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - rolling_max) / rolling_max
        max_drawdown = drawdown.min() * 100
        metrics['max_drawdown'] = round(max_drawdown, 2)
        
        # Métricas de dividendos - CORRIGIR TIMEZONE
        now = pd.Timestamp.now(tz='UTC')  # Usar timestamp com timezone
        dividend_periods = {'12m': 365, '24m': 730, '36m': 1095}
        
        for period_name, days in dividend_periods.items():
            cutoff_date = now - pd.Timedelta(days=days)
            
            # Converter dividends index para UTC se necessário
            if dividends.empty:
                total_dividends = 0
            else:
                # Garantir que ambos têm timezone
                dividends_utc = dividends.copy()
                if dividends_utc.index.tz is None:
                    dividends_utc.index = dividends_utc.index.tz_localize('UTC')
                elif dividends_utc.index.tz != cutoff_date.tz:
                    dividends_utc.index = dividends_utc.index.tz_convert('UTC')
                
                period_dividends = dividends_utc[dividends_utc.index >= cutoff_date]
                total_dividends = period_dividends.sum()
            
            metrics[f'dividends_{period_name}'] = round(total_dividends, 4)
        
        # Dividendos total
        metrics['dividends_all_time'] = round(dividends.sum() if not dividends.empty else 0, 4)
        
        result = {
            'symbol': symbol,
            'prices_count': len(prices_data),
            'dividends_count': len(dividends_data),
            'date_range': {
                'start': hist_data.index.min().strftime('%Y-%m-%d'),
                'end': hist_data.index.max().strftime('%Y-%m-%d')
            },
            'prices_data': prices_data,
            'dividends_data': dividends_data,
            'metrics': metrics
        }
        
        log_progress(f"✅ {symbol}: {len(prices_data)} preços, {len(dividends_data)} dividendos")
        log_progress(f"   Período: {result['date_range']['start']} até {result['date_range']['end']}")
        log_progress(f"   Métricas: {len(metrics)} calculadas")
        
        return result
        
    except Exception as e:
        log_progress(f"❌ Erro ao coletar {symbol}: {str(e)}")
        return None

def main():
    """Função principal"""
    log_progress("🚀 Iniciando coleta de dados históricos")
    
    # ETFs para processar
    etf_symbols = ['SPY', 'VTI', 'QQQ']
    
    results = {
        'processed_etfs': [],
        'errors': [],
        'start_time': datetime.now().isoformat()
    }
    
    for symbol in etf_symbols:
        # Coletar dados
        data = collect_etf_historical_data(symbol)
        
        if data:
            results['processed_etfs'].append(data)
            
            # Salvar dados individuais para análise
            filename = f"historical_data_{symbol}_{datetime.now().strftime('%Y%m%d')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            log_progress(f"💾 Dados de {symbol} salvos em {filename}")
        else:
            results['errors'].append(symbol)
        
        # Rate limiting
        time.sleep(2)
    
    results['end_time'] = datetime.now().isoformat()
    results['summary'] = {
        'total_processed': len(results['processed_etfs']),
        'total_errors': len(results['errors']),
        'success_rate': (len(results['processed_etfs']) / len(etf_symbols)) * 100
    }
    
    # Salvar resultados finais
    final_filename = f"historical_collection_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(final_filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Exibir resumo
    log_progress("📊 RESUMO FINAL")
    log_progress(f"ETFs processados: {results['summary']['total_processed']}")
    log_progress(f"Erros: {results['summary']['total_errors']}")
    log_progress(f"Taxa de sucesso: {results['summary']['success_rate']:.1f}%")
    log_progress(f"Resultados salvos em: {final_filename}")
    
    if results['processed_etfs']:
        log_progress("\n📈 DETALHES POR ETF:")
        for etf_data in results['processed_etfs']:
            symbol = etf_data['symbol']
            prices = etf_data['prices_count']
            dividends = etf_data['dividends_count']
            period = etf_data['date_range']
            metrics = len(etf_data['metrics'])
            
            log_progress(f"  {symbol}: {prices} preços, {dividends} dividendos, {metrics} métricas")
            log_progress(f"    Período: {period['start']} até {period['end']}")
    
    return results

if __name__ == "__main__":
    main() 
"""
Script direto para coletar dados históricos reais de ETFs
Usa yfinance para coletar dados e MCP para inserir no Supabase
"""

import yfinance as yf
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import json
import time
import pytz

def log_progress(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime('%H:%M:%S')
    print(f"[{timestamp}] {message}")

def collect_etf_historical_data(symbol):
    """Coleta dados históricos de um ETF"""
    try:
        log_progress(f"🔄 Coletando dados históricos para {symbol}")
        
        # Criar ticker
        ticker = yf.Ticker(symbol)
        
        # Buscar dados históricos (máximo disponível)
        hist_data = ticker.history(period="max", auto_adjust=False)
        
        if hist_data.empty:
            log_progress(f"❌ Nenhum dado encontrado para {symbol}")
            return None
            
        # Buscar dividendos
        dividends = ticker.dividends
        
        # Preparar dados de preços
        prices_data = []
        for date, row in hist_data.iterrows():
            prices_data.append({
                'symbol': symbol,
                'date': date.strftime('%Y-%m-%d'),
                'open': float(row['Open']) if pd.notna(row['Open']) else None,
                'high': float(row['High']) if pd.notna(row['High']) else None,
                'low': float(row['Low']) if pd.notna(row['Low']) else None,
                'close': float(row['Close']),
                'adjusted_close': float(row['Adj Close']) if pd.notna(row['Adj Close']) else None,
                'volume': int(row['Volume']) if pd.notna(row['Volume']) else None
            })
        
        # Preparar dados de dividendos
        dividends_data = []
        if not dividends.empty:
            for date, amount in dividends.items():
                dividends_data.append({
                    'symbol': symbol,
                    'ex_date': date.strftime('%Y-%m-%d'),
                    'pay_date': None,
                    'amount': float(amount),
                    'frequency': 'Quarterly',  # Assumir trimestral para ETFs
                    'yield_percentage': None
                })
        
        # Calcular métricas financeiras
        hist_data['daily_return'] = hist_data['Adj Close'].pct_change()
        
        # Métricas de retorno
        periods = {
            '12m': 252,
            '24m': 504,
            '36m': 756,
            '5y': 1260,
            '10y': 2520
        }
        
        metrics = {}
        
        for period_name, days in periods.items():
            if len(hist_data) < days:
                continue
                
            period_data = hist_data.tail(days)
            daily_returns = period_data['daily_return'].dropna()
            
            if len(daily_returns) < 30:
                continue
            
            # Retorno total
            start_price = period_data['Adj Close'].iloc[0]
            end_price = period_data['Adj Close'].iloc[-1]
            total_return = (end_price / start_price - 1) * 100
            
            # Volatilidade anualizada
            volatility = daily_returns.std() * np.sqrt(252) * 100
            
            # Sharpe Ratio
            risk_free_rate = 0.02
            excess_return = (total_return / 100) - risk_free_rate
            sharpe_ratio = excess_return / (volatility / 100) if volatility > 0 else 0
            
            # Mapear para nomes corretos das colunas
            if period_name == '5y':
                metrics['returns_5y'] = round(total_return, 2)
            elif period_name == '10y':
                metrics['ten_year_return'] = round(total_return, 2)
                metrics['ten_year_volatility'] = round(volatility, 2)
                metrics['ten_year_sharpe'] = round(sharpe_ratio, 2)
            else:
                metrics[f'returns_{period_name}'] = round(total_return, 2)
                metrics[f'volatility_{period_name}'] = round(volatility, 2)
                metrics[f'sharpe_{period_name}'] = round(sharpe_ratio, 2)
        
        # Max Drawdown
        cumulative_returns = (1 + hist_data['daily_return'].fillna(0)).cumprod()
        rolling_max = cumulative_returns.expanding().max()
        drawdown = (cumulative_returns - rolling_max) / rolling_max
        max_drawdown = drawdown.min() * 100
        metrics['max_drawdown'] = round(max_drawdown, 2)
        
        # Métricas de dividendos - CORRIGIR TIMEZONE
        now = pd.Timestamp.now(tz='UTC')  # Usar timestamp com timezone
        dividend_periods = {'12m': 365, '24m': 730, '36m': 1095}
        
        for period_name, days in dividend_periods.items():
            cutoff_date = now - pd.Timedelta(days=days)
            
            # Converter dividends index para UTC se necessário
            if dividends.empty:
                total_dividends = 0
            else:
                # Garantir que ambos têm timezone
                dividends_utc = dividends.copy()
                if dividends_utc.index.tz is None:
                    dividends_utc.index = dividends_utc.index.tz_localize('UTC')
                elif dividends_utc.index.tz != cutoff_date.tz:
                    dividends_utc.index = dividends_utc.index.tz_convert('UTC')
                
                period_dividends = dividends_utc[dividends_utc.index >= cutoff_date]
                total_dividends = period_dividends.sum()
            
            metrics[f'dividends_{period_name}'] = round(total_dividends, 4)
        
        # Dividendos total
        metrics['dividends_all_time'] = round(dividends.sum() if not dividends.empty else 0, 4)
        
        result = {
            'symbol': symbol,
            'prices_count': len(prices_data),
            'dividends_count': len(dividends_data),
            'date_range': {
                'start': hist_data.index.min().strftime('%Y-%m-%d'),
                'end': hist_data.index.max().strftime('%Y-%m-%d')
            },
            'prices_data': prices_data,
            'dividends_data': dividends_data,
            'metrics': metrics
        }
        
        log_progress(f"✅ {symbol}: {len(prices_data)} preços, {len(dividends_data)} dividendos")
        log_progress(f"   Período: {result['date_range']['start']} até {result['date_range']['end']}")
        log_progress(f"   Métricas: {len(metrics)} calculadas")
        
        return result
        
    except Exception as e:
        log_progress(f"❌ Erro ao coletar {symbol}: {str(e)}")
        return None

def main():
    """Função principal"""
    log_progress("🚀 Iniciando coleta de dados históricos")
    
    # ETFs para processar
    etf_symbols = ['SPY', 'VTI', 'QQQ']
    
    results = {
        'processed_etfs': [],
        'errors': [],
        'start_time': datetime.now().isoformat()
    }
    
    for symbol in etf_symbols:
        # Coletar dados
        data = collect_etf_historical_data(symbol)
        
        if data:
            results['processed_etfs'].append(data)
            
            # Salvar dados individuais para análise
            filename = f"historical_data_{symbol}_{datetime.now().strftime('%Y%m%d')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
            
            log_progress(f"💾 Dados de {symbol} salvos em {filename}")
        else:
            results['errors'].append(symbol)
        
        # Rate limiting
        time.sleep(2)
    
    results['end_time'] = datetime.now().isoformat()
    results['summary'] = {
        'total_processed': len(results['processed_etfs']),
        'total_errors': len(results['errors']),
        'success_rate': (len(results['processed_etfs']) / len(etf_symbols)) * 100
    }
    
    # Salvar resultados finais
    final_filename = f"historical_collection_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(final_filename, 'w', encoding='utf-8') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)
    
    # Exibir resumo
    log_progress("📊 RESUMO FINAL")
    log_progress(f"ETFs processados: {results['summary']['total_processed']}")
    log_progress(f"Erros: {results['summary']['total_errors']}")
    log_progress(f"Taxa de sucesso: {results['summary']['success_rate']:.1f}%")
    log_progress(f"Resultados salvos em: {final_filename}")
    
    if results['processed_etfs']:
        log_progress("\n📈 DETALHES POR ETF:")
        for etf_data in results['processed_etfs']:
            symbol = etf_data['symbol']
            prices = etf_data['prices_count']
            dividends = etf_data['dividends_count']
            period = etf_data['date_range']
            metrics = len(etf_data['metrics'])
            
            log_progress(f"  {symbol}: {prices} preços, {dividends} dividendos, {metrics} métricas")
            log_progress(f"    Período: {period['start']} até {period['end']}")
    
    return results

if __name__ == "__main__":
    main() 