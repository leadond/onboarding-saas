'use client'

import { useState, useEffect } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  FolderOpen,
  File,
  FileText,
  FileImage,
  FileVideo,
  FileAudio,
  FileSpreadsheet,
  FileText as FilePdf,
  FileCode,
  FileArchive,
  Upload,
  Download,
  Share,
  Copy,
  Move,
  Trash2,
  Edit,
  Eye,
  Search,
  Filter,
  Grid,
  List,
  MoreHorizontal,
  Plus,
  Settings,
  Lock,
  Unlock,
  Star,
  Clock,
  User,
  Users,
  Calendar,
  Tag,
  Link,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  HardDrive,
  Cloud,
  Shield,
  Zap,
  Target,
  TrendingUp,
  Activity,
  BarChart3,
  Folder,
  FolderPlus,
  Archive,
  History
} from 'lucide-react'

interface FileItem {
  id: string
  name: string
  type: 'file' | 'folder'
  file_type?: 'document' | 'image' | 'video' | 'audio' | 'spreadsheet' | 'pdf' | 'code' | 'archive' | 'other'
  size: number
  created_at: string
  updated_at: string
  created_by: string
  parent_folder?: string
  path: string
  permissions: {
    owner: string
    shared_with: Array<{
      user: string
      permission: 'view' | 'edit' | 'admin'
    }>
    public: boolean
  }
  metadata: {
    description?: string
    tags: string[]
    version: number
    checksum?: string
    mime_type?: string
  }
  onboarding_context?: {
    client_id: string
    client_name: string
    workflow_step: string
    required: boolean
    status: 'pending' | 'uploaded' | 'approved' | 'rejected'
  }
  storage: {
    provider: 'local' | 'aws_s3' | 'google_drive' | 'dropbox' | 'onedrive'
    location: string
    backup_status: 'backed_up' | 'pending' | 'failed'
    encryption: boolean
  }
}

interface FileVersion {
  id: string
  file_id: string
  version: number
  size: number
  created_at: string
  created_by: string
  changes: string
  download_url: string
}

interface StorageProvider {
  id: string
  name: string
  type: 'local' | 'aws_s3' | 'google_drive' | 'dropbox' | 'onedrive'
  status: 'connected' | 'disconnected' | 'error'
  capacity: number
  used: number
  files_count: number
  last_sync: string
  settings: {
    auto_backup: boolean
    encryption: boolean
    retention_days: number
  }
}

interface FileTemplate {
  id: string
  name: string
  description: string
  file_type: string
  category: string
  template_url: string
  variables: string[]
  usage_count: number
  created_by: string
  is_public: boolean
}

