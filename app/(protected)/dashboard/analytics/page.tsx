import { AdvancedAnalyticsDashboard } from '@/components/analytics/advanced-analytics-dashboard'

export default function AnalyticsPage() {
  // For now, use a default kitId - in production this would come from context or props
  return <AdvancedAnalyticsDashboard kitId="default" />
}