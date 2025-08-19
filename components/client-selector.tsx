/*
 * Copyright (c) 2024 Marvelously Made LLC DBA Dev App Hero. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: legal@devapphero.com
 */

'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { Search, User } from 'lucide-react'

interface Client {
  id: string
  name: string
  email: string
  company?: string
}

interface ClientSelectorProps {
  onClientSelect: (client: Client) => void
}

export function ClientSelector({ onClientSelect }: ClientSelectorProps) {
  const [clients, setClients] = useState<Client[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(false)
  const [showResults, setShowResults] = useState(false)

  const searchClients = async (term: string) => {
    if (!term.trim()) {
      setClients([])
      setShowResults(false)
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`/api/clients?search=${encodeURIComponent(term)}`)
      const result = await response.json()
      
      if (result.success) {
        setClients(result.data.clients)
        setShowResults(true)
      }
    } catch (error) {
      console.error('Error searching clients:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const debounce = setTimeout(() => {
      searchClients(searchTerm)
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchTerm])

  const handleClientSelect = (client: Client) => {
    onClientSelect(client)
    setSearchTerm('')
    setShowResults(false)
  }

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search existing clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {showResults && (
        <Card className="absolute z-10 w-full mt-1 max-h-60 overflow-y-auto">
          <CardContent className="p-2">
            {loading ? (
              <div className="p-2 text-center text-sm text-gray-500">Searching...</div>
            ) : clients.length === 0 ? (
              <div className="p-2 text-center text-sm text-gray-500">No clients found</div>
            ) : (
              <div className="space-y-1">
                {clients.map((client) => (
                  <Button
                    key={client.id}
                    variant="ghost"
                    className="w-full justify-start h-auto p-2"
                    onClick={() => handleClientSelect(client)}
                  >
                    <User className="h-4 w-4 mr-2 flex-shrink-0" />
                    <div className="text-left">
                      <div className="font-medium">{client.name}</div>
                      <div className="text-xs text-gray-500">{client.email}</div>
                      {client.company && (
                        <div className="text-xs text-gray-400">{client.company}</div>
                      )}
                    </div>
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}