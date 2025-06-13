import { supabase } from './supabaseClient';
import { User, Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  name?: string;
  full_name?: string;
  email?: string;
  phone?: string;
  age?: number;
  birth_date?: string;
  country?: string;
  experience?: string;
  investment_experience?: string;
  objective?: string;
  risk_tolerance?: number;
  time_horizon?: string;
  monthly_investment?: number;
  total_patrimony?: number;
  profile?: string;
  investor_profile?: any;
  preferred_language?: string;
  email_notifications?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface AuthState {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  loading: boolean;
}

class AuthService {
  // Registrar novo usuário
  async signUp(email: string, password: string, userData?: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData || {}
        }
      });

      if (error) throw error;

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Erro no registro:', error);
      return { user: null, session: null, error };
    }
  }

  // Login
  async signIn(email: string, password: string) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      return { user: data.user, session: data.session, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      return { user: null, session: null, error };
    }
  }

  // Logout
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      return { error };
    }
  }

  // Obter usuário atual
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return { user, error: null };
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      return { user: null, error };
    }
  }

  // Obter sessão atual
  async getCurrentSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return { session, error: null };
    } catch (error) {
      console.error('Erro ao obter sessão:', error);
      return { session: null, error };
    }
  }

  // Criar/atualizar perfil do usuário
  async upsertProfile(userId: string, profileData: Partial<UserProfile>) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .upsert({
          id: userId,
          ...profileData,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;
      return { profile: data, error: null };
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      return { profile: null, error };
    }
  }

  // Obter perfil do usuário
  async getProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 = not found
      return { profile: data, error: null };
    } catch (error) {
      console.error('Erro ao obter perfil:', error);
      return { profile: null, error };
    }
  }

  // Migrar perfil do localStorage para o banco
  async migrateLocalProfile(userId: string) {
    try {
      const localProfile = localStorage.getItem('etf-curator-profile');
      if (!localProfile) return { success: false, error: 'Nenhum perfil local encontrado' };

      const profileData = JSON.parse(localProfile);
      
      // Converter formato do localStorage para formato do banco
      const dbProfile: Partial<UserProfile> = {
        full_name: profileData.name,
        investor_profile: {
          profile: profileData.profile,
          experience: profileData.experience,
          objective: profileData.objective,
          timeHorizon: profileData.timeHorizon
        },
        risk_tolerance: profileData.riskTolerance,
        investment_experience: profileData.experience,
        monthly_investment: profileData.monthlyInvestment,
        total_patrimony: profileData.totalPatrimony
      };

      const { profile, error } = await this.upsertProfile(userId, dbProfile);
      
      if (!error) {
        // Limpar localStorage após migração bem-sucedida
        localStorage.removeItem('etf-curator-profile');
        return { success: true, profile, error: null };
      }

      return { success: false, profile: null, error };
    } catch (error) {
      console.error('Erro na migração do perfil:', error);
      return { success: false, profile: null, error };
    }
  }

  // Resetar senha
  async resetPassword(email: string) {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao resetar senha:', error);
      return { error };
    }
  }

  // Atualizar senha
  async updatePassword(newPassword: string) {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { error };
    }
  }

  // Listener para mudanças de autenticação
  onAuthStateChange(callback: (event: string, session: Session | null) => void) {
    return supabase.auth.onAuthStateChange(callback);
  }
}

export const authService = new AuthService(); 