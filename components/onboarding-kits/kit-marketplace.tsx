'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { KitTemplate } from '@/types/onboarding-kits'
import { Search, Clock, Users, Star, Download } from 'lucide-react'

interface KitMarketplaceProps {
  onSelectKit: (kit: KitTemplate) => void
}

export function KitMarketplace({ onSelectKit }: KitMarketplaceProps) {
  const [kits, setKits] = useState<KitTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedIndustry, setSelectedIndustry] = useState<string>('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetchKits()
  }, [selectedIndustry, selectedCategory])

  const fetchKits = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedIndustry) params.append('industry', selectedIndustry)
      if (selectedCategory) params.append('category', selectedCategory)

      const response = await fetch(`/api/kits/templates?${params}`)
      const data = await response.json()
      
      if (response.ok) {
        setKits(data.templates || [])
      }
    } catch (error) {
      console.error('Error fetching kits:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredKits = kits.filter(kit =>
    kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.description?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const industries = [...new Set(kits.map(kit => kit.industry).filter(Boolean))]
  const categories = [...new Set(kits.map(kit => kit.category).filter(Boolean))]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search kits..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Industries" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Industries</SelectItem>
            {industries.map(industry => (
              <SelectItem key={industry} value={industry}>{industry}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map(category => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredKits.map((kit) => (
          <Card key={kit.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">{kit.name}</CardTitle>
                  <CardDescription className="mt-1">
                    {kit.description}
                  </CardDescription>
                </div>
                {kit.is_premium && (
                  <Badge variant="secondary" className="ml-2">
                    Premium
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{kit.industry}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>{kit.steps?.length || 0} steps</span>
                  </div>
                </div>

                {kit.steps && kit.steps.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm">Included Steps:</h4>
                    <div className="space-y-1">
                      {kit.steps.slice(0, 3).map((step, index) => (
                        <div key={step.id} className="text-xs text-gray-600 flex items-center gap-2">
                          <span className="w-4 h-4 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">
                            {index + 1}
                          </span>
                          {step.name}
                        </div>
                      ))}
                      {kit.steps.length > 3 && (
                        <div className="text-xs text-gray-500">
                          +{kit.steps.length - 3} more steps
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="text-lg font-semibold">
                    {kit.price > 0 ? `$${kit.price}` : 'Free'}
                  </div>
                  <Button 
                    onClick={() => onSelectKit(kit)}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Use Kit
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredKits.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500">
            No kits found matching your criteria.
          </div>
        </div>
      )}
    </div>
  )
}