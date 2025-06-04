import { Alert, AlertType, AlertCondition, AlertNotification } from './types';
import { ETF } from '@/types';

// Sistema em memória para demonstração
// Em produção, usar banco de dados
const alertsStorage = new Map<string, Alert>();
const notificationsStorage = new Map<string, AlertNotification>();

export class AlertEngine {
  
  // Criar novo alerta
  static createAlert(alert: Omit<Alert, 'id' | 'createdAt' | 'isTriggered'>): Alert {
    const newAlert: Alert = {
      ...alert,
      id: this.generateId(),
      createdAt: new Date(),
      isTriggered: false
    };
    
    alertsStorage.set(newAlert.id, newAlert);
    return newAlert;
  }

  // Listar alertas do usuário
  static getUserAlerts(userId: string): Alert[] {
    return Array.from(alertsStorage.values())
      .filter(alert => alert.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  // Obter alerta por ID
  static getAlert(alertId: string): Alert | undefined {
    return alertsStorage.get(alertId);
  }

  // Atualizar alerta
  static updateAlert(alertId: string, updates: Partial<Alert>): Alert | null {
    const alert = alertsStorage.get(alertId);
    if (!alert) return null;

    const updatedAlert = { ...alert, ...updates };
    alertsStorage.set(alertId, updatedAlert);
    return updatedAlert;
  }

  // Remover alerta
  static deleteAlert(alertId: string): boolean {
    return alertsStorage.delete(alertId);
  }

  // Processar alertas para um ETF específico
  static async processAlertsForETF(etf: ETF): Promise<AlertNotification[]> {
    const triggeredNotifications: AlertNotification[] = [];
    
    // Buscar todos os alertas ativos para este ETF
    const etfAlerts = Array.from(alertsStorage.values())
      .filter(alert => 
        alert.etfSymbol === etf.symbol && 
        alert.isActive && 
        !alert.isTriggered
      );

    for (const alert of etfAlerts) {
      const isTriggered = this.checkAlertCondition(alert, etf);
      
      if (isTriggered) {
        // Marcar alerta como disparado
        alert.isTriggered = true;
        alert.triggeredAt = new Date();
        alertsStorage.set(alert.id, alert);

        // Criar notificação
        const notification = this.createNotification(alert, etf);
        triggeredNotifications.push(notification);
      } else {
        // Atualizar valor atual
        const currentValue = this.getCurrentValue(alert, etf);
        alert.currentValue = currentValue || undefined;
        alert.lastChecked = new Date();
        alertsStorage.set(alert.id, alert);
      }
    }

    return triggeredNotifications;
  }

  // Verificar se condição do alerta foi atendida
  private static checkAlertCondition(alert: Alert, etf: ETF): boolean {
    const currentValue = this.getCurrentValue(alert, etf);
    if (currentValue === null) return false;

    const { condition, targetValue, currentValue: previousValue } = alert;

    switch (condition) {
      case 'above':
        return currentValue > targetValue;
        
      case 'below':
        return currentValue < targetValue;
        
      case 'increase_by':
        if (previousValue) {
          const percentChange = ((currentValue - previousValue) / previousValue) * 100;
          return percentChange >= targetValue;
        }
        return false;
        
      case 'decrease_by':
        if (previousValue) {
          const percentChange = ((previousValue - currentValue) / previousValue) * 100;
          return percentChange >= targetValue;
        }
        return false;
        
      case 'crosses_above':
        return previousValue !== undefined && 
               previousValue <= targetValue && 
               currentValue > targetValue;
               
      case 'crosses_below':
        return previousValue !== undefined && 
               previousValue >= targetValue && 
               currentValue < targetValue;
               
      default:
        return false;
    }
  }

  // Obter valor atual baseado no tipo de alerta
  private static getCurrentValue(alert: Alert, etf: ETF): number | null {
    switch (alert.type) {
      case 'price_change':
      case 'price_target':
        // Para demonstração, usando returns_12m como proxy de preço
        return etf.returns_12m || 0;
        
      case 'volatility':
        return etf.volatility_12m || 0;
        
      case 'volume':
        return etf.volume || 0;
        
      case 'dividend_yield':
        return etf.dividend_yield || 0;
        
      case 'expense_ratio':
        return etf.expense_ratio || 0;
        
      case 'returns_12m':
        return etf.returns_12m || 0;
        
      case 'sharpe_ratio':
        return etf.sharpe_12m || 0;
        
      default:
        return null;
    }
  }

  // Criar notificação quando alerta é disparado
  private static createNotification(alert: Alert, etf: ETF): AlertNotification {
    const currentValue = this.getCurrentValue(alert, etf) || 0;
    const previousValue = alert.currentValue;
    
    let changePercentage;
    if (previousValue && previousValue !== 0) {
      changePercentage = ((currentValue - previousValue) / previousValue) * 100;
    }

    const message = this.generateAlertMessage(alert, currentValue, changePercentage);

    const notification: AlertNotification = {
      id: this.generateId(),
      alertId: alert.id,
      etfSymbol: alert.etfSymbol,
      etfName: alert.etfName,
      type: alert.type,
      message,
      triggeredAt: new Date(),
      isRead: false,
      data: {
        previousValue,
        currentValue,
        targetValue: alert.targetValue,
        changePercentage
      }
    };

    notificationsStorage.set(notification.id, notification);
    return notification;
  }

  // Gerar mensagem de alerta personalizada
  private static generateAlertMessage(
    alert: Alert, 
    currentValue: number, 
    changePercentage?: number
  ): string {
    const { etfName, type, condition, targetValue } = alert;
    
    const formatValue = (value: number, type: AlertType) => {
      switch (type) {
        case 'volatility':
        case 'dividend_yield':
        case 'returns_12m':
        case 'price_change':
          return `${value.toFixed(2)}%`;
        case 'expense_ratio':
          return `${(value * 100).toFixed(2)}%`;
        case 'sharpe_ratio':
          return value.toFixed(2);
        default:
          return value.toLocaleString();
      }
    };

    const typeLabel = {
      price_change: 'preço',
      price_target: 'preço',
      volatility: 'volatilidade',
      volume: 'volume',
      dividend_yield: 'dividend yield',
      expense_ratio: 'expense ratio',
      returns_12m: 'retorno 12m',
      sharpe_ratio: 'índice Sharpe'
    }[type];

    const conditionLabel = {
      above: 'ultrapassou',
      below: 'caiu abaixo de',
      increase_by: 'aumentou em',
      decrease_by: 'diminuiu em',
      crosses_above: 'cruzou para cima de',
      crosses_below: 'cruzou para baixo de'
    }[condition];

    let message = `${etfName} (${alert.etfSymbol}): ${typeLabel} ${conditionLabel} ${formatValue(targetValue, type)}`;
    
    if (changePercentage !== undefined) {
      const direction = changePercentage >= 0 ? 'subiu' : 'caiu';
      message += `. Variação: ${direction} ${Math.abs(changePercentage).toFixed(2)}%`;
    }
    
    message += `. Valor atual: ${formatValue(currentValue, type)}.`;

    return message;
  }

  // Obter notificações do usuário
  static getUserNotifications(userId: string): AlertNotification[] {
    // Buscar alertas do usuário primeiro
    const userAlerts = this.getUserAlerts(userId);
    const alertIds = userAlerts.map(alert => alert.id);
    
    return Array.from(notificationsStorage.values())
      .filter(notification => alertIds.includes(notification.alertId))
      .sort((a, b) => b.triggeredAt.getTime() - a.triggeredAt.getTime());
  }

  // Marcar notificação como lida
  static markNotificationAsRead(notificationId: string): boolean {
    const notification = notificationsStorage.get(notificationId);
    if (!notification) return false;
    
    notification.isRead = true;
    notificationsStorage.set(notificationId, notification);
    return true;
  }

  // Marcar todas as notificações como lidas
  static markAllNotificationsAsRead(userId: string): number {
    const notifications = this.getUserNotifications(userId);
    let count = 0;
    
    notifications.forEach(notification => {
      if (!notification.isRead) {
        notification.isRead = true;
        notificationsStorage.set(notification.id, notification);
        count++;
      }
    });
    
    return count;
  }

  // Processar todos os alertas (seria chamado periodicamente)
  static async processAllAlerts(etfs: ETF[]): Promise<AlertNotification[]> {
    const allNotifications: AlertNotification[] = [];
    
    for (const etf of etfs) {
      const notifications = await this.processAlertsForETF(etf);
      allNotifications.push(...notifications);
    }
    
    return allNotifications;
  }

  // Estatísticas de alertas
  static getAlertStats(userId: string) {
    const userAlerts = this.getUserAlerts(userId);
    const notifications = this.getUserNotifications(userId);
    
    return {
      totalAlerts: userAlerts.length,
      activeAlerts: userAlerts.filter(alert => alert.isActive).length,
      triggeredAlerts: userAlerts.filter(alert => alert.isTriggered).length,
      totalNotifications: notifications.length,
      unreadNotifications: notifications.filter(n => !n.isRead).length,
      alertsByType: userAlerts.reduce((acc, alert) => {
        acc[alert.type] = (acc[alert.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>)
    };
  }

  // Gerar ID único
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  // Limpar dados (para testing)
  static clearAllData(): void {
    alertsStorage.clear();
    notificationsStorage.clear();
  }
} 