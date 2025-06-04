// src/components/landing/DisclaimerBanner.tsx
"use client";

export default function DisclaimerBanner() {
  return (
    <footer className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-black">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
            <span className="font-medium">Aviso Legal:</span> Este conteúdo é de natureza educacional e informativa. 
            Não constitui recomendação individual de investimentos conforme ICVM 592. 
            Investimentos em ETFs envolvem riscos e podem resultar em perdas. 
            Consulte sempre um profissional qualificado antes de tomar decisões de investimento.
          </p>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-800 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm text-gray-500 dark:text-gray-500 font-light">
            © 2025 ETFCurator. Todos os direitos reservados.
          </div>
          
          <div className="flex space-x-6 text-sm">
            <a href="/privacy" className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-light">
              Privacidade
            </a>
            <a href="/terms" className="text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors font-light">
              Termos
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

