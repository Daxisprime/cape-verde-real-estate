import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Cookie Policy</h1>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600 text-sm">Last updated: June 2026</p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">1. What Are Cookies?</h2>
            <p className="text-gray-700 leading-relaxed">
              Cookies are small text files stored on your device when you visit a website. They help
              websites remember your preferences and provide a better user experience.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">2. Cookies We Use</h2>
            <p className="text-gray-700 leading-relaxed">
              ProCV uses <strong>only essential cookies</strong> required for basic platform functionality:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>
                <strong>Authentication Cookies:</strong> Essential local storage cookies to maintain secure
                Supabase user login sessions. These ensure you stay logged in as you navigate the platform.
              </li>
              <li>
                <strong>Search Cache Cookies:</strong> Local storage used to cache search results and filters
                to minimize data consumption for mobile users in Cape Verde with limited data plans.
              </li>
              <li>
                <strong>Preference Cookies:</strong> Store your language preference and display settings.
              </li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">3. What We Don't Use</h2>
            <p className="text-gray-700 leading-relaxed bg-green-50 p-4 rounded-lg border border-green-200">
              We do <strong>not</strong> use:
            </p>
            <ul className="list-disc pl-6 mt-4 space-y-2 text-gray-700">
              <li>Third-party advertising or tracking cookies</li>
              <li>Analytics cookies that track your behavior across other websites</li>
              <li>Social media tracking pixels</li>
              <li>Any cookies that sell or share your data with advertisers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">4. Managing Cookies</h2>
            <p className="text-gray-700 leading-relaxed">
              You can control cookies through your browser settings. However, disabling essential cookies
              may prevent you from logging in or using certain features of the platform.
            </p>
            <p className="text-gray-700 leading-relaxed mt-4">
              To clear cached data:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2 text-gray-700">
              <li>Open your browser settings</li>
              <li>Navigate to Privacy or History</li>
              <li>Clear browsing data / cookies for procv.cv</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">5. Data Minimization</h2>
            <p className="text-gray-700 leading-relaxed">
              We are committed to data minimization. Our cookie usage is designed specifically to reduce
              data consumption for users in Cape Verde, where mobile data can be expensive. Local caching
              means fewer server requests and faster load times on slower connections.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">6. Contact Us</h2>
            <p className="text-gray-700 leading-relaxed">
              For questions about our cookie usage, contact us at: <a href="mailto:privacy@procv.cv" className="text-blue-600 hover:underline">privacy@procv.cv</a>
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
