import React, { useState, useEffect } from 'react';
import { 
  BookmarkIcon, 
  FolderIcon, 
  TagIcon, 
  XMarkIcon,
  CheckIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';
import { categorizeConversation, suggestTags } from '../../utils/chatAutoCategorization';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface Folder {
  id: string;
  name: string;
  type: string;
  icon: string;
  color: string;
}

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (saveData: SaveData) => Promise<void>;
  messages: Message[];
  userId: string;
  conversationId?: string;
  messageId?: string;
}

interface SaveData {
  folderId: string;
  title: string;
  summary: string;
  contentType: string;
  tags: string[];
  data: any;
}

export default function SaveModal({
  isOpen,
  onClose,
  onSave,
  messages,
  userId,
  conversationId,
  messageId
}: SaveModalProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolderId, setSelectedFolderId] = useState<string>('');
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [contentType, setContentType] = useState('custom_analysis');
  const [confidence, setConfidence] = useState(0);
  const [autoSuggestions, setAutoSuggestions] = useState<any>(null);

  // Carregar pastas e analisar conversa quando modal abrir
  useEffect(() => {
    if (isOpen) {
      loadFolders();
      analyzeConversation();
    }
  }, [isOpen, userId, messages]);

  // Carregar pastas do usuário
  const loadFolders = async () => {
    try {
      const response = await fetch(`/api/chat/folders?userId=${userId}`);
      const data = await response.json();
      
      if (data.folders) {
        setFolders(data.folders);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pastas:', error);
    }
  };

  // Analisar conversa automaticamente
  const analyzeConversation = async () => {
    if (!messages || messages.length === 0) return;

    try {
      setAnalyzing(true);
      
      // Usar sistema de categorização automática
      const analysis = categorizeConversation(messages);
      const suggestedTags = suggestTags(analysis);
      
      // Aplicar sugestões
      setTitle(analysis.title);
      setSummary(analysis.summary);
      setContentType(analysis.contentType);
      setTags(suggestedTags);
      setConfidence(analysis.confidence);
      setAutoSuggestions(analysis);
      
      // Selecionar pasta sugerida
      const suggestedFolder = folders.find(f => f.type === analysis.suggestedFolder);
      if (suggestedFolder) {
        setSelectedFolderId(suggestedFolder.id);
      }
      
    } catch (error) {
      console.error('❌ Erro na análise automática:', error);
    } finally {
      setAnalyzing(false);
    }
  };

  // Adicionar nova tag
  const addTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      setTags([...tags, newTag.trim()]);
      setNewTag('');
    }
  };

  // Remover tag
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Salvar item
  const handleSave = async () => {
    if (!selectedFolderId || !title.trim()) {
      return;
    }

    try {
      setLoading(true);
      
      const saveData: SaveData = {
        folderId: selectedFolderId,
        title: title.trim(),
        summary: summary.trim(),
        contentType,
        tags,
        data: {
          messages,
          analysis: autoSuggestions,
          confidence,
          saved_at: new Date().toISOString()
        }
      };

      await onSave(saveData);
      onClose();
      
    } catch (error) {
      console.error('❌ Erro ao salvar:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <BookmarkIcon className="w-6 h-6 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Salvar Análise</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Análise Automática */}
          {analyzing && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                <span className="text-blue-800 text-sm">Analisando conversa automaticamente...</span>
              </div>
            </div>
          )}

          {/* Resultado da Análise */}
          {autoSuggestions && !analyzing && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <CheckIcon className="w-5 h-5 text-green-600 mr-2" />
                <span className="text-green-800 font-medium">Análise Concluída</span>
                <span className="ml-2 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  {Math.round(confidence * 100)}% confiança
                </span>
              </div>
              <p className="text-green-700 text-sm">
                Conteúdo categorizado como <strong>{contentType.replace('_', ' ')}</strong> com sugestões automáticas aplicadas.
              </p>
            </div>
          )}

          {/* Confiança Baixa */}
          {confidence < 0.6 && autoSuggestions && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 mr-2" />
                <span className="text-yellow-800 text-sm">
                  Confiança baixa na categorização. Revise as sugestões antes de salvar.
                </span>
              </div>
            </div>
          )}

          {/* Seleção de Pasta */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FolderIcon className="w-4 h-4 inline mr-1" />
              Pasta de Destino
            </label>
            <select
              value={selectedFolderId}
              onChange={(e) => setSelectedFolderId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Selecione uma pasta...</option>
              {folders.map(folder => (
                <option key={folder.id} value={folder.id}>
                  {folder.icon} {folder.name}
                </option>
              ))}
            </select>
          </div>

          {/* Título */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Título
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Análise de Portfolio - VTI vs SPY"
              required
            />
          </div>

          {/* Resumo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Resumo
            </label>
            <textarea
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={3}
              placeholder="Breve descrição do conteúdo da análise..."
            />
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <TagIcon className="w-4 h-4 inline mr-1" />
              Tags
            </label>
            
            {/* Tags existentes */}
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-2 text-blue-600 hover:text-blue-800"
                  >
                    <XMarkIcon className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>

            {/* Adicionar nova tag */}
            <div className="flex">
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTag()}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Adicionar tag..."
              />
              <button
                onClick={addTag}
                className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 transition-colors"
              >
                Adicionar
              </button>
            </div>
          </div>

          {/* Tipo de Conteúdo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Conteúdo
            </label>
            <select
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="portfolio_analysis">Análise de Portfolio</option>
              <option value="etf_comparison">Comparação de ETFs</option>
              <option value="screener_query">Consulta de Filtros</option>
              <option value="educational_content">Conteúdo Educativo</option>
              <option value="market_analysis">Análise de Mercado</option>
              <option value="trade_simulation">Simulação de Negociação</option>
              <option value="custom_analysis">Análise Personalizada</option>
            </select>
          </div>

          {/* Preview das mensagens */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Preview da Conversa
            </label>
            <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
              {messages.slice(0, 4).map((message, index) => (
                <div key={index} className="mb-2 last:mb-0">
                  <div className="text-xs text-gray-500 mb-1">
                    {message.role === 'user' ? 'Usuário' : 'Assistente'}
                  </div>
                  <div className="text-sm text-gray-700 bg-white p-2 rounded border">
                    {message.content.length > 100 
                      ? message.content.substring(0, 100) + '...'
                      : message.content
                    }
                  </div>
                </div>
              ))}
              {messages.length > 4 && (
                <div className="text-xs text-gray-500 text-center mt-2">
                  +{messages.length - 4} mensagens adicionais
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="text-sm text-gray-500">
            {messages.length} mensagem{messages.length !== 1 ? 's' : ''} • 
            {confidence > 0 && ` ${Math.round(confidence * 100)}% confiança`}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={!selectedFolderId || !title.trim() || loading}
              className="px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
            >
              {loading && (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              )}
              {loading ? 'Salvando...' : 'Salvar Análise'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 