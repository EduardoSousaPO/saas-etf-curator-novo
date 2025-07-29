'use client';

import { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RotateCcw, BookmarkIcon, FolderIcon, ArrowLeft } from 'lucide-react';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import { useRouter } from 'next/navigation';
import FolderSidebar from '../../components/chat/FolderSidebar';
import SaveModal from '../../components/chat/SaveModal';

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

interface Folder {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
  items?: FolderItem[];
}

interface FolderItem {
  id: string;
  title: string;
  summary?: string;
  content_type: string;
  is_favorite: boolean;
  view_count: number;
  created_at: string;
  tags?: string[];
}

export default function ChatIAPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [selectedFolder, setSelectedFolder] = useState<Folder | null>(null);
  const [selectedItem, setSelectedItem] = useState<FolderItem | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const router = useRouter();

  // ID do usuário (UUID válido para demo - em produção viria da autenticação)
  const userId = 'a1b2c3d4-5e6f-7890-abcd-ef1234567890';

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      content: inputValue.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Create assistant message that will be updated via streaming
    const assistantMessageId = crypto.randomUUID();
    const assistantMessage: Message = {
      id: assistantMessageId,
      content: '',
      sender: 'assistant',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);

    try {
      // Usar endpoint agents com streaming
      const response = await fetch('/api/chat/agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          userId: userId
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Processar resposta streaming
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let accumulatedContent = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) break;
          
          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const data = JSON.parse(line.slice(6));
                
                if (data.content) {
                  accumulatedContent += data.content;
                  
                  // Update assistant message with accumulated content
                  setMessages(prev => prev.map(msg => 
                    msg.id === assistantMessageId 
                      ? { ...msg, content: accumulatedContent }
                      : msg
                  ));
                }
                
                if (data.done) {
                  break;
                }
              } catch (e) {
                // Ignorar chunks inválidos
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Error sending message:', error);
      
      setMessages(prev => prev.map(msg => 
        msg.id === assistantMessageId 
          ? { ...msg, content: '❌ **Erro de Conexão**\n\nNão foi possível processar sua mensagem. Verifique sua conexão e tente novamente.' }
          : msg
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInputValue(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
  };

  const clearChat = () => {
    setMessages([]);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Função para salvar conversa
  const handleSaveConversation = async (saveData: any) => {
    try {
      const response = await fetch('/api/chat/folder-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...saveData,
          conversationId: crypto.randomUUID(), // Em produção, usar ID real da conversa
          messageId: null
        })
      });

      if (response.ok) {
        console.log('✅ Conversa salva com sucesso!');
        // TODO: Mostrar notificação de sucesso
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar conversa');
      }
    } catch (error) {
      console.error('❌ Erro ao salvar conversa:', error);
      throw error; // Re-throw para o SaveModal tratar
    }
  };

  // Função para carregar item salvo
  const handleItemSelect = (item: FolderItem) => {
    // TODO: Implementar carregamento da conversa salva
    console.log('📄 Item selecionado:', item);
    setSelectedItem(item);
  };

  // Função para selecionar pasta
  const handleFolderSelect = (folder: Folder) => {
    setSelectedFolder(folder);
  };

  // Função para voltar à página anterior
  const handleGoBack = () => {
    router.back();
  };

  return (
    <div className="flex h-screen bg-white">
      {/* Sidebar de Pastas */}
      {showSidebar && (
        <FolderSidebar
          userId={userId}
          onFolderSelect={handleFolderSelect}
          onItemSelect={handleItemSelect}
          selectedFolderId={selectedFolder?.id}
          className="w-80 flex-shrink-0"
        />
      )}

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
          <div className="flex items-center space-x-3">
            {/* Back Button */}
            <button
              onClick={handleGoBack}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title="Voltar"
            >
              <ArrowLeft size={20} />
            </button>

            {/* Toggle Sidebar Button */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
              title={showSidebar ? 'Ocultar pastas' : 'Mostrar pastas'}
            >
              <FolderIcon size={20} />
            </button>

            <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center border border-gray-200 shadow-sm">
              <Image
                src="/imagens/Vista logo colorido (3).png"
                alt="Vista Logo"
                width={36}
                height={36}
                className="object-contain"
              />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">Vista ETF Assistant</h1>
              <p className="text-sm text-gray-500">Seu especialista em ETFs e investimentos</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Save Button - Only show when there are messages */}
            {messages.length > 0 && (
              <button
                onClick={() => setShowSaveModal(true)}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Salvar conversa"
              >
                <BookmarkIcon size={16} />
                <span>Salvar</span>
              </button>
            )}

            {/* Clear Chat Button */}
            <button
              onClick={clearChat}
              className="flex items-center space-x-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              title="Limpar conversa"
            >
              <RotateCcw size={16} />
              <span>Limpar</span>
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto">
          {messages.length === 0 ? (
            /* Welcome Message */
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center mb-6">
                <Bot size={40} className="text-blue-600" />
              </div>
              
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Olá! Sou o Vista ETF Assistant
              </h2>
              
              <p className="text-gray-600 mb-8 max-w-2xl">
                Especialista em ETFs e investimentos. Posso ajudar você a criar portfolios personalizados, 
                analisar ETFs, explicar conceitos financeiros e muito mais.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl w-full">
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">💰 Criar Portfolio</h3>
                  <p className="text-sm text-gray-600">"Quero investir 100 mil reais com perfil moderado"</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">📊 Analisar ETFs</h3>
                  <p className="text-sm text-gray-600">"Compare SPY vs VTI"</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">🎓 Educação Financeira</h3>
                  <p className="text-sm text-gray-600">"O que é expense ratio?"</p>
                </div>
                
                <div className="p-4 border border-gray-200 rounded-lg hover:border-blue-300 transition-colors">
                  <h3 className="font-medium text-gray-900 mb-2">🔍 Screening</h3>
                  <p className="text-sm text-gray-600">"ETFs de tecnologia com baixo custo"</p>
                </div>
              </div>
            </div>
          ) : (
            /* Messages List */
            <div className="max-w-4xl mx-auto p-4 space-y-6">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start space-x-3 ${
                    message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                  }`}
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    message.sender === 'user' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-white border border-gray-200'
                  }`}>
                    {message.sender === 'user' ? (
                      <User size={16} />
                    ) : (
                      <Image
                        src="/imagens/Vista logo colorido (3).png"
                        alt="Vista Logo"
                        width={20}
                        height={20}
                        className="object-contain"
                      />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`flex-1 max-w-3xl ${
                    message.sender === 'user' ? 'text-right' : ''
                  }`}>
                    <div className={`inline-block p-4 rounded-lg ${
                      message.sender === 'user'
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-50 text-gray-900 border border-gray-200'
                    }`}>
                      {message.sender === 'assistant' ? (
                        <ReactMarkdown 
                          className="prose prose-sm max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-gray-800"
                        >
                          {message.content || (isLoading && message.id === messages[messages.length - 1]?.id ? '⏳ Processando...' : '')}
                        </ReactMarkdown>
                      ) : (
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      )}
                    </div>
                    
                    <div className={`text-xs text-gray-500 mt-1 ${
                      message.sender === 'user' ? 'text-right' : ''
                    }`}>
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area - Always Visible */}
        <div className="border-t border-gray-200 bg-white p-4">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-end space-x-3">
              <div className="flex-1 relative">
                <textarea
                  ref={textareaRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  placeholder="Digite sua pergunta sobre ETFs e investimentos..."
                  className="w-full resize-none border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  style={{ minHeight: '52px', maxHeight: '120px' }}
                  disabled={isLoading}
                  rows={1}
                />
                
                <button
                  onClick={handleSendMessage}
                  disabled={!inputValue.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={16} />
                </button>
              </div>
            </div>
            
            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
              <span>Pressione Enter para enviar, Shift+Enter para nova linha</span>
              <span>Vista ETF Assistant v2.0 - Pastas Inteligentes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Salvamento */}
      <SaveModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveConversation}
        messages={messages.map(m => ({ role: m.sender, content: m.content }))}
        userId={userId}
      />
    </div>
  );
} 