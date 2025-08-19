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

import React, { useState, useMemo } from 'react'
import { cn } from '@/lib/utils/cn'
import { Button } from './button'

interface Column<T> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, row: T) => React.ReactNode
  width?: string
  align?: 'left' | 'center' | 'right'
}

interface AdvancedTableProps<T> {
  data: T[]
  columns: Column<T>[]
  className?: string
  searchable?: boolean
  pagination?: boolean
  pageSize?: number
  loading?: boolean
  onRowClick?: (row: T) => void
  selectedRows?: T[]
  onSelectionChange?: (rows: T[]) => void
  actions?: {
    label: string
    onClick: (rows: T[]) => void
    variant?: 'default' | 'destructive' | 'outline'
  }[]
}

export function AdvancedTable<T extends Record<string, any>>({
  data,
  columns,
  className,
  searchable = true,
  pagination = true,
  pageSize = 10,
  loading = false,
  onRowClick,
  selectedRows = [],
  onSelectionChange,
  actions = []
}: AdvancedTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('')
  const [sortConfig, setSortConfig] = useState<{
    key: keyof T | null
    direction: 'asc' | 'desc'
  }>({ key: null, direction: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const [filters, setFilters] = useState<Record<string, string>>({})

  // Filter and search data
  const filteredData = useMemo(() => {
    let filtered = data

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        Object.values(row).some(value =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    }

    // Apply column filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value) {
        filtered = filtered.filter(row =>
          String(row[key]).toLowerCase().includes(value.toLowerCase())
        )
      }
    })

    return filtered
  }, [data, searchTerm, filters])

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortConfig.key) return filteredData

    return [...filteredData].sort((a, b) => {
      const aValue = a[sortConfig.key!]
      const bValue = b[sortConfig.key!]

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
      return 0
    })
  }, [filteredData, sortConfig])

  // Paginate data
  const paginatedData = useMemo(() => {
    if (!pagination) return sortedData
    
    const startIndex = (currentPage - 1) * pageSize
    return sortedData.slice(startIndex, startIndex + pageSize)
  }, [sortedData, currentPage, pageSize, pagination])

  const totalPages = Math.ceil(sortedData.length / pageSize)

  const handleSort = (key: keyof T) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }))
  }

  const handleSelectAll = () => {
    if (selectedRows.length === paginatedData.length) {
      onSelectionChange?.([])
    } else {
      onSelectionChange?.(paginatedData)
    }
  }

  const handleSelectRow = (row: T) => {
    const isSelected = selectedRows.some(selected => 
      JSON.stringify(selected) === JSON.stringify(row)
    )
    
    if (isSelected) {
      onSelectionChange?.(selectedRows.filter(selected => 
        JSON.stringify(selected) !== JSON.stringify(row)
      ))
    } else {
      onSelectionChange?.([...selectedRows, row])
    }
  }

  const getSortIcon = (key: keyof T) => {
    if (sortConfig.key !== key) return '↕️'
    return sortConfig.direction === 'asc' ? '↗️' : '↘️'
  }

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      active: 'bg-success-100 text-success-700 border-success-200',
      inactive: 'bg-error-100 text-error-700 border-error-200',
      pending: 'bg-warning-100 text-warning-700 border-warning-200',
      completed: 'bg-primary-100 text-primary-700 border-primary-200',
    }
    return statusColors[status.toLowerCase()] || 'bg-secondary-100 text-secondary-700 border-secondary-200'
  }

  if (loading) {
    return (
      <div className={cn('rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm', className)}>
        <div className="p-8 text-center">
          <div className="inline-flex items-center gap-2 text-muted-foreground">
            <div className="w-4 h-4 border-2 border-primary-600 border-t-transparent rounded-full animate-spin" />
            Loading data...
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={cn('rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-soft', className)}>
      {/* Header with search and actions */}
      <div className="p-6 border-b border-border/50">
        <div className="flex items-center justify-between gap-4">
          {searchable && (
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-xl border-2 border-border/50 bg-background/50 px-4 py-2 pl-10 text-sm backdrop-blur-sm transition-all duration-200 focus:border-primary focus:outline-none focus:ring-4 focus:ring-primary/10"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                🔍
              </div>
            </div>
          )}
          
          {actions.length > 0 && selectedRows.length > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedRows.length} selected
              </span>
              {actions.map((action, index) => (
                <Button
                  key={index}
                  variant={action.variant || 'outline'}
                  size="sm"
                  onClick={() => action.onClick(selectedRows)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border/50">
              {onSelectionChange && (
                <th className="w-12 p-4">
                  <input
                    type="checkbox"
                    checked={selectedRows.length === paginatedData.length && paginatedData.length > 0}
                    onChange={handleSelectAll}
                    className="rounded border-border/50 text-primary-600 focus:ring-primary-500"
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={String(column.key)}
                  className={cn(
                    'p-4 text-left text-sm font-semibold text-foreground',
                    column.sortable && 'cursor-pointer hover:bg-muted/30 transition-colors',
                    column.align === 'center' && 'text-center',
                    column.align === 'right' && 'text-right'
                  )}
                  style={{ width: column.width }}
                  onClick={() => column.sortable && handleSort(column.key)}
                >
                  <div className="flex items-center gap-2">
                    {column.title}
                    {column.sortable && (
                      <span className="text-xs">{getSortIcon(column.key)}</span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((row, rowIndex) => {
              const isSelected = selectedRows.some(selected => 
                JSON.stringify(selected) === JSON.stringify(row)
              )
              
              return (
                <tr
                  key={rowIndex}
                  className={cn(
                    'border-b border-border/30 transition-all duration-200 hover:bg-muted/20',
                    onRowClick && 'cursor-pointer',
                    isSelected && 'bg-primary-50/50'
                  )}
                  onClick={() => onRowClick?.(row)}
                >
                  {onSelectionChange && (
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectRow(row)}
                        onClick={(e) => e.stopPropagation()}
                        className="rounded border-border/50 text-primary-600 focus:ring-primary-500"
                      />
                    </td>
                  )}
                  {columns.map((column) => (
                    <td
                      key={String(column.key)}
                      className={cn(
                        'p-4 text-sm text-foreground',
                        column.align === 'center' && 'text-center',
                        column.align === 'right' && 'text-right'
                      )}
                    >
                      {column.render ? (
                        column.render(row[column.key], row)
                      ) : (
                        <div className="flex items-center gap-2">
                          {String(row[column.key]).toLowerCase().includes('status') ? (
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
                              getStatusColor(String(row[column.key]))
                            )}>
                              {String(row[column.key])}
                            </span>
                          ) : (
                            String(row[column.key])
                          )}
                        </div>
                      )}
                    </td>
                  ))}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="flex items-center justify-between p-6 border-t border-border/50">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length} results
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                >
                  {page}
                </Button>
              )
            })}
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}