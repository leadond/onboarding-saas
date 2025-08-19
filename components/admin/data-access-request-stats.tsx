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

import { useState, useEffect } from 'react';
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
  Cell,
  LineChart,
  Line,
  Legend
} from 'recharts';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  Database, 
  Clock, 
  CheckCircle, 
  XCircle,
  TrendingUp,
  Calendar,
  Users
} from 'lucide-react';
import { getDataAccessRequestStatistics } from '@/lib/services/data-access-request-service';

interface DataAccessRequestStatsProps {
  userId: string;
  isAdmin?: boolean;
}

interface DataAccessRequestStatistics {
  total_requests: number;
  pending_requests: number;
  approved_requests: number;
  rejected_requests: number;
  avg_processing_time: string | null;
}

export function DataAccessRequestStats({ userId, isAdmin = false }: DataAccessRequestStatsProps) {
  const [stats, setStats] = useState<DataAccessRequestStatistics | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');

  useEffect(() => {
    fetchStats();
  }, [userId, timeRange]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      
      // Fetch statistics
      const statsData = await getDataAccessRequestStatistics();
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusChartData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Pending', value: stats.pending_requests, color: '#f59e0b' },
      { name: 'Approved', value: stats.approved_requests, color: '#10b981' },
      { name: 'Rejected', value: stats.rejected_requests, color: '#ef4444' },
    ];
  };

  const getRequestsOverTimeData = () => {
    // Return empty array as time_series_data doesn't exist in the interface
    return [];
  };

  const getTableData = () => {
    if (!stats) return [];
    
    return [
      { name: 'Total', value: stats.total_requests },
      { name: 'Pending', value: stats.pending_requests },
      { name: 'Approved', value: stats.approved_requests },
      { name: 'Rejected', value: stats.rejected_requests },
    ];
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Database className="h-4 w-4" />
                Total Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_requests}</div>
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
              <div className="text-2xl font-bold">{stats.pending_requests}</div>
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
              <div className="text-2xl font-bold">{stats.approved_requests}</div>
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
              <div className="text-2xl font-bold">{stats.rejected_requests}</div>
              <p className="text-xs text-muted-foreground">Denied requests</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Time Range Selector */}
      <div className="flex justify-end">
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 text-sm rounded-md transition-colors ${
                timeRange === range
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Request Status Distribution
            </CardTitle>
            <CardDescription>
              Distribution of requests by status
            </CardDescription>
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

        {/* Requests Over Time Line Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Requests Over Time
            </CardTitle>
            <CardDescription>
              Request volume over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={getRequestsOverTimeData()}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="pending" 
                    stroke="#f59e0b" 
                    name="Pending" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="approved" 
                    stroke="#10b981" 
                    name="Approved" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="rejected" 
                    stroke="#ef4444" 
                    name="Rejected" 
                    strokeWidth={2}
                    dot={{ r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Request Statistics Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5" />
              Request Statistics
            </CardTitle>
            <CardDescription>
              Overview of request statistics
            </CardDescription>
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

      {/* Additional Metrics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Average Processing Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.avg_processing_time ?
                  `${Math.round(parseFloat(stats.avg_processing_time) / 60)} min` :
                  'N/A'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Average time to process requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Approval Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_requests > 0 ? 
                  `${Math.round((stats.approved_requests / stats.total_requests) * 100)}%` : 
                  '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Percentage of approved requests
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Rejection Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.total_requests > 0 ? 
                  `${Math.round((stats.rejected_requests / stats.total_requests) * 100)}%` : 
                  '0%'
                }
              </div>
              <p className="text-xs text-muted-foreground">
                Percentage of rejected requests
              </p>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}