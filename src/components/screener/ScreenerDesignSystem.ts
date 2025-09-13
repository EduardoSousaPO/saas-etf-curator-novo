// Design System Unificado para Screeners ETFs e Stocks
// Baseado nas especificações Tesla/Wealthfront para padronização completa

export const ScreenerDesignSystem = {
  // 🎨 Paleta de Cores Padronizada
  colors: {
    primary: '#0090d8',        // Azul primário para CTAs e elementos interativos
    graphite: '#202636',       // Grafite para títulos e textos importantes
    success: '#10b981',        // Verde para valores positivos
    danger: '#ef4444',         // Vermelho para valores negativos
    warning: '#f59e0b',        // Laranja para alertas
    neutral: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',
      800: '#1f2937',
      900: '#111827'
    }
  },

  // 📝 Tipografia Hierárquica
  typography: {
    hero: 'text-5xl md:text-6xl font-light tracking-tight',
    title: 'text-3xl font-light',
    subtitle: 'text-xl font-light text-gray-600',
    heading: 'text-lg font-medium',
    body: 'text-base text-gray-700',
    caption: 'text-sm text-gray-500',
    label: 'text-sm font-medium text-gray-700'
  },

  // 🎯 Componentes Padronizados
  components: {
    // Cards uniformes
    card: {
      base: 'bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-300',
      header: 'p-6 pb-4 border-b border-gray-100',
      content: 'p-6',
      compact: 'p-4'
    },

    // Botões consistentes
    button: {
      primary: 'bg-[#0090d8] hover:bg-blue-700 text-white font-medium transition-colors duration-300',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-[#202636] font-medium transition-colors duration-300',
      ghost: 'hover:bg-gray-50 text-gray-600 hover:text-[#202636] transition-colors duration-300',
      sizes: {
        sm: 'px-3 py-2 text-sm rounded-lg',
        md: 'px-4 py-2 text-sm rounded-xl',
        lg: 'px-6 py-3 text-base rounded-xl'
      }
    },

    // Filtros interativos
    filter: {
      container: 'bg-white rounded-2xl shadow-sm border border-gray-100 p-6',
      section: 'space-y-4',
      label: 'text-sm font-medium text-[#202636] mb-2 flex items-center gap-2',
      input: 'border-gray-300 rounded-lg focus:border-[#0090d8] focus:ring-[#0090d8]',
      slider: 'w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer',
      preset: 'inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-[#0090d8] hover:text-white rounded-full text-sm font-medium transition-all duration-300 cursor-pointer'
    },

    // Tabelas otimizadas
    table: {
      container: 'overflow-x-auto',
      table: 'w-full',
      header: 'border-b border-gray-200',
      headerCell: 'py-3 px-4 font-medium text-[#202636] text-left',
      row: 'border-b border-gray-50 hover:bg-gray-50 transition-colors duration-200',
      cell: 'py-3 px-4',
      compact: 'py-2 px-3 text-sm'
    },

    // Badges e tags
    badge: {
      base: 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      sector: 'bg-blue-100 text-blue-800',
      performance: {
        positive: 'bg-green-100 text-green-800',
        negative: 'bg-red-100 text-red-800',
        neutral: 'bg-gray-100 text-gray-800'
      },
      quality: {
        high: 'bg-emerald-100 text-emerald-800',
        medium: 'bg-yellow-100 text-yellow-800',
        low: 'bg-red-100 text-red-800'
      }
    },

    // Modais padronizados
    modal: {
      overlay: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4',
      container: 'bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl',
      header: 'sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl',
      content: 'p-6 space-y-6',
      footer: 'sticky bottom-0 bg-white border-t border-gray-200 p-6 flex gap-3 rounded-b-2xl'
    }
  },

  // 📊 Formatadores de Dados
  formatters: {
    currency: (value: number | null, compact: boolean = true) => {
      if (!value) return 'N/A';
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        notation: compact ? 'compact' : 'standard',
        maximumFractionDigits: 2
      }).format(value);
    },

    percentage: (value: number | string | null, showSign: boolean = true) => {
      if (value === null || value === undefined) return 'N/A';
      
      const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
      if (isNaN(numValue)) return 'N/A';
      
      const sign = showSign && numValue > 0 ? '+' : '';
      return `${sign}${numValue.toFixed(2)}%`;
    },

    marketCap: (value: number | null) => {
      if (!value) return 'N/A';
      if (value >= 1e12) return `$${(value / 1e12).toFixed(1)}T`;
      if (value >= 1e9) return `$${(value / 1e9).toFixed(1)}B`;
      if (value >= 1e6) return `$${(value / 1e6).toFixed(1)}M`;
      return `$${value.toLocaleString()}`;
    },

    ratio: (value: number | string | null, suffix: string = 'x') => {
      if (value === null || value === undefined) return 'N/A';
      const numValue = typeof value === 'string' ? parseFloat(value) : value;
      if (isNaN(numValue)) return 'N/A';
      return `${numValue.toFixed(2)}${suffix}`;
    }
  },

  // 🎭 Ícones Setoriais
  sectorIcons: {
    'Technology': '💻',
    'Healthcare': '🏥',
    'Financial Services': '🏦',
    'Consumer Cyclical': '🛍️',
    'Communication Services': '📱',
    'Industrials': '🏭',
    'Consumer Defensive': '🛒',
    'Energy': '⚡',
    'Utilities': '💡',
    'Real Estate': '🏠',
    'Materials': '🔧',
    'default': '📊'
  },

  // 🎯 Presets de Filtros
  presets: {
    etf: [
      {
        id: 'blue-chips',
        name: 'Blue Chips',
        icon: '🏆',
        description: 'ETFs de grandes empresas estáveis',
        filters: { minAUM: 1000, maxExpenseRatio: 0.5, minMorningstarRating: 4 }
      },
      {
        id: 'dividends',
        name: 'Dividendos Altos',
        icon: '💰',
        description: 'Foco em renda passiva',
        filters: { minDividendYield: 3, assetClass: 'dividend' }
      },
      {
        id: 'growth',
        name: 'Crescimento',
        icon: '🚀',
        description: 'ETFs de crescimento acelerado',
        filters: { minReturns12m: 15, assetClass: 'growth' }
      },
      {
        id: 'low-cost',
        name: 'Baixo Custo',
        icon: '💎',
        description: 'Taxas ultra-baixas',
        filters: { maxExpenseRatio: 0.2 }
      }
    ],
    stock: [
      {
        id: 'mega-caps',
        name: 'Mega Caps',
        icon: '🏢',
        description: 'Empresas gigantes (>$200B)',
        filters: { minMarketCap: 200000000000 }
      },
      {
        id: 'dividend-aristocrats',
        name: 'Dividend Aristocrats',
        icon: '👑',
        description: 'Dividendos consistentes',
        filters: { minDividendYield: 2, minPE: 5, maxPE: 25 }
      },
      {
        id: 'value-stocks',
        name: 'Value Stocks',
        icon: '💎',
        description: 'Ações subvalorizadas',
        filters: { maxPE: 15, maxPB: 2 }
      },
      {
        id: 'tech-leaders',
        name: 'Tech Leaders',
        icon: '🚀',
        description: 'Líderes em tecnologia',
        filters: { sector: 'Technology', minMarketCap: 10000000000 }
      }
    ]
  },

  // 🔧 Utilitários
  utils: {
    getPerformanceColor: (value: number | string | null) => {
      if (value === null || value === undefined) return 'text-gray-400';
      const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : value;
      if (isNaN(numValue)) return 'text-gray-400';
      return numValue >= 0 ? 'text-green-600' : 'text-red-600';
    },

    getQualityBadge: (score: number | null) => {
      if (!score) return { label: 'N/A', className: 'bg-gray-100 text-gray-800' };
      if (score >= 80) return { label: 'Excelente', className: 'bg-green-100 text-green-800' };
      if (score >= 60) return { label: 'Boa', className: 'bg-blue-100 text-blue-800' };
      if (score >= 40) return { label: 'Regular', className: 'bg-yellow-100 text-yellow-800' };
      return { label: 'Baixa', className: 'bg-red-100 text-red-800' };
    },

    getSectorIcon: (sector: string) => {
      return ScreenerDesignSystem.sectorIcons[sector as keyof typeof ScreenerDesignSystem.sectorIcons] || ScreenerDesignSystem.sectorIcons.default;
    }
  }
};

export default ScreenerDesignSystem;

