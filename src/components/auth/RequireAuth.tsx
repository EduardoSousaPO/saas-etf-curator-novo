'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { Shield, User, ArrowRight, CheckCircle, AlertTriangle } from 'lucide-react';
import Link from 'next/link';

interface RequireAuthProps {
  children: React.ReactNode;
  redirectTo?: string;
  requireProfile?: boolean;
}

export default function RequireAuth({ 
  children, 
  redirectTo = '/auth/login',
  requireProfile = false 
}: RequireAuthProps) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        setShowLoginPrompt(true);
        // Aguardar um pouco antes de redirecionar para mostrar a mensagem
        const timer = setTimeout(() => {
          router.push(`${redirectTo}?redirectTo=${encodeURIComponent(window.location.pathname)}`);
        }, 2000);
        return () => clearTimeout(timer);
      } else if (requireProfile && !profile?.full_name) {
        router.push('/profile?required=true');
      }
    }
  }, [user, profile, loading, router, redirectTo, requireProfile]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mb-4"></div>
          <p className="text-gray-600">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  if (!user && showLoginPrompt) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <Shield className="mx-auto h-16 w-16 text-red-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Acesso Restrito
              </h2>
              <p className="text-gray-600">
                Esta página requer autenticação. Você será redirecionado para o login.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center text-amber-600 bg-amber-50 rounded-lg p-3">
                <AlertTriangle className="h-5 w-5 mr-2" />
                <span className="text-sm">Redirecionando em 2 segundos...</span>
              </div>

              <div className="flex space-x-3">
                <Link
                  href="/auth/login"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <User className="w-4 h-4 mr-2" />
                  Fazer Login
                </Link>
                <Link
                  href="/auth/register"
                  className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Criar Conta
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (requireProfile && user && !profile?.full_name) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="mb-6">
              <User className="mx-auto h-16 w-16 text-blue-500 mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Perfil Incompleto
              </h2>
              <p className="text-gray-600">
                Complete seu perfil para acessar todas as funcionalidades personalizadas.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-center text-blue-600 bg-blue-50 rounded-lg p-3">
                <CheckCircle className="h-5 w-5 mr-2" />
                <span className="text-sm">Usuário autenticado: {user.email}</span>
              </div>

              <Link
                href="/profile"
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Completar Perfil
                <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Ainda está redirecionando
  }

  return <>{children}</>;
} 