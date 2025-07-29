import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';

export async function POST(request: NextRequest) {
  try {
    const { message, userId } = await request.json();
    
    if (!message) {
      return NextResponse.json({ error: 'Mensagem é obrigatória' }, { status: 400 });
    }

    console.log('🤖 Iniciando sistema Agno para:', message.substring(0, 100));
    
    // Obter chave OpenAI do ambiente
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      console.error('❌ OPENAI_API_KEY não encontrada');
      return NextResponse.json({ 
        error: 'Chave OpenAI não configurada',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Executar sistema Agno com timeout mais agressivo
    const agnoResult = await executeAgnoSystem(message, openaiKey, userId);
    
    if (!agnoResult.success) {
      console.error('Erro no Agno:', agnoResult.error);
      return NextResponse.json({
        error: `Sistema Agno falhou: ${agnoResult.error}`,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }

    // Retornar resposta do Agno como streaming
    return createStreamingResponse(agnoResult.response ?? "");

  } catch (error) {
    console.error('❌ Erro na API de chat:', error);
    return NextResponse.json({
      error: 'Erro interno do servidor',
      details: error instanceof Error ? error.message : 'Erro desconhecido',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

async function executeAgnoSystem(message: string, openaiKey: string, userId?: string): Promise<{
  success: boolean;
  response?: string;
  error?: string;
  timestamp: string;
}> {
  return new Promise((resolve) => {
    const startTime = Date.now();
    console.log('🚀 Iniciando processo Python Agno...');
    
    // Criar processo Python com timeout mais agressivo (30s)
    const pythonProcess = spawn('python', ['-c', `
import sys
import os
import json
import asyncio
from datetime import datetime, timezone
import signal

# Configurar timeout global para operações
import socket
socket.setdefaulttimeout(10)  # 10s timeout para todas as operações de rede

# Handler para timeout
def timeout_handler(signum, frame):
    print("TIMEOUT: Processo Python forçado a terminar")
    sys.exit(1)

# Configurar signal handler (apenas no Unix)
try:
    signal.signal(signal.SIGALRM, timeout_handler)
    signal.alarm(25)  # 25s timeout interno
except:
    pass  # Windows não suporta SIGALRM

try:
    os.environ['OPENAI_API_KEY'] = "${openaiKey}"
    os.environ['SUPABASE_SERVICE_ROLE_KEY'] = "${process.env.SUPABASE_SERVICE_ROLE_KEY || ''}"
    
    from VistaETFAgentSystem import VistaETFSystem
    
    user_message = """${message.replace(/"/g, '\\"').replace(/\n/g, '\\n')}"""
    user_id = "${userId || 'demo-user'}"
    
    print(f"🔄 Processando mensagem: {user_message[:100]}...")
    
    # Criar sistema com timeout
    vista_system = VistaETFSystem()
    
    # Executar com timeout
    def run_with_timeout():
        try:
            return vista_system.chat(user_message, user_id)
        except Exception as e:
            return f"Erro no processamento: {str(e)}"
    
    # Executar sistema
    response = run_with_timeout()
    
    # Cancelar timeout
    try:
        signal.alarm(0)
    except:
        pass
    
    result = {
        "success": True,
        "response": response,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "processing_time_ms": (datetime.now().timestamp() * 1000) - ${Date.now()}
    }
    
    print(f"✅ Agno concluído em {result.get('processing_time_ms', 0):.0f}ms")
    print("=== RESULTADO FINAL ===")
    print(json.dumps(result))
    print("=== FIM RESULTADO ===")
    
except Exception as e:
    print(f"❌ Erro no sistema Agno: {str(e)}")
    result = {
        "success": False,
        "error": str(e),
        "timestamp": datetime.now(timezone.utc).isoformat()
    }
    print("=== ERRO FINAL ===")
    print(json.dumps(result))
    print("=== FIM ERRO ===")
    sys.exit(1)
`], {
      cwd: process.cwd() + '/src/agents/agno',
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 30000  // 30s timeout total
    });

    let stdout = '';
    let stderr = '';
    let isResolved = false;

    // Timeout mais agressivo (30s) com cleanup melhorado
    const timeoutId = setTimeout(() => {
      if (!isResolved) {
        console.log('⏰ Timeout atingido, terminando processo...');
        
        // Kill mais agressivo
        try {
          pythonProcess.kill('SIGKILL');
          // Forçar kill se necessário
          setTimeout(() => {
            try {
              process.kill(pythonProcess.pid!, 'SIGKILL');
            } catch (e) {
              // Processo já morreu
            }
          }, 1000);
        } catch (e) {
          console.log('Processo já foi terminado');
        }
        
        isResolved = true;
        resolve({
          success: false,
          error: 'Timeout na execução do Agno (30s) - Sistema travou',
          timestamp: new Date().toISOString()
        });
      }
    }, 30000);

    pythonProcess.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    pythonProcess.stderr?.on('data', (data) => {
      stderr += data.toString();
      console.error('🚨 Python stderr:', data.toString());
    });

    pythonProcess.on('close', (code) => {
      if (!isResolved) {
        clearTimeout(timeoutId);
        isResolved = true;
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        console.log(`🏁 Processo Python finalizado em ${duration}ms com código: ${code}`);
        
        if (code !== 0) {
          console.error('❌ Processo Python falhou com código:', code);
          console.error('❌ Stderr:', stderr);
          console.error('❌ Stdout:', stdout);
          resolve({
            success: false,
            error: `Processo Python falhou (código ${code}). Stderr: ${stderr}. Stdout: ${stdout}`,
            timestamp: new Date().toISOString()
          });
          return;
        }

        try {
          console.log('📄 Stdout completo recebido:', stdout.length, 'caracteres');
          
          // Melhorar a lógica de parsing do JSON para evitar repetições
          const lines = stdout.trim().split('\n').filter(line => line.trim().length > 0);
          let result = null;
          let foundResult = false;
          
          // Procurar por marcadores específicos primeiro
          const resultStartIndex = lines.findIndex(line => line.includes('=== RESULTADO FINAL ==='));
          const errorStartIndex = lines.findIndex(line => line.includes('=== ERRO FINAL ==='));
          
          if (resultStartIndex !== -1) {
            // Procurar JSON após o marcador de resultado
            for (let i = resultStartIndex + 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.includes('=== FIM RESULTADO ===')) break;
              if (line.startsWith('{') && line.endsWith('}')) {
                try {
                  result = JSON.parse(line);
                  foundResult = true;
                  console.log('✅ JSON encontrado após marcador RESULTADO');
                  break;
                } catch (e) {
                  continue;
                }
              }
            }
          } else if (errorStartIndex !== -1) {
            // Procurar JSON após o marcador de erro
            for (let i = errorStartIndex + 1; i < lines.length; i++) {
              const line = lines[i].trim();
              if (line.includes('=== FIM ERRO ===')) break;
              if (line.startsWith('{') && line.endsWith('}')) {
                try {
                  result = JSON.parse(line);
                  foundResult = true;
                  console.log('✅ JSON encontrado após marcador ERRO');
                  break;
                } catch (e) {
                  continue;
                }
              }
            }
          }
          
          // Fallback: procurar pela última linha JSON válida (método anterior)
          if (!foundResult) {
            console.log('⚠️ Marcadores não encontrados, usando fallback');
            for (let i = lines.length - 1; i >= 0; i--) {
              const line = lines[i].trim();
              if (line.startsWith('{') && line.endsWith('}')) {
                try {
                  result = JSON.parse(line);
                  foundResult = true;
                  console.log('✅ JSON encontrado via fallback na linha', i);
                  break;
                } catch (e) {
                  continue;
                }
              }
            }
          }
          
          if (!result || !foundResult) {
            throw new Error('Nenhum JSON válido encontrado na saída');
          }
          
          console.log('🎯 Resultado final extraído:', (result as any).success ? 'SUCESSO' : 'ERRO');
          resolve(result);
        } catch (error) {
          console.error('❌ Erro ao processar resposta:', error);
          console.log('📝 Primeiras 500 chars do stdout:', stdout.substring(0, 500));
          resolve({
            success: false,
            error: `Erro ao processar resposta: ${error}`,
            timestamp: new Date().toISOString()
          });
        }
      }
    });

    pythonProcess.on('error', (error) => {
      if (!isResolved) {
        clearTimeout(timeoutId);
        isResolved = true;
        console.error('❌ Erro no processo Python:', error);
        resolve({
          success: false,
          error: `Erro no processo Python: ${error.message}`,
          timestamp: new Date().toISOString()
        });
      }
    });
  });
}

function createStreamingResponse(content: string): Response {
  const encoder = new TextEncoder();
  
  const stream = new ReadableStream({
    start(controller) {
      console.log('🚀 Iniciando streaming de resposta:', content.length, 'caracteres');
      
      // Dividir em chunks de 50 caracteres para simular typing
      const chunkSize = 50;
      let offset = 0;
      
      const sendChunk = () => {
        if (offset < content.length) {
          const chunk = content.substring(offset, offset + chunkSize);
          const data = {
            content: chunk,
            done: false,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
          offset += chunkSize;
          
          // Delay para simular typing
          setTimeout(sendChunk, 50);
        } else {
          // Chunk final indicando fim
          const finalData = {
            content: '',
            done: true,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(finalData)}\n\n`));
          console.log('✅ Streaming concluído');
          controller.close();
        }
      };
      
      sendChunk();
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
} 