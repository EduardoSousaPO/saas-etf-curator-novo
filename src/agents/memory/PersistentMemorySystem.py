"""
Sistema de Memória Persistente para Vista ETF Assistant
Gerencia projetos, estratégias, conversas e contexto do usuário
Integra com MCP Memory e Supabase para armazenamento híbrido
"""

import asyncio
import json
import uuid
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from dataclasses import dataclass, asdict
from enum import Enum


class ProjectType(Enum):
    PORTFOLIO = "portfolio"
    ANALYSIS = "analysis"
    STRATEGY = "strategy"
    SCREENING = "screening"
    COMPARISON = "comparison"
    RESEARCH = "research"


class ProjectStatus(Enum):
    ACTIVE = "active"
    COMPLETED = "completed"
    ARCHIVED = "archived"
    DRAFT = "draft"


@dataclass
class SavedProject:
    """Estrutura de um projeto salvo"""
    id: str
    user_id: str
    name: str
    description: str
    type: ProjectType
    status: ProjectStatus
    data: Dict[str, Any]
    tags: List[str]
    created_at: datetime
    updated_at: datetime
    last_accessed: datetime
    metadata: Dict[str, Any]


@dataclass
class ConversationMemory:
    """Estrutura de memória de conversa"""
    session_id: str
    user_id: str
    messages: List[Dict[str, Any]]
    extracted_entities: List[str]
    user_preferences: Dict[str, Any]
    projects_referenced: List[str]
    intent_history: List[str]
    timestamp: datetime
    duration_seconds: int


