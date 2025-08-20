export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">Last updated: {new Date().toLocaleDateString()}</p>
      
      <div className="mb-6 p-4 bg-muted rounded-lg">
        <p className="text-sm">
          <strong>Dev App Hero</strong><br/>
          Houston, TX<br/>
          Email: contact@devapphero.com
        </p>
      </div>
      
      <div className="space-y-6">
        <section>
          <h2 className="text-xl font-semibold mb-3">1. Information We Collect</h2>
          <p className="mb-3">We collect information you provide directly to us, such as when you create an account, use our onboarding services, or contact us for support.</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Account information (name, email, company details)</li>
            <li>Client onboarding data and templates</li>
            <li>Usage data and analytics</li>
            <li>Communication records</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. How We Use Your Information</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Provide and maintain our onboarding platform services</li>
            <li>Process payments and manage subscriptions</li>
            <li>Send service-related communications</li>
            <li>Improve our services and develop new features</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. Information Sharing and Third-Party Services</h2>
          <p className="mb-3">We do not sell, trade, or rent your personal information. We may share information in these limited circumstances:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>With your explicit consent</li>
            <li>To comply with legal obligations</li>
            <li>With trusted service providers who assist in our operations</li>
            <li>In connection with a business transfer or merger</li>
          </ul>
          <p className="mt-3 mb-2"><strong>Third-Party Services We Use:</strong></p>
          <ul className="list-disc pl-6 space-y-1">
            <li><strong>Stripe:</strong> Payment processing (subject to Stripe's privacy policy)</li>
            <li><strong>Resend:</strong> Email delivery services</li>
            <li><strong>Google:</strong> Authentication services via Google OAuth</li>
            <li><strong>Supabase:</strong> Database and authentication infrastructure</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Data Security</h2>
          <p>We implement industry-standard security measures including encryption, secure data transmission, and regular security audits to protect your information.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Your Rights</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Access and update your personal information</li>
            <li>Delete your account and associated data</li>
            <li>Export your data</li>
            <li>Opt-out of marketing communications</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Data Retention</h2>
          <p>We retain your personal information for 12 months after account closure or as required by law. You may request earlier deletion of your data by contacting us.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Cookies and Tracking</h2>
          <p>We use cookies and similar technologies to enhance your experience, analyze usage patterns, and provide personalized content. This service is currently available to US users only.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Contact Us</h2>
          <p className="mb-2">For privacy-related questions, contact us at:</p>
          <div className="ml-4">
            <p><strong>Dev App Hero</strong></p>
            <p>Houston, TX</p>
            <p>Email: <a href="mailto:contact@devapphero.com" className="text-primary hover:underline">contact@devapphero.com</a></p>
          </div>
        </section>
      </div>
    </div>
  )
}