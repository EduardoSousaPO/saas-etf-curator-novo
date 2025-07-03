/**
 * MÓDULO DE SCHEMA DO BANCO DE DADOS
 * 
 * Este módulo é responsável por criar e gerenciar a estrutura da tabela
 * de ETFs ativos no Supabase, incluindo índices e políticas de segurança.
 */

import { DATABASE_CONFIG, ETF_TABLE_SCHEMA } from '../config.js';

/**
 * Cria a tabela principal de ETFs ativos no Supabase
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Resultado da criação da tabela
 */
export async function createEtfTable(supabaseClient) {
  console.log('🏗️  Criando tabela etfs_ativos_reais...');
  
  try {
    // Construir SQL de criação da tabela
    const createTableSQL = buildCreateTableSQL();
    
    // Executar migration no Supabase
    const result = await supabaseClient.apply_migration({
      project_id: DATABASE_CONFIG.projectId,
      name: 'create_etfs_ativos_reais_table',
      query: createTableSQL
    });
    
    console.log('✅ Tabela criada com sucesso!');
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    throw error;
  }
}

/**
 * Constrói o SQL para criação da tabela de ETFs
 * 
 * @returns {string} SQL completo para criação da tabela
 */
function buildCreateTableSQL() {
  // Construir campos da tabela
  const fields = Object.entries(ETF_TABLE_SCHEMA)
    .map(([fieldName, fieldType]) => `  ${fieldName} ${fieldType}`)
    .join(',\n');
  
  return `
-- Criar tabela principal de ETFs ativos com dados reais
CREATE TABLE IF NOT EXISTS ${DATABASE_CONFIG.tableName} (
${fields}
);

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_etfs_symbol ON ${DATABASE_CONFIG.tableName} (symbol);
CREATE INDEX IF NOT EXISTS idx_etfs_name ON ${DATABASE_CONFIG.tableName} (name);
CREATE INDEX IF NOT EXISTS idx_etfs_assetclass ON ${DATABASE_CONFIG.tableName} (assetclass);
CREATE INDEX IF NOT EXISTS idx_etfs_etfcompany ON ${DATABASE_CONFIG.tableName} (etfcompany);
CREATE INDEX IF NOT EXISTS idx_etfs_totalasset ON ${DATABASE_CONFIG.tableName} (totalasset);
CREATE INDEX IF NOT EXISTS idx_etfs_expenseratio ON ${DATABASE_CONFIG.tableName} (expenseratio);
CREATE INDEX IF NOT EXISTS idx_etfs_returns_12m ON ${DATABASE_CONFIG.tableName} (returns_12m);
CREATE INDEX IF NOT EXISTS idx_etfs_updatedat ON ${DATABASE_CONFIG.tableName} (updatedat);

-- Criar índice GIN para busca em setores (JSONB)
CREATE INDEX IF NOT EXISTS idx_etfs_sectors_gin ON ${DATABASE_CONFIG.tableName} USING GIN (sectorslist);

-- Adicionar comentários para documentação
COMMENT ON TABLE ${DATABASE_CONFIG.tableName} IS 'Tabela principal contendo ETFs ativos dos EUA com dados reais coletados via pipeline automatizado';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.symbol IS 'Símbolo único do ETF (ticker)';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.name IS 'Nome completo do ETF';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.description IS 'Descrição detalhada do ETF e sua estratégia';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.expenseratio IS 'Taxa de administração anual (expense ratio)';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.totalasset IS 'Patrimônio líquido total em USD';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.sectorslist IS 'Lista de setores e suas alocações em formato JSON';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.updatedat IS 'Timestamp da última atualização dos dados';

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar timestamp automaticamente
DROP TRIGGER IF EXISTS update_etfs_updated_at ON ${DATABASE_CONFIG.tableName};
CREATE TRIGGER update_etfs_updated_at
    BEFORE UPDATE ON ${DATABASE_CONFIG.tableName}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Log de sucesso
SELECT 'Tabela ${DATABASE_CONFIG.tableName} criada com sucesso com todos os índices e triggers' as status;
`;
}

/**
 * Verifica se a tabela existe e retorna informações sobre ela
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Informações sobre a tabela
 */
export async function checkTableExists(supabaseClient) {
  console.log('🔍 Verificando se a tabela existe...');
  
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${DATABASE_CONFIG.tableName}'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (result.length > 0) {
      console.log(`✅ Tabela ${DATABASE_CONFIG.tableName} existe com ${result.length} colunas`);
      return { exists: true, columns: result };
    } else {
      console.log(`❌ Tabela ${DATABASE_CONFIG.tableName} não existe`);
      return { exists: false, columns: [] };
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    throw error;
  }
}

/**
 * Conta quantos ETFs já estão na tabela
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<number>} Número de ETFs na tabela
 */
export async function countExistingEtfs(supabaseClient) {
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `SELECT COUNT(*) as total FROM ${DATABASE_CONFIG.tableName};`
    });
    
    const count = result[0]?.total || 0;
    console.log(`📊 ETFs já cadastrados na tabela: ${count}`);
    return count;
    
  } catch (error) {
    console.error('❌ Erro ao contar ETFs existentes:', error);
    return 0;
  }
}

