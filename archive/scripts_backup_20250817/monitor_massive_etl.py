#!/usr/bin/env python3
"""
MONITOR DO PIPELINE ETL MASSIVO
Acompanha o progresso em tempo real do processamento de 2.460 ações
"""

import sqlite3
import time
import os
from datetime import datetime, timedelta
import json

class ETLMonitor:
    """Monitor em tempo real do pipeline ETL massivo"""
    
    def __init__(self, checkpoint_db="stocks_etl_checkpoint.db"):
        self.checkpoint_db = checkpoint_db
        self.start_time = datetime.now()
    
    def get_processing_stats(self):
        """Obter estatísticas de processamento"""
        if not os.path.exists(self.checkpoint_db):
            return None
        
        conn = sqlite3.connect(self.checkpoint_db)
        
        # Status geral
        cursor = conn.execute("""
            SELECT status, COUNT(*) as count 
            FROM processing_status 
            GROUP BY status
        """)
        status_counts = {row[0]: row[1] for row in cursor.fetchall()}
        
        # Progresso por lote
        cursor = conn.execute("""
            SELECT batch_id, batch_size, success_count, error_count, completed_at
            FROM batch_progress 
            ORDER BY batch_id DESC 
            LIMIT 10
        """)
        recent_batches = cursor.fetchall()
        
        # Últimas ações processadas
        cursor = conn.execute("""
            SELECT symbol, status, processed_at, error_message
            FROM processing_status 
            ORDER BY processed_at DESC 
            LIMIT 10
        """)
        recent_stocks = cursor.fetchall()
        
        # Erros mais comuns
        cursor = conn.execute("""
            SELECT error_message, COUNT(*) as count
            FROM processing_status 
            WHERE status = 'failed' AND error_message IS NOT NULL
            GROUP BY error_message
            ORDER BY count DESC
            LIMIT 5
        """)
        common_errors = cursor.fetchall()
        
        conn.close()
        
        return {
            'status_counts': status_counts,
            'recent_batches': recent_batches,
            'recent_stocks': recent_stocks,
            'common_errors': common_errors,
            'timestamp': datetime.now().isoformat()
        }
    
    def calculate_eta(self, processed, total, start_time):
        """Calcular tempo estimado de conclusão"""
        if processed == 0:
            return "Calculando..."
        
        elapsed = datetime.now() - start_time
        rate = processed / elapsed.total_seconds()  # ações por segundo
        remaining = total - processed
        
        if rate > 0:
            eta_seconds = remaining / rate
            eta = datetime.now() + timedelta(seconds=eta_seconds)
            return eta.strftime("%H:%M:%S")
        
        return "Incalculável"
    
    def display_progress(self, stats):
        """Exibir progresso formatado"""
        if not stats:
            print("❌ Banco de checkpoint não encontrado. Pipeline não iniciado?")
            return
        
        # Limpar tela (Windows/Unix compatible)
        os.system('cls' if os.name == 'nt' else 'clear')
        
        print("🚀 MONITOR DO PIPELINE ETL MASSIVO - AÇÕES AMERICANAS")
        print("=" * 80)
        print(f"📅 Monitoramento iniciado: {self.start_time.strftime('%H:%M:%S')}")
        print(f"🕐 Atualização atual: {datetime.now().strftime('%H:%M:%S')}")
        print()
        
        # Status geral
        status_counts = stats['status_counts']
        total = sum(status_counts.values())
        success = status_counts.get('success', 0)
        failed = status_counts.get('failed', 0)
        
        if total > 0:
            success_rate = (success / total) * 100
            print(f"📊 PROGRESSO GERAL:")
            print(f"   ✅ Sucessos: {success:,}")
            print(f"   ❌ Falhas: {failed:,}")
            print(f"   📈 Total processado: {total:,}")
            print(f"   🎯 Taxa de sucesso: {success_rate:.1f}%")
            
            # ETA
            eta = self.calculate_eta(total, 2460, self.start_time)
            print(f"   ⏰ ETA: {eta}")
            print()
        
        # Progresso por lotes
        if stats['recent_batches']:
            print("📦 ÚLTIMOS LOTES PROCESSADOS:")
            for batch in stats['recent_batches'][:5]:
                batch_id, batch_size, success_count, error_count, completed_at = batch
                completed_time = datetime.fromisoformat(completed_at).strftime('%H:%M:%S')
                print(f"   Lote {batch_id}: {success_count}/{batch_size} sucessos ({completed_time})")
            print()
        
        # Últimas ações
        if stats['recent_stocks']:
            print("🔄 ÚLTIMAS AÇÕES PROCESSADAS:")
            for stock in stats['recent_stocks'][:5]:
                symbol, status, processed_at, error_msg = stock
                time_str = datetime.fromisoformat(processed_at).strftime('%H:%M:%S')
                status_icon = "✅" if status == 'success' else "❌"
                error_preview = f" ({error_msg[:30]}...)" if error_msg else ""
                print(f"   {status_icon} {symbol} - {time_str}{error_preview}")
            print()
        
        # Erros comuns
        if stats['common_errors']:
            print("⚠️ ERROS MAIS COMUNS:")
            for error, count in stats['common_errors']:
                error_preview = error[:50] + "..." if len(error) > 50 else error
                print(f"   {count}x: {error_preview}")
            print()
        
        # Barra de progresso
        if total > 0:
            progress = min(total / 2460, 1.0)
            bar_length = 50
            filled_length = int(bar_length * progress)
            bar = "█" * filled_length + "░" * (bar_length - filled_length)
            print(f"📊 PROGRESSO: [{bar}] {progress*100:.1f}%")
        
        print("=" * 80)
        print("💡 Pressione Ctrl+C para parar o monitoramento")
    
    def monitor_continuous(self, refresh_interval=10):
        """Monitoramento contínuo"""
        try:
            while True:
                stats = self.get_processing_stats()
                self.display_progress(stats)
                
                # Verificar se concluído
                if stats and stats['status_counts']:
                    total = sum(stats['status_counts'].values())
                    if total >= 2460:
                        print("\n🎉 PIPELINE CONCLUÍDO!")
                        break
                
                time.sleep(refresh_interval)
                
        except KeyboardInterrupt:
            print("\n👋 Monitoramento interrompido pelo usuário")
        except Exception as e:
            print(f"\n❌ Erro no monitoramento: {e}")

def main():
    print("🚀 Iniciando Monitor do Pipeline ETL Massivo...")
    monitor = ETLMonitor()
    monitor.monitor_continuous(refresh_interval=15)  # Atualizar a cada 15 segundos

if __name__ == "__main__":
    main()




