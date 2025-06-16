# 📱 ETFCurator Mobile App

App mobile React Native para o ETFCurator, oferecendo experiência premium para análise de ETFs em dispositivos móveis.

## 🚀 Funcionalidades

### ✅ Implementadas
- **Dashboard Mobile**: Interface otimizada para mobile
- **Screener Portátil**: Busca rápida de ETFs com filtros touch-friendly
- **Recomendações Push**: Notificações inteligentes de oportunidades
- **Simulador Rápido**: Criação de carteiras com gestos intuitivos
- **Autenticação Biométrica**: Login seguro com impressão digital/Face ID

### 🔄 Em Desenvolvimento
- **Modo Offline**: Cache inteligente para dados essenciais
- **Widget iOS/Android**: Resumo da carteira na tela inicial
- **Apple Watch/Wear OS**: Acompanhamento básico no pulso
- **Siri Shortcuts**: Comandos de voz para ações rápidas

## 🛠️ Stack Tecnológica

- **Framework**: React Native + Expo
- **Navegação**: React Navigation 6
- **UI**: React Native Paper + Design System próprio
- **Estado**: Context API + AsyncStorage
- **Gráficos**: React Native Chart Kit
- **Autenticação**: Expo Auth Session + Biometrics
- **Notificações**: Expo Notifications

## 📦 Instalação e Setup

```bash
# Instalar dependências
cd mobile
npm install

# Executar no iOS
npm run ios

# Executar no Android
npm run android

# Build para produção
npm run build:ios     # iOS
npm run build:android # Android
```

## 📱 Arquitetura do App

```
mobile/
├── src/
│   ├── screens/           # Telas principais
│   │   ├── HomeScreen.tsx
│   │   ├── ScreenerScreen.tsx
│   │   ├── RecommendationsScreen.tsx
│   │   ├── SimulatorScreen.tsx
│   │   └── ProfileScreen.tsx
│   ├── components/        # Componentes reutilizáveis
│   │   ├── ETFCard.tsx
│   │   ├── ChartView.tsx
│   │   └── FilterModal.tsx
│   ├── services/         # Serviços e APIs
│   │   ├── AuthService.ts
│   │   ├── ETFService.ts
│   │   └── NotificationService.ts
│   ├── hooks/            # Custom hooks
│   │   ├── useETFData.ts
│   │   └── useRecommendations.ts
│   ├── navigation/       # Configuração de navegação
│   ├── theme/           # Design system e cores
│   └── utils/           # Utilitários
├── assets/              # Imagens e ícones
└── app.json            # Configuração Expo
```

## 🎯 Funcionalidades Detalhadas

### 🏠 Home Screen
- **Dashboard Personalizado**: Métricas relevantes ao perfil
- **Insights Rápidos**: Cards com oportunidades do dia
- **Ações Rápidas**: Botões para funcionalidades principais
- **Notificações**: Centro de alertas e atualizações

### 🔍 Screener Mobile
- **Busca Inteligente**: Autocomplete com sugestões
- **Filtros Touch**: Interface otimizada para toque
- **Resultados Paginados**: Scroll infinito performático
- **Comparação Rápida**: Swipe para comparar ETFs

### 🤖 Recomendações Push
- **Notificações Inteligentes**: Baseadas em perfil e comportamento
- **Timing Otimizado**: Horários ideais para cada usuário
- **Ações Diretas**: Deep links para ações específicas
- **Personalização**: Controle granular de preferências

### 📊 Simulador Mobile
- **Interface Gestual**: Drag & drop para alocações
- **Visualização Dinâmica**: Gráficos responsivos ao toque
- **Cenários Rápidos**: Templates pré-configurados
- **Sharing**: Compartilhamento de carteiras simuladas

### 👤 Perfil & Configurações
- **Biometria**: Configuração de autenticação
- **Sincronização**: Sync com versão web
- **Offline Mode**: Configuração de cache
- **Notificações**: Gerenciamento de alertas

## 📊 Performance e Otimizações