class PersistentMemorySystem:
    """Sistema principal de memória persistente"""
    
    def __init__(self):
        self.supabase_project_id = "nniabnjuwzeqmflrruga"
        self.active_sessions = {}
        self.user_contexts = {}
        
    async def initialize_tables(self):
        """Inicializa tabelas necessárias no Supabase"""
        try:
            # Usar MCP Supabase para criar tabelas se necessário
            from mcp_supabase import execute_sql
            
            # Tabela de projetos salvos
            projects_table = """
            CREATE TABLE IF NOT EXISTS user_projects (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT,
                type TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'draft',
                data JSONB NOT NULL,
                tags TEXT[] DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                last_accessed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                metadata JSONB DEFAULT '{}'
            );
            """
            
            # Tabela de conversas
            conversations_table = """
            CREATE TABLE IF NOT EXISTS user_conversations (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                session_id TEXT NOT NULL,
                user_id TEXT NOT NULL,
                messages JSONB NOT NULL,
                extracted_entities TEXT[] DEFAULT '{}',
                user_preferences JSONB DEFAULT '{}',
                projects_referenced TEXT[] DEFAULT '{}',
                intent_history TEXT[] DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                duration_seconds INTEGER DEFAULT 0,
                metadata JSONB DEFAULT '{}'
            );
            """
            
            # Tabela de preferências do usuário
            preferences_table = """
            CREATE TABLE IF NOT EXISTS user_preferences (
                id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
                user_id TEXT NOT NULL UNIQUE,
                risk_profile TEXT DEFAULT 'moderate',
                investment_objectives TEXT[] DEFAULT '{}',
                preferred_sectors TEXT[] DEFAULT '{}',
                excluded_etfs TEXT[] DEFAULT '{}',
                notification_preferences JSONB DEFAULT '{}',
                created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
            );
            """
            
            await execute_sql(self.supabase_project_id, projects_table)
            await execute_sql(self.supabase_project_id, conversations_table)
            await execute_sql(self.supabase_project_id, preferences_table)
            
            print("✅ Tabelas de memória inicializadas com sucesso")
            
        except Exception as e:
            print(f"⚠️ Erro ao inicializar tabelas: {e}")
    
    # === GESTÃO DE PROJETOS ===
    
    async def save_project(self, user_id: str, name: str, project_type: ProjectType, 
                          data: Dict[str, Any], description: str = "", 
                          tags: List[str] = None) -> str:
        """Salva um novo projeto"""
        try:
            from mcp_supabase import execute_sql
            
            project_id = str(uuid.uuid4())
            tags = tags or []
            
            project = SavedProject(
                id=project_id,
                user_id=user_id,
                name=name,
                description=description,
                type=project_type,
                status=ProjectStatus.ACTIVE,
                data=data,
                tags=tags,
                created_at=datetime.now(),
                updated_at=datetime.now(),
                last_accessed=datetime.now(),
                metadata={}
            )
            
            query = """
            INSERT INTO user_projects 
            (id, user_id, name, description, type, status, data, tags, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """
            
            await execute_sql(self.supabase_project_id, query, [
                project.id, project.user_id, project.name, project.description,
                project.type.value, project.status.value, json.dumps(project.data),
                project.tags, json.dumps(project.metadata)
            ])
            
            # Salvar também no MCP Memory para busca semântica
            await self._save_to_mcp_memory(project)
            
            print(f"💾 Projeto salvo: {name} (ID: {project_id})")
            return project_id
            
        except Exception as e:
            print(f"❌ Erro ao salvar projeto: {e}")
            return ""
    
    async def get_user_projects(self, user_id: str, project_type: Optional[ProjectType] = None, 
                               status: Optional[ProjectStatus] = None, 
                               limit: int = 20) -> List[SavedProject]:
        """Recupera projetos do usuário"""
        try:
            from mcp_supabase import execute_sql
            
            conditions = [f"user_id = '{user_id}'"]
            
            if project_type:
                conditions.append(f"type = '{project_type.value}'")
            
            if status:
                conditions.append(f"status = '{status.value}'")
            
            where_clause = " AND ".join(conditions)
            
            query = f"""
            SELECT * FROM user_projects 
            WHERE {where_clause}
            ORDER BY last_accessed DESC, updated_at DESC
            LIMIT {limit}
            """
            
            results = await execute_sql(self.supabase_project_id, query)
            
            projects = []
            for row in results.data if results and results.data else []:
                project = SavedProject(
                    id=row['id'],
                    user_id=row['user_id'],
                    name=row['name'],
                    description=row['description'] or "",
                    type=ProjectType(row['type']),
                    status=ProjectStatus(row['status']),
                    data=row['data'],
                    tags=row['tags'] or [],
                    created_at=row['created_at'],
                    updated_at=row['updated_at'],
                    last_accessed=row['last_accessed'],
                    metadata=row['metadata'] or {}
                )
                projects.append(project)
            
            return projects
            
        except Exception as e:
            print(f"❌ Erro ao recuperar projetos: {e}")
            return []
    
    async def update_project(self, project_id: str, updates: Dict[str, Any]) -> bool:
        """Atualiza um projeto existente"""
        try:
            from mcp_supabase import execute_sql
            
            # Construir query de update dinamicamente
            set_clauses = []
            values = []
            param_count = 1
            
            for key, value in updates.items():
                if key in ['name', 'description', 'status', 'data', 'tags', 'metadata']:
                    set_clauses.append(f"{key} = ${param_count}")
                    values.append(json.dumps(value) if key in ['data', 'metadata'] else value)
                    param_count += 1
            
            if not set_clauses:
                return False
            
            set_clauses.append(f"updated_at = ${param_count}")
            values.append(datetime.now())
            param_count += 1
            
            values.append(project_id)
            
            query = f"""
            UPDATE user_projects 
            SET {', '.join(set_clauses)}
            WHERE id = ${param_count}
            """
            
            await execute_sql(self.supabase_project_id, query, values)
            
            print(f"📝 Projeto atualizado: {project_id}")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao atualizar projeto: {e}")
            return False
    
    async def delete_project(self, project_id: str, user_id: str) -> bool:
        """Deleta um projeto (soft delete)"""
        try:
            from mcp_supabase import execute_sql
            
            query = """
            UPDATE user_projects 
            SET status = 'archived', updated_at = NOW()
            WHERE id = $1 AND user_id = $2
            """
            
            await execute_sql(self.supabase_project_id, query, [project_id, user_id])
            
            print(f"🗑️ Projeto arquivado: {project_id}")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao deletar projeto: {e}")
            return False
    
    async def search_projects(self, user_id: str, search_query: str, limit: int = 10) -> List[SavedProject]:
        """Busca projetos por texto (nome, descrição, tags)"""
        try:
            # Buscar primeiro no MCP Memory (busca semântica)
            from mcp_memory import search_nodes
            
            semantic_results = await search_nodes(f"user:{user_id} {search_query}")
            
            # Buscar também no Supabase (busca textual)
            from mcp_supabase import execute_sql
            
            query = """
            SELECT * FROM user_projects 
            WHERE user_id = $1 
            AND (
                name ILIKE $2 
                OR description ILIKE $2 
                OR $3 = ANY(tags)
            )
            ORDER BY updated_at DESC
            LIMIT $4
            """
            
            search_pattern = f"%{search_query}%"
            results = await execute_sql(self.supabase_project_id, query, 
                                      [user_id, search_pattern, search_query, limit])
            
            # Converter resultados
            projects = []
            for row in results.data if results and results.data else []:
                project = SavedProject(
                    id=row['id'],
                    user_id=row['user_id'],
                    name=row['name'],
                    description=row['description'] or "",
                    type=ProjectType(row['type']),
                    status=ProjectStatus(row['status']),
                    data=row['data'],
                    tags=row['tags'] or [],
                    created_at=row['created_at'],
                    updated_at=row['updated_at'],
                    last_accessed=row['last_accessed'],
                    metadata=row['metadata'] or {}
                )
                projects.append(project)
            
            return projects
            
        except Exception as e:
            print(f"❌ Erro na busca de projetos: {e}")
            return []
    
    # === GESTÃO DE CONVERSAS ===
    
    async def save_conversation(self, conversation: ConversationMemory) -> bool:
        """Salva uma conversa completa"""
        try:
            from mcp_supabase import execute_sql
            
            query = """
            INSERT INTO user_conversations 
            (session_id, user_id, messages, extracted_entities, user_preferences, 
             projects_referenced, intent_history, duration_seconds, metadata)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
            """
            
            await execute_sql(self.supabase_project_id, query, [
                conversation.session_id,
                conversation.user_id,
                json.dumps(conversation.messages),
                conversation.extracted_entities,
                json.dumps(conversation.user_preferences),
                conversation.projects_referenced,
                conversation.intent_history,
                conversation.duration_seconds,
                json.dumps({})
            ])
            
            # Salvar entidades extraídas no MCP Memory
            await self._save_conversation_to_mcp_memory(conversation)
            
            print(f"💬 Conversa salva: {conversation.session_id}")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao salvar conversa: {e}")
            return False
    
    async def get_conversation_history(self, user_id: str, days: int = 7, 
                                     limit: int = 50) -> List[ConversationMemory]:
        """Recupera histórico de conversas"""
        try:
            from mcp_supabase import execute_sql
            
            since_date = datetime.now() - timedelta(days=days)
            
            query = """
            SELECT * FROM user_conversations 
            WHERE user_id = $1 AND created_at >= $2
            ORDER BY created_at DESC
            LIMIT $3
            """
            
            results = await execute_sql(self.supabase_project_id, query, 
                                      [user_id, since_date, limit])
            
            conversations = []
            for row in results.data if results and results.data else []:
                conversation = ConversationMemory(
                    session_id=row['session_id'],
                    user_id=row['user_id'],
                    messages=row['messages'],
                    extracted_entities=row['extracted_entities'] or [],
                    user_preferences=row['user_preferences'] or {},
                    projects_referenced=row['projects_referenced'] or [],
                    intent_history=row['intent_history'] or [],
                    timestamp=row['created_at'],
                    duration_seconds=row['duration_seconds'] or 0
                )
                conversations.append(conversation)
            
            return conversations
            
        except Exception as e:
            print(f"❌ Erro ao recuperar histórico: {e}")
            return []
    
    async def get_relevant_context(self, user_id: str, current_message: str, 
                                 limit: int = 5) -> Dict[str, Any]:
        """Busca contexto relevante para a mensagem atual"""
        try:
            # Busca semântica no MCP Memory
            from mcp_memory import search_nodes
            
            semantic_results = await search_nodes(
                f"user:{user_id} {current_message}", 
                limit=limit
            )
            
            # Busca conversas recentes relacionadas
            recent_conversations = await self.get_conversation_history(user_id, days=7, limit=5)
            
            # Busca projetos relacionados
            related_projects = await self.search_projects(user_id, current_message, limit=3)
            
            # Preferências do usuário
            user_prefs = await self.get_user_preferences(user_id)
            
            context = {
                'semantic_results': semantic_results,
                'recent_conversations': [asdict(conv) for conv in recent_conversations],
                'related_projects': [asdict(proj) for proj in related_projects],
                'user_preferences': user_prefs,
                'timestamp': datetime.now().isoformat()
            }
            
            return context
            
        except Exception as e:
            print(f"❌ Erro ao buscar contexto: {e}")
            return {}
    
    # === GESTÃO DE PREFERÊNCIAS ===
    
    async def save_user_preferences(self, user_id: str, preferences: Dict[str, Any]) -> bool:
        """Salva/atualiza preferências do usuário"""
        try:
            from mcp_supabase import execute_sql
            
            query = """
            INSERT INTO user_preferences 
            (user_id, risk_profile, investment_objectives, preferred_sectors, 
             excluded_etfs, notification_preferences)
            VALUES ($1, $2, $3, $4, $5, $6)
            ON CONFLICT (user_id) 
            DO UPDATE SET
                risk_profile = $2,
                investment_objectives = $3,
                preferred_sectors = $4,
                excluded_etfs = $5,
                notification_preferences = $6,
                updated_at = NOW()
            """
            
            await execute_sql(self.supabase_project_id, query, [
                user_id,
                preferences.get('risk_profile', 'moderate'),
                preferences.get('investment_objectives', []),
                preferences.get('preferred_sectors', []),
                preferences.get('excluded_etfs', []),
                json.dumps(preferences.get('notification_preferences', {}))
            ])
            
            print(f"⚙️ Preferências salvas para usuário: {user_id}")
            return True
            
        except Exception as e:
            print(f"❌ Erro ao salvar preferências: {e}")
            return False
    
    async def get_user_preferences(self, user_id: str) -> Dict[str, Any]:
        """Recupera preferências do usuário"""
        try:
            from mcp_supabase import execute_sql
            
            query = """
            SELECT * FROM user_preferences 
            WHERE user_id = $1
            """
            
            results = await execute_sql(self.supabase_project_id, query, [user_id])
            
            if results and results.data:
                prefs = results.data[0]
                return {
                    'risk_profile': prefs['risk_profile'],
                    'investment_objectives': prefs['investment_objectives'],
                    'preferred_sectors': prefs['preferred_sectors'],
                    'excluded_etfs': prefs['excluded_etfs'],
                    'notification_preferences': prefs['notification_preferences']
                }
            else:
                # Retornar preferências padrão
                return {
                    'risk_profile': 'moderate',
                    'investment_objectives': [],
                    'preferred_sectors': [],
                    'excluded_etfs': [],
                    'notification_preferences': {}
                }
                
        except Exception as e:
            print(f"❌ Erro ao recuperar preferências: {e}")
            return {}
    
    # === MÉTODOS AUXILIARES ===
    
    async def _save_to_mcp_memory(self, project: SavedProject):
        """Salva projeto no MCP Memory para busca semântica"""
        try:
            from mcp_memory import create_entities
            
            await create_entities([{
                'name': f"project_{project.id}",
                'entityType': f'user_project_{project.type.value}',
                'observations': [
                    f"User {project.user_id} created project: {project.name}",
                    f"Description: {project.description}",
                    f"Type: {project.type.value}",
                    f"Tags: {', '.join(project.tags)}",
                    f"Created: {project.created_at.isoformat()}"
                ]
            }])
            
        except Exception as e:
            print(f"⚠️ Erro ao salvar no MCP Memory: {e}")
    
    async def _save_conversation_to_mcp_memory(self, conversation: ConversationMemory):
        """Salva conversa no MCP Memory"""
        try:
            from mcp_memory import create_entities
            
            # Extrair insights da conversa
            key_topics = conversation.extracted_entities
            intents = conversation.intent_history
            
            await create_entities([{
                'name': f"conversation_{conversation.session_id}",
                'entityType': 'user_conversation',
                'observations': [
                    f"User {conversation.user_id} discussed: {', '.join(key_topics)}",
                    f"Main intents: {', '.join(intents)}",
                    f"Duration: {conversation.duration_seconds} seconds",
                    f"Projects referenced: {', '.join(conversation.projects_referenced)}",
                    f"Timestamp: {conversation.timestamp.isoformat()}"
                ]
            }])
            
        except Exception as e:
            print(f"⚠️ Erro ao salvar conversa no MCP Memory: {e}")
    
    async def get_system_stats(self) -> Dict[str, Any]:
        """Estatísticas do sistema de memória"""
        try:
            from mcp_supabase import execute_sql
            
            # Estatísticas de projetos
            projects_query = """
            SELECT 
                type,
                status,
                COUNT(*) as count
            FROM user_projects 
            GROUP BY type, status
            """
            
            # Estatísticas de conversas
            conversations_query = """
            SELECT 
                DATE(created_at) as date,
                COUNT(*) as count,
                AVG(duration_seconds) as avg_duration
            FROM user_conversations 
            WHERE created_at >= NOW() - INTERVAL '30 days'
            GROUP BY DATE(created_at)
            ORDER BY date DESC
            LIMIT 7
            """
            
            projects_stats = await execute_sql(self.supabase_project_id, projects_query)
            conversations_stats = await execute_sql(self.supabase_project_id, conversations_query)
            
            return {
                'projects_by_type_status': projects_stats.data if projects_stats else [],
                'conversations_last_7_days': conversations_stats.data if conversations_stats else [],
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            print(f"❌ Erro ao obter estatísticas: {e}")
            return {}


# Instância global do sistema de memória
memory_system = PersistentMemorySystem()


# Funções helper para uso nos agentes
async def save_portfolio_project(user_id: str, name: str, portfolio_data: Dict[str, Any], 
                               description: str = "") -> str:
    """Helper para salvar projeto de portfolio"""
    return await memory_system.save_project(
        user_id, name, ProjectType.PORTFOLIO, portfolio_data, description,
        tags=['portfolio', 'optimization']
    )


async def save_analysis_project(user_id: str, name: str, analysis_data: Dict[str, Any], 
                              description: str = "") -> str:
    """Helper para salvar projeto de análise"""
    return await memory_system.save_project(
        user_id, name, ProjectType.ANALYSIS, analysis_data, description,
        tags=['analysis', 'etf']
    )


async def get_user_context(user_id: str, current_message: str) -> Dict[str, Any]:
    """Helper para obter contexto completo do usuário"""
    return await memory_system.get_relevant_context(user_id, current_message)


# Teste do sistema
async def test_memory_system():
    """Teste completo do sistema de memória"""
    print("🧪 Testando Sistema de Memória Persistente...")
    
    # Inicializar tabelas
    await memory_system.initialize_tables()
    
    # Teste de projeto
    print("\n1. Testando salvamento de projeto:")
    project_data = {
        'etfs': ['VTI', 'SCHD', 'BND'],
        'allocations': [60, 25, 15],
        'expected_return': 8.5,
        'risk_level': 'moderate'
    }
    
    project_id = await save_portfolio_project(
        'test_user', 
        'Minha Carteira Conservadora', 
        project_data,
        'Carteira focada em dividendos e baixo risco'
    )
    print(f"   Projeto salvo: {project_id}")
    
    # Teste de recuperação
    print("\n2. Testando recuperação de projetos:")
    projects = await memory_system.get_user_projects('test_user')
    print(f"   Projetos encontrados: {len(projects)}")
    
    # Teste de preferências
    print("\n3. Testando preferências:")
    prefs = {
        'risk_profile': 'conservative',
        'investment_objectives': ['retirement', 'income'],
        'preferred_sectors': ['Technology', 'Healthcare']
    }
    
    await memory_system.save_user_preferences('test_user', prefs)
    saved_prefs = await memory_system.get_user_preferences('test_user')
    print(f"   Preferências salvas: {saved_prefs['risk_profile']}")
    
    # Teste de contexto
    print("\n4. Testando contexto:")
    context = await get_user_context('test_user', 'Quero otimizar minha carteira')
    print(f"   Contexto recuperado: {len(context)} elementos")
    
    print("\n✅ Testes do sistema de memória concluídos!")


if __name__ == "__main__":
    asyncio.run(test_memory_system()) 