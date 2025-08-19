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

import * as React from 'react';
import { useState } from 'react';
import { 
  createDataAccessRequest 
} from '@/lib/services/data-access-request-service';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Database, 
  FileText, 
  Key, 
  Users, 
  Settings, 
  Shield,
  AlertCircle
} from 'lucide-react';
import { Label } from '@/components/ui/label';

interface DataAccessRequestFormProps {
  userId: string;
  onSuccess?: () => void;
}

export function DataAccessRequestForm({ userId, onSuccess }: DataAccessRequestFormProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [tableName, setTableName] = useState('');
  const [recordId, setRecordId] = useState('');
  const [accessType, setAccessType] = useState('');
  const [reason, setReason] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Basic validation
    if (!tableName) {
      toast({
        title: 'Error',
        description: 'Please select a table name.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!accessType) {
      toast({
        title: 'Error',
        description: 'Please select an access type.',
        variant: 'destructive',
      });
      return;
    }
    
    if (!reason || reason.length < 10) {
      toast({
        title: 'Error',
        description: 'Reason must be at least 10 characters.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      await createDataAccessRequest({
        table_name: tableName,
        record_id: recordId || undefined,
        access_type: accessType,
        reason: reason,
      });
      
      toast({
        title: 'Request Submitted',
        description: 'Your data access request has been submitted successfully.',
      });
      
      // Reset form
      setTableName('');
      setRecordId('');
      setAccessType('');
      setReason('');
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Error submitting data access request:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit your data access request. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const tableOptions = [
    { value: 'users', label: 'Users', icon: Users },
    { value: 'organizations', label: 'Organizations', icon: Settings },
    { value: 'kits', label: 'Kits', icon: FileText },
    { value: 'kit_steps', label: 'Kit Steps', icon: FileText },
    { value: 'client_progress', label: 'Client Progress', icon: Users },
    { value: 'payments', label: 'Payments', icon: Database },
    { value: 'audit_logs', label: 'Audit Logs', icon: Shield },
    { value: 'api_keys', label: 'API Keys', icon: Key },
  ];

  const accessTypeOptions = [
    { value: 'read', label: 'Read' },
    { value: 'update', label: 'Update' },
    { value: 'delete', label: 'Delete' },
    { value: 'export', label: 'Export' },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Request Data Access
        </CardTitle>
        <CardDescription>
          Submit a request to access specific data in the system. Your request will be reviewed by an administrator.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="table_name">Table Name</Label>
              <Select value={tableName} onValueChange={setTableName}>
                <SelectTrigger id="table_name">
                  <SelectValue placeholder="Select a table" />
                </SelectTrigger>
                <SelectContent>
                  {tableOptions.map((option) => {
                    const Icon = option.icon;
                    return (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Select the database table you need access to.
              </p>
            </div>
            
            <div>
              <Label htmlFor="access_type">Access Type</Label>
              <Select value={accessType} onValueChange={setAccessType}>
                <SelectTrigger id="access_type">
                  <SelectValue placeholder="Select access type" />
                </SelectTrigger>
                <SelectContent>
                  {accessTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-sm text-muted-foreground mt-1">
                Specify the type of access you need.
              </p>
            </div>
          </div>
          
          <div>
            <Label htmlFor="record_id">Record ID (Optional)</Label>
            <Input 
              id="record_id"
              placeholder="Enter specific record ID" 
              value={recordId}
              onChange={(e) => setRecordId(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              If you need access to a specific record, enter its ID.
            </p>
          </div>
          
          <div>
            <Label htmlFor="reason">Reason for Access</Label>
            <Textarea
              id="reason"
              placeholder="Explain why you need access to this data..."
              className="min-h-[120px]"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <p className="text-sm text-muted-foreground mt-1">
              Please provide a detailed explanation of why you need access to this data.
            </p>
          </div>
          
          <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
            <AlertCircle className="h-5 w-5 text-yellow-600" />
            <p className="text-sm text-yellow-700">
              All requests are subject to review and approval by administrators. 
              Access will be granted only for legitimate business purposes.
            </p>
          </div>
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}