import Header from '@/components/Header';
import Footer from '@/components/Footer';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Politica de Privacidade | Pro.CV',
  description: 'Politica de Privacidade da plataforma Pro.CV - Conforme a legislacao cabo-verdiana e regulamentos CNPD.',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-3xl mx-auto px-4 py-16 sm:px-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Politica de Privacidade</h1>
        <p className="text-sm text-gray-500 mb-10">Ultima atualizacao: Julho 2026</p>

        <div className="space-y-10 text-[15px] leading-relaxed text-gray-700">

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">1. Responsavel pelo Tratamento</h2>
            <p>
              A Pro.CV ("nos", "plataforma") e responsavel pelo tratamento dos dados pessoais recolhidos atraves
              da aplicacao movel e do website procv.cv, em conformidade com a Lei de Protecao de Dados Pessoais
              de Cabo Verde (Lei n.o 133/V/2001) e as orientacoes da Comissao Nacional de Protecao de Dados (CNPD).
            </p>
            <p className="mt-2">
              Contacto do responsavel: <a href="mailto:privacidade@procv.cv" className="text-blue-600 hover:underline font-medium">privacidade@procv.cv</a>
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">2. Dados que Recolhemos</h2>
            <p className="mb-3">Recolhemos os seguintes tipos de informacao:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Dados de Conta:</strong> Nome, email, numero de telefone, foto de perfil.</li>
              <li><strong>Dados de Contacto Publico:</strong> Numeros de WhatsApp, redes sociais e links que o utilizador decide partilhar publicamente no seu perfil ou anuncios.</li>
              <li><strong>Dados de Anuncios:</strong> Fotografias, descricoes, precos e localizacoes de propriedades ou artigos publicados.</li>
              <li><strong>Dados de Utilizacao:</strong> Pesquisas efetuadas, anuncios visualizados, interacoes com a plataforma.</li>
              <li><strong>Dados do Dispositivo:</strong> Modelo do dispositivo, versao do sistema operativo, idioma preferido, enderecos IP.</li>
              <li><strong>Dados de Localizacao:</strong> Ilha/zona selecionada para filtragem de resultados (apenas quando o utilizador concede permissao).</li>
              <li><strong>Fotografias e Camera:</strong> Imagens capturadas ou selecionadas pelo utilizador para upload de anuncios (apenas com permissao explicita).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">3. Finalidades do Tratamento</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Criar e gerir a sua conta de utilizador</li>
              <li>Publicar e apresentar os seus anuncios a potenciais compradores</li>
              <li>Facilitar a comunicacao entre compradores e vendedores</li>
              <li>Enviar notificacoes e alertas de propriedades (com o seu consentimento)</li>
              <li>Melhorar a experiencia de utilizacao e a qualidade da plataforma</li>
              <li>Prevenir fraude e garantir a seguranca dos utilizadores</li>
              <li>Cumprir obrigacoes legais aplicaveis em Cabo Verde</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">4. Base Legal</h2>
            <p>O tratamento dos seus dados baseia-se em:</p>
            <ul className="list-disc pl-5 space-y-2 mt-2">
              <li><strong>Consentimento:</strong> Para envio de notificacoes, recolha de localizacao e comunicacoes de marketing.</li>
              <li><strong>Execucao contratual:</strong> Para gestao da conta e publicacao de anuncios.</li>
              <li><strong>Interesse legitimo:</strong> Para melhoria da plataforma e prevencao de fraude.</li>
              <li><strong>Obrigacao legal:</strong> Para cumprimento de requisitos regulamentares.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">5. Informacao Publica</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className="font-semibold text-blue-900 mb-1">Aviso Importante</p>
              <p className="text-blue-800 text-sm">
                Os dados de contacto (WhatsApp, telefone, email, redes sociais) que adicionar ao seu perfil
                ou anuncios serao <strong>publicamente visiveis</strong> para todos os visitantes da plataforma.
                Partilhe apenas informacoes que deseja tornar publicas.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">6. Partilha de Dados</h2>
            <p className="mb-2">Os seus dados podem ser partilhados com:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Outros utilizadores:</strong> Informacoes de contacto publicas nos anuncios.</li>
              <li><strong>Prestadores de servicos:</strong> Supabase (alojamento e autenticacao), Stripe (pagamentos), Resend (emails transacionais).</li>
              <li><strong>Autoridades competentes:</strong> Quando exigido por lei ou ordem judicial.</li>
            </ul>
            <p className="mt-2">Nao vendemos os seus dados pessoais a terceiros.</p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">7. Retencao de Dados</h2>
            <ul className="list-disc pl-5 space-y-2">
              <li>Dados de conta: mantidos enquanto a conta estiver ativa.</li>
              <li>Anuncios: mantidos ate serem removidos pelo utilizador ou 12 meses apos expiracao.</li>
              <li>Dados de utilizacao: anonimizados apos 24 meses.</li>
              <li>Apos eliminacao da conta: dados pessoais apagados no prazo de 30 dias, exceto quando a retencao e exigida por lei.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">8. Seguranca</h2>
            <p>
              Os seus dados sao armazenados com encriptacao em trânsito (TLS 1.3) e em repouso.
              Utilizamos autenticacao segura, controlo de acesso por funcao (RLS), e auditorias regulares.
              Contudo, nenhum sistema e 100% infalivel — recomendamos que proteja a sua senha e nao a partilhe.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">9. Os Seus Direitos (CNPD)</h2>
            <p className="mb-2">Nos termos da legislacao cabo-verdiana, tem o direito de:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Acesso:</strong> Solicitar copia dos seus dados pessoais.</li>
              <li><strong>Retificacao:</strong> Corrigir dados incorretos ou desatualizados.</li>
              <li><strong>Eliminacao:</strong> Pedir a eliminacao dos seus dados ("direito ao esquecimento").</li>
              <li><strong>Oposicao:</strong> Opor-se ao tratamento para fins de marketing.</li>
              <li><strong>Portabilidade:</strong> Receber os seus dados em formato estruturado.</li>
              <li><strong>Retirar consentimento:</strong> A qualquer momento, sem prejuizo do tratamento anterior.</li>
            </ul>
            <p className="mt-3">
              Para exercer qualquer direito, contacte <a href="mailto:privacidade@procv.cv" className="text-blue-600 hover:underline font-medium">privacidade@procv.cv</a>.
              Respondemos no prazo maximo de 30 dias.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">10. Utilizacao por Menores</h2>
            <p>
              A plataforma Pro.CV destina-se a utilizadores com idade igual ou superior a 18 anos.
              Nao recolhemos intencionalmente dados de menores. Se tomarmos conhecimento de que dados de
              um menor foram recolhidos, procederemos a sua eliminacao imediata.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">11. Cookies e Tecnologias Similares</h2>
            <p>
              Utilizamos cookies estritamente necessarios para manter a sua sessao autenticada e preferencias.
              Nao utilizamos cookies de rastreamento de terceiros para publicidade. Consulte a nossa{' '}
              <a href="/cookies" className="text-blue-600 hover:underline">Politica de Cookies</a> para mais detalhes.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">12. Alteracoes a Esta Politica</h2>
            <p>
              Reservamo-nos o direito de atualizar esta politica. Alteracoes significativas serao comunicadas
              por notificacao na plataforma ou por email. A data de "ultima atualizacao" no topo reflete
              a versao vigente.
            </p>
          </section>

          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-3">13. Contacto e Reclamacoes</h2>
            <p className="mb-2">Para questoes de privacidade:</p>
            <ul className="list-none space-y-1">
              <li>Email: <a href="mailto:privacidade@procv.cv" className="text-blue-600 hover:underline">privacidade@procv.cv</a></li>
              <li>Morada: Pro.CV, Praia, Ilha de Santiago, Cabo Verde</li>
            </ul>
            <p className="mt-3 text-sm text-gray-600">
              Se considerar que os seus direitos nao foram respeitados, pode apresentar reclamacao junto da
              Comissao Nacional de Protecao de Dados (CNPD) de Cabo Verde.
            </p>
          </section>

        </div>
      </main>

      <Footer />
    </div>
  );
}
