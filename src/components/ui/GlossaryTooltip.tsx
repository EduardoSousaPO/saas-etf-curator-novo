"use client";

import React, { useState } from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { HelpCircle, BookOpen } from "lucide-react";
import { getTermDefinition } from "@/lib/glossary/terms";

interface GlossaryTooltipProps {
  termKey: string;
  children?: React.ReactNode;
  showIcon?: boolean;
  className?: string;
}

export function GlossaryTooltip({ 
  termKey, 
  children, 
  showIcon = true,
  className = "" 
}: GlossaryTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const term = getTermDefinition(termKey);

  if (!term) {
    return <>{children || termKey}</>;
  }

  return (
    <TooltipProvider>
      <Tooltip open={isOpen} onOpenChange={setIsOpen}>
        <TooltipTrigger asChild>
          <span 
            className={`inline-flex items-center gap-1 cursor-help border-b border-dotted border-gray-400 hover:border-gray-600 ${className}`}
            onClick={(e) => e.preventDefault()}
          >
            {children || term.term}
            {showIcon && <HelpCircle className="w-3 h-3 text-gray-400" />}
          </span>
        </TooltipTrigger>
        <TooltipContent className="max-w-xs p-4 bg-white border shadow-lg">
          <div className="space-y-2">
            <div className="flex items-start gap-2">
              <BookOpen className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-gray-900">{term.term}</h4>
                <p className="text-sm text-gray-600 mt-1">{term.definition}</p>
              </div>
            </div>
            
            {term.relatedTerms && term.relatedTerms.length > 0 && (
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  <span className="font-medium">Termos relacionados:</span>{' '}
                  {term.relatedTerms.join(', ')}
                </p>
              </div>
            )}
            
            <div className="text-xs text-gray-400 uppercase tracking-wider">
              {term.category}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Componente para texto com múltiplos termos
interface GlossaryTextProps {
  text: string;
  terms: string[];
}

export function GlossaryText({ text, terms }: GlossaryTextProps) {
  // Criar um mapa de termos para facilitar a busca
  const termMap = new Map<string, string>();
  terms.forEach(termKey => {
    const term = getTermDefinition(termKey);
    if (term) {
      // Adicionar variações do termo
      termMap.set(term.term.toLowerCase(), termKey);
      termMap.set(termKey.toLowerCase(), termKey);
    }
  });

  // Dividir o texto em palavras e processar
  const words = text.split(/(\s+)/);
  
  return (
    <>
      {words.map((word, index) => {
        const cleanWord = word.toLowerCase().replace(/[.,!?;:()]/g, '');
        const termKey = termMap.get(cleanWord);
        
        if (termKey) {
          return (
            <GlossaryTooltip key={index} termKey={termKey} showIcon={false}>
              {word}
            </GlossaryTooltip>
          );
        }
        
        return <span key={index}>{word}</span>;
      })}
    </>
  );
} 