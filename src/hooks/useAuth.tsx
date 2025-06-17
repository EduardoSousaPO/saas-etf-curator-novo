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
    const initializeAuth = async () => {
      try {
        console.log('🔍 Inicializando autenticação...');
        const { session } = await authService.getCurrentSession();
        
        if (session?.user) {
          console.log('✅ Sessão encontrada:', session.user.email);
          setUser(session.user);
          setSession(session);
          
          const { profile } = await authService.getProfile(session.user.id);
          setProfile(profile);
        } else {
          console.log('❌ Nenhuma sessão encontrada');
          setUser(null);
          setSession(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('❌ Erro ao inicializar autenticação:', error);
        // Em caso de erro, limpar tudo
        setUser(null);
        setSession(null);
        setProfile(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          const { profile } = await authService.getProfile(session.user.id);
          setProfile(profile);
        } else {
          setProfile(null);
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
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
      const result = await authService.signOut();
      if (!result.error) {
        setUser(null);
        setSession(null);
        setProfile(null);
      }
      return result;
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