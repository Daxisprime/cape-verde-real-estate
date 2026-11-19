'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Zap, Loader2, Mail, Lock, AlertCircle } from 'lucide-react';
import { zapproClient } from '@/lib/zappro';

export default function ZapProLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const client = zapproClient();
    if (!client) return;
    client.auth.getSession().then(({ data: { session } }) => {
      if (session) router.replace('/dashboard/zappro');
    });
  }, [router]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const client = zapproClient();
    if (!client) {
      setError('Authentication is not configured.');
      return;
    }
    setLoading(true);
    try {
      if (mode === 'signin') {
        const { error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } else {
        const { error } = await client.auth.signUp({ email, password });
        if (error) throw error;
      }
      router.replace('/dashboard/zappro');
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F172A] text-white flex flex-col">
      <header className="px-4 h-16 flex items-center">
        <Link href="/" className="flex items-center gap-2">
          <span className="font-bold text-xl">ZapPro</span>
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#EF4444] opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EF4444]" />
          </span>
        </Link>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#16A34A]">
              <Zap className="h-7 w-7 text-white" />
            </div>
            <h1 className="text-2xl font-bold">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              {mode === 'signin' ? 'Sign in to your ZapPro merchant dashboard.' : 'Start selling on WhatsApp in minutes.'}
            </p>
          </div>

          <div className="rounded-2xl bg-white/5 ring-1 ring-white/10 p-6">
            <div className="grid grid-cols-2 gap-1 p-1 rounded-lg bg-white/5 mb-6">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className={`py-2 rounded-md text-sm font-semibold transition-colors ${mode === 'signin' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className={`py-2 rounded-md text-sm font-semibold transition-colors ${mode === 'signup' ? 'bg-white text-slate-900' : 'text-slate-300 hover:text-white'}`}
              >
                Sign Up
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@business.com"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/10 text-white placeholder:text-slate-500 ring-1 ring-white/15 focus:ring-2 focus:ring-[#16A34A] outline-none text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3 py-2.5 rounded-lg bg-white/10 text-white placeholder:text-slate-500 ring-1 ring-white/15 focus:ring-2 focus:ring-[#16A34A] outline-none text-sm"
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-lg bg-rose-500/10 ring-1 ring-rose-500/30 px-3 py-2.5 text-sm text-rose-300">
                  <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-[#16A34A] hover:bg-[#15803D] disabled:opacity-60 text-white font-semibold transition-colors"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {mode === 'signin' ? 'Sign In' : 'Create Account'}
              </button>
            </form>
          </div>

          <p className="mt-6 text-center text-xs text-slate-500">
            By continuing you agree to ZapPro's terms and privacy policy.
          </p>
        </div>
      </main>
    </div>
  );
}
