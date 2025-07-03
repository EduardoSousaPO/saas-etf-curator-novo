"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabaseClient';
import { toast } from 'react-hot-toast';
import { UserProfile } from '@/lib/auth';

interface AuthContextType {
  user: (User & { access_token?: string }) | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, userData?: any) => Promise<{ user: User | null; error: any }>;
  signIn: (email: string, password: string) => Promise<{ user: User | null; error: any }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  updatePassword: (password: string) => Promise<{ error: any }>;
  resendConfirmation: (email: string) => Promise<{ error: any }>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<{ profile: UserProfile | null; error: any }>;
  isEmailConfirmed: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEmailConfirmed, setIsEmailConfirmed] = useState(false);
  const [mounted, setMounted] = useState(false);

  const supabase = createClient();

  // Proteção contra hidratação
  useEffect(() => {
    setMounted(true);
  }, []);

  // Função para carregar o perfil do usuário
  const loadProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao carregar perfil:', error);
        return;
      }

      setProfile(data);
    } catch (error) {
      console.error('Erro inesperado ao carregar perfil:', error);
    }
  };

  useEffect(() => {
    if (!mounted) return;

    let isMounted = true;

    // Função para verificar sessão atual
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao obter sessão:', error);
          if (isMounted) {
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsEmailConfirmed(false);
            setLoading(false);
          }
        } else if (isMounted) {
          setSession(session);
          const userWithToken = session?.user ? {
            ...session.user,
            access_token: session.access_token
          } : null;
          setUser(userWithToken);
          setIsEmailConfirmed(session?.user?.email_confirmed_at ? true : false);
          
          // Carregar perfil se usuário estiver autenticado
          if (session?.user) {
            await loadProfile(session.user.id);
          }
          setLoading(false);
        }
      } catch (error) {
        console.error('Erro inesperado ao verificar sessão:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Listener para mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;

  

        setSession(session);
        const userWithToken = session?.user ? {
          ...session.user,
          access_token: session.access_token
        } : null;
        setUser(userWithToken);
        setIsEmailConfirmed(session?.user?.email_confirmed_at ? true : false);

        // Carregar perfil se usuário estiver autenticado
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
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
            setUser(null);
            setSession(null);
            setProfile(null);
            setIsEmailConfirmed(false);
            break;
          case 'TOKEN_REFRESHED':
            break;
          case 'USER_UPDATED':
            break;
        }
      }
    );

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [mounted]);

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      setLoading(true);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
        }
      });

      if (error) {
        console.error('Erro no signup:', error);
        return { user: null, error };
      }

      // Se o usuário foi criado, tentar criar perfil como fallback
      if (data.user) {
        try {
          // Tentar criar perfil (fallback caso o trigger do banco falhe)
          const profileData = {
            id: data.user.id,
            email: data.user.email || email,
            full_name: userData?.full_name || '',
            phone: userData?.phone || null,
            birth_date: userData?.birth_date || null,
            country: userData?.country || null,
            investment_experience: userData?.investment_experience || 'iniciante',
            risk_tolerance: userData?.risk_tolerance || 5,
            monthly_investment: userData?.monthly_investment || null,
            total_patrimony: userData?.total_patrimony || null,
            email_notifications: userData?.email_notifications ?? true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };

          // Tentar inserir perfil (se já existir, será ignorado)
          const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert(profileData, { 
              onConflict: 'id',
              ignoreDuplicates: true 
            });

          if (profileError) {
            console.warn('Aviso: Não foi possível criar perfil inicial:', profileError);
            // Não falhar o registro por causa disso, pois o trigger pode ter funcionado
          }
        } catch (profileErr) {
          console.warn('Aviso: Erro ao criar perfil inicial:', profileErr);
          // Não falhar o registro por causa disso
        }

        if (!data.user.email_confirmed_at) {
          toast.success('Conta criada! Verifique seu email para ativar.');
        }
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Erro inesperado no signup:', error);
      return { user: null, error };
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
        
        if (error.message?.includes('Invalid login credentials')) {
          return { user: null, error: { message: 'Email ou senha incorretos' } };
        } else if (error.message?.includes('Email not confirmed')) {
          return { user: null, error: { message: 'Email not confirmed' } };
        }
        
        return { user: null, error };
      }

      // Verificar se o email foi confirmado
      if (data.user && !data.user.email_confirmed_at) {
        // Fazer logout imediatamente se email não foi confirmado
        await supabase.auth.signOut();
        return { 
          user: null, 
          error: { message: 'Email not confirmed' }
        };
      }

      return { user: data.user, error: null };
    } catch (error: any) {
      console.error('Erro inesperado no signin:', error);
      return { user: null, error };
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Erro no signout:', error);
        toast.error('Erro ao fazer logout');
      } else {
        // Limpeza manual dos estados
        setUser(null);
        setSession(null);
        setProfile(null);
        setIsEmailConfirmed(false);
        toast.success('Logout realizado com sucesso');
      }
    } catch (error) {
      console.error('Erro inesperado no signout:', error);
      toast.error('Erro inesperado ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback?type=recovery` : undefined
      });

      if (error) {
        console.error('Erro no reset de senha:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro inesperado no reset de senha:', error);
      return { error };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        console.error('Erro ao atualizar senha:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar senha:', error);
      return { error };
    }
  };

  const resendConfirmation = async (email: string) => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email,
        options: {
          emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/auth/callback` : undefined
        }
      });

      if (error) {
        console.error('Erro ao reenviar confirmação:', error);
        return { error };
      }

      return { error: null };
    } catch (error: any) {
      console.error('Erro inesperado ao reenviar confirmação:', error);
      return { error };
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    try {
      if (!user) {
        return { profile: null, error: { message: 'Usuário não autenticado' } };
      }

      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: user.id,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return { profile: null, error };
      }

      setProfile(data);
      return { profile: data, error: null };
    } catch (error: any) {
      console.error('Erro inesperado ao atualizar perfil:', error);
      return { profile: null, error };
    }
  };

  // Renderizar loading até estar montado
  if (!mounted) {
    return (
      <AuthContext.Provider value={{
        user: null,
        session: null,
        profile: null,
        loading: true,
        signUp,
        signIn,
        signOut,
        resetPassword,
        updatePassword,
        resendConfirmation,
        updateProfile,
        isEmailConfirmed: false
      }}>
        <div suppressHydrationWarning>{children}</div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      loading,
      signUp,
      signIn,
      signOut,
      resetPassword,
      updatePassword,
      resendConfirmation,
      updateProfile,
      isEmailConfirmed
    }}>
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