### 🚀 Otimizações Implementadas
- **Lazy Loading**: Componentes carregados sob demanda
- **Image Caching**: Cache inteligente de ícones ETFs
- **Data Compression**: Compressão de dados da API
- **Bundle Splitting**: Separação por funcionalidade

### 📱 Experiência Mobile-First
- **Gestos Nativos**: Swipe, pinch, pull-to-refresh
- **Animações Fluidas**: 60fps com Reanimated
- **Haptic Feedback**: Feedback tátil em ações importantes
- **Temas**: Dark/Light mode automático

## 🔔 Sistema de Notificações

### Tipos de Notificação
1. **Alertas de Preço**: Quando ETF atinge threshold
2. **Oportunidades**: IA detecta oportunidades relevantes
3. **Rebalanceamento**: Sugestões de rebalanceamento
4. **Educacional**: Dicas e conteúdo personalizado
5. **Mercado**: Eventos importantes do mercado

### Configuração Inteligente
- **Machine Learning**: Aprende horários ideais do usuário
- **Relevância**: Filtra por importância e perfil
- **Batching**: Agrupa notificações relacionadas
- **Quiet Hours**: Respeita horários de descanso

## 🔄 Sincronização com Web

### Dados Sincronizados
- **Perfil de Investidor**: Preferências e configurações
- **Favoritos**: ETFs marcados como favoritos
- **Alertas**: Configurações de monitoramento
- **Histórico**: Buscas e ações realizadas
- **Carteiras**: Simulações salvas

### Estratégia Offline-First
- **Cache Inteligente**: Dados essenciais sempre disponíveis
- **Sync Queue**: Fila de ações para quando conectar
- **Conflict Resolution**: Resolução de conflitos automática
- **Progressive Enhancement**: Funciona offline, melhor online

## 🚀 Roadmap Mobile

### Versão 1.0 (MVP) ✅
- [x] Autenticação e onboarding
- [x] Screener básico
- [x] Recomendações IA
- [x] Simulador simples
- [x] Notificações push

### Versão 1.1 (Q2 2025)
- [ ] Modo offline completo
- [ ] Widgets nativos
- [ ] Apple Watch app
- [ ] Siri Shortcuts
- [ ] Melhorias de performance

### Versão 1.2 (Q3 2025)
- [ ] Android Wear app
- [ ] AR para visualização de dados
- [ ] Voice commands
- [ ] Social features
- [ ] Advanced charting

### Versão 2.0 (Q4 2025)
- [ ] AI-powered portfolio management
- [ ] Automated rebalancing
- [ ] Tax optimization
- [ ] Professional tools
- [ ] API access

## 🔐 Segurança Mobile

### Medidas Implementadas
- **Biometric Auth**: Touch ID, Face ID, Fingerprint
- **Certificate Pinning**: Proteção contra MITM
- **Data Encryption**: Dados sensíveis criptografados
- **Secure Storage**: Keychain/Keystore para tokens
- **Jailbreak Detection**: Proteção em devices comprometidos

### Compliance
- **LGPD**: Conformidade com lei brasileira
- **SOC 2**: Auditoria de segurança
- **App Store Guidelines**: Conformidade total
- **Google Play Policies**: Atende todas as diretrizes

## 📈 Analytics e Monitoramento

### Métricas Coletadas
- **Engagement**: Tempo de sessão, telas visitadas
- **Performance**: Crash rates, loading times
- **Features**: Uso de funcionalidades específicas
- **User Journey**: Fluxos e drop-offs
- **Business**: Conversões e retenção

### Ferramentas
- **Expo Analytics**: Métricas básicas
- **Firebase**: Crash reporting e performance
- **Amplitude**: User behavior analytics
- **Sentry**: Error tracking detalhado

---

## 🎯 Conclusão

O app mobile do ETFCurator oferece uma experiência premium e otimizada para investidores que precisam acessar análises de ETFs em movimento. Com funcionalidades inteligentes, notificações personalizadas e interface mobile-first, representa a evolução natural da plataforma web.

**Status**: MVP pronto para desenvolvimento  
**Timeline**: 3-4 meses para versão 1.0  
**Plataformas**: iOS 14+, Android 8+ 