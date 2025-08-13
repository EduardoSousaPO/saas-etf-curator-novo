"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { 
  Home, 
  Umbrella, 
  GraduationCap,
  TrendingUp,
  Loader2,
  CheckCircle,
  ArrowRight
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface SimplifiedOnboardingProps {
  onComplete?: (planId: string) => void
}

type Objective = 'house' | 'retirement' | 'education' | 'growth'
type RiskLevel = 'slow' | 'balanced' | 'fast'

const OBJECTIVES = [
  {
    id: 'house' as const,
    icon: Home,
    title: '🏠 Comprar casa',
    subtitle: 'Juntar dinheiro para entrada (5-10 anos)',
    timeHorizon: 7,
    defaultRisk: 'balanced' as const
  },
  {
    id: 'retirement' as const,
    icon: Umbrella,
    title: '🏖️ Aposentadoria',
    subtitle: 'Viver bem no futuro (20+ anos)',
    timeHorizon: 25,
    defaultRisk: 'balanced' as const
  },
  {
    id: 'education' as const,
    icon: GraduationCap,
    title: '🎓 Estudar',
    subtitle: 'Faculdade, curso, MBA (2-5 anos)',
    timeHorizon: 4,
    defaultRisk: 'slow' as const
  },
  {
    id: 'growth' as const,
    icon: TrendingUp,
    title: '💰 Fazer dinheiro crescer',
    subtitle: 'Investir para multiplicar (10+ anos)',
    timeHorizon: 15,
    defaultRisk: 'fast' as const
  }
]

const RISK_LEVELS = [
  {
    id: 'slow' as const,
    title: 'Crescer devagar',
    subtitle: 'Mais seguro, menos variação',
    description: 'Seu dinheiro pode variar até 10% para cima ou para baixo',
    color: 'bg-green-100 border-green-300 text-green-800'
  },
  {
    id: 'balanced' as const,
    title: 'Crescer no meio termo',
    subtitle: 'Equilíbrio entre segurança e crescimento',
    description: 'Seu dinheiro pode variar até 18% para cima ou para baixo',
    color: 'bg-blue-100 border-blue-300 text-blue-800'
  },
  {
    id: 'fast' as const,
    title: 'Crescer mais rápido',
    subtitle: 'Mais potencial, mais variação',
    description: 'Seu dinheiro pode variar até 30% para cima ou para baixo',
    color: 'bg-purple-100 border-purple-300 text-purple-800'
  }
]

