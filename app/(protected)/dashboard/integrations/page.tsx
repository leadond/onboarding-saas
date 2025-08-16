import { EmailMarketingDashboard } from '@/components/integrations/email-marketing-dashboard'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Mail, Calendar, Users, Zap, ArrowRight, Star } from 'lucide-react'

export default function IntegrationsPage() {
  return (
    <div className="space-y-8">
      {/* Featured Integration - Nylas */}
      <Card className="border-2 border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Mail className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  Nylas Integration
                  <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                    <Star className="h-3 w-3 mr-1" />
                    Featured
                  </Badge>
                </CardTitle>
                <p className="text-muted-foreground">
                  Advanced email, calendar, and contact management platform
                </p>
              </div>
            </div>
            <Link href="/dashboard/integrations/nylas">
              <Button>
                Configure
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
            <div className="flex items-center gap-2 text-sm">
              <Mail className="h-4 w-4 text-blue-600" />
              <span>Interactive Emails</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-green-600" />
              <span>Calendar Sync</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Users className="h-4 w-4 text-purple-600" />
              <span>Contact Management</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <Zap className="h-4 w-4 text-orange-600" />
              <span>Email Tracking</span>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Enhance your onboarding with two-way email conversations, unified calendar availability, 
            automated scheduling, and comprehensive email analytics. Perfect for personalized client communication.
          </p>
        </CardContent>
      </Card>

      {/* Existing Email Marketing Dashboard */}
      <EmailMarketingDashboard />
    </div>
  )
}