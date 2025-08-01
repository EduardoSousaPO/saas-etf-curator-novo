import jsPDF from 'jspdf';
import { ETF } from '@/types/etf';

interface PDFExportOptions {
  includeCharts?: boolean;
  includeFullHoldings?: boolean;
  theme?: 'light' | 'dark';
  language?: 'pt' | 'en';
}

export class ETFPDFExporter {
  private doc: jsPDF;
  private pageWidth: number;
  private pageHeight: number;
  private margin: number;
  private currentY: number;
  private lineHeight: number;

  constructor() {
    this.doc = new jsPDF('p', 'mm', 'a4');
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.margin = 20;
    this.currentY = this.margin;
    this.lineHeight = 7;
  }

  /**
   * Formatar valores monetários
   */
  private formatCurrency(value: number | null | undefined, currency = 'USD'): string {
    if (!value || isNaN(value)) return 'N/A';
    
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  }

  /**
   * Formatar percentuais
   */
  private formatPercentage(value: number | null | undefined): string {
    if (!value || isNaN(value)) return 'N/A';
    return `${(value * 100).toFixed(2)}%`;
  }

  /**
   * Formatar números grandes (AUM, Volume)
   */
  private formatLargeNumber(value: number | null | undefined): string {
    if (!value || isNaN(value)) return 'N/A';
    
    if (value >= 1e9) {
      return `$${(value / 1e9).toFixed(1)}B`;
    } else if (value >= 1e6) {
      return `$${(value / 1e6).toFixed(1)}M`;
    } else if (value >= 1e3) {
      return `$${(value / 1e3).toFixed(1)}K`;
    }
    return `$${value.toFixed(0)}`;
  }

  /**
   * Adicionar nova página se necessário
   */
  private checkPageBreak(neededSpace = 20): void {
    if (this.currentY + neededSpace > this.pageHeight - this.margin) {
      this.doc.addPage();
      this.currentY = this.margin;
    }
  }

  /**
   * Adicionar cabeçalho do documento
   */
  private addHeader(etf: ETF): void {
    // Logo/Título
    this.doc.setFontSize(24);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ETF CURATOR', this.margin, this.currentY);
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Relatório Detalhado de ETF', this.margin, this.currentY + 8);
    
    // Data de geração
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR');
    this.doc.text(`Gerado em: ${dateStr}`, this.pageWidth - this.margin - 50, this.currentY + 8);
    
    this.currentY += 25;
    
    // Linha separadora
    this.doc.setDrawColor(0, 144, 216); // Azul do ETF Curator
    this.doc.setLineWidth(0.5);
    this.doc.line(this.margin, this.currentY, this.pageWidth - this.margin, this.currentY);
    this.currentY += 10;
  }

  /**
   * Adicionar informações básicas do ETF
   */
  private addBasicInfo(etf: ETF): void {
    this.checkPageBreak(40);
    
    // Título do ETF
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(etf.symbol, this.margin, this.currentY);
    
    this.doc.setFontSize(14);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(etf.name || 'Nome não disponível', this.margin, this.currentY + 8);
    
    this.currentY += 20;
    
    // Informações básicas em duas colunas
    const leftCol = this.margin;
    const rightCol = this.pageWidth / 2;
    
    const basicInfo = [
      ['Empresa:', etf.etfcompany || 'N/A'],
      ['Classe de Ativo:', etf.assetclass || 'N/A'],
      ['Tipo de ETF:', etf.etf_type || 'N/A'],
      ['Domicílio:', etf.domicile || 'N/A'],
      ['Data de Criação:', etf.inceptiondate ? new Date(etf.inceptiondate).toLocaleDateString('pt-BR') : 'N/A'],
      ['ISIN:', etf.isin || 'N/A']
    ];
    
    this.doc.setFontSize(10);
    basicInfo.forEach((info, index) => {
      const yPos = this.currentY + (index * this.lineHeight);
      const xPos = index % 2 === 0 ? leftCol : rightCol;
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(info[0], xPos, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(info[1], xPos + 35, yPos);
    });
    
    this.currentY += (Math.ceil(basicInfo.length / 2) * this.lineHeight) + 10;
  }

  /**
   * Adicionar métricas financeiras
   */
  private addFinancialMetrics(etf: ETF): void {
    this.checkPageBreak(50);
    
    // Título da seção
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Métricas Financeiras', this.margin, this.currentY);
    this.currentY += 12;
    
    // Métricas principais
    const metrics = [
      ['Taxa de Administração:', this.formatPercentage(etf.expenseratio)],
      ['Patrimônio Líquido:', this.formatLargeNumber(etf.totalasset)],
      ['Volume Médio:', this.formatLargeNumber(etf.avgvolume)],
      ['NAV:', this.formatCurrency(etf.nav, etf.navcurrency || 'USD')],
      ['Número de Holdings:', etf.holdingscount?.toString() || 'N/A'],
      ['Beta 12m:', etf.beta_12m?.toFixed(2) || 'N/A'],
      ['Tracking Error:', this.formatPercentage(etf.tracking_error)],
      ['R-Squared:', etf.r_squared?.toFixed(2) || 'N/A']
    ];
    
    this.doc.setFontSize(10);
    metrics.forEach((metric, index) => {
      const yPos = this.currentY + (index * this.lineHeight);
      const xPos = index % 2 === 0 ? this.margin : this.pageWidth / 2;
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric[0], xPos, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric[1], xPos + 45, yPos);
    });
    
    this.currentY += (Math.ceil(metrics.length / 2) * this.lineHeight) + 15;
  }

