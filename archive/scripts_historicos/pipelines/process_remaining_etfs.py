#!/usr/bin/env python3
"""
Processa ETFs restantes com dados reais
======================================

Script para processar os ETFs que ainda não estão no banco de dados
usando dados reais do yfinance e armazenando via MCP Supabase.

Autor: ETF Curator Project
Data: 2025-01-27
"""

import yfinance as yf
import pandas as pd
import numpy as np
import logging
import time
import sys
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import warnings

# Suprimir warnings
warnings.filterwarnings('ignore')

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)

logger = logging.getLogger(__name__)

class ETFProcessor:
    """Processador de ETFs com dados reais"""
    
    def __init__(self):
        self.supabase_project_id = "nniabnjuwzeqmflrruga"
        self.processed_count = 0
        self.successful_count = 0
        self.failed_count = 0
        
        logger.info("🚀 Iniciando processamento de ETFs restantes")
    
    def get_sample_etfs(self) -> List[str]:
        """Retorna lista de ETFs para teste"""
        return [
            'AAAU',  # Perth Mint Physical Gold ETF
            'AAXJ',  # iShares MSCI All Country Asia ex Japan ETF
            'ACWI',  # iShares MSCI ACWI ETF
            'ADRA',  # BLDRS Asia 50 ADR Index Fund
            'AIEQ',  # AI Powered Equity ETF
            'ANGL',  # VanEck Fallen Angel High Yield Bond ETF
            'ASHR',  # Xtrackers Harvest CSI 300 China A-Shares ETF
            'BKLN',  # Invesco Senior Loan ETF
            'BOTZ',  # Global X Robotics & Artificial Intelligence ETF
            'CLOU'   # Global X Cloud Computing ETF
        ]
    
    def get_real_etf_data(self, symbol: str) -> Optional[Dict]:
        """Coleta dados reais de um ETF usando yfinance"""
        logger.info(f"🔍 Processando {symbol}...")
        
        try:
            # Criar ticker yfinance
            ticker = yf.Ticker(symbol)
            
            # Buscar informações básicas
            info = ticker.info
            
            if not info or len(info) < 5:
                logger.warning(f"⚠️ {symbol}: Sem dados disponíveis")
                return None
            
            # Verificar se é ETF
            quote_type = info.get('quoteType', '').upper()
            if quote_type not in ['ETF', 'MUTUALFUND', 'FUND']:
                logger.warning(f"⚠️ {symbol}: Não é um ETF (tipo: {quote_type})")
                return None
            
            # Preço atual
            current_price = (info.get('regularMarketPrice') or 
                           info.get('navPrice') or 
                           info.get('previousClose'))
            
            if not current_price or current_price <= 0:
                logger.warning(f"⚠️ {symbol}: Sem preço válido")
                return None
            
            # Buscar dados históricos (2 anos)
            end_date = datetime.now()
            start_date = end_date - timedelta(days=2*365)
            
            try:
                hist_data = ticker.history(start=start_date, end=end_date)
            except Exception as e:
                logger.warning(f"⚠️ {symbol}: Erro no histórico: {str(e)}")
                hist_data = pd.DataFrame()
            
            # Buscar dividendos
            try:
                dividends = ticker.dividends
            except Exception:
                dividends = pd.Series(dtype=float)
            
            # Preparar dados do ETF
            etf_data = {
                'symbol': symbol,
                'name': self.clean_text(info.get('longName') or info.get('shortName', '')),
                'description': self.clean_text(info.get('longBusinessSummary', '')),
                'isin': info.get('isin', ''),
                'assetclass': self.determine_asset_class(info),
                'domicile': info.get('domicile', ''),
                'website': info.get('website', ''),
                'etfcompany': self.clean_text(info.get('fundFamily', '')),
                'expenseratio': self.safe_float(info.get('annualReportExpenseRatio')),
                'totalasset': self.safe_int(info.get('totalAssets')),
                'avgvolume': self.safe_int(info.get('averageVolume')),
                'inceptiondate': self.format_date(info.get('fundInceptionDate')),
                'nav': self.safe_float(current_price),
                'navcurrency': info.get('currency', 'USD'),
                'holdingscount': self.safe_int(info.get('holdingsCount')),
                'updatedat': datetime.now().isoformat(),
            }
            
            # Calcular métricas se temos dados históricos
            if not hist_data.empty and len(hist_data) > 50:
                metrics = self.calculate_metrics(hist_data, dividends)
                etf_data.update(metrics)
            
            # Categorizar ETF
            categories = self.categorize_etf(etf_data)
            etf_data.update(categories)
            
            logger.info(f"✅ {symbol}: NAV ${etf_data['nav']}, Assets ${etf_data.get('totalasset', 0):,}")
            return etf_data
            
        except Exception as e:
            logger.error(f"❌ {symbol}: Erro: {str(e)}")
            return None
    
    def clean_text(self, text: str) -> str:
        """Limpa texto"""
        if not text:
            return ""
        return str(text).strip().replace('\n', ' ')[:500]
    
    def safe_float(self, value) -> Optional[float]:
        """Converte para float seguro"""
        try:
            if value is None or pd.isna(value):
                return None
            return float(value)
        except:
            return None
    
    def safe_int(self, value) -> Optional[int]:
        """Converte para int seguro"""
        try:
            if value is None or pd.isna(value):
                return None
            return int(float(value))
        except:
            return None
    
    def format_date(self, timestamp) -> Optional[str]:
        """Formata data"""
        try:
            if timestamp is None:
                return None
            if isinstance(timestamp, (int, float)):
                return datetime.fromtimestamp(timestamp).strftime('%Y-%m-%d')
            return str(timestamp)[:10]
        except:
            return None
    
    def determine_asset_class(self, info: Dict) -> str:
        """Determina classe de ativo"""
        category = info.get('category', '').lower()
        if 'bond' in category or 'fixed' in category:
            return 'Fixed Income'
        elif 'equity' in category or 'stock' in category:
            return 'Equity'
        elif 'commodity' in category:
            return 'Commodity'
        elif 'real estate' in category or 'reit' in category:
            return 'Real Estate'
        else:
            return 'Mixed'
    
    def calculate_metrics(self, hist_data: pd.DataFrame, dividends: pd.Series) -> Dict:
        """Calcula métricas financeiras básicas"""
        metrics = {}
        
        try:
            # Retornos
            returns = hist_data['Close'].pct_change().dropna()
            
            # Retorno 12 meses
            if len(hist_data) >= 252:
                ret_12m = (hist_data['Close'].iloc[-1] / hist_data['Close'].iloc[-252]) - 1
                metrics['returns_12m'] = round(ret_12m * 100, 2)
            
            # Volatilidade 12 meses
            if len(returns) > 50:
                volatility = returns.std() * np.sqrt(252)
                metrics['volatility_12m'] = round(volatility * 100, 2)
                
                # Sharpe ratio
                excess_returns = returns - (0.02 / 252)
                if excess_returns.std() > 0:
                    sharpe = excess_returns.mean() / excess_returns.std() * np.sqrt(252)
                    metrics['sharpe_12m'] = round(sharpe, 2)
            
            # Max drawdown
            cumulative = (1 + returns).cumprod()
            running_max = cumulative.expanding().max()
            drawdown = (cumulative - running_max) / running_max
            metrics['max_drawdown'] = round(drawdown.min() * 100, 2)
            
            # Dividendos 12 meses
            if not dividends.empty:
                now = datetime.now()
                div_12m = dividends[dividends.index >= (now - timedelta(days=365))]
                if not div_12m.empty:
                    metrics['dividends_12m'] = round(div_12m.sum(), 4)
            
        except Exception as e:
            logger.warning(f"Erro ao calcular métricas: {str(e)}")
        
        return metrics
    
    def categorize_etf(self, etf_data: Dict) -> Dict:
        """Categoriza ETF"""
        categories = {}
        
        # Tamanho por patrimônio
        total_assets = etf_data.get('totalasset', 0) or 0
        if total_assets > 10_000_000_000:
            categories['size_category'] = 'Large'
        elif total_assets > 1_000_000_000:
            categories['size_category'] = 'Medium'
        elif total_assets > 100_000_000:
            categories['size_category'] = 'Small'
        else:
            categories['size_category'] = 'Micro'
        
        # Liquidez por volume
        avg_volume = etf_data.get('avgvolume', 0) or 0
        if avg_volume > 1_000_000:
            categories['liquidity_category'] = 'High'
        elif avg_volume > 100_000:
            categories['liquidity_category'] = 'Medium'
        else:
            categories['liquidity_category'] = 'Low'
        
        # Tipo por nome
        name = etf_data.get('name', '').lower()
        if any(word in name for word in ['bond', 'treasury']):
            categories['etf_type'] = 'Fixed Income'
        elif any(word in name for word in ['equity', 'stock']):
            categories['etf_type'] = 'Equity'
        elif any(word in name for word in ['commodity', 'gold']):
            categories['etf_type'] = 'Commodity'
        else:
            categories['etf_type'] = 'Other'
        
        return categories
    
    def prepare_for_supabase(self, etf_data: Dict) -> Dict:
        """Prepara dados para inserção no Supabase"""
        # Mapeamento dos campos para o schema do Supabase
        supabase_data = {
            'symbol': etf_data['symbol'],
            'name': etf_data['name'],
            'description': etf_data['description'],
            'isin': etf_data['isin'],
            'assetclass': etf_data['assetclass'],
            'domicile': etf_data['domicile'],
            'website': etf_data['website'],
            'etfcompany': etf_data['etfcompany'],
            'expenseratio': etf_data['expenseratio'],
            'totalasset': etf_data['totalasset'],
            'avgvolume': etf_data['avgvolume'],
            'inceptiondate': etf_data['inceptiondate'],
            'nav': etf_data['nav'],
            'navcurrency': etf_data['navcurrency'],
            'holdingscount': etf_data['holdingscount'],
            'returns_12m': etf_data.get('returns_12m'),
            'volatility_12m': etf_data.get('volatility_12m'),
            'sharpe_12m': etf_data.get('sharpe_12m'),
            'max_drawdown': etf_data.get('max_drawdown'),
            'dividends_12m': etf_data.get('dividends_12m'),
            'size_category': etf_data.get('size_category'),
            'liquidity_category': etf_data.get('liquidity_category'),
            'etf_type': etf_data.get('etf_type')
        }
        
        return supabase_data
    
    def process_etfs(self, symbols: List[str]) -> List[Dict]:
        """Processa lista de ETFs"""
        results = []
        
        logger.info(f"📊 Processando {len(symbols)} ETFs...")
        
        for i, symbol in enumerate(symbols, 1):
            logger.info(f"[{i}/{len(symbols)}] Processando {symbol}")
            
            # Coletar dados reais
            etf_data = self.get_real_etf_data(symbol)
            
            if etf_data:
                # Preparar para Supabase
                supabase_data = self.prepare_for_supabase(etf_data)
                results.append(supabase_data)
                self.successful_count += 1
                
                logger.info(f"✅ {symbol}: Dados preparados para Supabase")
            else:
                self.failed_count += 1
                logger.warning(f"❌ {symbol}: Falha no processamento")
            
            self.processed_count += 1
            
            # Delay entre requests
            time.sleep(0.5)
        
        return results
    
    def save_results(self, results: List[Dict]):
        """Salva resultados em arquivo JSON"""
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"etf_results_{timestamp}.json"
        
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_processed': self.processed_count,
            'successful': self.successful_count,
            'failed': self.failed_count,
            'etfs': results
        }
        
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(report, f, indent=2, ensure_ascii=False)
        
        logger.info(f"📄 Resultados salvos em: {filename}")
        return filename
    
    def generate_report(self, results: List[Dict]):
        """Gera relatório final"""
        logger.info("=" * 50)
        logger.info("📊 RELATÓRIO FINAL")
        logger.info("=" * 50)
        logger.info(f"📈 ETFs processados: {self.processed_count}")
        logger.info(f"✅ Sucessos: {self.successful_count}")
        logger.info(f"❌ Falhas: {self.failed_count}")
        
        if results:
            # Estatísticas
            total_assets = sum(r.get('totalasset', 0) or 0 for r in results)
            avg_nav = np.mean([r.get('nav', 0) or 0 for r in results if r.get('nav')])
            
            logger.info(f"💰 Patrimônio total: ${total_assets:,.0f}")
            logger.info(f"📊 NAV médio: ${avg_nav:.2f}")
            
            # Top ETFs
            top_etfs = sorted(results, key=lambda x: x.get('totalasset', 0) or 0, reverse=True)[:3]
            logger.info("\n🏆 TOP 3 ETFs por Patrimônio:")
            for i, etf in enumerate(top_etfs, 1):
                assets = etf.get('totalasset', 0) or 0
                logger.info(f"  {i}. {etf['symbol']}: ${assets:,.0f}")
        
        logger.info("=" * 50)

def main():
    """Função principal"""
    try:
        processor = ETFProcessor()
        
        # Processar ETFs de exemplo
        symbols = processor.get_sample_etfs()
        results = processor.process_etfs(symbols)
        
        # Salvar resultados
        filename = processor.save_results(results)
        
        # Gerar relatório
        processor.generate_report(results)
        
        # Mostrar dados prontos para MCP Supabase
        if results:
            logger.info("\n🔄 Dados prontos para inserção via MCP Supabase:")
            for etf in results[:3]:  # Mostrar apenas os 3 primeiros
                logger.info(f"  • {etf['symbol']}: {etf['name']}")
        
        logger.info(f"\n📁 Arquivo de resultados: {filename}")
        logger.info("✅ Processamento concluído!")
        
    except Exception as e:
        logger.error(f"❌ Erro fatal: {str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    main() 