// Mock data
const mockFiles: FileItem[] = [
  {
    id: '1',
    name: 'Client Onboarding Documents',
    type: 'folder',
    size: 0,
    created_at: '2024-08-01T00:00:00Z',
    updated_at: '2024-08-14T15:30:00Z',
    created_by: 'admin@onboardkit.com',
    path: '/client-onboarding',
    permissions: {
      owner: 'admin@onboardkit.com',
      shared_with: [
        { user: 'team@onboardkit.com', permission: 'edit' },
        { user: 'legal@onboardkit.com', permission: 'view' }
      ],
      public: false
    },
    metadata: {
      description: 'Main folder for all client onboarding documents',
      tags: ['onboarding', 'clients', 'documents'],
      version: 1
    },
    storage: {
      provider: 'aws_s3',
      location: 's3://onboardkit-files/client-onboarding/',
      backup_status: 'backed_up',
      encryption: true
    }
  },
  {
    id: '2',
    name: 'Acme Corp - Service Agreement.pdf',
    type: 'file',
    file_type: 'pdf',
    size: 2457600, // 2.4 MB
    created_at: '2024-08-10T10:30:00Z',
    updated_at: '2024-08-12T14:20:00Z',
    created_by: 'legal@onboardkit.com',
    parent_folder: '1',
    path: '/client-onboarding/acme-corp-service-agreement.pdf',
    permissions: {
      owner: 'legal@onboardkit.com',
      shared_with: [
        { user: 'john@acmecorp.com', permission: 'view' },
        { user: 'sarah@onboardkit.com', permission: 'edit' }
      ],
      public: false
    },
    metadata: {
      description: 'Service agreement contract for Acme Corp onboarding',
      tags: ['contract', 'acme-corp', 'legal'],
      version: 3,
      checksum: 'sha256:abc123...',
      mime_type: 'application/pdf'
    },
    onboarding_context: {
      client_id: 'client_123',
      client_name: 'Acme Corp',
      workflow_step: 'Contract Signing',
      required: true,
      status: 'approved'
    },
    storage: {
      provider: 'aws_s3',
      location: 's3://onboardkit-files/client-onboarding/acme-corp-service-agreement.pdf',
      backup_status: 'backed_up',
      encryption: true
    }
  },
  {
    id: '3',
    name: 'Brand Guidelines Template.docx',
    type: 'file',
    file_type: 'document',
    size: 1048576, // 1 MB
    created_at: '2024-08-05T09:15:00Z',
    updated_at: '2024-08-05T09:15:00Z',
    created_by: 'design@onboardkit.com',
    path: '/templates/brand-guidelines-template.docx',
    permissions: {
      owner: 'design@onboardkit.com',
      shared_with: [],
      public: true
    },
    metadata: {
      description: 'Template for client brand guidelines documentation',
      tags: ['template', 'branding', 'guidelines'],
      version: 1,
      mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    },
    storage: {
      provider: 'google_drive',
      location: 'drive://templates/brand-guidelines-template.docx',
      backup_status: 'backed_up',
      encryption: false
    }
  },
  {
    id: '4',
    name: 'Client Onboarding Video.mp4',
    type: 'file',
    file_type: 'video',
    size: 52428800, // 50 MB
    created_at: '2024-08-08T16:45:00Z',
    updated_at: '2024-08-08T16:45:00Z',
    created_by: 'marketing@onboardkit.com',
    path: '/media/client-onboarding-video.mp4',
    permissions: {
      owner: 'marketing@onboardkit.com',
      shared_with: [
        { user: 'team@onboardkit.com', permission: 'view' }
      ],
      public: true
    },
    metadata: {
      description: 'Welcome video for new clients explaining the onboarding process',
      tags: ['video', 'onboarding', 'welcome'],
      version: 1,
      mime_type: 'video/mp4'
    },
    storage: {
      provider: 'aws_s3',
      location: 's3://onboardkit-media/client-onboarding-video.mp4',
      backup_status: 'backed_up',
      encryption: true
    }
  },
  {
    id: '5',
    name: 'Client Data Spreadsheet.xlsx',
    type: 'file',
    file_type: 'spreadsheet',
    size: 524288, // 512 KB
    created_at: '2024-08-12T11:20:00Z',
    updated_at: '2024-08-14T13:45:00Z',
    created_by: 'data@onboardkit.com',
    path: '/data/client-data-spreadsheet.xlsx',
    permissions: {
      owner: 'data@onboardkit.com',
      shared_with: [
        { user: 'admin@onboardkit.com', permission: 'edit' }
      ],
      public: false
    },
    metadata: {
      description: 'Client information and onboarding progress tracking',
      tags: ['data', 'clients', 'tracking'],
      version: 5,
      mime_type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    onboarding_context: {
      client_id: 'multiple',
      client_name: 'All Clients',
      workflow_step: 'Data Collection',
      required: false,
      status: 'uploaded'
    },
    storage: {
      provider: 'onedrive',
      location: 'onedrive://data/client-data-spreadsheet.xlsx',
      backup_status: 'pending',
      encryption: true
    }
  }
]

const mockVersions: FileVersion[] = [
  {
    id: 'v1',
    file_id: '2',
    version: 3,
    size: 2457600,
    created_at: '2024-08-12T14:20:00Z',
    created_by: 'legal@onboardkit.com',
    changes: 'Updated payment terms and added termination clause',
    download_url: '/api/files/2/versions/3/download'
  },
  {
    id: 'v2',
    file_id: '2',
    version: 2,
    size: 2398720,
    created_at: '2024-08-11T09:30:00Z',
    created_by: 'legal@onboardkit.com',
    changes: 'Fixed typos and updated contact information',
    download_url: '/api/files/2/versions/2/download'
  },
  {
    id: 'v3',
    file_id: '2',
    version: 1,
    size: 2301952,
    created_at: '2024-08-10T10:30:00Z',
    created_by: 'legal@onboardkit.com',
    changes: 'Initial version of service agreement',
    download_url: '/api/files/2/versions/1/download'
  }
]

const mockStorageProviders: StorageProvider[] = [
  {
    id: '1',
    name: 'Amazon S3',
    type: 'aws_s3',
    status: 'connected',
    capacity: 1099511627776, // 1 TB
    used: 157286400000, // ~146 GB
    files_count: 1247,
    last_sync: '2024-08-14T15:30:00Z',
    settings: {
      auto_backup: true,
      encryption: true,
      retention_days: 365
    }
  },
  {
    id: '2',
    name: 'Google Drive',
    type: 'google_drive',
    status: 'connected',
    capacity: 107374182400, // 100 GB
    used: 32212254720, // ~30 GB
    files_count: 456,
    last_sync: '2024-08-14T15:25:00Z',
    settings: {
      auto_backup: true,
      encryption: false,
      retention_days: 180
    }
  },
  {
    id: '3',
    name: 'Microsoft OneDrive',
    type: 'onedrive',
    status: 'connected',
    capacity: 53687091200, // 50 GB
    used: 10737418240, // ~10 GB
    files_count: 189,
    last_sync: '2024-08-14T14:50:00Z',
    settings: {
      auto_backup: false,
      encryption: true,
      retention_days: 90
    }
  }
]

const mockTemplates: FileTemplate[] = [
  {
    id: '1',
    name: 'Service Agreement Template',
    description: 'Standard service agreement template for client onboarding',
    file_type: 'pdf',
    category: 'Legal',
    template_url: '/templates/service-agreement.pdf',
    variables: ['CLIENT_NAME', 'SERVICE_TYPE', 'START_DATE', 'PAYMENT_TERMS'],
    usage_count: 89,
    created_by: 'Legal Team',
    is_public: false
  },
  {
    id: '2',
    name: 'Welcome Packet Template',
    description: 'Welcome packet with company information and next steps',
    file_type: 'document',
    category: 'Onboarding',
    template_url: '/templates/welcome-packet.docx',
    variables: ['CLIENT_NAME', 'ACCOUNT_MANAGER', 'TIMELINE', 'CONTACT_INFO'],
    usage_count: 156,
    created_by: 'Marketing Team',
    is_public: true
  },
  {
    id: '3',
    name: 'Data Collection Form',
    description: 'Standardized form for collecting client information',
    file_type: 'spreadsheet',
    category: 'Data Collection',
    template_url: '/templates/data-collection-form.xlsx',
    variables: ['FORM_TITLE', 'REQUIRED_FIELDS', 'SUBMISSION_DATE'],
    usage_count: 234,
    created_by: 'Operations Team',
    is_public: true
  }
]

export function FileManagementSystem() {
  const [selectedFiles, setSelectedFiles] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [showCreateFolderDialog, setShowCreateFolderDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedFileType, setSelectedFileType] = useState('all')

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') return FolderOpen
    
    switch (file.file_type) {
      case 'document': return FileText
      case 'image': return FileImage
      case 'video': return FileVideo
      case 'audio': return FileAudio
      case 'spreadsheet': return FileSpreadsheet
      case 'pdf': return FilePdf
      case 'code': return FileCode
      case 'archive': return FileArchive
      default: return File
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'backed_up':
      case 'approved':
      case 'uploaded':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'disconnected':
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'error':
      case 'failed':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'backed_up':
      case 'approved':
      case 'uploaded':
        return CheckCircle
      case 'pending':
        return Clock
      case 'disconnected':
      case 'rejected':
      case 'error':
      case 'failed':
        return XCircle
      default:
        return AlertTriangle
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredFiles = mockFiles.filter(file => {
    const matchesSearch = file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.metadata.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesType = selectedFileType === 'all' || file.file_type === selectedFileType || 
                       (selectedFileType === 'folder' && file.type === 'folder')
    return matchesSearch && matchesType
  })

  const totalFiles = mockFiles.filter(f => f.type === 'file').length
  const totalFolders = mockFiles.filter(f => f.type === 'folder').length
  const totalSize = mockFiles.reduce((sum, file) => sum + file.size, 0)
  const connectedProviders = mockStorageProviders.filter(p => p.status === 'connected').length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <FolderOpen className="h-8 w-8 mr-3 text-blue-600" />
            File Management System
          </h1>
          <p className="text-gray-600">
            Enhanced file upload, organization, and management capabilities for onboarding workflows.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Storage Settings
          </Button>
          <Dialog open={showCreateFolderDialog} onOpenChange={setShowCreateFolderDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FolderPlus className="h-4 w-4 mr-2" />
                New Folder
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Folder</DialogTitle>
                <DialogDescription>
                  Create a new folder to organize your files
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Folder Name</Label>
                  <Input placeholder="Enter folder name" />
                </div>
                <div className="space-y-2">
                  <Label>Parent Folder</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select parent folder" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="root">Root Directory</SelectItem>
                      <SelectItem value="1">Client Onboarding Documents</SelectItem>
                      <SelectItem value="templates">Templates</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Description (optional)</Label>
                  <Textarea placeholder="Folder description" rows={2} />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="encryption" />
                  <Label htmlFor="encryption">Enable encryption</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateFolderDialog(false)}>
                  Cancel
                </Button>
                <Button>Create Folder</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Upload Files</DialogTitle>
                <DialogDescription>
                  Upload files to your onboarding workspace
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                  <Upload className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-lg font-medium text-gray-900 mb-2">Drop files here or click to browse</p>
                  <p className="text-sm text-gray-500">Supports all file types up to 100MB each</p>
                  <Button className="mt-4">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Upload to Folder</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select folder" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="root">Root Directory</SelectItem>
                        <SelectItem value="1">Client Onboarding Documents</SelectItem>
                        <SelectItem value="templates">Templates</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Storage Provider</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select provider" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="aws_s3">Amazon S3</SelectItem>
                        <SelectItem value="google_drive">Google Drive</SelectItem>
                        <SelectItem value="onedrive">Microsoft OneDrive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags (optional)</Label>
                  <Input placeholder="Enter tags separated by commas" />
                </div>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch id="encrypt" />
                    <Label htmlFor="encrypt">Encrypt files</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch id="backup" defaultChecked />
                    <Label htmlFor="backup">Auto-backup</Label>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button>Start Upload</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* File System Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <File className="h-4 w-4 mr-2" />
              Total Files
            </CardTitle>
            <div className="text-2xl font-bold">{totalFiles}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {totalFolders} folders
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <HardDrive className="h-4 w-4 mr-2" />
              Storage Used
            </CardTitle>
            <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all providers
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Cloud className="h-4 w-4 mr-2" />
              Connected Providers
            </CardTitle>
            <div className="text-2xl font-bold">{connectedProviders}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Storage integrations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Shield className="h-4 w-4 mr-2" />
              Encrypted Files
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockFiles.filter(f => f.storage.encryption).length}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Security enabled
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="files" className="space-y-6">
        <TabsList>
          <TabsTrigger value="files">Files & Folders</TabsTrigger>
          <TabsTrigger value="storage">Storage Providers</TabsTrigger>
          <TabsTrigger value="templates">File Templates</TabsTrigger>
          <TabsTrigger value="versions">Version History</TabsTrigger>
        </TabsList>

        <TabsContent value="files" className="space-y-6">
          {/* File Browser */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>File Browser</CardTitle>
                  <CardDescription>Browse and manage your onboarding files and folders</CardDescription>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-2">
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Search and Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search files and folders..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedFileType} onValueChange={setSelectedFileType}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="folder">Folders</SelectItem>
                      <SelectItem value="document">Documents</SelectItem>
                      <SelectItem value="image">Images</SelectItem>
                      <SelectItem value="video">Videos</SelectItem>
                      <SelectItem value="pdf">PDFs</SelectItem>
                      <SelectItem value="spreadsheet">Spreadsheets</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* File List */}
                <div className="space-y-2">
                  {filteredFiles.map((file) => {
                    const FileIcon = getFileIcon(file)
                    
                    return (
                      <div key={file.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={selectedFiles.includes(file.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFiles([...selectedFiles, file.id])
                                } else {
                                  setSelectedFiles(selectedFiles.filter(id => id !== file.id))
                                }
                              }}
                            />
                            <FileIcon className="h-5 w-5 text-blue-600" />
                          </div>
                          <div>
                            <div className="font-medium flex items-center space-x-2">
                              <span>{file.name}</span>
                              {file.permissions.public && (
                                <Badge variant="outline" className="text-xs">Public</Badge>
                              )}
                              {file.storage.encryption && (
                                <Lock className="h-3 w-3 text-gray-400" />
                              )}
                              {file.onboarding_context && (
                                <Badge className={getStatusColor(file.onboarding_context.status)}>
                                  {file.onboarding_context.status}
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center space-x-4">
                              <span>{file.type === 'file' ? formatFileSize(file.size) : 'Folder'}</span>
                              <span>Modified {formatDate(file.updated_at)}</span>
                              <span>by {file.created_by}</span>
                              {file.metadata.tags.length > 0 && (
                                <div className="flex items-center space-x-1">
                                  <Tag className="h-3 w-3" />
                                  <span>{file.metadata.tags.slice(0, 2).join(', ')}</span>
                                  {file.metadata.tags.length > 2 && <span>+{file.metadata.tags.length - 2}</span>}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.onboarding_context && (
                            <div className="text-xs text-gray-500 text-right">
                              <div>{file.onboarding_context.client_name}</div>
                              <div>{file.onboarding_context.workflow_step}</div>
                            </div>
                          )}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem>
                                <Eye className="h-4 w-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Download className="h-4 w-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Share className="h-4 w-4 mr-2" />
                                Share
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Rename
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Move className="h-4 w-4 mr-2" />
                                Move
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="h-4 w-4 mr-2" />
                                Copy
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Bulk Actions */}
                {selectedFiles.length > 0 && (
                  <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                    <span className="text-sm font-medium">
                      {selectedFiles.length} file{selectedFiles.length > 1 ? 's' : ''} selected
                    </span>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      <Button size="sm" variant="outline">
                        <Share className="h-4 w-4 mr-2" />
                        Share
                      </Button>
                      <Button size="sm" variant="outline">
                        <Move className="h-4 w-4 mr-2" />
                        Move
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          {/* Storage Providers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockStorageProviders.map((provider) => {
              const StatusIcon = getStatusIcon(provider.status)
              const usagePercentage = (provider.used / provider.capacity) * 100
              
              return (
                <Card key={provider.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Cloud className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{provider.name}</span>
                            <Badge className={getStatusColor(provider.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {provider.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{provider.files_count.toLocaleString()} files</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {usagePercentage.toFixed(1)}%
                        </div>
                        <div className="text-xs text-gray-500">used</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Storage Usage</span>
                          <span className="font-medium">
                            {formatFileSize(provider.used)} / {formatFileSize(provider.capacity)}
                          </span>
                        </div>
                        <Progress value={usagePercentage} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Last Sync</div>
                          <div className="font-medium">{formatDateTime(provider.last_sync)}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Files Count</div>
                          <div className="font-medium">{provider.files_count.toLocaleString()}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Settings</div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Auto-backup</span>
                            <Switch checked={provider.settings.auto_backup} />
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Encryption</span>
                            <Switch checked={provider.settings.encryption} />
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <span>Retention</span>
                            <span className="font-medium">{provider.settings.retention_days} days</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync Now
                        </Button>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4 mr-2" />
                          Configure
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="templates" className="space-y-6">
          {/* File Templates */}
          <div className="space-y-6">
            {mockTemplates.map((template) => (
              <Card key={template.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <FileText className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          <span>{template.name}</span>
                          <Badge variant="outline">{template.file_type.toUpperCase()}</Badge>
                          {template.is_public && (
                            <Badge className="bg-green-100 text-green-800">Public</Badge>
                          )}
                        </CardTitle>
                        <CardDescription>{template.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-purple-600">
                        {template.usage_count}
                      </div>
                      <div className="text-xs text-gray-500">uses</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Category</div>
                        <div className="font-medium">{template.category}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Created By</div>
                        <div className="font-medium">{template.created_by}</div>
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Template Variables</div>
                      <div className="flex flex-wrap gap-1">
                        {template.variables.map((variable, index) => (
                          <Badge key={index} variant="outline" className="text-xs font-mono">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Use Template
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        Preview
                      </Button>
                      <Button size="sm" variant="outline">
                        <Copy className="h-4 w-4 mr-2" />
                        Duplicate
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="versions" className="space-y-6">
          {/* Version History */}
          <Card>
            <CardHeader>
              <CardTitle>Version History</CardTitle>
              <CardDescription>Track changes and manage file versions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FilePdf className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="font-medium">Acme Corp - Service Agreement.pdf</div>
                    <div className="text-sm text-gray-500">3 versions available</div>
                  </div>
                </div>

                <div className="space-y-3">
                  {mockVersions.map((version) => (
                    <div key={version.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-1 bg-gray-100 rounded">
                          <History className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">Version {version.version}</div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(version.created_at)} • {version.created_by}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">{version.changes}</div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-sm text-gray-500">{formatFileSize(version.size)}</div>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button size="sm" variant="outline">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Restore
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}