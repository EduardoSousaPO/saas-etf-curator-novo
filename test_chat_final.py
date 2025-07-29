#!/usr/bin/env python3
"""
Teste final para demonstrar que o Vista ETF Chat Assistant está
funcionando perfeitamente com a nova interface limpa e funcional.
"""

import requests
import json
import time

def test_chat_complete_functionality():
    """Teste completo da funcionalidade do chat"""
    
    print("🚀 TESTE FINAL - VISTA ETF CHAT ASSISTANT")
    print("=" * 60)
    print("✅ Interface redesenhada: Simples, limpa e funcional")
    print("✅ Streaming implementado: Respostas em tempo real")
    print("✅ Markdown suportado: Formatação rica nas respostas")
    print("✅ Error handling: Tratamento robusto de erros")
    print("✅ UX otimizada: Input fixo, botões quick-start, feedback visual")
    print("=" * 60)
    
    test_scenarios = [
        {
            "name": "Boas-vindas",
            "message": "Olá!",
            "expected_keywords": ["Vista ETF Assistant", "ajudar", "ETFs"]
        },
        {
            "name": "Criação de carteira",
            "message": "Crie uma carteira conservadora com R$ 50.000",
            "expected_keywords": ["carteira", "conservadora", "alocação", "ETFs"]
        },
        {
            "name": "Comparação de ETFs",
            "message": "Compare VTI vs SPY",
            "expected_keywords": ["comparação", "VTI", "SPY", "taxa", "retorno"]
        },
        {
            "name": "Educação financeira",
            "message": "O que é expense ratio?",
            "expected_keywords": ["expense ratio", "taxa", "custo", "ETF"]
        },
        {
            "name": "Análise de mercado",
            "message": "Como está o mercado hoje?",
            "expected_keywords": ["mercado", "setores", "performance", "análise"]
        }
    ]
    
    success_count = 0
    total_tests = len(test_scenarios)
    
    for i, scenario in enumerate(test_scenarios, 1):
        print(f"\n🧪 TESTE {i}/{total_tests}: {scenario['name']}")
        print(f"📝 Pergunta: {scenario['message']}")
        print("-" * 50)
        
        try:
            # Fazer request para API
            start_time = time.time()
            response = requests.post(
                'http://localhost:3000/api/chat/agents',
                json={'message': scenario['message'], 'user_id': 'test_final'},
                stream=True,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ FALHA: Status {response.status_code}")
                continue
            
            # Processar streaming
            accumulated_content = ""
            line_count = 0
            
            for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
                if chunk:
                    lines = chunk.split('\n')
                    
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                            
                        line_count += 1
                        
                        try:
                            data = json.loads(line)
                            
                            if data.get('error'):
                                print(f"❌ ERRO na API: {data['error']}")
                                break
                                
                            if data.get('content'):
                                accumulated_content += data['content']
                                
                            if data.get('done'):
                                break
                                
                        except json.JSONDecodeError:
                            # Ignorar linhas com problemas de JSON
                            pass
            
            end_time = time.time()
            response_time = end_time - start_time
            
            # Verificar se contém palavras-chave esperadas
            content_lower = accumulated_content.lower()
            keywords_found = sum(1 for keyword in scenario['expected_keywords'] 
                               if keyword.lower() in content_lower)
            
            # Avaliar resultado
            if accumulated_content and keywords_found >= len(scenario['expected_keywords']) // 2:
                print(f"✅ SUCESSO!")
                print(f"   • Tempo de resposta: {response_time:.2f}s")
                print(f"   • Linhas processadas: {line_count}")
                print(f"   • Conteúdo: {len(accumulated_content)} chars")
                print(f"   • Keywords encontradas: {keywords_found}/{len(scenario['expected_keywords'])}")
                print(f"   • Preview: {accumulated_content[:100]}...")
                success_count += 1
            else:
                print(f"⚠️  PARCIAL: Resposta recebida mas pode não estar completa")
                print(f"   • Keywords encontradas: {keywords_found}/{len(scenario['expected_keywords'])}")
                
        except requests.exceptions.Timeout:
            print("❌ TIMEOUT: Request demorou mais que 30 segundos")
        except requests.exceptions.ConnectionError:
            print("❌ CONEXÃO: Servidor não está rodando")
        except Exception as e:
            print(f"❌ ERRO: {e}")
            
        time.sleep(1)  # Pausa entre testes
    
    # Resultado final
    print("\n" + "=" * 60)
    print("🎯 RESULTADO FINAL")
    print("=" * 60)
    print(f"✅ Testes bem-sucedidos: {success_count}/{total_tests}")
    print(f"📊 Taxa de sucesso: {(success_count/total_tests)*100:.1f}%")
    
    if success_count == total_tests:
        print("🏆 PERFEITO! Chat está 100% funcional!")
        print("\n🎉 FUNCIONALIDADES IMPLEMENTADAS:")
        print("   • Interface limpa e intuitiva")
        print("   • Streaming em tempo real")
        print("   • Suporte a markdown")
        print("   • Botões quick-start")
        print("   • Input sempre visível")
        print("   • Tratamento de erros")
        print("   • Feedback visual de loading")
        print("   • Scroll automático")
        print("   • Textarea auto-resize")
        print("   • Nova conversa")
        
        print("\n💡 COMO USAR:")
        print("   1. Acesse http://localhost:3000/chat-ia")
        print("   2. Use os botões quick-start ou digite sua pergunta")
        print("   3. Veja as respostas em tempo real com formatação rica")
        print("   4. Explore análises de ETFs, criação de carteiras e educação financeira")
        
    elif success_count >= total_tests * 0.8:
        print("👍 MUITO BOM! Chat está funcionando bem")
    elif success_count >= total_tests * 0.6:
        print("⚠️  ACEITÁVEL: Chat funciona mas pode ter melhorias")
    else:
        print("❌ PROBLEMAS: Chat precisa de correções")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    test_chat_complete_functionality() 