'use client';

import { useState } from 'react';
import { Phone, Send, CheckCircle, ArrowLeft, Shield } from 'lucide-react';
import Link from 'next/link';
import InternationalPhoneInput from '@/components/InternationalPhoneInput';

export default function TestVerificationPage() {
  const [phone, setPhone] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verified, setVerified] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSendCode() {
    if (!phone || phone.length < 8) return;
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setSending(false);
    setCodeSent(true);
  }

  async function handleVerifyCode() {
    if (verificationCode.length !== 6) return;
    setSending(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setSending(false);
    setVerified(true);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/30">
      <div className="max-w-lg mx-auto px-4 py-12">
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Admin Panel
        </Link>

        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-teal-50">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <Shield className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-gray-900">WhatsApp Sandbox</h1>
                <p className="text-xs text-gray-500">Teste de verificacao de numero</p>
              </div>
            </div>
          </div>

          <div className="p-6">
            {verified ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="w-8 h-8 text-emerald-600" />
                </div>
                <h2 className="text-lg font-bold text-gray-900 mb-1">Contacto Verificado!</h2>
                <p className="text-sm text-gray-500 mb-4">
                  O numero {phone} foi verificado com sucesso.
                </p>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-xs font-semibold text-emerald-700">Contacto Verificado</span>
                </div>
              </div>
            ) : codeSent ? (
              <div className="space-y-5">
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4">
                  <p className="text-sm text-blue-800 font-medium">
                    Codigo de Verificacao de Teste Enviado!
                  </p>
                  <p className="text-xs text-blue-600 mt-1">
                    Digite o codigo de 6 digitos enviado para o seu numero.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Codigo de Verificacao
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="000000"
                    className="w-full px-4 py-3.5 text-center text-2xl font-mono tracking-[0.5em] border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-400 outline-none"
                  />
                  <p className="text-[10px] text-gray-400 mt-2 text-center">
                    Para teste, digite qualquer codigo de 6 digitos
                  </p>
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={verificationCode.length !== 6 || sending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      Verificar Codigo
                    </>
                  )}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div>
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                    <Phone className="w-4 h-4" />
                    Numero WhatsApp
                  </label>
                  <InternationalPhoneInput
                    value={phone}
                    onChange={setPhone}
                    required
                    placeholder="9XX XXXX"
                  />
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Inclui o prefixo internacional automaticamente
                  </p>
                </div>

                <button
                  onClick={handleSendCode}
                  disabled={!phone || phone.length < 8 || sending}
                  className="w-full flex items-center justify-center gap-2 py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {sending ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Enviar Codigo de Teste via WhatsApp
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
