"use client"

import * as React from "react"
import * as TooltipPrimitive from "@radix-ui/react-tooltip"
import { HelpCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"

const TooltipProvider = TooltipPrimitive.Provider

const Tooltip = TooltipPrimitive.Root

const TooltipTrigger = TooltipPrimitive.Trigger

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      "z-50 overflow-hidden rounded-md border bg-popover px-3 py-1.5 text-sm text-popover-foreground shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2",
      className
    )}
    {...props}
  />
))
TooltipContent.displayName = TooltipPrimitive.Content.displayName

// Tooltip educativo com ícone de ajuda
interface EducationalTooltipProps {
  content: string
  title?: string
  children?: React.ReactNode
  side?: "top" | "right" | "bottom" | "left"
  className?: string
}

const EducationalTooltip = ({ 
  content, 
  title, 
  children, 
  side = "top",
  className 
}: EducationalTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {children || (
            <button className={cn("text-gray-400 hover:text-gray-600 transition-colors", className)}>
              <HelpCircle className="w-4 h-4" />
            </button>
          )}
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-xs">
          {title && (
            <div className="font-semibold text-gray-900 mb-1">{title}</div>
          )}
          <div className="text-gray-700">{content}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Tooltip inline para termos técnicos
interface InlineTooltipProps {
  term: string
  explanation: string
  children: React.ReactNode
}

const InlineTooltip = ({ term, explanation, children }: InlineTooltipProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="underline decoration-dotted cursor-help text-blue-600 hover:text-blue-800">
            {children}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <div className="font-semibold text-gray-900 mb-1">{term}</div>
          <div className="text-gray-700">{explanation}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Definições educativas comuns
const educationalDefinitions = {
  // Métricas financeiras
  'total_return': {
    term: 'Quanto você ganhou',
    explanation: 'É a diferença entre o que você tem hoje e o que você colocou. Se você colocou $1000 e tem $1200, ganhou $200.'
  },
  'return_percentage': {
    term: 'Porcentagem de ganho',
    explanation: 'Quanto você ganhou em porcentagem. Se colocou $100 e tem $110, ganhou 10%.'
  },
  'volatility': {
    term: 'Variação esperada',
    explanation: 'O quanto seu dinheiro pode subir ou descer normalmente. 20% significa que pode variar até 20% para mais ou para menos.'
  },
  'sharpe_ratio': {
    term: 'Qualidade do retorno',
    explanation: 'Mede se o ganho compensa o risco. Maior que 1 é bom, maior que 2 é excelente.'
  },
  'max_drawdown': {
    term: 'Maior queda já vista',
    explanation: 'A maior perda que esse investimento já teve. Se foi -30%, significa que em algum momento perdeu 30% do valor.'
  },
  'expense_ratio': {
    term: 'Taxa anual',
    explanation: 'Quanto você paga por ano para manter o investimento. 0.1% significa $1 para cada $1000 investidos.'
  },
  'dividend_yield': {
    term: 'Rendimento anual',
    explanation: 'Quanto você recebe por ano em dividendos. 2% significa que recebe $20 para cada $1000 investidos.'
  },
  'rebalancing': {
    term: 'Manter equilibrado',
    explanation: 'Ajustar sua carteira para manter as proporções ideais. Se uma parte cresceu muito, vende um pouco e compra da que cresceu menos.'
  },
  'allocation': {
    term: 'Distribuição do dinheiro',
    explanation: 'Como seu dinheiro está dividido entre diferentes investimentos. Por exemplo: 60% em ações, 40% em bonds.'
  },
  'etf': {
    term: 'ETF (Exchange Traded Fund)',
    explanation: 'É como uma cesta com vários investimentos dentro. Quando você compra um ETF, está comprando pedacinhos de muitas empresas de uma vez.'
  }
}

export { 
  Tooltip, 
  TooltipTrigger, 
  TooltipContent, 
  TooltipProvider,
  EducationalTooltip,
  InlineTooltip,
  educationalDefinitions
}
