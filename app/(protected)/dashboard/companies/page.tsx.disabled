'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { RefreshCw } from 'lucide-react'

interface Company {
  id: string
  name: string
  legal_name?: string
  industry?: string
  website_url?: string
  email?: string
  phone?: string
  address?: string
  city?: string
  state?: string
  zip_code?: string
  country?: string
  description?: string
  created_at: string
}

interface CompanyEmployee {
  id: string
  name: string
  email: string
  role: string
  department?: string
  phone?: string
}

export default function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null)
  const [companyEmployees, setCompanyEmployees] = useState<CompanyEmployee[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [editedCompany, setEditedCompany] = useState<Company | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const response = await fetch('/api/v1/companies')
        const data = await response.json()
        
        if (response.ok) {
          setCompanies(data.data || [])
        } else {
          throw new Error(data.error || `HTTP ${response.status}: Failed to fetch companies`)
        }
      } catch (err) {
        console.error('Companies fetch error:', err)
        setError(err instanceof Error ? err.message : 'Failed to load companies')
      } finally {
        setLoading(false)
      }
    }
 
    fetchCompanies()
  }, [])

  // Refresh companies list after navigation back to this page
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        fetchCompanies()
      }
    }
    
    const handleFocus = () => {
      fetchCompanies()
    }
    
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, [])

  // Auto-refresh every 30 seconds when page is visible
  useEffect(() => {
    const interval = setInterval(() => {
      if (!document.hidden) {
        fetchCompanies()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [])

  const fetchCompanies = async (showRefreshing = false) => {
    try {
      if (showRefreshing) {
        setRefreshing(true)
      }
      setError(null)
      
      const response = await fetch('/api/v1/companies', {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      })
      
      const data = await response.json()
      
      if (response.ok) {
        setCompanies(data.data || [])
      } else {
        throw new Error(data.error || `HTTP ${response.status}: Failed to fetch companies`)
      }
    } catch (err) {
      console.error('Companies fetch error:', err)
      setError(err instanceof Error ? err.message : 'Failed to load companies')
    } finally {
      if (showRefreshing) {
        setRefreshing(false)
      }
    }
  }

  const handleManualRefresh = async () => {
    await fetchCompanies(true)
    toast({ title: 'Companies refreshed successfully!' })
  }

  const fetchCompanyEmployees = async (companyId: string) => {
    try {
      const response = await fetch(`/api/v1/companies/${companyId}/employees`)
      if (response.ok) {
        const data = await response.json()
        setCompanyEmployees(data.data || [])
      } else {
        setCompanyEmployees([])
      }
    } catch (err) {
      console.error('Failed to fetch company employees:', err)
      setCompanyEmployees([])
    }
  }

  const handleCompanyClick = async (company: Company) => {
    setSelectedCompany(company)
    setEditedCompany({ ...company })
    setIsModalOpen(true)
    setIsEditing(false)
    await fetchCompanyEmployees(company.id)
  }

  const handleEditToggle = () => {
    setIsEditing(!isEditing)
    if (!isEditing) {
      setEditedCompany(selectedCompany ? { ...selectedCompany } : null)
    }
  }

  const handleSaveChanges = async () => {
    if (!editedCompany || !selectedCompany) return

    setIsSaving(true)
    try {
      const response = await fetch(`/api/v1/companies/${editedCompany.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedCompany)
      })

      if (response.ok) {
        const updatedCompany = await response.json()
        setCompanies(companies.map(c => 
          c.id === editedCompany.id ? updatedCompany.data : c
        ))
        setSelectedCompany(updatedCompany.data)
        setIsEditing(false)
        toast({ title: 'Company updated successfully!' })
        
        // Refresh the companies list to ensure we have the latest data
        await fetchCompanies()
      } else {
        throw new Error('Failed to update company')
      }
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to update company',
        variant: 'destructive'
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleInputChange = (field: keyof Company, value: string) => {
    if (editedCompany) {
      setEditedCompany({
        ...editedCompany,
        [field]: value
      })
    }
  }

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
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleManualRefresh}
            disabled={refreshing}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </Button>
          <Button asChild>
            <Link href="/dashboard/companies/new">Add Company</Link>
          </Button>
        </div>
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
            <Card 
              key={company.id} 
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => handleCompanyClick(company)}
            >
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
                      <a 
                        href={company.website_url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-blue-600 hover:underline ml-1"
                        onClick={(e) => e.stopPropagation()}
                      >
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

      {/* Company Details Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                <span className="text-white text-lg font-bold">🏢</span>
              </div>
              {selectedCompany?.name}
            </DialogTitle>
            <DialogDescription>
              View and edit company information
            </DialogDescription>
          </DialogHeader>

          {selectedCompany && (
            <div className="space-y-6">
              {/* Company Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Company Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="name">Company Name</Label>
                      <Input
                        id="name"
                        value={isEditing ? editedCompany?.name || '' : selectedCompany.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="legal_name">Legal Name</Label>
                      <Input
                        id="legal_name"
                        value={isEditing ? editedCompany?.legal_name || '' : selectedCompany.legal_name || ''}
                        onChange={(e) => handleInputChange('legal_name', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="industry">Industry</Label>
                      <Input
                        id="industry"
                        value={isEditing ? editedCompany?.industry || '' : selectedCompany.industry || ''}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="website_url">Website</Label>
                      <Input
                        id="website_url"
                        value={isEditing ? editedCompany?.website_url || '' : selectedCompany.website_url || ''}
                        onChange={(e) => handleInputChange('website_url', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="description">Description</Label>
                      <Input
                        id="description"
                        value={isEditing ? editedCompany?.description || '' : selectedCompany.description || ''}
                        onChange={(e) => handleInputChange('description', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Contact Information</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={isEditing ? editedCompany?.email || '' : selectedCompany.email || ''}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        value={isEditing ? editedCompany?.phone || '' : selectedCompany.phone || ''}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div>
                      <Label htmlFor="address">Address</Label>
                      <Input
                        id="address"
                        value={isEditing ? editedCompany?.address || '' : selectedCompany.address || ''}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        disabled={!isEditing}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="city">City</Label>
                        <Input
                          id="city"
                          value={isEditing ? editedCompany?.city || '' : selectedCompany.city || ''}
                          onChange={(e) => handleInputChange('city', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="state">State</Label>
                        <Input
                          id="state"
                          value={isEditing ? editedCompany?.state || '' : selectedCompany.state || ''}
                          onChange={(e) => handleInputChange('state', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label htmlFor="zip_code">ZIP Code</Label>
                        <Input
                          id="zip_code"
                          value={isEditing ? editedCompany?.zip_code || '' : selectedCompany.zip_code || ''}
                          onChange={(e) => handleInputChange('zip_code', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      <div>
                        <Label htmlFor="country">Country</Label>
                        <Input
                          id="country"
                          value={isEditing ? editedCompany?.country || '' : selectedCompany.country || ''}
                          onChange={(e) => handleInputChange('country', e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Company Employees */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Company Employees</h3>
                
                {companyEmployees.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>No employees found for this company.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {companyEmployees.map((employee) => (
                      <Card key={employee.id} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-500 to-blue-600 flex items-center justify-center">
                              <span className="text-white text-sm font-bold">
                                {employee.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium">{employee.name}</p>
                              <p className="text-sm text-gray-600">{employee.role}</p>
                            </div>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1">
                            <p><strong>Email:</strong> {employee.email}</p>
                            {employee.department && (
                              <p><strong>Department:</strong> {employee.department}</p>
                            )}
                            {employee.phone && (
                              <p><strong>Phone:</strong> {employee.phone}</p>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          <DialogFooter>
            <div className="flex gap-2">
              {isEditing ? (
                <>
                  <Button 
                    variant="outline" 
                    onClick={handleEditToggle}
                    disabled={isSaving}
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSaveChanges}
                    disabled={isSaving}
                  >
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsModalOpen(false)}
                  >
                    Close
                  </Button>
                  <Button onClick={handleEditToggle}>
                    Edit Company
                  </Button>
                </>
              )}
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}