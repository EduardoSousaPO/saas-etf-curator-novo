#!/usr/bin/env python3
"""
Script para buscar dados reais de ETFs usando yfinance
Retorna preços atuais, históricos, volatilidade e métricas de performance
"""

import yfinance as yf
import pandas as pd
import numpy as np
import json
import sys
from datetime import datetime, timedelta
import warnings

# Suprimir warnings do yfinance
warnings.filterwarnings('ignore')

def calculate_volatility(prices, period_days=252):
    """Calcula volatilidade anualizada"""
    if len(prices) < 2:
        return 0
    
    returns = prices.pct_change().dropna()
    volatility = returns.std() * np.sqrt(period_days)
    return float(volatility)

def calculate_sharpe_ratio(prices, risk_free_rate=0.02):
    """Calcula índice Sharpe"""
    if len(prices) < 2:
        return 0
    
    returns = prices.pct_change().dropna()
    excess_returns = returns.mean() * 252 - risk_free_rate
    volatility = returns.std() * np.sqrt(252)
    
    if volatility == 0:
        return 0
    
    return float(excess_returns / volatility)

def calculate_max_drawdown(prices):
    """Calcula máximo drawdown"""
    if len(prices) < 2:
        return 0
    
    peak = prices.expanding().max()
    drawdown = (prices - peak) / peak
    max_drawdown = drawdown.min()
    return float(max_drawdown)

def get_etf_data(symbol, purchase_date=None):
    """Busca dados completos de um ETF"""
    try:
        ticker = yf.Ticker(symbol)
        
        # Buscar dados históricos (1 ano)
        end_date = datetime.now()
        start_date = end_date - timedelta(days=365)
        
        hist = ticker.history(start=start_date, end=end_date)
        
        if hist.empty:
            return None
        
        # Preço atual
        current_price = float(hist['Close'].iloc[-1])
        
        # Preço na data de compra (se fornecida)
        purchase_price = current_price
        if purchase_date:
            try:
                purchase_datetime = datetime.strptime(purchase_date, '%Y-%m-%d')
                # Buscar preço mais próximo da data de compra
                purchase_hist = ticker.history(start=purchase_datetime - timedelta(days=5), 
                                             end=purchase_datetime + timedelta(days=5))
                if not purchase_hist.empty:
                    purchase_price = float(purchase_hist['Close'].iloc[0])
            except:
                pass
        
        # Calcular métricas
        close_prices = hist['Close']
        volatility = calculate_volatility(close_prices)
        sharpe_ratio = calculate_sharpe_ratio(close_prices)
        max_drawdown = calculate_max_drawdown(close_prices)
        
        # Retornos em diferentes períodos
        returns_1m = float((close_prices.iloc[-1] / close_prices.iloc[-22] - 1) * 100) if len(close_prices) >= 22 else 0
        returns_3m = float((close_prices.iloc[-1] / close_prices.iloc[-66] - 1) * 100) if len(close_prices) >= 66 else 0
        returns_6m = float((close_prices.iloc[-1] / close_prices.iloc[-132] - 1) * 100) if len(close_prices) >= 132 else 0
        returns_1y = float((close_prices.iloc[-1] / close_prices.iloc[0] - 1) * 100) if len(close_prices) >= 252 else 0
        
        # Informações básicas
        info = ticker.info
        
        return {
            'symbol': symbol,
            'current_price': current_price,
            'purchase_price': purchase_price,
            'currency': info.get('currency', 'USD'),
            'name': info.get('longName', symbol),
            'sector': info.get('category', 'Unknown'),
            'expense_ratio': info.get('annualReportExpenseRatio', 0),
            'aum': info.get('totalAssets', 0),
            'volatility': volatility,
            'sharpe_ratio': sharpe_ratio,
            'max_drawdown': max_drawdown,
            'returns': {
                '1m': returns_1m,
                '3m': returns_3m,
                '6m': returns_6m,
                '1y': returns_1y
            },
            'last_updated': datetime.now().isoformat(),
            'success': True
        }
        
    except Exception as e:
        return {
            'symbol': symbol,
            'error': str(e),
            'success': False
        }

