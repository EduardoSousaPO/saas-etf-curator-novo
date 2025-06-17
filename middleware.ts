import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { user },
  } = await supabase.auth.getUser()

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

  // Se usuário não está logado e tenta acessar rota protegida
  if (!user && protectedRoutes.some(route => pathname.startsWith(route))) {
    const redirectUrl = new URL('/auth/login', req.url)
    redirectUrl.searchParams.set('redirectTo', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Se usuário está logado e tenta acessar páginas de auth, redirecionar para página inicial
  if (user && authRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', req.url))
  }

  return res
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