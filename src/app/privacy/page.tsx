import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600 text-sm">Last updated: June 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
            <p className="text-gray-700 leading-relaxed">
              ProCV collects the following types of information to provide and improve our services:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li><strong>Account Information:</strong> Names, email addresses, and profile details stored securely via Supabase authentication</li>
              <li><strong>Public Contact Data:</strong> WhatsApp numbers, phone numbers, and social media handles that users willingly choose to share to facilitate business outreach and property inquiries</li>
              <li><strong>Property Listings:</strong> Property details, images, and descriptions submitted by users</li>
              <li><strong>Usage Data:</strong> Search queries, viewed properties, and interaction patterns to improve recommendations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
            <p className="text-gray-700 leading-relaxed">
              We use collected information to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>Facilitate connections between property buyers, renters, sellers, and agents</li>
              <li>Display contact information on public property listings and agent profiles</li>
              <li>Send property alerts and platform notifications (with user consent)</li>
              <li>Improve our platform and user experience</li>
              <li>Ensure platform security and prevent fraud</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. Public Information Disclosure</h2>
            <p className="text-gray-700 leading-relaxed bg-blue-50 p-4 rounded-lg border border-blue-200">
              <strong>Important:</strong> Contact information (WhatsApp numbers, phone numbers, email addresses,
              and social media handles) that you add to your profile or property listings will be publicly
              visible to all platform visitors. Only share contact details you are comfortable making public.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Data Storage & Security</h2>
            <p className="text-gray-700 leading-relaxed">
              Your data is stored securely using Supabase infrastructure with encryption at rest and in transit.
              We implement industry-standard security measures to protect your information. However, no method
              of transmission over the Internet is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Your Rights</h2>
            <p className="text-gray-700 leading-relaxed">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>Access and download your personal data</li>
              <li>Update or correct your information at any time</li>
              <li>Delete your account and associated data</li>
              <li>Opt out of marketing communications</li>
              <li>Request information about how your data is used</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Third-Party Services</h2>
            <p className="text-gray-700 leading-relaxed">
              We use third-party services including Supabase for authentication and data storage. These
              services have their own privacy policies governing how they handle your information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">7. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For privacy-related inquiries, contact us at: <a href="mailto:privacy@procv.cv" className="text-blue-600 hover:underline">privacy@procv.cv</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
