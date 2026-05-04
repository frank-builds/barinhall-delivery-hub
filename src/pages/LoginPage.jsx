import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.jsx';

export function LoginPage() {
  const { user, signIn, signUp } = useAuth();
  const [mode,       setMode]       = useState('signin');
  const [email,      setEmail]      = useState('');
  const [password,   setPassword]   = useState('');
  const [error,      setError]      = useState('');
  const [message,    setMessage]    = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setMessage('');
    setSubmitting(true);
    try {
      if (mode === 'signin') {
        await signIn(email, password);
      } else {
        await signUp(email, password);
        setMessage('Check your email to confirm your account, then sign in.');
        setMode('signin');
      }
    } catch (err) {
      setError(err.message ?? 'Something went wrong.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center px-4 py-12">

      {/* Brand header */}
      <div className="mb-8 text-center">
        <img
          src="/barinhall-logo.png"
          alt="Barinhall"
          className="h-10 w-auto mx-auto mb-4 object-contain"
        />
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Delivery Hub
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          {mode === 'signin' ? 'Sign in to your account' : 'Create a new account'}
        </p>
      </div>

      {/* Form card */}
      <div className="w-full max-w-sm">
        <form onSubmit={handleSubmit} className="bh-card p-6 space-y-4">

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5">
              {error}
            </p>
          )}
          {message && (
            <p className="text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2.5">
              {message}
            </p>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={e => setEmail(e.target.value)}
              className="bh-input"
              placeholder="you@example.com"
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1.5">
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="bh-input"
              placeholder="••••••••"
              autoComplete={mode === 'signin' ? 'current-password' : 'new-password'}
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="bh-btn-primary w-full mt-1"
          >
            {submitting
              ? (mode === 'signin' ? 'Signing in…' : 'Creating account…')
              : (mode === 'signin' ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <p className="text-center text-sm text-slate-500 mt-4">
          {mode === 'signin' ? (
            <>Don&apos;t have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(''); setMessage(''); }}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Sign up
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(''); setMessage(''); }}
                className="text-indigo-600 hover:text-indigo-800 font-medium transition-colors"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
