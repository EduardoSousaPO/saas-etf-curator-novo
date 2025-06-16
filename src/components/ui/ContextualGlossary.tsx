import { useState, useEffect } from 'react';
import { findGlossaryTerm, GlossaryTerm } from '@/lib/glossary/terms';

interface ContextualGlossaryProps {
  children: string;
  className?: string;
  inline?: boolean;
}

export default function ContextualGlossary({ children, className = '', inline = false }: ContextualGlossaryProps) {
  const [processedContent, setProcessedContent] = useState<React.ReactNode>(children);

  useEffect(() => {
    const processText = (text: string) => {
      // Divide o texto em palavras preservando espaços
      const words = text.split(/(\s+)/);
      
      const processed = words.map((word, index) => {
        // Se for apenas espaço, retorna como está
        if (/^\s+$/.test(word)) {
          return word;
        }
        
        const term = findGlossaryTerm(word);
        if (term) {
          return (
            <GlossaryTooltip key={index} term={term} inline={inline}>
              <span className="underline decoration-dotted decoration-blue-500 cursor-help text-blue-600 hover:text-blue-800">
                {word}
              </span>
            </GlossaryTooltip>
          );
        }
        return word;
      });
      
      return processed;
    };

    setProcessedContent(processText(children));
  }, [children, inline]);

  return <span className={className}>{processedContent}</span>;
}

function GlossaryTooltip({ term, children, inline }: { term: GlossaryTerm; children: React.ReactNode; inline: boolean }) {
  const [isVisible, setIsVisible] = useState(false);

  if (inline) {
    // Versão simplificada inline sem tooltip para evitar problemas de hydratação
    return (
      <span 
        className="underline decoration-dotted decoration-blue-500 cursor-help text-blue-600 hover:text-blue-800"
        title={`${term.term}: ${term.definition}`}
      >
        {children}
      </span>
    );
  }

  return (
    <span className="relative inline-block">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
      >
        {children}
      </span>
      
      {isVisible && (
        <span className="absolute z-30 w-80 p-4 bg-white border rounded-lg shadow-xl bottom-full left-1/2 transform -translate-x-1/2 mb-2 border-gray-200 block">
          <span className="space-y-3 block">
            <span className="flex items-center justify-between">
              <span className="font-semibold text-lg text-gray-900">{term.term}</span>
              <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                {term.category}
              </span>
            </span>
            
            <span className="space-y-2 block">
              <span className="text-sm text-gray-700 block">{term.definition}</span>
              
              {term.example && (
                <span className="bg-blue-50 p-3 rounded border-l-4 border-blue-400 block">
                  <span className="text-xs text-blue-800 block">
                    <span className="font-medium">💡 Exemplo:</span> {term.example}
                  </span>
                </span>
              )}
              
              <span className="text-xs text-gray-500 block">
                Categoria: <span className="capitalize">{term.category}</span>
              </span>
            </span>
          </span>
          
          {/* Seta do tooltip */}
          <span className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-white"></span>
        </span>
      )}
    </span>
  );
} 