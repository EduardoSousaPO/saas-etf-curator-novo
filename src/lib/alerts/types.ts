export interface Alert {
  id: string;
  userId: string;
  etfSymbol: string;
  etfName: string;
  type: AlertType;
  condition: AlertCondition;
  targetValue: number;
  currentValue?: number;
  isActive: boolean;
  isTriggered: boolean;
  createdAt: Date;
  triggeredAt?: Date;
  lastChecked?: Date;
  notificationMethods: NotificationMethod[];
  description?: string;
}

export type AlertType = 
  | 'price_change'       // Mudança de preço
  | 'price_target'       // Meta de preço
  | 'volatility'         // Volatilidade
  | 'volume'             // Volume anômalo
  | 'dividend_yield'     // Rendimento de dividendos
  | 'expense_ratio'      // Taxa de administração
  | 'returns_12m'        // Retorno 12 meses
  | 'sharpe_ratio';      // Índice Sharpe

export type AlertCondition = 
  | 'above'              // Acima de
  | 'below'              // Abaixo de
  | 'increase_by'        // Aumentar em %
  | 'decrease_by'        // Diminuir em %
  | 'crosses_above'      // Cruzar para cima
  | 'crosses_below';     // Cruzar para baixo

export type NotificationMethod = 
  | 'in_app'             // Notificação na aplicação
  | 'email'              // Email (futuro)
  | 'push';              // Push notification (futuro)

export interface AlertNotification {
  id: string;
  alertId: string;
  etfSymbol: string;
  etfName: string;
  type: AlertType;
  message: string;
  triggeredAt: Date;
  isRead: boolean;
  data: {
    previousValue?: number;
    currentValue: number;
    targetValue: number;
    changePercentage?: number;
  };
}

export interface AlertTemplate {
  id: string;
  name: string;
  description: string;
  type: AlertType;
  condition: AlertCondition;
  suggestedValue?: number;
  isPopular: boolean;
  profileRecommended?: string[]; // Para quais perfis é recomendado
}

export const ALERT_TEMPLATES: AlertTemplate[] = [
  {
    id: 'price_drop_5',
    name: 'Queda de 5%',
    description: 'Alerta quando o ETF cair 5% ou mais',
    type: 'price_change',
    condition: 'decrease_by',
    suggestedValue: 5,
    isPopular: true,
    profileRecommended: ['conservative', 'moderate']
  },
  {
    id: 'price_rise_10',
    name: 'Alta de 10%',
    description: 'Alerta quando o ETF subir 10% ou mais',
    type: 'price_change',
    condition: 'increase_by',
    suggestedValue: 10,
    isPopular: true,
    profileRecommended: ['aggressive', 'moderate']
  },
  {
    id: 'high_volatility',
    name: 'Alta Volatilidade',
    description: 'Alerta quando volatilidade ultrapassar 25%',
    type: 'volatility',
    condition: 'above',
    suggestedValue: 25,
    isPopular: true,
    profileRecommended: ['conservative']
  },
  {
    id: 'low_volatility',
    name: 'Baixa Volatilidade',
    description: 'Oportunidade: volatilidade abaixo de 10%',
    type: 'volatility',
    condition: 'below',
    suggestedValue: 10,
    isPopular: false,
    profileRecommended: ['aggressive']
  },
  {
    id: 'dividend_yield_increase',
    name: 'Aumento de Dividendos',
    description: 'Alerta quando dividend yield superar 4%',
    type: 'dividend_yield',
    condition: 'above',
    suggestedValue: 4,
    isPopular: true,
    profileRecommended: ['conservative']
  },
  {
    id: 'expense_ratio_change',
    name: 'Taxa Alta',
    description: 'Alerta quando expense ratio ultrapassar 0.5%',
    type: 'expense_ratio',
    condition: 'above',
    suggestedValue: 0.5,
    isPopular: false,
    profileRecommended: ['moderate', 'aggressive']
  }
];

export const ALERT_TYPE_LABELS: Record<AlertType, string> = {
  price_change: 'Mudança de Preço',
  price_target: 'Meta de Preço',
  volatility: 'Volatilidade',
  volume: 'Volume',
  dividend_yield: 'Dividend Yield',
  expense_ratio: 'Expense Ratio',
  returns_12m: 'Retorno 12m',
  sharpe_ratio: 'Índice Sharpe'
};

export const ALERT_CONDITION_LABELS: Record<AlertCondition, string> = {
  above: 'Acima de',
  below: 'Abaixo de',
  increase_by: 'Aumentar em',
  decrease_by: 'Diminuir em',
  crosses_above: 'Cruzar para cima',
  crosses_below: 'Cruzar para baixo'
};

export interface AlertSettings {
  userId: string;
  enableInAppNotifications: boolean;
  enableEmailNotifications: boolean;
  enablePushNotifications: boolean;
  checkFrequency: 'realtime' | '15min' | '1hour' | '4hours' | 'daily';
  maxAlertsPerDay: number;
  quietHours: {
    enabled: boolean;
    startTime: string; // HH:MM
    endTime: string;   // HH:MM
  };
} 