/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

'use client'

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Progress } from '@/components/ui/progress'
import {
  DollarSign,
  TrendingUp,
  Users,
  Crown,
  Zap,
  Shield,
  Code,
  Headphones,
  Check,
  X,
  ArrowUp,
  ArrowDown,
  BarChart3,
  Target,
  Award,
  Globe
} from 'lucide-react'

export function PricingStrategyDashboard() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [selectedTier, setSelectedTier] = useState('professional')

  const pricingTiers = [
    {
      id: 'starter',
      name: 'Starter',
      icon: Zap,
      color: 'blue',
      description: 'Perfect for small teams getting started',
      monthlyPrice: 49,
      annualPrice: 39,
      originalPrice: 59,
      savings: 17,
      customers: 1247,
      revenue: 48630,
      growth: 23,
      features: [
        'Up to 100 clients/month',
        'Core onboarding features',
        'Basic analytics',
        'API access',
        'Email support',
        'Basic integrations',
        'Mobile responsive',
        'Custom branding'
      ],
      limits: {
        clients: 100,
        workflows: 5,
        integrations: 3,
        storage: '1GB',
        support: 'Email'
      },
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      icon: Users,
      color: 'green',
      description: 'Advanced features for growing businesses',
      monthlyPrice: 149,
      annualPrice: 119,
      originalPrice: 179,
      savings: 20,
      customers: 892,
      revenue: 106108,
      growth: 31,
      features: [
        'Up to 500 clients/month',
        'Advanced analytics',
        'Workflow automation',
        'CRM integrations',
        'A/B testing',
        'Custom fields',
        'Priority support',
        'White-label options',
        'Team collaboration',
        'Advanced reporting'
      ],
      limits: {
        clients: 500,
        workflows: 25,
        integrations: 15,
        storage: '10GB',
        support: 'Priority'
      },
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Crown,
      color: 'purple',
      description: 'Complete solution for large organizations',
      monthlyPrice: 399,
      annualPrice: 319,
      originalPrice: 499,
      savings: 25,
      customers: 234,
      revenue: 74766,
      growth: 45,
      features: [
        'Unlimited clients',
        'White-label platform',
        'SSO integration',
        'Advanced security',
        'Compliance tools',
        'Custom development',
        'Dedicated support',
        'SLA guarantee',
        'Advanced AI features',
        'Multi-language support',
        'Custom integrations',
        'Audit logs'
      ],
      limits: {
        clients: 'Unlimited',
        workflows: 'Unlimited',
        integrations: 'Unlimited',
        storage: '100GB',
        support: 'Dedicated'
      },
      popular: false
    },
    {
      id: 'enterprise-plus',
      name: 'Enterprise Plus',
      icon: Award,
      color: 'gold',
      description: 'Premium solution with dedicated success management',
      monthlyPrice: 899,
      annualPrice: 719,
      originalPrice: 1099,
      savings: 30,
      customers: 67,
      revenue: 48173,
      growth: 67,
      features: [
        'Everything in Enterprise',
        'Custom development',
        'Dedicated CSM',
        'Premium SLA',
        'On-premise deployment',
        'Custom training',
        '24/7 phone support',
        'Quarterly reviews',
        'Custom integrations',
        'Advanced security',
        'Compliance consulting',
        'Priority feature requests'
      ],
      limits: {
        clients: 'Unlimited',
        workflows: 'Unlimited',
        integrations: 'Custom',
        storage: '1TB',
        support: '24/7 Dedicated'
      },
      popular: false
    }
  ]

  const competitorComparison = [
    {
      feature: 'AI-Powered Insights',
      onboardkit: true,
      competitor1: false,
      competitor2: false,
      competitor3: true
    },
    {
      feature: 'No-Code Builder',
      onboardkit: true,
      competitor1: true,
      competitor2: false,
      competitor3: false
    },
    {
      feature: 'White-Label Platform',
      onboardkit: true,
      competitor1: false,
      competitor2: true,
      competitor3: false
    },
    {
      feature: 'Embedded SDK',
      onboardkit: true,
      competitor1: false,
      competitor2: false,
      competitor3: false
    },
    {
      feature: 'Enterprise Security',
      onboardkit: true,
      competitor1: true,
      competitor2: true,
      competitor3: true
    },
    {
      feature: 'Mobile Apps',
      onboardkit: true,
      competitor1: false,
      competitor2: false,
      competitor3: true
    }
  ]

  const revenueMetrics = {
    totalRevenue: 277677,
    monthlyGrowth: 34,
    averageRevenue: 1156,
    churnRate: 3.2,
    expansionRevenue: 23,
    customerLifetimeValue: 8947
  }

  const selectedTierData = pricingTiers.find(tier => tier.id === selectedTier)
  const currentPrice = billingCycle === 'annual' ? selectedTierData?.annualPrice : selectedTierData?.monthlyPrice

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <DollarSign className="h-6 w-6 text-green-600" />
            Pricing Strategy Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Comprehensive pricing analysis and revenue optimization insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Revenue Report
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Optimize Pricing
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Monthly Revenue</p>
                <p className="text-2xl font-bold">${revenueMetrics.totalRevenue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +{revenueMetrics.monthlyGrowth}% MoM
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">ARPU</p>
                <p className="text-2xl font-bold">${revenueMetrics.averageRevenue}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +12% QoQ
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Customer LTV</p>
                <p className="text-2xl font-bold">${revenueMetrics.customerLifetimeValue.toLocaleString()}</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +18% YoY
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Churn Rate</p>
                <p className="text-2xl font-bold">{revenueMetrics.churnRate}%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowDown className="h-3 w-3 mr-1" />
                  -0.8% MoM
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="tiers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="tiers">Pricing Tiers</TabsTrigger>
          <TabsTrigger value="analysis">Revenue Analysis</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Pricing</TabsTrigger>
          <TabsTrigger value="optimization">Optimization</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="space-y-6">
          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={billingCycle === 'monthly' ? 'font-semibold' : 'text-gray-600'}>
              Monthly
            </span>
            <Switch
              checked={billingCycle === 'annual'}
              onCheckedChange={(checked) => setBillingCycle(checked ? 'annual' : 'monthly')}
            />
            <span className={billingCycle === 'annual' ? 'font-semibold' : 'text-gray-600'}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <Badge variant="secondary" className="ml-2">
                Save up to 30%
              </Badge>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {pricingTiers.map((tier) => {
              const Icon = tier.icon
              const price = billingCycle === 'annual' ? tier.annualPrice : tier.monthlyPrice
              const isSelected = selectedTier === tier.id
              
              return (
                <Card
                  key={tier.id}
                  className={`relative cursor-pointer transition-all ${
                    isSelected
                      ? 'ring-2 ring-blue-500 shadow-lg'
                      : 'hover:shadow-md'
                  } ${tier.popular ? 'border-green-500' : ''}`}
                  onClick={() => setSelectedTier(tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                      <Badge className="bg-green-500">Most Popular</Badge>
                    </div>
                  )}
                  
                  <CardHeader className="text-center pb-4">
                    <div className="flex justify-center mb-2">
                      <Icon className={`h-8 w-8 text-${tier.color}-600`} />
                    </div>
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <p className="text-sm text-gray-600">{tier.description}</p>
                    
                    <div className="mt-4">
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-bold">${price}</span>
                        <span className="text-gray-600">/{billingCycle === 'annual' ? 'mo' : 'month'}</span>
                      </div>
                      {billingCycle === 'annual' && (
                        <div className="text-sm text-gray-500 mt-1">
                          <span className="line-through">${tier.monthlyPrice}</span>
                          <span className="text-green-600 ml-2">Save {tier.savings}%</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <p className="text-gray-600">Customers</p>
                        <p className="font-semibold">{tier.customers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Growth</p>
                        <p className="font-semibold text-green-600">+{tier.growth}%</p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <h4 className="font-semibold text-sm">Key Features:</h4>
                      <ul className="space-y-1">
                        {tier.features.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center gap-2 text-xs">
                            <Check className="h-3 w-3 text-green-500" />
                            {feature}
                          </li>
                        ))}
                        {tier.features.length > 4 && (
                          <li className="text-xs text-gray-500">
                            +{tier.features.length - 4} more features
                          </li>
                        )}
                      </ul>
                    </div>

                    <Button 
                      className="w-full" 
                      variant={isSelected ? "default" : "outline"}
                      size="sm"
                    >
                      {isSelected ? 'Current Plan' : 'Select Plan'}
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Tier Details */}
          {selectedTierData && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <selectedTierData.icon className="h-5 w-5" />
                  {selectedTierData.name} Plan Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold mb-3">All Features Included:</h4>
                    <div className="grid grid-cols-1 gap-2">
                      {selectedTierData.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <Check className="h-4 w-4 text-green-500" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-3">Plan Limits:</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Monthly Clients</span>
                        <span className="font-semibold">{selectedTierData.limits.clients}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Workflows</span>
                        <span className="font-semibold">{selectedTierData.limits.workflows}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Integrations</span>
                        <span className="font-semibold">{selectedTierData.limits.integrations}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Storage</span>
                        <span className="font-semibold">{selectedTierData.limits.storage}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">Support</span>
                        <span className="font-semibold">{selectedTierData.limits.support}</span>
                      </div>
                    </div>

                    <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                      <h5 className="font-semibold text-sm mb-2">Revenue Impact</h5>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>Monthly Revenue:</span>
                          <span className="font-semibold">${selectedTierData.revenue.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Growth Rate:</span>
                          <span className="font-semibold text-green-600">+{selectedTierData.growth}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Active Customers:</span>
                          <span className="font-semibold">{selectedTierData.customers}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analysis" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Tier</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pricingTiers.map((tier) => (
                    <div key={tier.id} className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>{tier.name}</span>
                        <span className="font-semibold">${tier.revenue.toLocaleString()}</span>
                      </div>
                      <Progress 
                        value={(tier.revenue / revenueMetrics.totalRevenue) * 100} 
                        className="h-2" 
                      />
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>{tier.customers} customers</span>
                        <span>{Math.round((tier.revenue / revenueMetrics.totalRevenue) * 100)}% of total</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Growth Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">
                        +{revenueMetrics.monthlyGrowth}%
                      </p>
                      <p className="text-sm text-gray-600">Monthly Growth</p>
                    </div>
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">
                        {revenueMetrics.expansionRevenue}%
                      </p>
                      <p className="text-sm text-gray-600">Expansion Revenue</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Tier Performance</h4>
                    {pricingTiers.map((tier) => (
                      <div key={tier.id} className="flex items-center justify-between p-2 border rounded">
                        <span className="text-sm">{tier.name}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-green-600">
                            +{tier.growth}%
                          </span>
                          <ArrowUp className="h-3 w-3 text-green-600" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Competitive Feature Comparison</CardTitle>
              <p className="text-sm text-gray-600">
                How Onboard Hero compares to major competitors
              </p>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Feature</th>
                      <th className="text-center p-2">Onboard Hero</th>
                      <th className="text-center p-2">Competitor A</th>
                      <th className="text-center p-2">Competitor B</th>
                      <th className="text-center p-2">Competitor C</th>
                    </tr>
                  </thead>
                  <tbody>
                    {competitorComparison.map((row, index) => (
                      <tr key={index} className="border-b">
                        <td className="p-2 font-medium">{row.feature}</td>
                        <td className="text-center p-2">
                          {row.onboardkit ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-2">
                          {row.competitor1 ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-2">
                          {row.competitor2 ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-2">
                          {row.competitor3 ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-red-500 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="optimization" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Pricing Recommendations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-800 mb-2">Opportunity: Professional Tier</h4>
                  <p className="text-sm text-green-700 mb-2">
                    Consider increasing Professional tier price by $20/month based on feature value and low churn rate.
                  </p>
                  <div className="text-xs text-green-600">
                    Potential revenue increase: +$17,840/month
                  </div>
                </div>

                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">Suggestion: Enterprise Plus</h4>
                  <p className="text-sm text-blue-700 mb-2">
                    Add custom pricing tier above Enterprise Plus for Fortune 500 companies.
                  </p>
                  <div className="text-xs text-blue-600">
                    Target price: $2,000+/month
                  </div>
                </div>

                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">Analysis: Starter Tier</h4>
                  <p className="text-sm text-yellow-700 mb-2">
                    Starter tier shows strong growth. Consider adding usage-based pricing for overages.
                  </p>
                  <div className="text-xs text-yellow-600">
                    Potential additional revenue: +$0.50 per extra client
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>A/B Testing Results</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Annual Discount Test</h4>
                      <Badge variant="secondary">Active</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Testing 25% vs 30% annual discount
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-600">25% Discount:</span>
                        <span className="font-semibold ml-1">67% conversion</span>
                      </div>
                      <div>
                        <span className="text-gray-600">30% Discount:</span>
                        <span className="font-semibold ml-1">71% conversion</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Feature Bundling</h4>
                      <Badge variant="outline">Completed</Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-2">
                      Testing AI features in Professional vs Enterprise
                    </p>
                    <div className="text-xs">
                      <span className="text-green-600 font-semibold">Result: +23% Professional upgrades</span>
                    </div>
                  </div>

                  <div className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-sm">Free Trial Length</h4>
                      <Badge variant="secondary">Planning</Badge>
                    </div>
                    <p className="text-xs text-gray-600">
                      Testing 14-day vs 30-day free trial periods
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}