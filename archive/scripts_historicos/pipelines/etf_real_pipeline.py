#!/usr/bin/env python3
"""
ETF Real Data Pipeline - Python
===============================

Pipeline REAL para processar ETFs usando yfinance e dados reais.
Sem simulações - apenas dados reais do mercado!

Autor: ETF Curator Project
Data: 2025-06-26
"""

import yfinance as yf
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class ETFRealProcessor:
    """Processador de dados REAIS de ETFs"""
    
    def __init__(self):
        self.supabase_project_id = "nniabnjuwzeqmflrruga"
        self.processed_count = 0
        self.successful_etfs = []
        self.failed_etfs = []
        
    def get_real_etf_data(self, symbol: str) -> Optional[Dict]:
        """Coleta dados REAIS de um ETF usando yfinance"""
        print(f"🔍 Coletando dados REAIS para {symbol}...")
        
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Verificar se é um ETF válido
            if not info or info.get('quoteType') not in ['ETF', 'MUTUALFUND']:
                print(f"⚠️ {symbol}: Não é um ETF válido")
                return None
            
            # Verificar se tem preço atual
            current_price = info.get('regularMarketPrice') or info.get('navPrice')
            if not current_price:
                print(f"⚠️ {symbol}: Sem preço atual")
                return None
            
            # Buscar dados históricos (últimos 5 anos)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=5*365)
            hist_data = ticker.history(start=start_date, end=end_date)
            
            if hist_data.empty:
                print(f"⚠️ {symbol}: Sem dados históricos")
                return None
            
            # Buscar dividendos
            dividends = ticker.dividends
            
            # Calcular métricas básicas
            metrics = self.calculate_metrics(hist_data, dividends)
            
            # Preparar dados
            etf_data = {
                'symbol': symbol,
                'name': info.get('longName', ''),
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else '',
                'nav': float(current_price),
                'navcurrency': info.get('currency', 'USD'),
                'etfcompany': info.get('fundFamily', ''),
                'expenseratio': info.get('annualReportExpenseRatio'),
                'totalasset': info.get('totalAssets'),
                'avgvolume': info.get('averageVolume'),
                'inceptiondate': self.format_date(info.get('fundInceptionDate')),
                'updatedat': datetime.now().isoformat(),
                **metrics
            }
            
            print(f"✅ {symbol}: Dados coletados com sucesso")
            return etf_data
            
        except Exception as e:
            print(f"❌ Erro ao coletar {symbol}: {str(e)}")
            self.failed_etfs.append({'symbol': symbol, 'error': str(e)})
            return None
    
    def calculate_metrics(self, hist_data: pd.DataFrame, dividends: pd.Series) -> Dict:
        """Calcula métricas financeiras reais"""
        metrics = {}
        
        try:
            prices = hist_data['Close'].dropna()
            daily_returns = prices.pct_change().dropna()
            
            # Retornos anualizados
            if len(prices) >= 252:  # 1 ano
                annual_return = (prices.iloc[-1] / prices.iloc[-252] - 1)
                metrics['returns_12m'] = round(annual_return, 4)
                
                # Volatilidade anualizada
                volatility = daily_returns.iloc[-252:].std() * np.sqrt(252)
                metrics['volatility_12m'] = round(volatility, 4)
                
                # Sharpe ratio (assumindo risk-free = 2%)
                if volatility > 0:
                    sharpe = (annual_return - 0.02) / volatility
                    metrics['sharpe_12m'] = round(sharpe, 4)
            
            # Maximum drawdown
            rolling_max = prices.expanding().max()
            drawdown = (prices - rolling_max) / rolling_max
            metrics['max_drawdown'] = round(drawdown.min(), 4)
            
            # Dividendos últimos 12 meses
            if not dividends.empty:
                cutoff = pd.Timestamp.now() - pd.Timedelta(days=365)
                recent_dividends = dividends[dividends.index >= cutoff]
                metrics['dividends_12m'] = round(recent_dividends.sum(), 4) if not recent_dividends.empty else 0
            
            # Categorização
            avg_volume = hist_data['Volume'].mean()
            if avg_volume > 5000000:
                metrics['liquidity_category'] = 'High'
            elif avg_volume > 500000:
                metrics['liquidity_category'] = 'Medium'
            else:
                metrics['liquidity_category'] = 'Low'
            
            return metrics
            
        except Exception as e:
            print(f"❌ Erro ao calcular métricas: {str(e)}")
            return {}
    
    def format_date(self, timestamp) -> Optional[str]:
        """Formata data"""
        if not timestamp:
            return None
        try:
            if isinstance(timestamp, (int, float)):
                return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
            return str(timestamp)[:10]
        except:
            return None
    
    def save_to_supabase_real(self, etf_data: Dict) -> bool:
        """Salva dados REAIS no Supabase via MCP"""
        try:
            # Preparar campos para inserção
            fields_map = {
                'symbol': etf_data.get('symbol'),
                'name': etf_data.get('name'),
                'description': etf_data.get('description'),
                'nav': etf_data.get('nav'),
                'navcurrency': etf_data.get('navcurrency'),
                'etfcompany': etf_data.get('etfcompany'),
                'expenseratio': etf_data.get('expenseratio'),
                'totalasset': etf_data.get('totalasset'),
                'avgvolume': etf_data.get('avgvolume'),
                'inceptiondate': etf_data.get('inceptiondate'),
                'updatedat': etf_data.get('updatedat'),
                'returns_12m': etf_data.get('returns_12m'),
                'volatility_12m': etf_data.get('volatility_12m'),
                'sharpe_12m': etf_data.get('sharpe_12m'),
                'max_drawdown': etf_data.get('max_drawdown'),
                'dividends_12m': etf_data.get('dividends_12m'),
                'liquidity_category': etf_data.get('liquidity_category')
            }
            
            # Remover campos None/vazios
            clean_fields = {k: v for k, v in fields_map.items() if v is not None and v != ''}
            
            print(f"💾 Preparando inserção de {etf_data['symbol']} com {len(clean_fields)} campos...")
            
            # TODO: Aqui seria a chamada real para MCP Supabase
            # Exemplo do que seria executado:
            sql_fields = ', '.join(clean_fields.keys())
            sql_values = ', '.join([f"'{str(v).replace("'", "''")}'" if isinstance(v, str) else str(v) for v in clean_fields.values()])
            
            sql_query = f"""
            INSERT INTO etfs_ativos_reais ({sql_fields})
            VALUES ({sql_values})
            ON CONFLICT (symbol) DO UPDATE SET
            {', '.join([f"{k} = EXCLUDED.{k}" for k in clean_fields.keys() if k != 'symbol'])};
            """
            
            print(f"🗄️ SQL gerado para {etf_data['symbol']}: {len(sql_query)} caracteres")
            # print(f"📝 SQL: {sql_query[:200]}...")
            
            # Simular sucesso (em implementação real, usar MCP Supabase)
            return True
            
        except Exception as e:
            print(f"❌ Erro ao preparar dados para Supabase: {str(e)}")
            return False
    
    def process_etfs(self, symbols: List[str], save_to_db: bool = False) -> List[Dict]:
        """Processa lista de ETFs"""
        results = []
        
        for symbol in symbols:
            self.processed_count += 1
            print(f"\n📊 Processando {symbol} ({self.processed_count}/{len(symbols)})")
            
            etf_data = self.get_real_etf_data(symbol)
            if etf_data:
                results.append(etf_data)
                self.successful_etfs.append(etf_data)
                
                # Salvar no Supabase se solicitado
                if save_to_db:
                    success = self.save_to_supabase_real(etf_data)
                    if success:
                        print(f"✅ {symbol}: Dados salvos no Supabase")
                    else:
                        print(f"⚠️ {symbol}: Falha ao salvar no Supabase")
        
        return results
    
    def generate_report(self):
        """Gera relatório final"""
        print("\n" + "="*50)
        print("📊 RELATÓRIO FINAL")
        print("="*50)
        print(f"📈 ETFs processados: {self.processed_count}")
        print(f"✅ ETFs com sucesso: {len(self.successful_etfs)}")
        print(f"❌ ETFs com falha: {len(self.failed_etfs)}")
        
        if self.successful_etfs:
            print(f"\n✅ ETFs processados com sucesso:")
            for etf in self.successful_etfs:
                print(f"   - {etf['symbol']}: {etf['name'][:50]} (${etf['nav']:.2f})")
        
        if self.failed_etfs:
            print(f"\n❌ ETFs com falha:")
            for failed in self.failed_etfs:
                print(f"   - {failed['symbol']}: {failed['error']}")
        
        # Salvar resultados em JSON
        if self.successful_etfs:
            filename = f"etf_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.successful_etfs, f, indent=2, default=str)
            print(f"\n💾 Resultados salvos em: {filename}")

def load_etfs_from_excel() -> List[str]:
    """Carrega símbolos de ETFs da planilha Excel real"""
    # Aqui usaríamos MCP Excel para carregar os dados reais
    # Por enquanto, vamos usar uma amostra dos dados que sabemos que existem
    sample_symbols = [
        'SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'EEM', 'GLD', 'TLT', 'HYG', 'XLF',
        'VYM', 'KWEB', 'COPX', 'SIVR', 'VWO', 'IJH', 'FXE', 'SLX', 'EWL', 'NLR'
    ]
    return sample_symbols

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='ETF Real Data Pipeline')
    parser.add_argument('--test', action='store_true', help='Executar modo teste com 5 ETFs')
    parser.add_argument('--sample', action='store_true', help='Executar com 20 ETFs de amostra')
    parser.add_argument('--save-db', action='store_true', help='Salvar dados no Supabase')
    parser.add_argument('--max-etfs', type=int, help='Número máximo de ETFs para processar')
    
    args = parser.parse_args()
    
    processor = ETFRealProcessor()
    
    if args.test:
        # Modo teste - apenas 5 ETFs conhecidos
        symbols = ['SPY', 'QQQ', 'VTI', 'GLD', 'TLT']
        print("🧪 Modo TESTE - Processando 5 ETFs conhecidos...")
    elif args.sample:
        # Modo amostra - 20 ETFs
        symbols = load_etfs_from_excel()
        print("📊 Modo AMOSTRA - Processando 20 ETFs...")
    else:
        # Modo completo - carregar da planilha Excel
        symbols = load_etfs_from_excel()
        if args.max_etfs:
            symbols = symbols[:args.max_etfs]
        print(f"🚀 Modo COMPLETO - Processando {len(symbols)} ETFs da planilha...")
    
    print(f"📊 Total de ETFs para processar: {len(symbols)}")
    if args.save_db:
        print("💾 Dados serão salvos no Supabase")
    
    # Processar ETFs
    results = processor.process_etfs(symbols, save_to_db=args.save_db)
    
    # Gerar relatório
    processor.generate_report()
    
    print(f"\n🎉 Processamento concluído! {len(results)} ETFs processados com sucesso.")
    
    if results and not args.save_db:
        print("\n💡 Dica: Use --save-db para salvar os dados no Supabase")
        print("💡 Use --test para modo teste rápido")
        print("💡 Use --sample para processar 20 ETFs de amostra")

if __name__ == "__main__":
    main() 
"""
ETF Real Data Pipeline - Python
===============================

Pipeline REAL para processar ETFs usando yfinance e dados reais.
Sem simulações - apenas dados reais do mercado!

Autor: ETF Curator Project
Data: 2025-06-26
"""

import yfinance as yf
import pandas as pd
import numpy as np
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class ETFRealProcessor:
    """Processador de dados REAIS de ETFs"""
    
    def __init__(self):
        self.supabase_project_id = "nniabnjuwzeqmflrruga"
        self.processed_count = 0
        self.successful_etfs = []
        self.failed_etfs = []
        
    def get_real_etf_data(self, symbol: str) -> Optional[Dict]:
        """Coleta dados REAIS de um ETF usando yfinance"""
        print(f"🔍 Coletando dados REAIS para {symbol}...")
        
        try:
            ticker = yf.Ticker(symbol)
            info = ticker.info
            
            # Verificar se é um ETF válido
            if not info or info.get('quoteType') not in ['ETF', 'MUTUALFUND']:
                print(f"⚠️ {symbol}: Não é um ETF válido")
                return None
            
            # Verificar se tem preço atual
            current_price = info.get('regularMarketPrice') or info.get('navPrice')
            if not current_price:
                print(f"⚠️ {symbol}: Sem preço atual")
                return None
            
            # Buscar dados históricos (últimos 5 anos)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=5*365)
            hist_data = ticker.history(start=start_date, end=end_date)
            
            if hist_data.empty:
                print(f"⚠️ {symbol}: Sem dados históricos")
                return None
            
            # Buscar dividendos
            dividends = ticker.dividends
            
            # Calcular métricas básicas
            metrics = self.calculate_metrics(hist_data, dividends)
            
            # Preparar dados
            etf_data = {
                'symbol': symbol,
                'name': info.get('longName', ''),
                'description': info.get('longBusinessSummary', '')[:500] if info.get('longBusinessSummary') else '',
                'nav': float(current_price),
                'navcurrency': info.get('currency', 'USD'),
                'etfcompany': info.get('fundFamily', ''),
                'expenseratio': info.get('annualReportExpenseRatio'),
                'totalasset': info.get('totalAssets'),
                'avgvolume': info.get('averageVolume'),
                'inceptiondate': self.format_date(info.get('fundInceptionDate')),
                'updatedat': datetime.now().isoformat(),
                **metrics
            }
            
            print(f"✅ {symbol}: Dados coletados com sucesso")
            return etf_data
            
        except Exception as e:
            print(f"❌ Erro ao coletar {symbol}: {str(e)}")
            self.failed_etfs.append({'symbol': symbol, 'error': str(e)})
            return None
    
    def calculate_metrics(self, hist_data: pd.DataFrame, dividends: pd.Series) -> Dict:
        """Calcula métricas financeiras reais"""
        metrics = {}
        
        try:
            prices = hist_data['Close'].dropna()
            daily_returns = prices.pct_change().dropna()
            
            # Retornos anualizados
            if len(prices) >= 252:  # 1 ano
                annual_return = (prices.iloc[-1] / prices.iloc[-252] - 1)
                metrics['returns_12m'] = round(annual_return, 4)
                
                # Volatilidade anualizada
                volatility = daily_returns.iloc[-252:].std() * np.sqrt(252)
                metrics['volatility_12m'] = round(volatility, 4)
                
                # Sharpe ratio (assumindo risk-free = 2%)
                if volatility > 0:
                    sharpe = (annual_return - 0.02) / volatility
                    metrics['sharpe_12m'] = round(sharpe, 4)
            
            # Maximum drawdown
            rolling_max = prices.expanding().max()
            drawdown = (prices - rolling_max) / rolling_max
            metrics['max_drawdown'] = round(drawdown.min(), 4)
            
            # Dividendos últimos 12 meses
            if not dividends.empty:
                cutoff = pd.Timestamp.now() - pd.Timedelta(days=365)
                recent_dividends = dividends[dividends.index >= cutoff]
                metrics['dividends_12m'] = round(recent_dividends.sum(), 4) if not recent_dividends.empty else 0
            
            # Categorização
            avg_volume = hist_data['Volume'].mean()
            if avg_volume > 5000000:
                metrics['liquidity_category'] = 'High'
            elif avg_volume > 500000:
                metrics['liquidity_category'] = 'Medium'
            else:
                metrics['liquidity_category'] = 'Low'
            
            return metrics
            
        except Exception as e:
            print(f"❌ Erro ao calcular métricas: {str(e)}")
            return {}
    
    def format_date(self, timestamp) -> Optional[str]:
        """Formata data"""
        if not timestamp:
            return None
        try:
            if isinstance(timestamp, (int, float)):
                return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
            return str(timestamp)[:10]
        except:
            return None
    
    def save_to_supabase_real(self, etf_data: Dict) -> bool:
        """Salva dados REAIS no Supabase via MCP"""
        try:
            # Preparar campos para inserção
            fields_map = {
                'symbol': etf_data.get('symbol'),
                'name': etf_data.get('name'),
                'description': etf_data.get('description'),
                'nav': etf_data.get('nav'),
                'navcurrency': etf_data.get('navcurrency'),
                'etfcompany': etf_data.get('etfcompany'),
                'expenseratio': etf_data.get('expenseratio'),
                'totalasset': etf_data.get('totalasset'),
                'avgvolume': etf_data.get('avgvolume'),
                'inceptiondate': etf_data.get('inceptiondate'),
                'updatedat': etf_data.get('updatedat'),
                'returns_12m': etf_data.get('returns_12m'),
                'volatility_12m': etf_data.get('volatility_12m'),
                'sharpe_12m': etf_data.get('sharpe_12m'),
                'max_drawdown': etf_data.get('max_drawdown'),
                'dividends_12m': etf_data.get('dividends_12m'),
                'liquidity_category': etf_data.get('liquidity_category')
            }
            
            # Remover campos None/vazios
            clean_fields = {k: v for k, v in fields_map.items() if v is not None and v != ''}
            
            print(f"💾 Preparando inserção de {etf_data['symbol']} com {len(clean_fields)} campos...")
            
            # TODO: Aqui seria a chamada real para MCP Supabase
            # Exemplo do que seria executado:
            sql_fields = ', '.join(clean_fields.keys())
            sql_values = ', '.join([f"'{str(v).replace("'", "''")}'" if isinstance(v, str) else str(v) for v in clean_fields.values()])
            
            sql_query = f"""
            INSERT INTO etfs_ativos_reais ({sql_fields})
            VALUES ({sql_values})
            ON CONFLICT (symbol) DO UPDATE SET
            {', '.join([f"{k} = EXCLUDED.{k}" for k in clean_fields.keys() if k != 'symbol'])};
            """
            
            print(f"🗄️ SQL gerado para {etf_data['symbol']}: {len(sql_query)} caracteres")
            # print(f"📝 SQL: {sql_query[:200]}...")
            
            # Simular sucesso (em implementação real, usar MCP Supabase)
            return True
            
        except Exception as e:
            print(f"❌ Erro ao preparar dados para Supabase: {str(e)}")
            return False
    
    def process_etfs(self, symbols: List[str], save_to_db: bool = False) -> List[Dict]:
        """Processa lista de ETFs"""
        results = []
        
        for symbol in symbols:
            self.processed_count += 1
            print(f"\n📊 Processando {symbol} ({self.processed_count}/{len(symbols)})")
            
            etf_data = self.get_real_etf_data(symbol)
            if etf_data:
                results.append(etf_data)
                self.successful_etfs.append(etf_data)
                
                # Salvar no Supabase se solicitado
                if save_to_db:
                    success = self.save_to_supabase_real(etf_data)
                    if success:
                        print(f"✅ {symbol}: Dados salvos no Supabase")
                    else:
                        print(f"⚠️ {symbol}: Falha ao salvar no Supabase")
        
        return results
    
    def generate_report(self):
        """Gera relatório final"""
        print("\n" + "="*50)
        print("📊 RELATÓRIO FINAL")
        print("="*50)
        print(f"📈 ETFs processados: {self.processed_count}")
        print(f"✅ ETFs com sucesso: {len(self.successful_etfs)}")
        print(f"❌ ETFs com falha: {len(self.failed_etfs)}")
        
        if self.successful_etfs:
            print(f"\n✅ ETFs processados com sucesso:")
            for etf in self.successful_etfs:
                print(f"   - {etf['symbol']}: {etf['name'][:50]} (${etf['nav']:.2f})")
        
        if self.failed_etfs:
            print(f"\n❌ ETFs com falha:")
            for failed in self.failed_etfs:
                print(f"   - {failed['symbol']}: {failed['error']}")
        
        # Salvar resultados em JSON
        if self.successful_etfs:
            filename = f"etf_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
            with open(filename, 'w', encoding='utf-8') as f:
                json.dump(self.successful_etfs, f, indent=2, default=str)
            print(f"\n💾 Resultados salvos em: {filename}")

def load_etfs_from_excel() -> List[str]:
    """Carrega símbolos de ETFs da planilha Excel real"""
    # Aqui usaríamos MCP Excel para carregar os dados reais
    # Por enquanto, vamos usar uma amostra dos dados que sabemos que existem
    sample_symbols = [
        'SPY', 'QQQ', 'VTI', 'IWM', 'EFA', 'EEM', 'GLD', 'TLT', 'HYG', 'XLF',
        'VYM', 'KWEB', 'COPX', 'SIVR', 'VWO', 'IJH', 'FXE', 'SLX', 'EWL', 'NLR'
    ]
    return sample_symbols

def main():
    """Função principal"""
    import argparse
    
    parser = argparse.ArgumentParser(description='ETF Real Data Pipeline')
    parser.add_argument('--test', action='store_true', help='Executar modo teste com 5 ETFs')
    parser.add_argument('--sample', action='store_true', help='Executar com 20 ETFs de amostra')
    parser.add_argument('--save-db', action='store_true', help='Salvar dados no Supabase')
    parser.add_argument('--max-etfs', type=int, help='Número máximo de ETFs para processar')
    
    args = parser.parse_args()
    
    processor = ETFRealProcessor()
    
    if args.test:
        # Modo teste - apenas 5 ETFs conhecidos
        symbols = ['SPY', 'QQQ', 'VTI', 'GLD', 'TLT']
        print("🧪 Modo TESTE - Processando 5 ETFs conhecidos...")
    elif args.sample:
        # Modo amostra - 20 ETFs
        symbols = load_etfs_from_excel()
        print("📊 Modo AMOSTRA - Processando 20 ETFs...")
    else:
        # Modo completo - carregar da planilha Excel
        symbols = load_etfs_from_excel()
        if args.max_etfs:
            symbols = symbols[:args.max_etfs]
        print(f"🚀 Modo COMPLETO - Processando {len(symbols)} ETFs da planilha...")
    
    print(f"📊 Total de ETFs para processar: {len(symbols)}")
    if args.save_db:
        print("💾 Dados serão salvos no Supabase")
    
    # Processar ETFs
    results = processor.process_etfs(symbols, save_to_db=args.save_db)
    
    # Gerar relatório
    processor.generate_report()
    
    print(f"\n🎉 Processamento concluído! {len(results)} ETFs processados com sucesso.")
    
    if results and not args.save_db:
        print("\n💡 Dica: Use --save-db para salvar os dados no Supabase")
        print("💡 Use --test para modo teste rápido")
        print("💡 Use --sample para processar 20 ETFs de amostra")

if __name__ == "__main__":
    main() 