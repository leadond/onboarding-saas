'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Company {
  id: string
  name: string
  legal_name?: string
  industry?: string
  website_url?: string
  created_at: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/v1/companies')
        if (response.ok) {
          const data = await response.json()
          setCompanies(data.data || [])
        } else {
          throw new Error('Failed to fetch companies')
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }

    fetchCompanies()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Companies</h1>
          <p className="text-gray-600">Manage companies for kit assignments</p>
        </div>
        <Button asChild>
          <Link href="/dashboard/companies/new">Add Company</Link>
        </Button>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {companies.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-2xl">🏢</span>
            </div>
            <h3 className="mb-2 text-lg font-medium text-gray-900">No companies yet</h3>
            <p className="mb-6 text-gray-600">Add companies to assign onboarding kits to them.</p>
            <Button asChild>
              <Link href="/dashboard/companies/new">Add Your First Company</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {companies.map((company) => (
            <Card key={company.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                    <span className="text-white text-lg font-bold">🏢</span>
                  </div>
                  {company.name}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-gray-600">
                  {company.legal_name && (
                    <p><strong>Legal Name:</strong> {company.legal_name}</p>
                  )}
                  {company.industry && (
                    <p><strong>Industry:</strong> {company.industry}</p>
                  )}
                  {company.website_url && (
                    <p><strong>Website:</strong> 
                      <a href={company.website_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                        {company.website_url}
                      </a>
                    </p>
                  )}
                  <p><strong>Added:</strong> {new Date(company.created_at).toLocaleDateString()}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}