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
  Store,
  Package,
  Download,
  Upload,
  Star,
  Heart,
  Eye,
  Share,
  Search,
  Filter,
  Grid,
  List,
  Plus,
  Edit,
  Trash2,
  Copy,
  Settings,
  Users,
  User,
  Calendar,
  Tag,
  TrendingUp,
  Activity,
  BarChart3,
  Target,
  Zap,
  Crown,
  Award,
  Building,
  Globe,
  Mail,
  Phone,
  ExternalLink,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  RefreshCw,
  DollarSign,
  CreditCard,
  ShoppingCart,
  Bookmark,
  BookmarkCheck,
  ThumbsUp,
  ThumbsDown,
  MessageSquare,
  Flag,
  Shield,
  Verified,
  Sparkles,
  Palette,
  Layout,
  FileText,
  Image,
  Video,
  Code,
  Layers,
  Workflow
} from 'lucide-react'

interface MarketplaceTemplate {
  id: string
  name: string
  description: string
  category: 'onboarding' | 'forms' | 'emails' | 'workflows' | 'branding' | 'documents' | 'analytics'
  subcategory: string
  type: 'free' | 'premium' | 'enterprise'
  price: number
  currency: 'USD'
  author: {
    id: string
    name: string
    avatar: string
    verified: boolean
    company?: string
    rating: number
    templates_count: number
  }
  preview_images: string[]
  demo_url?: string
  features: string[]
  compatibility: string[]
  industries: string[]
  tags: string[]
  stats: {
    downloads: number
    rating: number
    reviews_count: number
    favorites: number
    views: number
  }
  created_at: string
  updated_at: string
  version: string
  changelog: string
  requirements: string[]
  support_level: 'community' | 'standard' | 'premium'
  license: 'mit' | 'commercial' | 'custom'
  is_featured: boolean
  is_trending: boolean
  is_new: boolean
}

interface TemplateReview {
  id: string
  template_id: string
  user: {
    name: string
    avatar: string
    company?: string
  }
  rating: number
  title: string
  content: string
  pros: string[]
  cons: string[]
  created_at: string
  helpful_votes: number
  verified_purchase: boolean
}

interface TemplateCollection {
  id: string
  name: string
  description: string
  templates: string[]
  author: {
    name: string
    company: string
  }
  is_public: boolean
  downloads: number
  rating: number
  created_at: string
}

interface UserTemplate {
  id: string
  name: string
  description: string
  category: string
  status: 'draft' | 'published' | 'under_review' | 'rejected'
  downloads: number
  revenue: number
  rating: number
  created_at: string
  last_updated: string
}

