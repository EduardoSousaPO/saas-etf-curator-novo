"use client";

import { useState, useRef, useEffect } from 'react';
import { 
  Bot, 
  Send, 
  User, 
  Loader2,
  TrendingUp,
  DollarSign,
  Shield,
  BarChart3,
  Brain,
  Zap
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { toast } from "react-hot-toast";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  etfs_analyzed?: number;
  symbols?: string[];
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: '🤖 **Assistente ETF Curator** - Análises com dados reais!\n\nPosso ajudar com:\n• Análise de ETFs específicos (SPY, QQQ, VTI...)\n• Comparações entre múltiplos ETFs\n• Recomendações por perfil de investidor\n• Estratégias de diversificação\n\nComo posso ajudar hoje?',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.content,
          context: messages.slice(-5)
        })
      });

      if (!response.ok) {
        throw new Error('Falha na resposta do assistente');
      }

      const data = await response.json();

      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        etfs_analyzed: data.etfs_analyzed,
        symbols: data.symbols
      };

      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error('Erro no chat:', error);
      toast.error('Erro ao enviar mensagem');
      
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Desculpe, tive um problema técnico. Tente novamente ou reformule sua pergunta.',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const exampleQuestions = [
    { 
      text: "Como está a performance do SPY este ano?", 
      icon: TrendingUp,
      category: "Performance"
    },
    { 
      text: "Quais ETFs pagam os melhores dividendos?", 
      icon: DollarSign,
      category: "Dividendos"
    },
    { 
      text: "Recomende ETFs para perfil conservador", 
      icon: Shield,
      category: "Estratégia"
    },
    { 
      text: "Compare SPY vs QQQ vs VTI", 
      icon: BarChart3,
      category: "Comparação"
    },
    { 
      text: "ETFs para diversificação internacional", 
      icon: Brain,
      category: "Diversificação"
    },
    { 
      text: "Qual o ETF com melhor Sharpe ratio?", 
      icon: Zap,
      category: "Análise"
    }
  ];

  const handleExampleQuestion = (question: string) => {
    setInput(question);
    inputRef.current?.focus();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center space-x-4">
            <Bot className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Assistente ETF</h1>
              <p className="text-gray-600">Análises inteligentes com dados reais de 3.120+ ETFs</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Chat Area */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg border shadow-sm h-[600px] flex flex-col">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[85%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        {message.role === 'assistant' && (
                          <Bot className="w-5 h-5 mt-0.5 flex-shrink-0 text-blue-600" />
                        )}
                        {message.role === 'user' && (
                          <User className="w-5 h-5 mt-0.5 flex-shrink-0" />
                        )}
                        <div className="flex-1">
                          <div className="text-sm whitespace-pre-wrap leading-relaxed">
                            {message.content}
                          </div>
                          
                          {message.etfs_analyzed && message.etfs_analyzed > 0 && (
                            <div className="mt-3 p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                              <div className="flex items-center space-x-2 text-blue-800">
                                <BarChart3 className="w-4 h-4" />
                                <span className="text-xs font-medium">
                                  {message.etfs_analyzed} ETFs analisados
                                </span>
                                {message.symbols && message.symbols.length > 0 && (
                                  <span className="text-xs">
                                    ({message.symbols.join(', ')})
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                          
                          <div className="text-xs opacity-50 mt-2">
                            {message.timestamp.toLocaleTimeString('pt-BR', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-gray-100 text-gray-900 rounded-lg p-4 max-w-[85%]">
                      <div className="flex items-center space-x-3">
                        <Bot className="w-5 h-5 text-blue-600" />
                        <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
                        <span className="text-sm">Analisando dados dos ETFs...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t">
                <div className="flex space-x-3">
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Digite sua pergunta sobre ETFs... (ex: SPY vs QQQ)"
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={sendMessage}
                    disabled={!input.trim() || isLoading}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  💡 Dica: Mencione símbolos específicos como SPY, QQQ, VTI para análises detalhadas
                </p>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Conversação</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Mensagens:</span>
                  <span className="font-medium">{messages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">ETFs na base:</span>
                  <span className="font-medium">3.120+</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Dados premium:</span>
                  <span className="font-medium">255+</span>
                </div>
              </div>
            </div>

            {/* Example Questions */}
            <div className="bg-white rounded-lg border shadow-sm p-4">
              <h3 className="font-semibold text-gray-900 mb-3">Perguntas Exemplo</h3>
              <div className="space-y-2">
                {exampleQuestions.map((question, index) => (
                  <button
                    key={index}
                    onClick={() => handleExampleQuestion(question.text)}
                    className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors group"
                  >
                    <div className="flex items-start space-x-3">
                      <question.icon className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <div className="text-sm font-medium text-gray-900 group-hover:text-blue-600">
                          {question.text}
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {question.category}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Features */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <h3 className="font-semibold text-blue-900 mb-3">Recursos</h3>
              <ul className="space-y-2 text-sm text-blue-800">
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  <span>Dados reais de 3.120+ ETFs</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  <span>Análise de performance e risco</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  <span>Comparações inteligentes</span>
                </li>
                <li className="flex items-center space-x-2">
                  <span className="w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                  <span>Recomendações personalizadas</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 