/**
 * Limpa a tabela (remove todos os dados)
 * CUIDADO: Esta operação é irreversível!
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Resultado da operação
 */
export async function clearTable(supabaseClient) {
  console.log('⚠️  ATENÇÃO: Limpando todos os dados da tabela...');
  
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `TRUNCATE TABLE ${DATABASE_CONFIG.tableName} RESTART IDENTITY;`
    });
    
    console.log('✅ Tabela limpa com sucesso!');
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao limpar tabela:', error);
    throw error;
  }
}

/**
 * Dropa a tabela completamente
 * CUIDADO: Esta operação é irreversível!
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Resultado da operação
 */
export async function dropTable(supabaseClient) {
  console.log('⚠️  ATENÇÃO: Removendo tabela completamente...');
  
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `DROP TABLE IF EXISTS ${DATABASE_CONFIG.tableName} CASCADE;`
    });
    
    console.log('✅ Tabela removida com sucesso!');
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao remover tabela:', error);
    throw error;
  }
}

/**
 * Inicializa o schema do banco de dados
 * Verifica se a tabela existe, se não existir, cria
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Status da inicialização
 */
export async function initializeDatabase(supabaseClient) {
  console.log('🚀 Inicializando banco de dados...');
  
  try {
    // Verificar se tabela existe
    const tableInfo = await checkTableExists(supabaseClient);
    
    if (!tableInfo.exists) {
      // Criar tabela se não existir
      await createEtfTable(supabaseClient);
    } else {
      console.log('✅ Tabela já existe, prosseguindo...');
    }
    
    // Contar ETFs existentes
    const existingCount = await countExistingEtfs(supabaseClient);
    
    return {
      success: true,
      tableExists: true,
      existingEtfs: existingCount,
      message: 'Banco de dados inicializado com sucesso'
    };
    
  } catch (error) {
    console.error('❌ Erro na inicialização do banco:', error);
    throw error;
  }
}

export default {
  createEtfTable,
  checkTableExists,
  countExistingEtfs,
  clearTable,
  dropTable,
  initializeDatabase
}; 
 * MÓDULO DE SCHEMA DO BANCO DE DADOS
 * 
 * Este módulo é responsável por criar e gerenciar a estrutura da tabela
 * de ETFs ativos no Supabase, incluindo índices e políticas de segurança.
 */

import { DATABASE_CONFIG, ETF_TABLE_SCHEMA } from '../config.js';

/**
 * Cria a tabela principal de ETFs ativos no Supabase
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Resultado da criação da tabela
 */
export async function createEtfTable(supabaseClient) {
  console.log('🏗️  Criando tabela etfs_ativos_reais...');
  
  try {
    // Construir SQL de criação da tabela
    const createTableSQL = buildCreateTableSQL();
    
    // Executar migration no Supabase
    const result = await supabaseClient.apply_migration({
      project_id: DATABASE_CONFIG.projectId,
      name: 'create_etfs_ativos_reais_table',
      query: createTableSQL
    });
    
    console.log('✅ Tabela criada com sucesso!');
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao criar tabela:', error);
    throw error;
  }
}

/**
 * Constrói o SQL para criação da tabela de ETFs
 * 
 * @returns {string} SQL completo para criação da tabela
 */
function buildCreateTableSQL() {
  // Construir campos da tabela
  const fields = Object.entries(ETF_TABLE_SCHEMA)
    .map(([fieldName, fieldType]) => `  ${fieldName} ${fieldType}`)
    .join(',\n');
  
  return `
-- Criar tabela principal de ETFs ativos com dados reais
CREATE TABLE IF NOT EXISTS ${DATABASE_CONFIG.tableName} (
${fields}
);

-- Criar índices para melhorar performance das consultas
CREATE INDEX IF NOT EXISTS idx_etfs_symbol ON ${DATABASE_CONFIG.tableName} (symbol);
CREATE INDEX IF NOT EXISTS idx_etfs_name ON ${DATABASE_CONFIG.tableName} (name);
CREATE INDEX IF NOT EXISTS idx_etfs_assetclass ON ${DATABASE_CONFIG.tableName} (assetclass);
CREATE INDEX IF NOT EXISTS idx_etfs_etfcompany ON ${DATABASE_CONFIG.tableName} (etfcompany);
CREATE INDEX IF NOT EXISTS idx_etfs_totalasset ON ${DATABASE_CONFIG.tableName} (totalasset);
CREATE INDEX IF NOT EXISTS idx_etfs_expenseratio ON ${DATABASE_CONFIG.tableName} (expenseratio);
CREATE INDEX IF NOT EXISTS idx_etfs_returns_12m ON ${DATABASE_CONFIG.tableName} (returns_12m);
CREATE INDEX IF NOT EXISTS idx_etfs_updatedat ON ${DATABASE_CONFIG.tableName} (updatedat);

-- Criar índice GIN para busca em setores (JSONB)
CREATE INDEX IF NOT EXISTS idx_etfs_sectors_gin ON ${DATABASE_CONFIG.tableName} USING GIN (sectorslist);

-- Adicionar comentários para documentação
COMMENT ON TABLE ${DATABASE_CONFIG.tableName} IS 'Tabela principal contendo ETFs ativos dos EUA com dados reais coletados via pipeline automatizado';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.symbol IS 'Símbolo único do ETF (ticker)';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.name IS 'Nome completo do ETF';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.description IS 'Descrição detalhada do ETF e sua estratégia';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.expenseratio IS 'Taxa de administração anual (expense ratio)';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.totalasset IS 'Patrimônio líquido total em USD';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.sectorslist IS 'Lista de setores e suas alocações em formato JSON';
COMMENT ON COLUMN ${DATABASE_CONFIG.tableName}.updatedat IS 'Timestamp da última atualização dos dados';

-- Criar função para atualizar timestamp automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updatedat = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Criar trigger para atualizar timestamp automaticamente
DROP TRIGGER IF EXISTS update_etfs_updated_at ON ${DATABASE_CONFIG.tableName};
CREATE TRIGGER update_etfs_updated_at
    BEFORE UPDATE ON ${DATABASE_CONFIG.tableName}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Log de sucesso
SELECT 'Tabela ${DATABASE_CONFIG.tableName} criada com sucesso com todos os índices e triggers' as status;
`;
}