// Mock data
const mockTemplates: MarketplaceTemplate[] = [
  {
    id: '1',
    name: 'Professional Services Onboarding Kit',
    description: 'Complete onboarding workflow template designed specifically for professional services firms. Includes client intake forms, document collection, and milestone tracking.',
    category: 'onboarding',
    subcategory: 'Professional Services',
    type: 'premium',
    price: 49.99,
    currency: 'USD',
    author: {
      id: 'author1',
      name: 'Sarah Johnson',
      avatar: '/avatars/sarah.jpg',
      verified: true,
      company: 'OnboardPro Solutions',
      rating: 4.9,
      templates_count: 23
    },
    preview_images: ['/previews/prof-services-1.jpg', '/previews/prof-services-2.jpg'],
    demo_url: 'https://demo.onboardhero.com/prof-services',
    features: [
      'Multi-step client intake process',
      'Automated document collection',
      'Progress tracking dashboard',
      'Email notification templates',
      'Customizable branding',
      'Integration with DocuSign'
    ],
    compatibility: ['Onboard Hero Pro', 'Onboard Hero Enterprise'],
    industries: ['Legal', 'Consulting', 'Accounting', 'Architecture'],
    tags: ['professional', 'intake', 'documents', 'tracking', 'automation'],
    stats: {
      downloads: 1247,
      rating: 4.8,
      reviews_count: 89,
      favorites: 234,
      views: 5678
    },
    created_at: '2024-06-15T00:00:00Z',
    updated_at: '2024-08-10T00:00:00Z',
    version: '2.1.0',
    changelog: 'Added new document templates and improved mobile responsiveness',
    requirements: ['Onboard Hero Pro or higher', 'DocuSign integration'],
    support_level: 'premium',
    license: 'commercial',
    is_featured: true,
    is_trending: true,
    is_new: false
  },
  {
    id: '2',
    name: 'SaaS Customer Onboarding Flow',
    description: 'Modern onboarding template for SaaS companies with user activation flows, feature tours, and success metrics tracking.',
    category: 'onboarding',
    subcategory: 'SaaS & Technology',
    type: 'free',
    price: 0,
    currency: 'USD',
    author: {
      id: 'author2',
      name: 'Mike Chen',
      avatar: '/avatars/mike.jpg',
      verified: true,
      company: 'TechFlow Templates',
      rating: 4.7,
      templates_count: 15
    },
    preview_images: ['/previews/saas-onboarding-1.jpg', '/previews/saas-onboarding-2.jpg'],
    demo_url: 'https://demo.onboardhero.com/saas-flow',
    features: [
      'User activation checklist',
      'Interactive feature tours',
      'Progress gamification',
      'Success metrics dashboard',
      'A/B testing support',
      'Mobile-first design'
    ],
    compatibility: ['Onboard Hero Starter', 'Onboard Hero Pro', 'Onboard Hero Enterprise'],
    industries: ['SaaS', 'Technology', 'Software'],
    tags: ['saas', 'activation', 'gamification', 'mobile', 'metrics'],
    stats: {
      downloads: 3456,
      rating: 4.6,
      reviews_count: 156,
      favorites: 567,
      views: 12345
    },
    created_at: '2024-07-01T00:00:00Z',
    updated_at: '2024-08-05T00:00:00Z',
    version: '1.3.2',
    changelog: 'Fixed mobile layout issues and added new gamification elements',
    requirements: ['Onboard Hero Starter or higher'],
    support_level: 'community',
    license: 'mit',
    is_featured: false,
    is_trending: true,
    is_new: false
  },
  {
    id: '3',
    name: 'Healthcare Patient Onboarding',
    description: 'HIPAA-compliant onboarding template for healthcare providers with secure document handling and patient intake workflows.',
    category: 'onboarding',
    subcategory: 'Healthcare',
    type: 'enterprise',
    price: 199.99,
    currency: 'USD',
    author: {
      id: 'author3',
      name: 'Dr. Emily Rodriguez',
      avatar: '/avatars/emily.jpg',
      verified: true,
      company: 'HealthTech Solutions',
      rating: 4.9,
      templates_count: 8
    },
    preview_images: ['/previews/healthcare-1.jpg', '/previews/healthcare-2.jpg'],
    features: [
      'HIPAA-compliant workflows',
      'Secure document storage',
      'Patient intake forms',
      'Insurance verification',
      'Appointment scheduling',
      'Medical history collection'
    ],
    compatibility: ['Onboard Hero Enterprise'],
    industries: ['Healthcare', 'Medical', 'Dental', 'Mental Health'],
    tags: ['healthcare', 'hipaa', 'secure', 'patient', 'medical'],
    stats: {
      downloads: 234,
      rating: 4.9,
      reviews_count: 23,
      favorites: 89,
      views: 1234
    },
    created_at: '2024-05-20T00:00:00Z',
    updated_at: '2024-07-30T00:00:00Z',
    version: '1.2.0',
    changelog: 'Enhanced security features and added telehealth integration',
    requirements: ['Onboard Hero Enterprise', 'HIPAA compliance package'],
    support_level: 'premium',
    license: 'commercial',
    is_featured: true,
    is_trending: false,
    is_new: false
  },
  {
    id: '4',
    name: 'E-commerce Vendor Onboarding',
    description: 'Streamlined onboarding process for e-commerce platforms to onboard new vendors and sellers.',
    category: 'onboarding',
    subcategory: 'E-commerce',
    type: 'premium',
    price: 79.99,
    currency: 'USD',
    author: {
      id: 'author4',
      name: 'Alex Thompson',
      avatar: '/avatars/alex.jpg',
      verified: false,
      company: 'Commerce Templates',
      rating: 4.5,
      templates_count: 12
    },
    preview_images: ['/previews/ecommerce-1.jpg'],
    features: [
      'Vendor application forms',
      'Product catalog setup',
      'Payment processing setup',
      'Shipping configuration',
      'Tax documentation',
      'Performance tracking'
    ],
    compatibility: ['Onboard Hero Pro', 'Onboard Hero Enterprise'],
    industries: ['E-commerce', 'Retail', 'Marketplace'],
    tags: ['ecommerce', 'vendor', 'marketplace', 'catalog', 'payments'],
    stats: {
      downloads: 567,
      rating: 4.4,
      reviews_count: 34,
      favorites: 123,
      views: 2345
    },
    created_at: '2024-07-15T00:00:00Z',
    updated_at: '2024-08-12T00:00:00Z',
    version: '1.1.0',
    changelog: 'Added multi-currency support and improved vendor dashboard',
    requirements: ['Onboard Hero Pro or higher', 'Payment gateway integration'],
    support_level: 'standard',
    license: 'commercial',
    is_featured: false,
    is_trending: false,
    is_new: true
  },
  {
    id: '5',
    name: 'Modern Email Templates Pack',
    description: 'Beautiful, responsive email templates for onboarding communications with multiple design variations.',
    category: 'emails',
    subcategory: 'Templates',
    type: 'free',
    price: 0,
    currency: 'USD',
    author: {
      id: 'author5',
      name: 'Design Studio',
      avatar: '/avatars/design-studio.jpg',
      verified: true,
      company: 'Creative Templates Co.',
      rating: 4.8,
      templates_count: 45
    },
    preview_images: ['/previews/email-templates-1.jpg', '/previews/email-templates-2.jpg'],
    features: [
      '20+ email templates',
      'Responsive design',
      'Dark mode support',
      'Multiple color schemes',
      'Custom branding options',
      'HTML and plain text versions'
    ],
    compatibility: ['All Onboard Hero plans'],
    industries: ['All'],
    tags: ['email', 'templates', 'responsive', 'design', 'branding'],
    stats: {
      downloads: 8923,
      rating: 4.7,
      reviews_count: 234,
      favorites: 1234,
      views: 23456
    },
    created_at: '2024-06-01T00:00:00Z',
    updated_at: '2024-08-01T00:00:00Z',
    version: '3.0.0',
    changelog: 'Added 5 new templates and improved accessibility',
    requirements: ['Any Onboard Hero plan'],
    support_level: 'community',
    license: 'mit',
    is_featured: false,
    is_trending: true,
    is_new: false
  }
]