export default function SimplifiedOnboarding({ onComplete }: SimplifiedOnboardingProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Estados do formulário
  const [selectedObjective, setSelectedObjective] = useState<Objective | null>(null)
  const [monthlyAmount, setMonthlyAmount] = useState([500])
  const [selectedRisk, setSelectedRisk] = useState<RiskLevel | null>(null)
  const [autoDeposits, setAutoDeposits] = useState(true)
  const [autoRebalance, setAutoRebalance] = useState(true)

  // Atualizar risco padrão quando objetivo muda
  const handleObjectiveChange = (objective: Objective) => {
    setSelectedObjective(objective)
    const objData = OBJECTIVES.find(o => o.id === objective)
    if (objData) {
      setSelectedRisk(objData.defaultRisk)
    }
  }

  const handleSubmit = async () => {
    if (!user || !selectedObjective || !selectedRisk) return

    setLoading(true)

    try {
      // 1. Criar carteira otimizada
      const portfolioResponse = await fetch('/api/portfolio/unified-master', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          objective: selectedObjective,
          initialAmount: 0,
          monthlyAmount: monthlyAmount[0],
          timeHorizon: OBJECTIVES.find(o => o.id === selectedObjective)?.timeHorizon || 10,
          currency: 'USD',
          riskProfile: selectedRisk === 'slow' ? 'conservative' : selectedRisk === 'fast' ? 'aggressive' : 'moderate'
        })
      })

      const portfolioResult = await portfolioResponse.json()
      
      if (!portfolioResult.success) {
        throw new Error('Erro ao criar carteira')
      }

      // 2. Criar plano Dashboard automaticamente (sem "Salvar como Plano")
      const planResponse = await fetch('/api/wealth/portfolio-plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user.id,
          name: `Plano ${OBJECTIVES.find(o => o.id === selectedObjective)?.title} - ${new Date().toLocaleDateString()}`,
          objective: selectedObjective,
          risk_profile: selectedRisk === 'slow' ? 'conservative' : selectedRisk === 'fast' ? 'aggressive' : 'moderate',
          base_currency: 'USD',
          etfs: portfolioResult.data.portfolio.map((etf: any) => ({
            symbol: etf.symbol,
            name: etf.name,
            allocation_percentage: etf.allocation_percent,
            band_lower: 5.0,
            band_upper: 5.0
          })),
          notes: 'Plano criado via onboarding simplificado'
        })
      })

      const planResult = await planResponse.json()
      
      if (!planResult.success) {
        throw new Error('Erro ao criar plano')
      }

      // 3. Configurar automações se solicitado
      if (autoDeposits) {
        await fetch('/api/wealth/configure-auto-deposits', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            portfolio_id: planResult.data.plan.id,
            monthly_amount: monthlyAmount[0],
            enabled: true
          })
        })
      }

      if (autoRebalance) {
        await fetch('/api/wealth/configure-auto-rebalance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            user_id: user.id,
            portfolio_id: planResult.data.plan.id,
            enabled: true,
            threshold: 5.0
          })
        })
      }

      setSuccess(true)
      
      // Redirecionar para dashboard após 2 segundos
      setTimeout(() => {
        if (onComplete) {
          onComplete(planResult.data.plan.id)
        } else {
          router.push('/dashboard')
        }
      }, 2000)

    } catch (error) {
      console.error('Erro no onboarding:', error)
      alert('Erro ao criar seu plano. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Seu plano está pronto! 🎉
            </h2>
            <p className="text-gray-600 mb-4">
              Redirecionando para seu dashboard...
            </p>
            <div className="animate-pulse text-blue-600">
              Preparando tudo para você...
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Vamos criar seu plano de investimentos
          </h1>
          <p className="text-gray-600">
            Só 3 perguntas simples e você estará investindo
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            {/* Pergunta 1: Objetivo */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                1. Qual é sua missão? 🎯
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {OBJECTIVES.map((objective) => {
                  const Icon = objective.icon
                  return (
                    <button
                      key={objective.id}
                      onClick={() => handleObjectiveChange(objective.id)}
                      className={`p-4 rounded-xl border-2 text-left transition-all ${
                        selectedObjective === objective.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <Icon className="w-6 h-6 text-blue-600 mt-1" />
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {objective.title}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {objective.subtitle}
                          </p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Pergunta 2: Valor mensal */}
            {selectedObjective && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  2. Quanto você quer investir por mês? 💰
                </h2>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 mb-2">
                      ${monthlyAmount[0]}
                    </div>
                    <p className="text-sm text-gray-600">
                      Você pode mudar isso depois
                    </p>
                  </div>
                  <Slider
                    value={monthlyAmount}
                    onValueChange={setMonthlyAmount}
                    max={5000}
                    min={100}
                    step={50}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>$100</span>
                    <span>$5.000</span>
                  </div>
                </div>
              </div>
            )}

            {/* Pergunta 3: Perfil de risco */}
            {selectedObjective && (
              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  3. Como você prefere que seu dinheiro cresça? 📈
                </h2>
                <div className="space-y-3">
                  {RISK_LEVELS.map((risk) => (
                    <button
                      key={risk.id}
                      onClick={() => setSelectedRisk(risk.id)}
                      className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                        selectedRisk === risk.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {risk.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {risk.subtitle}
                          </p>
                          <p className="text-xs text-gray-500">
                            {risk.description}
                          </p>
                        </div>
                        {selectedRisk === risk.id && (
                          <CheckCircle className="w-5 h-5 text-blue-500" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Configurações automáticas */}
            {selectedRisk && (
              <div className="mb-8 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Para facilitar sua vida: ✨
                </h3>
                <div className="space-y-3">
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={autoDeposits}
                      onChange={(e) => setAutoDeposits(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      Depositar automaticamente ${monthlyAmount[0]} todo mês
                    </span>
                  </label>
                  <label className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={autoRebalance}
                      onChange={(e) => setAutoRebalance(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <span className="text-sm text-gray-700">
                      Manter minha carteira equilibrada automaticamente
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Botão de criar plano */}
            {selectedRisk && (
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full py-3 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Criando seu plano...
                  </>
                ) : (
                  <>
                    Criar meu plano
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
