'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { 
  Search, 
  Filter, 
  X, 
  Calendar,
  Database,
  User,
  FileText
} from 'lucide-react';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils/cn';

interface DataAccessRequestFilters {
  searchTerm: string;
  status: string;
  tableName: string;
  dateRange: {
    from: Date | null;
    to: Date | null;
  };
  accessType: string;
}

interface DataAccessRequestSearchProps {
  onFiltersChange: (filters: DataAccessRequestFilters) => void;
  initialFilters?: Partial<DataAccessRequestFilters>;
}

export function DataAccessRequestSearch({ 
  onFiltersChange, 
  initialFilters 
}: DataAccessRequestSearchProps) {
  const [filters, setFilters] = useState<DataAccessRequestFilters>({
    searchTerm: '',
    status: 'all',
    tableName: 'all',
    dateRange: {
      from: null,
      to: null,
    },
    accessType: 'all',
    ...initialFilters
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const handleSearchChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      searchTerm: value
    }));
  };

  const handleStatusChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      status: value
    }));
  };

  const handleTableChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      tableName: value
    }));
  };

  const handleAccessTypeChange = (value: string) => {
    setFilters(prev => ({
      ...prev,
      accessType: value
    }));
  };

  const handleDateChange = (dateType: 'from' | 'to', date: Date | null) => {
    setFilters(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [dateType]: date
      }
    }));
  };

  const clearFilters = () => {
    setFilters({
      searchTerm: '',
      status: 'all',
      tableName: 'all',
      dateRange: {
        from: null,
        to: null,
      },
      accessType: 'all',
    });
  };

  const hasActiveFilters = () => {
    return filters.searchTerm !== '' || 
           filters.status !== 'all' || 
           filters.tableName !== 'all' || 
           filters.accessType !== 'all' ||
           filters.dateRange.from !== null || 
           filters.dateRange.to !== null;
  };

  const tableOptions = [
    { value: 'all', label: 'All Tables' },
    { value: 'users', label: 'Users' },
    { value: 'organizations', label: 'Organizations' },
    { value: 'kits', label: 'Kits' },
    { value: 'kit_steps', label: 'Kit Steps' },
    { value: 'client_progress', label: 'Client Progress' },
    { value: 'payments', label: 'Payments' },
    { value: 'audit_logs', label: 'Audit Logs' },
    { value: 'api_keys', label: 'API Keys' },
  ];

  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'completed', label: 'Completed' },
  ];

  const accessTypeOptions = [
    { value: 'all', label: 'All Access Types' },
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'export', label: 'Export' },
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by user email, table name, or reason..."
            value={filters.searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Select value={filters.status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            {showAdvancedFilters ? 'Hide Filters' : 'More Filters'}
          </Button>
          
          {hasActiveFilters() && (
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>
      
      {showAdvancedFilters && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border rounded-lg bg-muted/50">
          <div>
            <Label htmlFor="table-filter">Table</Label>
            <Select value={filters.tableName} onValueChange={handleTableChange}>
              <SelectTrigger id="table-filter">
                <SelectValue placeholder="Select table" />
              </SelectTrigger>
              <SelectContent>
                {tableOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4" />
                      {option.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="access-type-filter">Access Type</Label>
            <Select value={filters.accessType} onValueChange={handleAccessTypeChange}>
              <SelectTrigger id="access-type-filter">
                <SelectValue placeholder="Access type" />
              </SelectTrigger>
              <SelectContent>
                {accessTypeOptions.map(option => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="date-from">From Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date-from"
                type="date"
                value={filters.dateRange.from ? filters.dateRange.from.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('from', e.target.value ? new Date(e.target.value) : null)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="date-to">To Date</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="date-to"
                type="date"
                value={filters.dateRange.to ? filters.dateRange.to.toISOString().split('T')[0] : ''}
                onChange={(e) => handleDateChange('to', e.target.value ? new Date(e.target.value) : null)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      )}
      
      {hasActiveFilters() && (
        <div className="flex flex-wrap gap-2">
          <span className="text-sm font-medium">Active Filters:</span>
          {filters.searchTerm && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              <Search className="h-3 w-3" />
              {filters.searchTerm}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0"
                onClick={() => handleSearchChange('')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.status !== 'all' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              Status: {filters.status}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0"
                onClick={() => handleStatusChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.tableName !== 'all' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              <Database className="h-3 w-3" />
              {tableOptions.find(o => o.value === filters.tableName)?.label}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0"
                onClick={() => handleTableChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {filters.accessType !== 'all' && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              Access: {filters.accessType}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0"
                onClick={() => handleAccessTypeChange('all')}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
          {(filters.dateRange.from || filters.dateRange.to) && (
            <div className="flex items-center gap-1 px-2 py-1 bg-primary/10 text-primary rounded-full text-xs">
              <Calendar className="h-3 w-3" />
              {filters.dateRange.from?.toLocaleDateString() || 'Start'} - {filters.dateRange.to?.toLocaleDateString() || 'End'}
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-4 w-4 p-0"
                onClick={() => {
                  handleDateChange('from', null);
                  handleDateChange('to', null);
                }}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}