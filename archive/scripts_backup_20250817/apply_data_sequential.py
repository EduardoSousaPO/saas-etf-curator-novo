#!/usr/bin/env python3
"""
Script para aplicar dados em ordem sequencial
"""
import os
import time
from datetime import datetime

def log_progress(message):
    """Log com timestamp"""
    timestamp = datetime.now().strftime("%H:%M:%S")
    print(f"[{timestamp}] {message}")

def classify_chunks():
    """Classifica chunks por tipo de operação"""
    assets_chunks = []
    metrics_chunks = []
    prices_chunks = []
    
    for i in range(1, 92):
        chunk_file = f"chunk_{i:03d}.sql"
        if os.path.exists(chunk_file):
            # Ler primeira linha para determinar tipo
            with open(chunk_file, 'r', encoding='utf-8') as f:
                first_line = f.readline().strip()
            
            if 'INSERT INTO assets_master' in first_line:
                assets_chunks.append(chunk_file)
            elif 'INSERT INTO stock_metrics_snapshot' in first_line:
                metrics_chunks.append(chunk_file)
            elif 'INSERT INTO stock_prices_daily' in first_line:
                prices_chunks.append(chunk_file)
    
    return assets_chunks, metrics_chunks, prices_chunks

def main():
    log_progress("🔍 Classificando chunks por tipo...")
    
    assets_chunks, metrics_chunks, prices_chunks = classify_chunks()
    
    log_progress(f"📊 Classificação completa:")
    log_progress(f"  📋 Assets Master: {len(assets_chunks)} chunks")
    log_progress(f"  📈 Metrics Snapshot: {len(metrics_chunks)} chunks")
    log_progress(f"  💰 Prices Daily: {len(prices_chunks)} chunks")
    
    log_progress("\n🎯 ORDEM DE EXECUÇÃO RECOMENDADA:")
    log_progress("1️⃣ PRIMEIRO: Executar chunks de assets_master")
    for chunk in assets_chunks[:5]:  # Mostrar apenas primeiros 5
        log_progress(f"   - {chunk}")
    if len(assets_chunks) > 5:
        log_progress(f"   ... e mais {len(assets_chunks)-5} chunks")
    
    log_progress("\n2️⃣ SEGUNDO: Executar chunks de stock_metrics_snapshot")
    for chunk in metrics_chunks[:5]:  # Mostrar apenas primeiros 5
        log_progress(f"   - {chunk}")
    if len(metrics_chunks) > 5:
        log_progress(f"   ... e mais {len(metrics_chunks)-5} chunks")
    
    log_progress("\n3️⃣ TERCEIRO: Executar chunks de stock_prices_daily")
    for chunk in prices_chunks[:5]:  # Mostrar apenas primeiros 5
        log_progress(f"   - {chunk}")
    if len(prices_chunks) > 5:
        log_progress(f"   ... e mais {len(prices_chunks)-5} chunks")
    
    log_progress("\n4️⃣ QUARTO: REFRESH MATERIALIZED VIEW stocks_ativos_reais")
    
    # Criar scripts de execução por categoria
    log_progress("\n📝 Criando scripts de execução...")
    
    with open('execute_assets.txt', 'w') as f:
        f.write("# EXECUTAR PRIMEIRO - Assets Master\n")
        for chunk in assets_chunks:
            f.write(f"mcp_supabase_execute_sql --project_id nniabnjuwzeqmflrruga --query \"$(cat {chunk})\"\n")
    
    with open('execute_metrics.txt', 'w') as f:
        f.write("# EXECUTAR SEGUNDO - Stock Metrics\n")
        for chunk in metrics_chunks:
            f.write(f"mcp_supabase_execute_sql --project_id nniabnjuwzeqmflrruga --query \"$(cat {chunk})\"\n")
    
    with open('execute_prices.txt', 'w') as f:
        f.write("# EXECUTAR TERCEIRO - Stock Prices\n")
        for chunk in prices_chunks:
            f.write(f"mcp_supabase_execute_sql --project_id nniabnjuwzeqmflrruga --query \"$(cat {chunk})\"\n")
    
    log_progress("✅ Scripts de execução criados:")
    log_progress("   📄 execute_assets.txt - Para assets_master")
    log_progress("   📄 execute_metrics.txt - Para stock_metrics_snapshot")
    log_progress("   📄 execute_prices.txt - Para stock_prices_daily")

if __name__ == "__main__":
    main()




