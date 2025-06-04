"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bell, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  DollarSign,
  Percent,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { 
  AlertType, 
  AlertCondition, 
  ALERT_TEMPLATES, 
  ALERT_TYPE_LABELS, 
  ALERT_CONDITION_LABELS 
} from '@/lib/alerts/types';
import { ETF } from '@/types';
import ContextualGlossary from '@/components/ui/ContextualGlossary';

interface CreateAlertDialogProps {
  isOpen: boolean;
  onClose: () => void;
  etf?: ETF;
  onAlertCreated: () => void;
}

export default function CreateAlertDialog({ 
  isOpen, 
  onClose, 
  etf,
  onAlertCreated 
}: CreateAlertDialogProps) {
  const [step, setStep] = useState<'template' | 'custom' | 'form'>('template');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    etfSymbol: etf?.symbol || '',
    etfName: etf?.name || '',
    type: 'price_change' as AlertType,
    condition: 'decrease_by' as AlertCondition,
    targetValue: '',
    description: ''
  });
  const [isCreating, setIsCreating] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleTemplateSelect = (templateId: string) => {
    const template = ALERT_TEMPLATES.find(t => t.id === templateId);
    if (!template) return;

    setSelectedTemplate(templateId);
    setFormData(prev => ({
      ...prev,
      type: template.type,
      condition: template.condition,
      targetValue: template.suggestedValue?.toString() || '',
      description: template.description
    }));
    setStep('form');
  };

  const handleCustomAlert = () => {
    setSelectedTemplate(null);
    setStep('form');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: 'demo_user', // Em produção, obter do contexto de autenticação
          ...formData,
          targetValue: parseFloat(formData.targetValue)
        })
      });

      if (!response.ok) {
        throw new Error('Erro ao criar alerta');
      }

      setSuccess(true);
      setTimeout(() => {
        onAlertCreated();
        onClose();
        resetForm();
      }, 2000);

    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      alert('Erro ao criar alerta. Tente novamente.');
    } finally {
      setIsCreating(false);
    }
  };

  const resetForm = () => {
    setStep('template');
    setSelectedTemplate(null);
    setFormData({
      etfSymbol: etf?.symbol || '',
      etfName: etf?.name || '',
      type: 'price_change',
      condition: 'decrease_by',
      targetValue: '',
      description: ''
    });
    setSuccess(false);
  };

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'price_change':
      case 'price_target':
        return <DollarSign className="w-5 h-5" />;
      case 'volatility':
        return <BarChart3 className="w-5 h-5" />;
      case 'volume':
        return <TrendingUp className="w-5 h-5" />;
      case 'dividend_yield':
        return <Percent className="w-5 h-5" />;
      default:
        return <Bell className="w-5 h-5" />;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Bell className="w-6 h-6" />
                <div>
                  <h2 className="text-xl font-bold">Criar Alerta</h2>
                  {etf && (
                    <p className="text-blue-100 text-sm">
                      {etf.symbol} - {etf.name}
                    </p>
                  )}
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
            {success ? (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="text-center py-8"
              >
                <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Alerta criado com sucesso!
                </h3>
                <p className="text-gray-600">
                  Você será notificado quando as condições forem atendidas.
                </p>
              </motion.div>
            ) : step === 'template' ? (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Escolha um modelo de alerta
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Use um dos nossos modelos populares ou crie um alerta personalizado.
                  </p>
                </div>

                <div className="grid gap-4">
                  {ALERT_TEMPLATES.filter(template => template.isPopular).map((template) => (
                    <button
                      key={template.id}
                      onClick={() => handleTemplateSelect(template.id)}
                      className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 text-blue-600 rounded-lg mr-4">
                        {getAlertIcon(template.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <p className="text-sm text-gray-600">
                          <ContextualGlossary>{template.description}</ContextualGlossary>
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleCustomAlert}
                  className="w-full flex items-center justify-center p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <AlertTriangle className="w-5 h-5 text-gray-400 mr-2" />
                  <span className="text-gray-600">Criar alerta personalizado</span>
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {!etf && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Símbolo do ETF
                      </label>
                      <input
                        type="text"
                        value={formData.etfSymbol}
                        onChange={(e) => setFormData(prev => ({ ...prev, etfSymbol: e.target.value.toUpperCase() }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: VTI"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nome do ETF
                      </label>
                      <input
                        type="text"
                        value={formData.etfName}
                        onChange={(e) => setFormData(prev => ({ ...prev, etfName: e.target.value }))}
                        className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ex: Vanguard Total Stock Market"
                        required
                      />
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tipo de Alerta
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as AlertType }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(ALERT_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Condição
                    </label>
                    <select
                      value={formData.condition}
                      onChange={(e) => setFormData(prev => ({ ...prev, condition: e.target.value as AlertCondition }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {Object.entries(ALERT_CONDITION_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor de Referência
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={formData.targetValue}
                      onChange={(e) => setFormData(prev => ({ ...prev, targetValue: e.target.value }))}
                      className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ex: 5.0"
                      required
                    />
                    <span className="absolute right-3 top-3 text-gray-500">
                      {['price_change', 'returns_12m', 'volatility', 'dividend_yield'].includes(formData.type) ? '%' : ''}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição (opcional)
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    rows={3}
                    placeholder="Adicione uma descrição personalizada para este alerta..."
                  />
                </div>

                <div className="flex justify-between items-center pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setStep('template')}
                    className="px-6 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Voltar
                  </button>

                  <button
                    type="submit"
                    disabled={isCreating}
                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isCreating ? 'Criando...' : 'Criar Alerta'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 