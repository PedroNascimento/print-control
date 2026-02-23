'use client';

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { saveAuth } from '@/lib/auth';

interface AuthResponse {
  token: string;
  user: { id: string; name: string; email: string };
}

export default function AuthPage() {
  const router = useRouter();
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
      const body = isRegister
        ? { name, email, password }
        : { email, password };

      const data = await api<AuthResponse>(endpoint, {
        method: 'POST',
        body,
      });

      saveAuth(data.token, data.user);
      router.push('/dashboard');
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao conectar com o servidor');
      }
    } finally {
      setLoading(false);
    }
  }

  function toggleMode() {
    setIsRegister(!isRegister);
    setError('');
    setName('');
    setEmail('');
    setPassword('');
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #0f1117 0%, #1a1040 50%, #0f1117 100%)',
      padding: '24px',
    }}>
      {/* Glow effect */}
      <div style={{
        position: 'fixed',
        top: '20%',
        left: '50%',
        transform: 'translateX(-50%)',
        width: '500px',
        height: '500px',
        background: 'radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />

      <div className="animate-fadeIn" style={{
        width: '100%',
        maxWidth: '420px',
        position: 'relative',
      }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '56px',
            height: '56px',
            background: 'linear-gradient(135deg, var(--brand-600), var(--brand-800))',
            borderRadius: 'var(--radius-lg)',
            marginBottom: '16px',
            fontSize: '24px',
          }}>
            🖨️
          </div>
          <h1 style={{
            fontSize: '28px',
            fontWeight: 700,
            letterSpacing: '-0.5px',
            marginBottom: '8px',
          }}>
            PrintControl
          </h1>
          <p style={{
            color: 'var(--text-muted)',
            fontSize: '14px',
          }}>
            Gestão financeira para gráficas
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: '32px' }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: 600,
            marginBottom: '24px',
            textAlign: 'center',
          }}>
            {isRegister ? 'Criar Conta' : 'Entrar'}
          </h2>

          <form onSubmit={handleSubmit}>
            {isRegister && (
              <div style={{ marginBottom: '16px' }}>
                <label className="input-label" htmlFor="name">Nome</label>
                <input
                  id="name"
                  type="text"
                  className="input"
                  placeholder="Seu nome completo"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoFocus
                  minLength={2}
                  autoComplete="name"
                />
              </div>
            )}

            <div style={{ marginBottom: '16px' }}>
              <label className="input-label" htmlFor="email">E-mail</label>
              <input
                id="email"
                type="email"
                className={`input ${error ? 'input-error' : ''}`}
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus={!isRegister}
                autoComplete="email"
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label className="input-label" htmlFor="password">Senha</label>
              <input
                id="password"
                type="password"
                className={`input ${error ? 'input-error' : ''}`}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete={isRegister ? 'new-password' : 'current-password'}
              />
              {isRegister && (
                <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            {error && (
              <div style={{
                padding: '10px 14px',
                background: 'var(--danger-muted)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                fontSize: '13px',
                color: 'var(--danger)',
              }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ width: '100%', padding: '12px', fontSize: '15px' }}
            >
              {loading ? (
                <>
                  <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
                  {isRegister ? 'Criando...' : 'Entrando...'}
                </>
              ) : (
                isRegister ? 'Criar conta' : 'Entrar'
              )}
            </button>
          </form>

          {/* Toggle */}
          <div style={{
            marginTop: '20px',
            textAlign: 'center',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}>
            {isRegister ? 'Já tem uma conta?' : 'Não tem conta?'}{' '}
            <button
              onClick={toggleMode}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--brand-400)',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                textDecoration: 'underline',
                textUnderlineOffset: '2px',
              }}
            >
              {isRegister ? 'Fazer login' : 'Criar conta'}
            </button>
          </div>
        </div>

        <p style={{
          textAlign: 'center',
          marginTop: '24px',
          fontSize: '12px',
          color: 'var(--text-muted)',
        }}>
          © 2025 PrintControl. Todos os direitos reservados.
        </p>
      </div>
    </div>
  );
}
