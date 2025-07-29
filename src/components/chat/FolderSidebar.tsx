import React, { useState, useEffect } from 'react';
import { 
  FolderIcon, 
  PlusIcon, 
  MagnifyingGlassIcon as SearchIcon, 
  StarIcon, 
  TrashIcon,
  PencilIcon,
  ArrowDownTrayIcon as DownloadIcon,
  EyeIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

interface Folder {
  id: string;
  name: string;
  type: string;
  description?: string;
  icon: string;
  color: string;
  position: number;
  is_default: boolean;
  is_custom: boolean;
  item_count?: number;
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

interface FolderSidebarProps {
  userId: string;
  onFolderSelect: (folder: Folder) => void;
  onItemSelect: (item: FolderItem) => void;
  selectedFolderId?: string;
  className?: string;
}

export default function FolderSidebar({ 
  userId, 
  onFolderSelect, 
  onItemSelect, 
  selectedFolderId, 
  className = '' 
}: FolderSidebarProps) {
  const [folders, setFolders] = useState<Folder[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [editingFolder, setEditingFolder] = useState<Folder | null>(null);

  // Carregar pastas do usuário
  useEffect(() => {
    loadFolders();
  }, [userId]);

  const loadFolders = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/chat/folders?userId=${userId}&includeItems=true`);
      
      if (!response.ok) {
        console.warn('⚠️ API de pastas falhou, usando pastas padrão');
        // Fallback para pastas padrão se a API falhar
        setFolders(getDefaultFolders());
        return;
      }
      
      const data = await response.json();
      
      if (data.folders) {
        setFolders(data.folders);
      } else {
        setFolders(getDefaultFolders());
      }
    } catch (error) {
      console.error('❌ Erro ao carregar pastas, usando fallback:', error);
      setFolders(getDefaultFolders());
    } finally {
      setLoading(false);
    }
  };

  // Função para retornar pastas padrão quando a API falha
  const getDefaultFolders = (): Folder[] => [
    {
      id: 'default-portfolios',
      name: 'Portfólios',
      type: 'portfolios',
      description: 'Análises e simulações de carteiras',
      icon: '💼',
      color: '#3B82F6',
      position: 1,
      is_default: true,
      is_custom: false,
      items: []
    },
    {
      id: 'default-comparisons',
      name: 'Comparações',
      type: 'comparisons', 
      description: 'Comparativos entre ETFs',
      icon: '⚖️',
      color: '#10B981',
      position: 2,
      is_default: true,
      is_custom: false,
      items: []
    },
    {
      id: 'default-education',
      name: 'Educação',
      type: 'education',
      description: 'Conceitos e explicações',
      icon: '📖',
      color: '#8B5CF6',
      position: 3,
      is_default: true,
      is_custom: false,
      items: []
    }
  ];

  const createFolder = async (folderData: Partial<Folder>) => {
    try {
      const response = await fetch('/api/chat/folders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, ...folderData })
      });

      if (response.ok) {
        await loadFolders();
        setShowCreateModal(false);
      }
    } catch (error) {
      console.error('❌ Erro ao criar pasta:', error);
    }
  };

  const updateFolder = async (folderId: string, updates: Partial<Folder>) => {
    try {
      const response = await fetch('/api/chat/folders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, userId, ...updates })
      });

      if (response.ok) {
        await loadFolders();
        setEditingFolder(null);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar pasta:', error);
    }
  };

  const deleteFolder = async (folderId: string) => {
    if (!confirm('Tem certeza que deseja excluir esta pasta?')) return;

    try {
      const response = await fetch(`/api/chat/folders?folderId=${folderId}&userId=${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await loadFolders();
      }
    } catch (error) {
      console.error('❌ Erro ao excluir pasta:', error);
    }
  };

  const toggleFolderExpansion = (folderId: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId);
    } else {
      newExpanded.add(folderId);
    }
    setExpandedFolders(newExpanded);
  };

  const exportFolder = async (folderId: string, format: 'json' | 'csv' | 'pdf') => {
    try {
      const response = await fetch('/api/chat/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ folderId, userId, format })
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `pasta-${folderId}-${Date.now()}.${format}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('❌ Erro ao exportar pasta:', error);
    }
  };

  const filteredFolders = folders.filter(folder =>
    folder.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    folder.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className={`bg-white border-r border-gray-200 ${className}`}>
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            {[...Array(7)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border-r border-gray-200 flex flex-col ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold text-gray-900">Pastas Inteligentes</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Nova pasta"
          >
            <PlusIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Busca */}
        <div className="relative">
          <SearchIcon className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar pastas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Lista de Pastas */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-2">
          {filteredFolders.map(folder => (
            <div key={folder.id} className="mb-1">
              {/* Pasta */}
              <div
                className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                  selectedFolderId === folder.id
                    ? 'bg-blue-50 border border-blue-200'
                    : 'hover:bg-gray-50'
                }`}
                onClick={() => {
                  onFolderSelect(folder);
                  toggleFolderExpansion(folder.id);
                }}
              >
                <div className="flex items-center flex-1">
                  <span className="text-lg mr-2">{folder.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900 text-sm">{folder.name}</span>
                      {folder.items && folder.items.length > 0 && (
                        <span className="ml-2 px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full">
                          {folder.items.length}
                        </span>
                      )}
                    </div>
                    {folder.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{folder.description}</p>
                    )}
                  </div>
                </div>

                {/* Ações da pasta */}
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {folder.is_custom && (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingFolder(folder);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                        title="Editar pasta"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteFolder(folder.id);
                        }}
                        className="p-1 text-gray-400 hover:text-red-600"
                        title="Excluir pasta"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  
                  {/* Menu de exportação */}
                  <div className="relative group/export">
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 text-gray-400 hover:text-green-600"
                      title="Exportar pasta"
                    >
                      <DownloadIcon className="w-4 h-4" />
                    </button>
                    <div className="absolute right-0 top-6 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-10 opacity-0 group-hover/export:opacity-100 pointer-events-none group-hover/export:pointer-events-auto transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportFolder(folder.id, 'json');
                        }}
                        className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        JSON
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportFolder(folder.id, 'csv');
                        }}
                        className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        CSV
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          exportFolder(folder.id, 'pdf');
                        }}
                        className="block w-full text-left px-3 py-1 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        PDF
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Itens da pasta (quando expandida) */}
              {expandedFolders.has(folder.id) && folder.items && folder.items.length > 0 && (
                <div className="ml-6 mt-1 space-y-1">
                  {folder.items.slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      onClick={() => onItemSelect(item)}
                      className="flex items-center p-2 rounded-md cursor-pointer hover:bg-gray-50 group"
                    >
                      <div className="flex-1">
                        <div className="flex items-center">
                          <span className="text-sm font-medium text-gray-700 truncate">
                            {item.title}
                          </span>
                          {item.is_favorite && (
                            <StarSolidIcon className="w-3 h-3 text-yellow-400 ml-1 flex-shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center mt-1 text-xs text-gray-500">
                          <EyeIcon className="w-3 h-3 mr-1" />
                          <span>{item.view_count}</span>
                          <span className="mx-1">•</span>
                          <span>{new Date(item.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {folder.items.length > 5 && (
                    <div className="text-xs text-gray-500 text-center py-1">
                      +{folder.items.length - 5} itens
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal de criação de pasta */}
      {showCreateModal && (
        <CreateFolderModal
          onClose={() => setShowCreateModal(false)}
          onCreate={createFolder}
        />
      )}

      {/* Modal de edição de pasta */}
      {editingFolder && (
        <EditFolderModal
          folder={editingFolder}
          onClose={() => setEditingFolder(null)}
          onUpdate={(updates) => updateFolder(editingFolder.id, updates)}
        />
      )}
    </div>
  );
}

// Componente para modal de criação de pasta
function CreateFolderModal({ onClose, onCreate }: {
  onClose: () => void;
  onCreate: (data: Partial<Folder>) => void;
}) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [color, setColor] = useState('#3B82F6');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onCreate({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color,
      type: 'custom'
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Nova Pasta</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da pasta
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Ex: Minhas Análises"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (opcional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Descrição da pasta..."
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ícone
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
                placeholder="📁"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Criar Pasta
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Componente para modal de edição de pasta
function EditFolderModal({ folder, onClose, onUpdate }: {
  folder: Folder;
  onClose: () => void;
  onUpdate: (updates: Partial<Folder>) => void;
}) {
  const [name, setName] = useState(folder.name);
  const [description, setDescription] = useState(folder.description || '');
  const [icon, setIcon] = useState(folder.icon);
  const [color, setColor] = useState(folder.color);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdate({
      name: name.trim(),
      description: description.trim() || undefined,
      icon,
      color
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-w-full mx-4">
        <h3 className="text-lg font-semibold mb-4">Editar Pasta</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nome da pasta
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Descrição
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
            />
          </div>

          <div className="flex space-x-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ícone
              </label>
              <input
                type="text"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center"
              />
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cor
              </label>
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full h-10 border border-gray-300 rounded-md cursor-pointer"
              />
            </div>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 