const mockReviews: TemplateReview[] = [
  {
    id: '1',
    template_id: '1',
    user: {
      name: 'John Smith',
      avatar: '/avatars/john.jpg',
      company: 'Smith & Associates Law'
    },
    rating: 5,
    title: 'Excellent template for law firms',
    content: 'This template saved us weeks of development time. The client intake process is smooth and professional. Our clients love the progress tracking feature.',
    pros: ['Easy to customize', 'Great client experience', 'Comprehensive workflow'],
    cons: ['Could use more email templates'],
    created_at: '2024-08-10T00:00:00Z',
    helpful_votes: 23,
    verified_purchase: true
  },
  {
    id: '2',
    template_id: '1',
    user: {
      name: 'Maria Garcia',
      avatar: '/avatars/maria.jpg',
      company: 'Garcia Consulting'
    },
    rating: 4,
    title: 'Good value for money',
    content: 'Solid template with good documentation. Setup was straightforward and the support team was helpful when I had questions.',
    pros: ['Good documentation', 'Responsive support', 'Professional design'],
    cons: ['Limited customization options', 'Could be more mobile-friendly'],
    created_at: '2024-08-05T00:00:00Z',
    helpful_votes: 15,
    verified_purchase: true
  }
]

const mockCollections: TemplateCollection[] = [
  {
    id: '1',
    name: 'Complete Professional Services Suite',
    description: 'Everything you need to onboard professional services clients, from intake to project kickoff.',
    templates: ['1', '6', '7', '8'],
    author: {
      name: 'Onboard Hero Team',
      company: 'Onboard Hero'
    },
    is_public: true,
    downloads: 456,
    rating: 4.8,
    created_at: '2024-07-01T00:00:00Z'
  },
  {
    id: '2',
    name: 'SaaS Startup Essentials',
    description: 'Essential templates for SaaS startups to onboard customers and grow their business.',
    templates: ['2', '5', '9'],
    author: {
      name: 'Startup Templates',
      company: 'Growth Hackers Inc.'
    },
    is_public: true,
    downloads: 789,
    rating: 4.6,
    created_at: '2024-06-15T00:00:00Z'
  }
]

const mockUserTemplates: UserTemplate[] = [
  {
    id: '1',
    name: 'Custom Legal Intake Form',
    description: 'Specialized intake form for personal injury law firms',
    category: 'forms',
    status: 'published',
    downloads: 234,
    revenue: 1170.00,
    rating: 4.7,
    created_at: '2024-06-01T00:00:00Z',
    last_updated: '2024-08-10T00:00:00Z'
  },
  {
    id: '2',
    name: 'Consulting Project Kickoff',
    description: 'Template for starting new consulting engagements',
    category: 'workflows',
    status: 'under_review',
    downloads: 0,
    revenue: 0,
    rating: 0,
    created_at: '2024-08-12T00:00:00Z',
    last_updated: '2024-08-12T00:00:00Z'
  }
]

