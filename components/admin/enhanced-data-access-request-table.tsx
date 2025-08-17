'use client';

import { useState, useEffect } from 'react';
import { 
  DataAccessRequest, 
  DataAccessRequestWithUser,
  DataAccessRequestSummary,
  DataAccessRequestStatistics
} from '@/lib/types/data-access-request';
import { 
  getDataAccessRequests, 
  getPendingDataAccessRequestsForApproval,
  getDataAccessRequestSummary,
  getDataAccessRequestStatistics,
  approveDataAccessRequest,
  rejectDataAccessRequest,
  getDataAccessRequestsForUser
} from '@/lib/services/data-access-request-service';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { cn } from '@/lib/utils/cn';
import { 
  Download, 
  Filter, 
  Search, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  Eye,
  User,
  Database,
  FileText,
  Calendar,
  TrendingUp
} from 'lucide-react';

interface EnhancedDataAccessRequestTableProps {
  userId: string;
  isAdmin: boolean;
  showAnalytics?: boolean;
}

export function EnhancedDataAccessRequestTable({ 
  userId, 
  isAdmin, 
  showAnalytics = true 
}: EnhancedDataAccessRequestTableProps) {
  const [requests, setRequests] = useState<DataAccessRequest[] | DataAccessRequestWithUser[]>([]);
  const [summary, setSummary] = useState<DataAccessRequestSummary | null>(null);
  const [statistics, setStatistics] = useState<DataAccessRequestStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedRequest, setSelectedRequest] = useState<DataAccessRequest | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'table' | 'list'>('table');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch summary
      const summaryData = await getDataAccessRequestSummary();
      setSummary(summaryData);
      
      // Fetch statistics
      const statsData = await getDataAccessRequestStatistics();
      setStatistics(statsData);
      
      // Fetch requests based on user role
      let requestData;
      if (isAdmin) {
        requestData = await getPendingDataAccessRequestsForApproval();
      } else {
        requestData = await getDataAccessRequestsForUser(userId);
      }
      
      setRequests(requestData);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Simple error handling for now
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    try {
      await approveDataAccessRequest(requestId, userId);
      fetchData();
    } catch (error) {
      console.error('Error approving request:', error);
      // Simple error handling for now
    }
  };

  const handleReject = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      // Consider showing an error message to the user
      return;
    }
    try {
      await rejectDataAccessRequest(requestId, userId, rejectionReason);
      setIsRejectDialogOpen(false);
      setRejectionReason('');
      setSelectedRequest(null);
      fetchData();
    } catch (error) {
      console.error('Error rejecting request:', error);
      // Consider adding user feedback for the error
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      approved: 'bg-green-100 text-green-800 border-green-200',
      rejected: 'bg-red-100 text-red-800 border-red-200',
      completed: 'bg-blue-100 text-blue-800 border-blue-200',
    };

    const labels = {
      pending: 'Pending',
      approved: 'Approved',
      rejected: 'Rejected',
      completed: 'Completed',
    };

    const icons = {
      pending: <Clock className="h-3 w-3" />,
      approved: <CheckCircle className="h-3 w-3" />,
      rejected: <XCircle className="h-3 w-3" />,
      completed: <CheckCircle className="h-3 w-3" />,
    };

    return (
      <Badge 
        variant="outline" 
        className={cn(
          'flex items-center gap-1 px-2 py-1 text-xs font-medium',
          styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800 border-gray-200'
        )}
      >
        {icons[status as keyof typeof icons]}
        {labels[status as keyof typeof labels] || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const formatDuration = (duration: string | null) => {
    if (!duration) return 'N/A';
    // Parse ISO 8601 duration (e.g., "P1DT2H30M")
    const regex = /P(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/;
    const matches = duration.match(regex);
    
    if (!matches) return duration;
    
    const days = matches[1] ? parseInt(matches[1]) : 0;
    const hours = matches[2] ? parseInt(matches[2]) : 0;
    const minutes = matches[3] ? parseInt(matches[3]) : 0;
    
    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0) parts.push(`${hours}h`);
    if (minutes > 0) parts.push(`${minutes}m`);
    
    return parts.length > 0 ? parts.join(' ') : '0m';
  };

  const filteredRequests = requests.filter(request => {
    const matchesStatus = filterStatus === 'all' || request.status === filterStatus;
    const matchesSearch = searchTerm === '' || 
      (request as DataAccessRequestWithUser).user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.table_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (request.reason && request.reason.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const getStatusChartData = () => {
    if (!statistics) return [];
    
    return [
      { name: 'Pending', value: statistics.pending_requests, color: '#f59e0b' },
      { name: 'Approved', value: statistics.approved_requests, color: '#10b981' },
      { name: 'Rejected', value: statistics.rejected_requests, color: '#ef4444' },
    ];
  };

  const getTableData = () => {
    if (!statistics) return [];
    
    return [
      { name: 'Total', value: statistics.total_requests },
      { name: 'Pending', value: statistics.pending_requests },
      { name: 'Approved', value: statistics.approved_requests },
      { name: 'Rejected', value: statistics.rejected_requests },
    ];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.total_requests}</div>
              <p className="text-xs text-muted-foreground">All requests</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Pending
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.pending_requests}</div>
              <p className="text-xs text-muted-foreground">Awaiting approval</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Approved
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.approved_requests}</div>
              <p className="text-xs text-muted-foreground">Granted access</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <XCircle className="h-4 w-4" />
                Rejected
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{summary.rejected_requests}</div>
              <p className="text-xs text-muted-foreground">Denied requests</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Analytics Charts */}
      {showAnalytics && statistics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Request Status Distribution
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getStatusChartData()}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {getStatusChartData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart className="h-5 w-5" />
                Request Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getTableData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters and Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Label htmlFor="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </Label>
          <div className="relative mt-1">
            <Input
              id="search"
              placeholder="Search by email, table, or reason..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          </div>
        </div>
        
        <div className="flex gap-2">
          <div>
            <Label htmlFor="status-filter" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Status
            </Label>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger id="status-filter" className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-end">
            <div className="flex gap-2">
              <Button
                variant={viewMode === 'table' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="flex items-center gap-1"
              >
                <Database className="h-4 w-4" />
                Table
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="flex items-center gap-1"
              >
                <Eye className="h-4 w-4" />
                List
              </Button>
            </div>
          </div>
        </div>
      </div>
        
      <Card>
        <CardHeader>
          <CardTitle>Data Access Requests</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                {isAdmin && <TableHead className="w-1/4">User</TableHead>}
                <TableHead>Table</TableHead>
                <TableHead>Access Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRequests.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={isAdmin ? 7 : 6} className="text-center py-8">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <FileText className="h-12 w-12 text-muted-foreground" />
                      <p className="text-muted-foreground">No data access requests found</p>
                      <p className="text-sm text-muted-foreground">Try adjusting your search or filter criteria</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredRequests.map((request) => (
                  <TableRow key={request.id} className="hover:bg-muted/50">
                    {isAdmin && (
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {(request as DataAccessRequestWithUser).user_email || 'Unknown'}
                        </div>
                      </TableCell>
                    )}
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        <Database className="h-4 w-4 text-muted-foreground" />
                        {request.table_name}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {request.access_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {request.reason || 'No reason provided'}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(request.status)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDate(request.created_at)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex justify-end gap-2">
                        {request.status === 'pending' ? (
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="default"
                              onClick={() => handleApprove(request.id)}
                              className="flex items-center gap-1"
                            >
                              <CheckCircle className="h-4 w-4" />
                              Approve
                            </Button>
                            <Dialog
                              open={isRejectDialogOpen && selectedRequest?.id === request.id}
                              onOpenChange={(open) => {
                                setIsRejectDialogOpen(open);
                                if (!open) {
                                  setRejectionReason('');
                                  setSelectedRequest(null);
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => {
                                    setSelectedRequest(request as DataAccessRequest);
                                    setIsRejectDialogOpen(true);
                                  }}
                                  className="flex items-center gap-1"
                                >
                                  <XCircle className="h-4 w-4" />
                                  Reject
                                </Button>
                              </DialogTrigger>
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
                                      onClick={() => handleReject(request.id)}
                                    >
                                      Reject Request
                                    </Button>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        ) : (
                          <Button variant="outline" size="sm" disabled className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}