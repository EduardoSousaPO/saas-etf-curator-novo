"use client";

import { useState, useEffect, useContext, createContext, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { authService, UserProfile, AuthState } from '@/lib/auth';

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string, userData?: Partial<UserProfile>) => Promise<any>;
  signIn: (email: string, password: string) => Promise<any>;
  signOut: () => Promise<any>;
  updateProfile: (profileData: Partial<UserProfile>) => Promise<any>;
  upsertProfile: (profileData: Partial<UserProfile>) => Promise<any>;
  migrateLocalProfile: () => Promise<any>;
  resetPassword: (email: string) => Promise<any>;
  updatePassword: (newPassword: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔍 Inicializando autenticação...');
        
        // Verificar se há uma sessão válida
        const { session, error } = await authService.getCurrentSession();
        
        if (error) {
          console.log('❌ Erro na sessão:', error.message);
          // Limpar dados inválidos
          await authService.signOut();
          if (mounted) {
            setUser(null);
            setSession(null);
            setProfile(null);
          }
          return;
        }
        
        if (session?.user && mounted) {
          console.log('✅ Sessão válida encontrada:', session.user.email);
          
          // Verificar se a sessão não expirou
          const now = Math.floor(Date.now() / 1000);
          if (session.expires_at && session.expires_at < now) {
            console.log('⏰ Sessão expirada, fazendo logout...');
            await authService.signOut();
            setUser(null);
            setSession(null);
            setProfile(null);
            return;
          }
          
          setUser(session.user);
          setSession(session);
          
          // Buscar perfil apenas se necessário
          try {
            const { profile } = await authService.getProfile(session.user.id);
            if (mounted) {
              setProfile(profile);
            }
          } catch (profileError) {
            console.warn('⚠️ Erro ao buscar perfil:', profileError);
            // Não falhar a autenticação por causa do perfil
          }
        } else {
          console.log('❌ Nenhuma sessão válida encontrada');
          if (mounted) {
            setUser(null);
            setSession(null);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        // Em caso de erro, limpar tudo
        if (mounted) {
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
        
        if (!mounted) return;
        
        // Tratar diferentes eventos
        switch (event) {
          case 'SIGNED_IN':
            console.log('✅ Usuário logado');
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
              try {
                const { profile } = await authService.getProfile(session.user.id);
                setProfile(profile);
              } catch (error) {
                console.warn('⚠️ Erro ao buscar perfil no login:', error);
              }
            }
            break;
            
          case 'SIGNED_OUT':
            console.log('🚪 Usuário deslogado');
            setSession(null);
            setUser(null);
            setProfile(null);
            // Limpar localStorage se houver dados persistentes
            localStorage.removeItem('supabase.auth.token');
            break;
            
          case 'TOKEN_REFRESHED':
            console.log('🔄 Token renovado');
            setSession(session);
            break;
            
          default:
            setSession(session);
            setUser(session?.user ?? null);
            if (!session?.user) {
              setProfile(null);
            }
        }

        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData?: Partial<UserProfile>) => {
    setLoading(true);
    try {
      const result = await authService.signUp(email, password, userData);
      
      if (result.user && !result.error) {
        if (userData) {
          await authService.upsertProfile(result.user.id, userData);
        }
      }
      
      return result;
    } finally {
      setLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    setLoading(true);
    try {
      return await authService.signIn(email, password);
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    try {
      console.log('🚪 Iniciando logout...');
      
      // Limpar estado local primeiro
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Limpar localStorage
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-etf-curator-auth-token');
      
      // Fazer logout no Supabase
      const result = await authService.signOut();
      
      console.log('✅ Logout completo');
      return result;
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      // Mesmo com erro, garantir que o estado local seja limpo
      setUser(null);
      setSession(null);
      setProfile(null);
      return { error };
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const result = await authService.upsertProfile(user.id, profileData);
      if (result.profile && !result.error) {
        setProfile(result.profile);
      }
      return result;
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { profile: null, error };
    }
  };

  const upsertProfile = async (profileData: Partial<UserProfile>) => {
    if (!user) return { error: 'Usuário não autenticado' };

    try {
      const result = await authService.upsertProfile(user.id, profileData);
      if (result.profile && !result.error) {
        setProfile(result.profile);
      }
      return result;
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      return { profile: null, error };
    }
  };

  const migrateLocalProfile = async () => {
    if (!user) return { success: false, error: 'Usuário não autenticado' };

    try {
      const result = await authService.migrateLocalProfile(user.id);
      if (result.success && result.profile) {
        setProfile(result.profile);
      }
      return result;
    } catch (error) {
      console.error('Erro na migração:', error);
      return { success: false, error };
    }
  };

  const resetPassword = async (email: string) => {
    return await authService.resetPassword(email);
  };

  const updatePassword = async (newPassword: string) => {
    return await authService.updatePassword(newPassword);
  };

  const value: AuthContextType = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    upsertProfile,
    migrateLocalProfile,
    resetPassword,
    updatePassword
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
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
} 