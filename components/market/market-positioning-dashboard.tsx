'use client'

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  TrendingUp,
  Target,
  Building2,
  ShoppingCart,
  CreditCard,
  Heart,
  GraduationCap,
  Shield,
  Users,
  DollarSign,
  BarChart3,
  Globe,
  Zap,
  Award,
  ArrowUp,
  ArrowDown,
  Minus
} from 'lucide-react'

export function MarketPositioningDashboard() {
  const [selectedMarket, setSelectedMarket] = useState('saas')

  const primaryMarkets = [
    {
      id: 'saas',
      name: 'SaaS Companies',
      icon: Building2,
      focus: '$10K-$100K ARR',
      size: '$2.8B',
      growth: '+23%',
      penetration: 12.4,
      customers: 847,
      revenue: '$1.2M',
      avgDeal: '$1,417',
      conversionRate: 8.2,
      description: 'Software-as-a-Service companies looking to streamline customer onboarding',
      keyMetrics: {
        marketSize: 2800000000,
        growthRate: 23,
        competitorCount: 47,
        avgContractValue: 1417
      }
    },
    {
      id: 'professional',
      name: 'Professional Services',
      icon: Users,
      focus: 'Consulting & Legal',
      size: '$1.9B',
      growth: '+18%',
      penetration: 8.7,
      customers: 523,
      revenue: '$890K',
      avgDeal: '$1,701',
      conversionRate: 6.8,
      description: 'Law firms, consulting agencies, and professional service providers',
      keyMetrics: {
        marketSize: 1900000000,
        growthRate: 18,
        competitorCount: 23,
        avgContractValue: 1701
      }
    },
    {
      id: 'ecommerce',
      name: 'E-commerce Platforms',
      icon: ShoppingCart,
      focus: 'Online Retailers',
      size: '$3.4B',
      growth: '+31%',
      penetration: 15.2,
      customers: 1234,
      revenue: '$1.8M',
      avgDeal: '$1,458',
      conversionRate: 11.3,
      description: 'Online stores and marketplaces optimizing customer acquisition',
      keyMetrics: {
        marketSize: 3400000000,
        growthRate: 31,
        competitorCount: 62,
        avgContractValue: 1458
      }
    },
    {
      id: 'financial',
      name: 'Financial Services',
      icon: CreditCard,
      focus: 'Banks & Fintech',
      size: '$4.1B',
      growth: '+15%',
      penetration: 6.3,
      customers: 289,
      revenue: '$2.1M',
      avgDeal: '$7,267',
      conversionRate: 4.2,
      description: 'Banks, credit unions, and fintech companies with compliance requirements',
      keyMetrics: {
        marketSize: 4100000000,
        growthRate: 15,
        competitorCount: 31,
        avgContractValue: 7267
      }
    }
  ]

  const secondaryMarkets = [
    {
      id: 'healthcare',
      name: 'Healthcare Organizations',
      icon: Heart,
      size: '$2.2B',
      growth: '+12%',
      penetration: 3.1,
      customers: 156,
      revenue: '$1.1M',
      avgDeal: '$7,051',
      opportunity: 'High',
      compliance: 'HIPAA Required'
    },
    {
      id: 'education',
      name: 'Education Institutions',
      icon: GraduationCap,
      size: '$1.5B',
      growth: '+8%',
      penetration: 4.7,
      customers: 234,
      revenue: '$567K',
      avgDeal: '$2,423',
      opportunity: 'Medium',
      compliance: 'FERPA Required'
    },
    {
      id: 'government',
      name: 'Government Agencies',
      icon: Shield,
      size: '$1.8B',
      growth: '+5%',
      penetration: 1.2,
      customers: 67,
      revenue: '$890K',
      avgDeal: '$13,284',
      opportunity: 'High',
      compliance: 'FedRAMP Required'
    },
    {
      id: 'nonprofit',
      name: 'Non-profit Organizations',
      icon: Globe,
      size: '$0.8B',
      growth: '+14%',
      penetration: 7.8,
      customers: 445,
      revenue: '$234K',
      avgDeal: '$526',
      opportunity: 'Low',
      compliance: 'Standard'
    }
  ]

  const competitiveAdvantages = [
    {
      feature: 'AI-First Platform',
      advantage: '45% better completion rates',
      impact: 'High',
      differentiator: 'First to market with AI throughout customer journey'
    },
    {
      feature: 'No-Code Builder',
      advantage: '70% faster implementation',
      impact: 'High',
      differentiator: 'Visual workflow builder requires zero technical knowledge'
    },
    {
      feature: 'Enterprise Security',
      advantage: 'Deploy without security reviews',
      impact: 'High',
      differentiator: 'SOC 2, GDPR, HIPAA compliant out of the box'
    },
    {
      feature: 'Embedded SDK',
      advantage: 'Seamless integration',
      impact: 'Medium',
      differentiator: 'First platform with embeddable components'
    }
  ]

  const selectedMarketData = primaryMarkets.find(m => m.id === selectedMarket)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Target className="h-6 w-6 text-blue-600" />
            Market Positioning Dashboard
          </h1>
          <p className="text-gray-600 mt-1">
            Strategic market analysis and competitive positioning insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Market Report
          </Button>
          <Button size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            Strategy Update
          </Button>
        </div>
      </div>

      {/* Market Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Addressable Market</p>
                <p className="text-2xl font-bold">$12.9B</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +19% YoY
                </p>
              </div>
              <Globe className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Market Penetration</p>
                <p className="text-2xl font-bold">10.7%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +2.3% QoQ
                </p>
              </div>
              <Target className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Customers</p>
                <p className="text-2xl font-bold">2,893</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  +156 this month
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
                <p className="text-sm text-gray-600">Revenue Growth</p>
                <p className="text-2xl font-bold">+234%</p>
                <p className="text-xs text-green-600 flex items-center">
                  <ArrowUp className="h-3 w-3 mr-1" />
                  Above target
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="primary" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="primary">Primary Markets</TabsTrigger>
          <TabsTrigger value="secondary">Secondary Markets</TabsTrigger>
          <TabsTrigger value="competitive">Competitive Edge</TabsTrigger>
          <TabsTrigger value="strategy">Go-to-Market</TabsTrigger>
        </TabsList>

        <TabsContent value="primary" className="space-y-6">
          {/* Market Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {primaryMarkets.map((market) => {
              const Icon = market.icon
              return (
                <Card
                  key={market.id}
                  className={`cursor-pointer transition-all ${
                    selectedMarket === market.id
                      ? 'ring-2 ring-blue-500 bg-blue-50'
                      : 'hover:shadow-md'
                  }`}
                  onClick={() => setSelectedMarket(market.id)}
                >
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Icon className="h-8 w-8 text-blue-600" />
                        <Badge variant="secondary" className="text-xs">
                          {market.growth}
                        </Badge>
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{market.name}</h3>
                        <p className="text-xs text-gray-600">{market.focus}</p>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span>Market Size</span>
                          <span className="font-semibold">{market.size}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Penetration</span>
                          <span className="font-semibold">{market.penetration}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span>Customers</span>
                          <span className="font-semibold">{market.customers}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Market Details */}
          {selectedMarketData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <selectedMarketData.icon className="h-5 w-5" />
                    {selectedMarketData.name} - Market Analysis
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600">{selectedMarketData.description}</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Market Size</p>
                      <p className="text-xl font-bold">{selectedMarketData.size}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Growth Rate</p>
                      <p className="text-xl font-bold text-green-600">{selectedMarketData.growth}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Our Revenue</p>
                      <p className="text-xl font-bold">{selectedMarketData.revenue}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Avg Deal Size</p>
                      <p className="text-xl font-bold">{selectedMarketData.avgDeal}</p>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Market Penetration</span>
                      <span>{selectedMarketData.penetration}%</span>
                    </div>
                    <Progress value={selectedMarketData.penetration} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span>Conversion Rate</span>
                      <span>{selectedMarketData.conversionRate}%</span>
                    </div>
                    <Progress value={selectedMarketData.conversionRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Customer Acquisition</p>
                        <p className="text-xs text-gray-600">Monthly new customers</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">+47</p>
                        <p className="text-xs text-green-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          +23%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Revenue Growth</p>
                        <p className="text-xs text-gray-600">Quarter over quarter</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-blue-600">+156%</p>
                        <p className="text-xs text-blue-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          Above target
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-purple-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Customer Retention</p>
                        <p className="text-xs text-gray-600">12-month retention rate</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-purple-600">94.2%</p>
                        <p className="text-xs text-purple-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          +2.1%
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div>
                        <p className="text-sm font-medium">Market Share</p>
                        <p className="text-xs text-gray-600">Within target segment</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-yellow-600">18.7%</p>
                        <p className="text-xs text-yellow-600 flex items-center">
                          <ArrowUp className="h-3 w-3 mr-1" />
                          +4.2%
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>

        <TabsContent value="secondary" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {secondaryMarkets.map((market) => {
              const Icon = market.icon
              return (
                <Card key={market.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Icon className="h-5 w-5" />
                      {market.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Market Size</p>
                        <p className="font-semibold">{market.size}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Growth Rate</p>
                        <p className="font-semibold text-green-600">{market.growth}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Penetration</p>
                        <p className="font-semibold">{market.penetration}%</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Customers</p>
                        <p className="font-semibold">{market.customers}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Revenue</p>
                        <p className="font-semibold">{market.revenue}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Avg Deal</p>
                        <p className="font-semibold">{market.avgDeal}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge 
                        variant={market.opportunity === 'High' ? 'default' : market.opportunity === 'Medium' ? 'secondary' : 'outline'}
                      >
                        {market.opportunity} Opportunity
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {market.compliance}
                      </Badge>
                    </div>

                    <Progress value={market.penetration} className="h-2" />
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="competitive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Competitive Advantages
              </CardTitle>
              <p className="text-sm text-gray-600">
                Key differentiators that set OnboardKit apart from competitors
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {competitiveAdvantages.map((advantage, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{advantage.feature}</h3>
                      <Badge 
                        variant={advantage.impact === 'High' ? 'default' : 'secondary'}
                      >
                        {advantage.impact} Impact
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{advantage.differentiator}</p>
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium text-green-600">
                        {advantage.advantage}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="strategy" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Go-to-Market Strategy</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center text-xs font-semibold text-blue-600">
                      1
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Product-Led Growth</h4>
                      <p className="text-xs text-gray-600">Free trial with immediate value demonstration</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center text-xs font-semibold text-green-600">
                      2
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Content Marketing</h4>
                      <p className="text-xs text-gray-600">Educational content targeting decision makers</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center text-xs font-semibold text-purple-600">
                      3
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Partner Channel</h4>
                      <p className="text-xs text-gray-600">Integration partnerships with complementary tools</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center text-xs font-semibold text-yellow-600">
                      4
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm">Enterprise Sales</h4>
                      <p className="text-xs text-gray-600">Direct sales for high-value enterprise accounts</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Market Expansion Plan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">Q4 2024</h4>
                      <Badge variant="secondary">In Progress</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Healthcare market entry with HIPAA compliance</p>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">Q1 2025</h4>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                    <p className="text-xs text-gray-600">European expansion with GDPR focus</p>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">Q2 2025</h4>
                      <Badge variant="outline">Planned</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Government sector with FedRAMP certification</p>
                  </div>
                  <div className="p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-semibold text-sm">Q3 2025</h4>
                      <Badge variant="outline">Research</Badge>
                    </div>
                    <p className="text-xs text-gray-600">Asia-Pacific market assessment</p>
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