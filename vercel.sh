#!/bin/bash
# Certifique-se de estar logado na Vercel CLI: vercel login
# E que o projeto está linkado: vercel link
# Este script assume que você fornecerá o token via variável de ambiente VERCEL_TOKEN se necessário, ou que já está logado.

echo "Iniciando deploy para produção na Vercel..."
vercel --prod
echo "Deploy finalizado."

