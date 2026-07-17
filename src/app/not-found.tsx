import Link from "next/link";
import { Home, SearchX } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="w-20 h-20 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <SearchX className="w-10 h-10 text-blue-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">
          Pagina nao encontrada
        </h1>

        <p className="mt-3 text-gray-500 leading-relaxed">
          A pagina que procura pode ter sido movida, removida, ou o endereco esta incorreto.
          Se era um perfil de vendedor, este pode ter alterado o seu link.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#0044FF] text-white font-semibold rounded-xl hover:bg-[#0033CC] transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" />
            Voltar para o Inicio
          </Link>
          <Link
            href="/marketplace"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
          >
            Explorar Mercado
          </Link>
        </div>

        <p className="mt-10 text-xs text-gray-400">
          Erro 404 &mdash; Pro.CV
        </p>
      </div>
    </div>
  );
}
