# Atualização do Node.js para MCP Server

## Situação Atual
- **Node.js atual**: v18.18.0
- **Node.js necessário**: v20.0.0 ou superior
- **NPM atual**: v10.9.0 ✅

## Opções para Atualizar Node.js

### Opção 1: Usando Node Version Manager (NVM) - Recomendado

#### Para Windows (nvm-windows):

1. **Baixar NVM para Windows:**
   - Acesse: https://github.com/coreybutler/nvm-windows/releases
   - Baixe o `nvm-setup.exe` da versão mais recente

2. **Instalar NVM:**
   ```powershell
   # Execute o nvm-setup.exe como administrador
   ```

3. **Instalar Node.js 20:**
   ```powershell
   nvm install 20.11.0
   nvm use 20.11.0
   ```

4. **Verificar instalação:**
   ```powershell
   node --version
   npm --version
   ```

### Opção 2: Download Direto do Site Oficial

1. **Acessar site oficial:**
   - Vá para: https://nodejs.org/
   - Baixe a versão LTS (Long Term Support) mais recente

2. **Instalar:**
   - Execute o instalador baixado
   - Siga as instruções do assistente

3. **Verificar:**
   ```powershell
   node --version
   npm --version
   ```

### Opção 3: Usando Chocolatey (se instalado)

```powershell
# Instalar Node.js via Chocolatey
choco install nodejs --version=20.11.0

# Ou atualizar se já instalado
choco upgrade nodejs
```

## Após Atualizar Node.js

1. **Reiniciar terminal/PowerShell**
2. **Verificar versões:**
   ```powershell
   node --version  # Deve mostrar v20.x.x
   npm --version   # Deve mostrar versão compatível
   ```

3. **Testar MCP Server:**
   - Reiniciar Cursor
   - Verificar se o MCP Server do Mercado Pago aparece nas configurações

## Solução de Problemas

### Node.js não atualizado após instalação
- Reinicie completamente o terminal/PowerShell
- Verifique se não há múltiplas instalações do Node.js
- Use `where node` para ver qual versão está sendo usada

### Erro de permissões
- Execute o terminal como administrador
- Verifique se o PATH está configurado corretamente

### NPM não funciona após atualização
```powershell
# Reinstalar NPM se necessário
npm install -g npm@latest
```

## Verificação Final

Após atualizar, execute:
```powershell
node --version && npm --version
```

Deve mostrar:
- Node.js: v20.x.x ou superior
- NPM: v10.x.x ou superior 