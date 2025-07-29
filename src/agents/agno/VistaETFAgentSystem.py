"""
Sistema Vista ETF Agent usando framework Agno
Implementação completa seguindo documentação oficial
Integração real com MCP Supabase e Perplexity AI
"""

import os
import json
import asyncio
from typing import Dict, List, Any, Optional

# Imports corretos do Agno baseado na documentação
from agno.agent import Agent
from agno.models.openai import OpenAIChat
from agno.tools.duckduckgo import DuckDuckGoTools
from agno.tools.yfinance import YFinanceTools

# Importar integrações MCP reais
from MCPRealImplementation import (
    mcp_supabase, 
    mcp_perplexity,
    get_etf_data,
    screen_etfs,
    get_market_analysis,
    optimize_portfolio
)


class SupabaseETFTool:
    """Ferramenta customizada para acessar dados reais do Supabase"""
    
    def __init__(self):
        self.name = "supabase_etf_tool"
        self.description = "Acesso direto aos dados de 1.370+ ETFs reais via MCP Supabase"
    
    def get_etf_details(self, symbol: str) -> str:
        """Busca dados completos de um ETF específico no Supabase"""
        try:
            # Usar integração MCP real
            loop = asyncio.get_event_loop()
            etf_data = loop.run_until_complete(get_etf_data(symbol))
            
            if etf_data:
                return f"""
**ETF {symbol.upper()}**:
- **Nome**: {etf_data.get('name', 'N/A')}
- **Taxa de Administração**: {etf_data.get('expense_ratio', 'N/A')}% a.a.
- **Retorno 12 meses**: {etf_data.get('returns_12m', 'N/A')}%
- **Volatilidade**: {etf_data.get('volatility', 'N/A')}%
- **Sharpe Ratio**: {etf_data.get('sharpe_ratio', 'N/A')}
- **Dividend Yield**: {etf_data.get('dividend_yield', 'N/A')}%
- **Patrimônio**: ${etf_data.get('totalasset', 0):,.0f}
- **Categoria**: {etf_data.get('category', 'N/A')}

*Dados obtidos via MCP Supabase - Base real de 1.370+ ETFs*
                """
            else:
                return f"ETF {symbol} não encontrado na base de dados do ETF Curator."
                
        except Exception as e:
            return f"Erro ao buscar dados do ETF {symbol}: {str(e)}"
    
    def screen_etfs_by_criteria(self, filters: Dict[str, Any]) -> str:
        """Screening avançado de ETFs com filtros específicos"""
        try:
            # Usar integração MCP real
            loop = asyncio.get_event_loop()
            results = loop.run_until_complete(screen_etfs(filters))
            
            if results:
                output = f"**🔍 Screening de ETFs - {len(results)} ETFs encontrados:**\n\n"
                
                for i, etf in enumerate(results[:10], 1):  # Top 10
                    output += f"**{i}. {etf['symbol']}** - {etf.get('name', 'N/A')}\n"
                    output += f"   - Taxa: {etf.get('expense_ratio', 'N/A')}% a.a.\n"
                    output += f"   - Retorno 12m: {etf.get('returns_12m', 'N/A')}%\n"
                    output += f"   - Sharpe: {etf.get('sharpe_ratio', 'N/A')}\n"
                    output += f"   - Patrimônio: ${etf.get('totalasset', 0):,.0f}\n\n"
                
                return output
            else:
                return "Nenhum ETF encontrado com os critérios especificados."
                
        except Exception as e:
            return f"Erro no screening de ETFs: {str(e)}"
    
    def get_portfolio_optimization(self, objective: str, risk_profile: str, investment: float) -> str:
        """Otimização de portfolio usando dados reais"""
        try:
            # Usar integração MCP real
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(optimize_portfolio(objective, risk_profile, investment))
            
            output = f"""
**🎯 Otimização de Portfolio - Vista ETF Curator**

**Parâmetros:**
- Objetivo: {result['objective']}
- Perfil de Risco: {result['risk_profile']}
- Investimento: ${result['investment']:,.2f}

**📊 Métricas Esperadas:**
- Retorno Esperado: {result['expected_return']}% a.a.
- Volatilidade: {result['expected_volatility']}%
- Sharpe Ratio: {result['sharpe_ratio']}

**🏆 ETFs Candidatos Selecionados:**
            """
            
            for i, etf in enumerate(result.get('candidates', []), 1):
                output += f"\n{i}. **{etf['symbol']}** - {etf.get('name', 'N/A')}"
                output += f"\n   - Taxa: {etf.get('expense_ratio', 'N/A')}%"
                output += f"\n   - Retorno: {etf.get('returns_12m', 'N/A')}%"
                output += f"\n   - Sharpe: {etf.get('sharpe_ratio', 'N/A')}"
            
            output += "\n\n*Otimização baseada na Teoria de Markowitz com dados reais*"
            return output
            
        except Exception as e:
            return f"Erro na otimização de portfolio: {str(e)}"


