/**
 * Types for Enhanced MCP System
 * Tipos para o sistema MCP aprimorado
 */

export interface MCPConnection {
  id: string;
  name: string;
  type: 'database' | 'storage' | 'reasoning' | 'external' | 'api';
  status: 'active' | 'inactive' | 'error';
  capabilities: string[];
  healthCheck: () => Promise<{status: string, message?: string}>;
  execute: (request: MCPRequest) => Promise<MCPResponse>;
}

export interface MCPRequest {
  action: string;
  params: Record<string, any>;
  timeout?: number;
  priority?: 'low' | 'normal' | 'high';
  metadata?: Record<string, any>;
}

export interface MCPResponse {
  success: boolean;
  data?: any;
  error?: string;
  timestamp: string;
  execution_time?: number;
  metadata?: Record<string, any>;
}

export interface MCPHealthStatus {
  connection_id: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  last_check: string;
  response_time?: number;
  error_count?: number;
  message?: string;
}

export interface MCPMetrics {
  total_requests: number;
  successful_requests: number;
  failed_requests: number;
  average_response_time: number;
  uptime_percentage: number;
  last_updated: string;
}

export interface EnhancedMCPConfig {
  retry_config: {
    max_retries: number;
    base_delay: number;
    max_delay: number;
  };
  timeout_config: {
    default_timeout: number;
    health_check_timeout: number;
  };
  logging_config: {
    enabled: boolean;
    level: 'debug' | 'info' | 'warn' | 'error';
  };
} 