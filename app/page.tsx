import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <main className="container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="mb-6 text-4xl font-bold text-gray-900 md:text-6xl">
            Create Beautiful Client
            <span className="text-gradient block">Onboarding Experiences</span>
          </h1>
          <p className="mx-auto mb-8 max-w-3xl text-xl text-gray-600">
            OnboardKit helps agencies and consultants create professional,
            step-by-step client onboarding workflows that delight customers and
            streamline operations.
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button size="lg" asChild>
              <Link href="/signup">Get Started Free</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
          </div>
        </div>

        {/* Features Section */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Step-by-Step Workflows</CardTitle>
              <CardDescription>
                Create guided onboarding experiences that walk your clients
                through every step
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Custom form collection</li>
                <li>• File upload management</li>
                <li>• Contract signing integration</li>
                <li>• Meeting scheduling</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>White-Label Branding</CardTitle>
              <CardDescription>
                Customize the experience with your brand colors, logo, and
                domain
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Custom branding options</li>
                <li>• Your own domain</li>
                <li>• Branded email notifications</li>
                <li>• Professional appearance</li>
              </ul>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Powerful Analytics</CardTitle>
              <CardDescription>
                Track completion rates and identify bottlenecks in your process
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Completion tracking</li>
                <li>• Step-by-step analytics</li>
                <li>• Client progress monitoring</li>
                <li>• Performance insights</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h2 className="mb-4 text-3xl font-bold text-gray-900">
            Ready to streamline your onboarding?
          </h2>
          <p className="mb-8 text-lg text-gray-600">
            Join hundreds of agencies already using OnboardKit to create better
            client experiences.
          </p>
          <Button size="lg" asChild>
            <Link href="/signup">Start Your Free Trial</Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 OnboardKit. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
