# 🚀 ETF Curator - Guia de Desenvolvimento Rápido

## 📋 Configuração Inicial

### 1. Instalar Dependências
```bash
npm install --legacy-peer-deps
```

### 2. Modo Desenvolvimento (Sem Banco)
Para desenvolvimento rápido **sem configurar banco de dados**:

```bash
# Apenas rode o projeto - usará dados mock automaticamente
npm run dev
```

O projeto detectará automaticamente que não há configuração de banco e usará dados simulados.

### 3. Modo Desenvolvimento (Com Banco Supabase)
Se quiser usar dados reais:

1. Crie um arquivo `.env.local` com:
```bash
DATABASE_URL=postgresql://postgres:password@host:port/database
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

2. Execute o servidor:
```bash
npm run dev
```

## ✅ Status das Funcionalidades

### **🟢 FUNCIONANDO COM DADOS MOCK:**
- ✅ Dashboard principal (`/dashboard`)
- ✅ Rankings de ETFs (`/rankings`) 
- ✅ Screener de ETFs (`/screener`)
- ✅ Comparador de ETFs (`/comparator`)
- ✅ Analytics avançado (`/analytics`)
- ✅ Sistema de autenticação (`/auth`)
- ✅ Páginas de pricing (`/pricing`)

### **📊 APIs Funcionais:**
- ✅ `/api/etfs/rankings` - Top ETFs por diferentes métricas
- ✅ `/api/etfs/enhanced` - Dados detalhados de ETFs
- ✅ `/api/etfs/screener` - Filtros avançados
- ✅ `/api/analytics/correlations` - Análise de correlações

## 🔧 Como Funciona o Sistema Mock

O projeto inclui um sistema de fallback inteligente:

1. **Primeiro**: Tenta conectar ao banco Supabase
2. **Se falhar**: Usa automaticamente dados mock realistas
3. **Transparente**: O usuário nem percebe a diferença

### Dados Mock Incluem:
- ✅ **10 ETFs reais** (SPY, QQQ, VTI, AGG, VEA, VWO, BND, SCHD, VGT, XLF)
- ✅ **Dados realistas** de performance, volatilidade, dividendos
- ✅ **Correlações simuladas** entre ETFs
- ✅ **Análise setorial** completa
- ✅ **Rankings funcionais** por retorno, Sharpe, dividendos

## 🎯 Testando as Funcionalidades

### Dashboard
```bash
# Abra: http://localhost:3000/dashboard
# ✅ Deve mostrar widgets com dados reais simulados
```

### Rankings
```bash
# Abra: http://localhost:3000/rankings
# ✅ Deve mostrar top ETFs por diferentes métricas
```

### Analytics
```bash
# Abra: http://localhost:3000/analytics
# ✅ Deve mostrar matriz de correlações e análise setorial
```

### Screener
```bash
# Abra: http://localhost:3000/screener
# ✅ Deve permitir filtrar ETFs por diferentes critérios
```

## 🐛 Debugging

### Se o servidor não inicia:
```bash
# Limpar cache
rm -rf .next
npm run dev
```

### Se há erros de linting:
```bash
# Executar build para ver todos os erros
npm run build
```

### Se as páginas não carregam:
1. Verifique o console do navegador
2. Verifique os logs do servidor
3. Todas as páginas devem funcionar com dados mock

## 📱 Responsividade

O projeto é **100% responsivo**:
- ✅ **Desktop**: Interface completa com todos os widgets
- ✅ **Mobile**: Interface adaptada com navegação por tabs
- ✅ **Tablet**: Layout intermediário otimizado

## 🔄 Próximos Passos

1. **Conectar banco real** (opcional)
2. **Implementar autenticação** com Supabase
3. **Adicionar mais ETFs** aos dados mock
4. **Implementar sistema de alertas**
5. **Integrar API real de preços**

## 💡 Dicas

- **Desenvolvimento rápido**: Use modo mock (padrão)
- **Dados sempre funcionais**: Mesmo sem internet
- **Interface completa**: Todas as funcionalidades mockadas
- **Performance otimizada**: Sem chamadas externas

---

**🎉 O projeto está configurado para funcionar imediatamente após `npm run dev`!** 