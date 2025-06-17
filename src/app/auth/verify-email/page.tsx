'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, RefreshCw, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'react-hot-toast';

export default function VerifyEmailPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, resendConfirmation, signOut } = useAuth();
  
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Obter email dos parâmetros da URL ou do usuário autenticado
    const emailFromParams = searchParams.get('email');
    const userEmail = user?.email;
    
    if (emailFromParams) {
      setEmail(emailFromParams);
    } else if (userEmail) {
      setEmail(userEmail);
    }
  }, [searchParams, user]);

  useEffect(() => {
    // Countdown para reenvio
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown(resendCooldown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleResendEmail = async () => {
    if (!email) {
      toast.error('Email não encontrado');
      return;
    }

    if (resendCooldown > 0) {
      toast.error(`Aguarde ${resendCooldown} segundos antes de reenviar`);
      return;
    }

    setIsResending(true);

    try {
      const { error } = await resendConfirmation(email);
      
      if (error) {
        if (error.message?.includes('rate_limit')) {
          toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
          setResendCooldown(300); // 5 minutos
        } else if (error.message?.includes('already_confirmed')) {
          toast.success('Email já confirmado! Redirecionando...');
          setTimeout(() => router.push('/dashboard'), 2000);
        } else {
          toast.error(error.message || 'Erro ao reenviar email');
        }
      } else {
        toast.success('Email de confirmação reenviado!');
        setResendCooldown(60); // 1 minuto
      }
    } catch (error) {
      console.error('Erro ao reenviar email:', error);
      toast.error('Erro inesperado. Tente novamente.');
    } finally {
      setIsResending(false);
    }
  };

  const handleChangeEmail = async () => {
    await signOut();
    router.push('/auth/register');
  };

  const handleBackToLogin = async () => {
    await signOut();
    router.push('/auth/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex items-center justify-center px-4 py-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6">
            <h1 className="text-3xl font-bold text-gray-900">
              ETF<span className="font-light">Curator</span>
            </h1>
          </Link>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-6">
            <Mail className="w-8 h-8 text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Verifique seu email
          </h2>

          {/* Description */}
          <div className="text-gray-600 mb-8">
            <p className="mb-4">
              Enviamos um link de confirmação para:
            </p>
            <p className="font-medium text-gray-900 bg-gray-50 py-2 px-4 rounded-lg">
              {email || 'seu email'}
            </p>
            <p className="mt-4 text-sm">
              Clique no link do email para ativar sua conta e acessar todas as funcionalidades do ETF Curator.
            </p>
          </div>

          {/* Instructions */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h3 className="font-medium text-blue-900 mb-2 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              O que fazer agora:
            </h3>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>Abra seu aplicativo de email</li>
              <li>Procure por um email do ETF Curator</li>
              <li>Clique no botão &quot;Confirmar Email&quot;</li>
              <li>Você será redirecionado automaticamente</li>
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertCircle className="w-5 h-5 text-amber-600 mr-2 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="text-sm text-amber-800">
                  <strong>Não encontrou o email?</strong><br />
                  Verifique sua caixa de spam ou lixo eletrônico. 
                  Emails de confirmação podem ser filtrados automaticamente.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-4">
            {/* Resend Email Button */}
            <button
              onClick={handleResendEmail}
              disabled={isResending || resendCooldown > 0}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Reenviando...
                </>
              ) : resendCooldown > 0 ? (
                <>
                  Reenviar em {resendCooldown}s
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Reenviar email
                </>
              )}
            </button>

            {/* Change Email */}
            <button
              onClick={handleChangeEmail}
              className="w-full text-gray-600 py-3 px-4 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors font-medium"
            >
              Usar outro email
            </button>

            {/* Back to Login */}
            <button
              onClick={handleBackToLogin}
              className="w-full text-gray-500 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors font-medium flex items-center justify-center"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar ao login
            </button>
          </div>

          {/* Help Text */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-500">
              Ainda com problemas?{' '}
              <a 
                href="mailto:suporte@etfcurator.com" 
                className="text-blue-600 hover:underline font-medium"
              >
                Entre em contato
              </a>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Ao confirmar seu email, você terá acesso completo a todas as funcionalidades do ETF Curator
          </p>
        </div>
      </div>
    </div>
  );
} 