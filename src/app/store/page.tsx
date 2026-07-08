import Header from "@/components/Header";
import { Eye } from "lucide-react";

export default function StorePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="max-w-7xl mx-auto px-4 py-24 text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Eye className="w-8 h-8 text-gray-400" />
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Loja Nao Encontrada</h1>
        <p className="text-gray-500">Este perfil de vendedor nao existe na nossa plataforma.</p>
      </div>
    </div>
  );
}
