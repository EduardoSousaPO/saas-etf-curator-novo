#!/usr/bin/env python3
"""
Teste para verificar se o chat frontend consegue processar corretamente
as respostas streaming da API do chat.
"""

import requests
import json
import time

def test_chat_streaming():
    """Testa o streaming do chat simulando o comportamento do frontend"""
    
    print("🧪 TESTE DO CHAT STREAMING - VISTA ETF ASSISTANT")
    print("=" * 60)
    
    test_messages = [
        "Olá, como você pode me ajudar?",
        "Crie uma carteira conservadora com R$ 50.000",
        "Compare VTI vs SPY vs QQQ",
        "O que é Sharpe Ratio?",
        "Como está o mercado hoje?"
    ]
    
    for i, message in enumerate(test_messages, 1):
        print(f"\n🔍 TESTE {i}/5: {message}")
        print("-" * 50)
        
        try:
            # Fazer request para API
            response = requests.post(
                'http://localhost:3000/api/chat/agents',
                json={'message': message, 'user_id': 'test_frontend'},
                stream=True,
                timeout=30
            )
            
            if response.status_code != 200:
                print(f"❌ ERRO: Status {response.status_code}")
                continue
                
            print(f"✅ Status: {response.status_code}")
            print(f"📋 Headers: {dict(response.headers)}")
            
            # Simular o processamento do frontend
            accumulated_content = ""
            line_count = 0
            parse_errors = 0
            
            # Processar stream linha por linha
            for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
                if chunk:
                    lines = chunk.split('\n')
                    
                    for line in lines:
                        line = line.strip()
                        if not line:
                            continue
                            
                        line_count += 1
                        
                        try:
                            # Tentar fazer parse JSON (como o frontend)
                            data = json.loads(line)
                            
                            if data.get('error'):
                                print(f"❌ ERRO na API: {data['error']}")
                                break
                                
                            if data.get('content'):
                                accumulated_content += data['content']
                                
                            if data.get('done'):
                                break
                                
                        except json.JSONDecodeError as e:
                            parse_errors += 1
                            print(f"⚠️  JSON Parse Error na linha {line_count}: {e}")
                            print(f"   Linha problemática: {repr(line[:100])}")
            
            # Resultados
            print(f"📊 RESULTADOS:")
            print(f"   • Linhas processadas: {line_count}")
            print(f"   • Erros de parsing: {parse_errors}")
            print(f"   • Conteúdo acumulado: {len(accumulated_content)} chars")
            print(f"   • Preview: {repr(accumulated_content[:100])}...")
            
            if parse_errors == 0:
                print(f"✅ SUCESSO: Nenhum erro de parsing JSON!")
            else:
                print(f"❌ FALHA: {parse_errors} erros de parsing detectados")
                
        except requests.exceptions.Timeout:
            print("❌ TIMEOUT: Request demorou mais que 30 segundos")
        except requests.exceptions.ConnectionError:
            print("❌ CONEXÃO: Não foi possível conectar ao servidor")
        except Exception as e:
            print(f"❌ ERRO INESPERADO: {e}")
            
        time.sleep(1)  # Pausa entre testes
    
    print("\n" + "=" * 60)
    print("🎯 TESTE COMPLETO!")

def test_single_message_detailed():
    """Teste detalhado de uma única mensagem"""
    
    print("\n🔬 TESTE DETALHADO - ANÁLISE LINHA POR LINHA")
    print("=" * 60)
    
    message = "Olá, teste detalhado"
    
    try:
        response = requests.post(
            'http://localhost:3000/api/chat/agents',
            json={'message': message, 'user_id': 'test_detailed'},
            stream=True,
            timeout=15
        )
        
        print(f"Status: {response.status_code}")
        print(f"Content-Type: {response.headers.get('content-type')}")
        
        raw_content = ""
        for chunk in response.iter_content(chunk_size=1024, decode_unicode=True):
            if chunk:
                raw_content += chunk
        
        print(f"\n📄 CONTEÚDO RAW ({len(raw_content)} chars):")
        print(repr(raw_content[:500]) + "...")
        
        print(f"\n📝 ANÁLISE LINHA POR LINHA:")
        lines = raw_content.split('\n')
        
        for i, line in enumerate(lines[:10], 1):  # Primeiras 10 linhas
            line = line.strip()
            if not line:
                continue
                
            print(f"\nLinha {i}: {repr(line)}")
            
            try:
                data = json.loads(line)
                print(f"  ✅ JSON válido: {data}")
            except json.JSONDecodeError as e:
                print(f"  ❌ JSON inválido: {e}")
                
    except Exception as e:
        print(f"❌ ERRO: {e}")

if __name__ == "__main__":
    test_chat_streaming()
    test_single_message_detailed() 