#!/usr/bin/env python3
"""
Teste rápido para validar se o sistema está conectado ao Supabase com dados reais
"""

import sys
import os
import json
import asyncio
from datetime import datetime

# Configurar variáveis de ambiente
os.environ['OPENAI_API_KEY'] = "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"
os.environ['SUPABASE_SERVICE_ROLE_KEY'] = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5uaWFibmp1d3plcW1mbHJydWdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcyMTc3MzM5MCwiZXhwIjoyMDM3MzQ5MzkwfQ.QfKUdYwYNl0HcSr9jdEYiVlmPQJmYzYZGKWxBc9KZQY"

async def test_mcp_direct():
    """Teste direto da integração MCP"""
    print("🔍 TESTE RÁPIDO: Validação MCP Supabase")
    print("="*60)
    
    try:
        from MCPRealImplementation import mcp_supabase, get_etf_data
        
        # Teste 1: Query SQL direta
        print("📝 1. Testando query SQL direta...")
        sql_results = await mcp_supabase.execute_sql_query(
            "SELECT symbol, name, expense_ratio FROM etfs_ativos_reais WHERE expense_ratio IS NOT NULL LIMIT 3"
        )
        
        print(f"✅ Resultado: {len(sql_results)} ETFs encontrados")
        for etf in sql_results:
            print(f"   - {etf.get('symbol', 'N/A')}: {etf.get('name', 'N/A')[:30]}... ({etf.get('expense_ratio', 'N/A')}%)")
        
        # Teste 2: Buscar ETF específico
        print("\n📝 2. Testando get_etf_data('SPY')...")
        spy_data = await get_etf_data('SPY')
        print(f"✅ SPY data: {len(spy_data)} campos")
        if spy_data:
            print(f"   - Nome: {spy_data.get('name', 'N/A')}")
            print(f"   - Expense Ratio: {spy_data.get('expense_ratio', 'N/A')}%")
        
        # Verificar se está usando dados reais
        is_real_data = len(sql_results) > 0 and len(spy_data) > 0
        
        print(f"\n🎯 RESULTADO: {'✅ DADOS REAIS CONFIRMADOS' if is_real_data else '❌ PROBLEMA NA CONEXÃO'}")
        
        return is_real_data
        
    except Exception as e:
        print(f"❌ Erro no teste MCP: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_vista_chat():
    """Teste do sistema Vista Chat"""
    print("\n🔍 TESTE RÁPIDO: Sistema Vista Chat")
    print("="*60)
    
    try:
        from VistaETFAgentSystem import vista_etf_system
        
        # Teste simples
        user_id = "a1b2c3d4-5e6f-7890-abcd-ef1234567890"
        query = "Liste apenas 3 ETFs americanos reais com seus símbolos"
        
        print(f"📝 Query: {query}")
        response = vista_etf_system.chat(query, user_id)
        
        print(f"📄 Resposta ({len(response)} chars):")
        print(response[:300] + "..." if len(response) > 300 else response)
        
        # Verificar se contém ETFs americanos reais
        american_etfs = ['VTI', 'SPY', 'QQQ', 'AGG', 'BND', 'IWM', 'EEM']
        brazilian_etfs = ['IMAB11', 'FIXA11', 'BOVB11', 'IVVB11']
        
        has_american = any(etf in response for etf in american_etfs)
        has_brazilian = any(etf in response for etf in brazilian_etfs)
        
        print(f"\n📊 Análise:")
        print(f"   - ETFs americanos: {'✅' if has_american else '❌'}")
        print(f"   - ETFs brasileiros fictícios: {'❌' if has_brazilian else '✅'}")
        
        success = has_american and not has_brazilian
        print(f"\n🎯 RESULTADO: {'✅ SISTEMA FUNCIONANDO COM DADOS REAIS' if success else '❌ SISTEMA COM PROBLEMAS'}")
        
        return success
        
    except Exception as e:
        print(f"❌ Erro no teste Vista: {e}")
        import traceback
        traceback.print_exc()
        return False

async def main():
    """Executar testes rápidos"""
    print("🚀 TESTES RÁPIDOS DE VALIDAÇÃO")
    print("="*80)
    
    # Teste 1: MCP direto
    mcp_success = await test_mcp_direct()
    
    # Teste 2: Sistema Vista
    vista_success = test_vista_chat()
    
    # Resultado final
    print("\n" + "="*80)
    print("📊 RESULTADO FINAL DOS TESTES RÁPIDOS")
    print("="*80)
    
    print(f"🔗 Conexão MCP Supabase: {'✅ OK' if mcp_success else '❌ FALHA'}")
    print(f"🤖 Sistema Vista Chat: {'✅ OK' if vista_success else '❌ FALHA'}")
    
    overall_success = mcp_success and vista_success
    
    if overall_success:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        print("✅ Sistema funcionando corretamente com dados reais do Supabase")
    else:
        print("\n⚠️ ALGUNS TESTES FALHARAM")
        if not mcp_success:
            print("❌ Problema na conexão MCP com Supabase")
        if not vista_success:
            print("❌ Problema no sistema Vista Chat")
    
    return overall_success

if __name__ == "__main__":
    success = asyncio.run(main())
    exit(0 if success else 1) 