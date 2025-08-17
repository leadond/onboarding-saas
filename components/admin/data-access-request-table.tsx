'use client';

import { useState, useEffect } from 'react';
import {
  getDataAccessRequests,
  approveDataAccessRequest,
  rejectDataAccessRequest,
  getPendingDataAccessRequestsForApproval
} from '@/lib/services/data-access-request-service';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface DataAccessRequestTableProps {
  userId: string;
  isAdmin?: boolean;
}

export function DataAccessRequestTable({ userId, isAdmin = false }: DataAccessRequestTableProps) {
  const { toast } = useToast();
  const [requests, setRequests] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [userId, isAdmin]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      let requestData;
      
      if (isAdmin) {
        // For admin, get all pending requests
        requestData = await getPendingDataAccessRequestsForApproval();
      } else {
        // For regular user, get their requests
        requestData = await getDataAccessRequests(userId);
      }
      
      setRequests(requestData);
    } catch (error) {
      console.error('Error fetching data access requests:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch data access requests.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveDataAccessRequest(requestId, userId);
      toast({
        title: 'Request Approved',
        description: 'Data access request has been approved.',
      });
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error approving request:', error);
      toast({
        title: 'Error',
        description: 'Failed to approve data access request.',
        variant: 'destructive',
      });
    }
  };

  const handleReject = async (requestId: string) => {
    try {
      await rejectDataAccessRequest(requestId, userId, rejectionReason);
      toast({
        title: 'Request Rejected',
        description: 'Data access request has been rejected.',
      });
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      fetchRequests(); // Refresh the list
    } catch (error) {
      console.error('Error rejecting request:', error);
      toast({
        title: 'Error',
        description: 'Failed to reject data access request.',
        variant: 'destructive',
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500 hover:bg-green-600"><CheckCircle className="h-3 w-3 mr-1" /> Approved</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500 hover:bg-red-600"><XCircle className="h-3 w-3 mr-1" /> Rejected</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-yellow-900"><Clock className="h-3 w-3 mr-1" /> Pending</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  if (isLoading) {
    return <div>Loading data access requests...</div>;
  }

  return (
    <div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Table Name</TableHead>
            <TableHead>Record ID</TableHead>
            <TableHead>Access Type</TableHead>
            <TableHead>Reason</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Created At</TableHead>
            {isAdmin && <TableHead>Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.length === 0 ? (
            <TableRow>
              <TableCell colSpan={isAdmin ? 7 : 6} className="text-center">
                No data access requests found.
              </TableCell>
            </TableRow>
          ) : (
            requests.map((request) => (
              <TableRow key={request.id}>
                <TableCell>{request.table_name}</TableCell>
                <TableCell>{request.record_id || 'All records'}</TableCell>
                <TableCell>{request.access_type}</TableCell>
                <TableCell className="max-w-xs truncate">{request.reason}</TableCell>
                <TableCell>{getStatusBadge(request.status)}</TableCell>
                <TableCell>{new Date(request.created_at).toLocaleDateString()}</TableCell>
                {isAdmin && (
                  <TableCell>
                    {request.status === 'pending' ? (
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => handleApprove(request.id)}
                          className="flex items-center gap-1"
                        >
                          <CheckCircle className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            setSelectedRequest(request);
                            setIsRejectDialogOpen(true);
                          }}
                          className="flex items-center gap-1"
                        >
                          <XCircle className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    ) : (
                      <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
                        <AlertCircle className="h-4 w-4" />
                        {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                      </Button>
                    )}
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
      
      <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Data Access Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="rejection-reason">Rejection Reason</Label>
              <Textarea
                id="rejection-reason"
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                className="mt-1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setIsRejectDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => selectedRequest && handleReject(selectedRequest.id)}
                disabled={!rejectionReason.trim() || !selectedRequest}
              >
                Reject Request
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}