export function TemplateMarketplace() {
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState<MarketplaceTemplate | null>(null)

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'free': return 'bg-green-100 text-green-800'
      case 'premium': return 'bg-blue-100 text-blue-800'
      case 'enterprise': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800'
      case 'under_review': return 'bg-yellow-100 text-yellow-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatPrice = (price: number) => {
    return price === 0 ? 'Free' : `$${price.toFixed(2)}`
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const filteredTemplates = mockTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesCategory = selectedCategory === 'all' || template.category === selectedCategory
    const matchesType = selectedType === 'all' || template.type === selectedType
    return matchesSearch && matchesCategory && matchesType
  })

  const totalTemplates = mockTemplates.length
  const freeTemplates = mockTemplates.filter(t => t.type === 'free').length
  const totalDownloads = mockTemplates.reduce((sum, t) => sum + t.stats.downloads, 0)
  const avgRating = mockTemplates.reduce((sum, t) => sum + t.stats.rating, 0) / mockTemplates.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Store className="h-8 w-8 mr-3 text-blue-600" />
            Template Marketplace
          </h1>
          <p className="text-gray-600">
            Discover and share community-driven onboarding templates to accelerate your workflows.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Heart className="h-4 w-4 mr-2" />
            My Favorites
          </Button>
          <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
            <DialogTrigger asChild>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Submit Template
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Submit Your Template</DialogTitle>
                <DialogDescription>
                  Share your template with the Onboard Hero community
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Template Name</Label>
                    <Input placeholder="Enter template name" />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="onboarding">Onboarding</SelectItem>
                        <SelectItem value="forms">Forms</SelectItem>
                        <SelectItem value="emails">Emails</SelectItem>
                        <SelectItem value="workflows">Workflows</SelectItem>
                        <SelectItem value="branding">Branding</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea placeholder="Describe your template and its benefits" rows={3} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Type</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="free">Free</SelectItem>
                        <SelectItem value="premium">Premium</SelectItem>
                        <SelectItem value="enterprise">Enterprise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Price (if premium)</Label>
                    <Input type="number" placeholder="0.00" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Tags</Label>
                  <Input placeholder="Enter tags separated by commas" />
                </div>
                <div className="space-y-2">
                  <Label>Template Files</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Upload className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                    <p className="text-sm text-gray-600">Drop your template files here or click to browse</p>
                    <Button variant="outline" className="mt-2">
                      Choose Files
                    </Button>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="terms" />
                  <Label htmlFor="terms">I agree to the marketplace terms and conditions</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                  Cancel
                </Button>
                <Button>Submit for Review</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Marketplace Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Package className="h-4 w-4 mr-2" />
              Total Templates
            </CardTitle>
            <div className="text-2xl font-bold">{totalTemplates}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {freeTemplates} free templates
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Total Downloads
            </CardTitle>
            <div className="text-2xl font-bold">{formatNumber(totalDownloads)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Community downloads
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Average Rating
            </CardTitle>
            <div className="text-2xl font-bold">{avgRating.toFixed(1)}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Community rating
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Active Authors
            </CardTitle>
            <div className="text-2xl font-bold">
              {new Set(mockTemplates.map(t => t.author.id)).size}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Contributing creators
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="browse" className="space-y-6">
        <TabsList>
          <TabsTrigger value="browse">Browse Templates</TabsTrigger>
          <TabsTrigger value="collections">Collections</TabsTrigger>
          <TabsTrigger value="my-templates">My Templates</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="browse" className="space-y-6">
          {/* Search and Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search templates..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    <SelectItem value="onboarding">Onboarding</SelectItem>
                    <SelectItem value="forms">Forms</SelectItem>
                    <SelectItem value="emails">Emails</SelectItem>
                    <SelectItem value="workflows">Workflows</SelectItem>
                    <SelectItem value="branding">Branding</SelectItem>
                    <SelectItem value="documents">Documents</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={selectedType} onValueChange={setSelectedType}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="free">Free</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center space-x-2">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Featured Templates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Crown className="h-5 w-5 mr-2 text-yellow-500" />
              Featured Templates
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockTemplates.filter(t => t.is_featured).map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <span>{template.name}</span>
                          {template.author.verified && (
                            <Verified className="h-4 w-4 text-blue-500" />
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.description.substring(0, 100)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer" />
                        <Badge className={getTypeColor(template.type)}>
                          {formatPrice(template.price)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{template.stats.rating}</span>
                          <span className="text-gray-500">({template.stats.reviews_count})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{formatNumber(template.stats.downloads)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(template.stats.views)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <img
                          src={template.author.avatar}
                          alt={template.author.name}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/avatars/default.jpg'
                          }}
                        />
                        <div className="text-sm">
                          <span className="font-medium">{template.author.name}</span>
                          {template.author.company && (
                            <span className="text-gray-500"> • {template.author.company}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          {template.type === 'free' ? 'Download' : 'Purchase'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {template.demo_url && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* All Templates */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-gray-900">All Templates</h2>
            <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {filteredTemplates.map((template) => (
                <Card key={template.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center space-x-2">
                          <span>{template.name}</span>
                          {template.author.verified && (
                            <Verified className="h-4 w-4 text-blue-500" />
                          )}
                          {template.is_new && (
                            <Badge className="bg-green-100 text-green-800 text-xs">New</Badge>
                          )}
                          {template.is_trending && (
                            <Badge className="bg-orange-100 text-orange-800 text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              Trending
                            </Badge>
                          )}
                        </CardTitle>
                        <CardDescription className="mt-1">
                          {template.description.substring(0, 100)}...
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Heart className="h-4 w-4 text-gray-400 hover:text-red-500 cursor-pointer" />
                        <Badge className={getTypeColor(template.type)}>
                          {formatPrice(template.price)}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium">{template.stats.rating}</span>
                          <span className="text-gray-500">({template.stats.reviews_count})</span>
                        </div>
                        <div className="flex items-center space-x-3 text-gray-500">
                          <div className="flex items-center space-x-1">
                            <Download className="h-3 w-3" />
                            <span>{formatNumber(template.stats.downloads)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{formatNumber(template.stats.views)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <img
                          src={template.author.avatar}
                          alt={template.author.name}
                          className="w-6 h-6 rounded-full"
                          onError={(e) => {
                            e.currentTarget.src = '/avatars/default.jpg'
                          }}
                        />
                        <div className="text-sm">
                          <span className="font-medium">{template.author.name}</span>
                          {template.author.company && (
                            <span className="text-gray-500"> • {template.author.company}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-1">
                        {template.tags.slice(0, 3).map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {template.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{template.tags.length - 3}
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" className="flex-1">
                          <Download className="h-4 w-4 mr-2" />
                          {template.type === 'free' ? 'Download' : 'Purchase'}
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {template.demo_url && (
                          <Button size="sm" variant="outline">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="collections" className="space-y-6">
          {/* Template Collections */}
          <div className="space-y-6">
            {mockCollections.map((collection) => (
              <Card key={collection.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-purple-100 rounded-lg">
                        <Package className="h-5 w-5 text-purple-600" />
                      </div>
                      <div>
                        <CardTitle className="flex items-center space-x-3">
                          <span>{collection.name}</span>
                          <Badge variant="outline">{collection.templates.length} templates</Badge>
                        </CardTitle>
                        <CardDescription>{collection.description}</CardDescription>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{collection.rating}</span>
                      </div>
                      <div className="text-xs text-gray-500">{formatNumber(collection.downloads)} downloads</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="font-medium">{collection.author.name}</span>
                      <span className="text-gray-500">• {collection.author.company}</span>
                      <span className="text-gray-500">• {formatDate(collection.created_at)}</span>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Download Collection
                      </Button>
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Templates
                      </Button>
                      <Button size="sm" variant="outline">
                        <Bookmark className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="my-templates" className="space-y-6">
          {/* User's Templates */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>My Templates</CardTitle>
                  <CardDescription>Templates you've created and submitted to the marketplace</CardDescription>
                </div>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockUserTemplates.map((template) => (
                  <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium flex items-center space-x-2">
                          <span>{template.name}</span>
                          <Badge className={getStatusColor(template.status)}>
                            {template.status}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">{template.description}</div>
                        <div className="text-xs text-gray-500 mt-1">
                          Created {formatDate(template.created_at)} • Updated {formatDate(template.last_updated)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right text-sm">
                        <div className="font-medium">{formatNumber(template.downloads)} downloads</div>
                        <div className="text-gray-500">${template.revenue.toFixed(2)} revenue</div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Marketplace Analytics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
                <div className="text-2xl font-bold">$1,170.00</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">+12% from last month</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Template Downloads</CardTitle>
                <div className="text-2xl font-bold">234</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">Across all templates</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Average Rating</CardTitle>
                <div className="text-2xl font-bold">4.7</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">From 45 reviews</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-600">Profile Views</CardTitle>
                <div className="text-2xl font-bold">1,234</div>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-gray-500">This month</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Performance Overview</CardTitle>
              <CardDescription>Your template marketplace performance metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="text-center py-8 text-gray-500">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4" />
                  <p>Analytics dashboard would show detailed performance metrics here</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}