/// <reference path="../types/wired-elements.d.ts" />
// Authentication screen - Sign in / Sign up
import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WiredButton from '@/components/shared/WiredButton';


const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center' 
    }}>
      <wired-card elevation="3" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
        <h1 style={{ marginBottom: '24px', textAlign: 'center' }}>
          {isSignUp ? 'Create Account' : 'Welcome Back'}
        </h1>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label htmlFor="email" style={{ display: 'block', marginBottom: '8px' }}>
              Email
            </label>
            <wired-input
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onInput={(e: any) => setEmail(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label htmlFor="password" style={{ display: 'block', marginBottom: '8px' }}>
              Password
            </label>
            <wired-input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onInput={(e: any) => setPassword(e.target.value)}
              required
              style={{ width: '100%' }}
            />
          </div>

          {error && (
            <div style={{ 
              color: '#d32f2f', 
              marginBottom: '16px', 
              fontSize: '14px' 
            }}>
              {error}
            </div>
          )}

          <WiredButton
            type="submit"
            disabled={loading}
            className="auth-submit-button full-width margin-bottom"
          >
            {loading ? 'Loading...' : (isSignUp ? 'Sign Up' : 'Sign In')}
          </WiredButton>

          <div style={{ textAlign: 'center' }}>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#666',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontSize: '14px',
              }}
            >
              {isSignUp ? 'Already have an account? Sign in' : 'Need an account? Sign up'}
            </button>
          </div>
        </form>
      </wired-card>
    </div>
  );
};

export default AuthScreen;