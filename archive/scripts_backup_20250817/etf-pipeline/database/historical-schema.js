const HISTORICAL_TABLES = {
  etf_prices: {
    name: 'etf_prices',
    description: 'Dados históricos de preços dos ETFs',
    columns: [
      'symbol VARCHAR(10) NOT NULL',
      'date DATE NOT NULL',
      'open DECIMAL(12,4)',
      'high DECIMAL(12,4)',
      'low DECIMAL(12,4)',
      'close DECIMAL(12,4) NOT NULL',
      'adjusted_close DECIMAL(12,4)',
      'volume BIGINT',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'PRIMARY KEY (symbol, date)',
      'FOREIGN KEY (symbol) REFERENCES etfs_ativos_reais(symbol) ON DELETE CASCADE'
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_etf_prices_symbol ON etf_prices(symbol)',
      'CREATE INDEX IF NOT EXISTS idx_etf_prices_date ON etf_prices(date)',
      'CREATE INDEX IF NOT EXISTS idx_etf_prices_symbol_date ON etf_prices(symbol, date DESC)'
    ]
  },

  historic_etfs_dividends: {
    name: 'historic_etfs_dividends',
    description: 'Dados históricos de dividendos dos ETFs',
    columns: [
      'symbol VARCHAR(10) NOT NULL',
      'ex_date DATE NOT NULL',
      'pay_date DATE',
      'amount DECIMAL(10,6) NOT NULL',
      'frequency VARCHAR(20)',
      'yield_percentage DECIMAL(8,4)',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'PRIMARY KEY (symbol, ex_date)',
      'FOREIGN KEY (symbol) REFERENCES etfs_ativos_reais(symbol) ON DELETE CASCADE'
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_historic_dividends_symbol ON historic_etfs_dividends(symbol)',
      'CREATE INDEX IF NOT EXISTS idx_historic_dividends_ex_date ON historic_etfs_dividends(ex_date)',
      'CREATE INDEX IF NOT EXISTS idx_historic_dividends_symbol_date ON historic_etfs_dividends(symbol, ex_date DESC)'
    ]
  }
};

class HistoricalSchemaManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  async createHistoricalTables() {
    const results = {
      success: [],
      errors: []
    };

    for (const [tableName, tableConfig] of Object.entries(HISTORICAL_TABLES)) {
      try {
        console.log(`\n📋 Criando tabela: ${tableName}`);
        
        // Criar tabela
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ${tableConfig.name} (
            ${tableConfig.columns.join(',\n            ')}
          );
        `;

        await this.executeSQL(createTableSQL, `Criar tabela ${tableName}`);

        // Criar índices
        for (const indexSQL of tableConfig.indexes) {
          await this.executeSQL(indexSQL, `Criar índice para ${tableName}`);
        }

        results.success.push(tableName);
        console.log(`✅ Tabela ${tableName} criada com sucesso`);

      } catch (error) {
        console.error(`❌ Erro ao criar tabela ${tableName}:`, error.message);
        results.errors.push({ table: tableName, error: error.message });
      }
    }

    return results;
  }

  async executeSQL(sql, description) {
    try {
      const result = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: sql
      });

      if (result.error) {
        throw new Error(result.error);
      }

      console.log(`  ✓ ${description}`);
      return result;
    } catch (error) {
      console.error(`  ✗ ${description}: ${error.message}`);
      throw error;
    }
  }

  async dropHistoricalTables() {
    const results = {
      success: [],
      errors: []
    };

    // Ordem reversa para respeitar foreign keys
    const tableNames = Object.keys(HISTORICAL_TABLES).reverse();

    for (const tableName of tableNames) {
      try {
        const dropSQL = `DROP TABLE IF EXISTS ${tableName} CASCADE;`;
        await this.executeSQL(dropSQL, `Excluir tabela ${tableName}`);
        results.success.push(tableName);
      } catch (error) {
        results.errors.push({ table: tableName, error: error.message });
      }
    }

    return results;
  }

  async checkTablesExist() {
    const results = {};

    for (const tableName of Object.keys(HISTORICAL_TABLES)) {
      try {
        const checkSQL = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          );
        `;
        
        const result = await this.executeSQL(checkSQL, `Verificar existência de ${tableName}`);
        results[tableName] = result.data?.[0]?.exists || false;
      } catch (error) {
        results[tableName] = false;
      }
    }

    return results;
  }

  getTableStructure(tableName) {
    return HISTORICAL_TABLES[tableName] || null;
  }

  getAllTables() {
    return HISTORICAL_TABLES;
  }
}

