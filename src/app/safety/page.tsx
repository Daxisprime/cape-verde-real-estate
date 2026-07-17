import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ShieldAlert, MapPin, Eye, Phone, CreditCard, Users } from 'lucide-react';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dicas de Seguranca | Pro.CV',
  description: 'Conselhos de seguranca para comprar e vender com confianca na plataforma Pro.CV.',
};

const tips = [
  {
    icon: CreditCard,
    title: 'Pague Apenas na Entrega',
    body: 'Nunca envie dinheiro antes de ver o produto ou propriedade em pessoa. Desconfie de vendedores que pedem transferencias bancarias adiantadas, Western Union, ou pagamentos por criptomoeda.',
  },
  {
    icon: MapPin,
    title: 'Encontre-se em Locais Publicos',
    body: 'Marque encontros em locais movimentados durante o dia (cafes, centros comerciais, esquadras de policia). Evite ir sozinho a enderecos desconhecidos ou locais isolados.',
  },
  {
    icon: Eye,
    title: 'Inspeccione Antes de Pagar',
    body: 'Verifique o estado real do artigo ou visite a propriedade presencialmente. Compare com as fotos do anuncio. Se algo parecer diferente do anunciado, nao prossiga com a transacao.',
  },
  {
    icon: Phone,
    title: 'Verifique o Vendedor',
    body: 'Prefira vendedores com perfil verificado, avaliacoes positivas e historico de vendas. Desconfie de perfis novos que oferecem artigos muito abaixo do valor de mercado.',
  },
  {
    icon: Users,
    title: 'Informe Alguem de Confianca',
    body: 'Diga a um familiar ou amigo onde vai e com quem se vai encontrar. Partilhe a localizacao do seu telefone em tempo real durante o encontro.',
  },
  {
    icon: ShieldAlert,
    title: 'Denuncie Atividade Suspeita',
    body: 'Se um vendedor ou comprador se comportar de forma suspeita, denuncie imediatamente atraves do botao "Reportar" no anuncio ou contacte-nos em seguranca@procv.cv.',
  },
];

export default function SafetyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-16 sm:px-6">
        <div className="text-center mb-12">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="h-8 w-8 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dicas de Seguranca</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            A sua seguranca e a nossa prioridade. Siga estas orientacoes para comprar e vender com confianca na Pro.CV.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-2xl p-5 mb-10">
          <div className="flex items-start gap-3">
            <CreditCard className="h-6 w-6 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="text-base font-bold text-red-900">Regra de Ouro: Pague APENAS na Entrega</h2>
              <p className="text-sm text-red-800 mt-1">
                A Pro.CV nao processa pagamentos entre utilizadores. Qualquer pedido de pagamento
                antecipado e um forte indicador de fraude. Nao existe nenhuma "garantia Pro.CV" que exija
                transferencia previa.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {tips.map((tip) => (
            <div key={tip.title} className="flex gap-4 p-5 bg-gray-50 rounded-xl border border-gray-100">
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                <tip.icon className="h-5 w-5 text-gray-700" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-gray-900">{tip.title}</h3>
                <p className="text-sm text-gray-600 mt-1 leading-relaxed">{tip.body}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-2xl p-5 text-center">
          <h3 className="text-base font-bold text-blue-900 mb-1">Precisa de Ajuda?</h3>
          <p className="text-sm text-blue-700 mb-3">
            Se foi vitima de fraude ou precisa de assistencia, contacte-nos imediatamente.
          </p>
          <a
            href="mailto:seguranca@procv.cv"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            seguranca@procv.cv
          </a>
        </div>
      </main>

      <Footer />
    </div>
  );
}
