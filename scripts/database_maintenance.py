#!/usr/bin/env python3
"""
Sistema de Manutenção Automática do Banco de Dados ETF Curator
Executa backups, verificações de qualidade e limpeza automatizada
"""

import os
import json
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import schedule
import time

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('database_maintenance.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

class DatabaseMaintenanceSystem:
    """Sistema de manutenção automática do banco de dados"""
    
    def __init__(self):
        self.project_id = "nniabnjuwzeqmflrruga"
        self.critical_tables = [
            'etfs_ativos_reais',
            'user_profiles', 
            'subscriptions',
            'payments'
        ]
        self.secondary_tables = [
            'etf_rankings',
            'etf_prices',
            'historic_etfs_dividends',
            'portfolio_allocations',
            'portfolio_simulations'
        ]
    
    def execute_sql_query(self, query: str) -> Optional[Dict]:
        """Executa query SQL via MCP Supabase"""
        try:
            # Aqui você integraria com o MCP do Supabase
            # Por enquanto, simulamos a execução
            logger.info(f"Executando query: {query[:100]}...")
            
            # Implementação real seria:
            # from mcp_supabase import execute_sql
            # return execute_sql(self.project_id, query)
            
            return {"status": "success", "data": []}
        except Exception as e:
            logger.error(f"Erro ao executar query: {e}")
            return None
    
    def create_backup(self, table_name: str, backup_type: str = "scheduled") -> bool:
        """Cria backup de uma tabela"""
        try:
            suffix = f"{backup_type}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
            query = f"SELECT create_table_backup('{table_name}', '{suffix}');"
            
            result = self.execute_sql_query(query)
            if result and result.get("status") == "success":
                logger.info(f"Backup criado para {table_name}: {suffix}")
                return True
            else:
                logger.error(f"Falha ao criar backup para {table_name}")
                return False
                
        except Exception as e:
            logger.error(f"Erro ao criar backup de {table_name}: {e}")
            return False
    
    def run_quality_check(self) -> Dict:
        """Executa verificação de qualidade dos dados"""
        try:
            query = "SELECT run_data_quality_check();"
            result = self.execute_sql_query(query)
            
            if result:
                logger.info("Verificação de qualidade executada com sucesso")
                
                # Buscar issues críticos
                issues_query = """
                SELECT table_name, metric_name, status, metric_value, details
                FROM data_quality_metrics 
                WHERE status IN ('CRITICAL', 'WARNING')
                AND DATE(checked_at) = CURRENT_DATE
                ORDER BY status DESC;
                """
                
                issues_result = self.execute_sql_query(issues_query)
                return {
                    "status": "success",
                    "issues": issues_result.get("data", []) if issues_result else []
                }
            
            return {"status": "error", "issues": []}
            
        except Exception as e:
            logger.error(f"Erro na verificação de qualidade: {e}")
            return {"status": "error", "issues": []}
    
    def cleanup_old_backups(self) -> bool:
        """Remove backups antigos"""
        try:
            query = "SELECT cleanup_old_backups();"
            result = self.execute_sql_query(query)
            
            if result and result.get("status") == "success":
                logger.info("Limpeza de backups antigos concluída")
                return True
            else:
                logger.error("Falha na limpeza de backups")
                return False
                
        except Exception as e:
            logger.error(f"Erro na limpeza de backups: {e}")
            return False
    
    def get_backup_status(self) -> List[Dict]:
        """Obtém status dos backups"""
        try:
            query = "SELECT * FROM v_backup_status ORDER BY backup_status DESC, table_name;"
            result = self.execute_sql_query(query)
            
            if result and result.get("data"):
                return result["data"]
            return []
            
        except Exception as e:
            logger.error(f"Erro ao obter status de backup: {e}")
            return []
    
    def send_alert(self, message: str, severity: str = "INFO"):
        """Envia alerta (implementar integração com email/Slack)"""
        logger.log(
            getattr(logging, severity, logging.INFO),
            f"ALERTA [{severity}]: {message}"
        )
        
        # Aqui você pode integrar com:
        # - Email (SMTP)
        # - Slack/Discord webhooks
        # - Sistema de notificações do app
    
    def daily_maintenance(self):
        """Rotina de manutenção diária"""
        logger.info("=== INICIANDO MANUTENÇÃO DIÁRIA ===")
        
        # 1. Backup de tabelas críticas
        for table in self.critical_tables:
            success = self.create_backup(table, "daily")
            if not success:
                self.send_alert(f"Falha no backup diário de {table}", "ERROR")
        
        # 2. Verificação de qualidade
        quality_result = self.run_quality_check()
        if quality_result["status"] == "success":
            critical_issues = [
                issue for issue in quality_result["issues"] 
                if issue.get("status") == "CRITICAL"
            ]
            
            if critical_issues:
                self.send_alert(
                    f"Encontrados {len(critical_issues)} issues críticos de qualidade",
                    "CRITICAL"
                )
        
        # 3. Verificar status dos backups
        backup_status = self.get_backup_status()
        overdue_backups = [
            backup for backup in backup_status 
            if backup.get("backup_status") == "OVERDUE"
        ]
        
        if overdue_backups:
            self.send_alert(
                f"{len(overdue_backups)} backups estão atrasados",
                "WARNING"
            )
        
        logger.info("=== MANUTENÇÃO DIÁRIA CONCLUÍDA ===")
    
    def weekly_maintenance(self):
        """Rotina de manutenção semanal"""
        logger.info("=== INICIANDO MANUTENÇÃO SEMANAL ===")
        
        # 1. Backup de tabelas secundárias
        for table in self.secondary_tables:
            self.create_backup(table, "weekly")
        
        # 2. Limpeza de backups antigos
        cleanup_success = self.cleanup_old_backups()
        if not cleanup_success:
            self.send_alert("Falha na limpeza de backups antigos", "WARNING")
        
        # 3. Relatório de saúde do sistema
        self.generate_health_report()
        
        logger.info("=== MANUTENÇÃO SEMANAL CONCLUÍDA ===")
    
    def generate_health_report(self):
        """Gera relatório de saúde do sistema"""
        try:
            query = "SELECT * FROM v_database_health_summary;"
            result = self.execute_sql_query(query)
            
            if result and result.get("data"):
                report = {
                    "timestamp": datetime.now().isoformat(),
                    "database_health": result["data"],
                    "backup_status": self.get_backup_status()
                }
                
                # Salvar relatório
                with open(f"health_report_{datetime.now().strftime('%Y%m%d')}.json", "w") as f:
                    json.dump(report, f, indent=2, default=str)
                
                logger.info("Relatório de saúde gerado com sucesso")
            
        except Exception as e:
            logger.error(f"Erro ao gerar relatório de saúde: {e}")
    
    def emergency_backup(self):
        """Backup de emergência de todas as tabelas críticas"""
        logger.info("=== EXECUTANDO BACKUP DE EMERGÊNCIA ===")
        
        emergency_tables = self.critical_tables + ['etf_rankings']
        
        for table in emergency_tables:
            success = self.create_backup(table, "emergency")
            if success:
                logger.info(f"Backup de emergência criado para {table}")
            else:
                logger.error(f"FALHA no backup de emergência de {table}")
        
        logger.info("=== BACKUP DE EMERGÊNCIA CONCLUÍDO ===")

def main():
    """Função principal - configura e executa o sistema de manutenção"""
    maintenance_system = DatabaseMaintenanceSystem()
    
    # Configurar agendamentos
    schedule.every().day.at("02:00").do(maintenance_system.daily_maintenance)
    schedule.every().sunday.at("03:00").do(maintenance_system.weekly_maintenance)
    
    # Verificações mais frequentes para tabelas críticas
    schedule.every(6).hours.do(
        lambda: maintenance_system.create_backup('subscriptions', 'hourly')
    )
    schedule.every(6).hours.do(
        lambda: maintenance_system.create_backup('payments', 'hourly')
    )
    
    logger.info("Sistema de manutenção iniciado")
    logger.info("Agendamentos configurados:")
    logger.info("- Manutenção diária: 02:00")
    logger.info("- Manutenção semanal: Domingo 03:00")
    logger.info("- Backup de tabelas críticas: a cada 6 horas")
    
    # Loop principal
    try:
        while True:
            schedule.run_pending()
            time.sleep(60)  # Verificar a cada minuto
    except KeyboardInterrupt:
        logger.info("Sistema de manutenção interrompido pelo usuário")
    except Exception as e:
        logger.error(f"Erro no sistema de manutenção: {e}")
        maintenance_system.send_alert(f"Sistema de manutenção falhou: {e}", "CRITICAL")

if __name__ == "__main__":
    # Permitir execução de comandos individuais
    import sys
    
    if len(sys.argv) > 1:
        maintenance_system = DatabaseMaintenanceSystem()
        
        command = sys.argv[1].lower()
        
        if command == "backup":
            if len(sys.argv) > 2:
                table_name = sys.argv[2]
                maintenance_system.create_backup(table_name, "manual")
            else:
                maintenance_system.emergency_backup()
        
        elif command == "quality":
            result = maintenance_system.run_quality_check()
            print(json.dumps(result, indent=2))
        
        elif command == "cleanup":
            maintenance_system.cleanup_old_backups()
        
        elif command == "status":
            status = maintenance_system.get_backup_status()
            print(json.dumps(status, indent=2, default=str))
        
        elif command == "report":
            maintenance_system.generate_health_report()
        
        else:
            print("Comandos disponíveis:")
            print("  backup [table_name] - Criar backup")
            print("  quality - Verificar qualidade dos dados")
            print("  cleanup - Limpar backups antigos")
            print("  status - Status dos backups")
            print("  report - Gerar relatório de saúde")
    
    else:
        main() 