'use client';

import { ShieldAlert, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function SafetyBanner() {
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-9 h-9 rounded-full bg-amber-100 border border-amber-300 flex items-center justify-center">
          <ShieldAlert className="h-4.5 w-4.5 text-amber-700" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-amber-900">Pague Apenas na Entrega</h3>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
            Nunca faca pagamentos antecipados ou transferencias antes de ver o produto/propriedade em pessoa.
            Encontre-se em locais publicos e seguros.
          </p>
          <Link
            href="/safety"
            className="inline-flex items-center gap-1 text-xs font-semibold text-amber-700 hover:text-amber-900 mt-2 transition-colors"
          >
            Dicas de Seguranca
            <ExternalLink className="h-3 w-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}
