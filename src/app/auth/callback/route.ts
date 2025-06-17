import { createClient } from '@/lib/supabaseClient'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/dashboard'
  const error = searchParams.get('error')
  const error_description = searchParams.get('error_description')

  console.log('Auth callback:', { code: !!code, error, error_description })

  // Se há erro nos parâmetros
  if (error) {
    console.error('Auth callback error:', error, error_description)
    
    let redirectUrl = `${origin}/auth/login`
    let errorMessage = 'Erro na autenticação'

    // Tratar diferentes tipos de erro
    switch (error) {
      case 'access_denied':
        errorMessage = 'Acesso negado'
        break
      case 'invalid_request':
        errorMessage = 'Solicitação inválida'
        break
      case 'email_not_confirmed':
        errorMessage = 'Email não confirmado'
        redirectUrl = `${origin}/auth/verify-email`
        break
      default:
        errorMessage = error_description || error
    }

    return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(errorMessage)}`)
  }

  // Se não há código de autorização
  if (!code) {
    console.error('No authorization code provided')
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Código de autorização não fornecido')}`)
  }

  const supabase = createClient()

  try {
    // Trocar o código por uma sessão
    const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code)
    
    if (exchangeError) {
      console.error('Error exchanging code for session:', exchangeError)
      
      let errorMessage = 'Erro ao processar confirmação'
      let redirectUrl = `${origin}/auth/login`

      // Tratar erros específicos
      if (exchangeError.message?.includes('expired')) {
        errorMessage = 'Link de confirmação expirado. Solicite um novo.'
        redirectUrl = `${origin}/auth/verify-email`
      } else if (exchangeError.message?.includes('invalid')) {
        errorMessage = 'Link de confirmação inválido.'
      } else if (exchangeError.message?.includes('used')) {
        errorMessage = 'Link de confirmação já foi usado.'
      }

      return NextResponse.redirect(`${redirectUrl}?error=${encodeURIComponent(errorMessage)}`)
    }

    const { user, session } = data

    if (!user || !session) {
      console.error('No user or session after code exchange')
      return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Erro ao criar sessão')}`)
    }

    console.log('User authenticated successfully:', user.email)

    // Verificar se o email foi confirmado
    if (!user.email_confirmed_at) {
      console.log('Email not confirmed yet, redirecting to verify-email')
      return NextResponse.redirect(`${origin}/auth/verify-email?email=${encodeURIComponent(user.email || '')}`)
    }

    // Verificar se é um usuário novo (primeira confirmação de email)
    const isNewUser = !user.last_sign_in_at || user.created_at === user.email_confirmed_at

    // Definir para onde redirecionar
    let redirectPath = next

    if (isNewUser && next === '/dashboard') {
      // Novos usuários vão para onboarding
      redirectPath = '/onboarding'
    }

    // Criar resposta de redirecionamento
    const response = NextResponse.redirect(`${origin}${redirectPath}`)

    // Adicionar headers de segurança
    response.headers.set('Cache-Control', 'no-cache, no-store, max-age=0, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    // Log de sucesso
    console.log(`Redirecting ${isNewUser ? 'new' : 'existing'} user to:`, redirectPath)

    return response

  } catch (error) {
    console.error('Unexpected error in auth callback:', error)
    return NextResponse.redirect(`${origin}/auth/login?error=${encodeURIComponent('Erro inesperado na autenticação')}`)
  }
}

export async function POST(request: NextRequest) {
  // Método POST não é suportado para callback
  return NextResponse.json(
    { error: 'Method not allowed' },
    { status: 405 }
  )
} 