  /**
   * Adicionar métricas de performance
   */
  private addPerformanceMetrics(etf: ETF): void {
    this.checkPageBreak(50);
    
    // Título da seção
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Performance e Risco', this.margin, this.currentY);
    this.currentY += 12;
    
    // Retornos
    const returns = [
      ['Retorno 12m:', this.formatPercentage(etf.returns_12m)],
      ['Retorno 24m:', this.formatPercentage(etf.returns_24m)],
      ['Retorno 36m:', this.formatPercentage(etf.returns_36m)],
      ['Retorno 5 anos:', this.formatPercentage(etf.returns_5y)],
      ['Retorno 10 anos:', this.formatPercentage(etf.ten_year_return)]
    ];
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Retornos:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    returns.forEach((ret, index) => {
      const yPos = this.currentY + (index * this.lineHeight);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(ret[0], this.margin + 5, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(ret[1], this.margin + 45, yPos);
    });
    
    this.currentY += (returns.length * this.lineHeight) + 10;
    
    // Métricas de risco
    const riskMetrics = [
      ['Volatilidade 12m:', this.formatPercentage(etf.volatility_12m)],
      ['Volatilidade 24m:', this.formatPercentage(etf.volatility_24m)],
      ['Volatilidade 36m:', this.formatPercentage(etf.volatility_36m)],
      ['Sharpe Ratio 12m:', etf.sharpe_12m?.toFixed(2) || 'N/A'],
      ['Sharpe Ratio 24m:', etf.sharpe_24m?.toFixed(2) || 'N/A'],
      ['Max Drawdown:', this.formatPercentage(etf.max_drawdown)]
    ];
    
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Métricas de Risco:', this.margin, this.currentY);
    this.currentY += 8;
    
    this.doc.setFontSize(10);
    riskMetrics.forEach((metric, index) => {
      const yPos = this.currentY + (index * this.lineHeight);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(metric[0], this.margin + 5, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(metric[1], this.margin + 50, yPos);
    });
    
    this.currentY += (riskMetrics.length * this.lineHeight) + 15;
  }

  /**
   * Adicionar informações de dividendos
   */
  private addDividendInfo(etf: ETF): void {
    if (!etf.dividends_12m && !etf.dividends_24m && !etf.dividends_36m) return;
    
    this.checkPageBreak(30);
    
    // Título da seção
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Dividendos', this.margin, this.currentY);
    this.currentY += 12;
    
    const dividends = [
      ['Dividendos 12m:', this.formatCurrency(etf.dividends_12m)],
      ['Dividendos 24m:', this.formatCurrency(etf.dividends_24m)],
      ['Dividendos 36m:', this.formatCurrency(etf.dividends_36m)],
      ['Dividendos Históricos:', this.formatCurrency(etf.dividends_all_time)]
    ];
    
    this.doc.setFontSize(10);
    dividends.forEach((div, index) => {
      const yPos = this.currentY + (index * this.lineHeight);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(div[0], this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(div[1], this.margin + 50, yPos);
    });
    
    this.currentY += (dividends.length * this.lineHeight) + 15;
  }

  /**
   * Adicionar alocação setorial
   */
  private addSectorAllocation(etf: ETF): void {
    if (!etf.sector_allocation) return;
    
    this.checkPageBreak(50);
    
    // Título da seção
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Alocação Setorial', this.margin, this.currentY);
    this.currentY += 12;
    
    try {
      const sectors = typeof etf.sector_allocation === 'string' 
        ? JSON.parse(etf.sector_allocation) 
        : etf.sector_allocation;
      
      if (sectors && typeof sectors === 'object') {
        this.doc.setFontSize(10);
        Object.entries(sectors).forEach(([sector, allocation], index) => {
          const yPos = this.currentY + (index * this.lineHeight);
          
          this.doc.setFont('helvetica', 'bold');
          this.doc.text(sector, this.margin, yPos);
          this.doc.setFont('helvetica', 'normal');
          this.doc.text(`${Number(allocation).toFixed(1)}%`, this.margin + 80, yPos);
        });
        
        this.currentY += (Object.keys(sectors).length * this.lineHeight) + 15;
      }
    } catch (error) {
      console.error('Erro ao processar alocação setorial:', error);
    }
  }

  /**
   * Adicionar top holdings
   */
  private addTopHoldings(etf: ETF): void {
    if (!etf.top_10_holdings) return;
    
    this.checkPageBreak(60);
    
    // Título da seção
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Principais Holdings', this.margin, this.currentY);
    this.currentY += 12;
    
    try {
      const holdings = typeof etf.top_10_holdings === 'string' 
        ? JSON.parse(etf.top_10_holdings) 
        : etf.top_10_holdings;
      
      if (Array.isArray(holdings)) {
        this.doc.setFontSize(10);
        
        // Cabeçalho da tabela
        this.doc.setFont('helvetica', 'bold');
        this.doc.text('#', this.margin, this.currentY);
        this.doc.text('Holding', this.margin + 10, this.currentY);
        this.doc.text('Peso (%)', this.margin + 120, this.currentY);
        this.currentY += this.lineHeight;
        
        // Linha separadora
        this.doc.setDrawColor(200, 200, 200);
        this.doc.line(this.margin, this.currentY - 2, this.pageWidth - this.margin, this.currentY - 2);
        
        holdings.slice(0, 10).forEach((holding: any, index) => {
          const yPos = this.currentY + (index * this.lineHeight);
          
          this.doc.setFont('helvetica', 'normal');
          this.doc.text(`${index + 1}`, this.margin, yPos);
          this.doc.text(holding.name || holding.symbol || 'N/A', this.margin + 10, yPos);
          this.doc.text(`${Number(holding.weight || holding.percentage || 0).toFixed(2)}%`, this.margin + 120, yPos);
        });
        
        this.currentY += (Math.min(holdings.length, 10) * this.lineHeight) + 15;
      }
    } catch (error) {
      console.error('Erro ao processar top holdings:', error);
    }
  }

  /**
   * Adicionar ratings e classificações
   */
  private addRatings(etf: ETF): void {
    this.checkPageBreak(30);
    
    // Título da seção
    this.doc.setFontSize(16);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Ratings e Classificações', this.margin, this.currentY);
    this.currentY += 12;
    
    const ratings = [
      ['Morningstar Rating:', etf.morningstar_rating ? `${etf.morningstar_rating}/5 estrelas` : 'N/A'],
      ['Sustainability Rating:', etf.sustainability_rating ? `${etf.sustainability_rating}/5` : 'N/A'],
      ['Categoria de Tamanho:', etf.size_category || 'N/A'],
      ['Categoria de Liquidez:', etf.liquidity_category || 'N/A'],
      ['Rating de Liquidez:', etf.liquidity_rating || 'N/A'],
      ['Score de Liquidez:', etf.liquidity_score?.toFixed(1) || 'N/A']
    ];
    
    this.doc.setFontSize(10);
    ratings.forEach((rating, index) => {
      const yPos = this.currentY + (index * this.lineHeight);
      
      this.doc.setFont('helvetica', 'bold');
      this.doc.text(rating[0], this.margin, yPos);
      this.doc.setFont('helvetica', 'normal');
      this.doc.text(rating[1], this.margin + 60, yPos);
    });
    
    this.currentY += (ratings.length * this.lineHeight) + 15;
  }

  /**
   * Adicionar rodapé
   */
  private addFooter(): void {
    const footerY = this.pageHeight - 15;
    
    this.doc.setFontSize(8);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(100, 100, 100);
    
    this.doc.text('Gerado por ETF Curator - Dados para fins informativos apenas', this.margin, footerY);
    this.doc.text(`Página ${this.doc.getNumberOfPages()}`, this.pageWidth - this.margin - 20, footerY);
    
    // Linha separadora
    this.doc.setDrawColor(200, 200, 200);
    this.doc.line(this.margin, footerY - 5, this.pageWidth - this.margin, footerY - 5);
  }

  /**
   * Exportar ETF para PDF
   */
  public async exportETF(etf: ETF, options: PDFExportOptions = {}): Promise<void> {
    try {
      // Resetar cores
      this.doc.setTextColor(0, 0, 0);
      
      // Adicionar seções
      this.addHeader(etf);
      this.addBasicInfo(etf);
      this.addFinancialMetrics(etf);
      this.addPerformanceMetrics(etf);
      this.addDividendInfo(etf);
      this.addSectorAllocation(etf);
      this.addTopHoldings(etf);
      this.addRatings(etf);
      
      // Adicionar rodapé em todas as páginas
      const totalPages = this.doc.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        this.doc.setPage(i);
        this.addFooter();
      }
      
      // Fazer download
      const fileName = `ETF_${etf.symbol}_${new Date().toISOString().slice(0, 10)}.pdf`;
      this.doc.save(fileName);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      throw new Error('Falha ao gerar relatório PDF');
    }
  }
}

/**
 * Função utilitária para exportar ETF para PDF
 */
export const exportETFToPDF = async (etf: ETF, options?: PDFExportOptions): Promise<void> => {
  const exporter = new ETFPDFExporter();
  await exporter.exportETF(etf, options);
}; 