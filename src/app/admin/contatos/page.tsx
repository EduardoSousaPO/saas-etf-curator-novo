'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Navbar from '@/components/layout/Navbar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Crown, 
  Globe, 
  Mail, 
  Phone, 
  MessageCircle,
  DollarSign,
  Clock,
  Target,
  RefreshCw
} from 'lucide-react';

interface Contato {
  id: string;
  nome: string;
  email: string;
  telefone: string;
  whatsapp?: string;
  horario_preferido?: string;
  melhor_dia?: string;
  patrimonio_total: string;
  renda_mensal?: string;
  experiencia_investimentos: string;
  objetivo_principal: string;
  horizonte_tempo: string;
  plano_interesse: 'WEALTH' | 'OFFSHORE';
  tem_consultor?: string;
  principais_investimentos?: string;
  observacoes?: string;
  status: string;
  created_at: string;
  updated_at: string;
}

export default function AdminContatosPage() {
  const [contatos, setContatos] = useState<Contato[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('PENDENTE');

  const loadContatos = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contato?status=${statusFilter}`);
      const data = await response.json();
      
      if (data.success) {
        setContatos(data.contatos);
      } else {
        console.error('Erro ao carregar contatos:', data.error);
      }
    } catch (error) {
      console.error('Erro ao carregar contatos:', error);
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    loadContatos();
  }, [loadContatos]);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'PENDENTE': { color: 'bg-yellow-100 text-yellow-800', label: 'Pendente' },
      'EM_ANALISE': { color: 'bg-blue-100 text-blue-800', label: 'Em Análise' },
      'APROVADO': { color: 'bg-green-100 text-green-800', label: 'Aprovado' },
      'REJEITADO': { color: 'bg-red-100 text-red-800', label: 'Rejeitado' },
      'CONTATADO': { color: 'bg-purple-100 text-purple-800', label: 'Contatado' }
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.PENDENTE;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getPatrimonioLabel = (patrimonio: string) => {
    const labels = {
      '200k-500k': 'R$ 200k - 500k',
      '500k-1M': 'R$ 500k - 1M',
      '1M-2M': 'R$ 1M - 2M',
      '2M-5M': 'R$ 2M - 5M',
      '5M+': 'R$ 5M+'
    };
    return labels[patrimonio as keyof typeof labels] || patrimonio;
  };

  const getExperienciaLabel = (exp: string) => {
    const labels = {
      'iniciante': 'Iniciante',
      'intermediario': 'Intermediário',
      'avancado': 'Avançado'
    };
    return labels[exp as keyof typeof labels] || exp;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="pt-20 px-6">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              <div className="grid grid-cols-1 gap-6">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-48 bg-gray-200 rounded-lg"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="pt-20 px-6 pb-16">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Contatos Premium
                </h1>
                <p className="text-gray-600 mt-2">
                  Solicitações para planos WEALTH e OFFSHORE
                </p>
              </div>
              
              <Button
                onClick={loadContatos}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Atualizar</span>
              </Button>
            </div>
            
            {/* Filtros */}
            <div className="flex space-x-2">
              {['PENDENTE', 'EM_ANALISE', 'APROVADO', 'CONTATADO', 'REJEITADO'].map(status => (
                <Button
                  key={status}
                  variant={statusFilter === status ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setStatusFilter(status)}
                >
                  {status.replace('_', ' ')}
                </Button>
              ))}
            </div>
          </div>

          {/* Lista de Contatos */}
          <div className="space-y-6">
            {contatos.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    Nenhum contato encontrado
                  </h3>
                  <p className="text-gray-600">
                    Não há contatos com status &quot;{statusFilter.replace('_', ' ')}&quot;
                  </p>
                </CardContent>
              </Card>
            ) : (
              contatos.map((contato) => (
                <Card key={contato.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-full ${
                          contato.plano_interesse === 'WEALTH' 
                            ? 'bg-purple-100' 
                            : 'bg-emerald-100'
                        }`}>
                          {contato.plano_interesse === 'WEALTH' ? (
                            <Crown className="w-6 h-6 text-purple-600" />
                          ) : (
                            <Globe className="w-6 h-6 text-emerald-600" />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-xl">{contato.nome}</CardTitle>
                          <CardDescription>
                            Plano {contato.plano_interesse} • {formatDate(contato.created_at)}
                          </CardDescription>
                        </div>
                      </div>
                      {getStatusBadge(contato.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {/* Contato */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Mail className="w-4 h-4 mr-2" />
                          Contato
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center">
                            <Mail className="w-4 h-4 text-gray-400 mr-2" />
                            <a href={`mailto:${contato.email}`} className="text-blue-600 hover:underline">
                              {contato.email}
                            </a>
                          </div>
                          <div className="flex items-center">
                            <Phone className="w-4 h-4 text-gray-400 mr-2" />
                            <a href={`tel:${contato.telefone}`} className="text-blue-600 hover:underline">
                              {contato.telefone}
                            </a>
                          </div>
                          {contato.whatsapp && (
                            <div className="flex items-center">
                              <MessageCircle className="w-4 h-4 text-gray-400 mr-2" />
                              <a 
                                href={`https://wa.me/${contato.whatsapp.replace(/\D/g, '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-green-600 hover:underline"
                              >
                                {contato.whatsapp}
                              </a>
                            </div>
                          )}
                          {contato.horario_preferido && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 text-gray-400 mr-2" />
                              <span className="text-gray-600">
                                {contato.horario_preferido} {contato.melhor_dia && `• ${contato.melhor_dia}`}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Qualificação */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <DollarSign className="w-4 h-4 mr-2" />
                          Qualificação
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Patrimônio:</span>
                            <span className="ml-2 font-medium">
                              {getPatrimonioLabel(contato.patrimonio_total)}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Experiência:</span>
                            <span className="ml-2 font-medium">
                              {getExperienciaLabel(contato.experiencia_investimentos)}
                            </span>
                          </div>
                          {contato.renda_mensal && (
                            <div>
                              <span className="text-gray-500">Renda:</span>
                              <span className="ml-2 font-medium">{contato.renda_mensal}</span>
                            </div>
                          )}
                          {contato.tem_consultor && (
                            <div>
                              <span className="text-gray-500">Tem consultor:</span>
                              <span className="ml-2 font-medium">
                                {contato.tem_consultor === 'sim' ? 'Sim' : 'Não'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      {/* Objetivos */}
                      <div className="space-y-3">
                        <h4 className="font-semibold text-gray-900 flex items-center">
                          <Target className="w-4 h-4 mr-2" />
                          Objetivos
                        </h4>
                        <div className="space-y-2 text-sm">
                          <div>
                            <span className="text-gray-500">Horizonte:</span>
                            <span className="ml-2 font-medium">{contato.horizonte_tempo}</span>
                          </div>
                          <div>
                            <p className="text-gray-600">{contato.objetivo_principal}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informações Adicionais */}
                    {(contato.principais_investimentos || contato.observacoes) && (
                      <div className="mt-6 pt-6 border-t border-gray-200">
                        {contato.principais_investimentos && (
                          <div className="mb-4">
                            <h5 className="font-medium text-gray-900 mb-2">Principais Investimentos:</h5>
                            <p className="text-sm text-gray-600">{contato.principais_investimentos}</p>
                          </div>
                        )}
                        {contato.observacoes && (
                          <div>
                            <h5 className="font-medium text-gray-900 mb-2">Observações:</h5>
                            <p className="text-sm text-gray-600">{contato.observacoes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 