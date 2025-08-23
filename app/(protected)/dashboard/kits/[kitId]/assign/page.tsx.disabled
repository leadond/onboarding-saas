'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

interface Company {
  id: string
  name: string
  legal_name?: string
}

interface Client {
  id: string
  name: string
  email: string
  company?: string
}

export default function AssignKitPage() {
  const router = useRouter()
  const params = useParams()
  const kitId = params.kitId as string
  const [companies, setCompanies] = useState<Company[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedCompany, setSelectedCompany] = useState('')
  const [selectedClients, setSelectedClients] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [assigning, setAssigning] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [companiesRes, clientsRes] = await Promise.all([
          fetch('/api/v1/companies'),
          fetch('/api/clients')
        ])

        if (companiesRes.ok) {
          const companiesData = await companiesRes.json()
          setCompanies(companiesData.data || [])
        }

        if (clientsRes.ok) {
          const clientsData = await clientsRes.json()
          setClients(clientsData.data?.clients || [])
        }
      } catch (err) {
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAssign = async () => {
    if (!selectedCompany) {
      setError('Please select a company')
      return
    }

    setAssigning(true)
    setError(null)

    try {
      const response = await fetch(`/api/kit-assign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          kitId,
          companyId: selectedCompany,
          clientIds: selectedClients
        })
      })

      if (!response.ok) {
        throw new Error('Failed to assign kit')
      }

      router.push(`/dashboard/kits/${kitId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Assignment failed')
    } finally {
      setAssigning(false)
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Assign Kit to Company</h1>
        <p className="text-gray-600">Select a company and optionally specific clients</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Company Selection</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Select Company</label>
            <Select value={selectedCompany} onValueChange={setSelectedCompany}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a company" />
              </SelectTrigger>
              <SelectContent>
                {companies.map((company) => (
                  <SelectItem key={company.id} value={company.id}>
                    {company.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {clients.length > 0 && (
            <div>
              <label className="block text-sm font-medium mb-2">Select Clients (Optional)</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border rounded p-3">
                {clients.map((client) => (
                  <div key={client.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={client.id}
                      checked={selectedClients.includes(client.id)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          setSelectedClients([...selectedClients, client.id])
                        } else {
                          setSelectedClients(selectedClients.filter(id => id !== client.id))
                        }
                      }}
                    />
                    <label htmlFor={client.id} className="text-sm">
                      {client.name} ({client.email})
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 text-sm">{error}</div>
          )}

          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
            <Button onClick={handleAssign} disabled={assigning || !selectedCompany}>
              {assigning ? 'Assigning...' : 'Assign Kit'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}