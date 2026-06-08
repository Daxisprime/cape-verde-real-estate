import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Terms and Conditions</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600 text-sm">Last updated: June 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Platform Purpose</h2>
            <p className="text-gray-700 leading-relaxed">
              ProCV ("the Platform") is a digital advertising and information conduit only. We provide a marketplace
              where property owners, agents, and potential buyers or renters can connect. <strong>We do not own, manage,
              inspect, verify, or lease any properties listed on this platform.</strong> All property listings are
              submitted by third-party users and remain their sole responsibility.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Limitation of Liability</h2>
            <p className="text-gray-700 leading-relaxed">
              The Platform, its owners, operators, employees, affiliates, and parent company are <strong>100% exempt
              from any financial liability</strong> regarding:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>Off-site fraud or scams occurring between users</li>
              <li>Misrepresentation of property listings, including false descriptions, images, or pricing</li>
              <li>Personal harm, financial loss, or property damage resulting from user communication or transactions</li>
              <li>Any disputes arising from property viewings, negotiations, or contracts</li>
              <li>Quality, safety, or legal status of any listed property</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Peer-to-Peer Communication</h2>
            <p className="text-gray-700 leading-relaxed bg-amber-50 p-4 rounded-lg border border-amber-200">
              <strong>Important:</strong> All communication, negotiations, and transactions occurring off this platform
              (including via WhatsApp, Facebook Messenger, phone calls, SMS, email, or in-person meetings) are
              <strong> strictly between the buyer and seller</strong>. The Platform is not a party to any contract,
              agreement, or arrangement made between users. Users engage with each other at their own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. User Responsibilities</h2>
            <p className="text-gray-700 leading-relaxed">
              Users are solely responsible for:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>Verifying the accuracy of all property information before making any decisions</li>
              <li>Conducting their own due diligence on properties and other users</li>
              <li>Ensuring all transactions comply with Cape Verde law</li>
              <li>Protecting their personal and financial information</li>
              <li>Reporting suspicious activity to local authorities</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. No Warranties</h2>
            <p className="text-gray-700 leading-relaxed">
              The Platform is provided "as is" without any warranties, express or implied. We do not guarantee
              the accuracy, completeness, or reliability of any listing information, user profiles, or
              communications facilitated through our service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Governing Law</h2>
            <p className="text-gray-700 leading-relaxed">
              These terms are governed by the laws of the Republic of Cape Verde. Any disputes shall be
              resolved in the courts of Praia, Santiago, Cape Verde.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about these Terms, contact us at: <a href="mailto:legal@procv.cv" className="text-blue-600 hover:underline">legal@procv.cv</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
