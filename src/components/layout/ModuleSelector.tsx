"use client";

import React, { useState, useEffect } from 'react';
import { ChevronDown, TrendingUp, Building2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

interface Module {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  href: string;
}

const modules: Module[] = [
  {
    id: 'etfs',
    name: 'ETFs',
    icon: <TrendingUp className="w-4 h-4" />,
    description: 'Exchange Traded Funds',
    href: '/dashboard'
  },
  {
    id: 'stocks',
    name: 'Stocks',
    icon: <Building2 className="w-4 h-4" />,
    description: 'Ações Americanas',
    href: '/stocks'
  }
];

interface PageHeaderWithModuleSelectorProps {
  title: string;
  description: string;
  currentModule: string;
}

export function PageHeaderWithModuleSelector({ 
  title, 
  description, 
  currentModule 
}: PageHeaderWithModuleSelectorProps) {
  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
              <p className="mt-2 text-gray-600">{description}</p>
            </div>
            <div className="flex items-center space-x-4">
              <ModuleSelector />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ModuleSelector() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module>(modules[0]);
  const { profile } = useAuth();

  // Carregar módulo salvo do perfil do usuário
  useEffect(() => {
    if (profile?.selected_module) {
      const savedModule = modules.find(m => m.id === profile.selected_module);
      if (savedModule) {
        setSelectedModule(savedModule);
      }
    }
  }, [profile]);

  // Salvar módulo selecionado no perfil do usuário
  const handleModuleSelect = async (module: Module) => {
    setSelectedModule(module);
    setIsOpen(false);

    // Salvar no perfil do usuário via API
    try {
      await fetch('/api/profile/update-module', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selected_module: module.id
        }),
      });
    } catch (error) {
      console.error('Erro ao salvar módulo selecionado:', error);
    }

    // Navegar para o módulo selecionado
    if (typeof window !== 'undefined') {
      window.location.href = module.href;
    }
  };

  return (
    <div className="relative">
      {/* Botão do seletor */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-2 px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        {selectedModule.icon}
        <span>{selectedModule.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Overlay para fechar ao clicar fora */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Menu dropdown */}
          <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 px-2">
                Selecionar Módulo
              </div>
              
              {modules.map((module) => (
                <button
                  key={module.id}
                  onClick={() => handleModuleSelect(module)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                    selectedModule.id === module.id
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className={`flex-shrink-0 ${
                    selectedModule.id === module.id 
                      ? 'text-blue-600 dark:text-blue-400' 
                      : 'text-gray-400 dark:text-gray-500'
                  }`}>
                    {module.icon}
                  </div>
                  <div className="flex-1 text-left">
                    <div className="font-medium">{module.name}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {module.description}
                    </div>
                  </div>
                  {selectedModule.id === module.id && (
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                  )}
                </button>
              ))}
            </div>
            
            {/* Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-3">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                Sua seleção será salva no seu perfil
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
