#!/usr/bin/env python3
"""
Script para atualizar dividendos usando MCP Supabase
Versão mais simples e eficiente usando MCP ao invés de conexão direta
"""

import json
import time
import subprocess
import sys
from datetime import datetime

# Configurações
PROJECT_ID = "nniabnjuwzeqmflrruga"
BATCH_SIZE = 100

def load_dividends_data():
    """Carrega os dados de dividendos do arquivo JSON"""
    print("📊 Carregando dados de dividendos...")
    
    try:
        with open('dividends_production_complete_20250627_011735.json', 'r') as f:
            data = json.load(f)
        
        # Filtrar apenas ETFs com dividendos > 0
        etfs_with_dividends = [etf for etf in data if etf.get('dividends_12m', 0) > 0]
        
        print(f"✅ {len(etfs_with_dividends)} ETFs com dividendos carregados")
        return etfs_with_dividends
        
    except FileNotFoundError:
        print("❌ Arquivo de dados não encontrado!")
        return []
    except json.JSONDecodeError:
        print("❌ Erro ao decodificar arquivo JSON!")
        return []

def create_batch_update_query(etfs_batch):
    """Cria query UPDATE para um batch de ETFs"""
    
    # Construir CASE statement
    case_statements = []
    symbols = []
    
    for etf in etfs_batch:
        symbol = etf['symbol'].replace("'", "''")  # Escapar aspas
        dividend = etf['dividends_12m']
        case_statements.append(f"    WHEN '{symbol}' THEN {dividend}")
        symbols.append(f"'{symbol}'")
    
    # Montar query completa
    query = f"""
UPDATE etfs_ativos_reais 
SET dividends_12m = CASE symbol
{chr(10).join(case_statements)}
END,
updatedat = NOW()
WHERE symbol IN ({', '.join(symbols)});
"""
    
    return query

def execute_mcp_query(query):
    """Executa query via MCP Supabase"""
    try:
        # Preparar comando MCP
        mcp_command = [
            "npx", "@modelcontextprotocol/server-supabase",
            "execute_sql",
            "--project-id", PROJECT_ID,
            "--query", query
        ]
        
        # Executar comando
        result = subprocess.run(
            mcp_command,
            capture_output=True,
            text=True,
            timeout=30
        )
        
        if result.returncode == 0:
            return True, result.stdout
        else:
            return False, result.stderr
            
    except subprocess.TimeoutExpired:
        return False, "Timeout na execução da query"
    except Exception as e:
        return False, str(e)

def get_current_stats():
    """Obtém estatísticas atuais do banco"""
    query = """
    SELECT 
        COUNT(*) as total_etfs,
        COUNT(CASE WHEN dividends_12m > 0 THEN 1 END) as etfs_com_dividendos,
        ROUND(COUNT(CASE WHEN dividends_12m > 0 THEN 1 END) * 100.0 / COUNT(*), 2) as percentual
    FROM etfs_ativos_reais;
    """
    
    success, result = execute_mcp_query(query)
    if success:
        try:
            # Parse do resultado (formato pode variar)
            lines = result.strip().split('\n')
            for line in lines:
                if '|' in line and 'total_etfs' not in line:
                    parts = [p.strip() for p in line.split('|')]
                    if len(parts) >= 3:
                        return int(parts[0]), int(parts[1]), float(parts[2])
        except:
            pass
    
    return None, None, None

