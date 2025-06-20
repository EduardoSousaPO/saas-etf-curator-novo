'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabaseClient';

export default function AuthDebugPage() {
  const { user, session, profile, loading, signIn, signOut } = useAuth();
  const [testResult, setTestResult] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const testAuth = async () => {
    try {
      const response = await fetch('/api/auth/status');
      const data = await response.json();
      setTestResult(data);
    } catch (error) {
      console.error('Erro no teste:', error);
      setTestResult({ error: 'Erro na requisição' });
    }
  };

  const testSupabaseClient = async () => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.getSession();
      console.log('Teste direto do cliente:', { data, error });
      setTestResult({ 
        message: 'Teste direto do cliente',
        session: data.session,
        error: error?.message 
      });
    } catch (error) {
      console.error('Erro no teste direto:', error);
      setTestResult({ error: 'Erro no teste direto' });
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await signIn(email, password);
      console.log('Resultado do login:', result);
      setTestResult({ loginResult: result });
    } catch (error) {
      console.error('Erro no login:', error);
      setTestResult({ error: 'Erro no login' });
    }
  };

  useEffect(() => {
    testAuth();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug de Autenticação</h1>
        
        {/* Status do Hook */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Status do useAuth</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <strong>Loading:</strong> {loading ? 'Sim' : 'Não'}
            </div>
            <div>
              <strong>User:</strong> {user ? user.email : 'Nenhum'}
            </div>
            <div>
              <strong>Session:</strong> {session ? 'Ativa' : 'Nenhuma'}
            </div>
            <div>
              <strong>Profile:</strong> {profile ? 'Carregado' : 'Nenhum'}
            </div>
          </div>
          
          {user && (
            <div className="mt-4 p-4 bg-green-50 rounded">
              <h3 className="font-semibold">Dados do Usuário:</h3>
              <pre className="text-sm mt-2">{JSON.stringify(user, null, 2)}</pre>
            </div>
          )}
        </div>

        {/* Teste de Login */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Teste de Login</h2>
          {!user ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Email:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="teste@exemplo.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Senha:</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="senha123"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Fazer Login'}
              </button>
            </form>
          ) : (
            <div>
              <p className="text-green-600 mb-4">✅ Usuário logado: {user.email}</p>
              <button
                onClick={signOut}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                disabled={loading}
              >
                {loading ? 'Carregando...' : 'Fazer Logout'}
              </button>
            </div>
          )}
        </div>

        {/* Botões de Teste */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Testes</h2>
          <div className="space-x-4">
            <button
              onClick={testAuth}
              className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            >
              Testar API Auth
            </button>
            <button
              onClick={testSupabaseClient}
              className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
            >
              Testar Cliente Direto
            </button>
          </div>
        </div>

        {/* Resultado dos Testes */}
        {testResult && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">Resultado do Teste</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
} 