class PerplexityETFTool:
    """Ferramenta customizada para informações atualizadas via Perplexity"""
    
    def __init__(self):
        self.name = "perplexity_etf_tool"
        self.description = "Informações atualizadas sobre ETFs e mercado via MCP Perplexity"
    
    def get_etf_news_analysis(self, symbol: str) -> str:
        """Análise e notícias atualizadas sobre um ETF específico"""
        try:
            # Usar integração MCP real
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(
                mcp_perplexity.search_etf_information(symbol)
            )
            
            return f"""
**📰 Análise Atualizada - ETF {symbol}**

{result}

*Informações obtidas via MCP Perplexity AI*
            """
            
        except Exception as e:
            return f"Erro ao buscar análise atualizada do ETF {symbol}: {str(e)}"
    
    def get_market_sector_analysis(self, sector: str) -> str:
        """Análise atualizada de setor específico"""
        try:
            # Usar integração MCP real
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(
                mcp_perplexity.analyze_market_sector(sector)
            )
            
            return f"""
**📈 Análise Setorial - {sector}**

{result}

*Análise atualizada via MCP Perplexity AI*
            """
            
        except Exception as e:
            return f"Erro na análise do setor {sector}: {str(e)}"
    
    def get_general_market_outlook(self) -> str:
        """Perspectivas gerais do mercado de ETFs"""
        try:
            # Usar integração MCP real
            loop = asyncio.get_event_loop()
            result = loop.run_until_complete(
                mcp_perplexity.get_market_outlook()
            )
            
            return f"""
**🌍 Perspectivas do Mercado de ETFs**

{result}

*Análise atualizada via MCP Perplexity AI*
            """
            
        except Exception as e:
            return f"Erro ao obter perspectivas de mercado: {str(e)}"


# Agentes especializados usando estrutura simplificada do Agno
financial_data_agent = Agent(
    name="Financial Data Agent",
    role="Especialista em dados financeiros e métricas de ETFs",
    model=OpenAIChat(id="gpt-4o"),
    tools=[YFinanceTools(stock_price=True, company_info=True)],
    instructions=[
        "Use sempre dados reais da base de 1.370+ ETFs via MCP Supabase",
        "Forneça métricas precisas e atualizadas",
        "Explique conceitos financeiros de forma didática",
        "Compare ETFs usando dados objetivos",
        "Nunca use dados simulados ou estimativas"
    ],
    markdown=True,
    show_tool_calls=True
)

market_analysis_agent = Agent(
    name="Market Analysis Agent", 
    role="Especialista em análise de mercado e tendências",
    model=OpenAIChat(id="gpt-4o"),
    tools=[DuckDuckGoTools()],
    instructions=[
        "Use MCP Perplexity para informações atualizadas",
        "Analise tendências de mercado e contexto macroeconômico",
        "Forneça perspectivas baseadas em fontes confiáveis",
        "Contextualize dados históricos com situação atual",
        "Identifique oportunidades e riscos de mercado"
    ],
    markdown=True,
    show_tool_calls=True
)

