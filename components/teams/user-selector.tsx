"use client"

import { useState, useEffect } from 'react'
import { Check, ChevronsUpDown, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface User {
  id: string
  email: string
  full_name: string
  avatar_url?: string
}

interface UserSelectorProps {
  organizationId: string
  value: string
  onValueChange: (email: string) => void
  placeholder?: string
}

export function UserSelector({ 
  organizationId, 
  value, 
  onValueChange, 
  placeholder = "Select user..." 
}: UserSelectorProps) {
  const [open, setOpen] = useState(false)
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchUsers()
  }, [organizationId])

  const fetchUsers = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/v1/organizations/${organizationId}/users`, {
        headers: {
          'X-Organization-ID': organizationId
        }
      })
      
      if (response.ok) {
        const result = await response.json()
        setUsers(result.data)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  const selectedUser = users.find(user => user.email === value)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedUser ? (
            <div className="flex items-center space-x-2">
              <Avatar className="h-5 w-5">
                <AvatarImage src={selectedUser.avatar_url} />
                <AvatarFallback className="text-xs">
                  {selectedUser.full_name?.charAt(0) || selectedUser.email.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="truncate">{selectedUser.full_name || selectedUser.email}</span>
            </div>
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search users..." />
          <CommandEmpty>
            {loading ? "Loading users..." : "No users found."}
          </CommandEmpty>
          <CommandGroup>
            {users.map((user) => (
              <CommandItem
                key={user.id}
                value={user.email}
                onSelect={(currentValue) => {
                  onValueChange(currentValue === value ? "" : currentValue)
                  setOpen(false)
                }}
              >
                <div className="flex items-center space-x-2 flex-1">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={user.avatar_url} />
                    <AvatarFallback className="text-xs">
                      {user.full_name?.charAt(0) || user.email.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.full_name || 'No name'}</span>
                    <span className="text-sm text-muted-foreground">{user.email}</span>
                  </div>
                </div>
                <Check
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === user.email ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  )
}