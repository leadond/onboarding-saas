import { AdvancedAnalyticsDashboard } from '@/components/analytics/advanced-analytics-dashboard'
import { EmailMarketingDashboard } from '@/components/integrations/email-marketing-dashboard'
import { AdvancedBrandingCustomizer } from '@/components/branding/advanced-branding-customizer'
import { SimpleTeamDashboard } from '@/components/teams/simple-team-dashboard'
import { ActivityLogViewer } from '@/components/audit/activity-log-viewer'
import { WorkflowAutomationDashboard } from '@/components/workflow/workflow-automation-dashboard'
import { AdvancedCRMIntegrations } from '@/components/integrations/advanced-crm-integrations'
import { AIPoweredInsights } from '@/components/ai/ai-powered-insights'
import { EnterpriseSecurityCompliance } from '@/components/security/enterprise-security-compliance'
import { WhiteLabelPlatform } from '@/components/white-label/white-label-platform'
import { EnterpriseSSOIntegration } from '@/components/sso/enterprise-sso-integration'
import { AdvancedAIFeatures } from '@/components/ai/advanced-ai-features'
import { MultiLanguageSupport } from '@/components/i18n/multi-language-support'
import { NativeMobileApps } from '@/components/mobile/native-mobile-apps'
import { CalendarIntegrationEnhancement } from '@/components/calendar/calendar-integration-enhancement'
import { FileManagementSystem } from '@/components/files/file-management-system'
import { NotificationSystem } from '@/components/notifications/notification-system'
import { TemplateMarketplace } from '@/components/marketplace/template-marketplace'
import { EmbeddedOnboardingSDK } from '@/components/sdk/embedded-onboarding-sdk'
import { MarketPositioningDashboard } from '@/components/market/market-positioning-dashboard'
import { PricingStrategyDashboard } from '@/components/pricing/pricing-strategy-dashboard'
import { ChatbotProvider } from '@/components/ai/chatbot-provider'
import { ChatbotTrigger } from '@/components/ai/chatbot-trigger'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export default function TestDashboardPage() {
  return (
    <ChatbotProvider>
      <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Onboard Hero Ultimate Flagship Platform</h1>
          <p className="text-gray-600">Complete enterprise onboarding solution with 17 comprehensive flagship features</p>
        </div>

        <Tabs defaultValue="analytics" className="space-y-6">
          <div className="overflow-x-auto">
            <TabsList className="grid w-max grid-cols-21 gap-1">
              <TabsTrigger value="analytics" className="text-xs">Analytics</TabsTrigger>
              <TabsTrigger value="email" className="text-xs">Email</TabsTrigger>
              <TabsTrigger value="branding" className="text-xs">Branding</TabsTrigger>
              <TabsTrigger value="team" className="text-xs">Team</TabsTrigger>
              <TabsTrigger value="audit" className="text-xs">Audit Log</TabsTrigger>
              <TabsTrigger value="workflows" className="text-xs">Workflows</TabsTrigger>
              <TabsTrigger value="crm" className="text-xs">CRM</TabsTrigger>
              <TabsTrigger value="ai-insights" className="text-xs">AI Insights</TabsTrigger>
              <TabsTrigger value="security" className="text-xs">Security</TabsTrigger>
              <TabsTrigger value="white-label" className="text-xs">White-Label</TabsTrigger>
              <TabsTrigger value="sso" className="text-xs">SSO</TabsTrigger>
              <TabsTrigger value="advanced-ai" className="text-xs">Advanced AI</TabsTrigger>
              <TabsTrigger value="i18n" className="text-xs">Multi-Language</TabsTrigger>
              <TabsTrigger value="mobile" className="text-xs">Mobile Apps</TabsTrigger>
              <TabsTrigger value="calendar" className="text-xs">Calendar</TabsTrigger>
              <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
              <TabsTrigger value="notifications" className="text-xs">Notifications</TabsTrigger>
              <TabsTrigger value="marketplace" className="text-xs">Marketplace</TabsTrigger>
              <TabsTrigger value="sdk" className="text-xs">SDK</TabsTrigger>
              <TabsTrigger value="market" className="text-xs">Market</TabsTrigger>
              <TabsTrigger value="pricing" className="text-xs">Pricing</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="analytics">
            <AdvancedAnalyticsDashboard 
              kitId="demo-kit" 
              initialData={{
                kit_id: "demo-kit",
                period: "30d",
                date_range: {
                  start: "2024-07-15",
                  end: "2024-08-15"
                },
                basic_analytics: {
                  total_clients: 1247,
                  completed_clients: 892,
                  active_clients: 234,
                  abandoned_clients: 121,
                  completion_rate: 71.5,
                  bounce_rate: 9.7,
                  avg_completion_time_minutes: 18
                },
                conversion_funnel: {
                  total_entries: 1247,
                  steps: [
                    { step_id: "1", step_title: "Welcome", step_order: 1, completions: 1247, conversion_rate: 1.0 },
                    { step_id: "2", step_title: "Basic Info", step_order: 2, completions: 1156, conversion_rate: 0.927 },
                    { step_id: "3", step_title: "Documents", step_order: 3, completions: 1034, conversion_rate: 0.894 },
                    { step_id: "4", step_title: "Review", step_order: 4, completions: 923, conversion_rate: 0.893 },
                    { step_id: "5", step_title: "Complete", step_order: 5, completions: 892, conversion_rate: 0.966 }
                  ]
                },
                performance_benchmarks: [
                  {
                    benchmark_date: "2024-07-15",
                    completion_rate: 0.68,
                    avg_completion_time: 22,
                    bounce_rate: 0.12,
                    client_satisfaction: 4.2,
                    mobile_completion_rate: 0.64,
                    desktop_completion_rate: 0.72
                  },
                  {
                    benchmark_date: "2024-08-01",
                    completion_rate: 0.715,
                    avg_completion_time: 18,
                    bounce_rate: 0.097,
                    client_satisfaction: 4.5,
                    mobile_completion_rate: 0.69,
                    desktop_completion_rate: 0.74
                  }
                ],
                roi_data: {
                  total_clients: 1247,
                  completed_clients: 892,
                  revenue_generated: 445600,
                  cost_per_acquisition: 125,
                  customer_lifetime_value: 2400,
                  time_saved_hours: 1784,
                  cost_savings: 89200,
                  roi_percentage: 356.8,
                  payback_period_days: 45,
                  efficiency_score: 87.3
                },
                behavior_insights: {
                  total_events: 15678,
                  event_distribution: {
                    "page_view": 5234,
                    "form_submit": 2156,
                    "file_upload": 1892,
                    "button_click": 3456,
                    "field_focus": 2940
                  },
                  step_interactions: {},
                  most_common_events: [
                    { event: "page_view", count: 5234 },
                    { event: "button_click", count: 3456 },
                    { event: "field_focus", count: 2940 }
                  ]
                }
              }}
            />
          </TabsContent>

          <TabsContent value="email">
            <EmailMarketingDashboard />
          </TabsContent>

          <TabsContent value="branding">
            <AdvancedBrandingCustomizer />
          </TabsContent>

          <TabsContent value="team">
            <SimpleTeamDashboard />
          </TabsContent>

          <TabsContent value="audit">
            <ActivityLogViewer organizationId="demo-org" />
          </TabsContent>

          <TabsContent value="workflows">
            <WorkflowAutomationDashboard />
          </TabsContent>

          <TabsContent value="crm">
            <AdvancedCRMIntegrations />
          </TabsContent>

          <TabsContent value="ai-insights">
            <AIPoweredInsights />
          </TabsContent>

          <TabsContent value="security">
            <EnterpriseSecurityCompliance />
          </TabsContent>

          <TabsContent value="white-label">
            <WhiteLabelPlatform />
          </TabsContent>

          <TabsContent value="sso">
            <EnterpriseSSOIntegration />
          </TabsContent>

          <TabsContent value="advanced-ai">
            <AdvancedAIFeatures />
          </TabsContent>

          <TabsContent value="i18n">
            <MultiLanguageSupport />
          </TabsContent>

          <TabsContent value="mobile">
            <NativeMobileApps />
          </TabsContent>

          <TabsContent value="calendar">
            <CalendarIntegrationEnhancement />
          </TabsContent>

          <TabsContent value="files">
            <FileManagementSystem />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationSystem />
          </TabsContent>

          <TabsContent value="marketplace">
            <TemplateMarketplace />
          </TabsContent>

          <TabsContent value="sdk">
            <EmbeddedOnboardingSDK />
          </TabsContent>

          <TabsContent value="market">
            <MarketPositioningDashboard />
          </TabsContent>

          <TabsContent value="pricing">
            <PricingStrategyDashboard />
          </TabsContent>
        </Tabs>
      </div>
      <ChatbotTrigger />
    </div>
    </ChatbotProvider>
  )
}