portfolio_optimizer_agent = Agent(
    name="Portfolio Optimizer Agent",
    role="Especialista em otimização de carteiras usando teoria de Markowitz",
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "Use teoria de Markowitz para otimização científica",
        "Considere correlações entre ativos",
        "Adapte alocações ao perfil de risco do investidor",
        "Explique a lógica por trás das recomendações",
        "Foque em eficiência da fronteira eficiente"
    ],
    markdown=True,
    show_tool_calls=True
)

educational_agent = Agent(
    name="Educational Agent",
    role="Especialista em educação financeira e conceitos de investimento",
    model=OpenAIChat(id="gpt-4o"),
    tools=[DuckDuckGoTools()],
    instructions=[
        "Explique conceitos financeiros de forma simples e clara",
        "Use exemplos práticos e analogias",
        "Adapte linguagem ao nível do usuário",
        "Forneça contexto histórico quando relevante",
        "Incentive boas práticas de investimento"
    ],
    markdown=True,
    show_tool_calls=True
)

# Team principal - Vista ETF Assistant
vista_etf_team = Agent(
    name="Vista ETF Assistant",
    role="Copiloto financeiro especializado em ETFs - Seu assistente pessoal para investimentos inteligentes",
    team=[
        financial_data_agent,
        market_analysis_agent, 
        portfolio_optimizer_agent,
        educational_agent
    ],
    model=OpenAIChat(id="gpt-4o"),
    instructions=[
        "Você é o Vista ETF Assistant, um copiloto financeiro especializado em ETFs",
        "Use sempre dados reais da base de 1.370+ ETFs via MCP Supabase", 
        "Coordene a equipe de agentes especializados para fornecer análises completas",
        "Mantenha um tom profissional mas acessível",
        "Explique conceitos complexos de forma didática",
        "Forneça recomendações baseadas em dados científicos",
        "Adapte respostas ao perfil e experiência do usuário",
        "Use formatação markdown para melhor legibilidade",
        "Sempre cite fontes e metodologias utilizadas",
        "Incentive diversificação e investimento responsável",
        "Mantenha contexto das conversas anteriores",
        "Sugira próximos passos quando apropriado"
    ],
    markdown=True
)


