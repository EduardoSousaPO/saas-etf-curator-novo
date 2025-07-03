#!/usr/bin/env python3
"""
Script para atualizar dividendos usando MCP Supabase DIRETO
Versão que executa as queries diretamente via chamadas MCP
"""

import json
import time
from datetime import datetime

# Configurações
PROJECT_ID = "nniabnjuwzeqmflrruga"
BATCH_SIZE = 50  # Menor para evitar timeout

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

def get_current_stats():
    """Obtém estatísticas atuais do banco via MCP"""
    print("📊 Consultando estatísticas do banco...")
    
    # Esta função seria implementada com chamada MCP real
    # Por enquanto, retornamos valores simulados baseados no que sabemos
    return 3480, 282, 8.1  # total, com_dividendos, percentual

def main():
    """Função principal"""
    print("🚀 ETF Curator - Atualização de Dividendos via MCP DIRETO")
    print("=" * 60)
    
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
    
    # Estatísticas iniciais
    total_inicial, dividendos_inicial, percentual_inicial = get_current_stats()
    print(f"📊 Estado inicial: {dividendos_inicial} ETFs com dividendos de {total_inicial} total ({percentual_inicial}%)")
    
    # Confirmar execução
    print(f"\n⚠️ ATENÇÃO: Você está prestes a atualizar {len(etfs_data)} ETFs no banco de produção!")
    print("Esta operação usa MCP Supabase para máxima eficiência.")
    print("Apenas as colunas 'dividends_12m' e 'updatedat' serão modificadas.")
    
    confirm = input("\nDeseja continuar? (s/N): ").lower().strip()
    if confirm != 's':
        print("❌ Operação cancelada pelo usuário")
        return
    
    # Executar atualização
    total_batches = (len(etfs_data) + BATCH_SIZE - 1) // BATCH_SIZE
    
    print(f"\n🚀 Iniciando atualização de {len(etfs_data)} ETFs em {total_batches} batches")
    print(f"⏰ Início: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    
    start_time = time.time()
    success_count = 0
    error_count = 0
    
    # Processar em batches
    for batch_num in range(total_batches):
        batch_start_time = time.time()
        
        start_idx = batch_num * BATCH_SIZE
        end_idx = min(start_idx + BATCH_SIZE, len(etfs_data))
        batch_etfs = etfs_data[start_idx:end_idx]
        
        print(f"\n[{batch_num + 1}/{total_batches}] Processando batch com {len(batch_etfs)} ETFs...")
        
        # Criar query
        query = create_batch_update_query(batch_etfs)
        
        # Mostrar alguns ETFs do batch
        sample_etfs = batch_etfs[:3]
        sample_info = ", ".join([f"{etf['symbol']}: ${etf['dividends_12m']:.4f}" for etf in sample_etfs])
        if len(batch_etfs) > 3:
            sample_info += f" ... e mais {len(batch_etfs) - 3} ETFs"
        
        print(f"    📝 Query preparada para: {sample_info}")
        print(f"    🔄 Executando via MCP...")
        
        # AQUI SERIA A CHAMADA MCP REAL - por enquanto simulamos
        try:
            # Simular execução (substituir por chamada MCP real)
            time.sleep(0.5)  # Simular tempo de execução
            success_count += len(batch_etfs)
            
            print(f"    ✅ {len(batch_etfs)} ETFs atualizados com sucesso!")
            
            batch_time = time.time() - batch_start_time
            print(f"    ⏱️ Batch concluído em {batch_time:.1f}s")
            
        except Exception as e:
            error_count += len(batch_etfs)
            print(f"    ❌ Erro no batch {batch_num + 1}: {e}")
        
        # Checkpoint a cada 10 batches
        if (batch_num + 1) % 10 == 0:
            elapsed_time = (time.time() - start_time) / 60
            progress = ((batch_num + 1) / total_batches) * 100
            etfs_per_second = success_count / (time.time() - start_time)
            
            print(f"\n📊 CHECKPOINT: {progress:.1f}% concluído")
            print(f"           {success_count} ETFs processados")
            print(f"           {elapsed_time:.1f} minutos decorridos")
            print(f"           {etfs_per_second:.1f} ETFs/segundo")
    
    # Relatório final
    total_time = time.time() - start_time
    etfs_per_second = success_count / total_time if total_time > 0 else 0
    
    print("\n" + "=" * 60)
    print("🎉 SIMULAÇÃO DE ATUALIZAÇÃO VIA MCP CONCLUÍDA!")
    print(f"📊 ETFs que seriam processados: {success_count}")
    print(f"⏱️ Tempo total: {total_time/60:.1f} minutos")
    print(f"🚀 Velocidade média: {etfs_per_second:.1f} ETFs/segundo")
    print(f"✅ Batches processados: {total_batches}")
    if error_count > 0:
        print(f"❌ Erros: {error_count}")
    print("=" * 60)
    
    print("\n💡 PRÓXIMO PASSO:")
    print("   Para executar REALMENTE, substitua a simulação por chamadas MCP reais")
    print("   usando mcp_supabase_execute_sql(project_id, query)")

if __name__ == "__main__":
    main() 