/**
 * Verifica se a tabela existe e retorna informações sobre ela
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Informações sobre a tabela
 */
export async function checkTableExists(supabaseClient) {
  console.log('🔍 Verificando se a tabela existe...');
  
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `
        SELECT 
          table_name,
          column_name,
          data_type,
          is_nullable
        FROM information_schema.columns 
        WHERE table_name = '${DATABASE_CONFIG.tableName}'
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `
    });
    
    if (result.length > 0) {
      console.log(`✅ Tabela ${DATABASE_CONFIG.tableName} existe com ${result.length} colunas`);
      return { exists: true, columns: result };
    } else {
      console.log(`❌ Tabela ${DATABASE_CONFIG.tableName} não existe`);
      return { exists: false, columns: [] };
    }
    
  } catch (error) {
    console.error('❌ Erro ao verificar tabela:', error);
    throw error;
  }
}

/**
 * Conta quantos ETFs já estão na tabela
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<number>} Número de ETFs na tabela
 */
export async function countExistingEtfs(supabaseClient) {
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `SELECT COUNT(*) as total FROM ${DATABASE_CONFIG.tableName};`
    });
    
    const count = result[0]?.total || 0;
    console.log(`📊 ETFs já cadastrados na tabela: ${count}`);
    return count;
    
  } catch (error) {
    console.error('❌ Erro ao contar ETFs existentes:', error);
    return 0;
  }
}

/**
 * Limpa a tabela (remove todos os dados)
 * CUIDADO: Esta operação é irreversível!
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Resultado da operação
 */
export async function clearTable(supabaseClient) {
  console.log('⚠️  ATENÇÃO: Limpando todos os dados da tabela...');
  
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `TRUNCATE TABLE ${DATABASE_CONFIG.tableName} RESTART IDENTITY;`
    });
    
    console.log('✅ Tabela limpa com sucesso!');
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao limpar tabela:', error);
    throw error;
  }
}

/**
 * Dropa a tabela completamente
 * CUIDADO: Esta operação é irreversível!
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Resultado da operação
 */
export async function dropTable(supabaseClient) {
  console.log('⚠️  ATENÇÃO: Removendo tabela completamente...');
  
  try {
    const result = await supabaseClient.execute_sql({
      project_id: DATABASE_CONFIG.projectId,
      query: `DROP TABLE IF EXISTS ${DATABASE_CONFIG.tableName} CASCADE;`
    });
    
    console.log('✅ Tabela removida com sucesso!');
    return result;
    
  } catch (error) {
    console.error('❌ Erro ao remover tabela:', error);
    throw error;
  }
}

/**
 * Inicializa o schema do banco de dados
 * Verifica se a tabela existe, se não existir, cria
 * 
 * @param {Object} supabaseClient - Cliente MCP do Supabase
 * @returns {Promise<Object>} Status da inicialização
 */
export async function initializeDatabase(supabaseClient) {
  console.log('🚀 Inicializando banco de dados...');
  
  try {
    // Verificar se tabela existe
    const tableInfo = await checkTableExists(supabaseClient);
    
    if (!tableInfo.exists) {
      // Criar tabela se não existir
      await createEtfTable(supabaseClient);
    } else {
      console.log('✅ Tabela já existe, prosseguindo...');
    }
    
    // Contar ETFs existentes
    const existingCount = await countExistingEtfs(supabaseClient);
    
    return {
      success: true,
      tableExists: true,
      existingEtfs: existingCount,
      message: 'Banco de dados inicializado com sucesso'
    };
    
  } catch (error) {
    console.error('❌ Erro na inicialização do banco:', error);
    throw error;
  }
}

export default {
  createEtfTable,
  checkTableExists,
  countExistingEtfs,
  clearTable,
  dropTable,
  initializeDatabase
}; 