def calculate_portfolio_performance(etfs_data, tracking_data):
    """Calcula performance do portfólio baseado em dados de tracking"""
    portfolio_performance = {
        'total_invested': 0,
        'current_value': 0,
        'total_gain_loss': 0,
        'total_gain_loss_percent': 0,
        'etfs_performance': [],
        'portfolio_metrics': {
            'weighted_volatility': 0,
            'portfolio_sharpe': 0,
            'portfolio_max_drawdown': 0
        }
    }
    
    total_weights = 0
    weighted_volatility = 0
    weighted_sharpe = 0
    weighted_max_drawdown = 0
    
    for tracking in tracking_data:
        symbol = tracking['etf_symbol']
        purchase_date = tracking['purchase_date']
        purchase_price = float(tracking['purchase_price'])
        shares_quantity = float(tracking['shares_quantity'])
        
        # Buscar dados do ETF
        etf_data = None
        for etf in etfs_data:
            if etf['symbol'] == symbol and etf['success']:
                etf_data = etf
                break
        
        if not etf_data:
            continue
        
        # Calcular performance individual
        current_price = etf_data['current_price']
        total_invested = purchase_price * shares_quantity
        current_value = current_price * shares_quantity
        gain_loss = current_value - total_invested
        gain_loss_percent = (gain_loss / total_invested) * 100 if total_invested > 0 else 0
        
        # Adicionar ao portfólio
        portfolio_performance['total_invested'] += total_invested
        portfolio_performance['current_value'] += current_value
        portfolio_performance['total_gain_loss'] += gain_loss
        
        # Calcular pesos para métricas ponderadas
        weight = total_invested
        total_weights += weight
        weighted_volatility += etf_data['volatility'] * weight
        weighted_sharpe += etf_data['sharpe_ratio'] * weight
        weighted_max_drawdown += etf_data['max_drawdown'] * weight
        
        # Adicionar performance individual
        portfolio_performance['etfs_performance'].append({
            'etf_symbol': symbol,
            'etf_name': etf_data['name'],
            'purchase_date': purchase_date,
            'purchase_price': purchase_price,
            'current_price': current_price,
            'shares_quantity': shares_quantity,
            'total_invested': total_invested,
            'current_value': current_value,
            'gain_loss': gain_loss,
            'gain_loss_percent': gain_loss_percent,
            'volatility': etf_data['volatility'],
            'sharpe_ratio': etf_data['sharpe_ratio'],
            'max_drawdown': etf_data['max_drawdown'],
            'returns': etf_data['returns']
        })
    
    # Calcular percentual total
    if portfolio_performance['total_invested'] > 0:
        portfolio_performance['total_gain_loss_percent'] = (
            portfolio_performance['total_gain_loss'] / portfolio_performance['total_invested']
        ) * 100
    
    # Calcular métricas ponderadas do portfólio
    if total_weights > 0:
        portfolio_performance['portfolio_metrics']['weighted_volatility'] = weighted_volatility / total_weights
        portfolio_performance['portfolio_metrics']['portfolio_sharpe'] = weighted_sharpe / total_weights
        portfolio_performance['portfolio_metrics']['portfolio_max_drawdown'] = weighted_max_drawdown / total_weights
    
    return portfolio_performance

def main():
    """Função principal"""
    if len(sys.argv) < 2:
        print(json.dumps({'error': 'Uso: python yfinance_etf_data.py <json_input_or_file>'}))
        sys.exit(1)
    
    try:
        # Parse do input JSON (pode ser string ou arquivo)
        input_arg = sys.argv[1]
        if input_arg.endswith('.json'):
            with open(input_arg, 'r') as f:
                input_data = json.load(f)
        else:
            input_data = json.loads(input_arg)
        symbols = input_data.get('symbols', [])
        tracking_data = input_data.get('tracking_data', [])
        
        # Buscar dados dos ETFs
        etfs_data = []
        for symbol in symbols:
            # Buscar data de compra se disponível
            purchase_date = None
            for tracking in tracking_data:
                if tracking['etf_symbol'] == symbol:
                    purchase_date = tracking['purchase_date']
                    break
            
            etf_data = get_etf_data(symbol, purchase_date)
            if etf_data:
                etfs_data.append(etf_data)
        
        # Calcular performance do portfólio
        if tracking_data:
            portfolio_performance = calculate_portfolio_performance(etfs_data, tracking_data)
            result = {
                'portfolio_performance': portfolio_performance,
                'etfs_data': etfs_data,
                'success': True
            }
        else:
            result = {
                'etfs_data': etfs_data,
                'success': True
            }
        
        print(json.dumps(result, indent=2))
        
    except Exception as e:
        print(json.dumps({'error': str(e), 'success': False}))
        sys.exit(1)

if __name__ == '__main__':
    main() 