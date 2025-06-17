import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Verificar a sessão do usuário
  const {
    data: { user },
    error: userError
  } = await supabase.auth.getUser()

  const {
    data: { session },
    error: sessionError
  } = await supabase.auth.getSession()

  const url = request.nextUrl.clone()
  const pathname = url.pathname

  // Logs para debugging (remover em produção)
  if (process.env.NODE_ENV === 'development') {
    console.log(`[Middleware] ${pathname} - User: ${user?.email || 'none'} - Session: ${session ? 'valid' : 'invalid'}`)
  }

  // Limpar cookies inválidos se houver erro
  if (userError || sessionError) {
    console.warn('Auth error in middleware:', userError || sessionError)
    const response = NextResponse.next()
    response.cookies.delete('sb-access-token')
    response.cookies.delete('sb-refresh-token')
    return response
  }

  // Rotas públicas que não precisam de autenticação
  const publicRoutes = [
    '/',
    '/auth/login',
    '/auth/register',
    '/auth/callback',
    '/auth/reset-password',
    '/auth/verify-email',
    '/api/health',
    '/api/landing/showcase',
    '/api/landing/stats',
    '/api/etfs/popular',
    '/api/etfs/rankings',
    '/robots.txt',
    '/sitemap.xml',
    '/favicon.ico'
  ]

  // Rotas que requerem autenticação
  const protectedRoutes = [
    '/dashboard',
    '/profile',
    '/screener',
    '/simulador',
    '/comparador',
    '/rankings',
    '/portfolios',
    '/onboarding'
  ]

  // Rotas que requerem email confirmado
  const emailConfirmationRequiredRoutes = [
    '/dashboard',
    '/profile',
    '/screener',
    '/simulador',
    '/comparador',
    '/rankings',
    '/portfolios'
  ]

  // Verificar se é uma rota pública
  const isPublicRoute = publicRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Verificar se é uma rota protegida
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Verificar se requer confirmação de email
  const requiresEmailConfirmation = emailConfirmationRequiredRoutes.some(route => 
    pathname === route || pathname.startsWith(route + '/')
  )

  // Se não há usuário e está tentando acessar rota protegida
  if (!user && isProtectedRoute) {
    url.pathname = '/auth/login'
    url.searchParams.set('redirect', pathname)
    return NextResponse.redirect(url)
  }

  // Se há usuário mas está em rota de auth, redirecionar para dashboard
  if (user && (pathname === '/auth/login' || pathname === '/auth/register')) {
    url.pathname = '/dashboard'
    url.searchParams.delete('redirect')
    return NextResponse.redirect(url)
  }

  // Verificar confirmação de email para rotas que requerem
  if (user && requiresEmailConfirmation && !user.email_confirmed_at) {
    // Se não confirmou email, redirecionar para página de verificação
    if (pathname !== '/auth/verify-email') {
      url.pathname = '/auth/verify-email'
      url.searchParams.set('email', user.email || '')
      return NextResponse.redirect(url)
    }
  }

  // Verificar se a sessão está próxima do vencimento (30 minutos antes)
  if (session) {
    const expiresAt = session.expires_at
    const now = Math.floor(Date.now() / 1000)
    const thirtyMinutes = 30 * 60

    if (expiresAt && (expiresAt - now) < thirtyMinutes) {
      // Tentar renovar a sessão automaticamente
      try {
        await supabase.auth.refreshSession()
      } catch (error) {
        console.warn('Failed to refresh session:', error)
        // Se falhar, limpar cookies e redirecionar para login
        if (isProtectedRoute) {
          const response = NextResponse.redirect(new URL('/auth/login', request.url))
          response.cookies.delete('sb-access-token')
          response.cookies.delete('sb-refresh-token')
          return response
        }
      }
    }
  }

  // Rate limiting para rotas de API sensíveis (implementação básica)
  if (pathname.startsWith('/api/auth/') || pathname.startsWith('/api/user/')) {
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    // Aqui você poderia implementar rate limiting mais sofisticado
    // usando Redis ou outra solução de cache
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
} 