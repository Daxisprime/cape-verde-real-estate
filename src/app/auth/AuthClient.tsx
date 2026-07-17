'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import HCaptcha from '@hcaptcha/react-hcaptcha';
import { useSupabaseAuth } from '@/contexts/SupabaseAuthContext';
import { Eye, EyeOff, Loader2, ArrowLeft, Phone, Mail, ChevronDown, MessageCircle } from 'lucide-react';

const COUNTRY_CODES = [
  { code: '+238', label: '🇨🇻 +238', country: 'Cape Verde' },
  { code: '+351', label: '🇵🇹 +351', country: 'Portugal' },
  { code: '+55', label: '🇧🇷 +55', country: 'Brasil' },
  { code: '+1', label: '🇺🇸 +1', country: 'USA/CA' },
  { code: '+44', label: '🇬🇧 +44', country: 'UK' },
  { code: '+34', label: '🇪🇸 +34', country: 'Espanha' },
  { code: '+33', label: '🇫🇷 +33', country: 'Franca' },
  { code: '+49', label: '🇩🇪 +49', country: 'Alemanha' },
  { code: '+31', label: '🇳🇱 +31', country: 'Holanda' },
];

type InputMode = 'email' | 'whatsapp';
type FormMode = 'signin' | 'signup' | 'forgot' | 'otp-entry';

function detectInputMode(value: string): InputMode {
  if (value.includes('@')) return 'email';
  const hasDigit = /\d/.test(value);
  if (hasDigit && !value.includes('@')) return 'whatsapp';
  return 'email';
}

