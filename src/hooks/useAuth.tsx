"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthError, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: AuthError | null }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: AuthError | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>;
  updatePassword: (password: string) => Promise<{ error: AuthError | null }>;
  resendConfirmation: (email: string) => Promise<{ error: AuthError | null }>;
  isEmailConfirmed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);

  const supabase = createClient();

  useEffect(() => {
    let mounted = true;

    // Função para verificar sessão atual
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          // Limpar dados locais se houver erro na sessão
          localStorage.removeItem('supabase.auth.token');
          setUser(null);
          setSession(null);
          setIsEmailConfirmed(false);
        } else if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          setIsEmailConfirmed(session?.user?.email_confirmed_at ? true : false);
        }
      } catch (error) {
        console.error('Erro inesperado ao verificar sessão:', error);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        console.log('Auth state changed:', event, session?.user?.email);

        setSession(session);
        setUser(session?.user ?? null);
        setIsEmailConfirmed(session?.user?.email_confirmed_at ? true : false);

        // Atualizar loading apenas após processar o evento
        if (event === 'INITIAL_SESSION') {
          setLoading(false);
        }

        // Tratamento específico para diferentes eventos
        switch (event) {
          case 'SIGNED_IN':
            if (session?.user?.email_confirmed_at) {
              toast.success('Login realizado com sucesso!');
            } else {
              toast.error('Por favor, confirme seu email antes de continuar.');
            }
            break;
          case 'SIGNED_OUT':
            // Limpeza completa
            localStorage.removeItem('supabase.auth.token');
            setUser(null);
            setSession(null);
            setIsEmailConfirmed(false);
            break;
          case 'TOKEN_REFRESHED':
            console.log('Token refreshed successfully');
            break;
          case 'USER_UPDATED':
            console.log('User data updated');
            break;
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Erro no signup:', error);
        return { user: null, error };
      }

      // Se o usuário foi criado mas precisa confirmar email
      if (data.user && !data.user.email_confirmed_at) {
        toast.success('Conta criada! Verifique seu email para ativar.');
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Erro inesperado no signup:', error);
      return { 
        user: null, 
        error: { message: 'Erro inesperado durante o registro' } as AuthError 
      };
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('Erro no signin:', error);
        
        // Tratamento específico de erros de login
        let errorMessage = error.message;
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = 'Email ou senha incorretos';
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = 'Por favor, confirme seu email antes de fazer login';
        } else if (error.message.includes('Too many requests')) {
          errorMessage = 'Muitas tentativas de login. Tente novamente em alguns minutos';
        }

        return { 
          user: null, 
          error: { ...error, message: errorMessage } 
        };
      }

      // Verificar se o email foi confirmado
      if (data.user && !data.user.email_confirmed_at) {
        await supabase.auth.signOut();
        return {
          user: null,
          error: { message: 'Por favor, confirme seu email antes de fazer login' } as AuthError
        };
      }

      return { user: data.user, error: null };
    } catch (error) {
      console.error('Erro inesperado no signin:', error);
      return { 
        user: null, 
        error: { message: 'Erro inesperado durante o login' } as AuthError 
      };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Limpeza local antes do logout
      localStorage.removeItem('supabase.auth.token');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no logout:', error);
        toast.error('Erro ao fazer logout');
      } else {
        // Limpeza do estado
        setUser(null);
        setSession(null);
        setIsEmailConfirmed(false);
        toast.success('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro inesperado no logout:', error);
      toast.error('Erro inesperado ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) {
        console.error('Erro ao solicitar reset de senha:', error);
        return { error };
      }

      toast.success('Email de recuperação enviado! Verifique sua caixa de entrada.');
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado no reset de senha:', error);
      return { 
        error: { message: 'Erro inesperado ao solicitar recuperação de senha' } as AuthError 
      };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password
      });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        return { error };
      }

      toast.success('Senha atualizada com sucesso!');
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado ao atualizar senha:', error);
      return { 
        error: { message: 'Erro inesperado ao atualizar senha' } as AuthError 
      };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) {
        console.error('Erro ao reenviar confirmação:', error);
        return { error };
      }

      toast.success('Email de confirmação reenviado!');
      return { error: null };
    } catch (error) {
      console.error('Erro inesperado ao reenviar confirmação:', error);
      return { 
        error: { message: 'Erro inesperado ao reenviar confirmação' } as AuthError 
      };
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
    resendConfirmation,
    isEmailConfirmed
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 