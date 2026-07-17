'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Eye, EyeOff, Loader2, ArrowLeft, Phone, Mail } from 'lucide-react';

type LoginMethod = 'email' | 'phone';

function detectLoginMethod(input: string): LoginMethod {
  return input.includes('@') ? 'email' : 'phone';
}

function normalizePhone(raw: string): string {
  const digits = raw.replace(/[^+\d]/g, '');
  if (digits.startsWith('+')) return digits;
  if (digits.length <= 7) return '+238' + digits;
  return '+' + digits;
}

export default function AuthClient() {
  const [mode, setMode] = useState<'signin' | 'signup' | 'forgot' | 'otp-verify'>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [otpCode, setOtpCode] = useState('');
  const [pendingPhone, setPendingPhone] = useState('');
  const captchaRef = useRef<HCaptcha>(null);

  const { signIn, signUp, resetPassword, supabase } = useSupabaseAuth();
  const router = useRouter();

  const detectedMethod = detectLoginMethod(identifier);

  async function handlePhoneOtp() {
    if (!supabase) return;
    const phone = normalizePhone(identifier);
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOtp({ phone });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setPendingPhone(phone);
      setMode('otp-verify');
      setSuccess('Codigo enviado por SMS. Introduza abaixo.');
      setLoading(false);
    }
  }

  async function handleVerifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);

    const { error } = await supabase.auth.verifyOtp({
      phone: pendingPhone,
      token: otpCode,
      type: 'sms',
    });
    if (error) {
      setError(error.message);
    } else {
      router.push('/my-store');
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (mode === 'otp-verify') {
      await handleVerifyOtp(e);
      return;
    }

    if ((mode === 'signin' || mode === 'signup') && detectedMethod === 'phone') {
      await handlePhoneOtp();
      return;
    }

    setLoading(true);

    try {
      if (mode === 'signin') {
        if (!captchaToken) {
          setError('Por favor complete a verificacao CAPTCHA.');
          setLoading(false);
          return;
        }
        const { error: signInError } = await signIn(identifier, password, captchaToken);
        if (signInError) {
          setError(signInError.message);
          captchaRef.current?.resetCaptcha();
          setCaptchaToken(null);
        } else {
          router.push('/my-store');
        }
      } else if (mode === 'forgot') {
        const { error } = await resetPassword(identifier);
        if (error) {
          setError(error.message);
        } else {
          setSuccess('Link de reset enviado! Verifique o seu email.');
        }
      } else {
        if (!captchaToken) {
          setError('Por favor complete a verificacao CAPTCHA.');
          setLoading(false);
          return;
        }
        const { error, confirmationRequired } = await signUp(identifier, password, { full_name: fullName }, captchaToken);
        if (error) {
          setError(error.message);
          captchaRef.current?.resetCaptcha();
          setCaptchaToken(null);
        } else if (confirmationRequired) {
          setSuccess('Conta criada! Verifique o seu email para confirmar, depois entre.');
          setMode('signin');
          setPassword('');
        } else {
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('profiles').update({
                name: fullName,
              } as never).eq('id', user.id);
            }
          }
          setSuccess('Conta criada com sucesso! Pode entrar agora.');
          setMode('signin');
          setPassword('');
        }
      }
    } catch {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  if (mode === 'otp-verify') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6 text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-3">
                <Phone className="h-5 w-5 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Verificar Codigo</h2>
              <p className="text-xs text-gray-500">Enviamos um codigo SMS para <span className="font-medium text-gray-700">{pendingPhone}</span></p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {error}
              </div>
            )}
            {success && (
              <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
                {success}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Codigo de Verificacao</label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  className="w-full px-3 py-3 text-center text-lg font-mono tracking-[0.3em] border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0044FF] bg-white"
                  placeholder="000000"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={loading || otpCode.length < 6}
                className="w-full py-3 bg-[#0044FF] hover:bg-[#0033CC] text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                Confirmar
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Voltar</span>
        </button>

        <Link href="/" className="flex items-center justify-center mb-8">
          <span className="text-3xl font-bold tracking-tight">
            <span className="text-[#0044FF]">pro</span>
            <span className="text-red-600 inline-block" style={{ verticalAlign: 'middle', lineHeight: 0, fontSize: '0.7em', margin: '0 1px' }}>&#x2022;</span>
            <span className="text-[#0044FF]">cv</span>
          </span>
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          {mode !== 'forgot' && (
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  mode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  mode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Recuperar Senha</h2>
              <p className="text-xs text-gray-500">Introduza o seu email e enviaremos um link de reset.</p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-medium">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Nome Completo</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0044FF] bg-white"
                  placeholder="O seu nome completo"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {mode === 'forgot' ? 'Email' : 'Email ou Numero de WhatsApp'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-3 py-2.5 pl-9 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0044FF] bg-white"
                  placeholder={mode === 'forgot' ? 'you@example.com' : 'you@example.com ou +238 9XX XXXX'}
                  required
                />
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  {identifier && detectedMethod === 'phone' ? (
                    <Phone className="h-4 w-4 text-green-500" />
                  ) : (
                    <Mail className="h-4 w-4" />
                  )}
                </div>
              </div>
              {identifier && mode !== 'forgot' && (
                <p className="text-[10px] mt-1 text-gray-400">
                  {detectedMethod === 'email'
                    ? 'Login via email + senha'
                    : 'Login via codigo SMS (sem senha)'}
                </p>
              )}
            </div>

            {mode !== 'forgot' && detectedMethod === 'email' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">Senha</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2.5 pr-10 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0044FF] bg-white"
                    placeholder="Min 6 caracteres"
                    minLength={6}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            {mode === 'signin' && detectedMethod === 'email' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setMode('forgot'); setError(null); setSuccess(null); }}
                  className="text-xs text-[#0044FF] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {mode !== 'forgot' && detectedMethod === 'email' && (
              <div className="flex justify-center">
                <HCaptcha
                  sitekey={process.env.NEXT_PUBLIC_CAPTCHA_SITE_KEY || '10000000-ffff-ffff-ffff-000000000001'}
                  onVerify={(token) => setCaptchaToken(token)}
                  onExpire={() => setCaptchaToken(null)}
                  ref={captchaRef}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#0044FF] hover:bg-[#0033CC] text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {mode === 'signin' && detectedMethod === 'phone' && 'Enviar Codigo SMS'}
              {mode === 'signin' && detectedMethod === 'email' && 'Entrar'}
              {mode === 'signup' && detectedMethod === 'phone' && 'Enviar Codigo SMS'}
              {mode === 'signup' && detectedMethod === 'email' && 'Criar Conta'}
              {mode === 'forgot' && 'Enviar Link'}
            </button>

            {mode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); setSuccess(null); }}
                className="w-full text-center text-xs text-gray-500 hover:text-gray-700 mt-2"
              >
                Voltar ao Login
              </button>
            )}
          </form>
        </div>

        <p className="text-center text-xs text-gray-500 mt-4">
          Ao continuar aceita os nossos{' '}
          <Link href="/terms" className="text-[#0044FF] hover:underline">Termos</Link>{' '}
          e{' '}
          <Link href="/privacy" className="text-[#0044FF] hover:underline">Politica de Privacidade</Link>
        </p>
      </div>
    </div>
  );
}
