'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Users, Mail, Phone, Building, Plus, Search } from 'lucide-react'

interface NylasContactManagerProps {
  accountId: string
}

interface Contact {
  id: string
  name: string
  email: string
  company_name?: string
  job_title?: string
  phone_numbers: Array<{ type: string; number: string }>
}

export function NylasContactManager({ accountId }: NylasContactManagerProps) {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchContacts()
  }, [accountId])

  const fetchContacts = async () => {
    setLoading(true)
    try {
      // Mock contacts data since we don't have the actual API endpoint yet
      const mockContacts: Contact[] = [
        {
          id: '1',
          name: 'John Doe',
          email: 'john@example.com',
          company_name: 'Example Corp',
          job_title: 'CEO',
          phone_numbers: [{ type: 'work', number: '+1-555-0123' }],
        },
        {
          id: '2',
          name: 'Jane Smith',
          email: 'jane@company.com',
          company_name: 'Company Inc',
          job_title: 'CTO',
          phone_numbers: [{ type: 'work', number: '+1-555-0456' }],
        },
      ]
      setContacts(mockContacts)
    } catch (error) {
      console.error('Failed to fetch contacts:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    contact.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.company_name && contact.company_name.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (loading) {
    return <div className="text-center p-8">Loading contacts...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Contacts
          </CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Contact
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search contacts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <div className="space-y-4">
            {filteredContacts.map((contact) => (
              <div key={contact.id} className="p-4 border rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h3 className="font-medium">{contact.name}</h3>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Mail className="h-3 w-3" />
                      {contact.email}
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    {contact.company_name && (
                      <Badge variant="outline" className="text-xs">
                        <Building className="h-3 w-3 mr-1" />
                        {contact.company_name}
                      </Badge>
                    )}
                    {contact.job_title && (
                      <Badge variant="secondary" className="text-xs">
                        {contact.job_title}
                      </Badge>
                    )}
                  </div>
                </div>
                {contact.phone_numbers.length > 0 && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Phone className="h-3 w-3" />
                    {contact.phone_numbers[0].number}
                  </div>
                )}
              </div>
            ))}
            {filteredContacts.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {searchTerm ? 'No contacts found matching your search' : 'No contacts found'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}