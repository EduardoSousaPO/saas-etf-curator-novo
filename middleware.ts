import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  try {
    // Verificar usuário e sessão separadamente
    const {
      data: { user },
      error
    } = await supabase.auth.getUser()

    // Obter sessão separadamente
    const {
      data: { session }
    } = await supabase.auth.getSession()

    // Se há erro na autenticação, limpar cookies e tratar como não autenticado
    if (error) {
      console.log('🔥 Middleware: Erro na autenticação:', error.message)
      // Limpar cookies de autenticação
      res.cookies.delete('sb-etf-curator-auth-token')
      res.cookies.delete('supabase-auth-token')
    }

    // Lista de rotas que requerem autenticação
    const protectedRoutes = [
      '/dashboard',
      '/comparador', 
      '/simulador',
      '/rankings',
      '/screener',
      '/profile',
      '/settings'
    ]

    // Lista de rotas de autenticação que usuários logados não deveriam acessar
    const authRoutes = [
      '/auth/login',
      '/auth/register'
    ]

    const { pathname } = req.nextUrl

    // Verificar se a sessão não expirou (se existe)
    const isSessionValid = user && session && (!session.expires_at || session.expires_at > Math.floor(Date.now() / 1000))

    // Se usuário não está logado OU sessão inválida/expirada e tenta acessar rota protegida
    if (!isSessionValid && protectedRoutes.some(route => pathname.startsWith(route))) {
      console.log('🔒 Middleware: Redirecionando para login - usuário não autenticado ou sessão inválida')
      const redirectUrl = new URL('/auth/login', req.url)
      redirectUrl.searchParams.set('redirectTo', pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Se usuário está logado com sessão válida e tenta acessar páginas de auth, redirecionar para dashboard
    if (isSessionValid && authRoutes.some(route => pathname.startsWith(route))) {
      console.log('🏠 Middleware: Usuário logado tentando acessar auth, redirecionando para dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    return res
  } catch (error) {
    console.error('❌ Middleware: Erro inesperado:', error)
    // Em caso de erro, permitir acesso mas limpar cookies
    const res = NextResponse.next()
    res.cookies.delete('sb-etf-curator-auth-token')
    res.cookies.delete('supabase-auth-token')
    return res
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - api routes (they have their own auth handling)
     * - public assets
     */
    '/((?!_next/static|_next/image|favicon.ico|api|public).*)',
  ],
} 