def execute_dividends_update_mcp(etfs_data):
    """Executa a atualização de dividendos usando MCP"""
    
    total_batches = (len(etfs_data) + BATCH_SIZE - 1) // BATCH_SIZE
    
    print(f"🚀 Iniciando atualização de {len(etfs_data)} ETFs em {total_batches} batches via MCP")
    print(f"⏰ Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    start_time = time.time()
    success_count = 0
    error_count = 0
    
    # Estatísticas iniciais
    print("\n📊 Estatísticas iniciais...")
    total_inicial, dividendos_inicial, percentual_inicial = get_current_stats()
    if total_inicial:
        print(f"    Total ETFs: {total_inicial}")
        print(f"    ETFs com dividendos: {dividendos_inicial} ({percentual_inicial}%)")
    
    for batch_num in range(total_batches):
        batch_start_time = time.time()
        
        start_idx = batch_num * BATCH_SIZE
        end_idx = min(start_idx + BATCH_SIZE, len(etfs_data))
        batch_etfs = etfs_data[start_idx:end_idx]
        
        print(f"\n[{batch_num + 1}/{total_batches}] Processando batch com {len(batch_etfs)} ETFs...")
        
        # Criar query
        query = create_batch_update_query(batch_etfs)
        
        # Executar via MCP
        success, result = execute_mcp_query(query)
        
        if success:
            success_count += len(batch_etfs)
            
            # Mostrar alguns ETFs do batch
            sample_etfs = batch_etfs[:3]
            sample_info = ", ".join([f"{etf['symbol']}: ${etf['dividends_12m']:.4f}" for etf in sample_etfs])
            if len(batch_etfs) > 3:
                sample_info += f" ... e mais {len(batch_etfs) - 3} ETFs"
            
            print(f"    ✅ {len(batch_etfs)} ETFs atualizados: {sample_info}")
            
            batch_time = time.time() - batch_start_time
            print(f"    ⏱️ Batch concluído em {batch_time:.1f}s")
            
        else:
            error_count += len(batch_etfs)
            print(f"    ❌ Erro no batch {batch_num + 1}: {result}")
        
        # Checkpoint a cada 10 batches
        if (batch_num + 1) % 10 == 0:
            elapsed_time = (time.time() - start_time) / 60
            progress = ((batch_num + 1) / total_batches) * 100
            etfs_per_second = success_count / (time.time() - start_time)
            
            print(f"\n📊 CHECKPOINT: {progress:.1f}% concluído")
            print(f"           {success_count} ETFs processados")
            print(f"           {elapsed_time:.1f} minutos decorridos")
            print(f"           {etfs_per_second:.1f} ETFs/segundo")
            
            # Estatísticas atuais
            total_atual, dividendos_atual, percentual_atual = get_current_stats()
            if total_atual:
                print(f"           ETFs com dividendos no banco: {dividendos_atual} ({percentual_atual}%)")
        
        # Pausa pequena entre batches
        time.sleep(0.2)
    
    # Verificação final
    print("\n🔍 Verificando resultados finais...")
    total_final, dividendos_final, percentual_final = get_current_stats()
    
    total_time = time.time() - start_time
    etfs_per_second = success_count / total_time if total_time > 0 else 0
    
    print("=" * 60)
    print("🎉 ATUALIZAÇÃO VIA MCP CONCLUÍDA!")
    print(f"📊 ETFs processados: {success_count}")
    if total_final:
        print(f"📊 Total de ETFs no banco: {total_final}")
        print(f"📊 ETFs com dividendos: {dividendos_final} ({percentual_final}%)")
        if dividendos_inicial:
            incremento = dividendos_final - dividendos_inicial
            print(f"📈 Incremento: +{incremento} ETFs com dividendos")
    print(f"⏱️ Tempo total: {total_time/60:.1f} minutos")
    print(f"🚀 Velocidade média: {etfs_per_second:.1f} ETFs/segundo")
    print(f"✅ Batches processados: {total_batches}")
    if error_count > 0:
        print(f"❌ Erros: {error_count}")
    print("=" * 60)
    
    # Salvar relatório
    report = {
        'timestamp': datetime.now().isoformat(),
        'metodo': 'MCP_Supabase',
        'etfs_processados': success_count,
        'total_etfs_banco': total_final,
        'etfs_com_dividendos_inicial': dividendos_inicial,
        'etfs_com_dividendos_final': dividendos_final,
        'incremento_dividendos': dividendos_final - dividendos_inicial if dividendos_inicial else None,
        'percentual_com_dividendos': float(percentual_final) if percentual_final else None,
        'tempo_total_minutos': total_time / 60,
        'velocidade_etfs_segundo': etfs_per_second,
        'batches_processados': total_batches,
        'erros': error_count
    }
    
    report_file = f"dividends_mcp_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
    with open(report_file, 'w') as f:
        json.dump(report, f, indent=2)
    
    print(f"📄 Relatório salvo: {report_file}")

def main():
    """Função principal"""
    print("🚀 ETF Curator - Atualização de Dividendos via MCP Supabase")
    print("=" * 65)
    
    # Verificar se o arquivo de dados existe
    try:
        with open('dividends_production_complete_20250627_011735.json', 'r') as f:
            pass
    except FileNotFoundError:
        print("❌ Arquivo de dados não encontrado: dividends_production_complete_20250627_011735.json")
        return
    
    # Carregar dados
    etfs_data = load_dividends_data()
    
    if not etfs_data:
        print("❌ Nenhum ETF com dividendos encontrado")
        return
    
    # Confirmar execução
    print(f"\n⚠️ ATENÇÃO: Você está prestes a atualizar {len(etfs_data)} ETFs no banco de produção!")
    print("Esta operação usa MCP Supabase para máxima eficiência e confiabilidade.")
    print("Apenas as colunas 'dividends_12m' e 'updatedat' serão modificadas.")
    
    confirm = input("\nDeseja continuar? (s/N): ").lower().strip()
    if confirm != 's':
        print("❌ Operação cancelada pelo usuário")
        return
    
    # Executar atualização
    execute_dividends_update_mcp(etfs_data)

if __name__ == "__main__":
    main() 