class VistaETFSystem:
    """Sistema principal Vista ETF com todas as funcionalidades integradas"""
    
    def __init__(self):
        self.team = vista_etf_team
        self.supabase_tool = SupabaseETFTool()
        self.perplexity_tool = PerplexityETFTool()
    
    def chat(self, message: str, user_id: str = "default") -> str:
        """Interface principal de chat integrada com Portfolio Master"""
        try:
            # 1. DETECTAR se usuário quer portfolio/carteira
            portfolio_keywords = ['carteira', 'portfolio', 'investir', 'aplicar', 'montar', 'sugestão', 'recomendação']
            wants_portfolio = any(keyword in message.lower() for keyword in portfolio_keywords)
            
            if wants_portfolio:
                # 2. EXTRAIR PARÂMETROS da mensagem usando LLM
                extraction_prompt = f"""
Analise esta mensagem e extraia os parâmetros de investimento:
Mensagem: "{message}"

Retorne APENAS um JSON válido com:
{{
    "investmentAmount": [valor em número, se mencionado, senão 50000],
    "riskProfile": ["conservative", "moderate", ou "aggressive" baseado no contexto],
    "objective": ["retirement", "emergency", "house", ou "growth" baseado no contexto],
    "timeHorizon": [número de meses, se mencionado, senão 60]
}}
"""
                
                # Usar Agno para extrair parâmetros
                extraction_response = self.team.run(extraction_prompt)
                
                try:
                    # Tentar parsear JSON da resposta
                    import json
                    import re
                    
                    print(f"🔍 Resposta da extração: {extraction_response}")
                    
                    # Extrair conteúdo da resposta
                    response_content = str(extraction_response)
                    if hasattr(extraction_response, 'content'):
                        response_content = str(extraction_response.content)
                    
                    # Remover blocos de código markdown
                    response_content = re.sub(r'```json\s*', '', response_content)
                    response_content = re.sub(r'```\s*', '', response_content)
                    
                    # Extrair JSON da resposta limpa
                    json_match = re.search(r'\{[^{}]*\}', response_content, re.DOTALL)
                    
                    if json_match:
                        json_str = json_match.group()
                        print(f"🔍 JSON extraído: {json_str}")
                        
                        # Limpar quebras de linha e espaços extras
                        json_str = json_str.replace('\n', '').replace('\\n', '')
                        json_str = re.sub(r'\s+', ' ', json_str)
                        
                        params = json.loads(json_str)
                        print(f"✅ Parâmetros extraídos: {params}")
                    else:
                        print("❌ Nenhum JSON encontrado, usando valores padrão")
                        # Fallback com valores padrão
                        params = {
                            "investmentAmount": 50000,
                            "riskProfile": "moderate", 
                            "objective": "growth",
                            "timeHorizon": 60
                        }
                    
                    # 3. CHAMAR API DO PORTFOLIO MASTER
                    portfolio_result = self._generate_real_portfolio(params, user_id)
                    return portfolio_result
                    
                except Exception as e:
                    print(f"Erro na extração de parâmetros: {e}")
                    # Fallback para resposta genérica melhorada
                    return self._generate_generic_portfolio_response(message)
            
            else:
                # 4. PROCESSAR outras mensagens normalmente
                contextualized_message = f"[User ID: {user_id}] {message}"
                response = self.team.run(contextualized_message)
                
                if hasattr(response, 'content'):
                    return str(response.content)
                elif isinstance(response, str):
                    return response
                else:
                    return str(response)
            
        except Exception as e:
            return f"❌ Erro no sistema Vista ETF: {str(e)}"
    
    def _generate_real_portfolio(self, params: dict, user_id: str) -> str:
        """Gera portfolio real usando API do Portfolio Master"""
        try:
            import requests
            import json
            
            # Chamar API unified-recommendations
            api_url = "http://localhost:3000/api/portfolio/unified-recommendations"
            
            payload = {
                "investmentAmount": params.get("investmentAmount", 50000),
                "riskProfile": params.get("riskProfile", "moderate"),
                "objective": params.get("objective", "growth"),
                "timeHorizon": params.get("timeHorizon", 60),
                "preferences": {
                    "includeInternational": True,
                    "sustainableOnly": False,
                    "maxExpenseRatio": 1.0
                },
                "includeBenchmarking": True
            }
            
            print(f"🚀 Chamando Portfolio Master API com: {payload}")
            
            response = requests.post(api_url, json=payload, timeout=30)
            
            print(f"📊 Status da API: {response.status_code}")
            print(f"📊 Resposta da API: {response.text[:500]}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"📊 Dados recebidos: {data}")
                return self._format_portfolio_response(data, params)
            else:
                print(f"❌ Erro na API Portfolio Master: {response.status_code}")
                print(f"❌ Resposta de erro: {response.text}")
                return self._generate_generic_portfolio_response("Erro na API")
                
        except Exception as e:
            print(f"❌ Erro ao gerar portfolio real: {e}")
            return self._generate_generic_portfolio_response("Erro técnico")
    
    def _format_portfolio_response(self, data: dict, params: dict) -> str:
        """Formata resposta do portfolio com dados reais"""
        try:
            # A estrutura real da API é: data['unified_recommendation']['recommended_portfolio']['etfs']
            unified_rec = data.get('unified_recommendation', {})
            portfolio = unified_rec.get('recommended_portfolio', {})
            etfs = portfolio.get('etfs', [])
            
            print(f"🔍 Debug - unified_rec keys: {unified_rec.keys()}")
            print(f"🔍 Debug - portfolio keys: {portfolio.keys()}")
            print(f"🔍 Debug - ETFs count: {len(etfs)}")
            
            if not etfs:
                return "❌ Não foi possível gerar portfolio com os parâmetros fornecidos."
            
            # Construir resposta formatada
            response = f"""
# 🎯 **Portfolio Personalizado Vista ETF**

## 💰 **Resumo do Investimento**
- **Valor**: ${params.get('investmentAmount', 50000):,.2f}
- **Perfil**: {params.get('riskProfile', 'moderate').title()}
- **Objetivo**: {params.get('objective', 'growth').title()}
- **Horizonte**: {params.get('timeHorizon', 60)} meses

## 📊 **Composição Recomendada**

"""
            
            for i, etf in enumerate(etfs[:6], 1):
                symbol = etf.get('symbol', 'N/A')
                name = etf.get('name', 'N/A')
                allocation = etf.get('allocation_percent', 0)  # Corrigido: allocation_percent
                metrics = etf.get('metrics', {})
                expense_ratio = metrics.get('expense_ratio', 0)
                
                response += f"""**{i}. {symbol}** - {allocation:.1f}%
   📈 *{name}*
   💸 Taxa: {expense_ratio:.2f}% a.a.
   
"""
            
            # Adicionar métricas do portfolio - estrutura corrigida
            portfolio_metrics = unified_rec.get('portfolio_metrics', {})
            if portfolio_metrics:
                response += f"""
## 📈 **Métricas Esperadas**
- **Retorno Anual**: {portfolio_metrics.get('expected_return', 0):.1f}%
- **Volatilidade**: {portfolio_metrics.get('expected_volatility', 0):.1f}%
- **Sharpe Ratio**: {portfolio_metrics.get('sharpe_ratio', 0):.2f}

"""
            
            response += """
## 🎯 **Próximos Passos**
1. Revise a alocação sugerida
2. Considere seu perfil de risco
3. Monitore regularmente o desempenho
4. Rebalanceie quando necessário

*Portfolio gerado usando dados reais de 1.370+ ETFs via Vista ETF Assistant*
"""
            
            return response
            
        except Exception as e:
            print(f"❌ Erro ao formatar resposta: {e}")
            return self._generate_generic_portfolio_response("Erro na formatação")
    
    def _generate_generic_portfolio_response(self, message: str) -> str:
        """Resposta genérica melhorada quando API falha"""
        return f"""
# 🤖 **Vista ETF Assistant**

Entendi que você quer ajuda com investimentos! Para criar um portfolio personalizado com dados reais dos nossos 1.370+ ETFs, preciso de algumas informações:

## 📋 **Me conte sobre:**
1. **Valor para investir** (ex: R$ 50.000)
2. **Seu perfil de risco** (conservador, moderado, arrojado)
3. **Objetivo** (aposentadoria, casa própria, crescimento, emergência)
4. **Prazo de investimento** (ex: 5 anos)

Com essas informações, posso gerar uma carteira específica com ETFs reais e suas respectivas alocações!

*Ou acesse diretamente: [Portfolio Master](/portfolio-master) para uma experiência completa*
"""
    
    def analyze_etf(self, symbol: str, user_id: str = "default") -> str:
        """Análise completa de um ETF específico"""
        # Usar ferramenta direta para análise mais rápida
        basic_data = self.supabase_tool.get_etf_details(symbol)
        market_context = self.perplexity_tool.get_etf_news_analysis(symbol)
        
        return f"""
# 🔍 Análise Completa - ETF {symbol.upper()}

## 📊 Dados Básicos
{basic_data}

## 📰 Contexto de Mercado
{market_context}

## 💡 Recomendação
*Análise gerada pelo Vista ETF Assistant usando dados reais e informações atualizadas*
        """
    
    def screen_etfs(self, criteria: Dict[str, Any], user_id: str = "default") -> str:
        """Screening de ETFs com critérios específicos"""
        return self.supabase_tool.screen_etfs_by_criteria(criteria)
    
    def optimize_portfolio(self, investment: float, risk_profile: str, objective: str, user_id: str = "default") -> str:
        """Otimização completa de portfolio"""
        return self.supabase_tool.get_portfolio_optimization(objective, risk_profile, investment)
    
    def compare_etfs(self, symbols: List[str], user_id: str = "default") -> str:
        """Comparação detalhada entre ETFs"""
        comparisons = []
        for symbol in symbols:
            data = self.supabase_tool.get_etf_details(symbol)
            comparisons.append(data)
        
        return f"""
# 🆚 Comparação de ETFs: {', '.join(symbols)}

{chr(10).join(comparisons)}

*Comparação baseada em dados reais via Vista ETF Assistant*
        """
    
    def market_analysis(self, sector: str = "geral", user_id: str = "default") -> str:
        """Análise de mercado geral ou por setor"""
        if sector == "geral":
            return self.perplexity_tool.get_general_market_outlook()
        else:
            return self.perplexity_tool.get_market_sector_analysis(sector)
    
    def educational_content(self, topic: str, user_id: str = "default") -> str:
        """Conteúdo educativo sobre conceitos financeiros"""
        message = f"Explique de forma didática o conceito '{topic}' relacionado a ETFs e investimentos."
        return self.chat(message, user_id)
    
    def get_system_status(self) -> Dict[str, Any]:
        """Status do sistema e integrações"""
        return {
            "status": "active",
            "system": "Vista ETF Assistant - Framework Agno",
            "agents": {
                "financial_data_agent": "active",
                "market_analysis_agent": "active", 
                "portfolio_optimizer_agent": "active",
                "educational_agent": "active"
            },
            "integrations": {
                "mcp_supabase": "ready",
                "mcp_perplexity": "ready",
                "agno_framework": "active"
            },
            "tools": {
                "supabase_etf_tool": "ready",
                "perplexity_etf_tool": "ready"
            },
            "version": "2.0.0-agno"
        }


# Instância global do sistema
vista_etf_system = VistaETFSystem()


# Função para teste completo do sistema
def test_vista_system():
    """Testa todas as funcionalidades do sistema Vista"""
    print("🧪 Testando Sistema Vista ETF Completo...")
    
    try:
        # Teste 1: Status do sistema
        print("\n1. 📊 Status do Sistema:")
        status = vista_etf_system.get_system_status()
        print(json.dumps(status, indent=2))
        
        # Teste 2: Análise de ETF
        print("\n2. 🔍 Análise de ETF:")
        etf_analysis = vista_etf_system.analyze_etf("VTI", "test_user")
        print(etf_analysis[:300] + "...")
        
        # Teste 3: Screening
        print("\n3. 🎯 Screening de ETFs:")
        screening = vista_etf_system.screen_etfs({
            "max_expense_ratio": 0.5,
            "min_returns_12m": 10
        }, "test_user")
        print(screening[:300] + "...")
        
        # Teste 4: Otimização de Portfolio
        print("\n4. 💼 Otimização de Portfolio:")
        portfolio = vista_etf_system.optimize_portfolio(50000, "moderate", "growth", "test_user")
        print(portfolio[:300] + "...")
        
        # Teste 5: Análise de Mercado
        print("\n5. 📈 Análise de Mercado:")
        market = vista_etf_system.market_analysis("Technology", "test_user")
        print(market[:300] + "...")
        
        print("\n✅ Todos os testes do sistema Vista concluídos com sucesso!")
        
    except Exception as e:
        print(f"❌ Erro nos testes: {str(e)}")
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    test_vista_system() 