export default function AuthClient() {
  const [formMode, setFormMode] = useState<FormMode>('signin');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [captchaToken, setCaptchaToken] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState('+238');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [otpDigits, setOtpDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [pendingPhone, setPendingPhone] = useState('');
  const captchaRef = useRef<HCaptcha>(null);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const countryDropdownRef = useRef<HTMLDivElement>(null);

  const { signIn, signUp, resetPassword, supabase } = useSupabaseAuth();
  const router = useRouter();

  const inputMode = detectInputMode(identifier);

  // Close country dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(e.target as Node)) {
        setShowCountryDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Auto-focus first OTP input
  useEffect(() => {
    if (formMode === 'otp-entry' && otpInputRefs.current[0]) {
      otpInputRefs.current[0].focus();
    }
  }, [formMode]);

  function handleOtpChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.slice(-1);
    setOtpDigits(newDigits);

    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  }

  function handleOtpKeyDown(index: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  }

  function handleOtpPaste(e: React.ClipboardEvent) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtpDigits(pasted.split(''));
      otpInputRefs.current[5]?.focus();
    }
  }

  async function sendWhatsAppOtp() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch('/api/auth/whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: identifier, countryCode }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Falha ao enviar codigo.');
        return;
      }

      setPendingPhone(data.phone || `${countryCode}${identifier.replace(/\D/g, '')}`);
      setFormMode('otp-entry');
      setOtpDigits(['', '', '', '', '', '']);
      setSuccess('Codigo enviado via WhatsApp! Introduza abaixo.');
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function verifyWhatsAppOtp() {
    const code = otpDigits.join('');
    if (code.length !== 6) {
      setError('Introduza o codigo completo de 6 digitos.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/auth/whatsapp-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: pendingPhone, countryCode: '', otpCode: code }),
      });

      const data = await response.json();
      if (!response.ok) {
        setError(data.error || 'Verificacao falhou.');
        setOtpDigits(['', '', '', '', '', '']);
        otpInputRefs.current[0]?.focus();
        return;
      }

      if (data.actionLink && supabase) {
        // Use the magic link token to establish session
        try {
          const url = new URL(data.actionLink);
          const token_hash = url.searchParams.get('token') || data.tokenHash;
          if (token_hash) {
            await supabase.auth.verifyOtp({
              token_hash,
              type: 'magiclink',
            });
          }
        } catch {
          // If magic link fails, still redirect as account is verified
        }
      }

      setSuccess('Conta verificada com sucesso!');
      setTimeout(() => router.push('/my-store'), 800);
    } catch {
      setError('Erro de rede. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    // WhatsApp flow: send OTP
    if ((formMode === 'signin' || formMode === 'signup') && inputMode === 'whatsapp') {
      await sendWhatsAppOtp();
      return;
    }

    setLoading(true);

    try {
      if (formMode === 'signin') {
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
      } else if (formMode === 'forgot') {
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
          setFormMode('signin');
          setPassword('');
        } else {
          if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
              await supabase.from('profiles').update({ name: fullName } as never).eq('id', user.id);
            }
          }
          setSuccess('Conta criada com sucesso!');
          setFormMode('signin');
          setPassword('');
        }
      }
    } catch {
      setError('Ocorreu um erro inesperado.');
    } finally {
      setLoading(false);
    }
  }

  // OTP Entry Screen
  if (formMode === 'otp-entry') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <button
            onClick={() => { setFormMode('signin'); setError(null); setSuccess(null); setOtpDigits(['', '', '', '', '', '']); }}
            className="flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="mb-6 text-center">
              <div className="w-14 h-14 rounded-full bg-green-50 border border-green-100 flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">Verificar Codigo</h2>
              <p className="text-xs text-gray-500">
                Enviamos um codigo de 6 digitos via WhatsApp para
              </p>
              <p className="text-sm font-semibold text-gray-800 mt-1">{pendingPhone}</p>
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

            <div className="mb-6">
              <label className="block text-xs font-medium text-gray-700 mb-3 text-center">
                Codigo de Verificacao
              </label>
              <div className="flex gap-2 justify-center" onPaste={handleOtpPaste}>
                {otpDigits.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    className="w-11 h-13 text-center text-xl font-bold border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-100 focus:border-green-500 bg-white transition-all"
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={verifyWhatsAppOtp}
              disabled={loading || otpDigits.join('').length < 6}
              className="w-full py-3 bg-green-600 hover:bg-green-700 text-white font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              Confirmar Codigo
            </button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => sendWhatsAppOtp()}
                disabled={loading}
                className="text-xs text-green-600 hover:text-green-700 font-medium hover:underline"
              >
                Reenviar codigo
              </button>
            </div>

            <p className="text-[10px] text-gray-400 text-center mt-4">
              O codigo expira em 5 minutos. Maximo 3 tentativas.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Main Auth Form
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
          {formMode !== 'forgot' && (
            <div className="flex rounded-lg bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => { setFormMode('signin'); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  formMode === 'signin' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Entrar
              </button>
              <button
                type="button"
                onClick={() => { setFormMode('signup'); setError(null); setSuccess(null); }}
                className={`flex-1 py-2 text-sm font-semibold rounded-md transition-all ${
                  formMode === 'signup' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500'
                }`}
              >
                Criar Conta
              </button>
            </div>
          )}

          {formMode === 'forgot' && (
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
            {formMode === 'signup' && (
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
                {formMode === 'forgot' ? 'Email' : 'Email ou Numero de WhatsApp'}
              </label>
              <div className="flex gap-0">
                {/* Country code selector - only visible when WhatsApp mode detected */}
                {formMode !== 'forgot' && inputMode === 'whatsapp' && (
                  <div className="relative" ref={countryDropdownRef}>
                    <button
                      type="button"
                      onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                      className="flex items-center gap-1 px-2.5 py-2.5 text-sm border border-gray-200 border-r-0 rounded-l-lg bg-gray-50 hover:bg-gray-100 transition-colors min-w-[80px]"
                    >
                      <span className="text-xs font-medium text-gray-700">{countryCode}</span>
                      <ChevronDown className="h-3 w-3 text-gray-400" />
                    </button>
                    {showCountryDropdown && (
                      <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-60 overflow-y-auto">
                        {COUNTRY_CODES.map((cc) => (
                          <button
                            key={cc.code}
                            type="button"
                            onClick={() => { setCountryCode(cc.code); setShowCountryDropdown(false); }}
                            className={`w-full text-left px-3 py-2.5 text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                              countryCode === cc.code ? 'bg-green-50 text-green-700' : 'text-gray-700'
                            }`}
                          >
                            <span>{cc.label}</span>
                            <span className="text-xs text-gray-400">{cc.country}</span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="relative flex-1">
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className={`w-full px-3 py-2.5 pl-9 text-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-[#0044FF] bg-white ${
                      formMode !== 'forgot' && inputMode === 'whatsapp'
                        ? 'rounded-r-lg rounded-l-none'
                        : 'rounded-lg'
                    }`}
                    placeholder={formMode === 'forgot' ? 'you@example.com' : 'you@example.com ou 9XX XXXX'}
                    required
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    {inputMode === 'whatsapp' ? (
                      <Phone className="h-4 w-4 text-green-500" />
                    ) : (
                      <Mail className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>

              {identifier && formMode !== 'forgot' && (
                <p className="text-[10px] mt-1.5 text-gray-400 flex items-center gap-1">
                  {inputMode === 'email' ? (
                    <>
                      <Mail className="h-3 w-3" />
                      Login via email + senha
                    </>
                  ) : (
                    <>
                      <MessageCircle className="h-3 w-3 text-green-500" />
                      <span className="text-green-600">Login via codigo WhatsApp (sem senha)</span>
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Password field - only for email mode */}
            {formMode !== 'forgot' && inputMode === 'email' && (
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

            {formMode === 'signin' && inputMode === 'email' && (
              <div className="text-right">
                <button
                  type="button"
                  onClick={() => { setFormMode('forgot'); setError(null); setSuccess(null); }}
                  className="text-xs text-[#0044FF] hover:underline"
                >
                  Esqueceu a senha?
                </button>
              </div>
            )}

            {/* CAPTCHA - only for email mode */}
            {formMode !== 'forgot' && inputMode === 'email' && (
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
              className={`w-full py-3 font-semibold text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 ${
                inputMode === 'whatsapp' && formMode !== 'forgot'
                  ? 'bg-green-600 hover:bg-green-700 text-white'
                  : 'bg-[#0044FF] hover:bg-[#0033CC] text-white'
              }`}
            >
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              {inputMode === 'whatsapp' && formMode !== 'forgot' && (
                <>
                  <MessageCircle className="h-4 w-4" />
                  Enviar Codigo via WhatsApp
                </>
              )}
              {inputMode === 'email' && formMode === 'signin' && 'Entrar'}
              {inputMode === 'email' && formMode === 'signup' && 'Criar Conta'}
              {formMode === 'forgot' && 'Enviar Link'}
            </button>

            {formMode === 'forgot' && (
              <button
                type="button"
                onClick={() => { setFormMode('signin'); setError(null); setSuccess(null); }}
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