module.exports = {
  HistoricalSchemaManager,
  HISTORICAL_TABLES
}; 
  etf_prices: {
    name: 'etf_prices',
    description: 'Dados históricos de preços dos ETFs',
    columns: [
      'symbol VARCHAR(10) NOT NULL',
      'date DATE NOT NULL',
      'open DECIMAL(12,4)',
      'high DECIMAL(12,4)',
      'low DECIMAL(12,4)',
      'close DECIMAL(12,4) NOT NULL',
      'adjusted_close DECIMAL(12,4)',
      'volume BIGINT',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'PRIMARY KEY (symbol, date)',
      'FOREIGN KEY (symbol) REFERENCES etfs_ativos_reais(symbol) ON DELETE CASCADE'
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_etf_prices_symbol ON etf_prices(symbol)',
      'CREATE INDEX IF NOT EXISTS idx_etf_prices_date ON etf_prices(date)',
      'CREATE INDEX IF NOT EXISTS idx_etf_prices_symbol_date ON etf_prices(symbol, date DESC)'
    ]
  },

  historic_etfs_dividends: {
    name: 'historic_etfs_dividends',
    description: 'Dados históricos de dividendos dos ETFs',
    columns: [
      'symbol VARCHAR(10) NOT NULL',
      'ex_date DATE NOT NULL',
      'pay_date DATE',
      'amount DECIMAL(10,6) NOT NULL',
      'frequency VARCHAR(20)',
      'yield_percentage DECIMAL(8,4)',
      'created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
      'PRIMARY KEY (symbol, ex_date)',
      'FOREIGN KEY (symbol) REFERENCES etfs_ativos_reais(symbol) ON DELETE CASCADE'
    ],
    indexes: [
      'CREATE INDEX IF NOT EXISTS idx_historic_dividends_symbol ON historic_etfs_dividends(symbol)',
      'CREATE INDEX IF NOT EXISTS idx_historic_dividends_ex_date ON historic_etfs_dividends(ex_date)',
      'CREATE INDEX IF NOT EXISTS idx_historic_dividends_symbol_date ON historic_etfs_dividends(symbol, ex_date DESC)'
    ]
  }
};

class HistoricalSchemaManager {
  constructor(supabaseClient) {
    this.supabase = supabaseClient;
  }

  async createHistoricalTables() {
    const results = {
      success: [],
      errors: []
    };

    for (const [tableName, tableConfig] of Object.entries(HISTORICAL_TABLES)) {
      try {
        console.log(`\n📋 Criando tabela: ${tableName}`);
        
        // Criar tabela
        const createTableSQL = `
          CREATE TABLE IF NOT EXISTS ${tableConfig.name} (
            ${tableConfig.columns.join(',\n            ')}
          );
        `;

        await this.executeSQL(createTableSQL, `Criar tabela ${tableName}`);

        // Criar índices
        for (const indexSQL of tableConfig.indexes) {
          await this.executeSQL(indexSQL, `Criar índice para ${tableName}`);
        }

        results.success.push(tableName);
        console.log(`✅ Tabela ${tableName} criada com sucesso`);

      } catch (error) {
        console.error(`❌ Erro ao criar tabela ${tableName}:`, error.message);
        results.errors.push({ table: tableName, error: error.message });
      }
    }

    return results;
  }

  async executeSQL(sql, description) {
    try {
      const result = await this.supabase.execute_sql({
        project_id: 'nniabnjuwzeqmflrruga',
        query: sql
      });

      if (result.error) {
        throw new Error(result.error);
      }

      console.log(`  ✓ ${description}`);
      return result;
    } catch (error) {
      console.error(`  ✗ ${description}: ${error.message}`);
      throw error;
    }
  }

  async dropHistoricalTables() {
    const results = {
      success: [],
      errors: []
    };

    // Ordem reversa para respeitar foreign keys
    const tableNames = Object.keys(HISTORICAL_TABLES).reverse();

    for (const tableName of tableNames) {
      try {
        const dropSQL = `DROP TABLE IF EXISTS ${tableName} CASCADE;`;
        await this.executeSQL(dropSQL, `Excluir tabela ${tableName}`);
        results.success.push(tableName);
      } catch (error) {
        results.errors.push({ table: tableName, error: error.message });
      }
    }

    return results;
  }

  async checkTablesExist() {
    const results = {};

    for (const tableName of Object.keys(HISTORICAL_TABLES)) {
      try {
        const checkSQL = `
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = '${tableName}'
          );
        `;
        
        const result = await this.executeSQL(checkSQL, `Verificar existência de ${tableName}`);
        results[tableName] = result.data?.[0]?.exists || false;
      } catch (error) {
        results[tableName] = false;
      }
    }

    return results;
  }

  getTableStructure(tableName) {
    return HISTORICAL_TABLES[tableName] || null;
  }

  getAllTables() {
    return HISTORICAL_TABLES;
  }
}

module.exports = {
  HistoricalSchemaManager,
  HISTORICAL_TABLES
}; 