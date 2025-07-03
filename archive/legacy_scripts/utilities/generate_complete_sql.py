#!/usr/bin/env python3
"""
Script para gerar arquivo SQL completo com TODOS os dividendos
Cria um arquivo .sql que pode ser executado diretamente no Supabase
"""

import json
from datetime import datetime

def load_dividends_data():
    """Carrega os dados de dividendos do arquivo JSON"""
    with open('dividends_production_complete_20250627_011735.json', 'r') as f:
        data = json.load(f)
    
    # Filtrar apenas ETFs com dividendos > 0
    etfs_with_dividends = [
        etf for etf in data['results'] 
        if etf['dividends_12m'] > 0
    ]
    
    return etfs_with_dividends

def create_complete_sql():
    """Cria arquivo SQL completo com todos os dividendos"""
    
    etfs_data = load_dividends_data()
    print(f"📊 Carregados {len(etfs_data)} ETFs com dividendos")
    
    # Arquivo de saída
    timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
    output_file = f'dividends_COMPLETE_UPDATE_{timestamp}.sql'
    
    with open(output_file, 'w', encoding='utf-8') as f:
        # Cabeçalho
        f.write(f"""-- =====================================================
-- SCRIPT SQL COMPLETO PARA ATUALIZAÇÃO DE DIVIDENDOS
-- ETF Curator - Atualização de {len(etfs_data)} ETFs com dividendos reais
-- Gerado em: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
-- =====================================================

-- Este script pode ser executado diretamente no Supabase Dashboard
-- Tempo estimado de execução: 2-5 minutos

BEGIN;

-- Desabilitar triggers temporariamente para melhor performance
ALTER TABLE etfs_ativos_reais DISABLE TRIGGER ALL;

""")
        
        # Dividir em batches de 100 ETFs
        batch_size = 100
        total_batches = (len(etfs_data) + batch_size - 1) // batch_size
        
        for batch_num in range(total_batches):
            start_idx = batch_num * batch_size
            end_idx = min(start_idx + batch_size, len(etfs_data))
            batch_etfs = etfs_data[start_idx:end_idx]
            
            f.write(f"-- Batch {batch_num + 1}/{total_batches}: {len(batch_etfs)} ETFs\n")
            f.write("UPDATE etfs_ativos_reais \n")
            f.write("SET dividends_12m = CASE symbol\n")
            
            # Adicionar cada ETF do batch
            for etf in batch_etfs:
                symbol = etf['symbol'].replace("'", "''")  # Escapar aspas simples
                dividend = etf['dividends_12m']
                f.write(f"    WHEN '{symbol}' THEN {dividend}\n")
            
            f.write("END,\n")
            f.write("updatedat = NOW()\n")
            f.write("WHERE symbol IN (")
            
            # Lista de símbolos
            symbols = []
            for etf in batch_etfs:
                clean_symbol = etf['symbol'].replace("'", "''")
                symbols.append(f"'{clean_symbol}'")
            f.write(", ".join(symbols))
            f.write(");\n\n")
            
            # Verificação a cada 10 batches
            if (batch_num + 1) % 10 == 0:
                f.write(f"""-- Verificação do progresso (Batch {batch_num + 1})
DO $$
DECLARE
    current_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO current_count FROM etfs_ativos_reais WHERE dividends_12m > 0;
    RAISE NOTICE 'Progresso: % ETFs com dividendos atualizados até agora', current_count;
END $$;

""")
        
        # Rodapé
        f.write("""-- Reabilitar triggers
ALTER TABLE etfs_ativos_reais ENABLE TRIGGER ALL;

-- Verificação final
DO $$
DECLARE
    total_with_dividends INTEGER;
    total_etfs INTEGER;
    percentage NUMERIC;
BEGIN
    SELECT COUNT(*) INTO total_etfs FROM etfs_ativos_reais;
    SELECT COUNT(*) INTO total_with_dividends FROM etfs_ativos_reais WHERE dividends_12m > 0;
    
    percentage := ROUND((total_with_dividends * 100.0) / total_etfs, 2);
    
    RAISE NOTICE '=== ATUALIZAÇÃO COMPLETA ===';
    RAISE NOTICE 'Total de ETFs: %', total_etfs;
    RAISE NOTICE 'ETFs com dividendos: %', total_with_dividends;
    RAISE NOTICE 'Percentual: %', percentage;
    RAISE NOTICE '============================';
END $$;

COMMIT;

-- =====================================================
-- INSTRUÇÕES DE USO:
-- 
-- 1. SUPABASE DASHBOARD (RECOMENDADO):
--    - Acesse: https://supabase.com/dashboard/project/[PROJECT_ID]/sql
--    - Cole este script completo no SQL Editor
--    - Clique em "Run" para executar
--    - Aguarde 2-5 minutos para conclusão
--
-- 2. LINHA DE COMANDO (psql):
--    psql "postgresql://[CONNECTION_STRING]" -f """ + output_file + """
--
-- 3. PYTHON (usando psycopg2):
--    import psycopg2
--    conn = psycopg2.connect("postgresql://[CONNECTION_STRING]")
--    cursor = conn.cursor()
--    cursor.execute(open('""" + output_file + """').read())
--    conn.commit()
-- =====================================================
""")
    
    print(f"✅ Arquivo SQL gerado: {output_file}")
    print(f"📊 Total de batches: {total_batches}")
    print(f"📊 Total de ETFs: {len(etfs_data)}")
    
    # Estatísticas
    file_size = len(open(output_file, 'r', encoding='utf-8').read())
    print(f"📁 Tamanho do arquivo: {file_size:,} caracteres")
    
    return output_file

if __name__ == "__main__":
    print("🚀 Gerando arquivo SQL completo para atualização de dividendos...")
    output_file = create_complete_sql()
    print(f"\n🎯 PRONTO! Execute o arquivo: {output_file}")
    print("\n📋 PRÓXIMOS PASSOS:")
    print("1. Abra o Supabase Dashboard")
    print("2. Vá para SQL Editor")
    print("3. Cole o conteúdo do arquivo SQL")
    print("4. Clique em 'Run'")
    print("5. Aguarde 2-5 minutos")
    print("6. Verifique os resultados!") 