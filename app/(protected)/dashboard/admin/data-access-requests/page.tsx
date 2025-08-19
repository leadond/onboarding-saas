/*
 * Copyright (c) 2024 [Your Company Name]. All rights reserved.
 * 
 * PROPRIETARY AND CONFIDENTIAL
 * 
 * This software contains proprietary and confidential information.
 * Unauthorized copying, distribution, or use is strictly prohibited.
 * 
 * For licensing information, contact: [your-email@domain.com]
 */

'use client';

import { useState } from 'react';
import { useUser } from '@/lib/auth/hooks';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  DataAccessRequestTable 
} from '@/components/admin/data-access-request-table';
import { 
  DataAccessRequestForm 
} from '@/components/admin/data-access-request-form';
import { 
  DataAccessRequestSearch 
} from '@/components/admin/data-access-request-search';
import { 
  DataAccessRequestStats 
} from '@/components/admin/data-access-request-stats';
import { 
  EnhancedDataAccessRequestTable 
} from '@/components/admin/enhanced-data-access-request-table';
import { Button } from '@/components/ui/button';
import { 
  RefreshCw, 
  PlusCircle, 
  BarChart3,
  List,
  Search as SearchIcon
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

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

export default function DataAccessRequestsPage() {
  const { user, isLoading } = useUser();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('requests');
  const [filters, setFilters] = useState<DataAccessRequestFilters>({
    searchTerm: '',
    status: 'all',
    tableName: 'all',
    dateRange: {
      from: null,
      to: null,
    },
    accessType: 'all',
  });
  const [refreshKey, setRefreshKey] = useState(0);

  const handleFiltersChange = (newFilters: DataAccessRequestFilters) => {
    setFilters(newFilters);
  };

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: 'Refreshed',
      description: 'Data access requests refreshed successfully.',
    });
  };

  const handleRequestSubmitted = () => {
    setRefreshKey(prev => prev + 1);
    setActiveTab('requests');
    toast({
      title: 'Request Submitted',
      description: 'Your data access request has been submitted for review.',
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h2 className="text-2xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You must be logged in to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Data Access Requests</h1>
          <p className="text-muted-foreground">
            Manage and track data access requests for your organization
          </p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleRefresh} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="requests" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            Requests
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="create" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            New Request
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <SearchIcon className="h-4 w-4" />
            Search
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Data Access Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <DataAccessRequestSearch onFiltersChange={handleFiltersChange} />
              <div className="mt-6">
                <EnhancedDataAccessRequestTable
                  userId={user.id}
                  isAdmin={true}
                  key={refreshKey}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics & Statistics</CardTitle>
            </CardHeader>
            <CardContent>
              <DataAccessRequestStats userId={user.id} isAdmin={true} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="create" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Create New Request</CardTitle>
            </CardHeader>
            <CardContent>
              <DataAccessRequestForm 
                userId={user.id} 
                onSuccess={handleRequestSubmitted}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="search" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Search Requests</CardTitle>
            </CardHeader>
            <CardContent>
              <DataAccessRequestSearch onFiltersChange={handleFiltersChange} />
              <div className="mt-6">
                <DataAccessRequestTable
                  userId={user.id}
                  isAdmin={true}
                  key={refreshKey}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}