'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Send, Plus, MessageSquare, FolderOpen, BarChart3, Download, Settings, Trash2, Edit3 } from 'lucide-react';
import Image from 'next/image';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  intent?: string;
  loading?: boolean;
}

interface Project {
  id: string;
  name: string;
  color: string;
  description?: string;
  created_at: string;
}

interface Conversation {
  id: string;
  project_id: string;
  title: string;
  created_at: string;
  message_count: number;
  first_message?: string;
}

export default function ChatPage() {
  // Estados principais
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectColor, setNewProjectColor] = useState('#0088FE');
  const [showTemplates, setShowTemplates] = useState(false);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Templates de conversa focados em ETFs
  const conversationTemplates = [
    { 
      title: "Criar Carteira Balanceada", 
      message: "Quero criar uma carteira balanceada com $100.000 para aposentadoria em 30 anos",
      icon: "Target",
      category: "portfolio"
    },
    { 
      title: "Comparar ETFs Populares", 
      message: "Compare SPY vs VTI vs VOO - qual é melhor para longo prazo?",
      icon: "BarChart3",
      category: "analysis"
    },
    { 
      title: "ETFs de Dividendos", 
      message: "Encontre os melhores ETFs de dividendos com yield acima de 3%",
      icon: "DollarSign",
      category: "income"
    },
    { 
      title: "Estratégia de Rebalanceamento", 
      message: "Como e quando devo rebalancear minha carteira de ETFs?",
      icon: "RefreshCw",
      category: "strategy"
    },
    { 
      title: "ETFs por Setor", 
      message: "Analise os melhores ETFs de tecnologia para 2025",
      icon: "TrendingUp",
      category: "sector"
    },
    { 
      title: "Reserva de Emergência", 
      message: "Quero montar uma reserva de emergência conservadora com R$ 50.000",
      icon: "Shield",
      category: "safety"
    }
  ];

  // Projetos pré-definidos por objetivo financeiro
  const defaultProjects = [
    { 
      name: "Aposentadoria 2055", 
      color: "#0088FE", 
      description: "Estratégias de longo prazo para aposentadoria",
      icon: "Target"
    },
    { 
      name: "Compra da Casa", 
      color: "#00C49F", 
      description: "Investimentos para aquisição imobiliária",
      icon: "Home"
    },
    { 
      name: "Reserva de Emergência", 
      color: "#FF8042", 
      description: "Segurança financeira e liquidez",
      icon: "Shield"
    },
    { 
      name: "Crescimento Agressivo", 
      color: "#8884D8", 
      description: "Alto potencial de retorno",
      icon: "TrendingUp"
    },
    { 
      name: "Renda Passiva", 
      color: "#FFBB28", 
      description: "Dividendos e distribuições",
      icon: "DollarSign"
    }
  ];

  // Cores disponíveis para projetos
  const projectColors = [
    '#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8',
    '#82CA9D', '#FFC658', '#FF7C7C', '#8DD1E1', '#D084D0'
  ];

  // Carregar projetos ao montar
  useEffect(() => {
    loadProjects();
  }, []);

  // Carregar conversas quando projeto é selecionado
  useEffect(() => {
    if (selectedProject) {
      loadConversations(selectedProject.id);
    }
  }, [selectedProject]);

  // Scroll automático para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Carregar projetos
  const loadProjects = async () => {
    try {
      const response = await fetch('/api/ai/projects?userId=current-user');
      const result = await response.json();
      if (result.success) {
        setProjects(result.data);
        if (result.data.length > 0) {
          setSelectedProject(result.data[0]);
        }
      }
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    }
  };

  // Carregar conversas
  const loadConversations = async (projectId: string) => {
    try {
      const response = await fetch(`/api/ai/conversations?projectId=${projectId}&userId=current-user`);
      const result = await response.json();
      if (result.success) {
        setConversations(result.data);
      }
    } catch (error) {
      console.error('Erro ao carregar conversas:', error);
    }
  };

  // Criar novo projeto
  const createProject = async () => {
    if (!newProjectName.trim()) return;

    try {
      const response = await fetch('/api/ai/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user',
          name: newProjectName.trim(),
          color: newProjectColor,
          description: `Projeto para ${newProjectName.trim()}`
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadProjects();
        setShowProjectModal(false);
        setNewProjectName('');
        setNewProjectColor('#0088FE');
        
        // Selecionar o novo projeto
        const newProject = result.data;
        setSelectedProject(newProject);
      }
    } catch (error) {
      console.error('Erro ao criar projeto:', error);
    }
  };

  // Iniciar nova conversa
  const startNewConversation = () => {
    setSelectedConversation(null);
    setMessages([]);
  };

  // Selecionar conversa
  const selectConversation = async (conversation: Conversation) => {
    setSelectedConversation(conversation);
    // Aqui você carregaria as mensagens da conversa
    // Por enquanto, vamos limpar as mensagens
    setMessages([]);
  };

  // Enviar mensagem
  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date()
    };

    const loadingMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: 'Pensando...',
      timestamp: new Date(),
      loading: true
    };

    setMessages(prev => [...prev, userMessage, loadingMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user',
          projectId: selectedProject?.id,
          conversationId: selectedConversation?.id,
          message: userMessage.content
        })
      });

      const result = await response.json();

      if (result.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 2).toString(),
          role: 'assistant',
          content: result.message,
          timestamp: new Date(),
          intent: result.intent
        };

        setMessages(prev => prev.slice(0, -1).concat(assistantMessage));

        // Recarregar conversas se foi criada uma nova
        if (selectedProject && !selectedConversation) {
          await loadConversations(selectedProject.id);
        }
      } else {
        throw new Error(result.error || 'Erro na resposta');
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente.',
        timestamp: new Date()
      };

      setMessages(prev => prev.slice(0, -1).concat(errorMessage));
    } finally {
      setIsLoading(false);
    }
  };

  // Usar template de conversa
  const useTemplate = (template: typeof conversationTemplates[0]) => {
    setInputMessage(template.message);
    setShowTemplates(false);
    // Focar no input após selecionar template
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  // Criar projeto a partir de template padrão
  const createDefaultProject = async (defaultProject: typeof defaultProjects[0]) => {
    try {
      const response = await fetch('/api/ai/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'current-user',
          name: defaultProject.name,
          color: defaultProject.color,
          description: defaultProject.description
        })
      });

      const result = await response.json();
      if (result.success) {
        await loadProjects();
        const newProject = result.data;
        setSelectedProject(newProject);
      }
    } catch (error) {
      console.error('Erro ao criar projeto padrão:', error);
    }
  };

  // Lidar com Enter
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar - Projetos e Conversas */}
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col">
        {/* Header da Sidebar */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Vista AI Chat</h1>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowTemplates(!showTemplates)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Templates de Conversa"
              >
                <MessageSquare size={20} />
              </button>
              <button
                onClick={() => setShowProjectModal(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                title="Novo Projeto"
              >
                <Plus size={20} />
              </button>
            </div>
          </div>

          {/* Templates de Conversa */}
          {showTemplates && (
            <div className="mb-4 p-3 bg-blue-50 rounded-lg">
              <h3 className="text-sm font-medium text-gray-900 mb-2">Templates Rápidos</h3>
              <div className="space-y-1">
                {conversationTemplates.slice(0, 4).map((template, index) => (
                  <button
                    key={index}
                    onClick={() => useTemplate(template)}
                    className="w-full flex items-center gap-2 p-2 text-left hover:bg-blue-100 rounded text-sm"
                  >
                    <span>{template.icon}</span>
                    <span className="text-gray-700">{template.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projetos Padrão (se não houver projetos) */}
          {projects.length === 0 && (
            <div className="mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Objetivos Financeiros</h3>
              <div className="space-y-2">
                {defaultProjects.slice(0, 3).map((defaultProject, index) => (
                  <button
                    key={index}
                    onClick={() => createDefaultProject(defaultProject)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 border border-gray-200"
                  >
                    <span className="text-lg">{defaultProject.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {defaultProject.name}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {defaultProject.description}
                      </p>
                    </div>
                    <Plus size={16} className="text-gray-400" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Seletor de Projeto */}
          {projects.length > 0 && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-700">Seus Projetos</h3>
              {projects.map(project => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedProject?.id === project.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: project.color }}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {project.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {project.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Lista de Conversas */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-gray-700">Conversas</h2>
              <button
                onClick={startNewConversation}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded"
                title="Nova Conversa"
              >
                <Plus size={16} />
              </button>
            </div>

            <div className="space-y-2">
              {conversations.filter(conversation => 
                conversation.message_count > 0 && 
                conversation.title && 
                conversation.title.trim() !== ''
              ).map(conversation => (
                <button
                  key={conversation.id}
                  onClick={() => selectConversation(conversation)}
                  className={`w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors ${
                    selectedConversation?.id === conversation.id
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <MessageSquare size={16} className="text-gray-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-gray-500 truncate">
                      {conversation.first_message}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      {conversation.message_count} mensagens
                    </p>
                  </div>
                </button>
              ))}
              {conversations.filter(conversation => 
                conversation.message_count > 0 && 
                conversation.title && 
                conversation.title.trim() !== ''
              ).length === 0 && (
                <div className="text-center py-8">
                  <MessageSquare className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">Nenhuma conversa ainda</p>
                  <p className="text-xs text-gray-400">Inicie uma nova conversa acima</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Área Principal do Chat */}
      <div className="flex-1 flex flex-col">
        {/* Header do Chat */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Botão Voltar - Melhor Posicionado */}
              <button
                onClick={() => window.location.href = '/'}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors border border-gray-200"
                title="Voltar ao Início"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span className="hidden sm:inline">Início</span>
              </button>

              {selectedProject && (
                <>
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedProject.color }}
                  />
                  <h2 className="text-lg font-semibold text-gray-900">
                    {selectedProject.name}
                  </h2>
                </>
              )}
              {selectedConversation && (
                <>
                  <span className="text-gray-400">•</span>
                  <span className="text-gray-600">{selectedConversation.title}</span>
                </>
              )}
              {!selectedProject && !selectedConversation && (
                <>
                  <div className="w-px h-6 bg-gray-300 mx-2" />
                  <h2 className="text-lg font-semibold text-gray-900">
                    Vista AI Chat
                  </h2>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                title="Analisar Performance"
              >
                <BarChart3 size={16} />
                <span className="hidden md:inline">Performance</span>
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm text-green-600 hover:text-green-700 hover:bg-green-50 rounded-lg transition-colors"
                title="Exportar Relatório"
              >
                <Download size={16} />
                <span className="hidden md:inline">Relatório</span>
              </button>
              <button 
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                title="Configurações"
              >
                <Settings size={16} />
                <span className="hidden md:inline">Config</span>
              </button>
            </div>
          </div>
        </div>

        {/* Área de Mensagens */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              {/* Logo Vista Centralizado */}
              <div className="text-center">
                <div className="flex items-center justify-center mb-8">
                  <Image 
                    src="/imagens/Vista logo colorido (3).png" 
                    alt="Vista Logo" 
                    width={120} 
                    height={120}
                    className="object-contain"
                  />
                </div>
                <p className="text-xl text-gray-600 max-w-md mx-auto">
                  Seu assistente inteligente para investimentos em ETFs
                </p>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3xl px-4 py-3 rounded-2xl ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-gray-200 text-gray-900'
                  }`}
                >
                  {message.loading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-pulse flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                      <span className="text-gray-500">Processando...</span>
                    </div>
                  ) : (
                    <>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.intent && (
                        <div className="mt-2 text-xs opacity-70">
                          Intent: {message.intent}
                        </div>
                      )}
                      <div className="mt-1 text-xs opacity-70">
                        {message.timestamp.toLocaleTimeString()}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input de Mensagem */}
        <div className="bg-white border-t border-gray-200 p-4">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={inputRef}
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Digite sua mensagem sobre ETFs, carteiras ou mercado financeiro..."
                className="w-full p-3 pr-12 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || isLoading}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 p-2 text-blue-600 hover:text-blue-700 disabled:text-gray-300 disabled:cursor-not-allowed"
              >
                <Send size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Novo Projeto */}
      {showProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Novo Projeto de Investimento
            </h3>
            
            {/* Templates Padrão */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Escolha um objetivo ou crie personalizado
              </label>
              <div className="grid grid-cols-1 gap-2 mb-4">
                {defaultProjects.map((template, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setNewProjectName(template.name);
                      setNewProjectColor(template.color);
                    }}
                    className={`flex items-center gap-3 p-3 text-left border rounded-lg hover:bg-gray-50 transition-colors ${
                      newProjectName === template.name ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                    }`}
                  >
                    <span className="text-lg">{template.icon}</span>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{template.name}</p>
                      <p className="text-sm text-gray-600">{template.description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nome do Projeto
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="Ex: Aposentadoria 2055, Compra da Casa..."
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cor do Projeto
                </label>
                <div className="flex gap-2 flex-wrap">
                  {projectColors.map(color => (
                    <button
                      key={color}
                      onClick={() => setNewProjectColor(color)}
                      className={`w-8 h-8 rounded-full border-2 ${
                        newProjectColor === color ? 'border-gray-900 scale-110' : 'border-gray-300'
                      } transition-all`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowProjectModal(false);
                  setNewProjectName('');
                  setNewProjectColor('#0088FE');
                }}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={createProject}
                disabled={!newProjectName.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Criar Projeto
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

