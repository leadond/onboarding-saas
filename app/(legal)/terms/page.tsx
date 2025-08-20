export default function TermsOfService() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>
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
          <h2 className="text-xl font-semibold mb-3">1. Acceptance of Terms</h2>
          <p>By accessing or using Onboard Hero, you agree to be bound by these Terms of Service and our Privacy Policy.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">2. Description of Service</h2>
          <p className="mb-3">Onboard Hero is a SaaS platform that enables businesses to create professional client onboarding experiences. Our services include:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Customizable onboarding workflows and templates</li>
            <li>Client portal and communication tools</li>
            <li>Document collection and management</li>
            <li>Progress tracking and analytics</li>
            <li>Integration capabilities with third-party services</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">3. User Accounts and Responsibilities</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>You must provide accurate and complete information when creating an account</li>
            <li>You are responsible for maintaining the security of your account credentials</li>
            <li>You must not share your account with unauthorized users</li>
            <li>You are responsible for all activities that occur under your account</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">4. Acceptable Use Policy</h2>
          <p className="mb-3">You agree not to use our service to:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Violate any applicable laws or regulations</li>
            <li>Infringe on intellectual property rights</li>
            <li>Transmit harmful, offensive, or inappropriate content</li>
            <li>Attempt to gain unauthorized access to our systems</li>
            <li>Use the service for competitive intelligence or benchmarking</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">5. Subscription and Payment</h2>
          <ul className="list-disc pl-6 space-y-1">
            <li>Subscription fees are billed in advance on a recurring basis</li>
            <li>Payments are processed securely through Stripe</li>
            <li>All fees are non-refundable except as required by law</li>
            <li>We may change pricing with 30 days notice</li>
            <li>Failure to pay may result in service suspension or termination</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">6. Data Ownership and Security</h2>
          <p className="mb-3">You retain ownership of all data you upload to our platform. We implement industry-standard security measures to protect your data. Data is retained for 12 months after account closure.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">7. Service Availability and Geographic Limitations</h2>
          <p className="mb-2">We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. Scheduled maintenance will be communicated in advance.</p>
          <p>This service is currently available to users in the United States only.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">8. Limitation of Liability</h2>
          <p>Our liability is limited to the amount paid for the service in the 12 months preceding the claim. We are not liable for indirect, incidental, or consequential damages.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">9. Termination</h2>
          <p>Either party may terminate the agreement with 30 days notice. We may terminate immediately for breach of terms.</p>
        </section>

        <section>
          <h2 className="text-xl font-semibold mb-3">10. Contact Information</h2>
          <p className="mb-2">For questions about these terms, contact us at:</p>
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