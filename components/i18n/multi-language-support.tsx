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
  Globe,
  Languages,
  FileText,
  Users,
  Settings,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Copy,
  Download,
  Upload,
  Eye,
  RefreshCw,
  Search,
  Filter,
  BarChart3,
  TrendingUp,
  Activity,
  Target,
  Zap,
  Crown,
  Award,
  Building,
  Mail,
  Phone,
  Calendar,
  MapPin,
  Flag,
  Compass,
  Navigation,
  Map,
  Play,
  Pause
} from 'lucide-react'

interface Language {
  code: string
  name: string
  native_name: string
  flag: string
  status: 'active' | 'inactive' | 'in_progress' | 'pending'
  completion_percentage: number
  total_keys: number
  translated_keys: number
  last_updated: string
  translators: string[]
  regions: string[]
  usage_stats: {
    active_users: number
    total_sessions: number
    completion_rate: number
  }
}

interface TranslationKey {
  id: string
  key: string
  namespace: string
  source_text: string
  translations: Record<string, {
    text: string
    status: 'approved' | 'pending' | 'needs_review' | 'auto_translated'
    translator: string
    updated_at: string
    notes?: string
  }>
  context: string
  character_limit?: number
  pluralization: boolean
  variables: string[]
}

interface TranslationProject {
  id: string
  name: string
  description: string
  source_language: string
  target_languages: string[]
  status: 'active' | 'completed' | 'paused'
  progress: number
  deadline?: string
  created_at: string
  manager: string
  translators: Array<{
    language: string
    translator: string
    status: 'assigned' | 'in_progress' | 'completed'
  }>
}

interface LocalizationSettings {
  default_language: string
  fallback_language: string
  auto_detect_language: boolean
  rtl_support: boolean
  date_format: string
  number_format: string
  currency_format: string
  timezone_handling: 'user' | 'server' | 'auto'
  pseudo_localization: boolean
}

// Mock data
const mockLanguages: Language[] = [
  {
    code: 'en',
    name: 'English',
    native_name: 'English',
    flag: '🇺🇸',
    status: 'active',
    completion_percentage: 100,
    total_keys: 1247,
    translated_keys: 1247,
    last_updated: '2024-08-14T15:30:00Z',
    translators: ['System'],
    regions: ['US', 'UK', 'CA', 'AU'],
    usage_stats: {
      active_users: 2847,
      total_sessions: 15623,
      completion_rate: 87.5
    }
  },
  {
    code: 'es',
    name: 'Spanish',
    native_name: 'Español',
    flag: '🇪🇸',
    status: 'active',
    completion_percentage: 95,
    total_keys: 1247,
    translated_keys: 1185,
    last_updated: '2024-08-13T10:20:00Z',
    translators: ['Maria Rodriguez', 'Carlos Mendez'],
    regions: ['ES', 'MX', 'AR', 'CO'],
    usage_stats: {
      active_users: 1234,
      total_sessions: 6789,
      completion_rate: 89.2
    }
  },
  {
    code: 'fr',
    name: 'French',
    native_name: 'Français',
    flag: '🇫🇷',
    status: 'active',
    completion_percentage: 92,
    total_keys: 1247,
    translated_keys: 1147,
    last_updated: '2024-08-12T14:45:00Z',
    translators: ['Sophie Dubois', 'Pierre Martin'],
    regions: ['FR', 'CA', 'BE', 'CH'],
    usage_stats: {
      active_users: 892,
      total_sessions: 4567,
      completion_rate: 91.8
    }
  },
  {
    code: 'de',
    name: 'German',
    native_name: 'Deutsch',
    flag: '🇩🇪',
    status: 'in_progress',
    completion_percentage: 78,
    total_keys: 1247,
    translated_keys: 973,
    last_updated: '2024-08-11T09:15:00Z',
    translators: ['Hans Mueller', 'Anna Schmidt'],
    regions: ['DE', 'AT', 'CH'],
    usage_stats: {
      active_users: 567,
      total_sessions: 2345,
      completion_rate: 85.4
    }
  },
  {
    code: 'ja',
    name: 'Japanese',
    native_name: '日本語',
    flag: '🇯🇵',
    status: 'in_progress',
    completion_percentage: 65,
    total_keys: 1247,
    translated_keys: 811,
    last_updated: '2024-08-10T16:30:00Z',
    translators: ['Yuki Tanaka'],
    regions: ['JP'],
    usage_stats: {
      active_users: 423,
      total_sessions: 1876,
      completion_rate: 82.1
    }
  },
  {
    code: 'zh',
    name: 'Chinese (Simplified)',
    native_name: '简体中文',
    flag: '🇨🇳',
    status: 'pending',
    completion_percentage: 0,
    total_keys: 1247,
    translated_keys: 0,
    last_updated: '2024-08-14T00:00:00Z',
    translators: [],
    regions: ['CN', 'SG'],
    usage_stats: {
      active_users: 0,
      total_sessions: 0,
      completion_rate: 0
    }
  }
]

const mockTranslationKeys: TranslationKey[] = [
  {
    id: '1',
    key: 'welcome.title',
    namespace: 'onboarding',
    source_text: 'Welcome to OnboardKit',
    translations: {
      'es': {
        text: 'Bienvenido a OnboardKit',
        status: 'approved',
        translator: 'Maria Rodriguez',
        updated_at: '2024-08-13T10:20:00Z'
      },
      'fr': {
        text: 'Bienvenue sur OnboardKit',
        status: 'approved',
        translator: 'Sophie Dubois',
        updated_at: '2024-08-12T14:45:00Z'
      },
      'de': {
        text: 'Willkommen bei OnboardKit',
        status: 'pending',
        translator: 'Hans Mueller',
        updated_at: '2024-08-11T09:15:00Z'
      }
    },
    context: 'Main welcome message displayed on the onboarding start page',
    character_limit: 50,
    pluralization: false,
    variables: []
  },
  {
    id: '2',
    key: 'form.validation.required',
    namespace: 'forms',
    source_text: 'This field is required',
    translations: {
      'es': {
        text: 'Este campo es obligatorio',
        status: 'approved',
        translator: 'Carlos Mendez',
        updated_at: '2024-08-13T11:30:00Z'
      },
      'fr': {
        text: 'Ce champ est obligatoire',
        status: 'approved',
        translator: 'Pierre Martin',
        updated_at: '2024-08-12T15:20:00Z'
      },
      'de': {
        text: 'Dieses Feld ist erforderlich',
        status: 'needs_review',
        translator: 'Anna Schmidt',
        updated_at: '2024-08-11T10:45:00Z',
        notes: 'Consider shorter alternative for mobile displays'
      }
    },
    context: 'Error message shown when a required form field is empty',
    character_limit: 30,
    pluralization: false,
    variables: []
  },
  {
    id: '3',
    key: 'progress.steps_completed',
    namespace: 'progress',
    source_text: '{count} {count, plural, one {step} other {steps}} completed',
    translations: {
      'es': {
        text: '{count} {count, plural, one {paso} other {pasos}} completado{count, plural, one {} other {s}}',
        status: 'approved',
        translator: 'Maria Rodriguez',
        updated_at: '2024-08-13T12:15:00Z'
      },
      'fr': {
        text: '{count} {count, plural, one {étape} other {étapes}} terminée{count, plural, one {} other {s}}',
        status: 'approved',
        translator: 'Sophie Dubois',
        updated_at: '2024-08-12T16:30:00Z'
      }
    },
    context: 'Progress indicator showing number of completed steps',
    pluralization: true,
    variables: ['count']
  }
]

const mockProjects: TranslationProject[] = [
  {
    id: '1',
    name: 'Q3 2024 Feature Release',
    description: 'Translation of new features and UI updates for Q3 release',
    source_language: 'en',
    target_languages: ['es', 'fr', 'de'],
    status: 'active',
    progress: 78,
    deadline: '2024-09-15T00:00:00Z',
    created_at: '2024-08-01T00:00:00Z',
    manager: 'Sarah Johnson',
    translators: [
      { language: 'es', translator: 'Maria Rodriguez', status: 'in_progress' },
      { language: 'fr', translator: 'Sophie Dubois', status: 'completed' },
      { language: 'de', translator: 'Hans Mueller', status: 'assigned' }
    ]
  },
  {
    id: '2',
    name: 'Mobile App Localization',
    description: 'Complete localization of the mobile application interface',
    source_language: 'en',
    target_languages: ['ja', 'zh', 'ko'],
    status: 'paused',
    progress: 35,
    created_at: '2024-07-15T00:00:00Z',
    manager: 'Mike Chen',
    translators: [
      { language: 'ja', translator: 'Yuki Tanaka', status: 'in_progress' },
      { language: 'zh', translator: 'Li Wei', status: 'assigned' },
      { language: 'ko', translator: 'Kim Min-jun', status: 'assigned' }
    ]
  }
]

export function MultiLanguageSupport() {
  const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null)
  const [showAddLanguageDialog, setShowAddLanguageDialog] = useState(false)
  const [showTranslationDialog, setShowTranslationDialog] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedNamespace, setSelectedNamespace] = useState('all')

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'in_progress':
      case 'assigned':
        return 'bg-blue-100 text-blue-800'
      case 'pending':
      case 'needs_review':
        return 'bg-yellow-100 text-yellow-800'
      case 'inactive':
      case 'paused':
        return 'bg-gray-100 text-gray-800'
      case 'auto_translated':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
      case 'completed':
        return CheckCircle
      case 'in_progress':
      case 'assigned':
        return Clock
      case 'pending':
      case 'needs_review':
        return AlertTriangle
      case 'inactive':
      case 'paused':
        return XCircle
      default:
        return Clock
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  const filteredKeys = mockTranslationKeys.filter(key => {
    const matchesSearch = key.key.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         key.source_text.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesNamespace = selectedNamespace === 'all' || key.namespace === selectedNamespace
    return matchesSearch && matchesNamespace
  })

  const totalKeys = mockLanguages.reduce((sum, lang) => sum + lang.total_keys, 0)
  const totalTranslated = mockLanguages.reduce((sum, lang) => sum + lang.translated_keys, 0)
  const activeLanguages = mockLanguages.filter(lang => lang.status === 'active').length
  const avgCompletion = mockLanguages.reduce((sum, lang) => sum + lang.completion_percentage, 0) / mockLanguages.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <Globe className="h-8 w-8 mr-3 text-blue-600" />
            Multi-Language Support
          </h1>
          <p className="text-gray-600">
            Manage translations and localization for global onboarding experiences.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Translations
          </Button>
          <Dialog open={showAddLanguageDialog} onOpenChange={setShowAddLanguageDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Language
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Language</DialogTitle>
                <DialogDescription>
                  Add a new language to your localization project
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Language</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pt">Portuguese (Português)</SelectItem>
                      <SelectItem value="it">Italian (Italiano)</SelectItem>
                      <SelectItem value="ru">Russian (Русский)</SelectItem>
                      <SelectItem value="ar">Arabic (العربية)</SelectItem>
                      <SelectItem value="hi">Hindi (हिन्दी)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Primary Region</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select primary region" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="BR">Brazil</SelectItem>
                      <SelectItem value="IT">Italy</SelectItem>
                      <SelectItem value="RU">Russia</SelectItem>
                      <SelectItem value="SA">Saudi Arabia</SelectItem>
                      <SelectItem value="IN">India</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Translator Email</Label>
                  <Input placeholder="translator@example.com" />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch id="auto-translate" />
                  <Label htmlFor="auto-translate">Enable auto-translation for initial setup</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddLanguageDialog(false)}>
                  Cancel
                </Button>
                <Button>Add Language</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Localization Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Languages className="h-4 w-4 mr-2" />
              Active Languages
            </CardTitle>
            <div className="text-2xl font-bold">{activeLanguages}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              {mockLanguages.length - activeLanguages} in progress/pending
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <FileText className="h-4 w-4 mr-2" />
              Translation Keys
            </CardTitle>
            <div className="text-2xl font-bold">{totalTranslated.toLocaleString()}</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              of {totalKeys.toLocaleString()} total keys
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Target className="h-4 w-4 mr-2" />
              Avg. Completion
            </CardTitle>
            <div className="text-2xl font-bold">{avgCompletion.toFixed(1)}%</div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Across all languages
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Global Users
            </CardTitle>
            <div className="text-2xl font-bold">
              {mockLanguages.reduce((sum, lang) => sum + lang.usage_stats.active_users, 0).toLocaleString()}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-500">
              Using localized content
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="languages" className="space-y-6">
        <TabsList>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="translations">Translations</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="languages" className="space-y-6">
          {/* Languages List */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mockLanguages.map((language) => {
              const StatusIcon = getStatusIcon(language.status)
              
              return (
                <Card key={language.code} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="text-3xl">{language.flag}</div>
                        <div>
                          <CardTitle className="flex items-center space-x-3">
                            <span>{language.name}</span>
                            <Badge className={getStatusColor(language.status)}>
                              <StatusIcon className="h-3 w-3 mr-1" />
                              {language.status}
                            </Badge>
                          </CardTitle>
                          <CardDescription>{language.native_name}</CardDescription>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-600">
                          {language.completion_percentage}%
                        </div>
                        <div className="text-xs text-gray-500">complete</div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span>Translation Progress</span>
                          <span className="font-medium">
                            {language.translated_keys} / {language.total_keys}
                          </span>
                        </div>
                        <Progress value={language.completion_percentage} className="h-2" />
                      </div>

                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <div className="text-gray-600">Active Users</div>
                          <div className="font-medium">{language.usage_stats.active_users.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Completion Rate</div>
                          <div className="font-medium">{language.usage_stats.completion_rate}%</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Total Sessions</div>
                          <div className="font-medium">{language.usage_stats.total_sessions.toLocaleString()}</div>
                        </div>
                        <div>
                          <div className="text-gray-600">Last Updated</div>
                          <div className="font-medium">{formatDate(language.last_updated)}</div>
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Translators</div>
                        <div className="flex flex-wrap gap-1">
                          {language.translators.map((translator, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {translator}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm font-medium text-gray-700 mb-2">Regions</div>
                        <div className="flex flex-wrap gap-1">
                          {language.regions.map((region, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {region}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4 mr-2" />
                          Preview
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="h-4 w-4 mr-2" />
                          Export
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </TabsContent>

        <TabsContent value="translations" className="space-y-6">
          {/* Translation Management */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Translation Keys</CardTitle>
                  <CardDescription>Manage individual translation keys and their translations</CardDescription>
                </div>
                <Dialog open={showTranslationDialog} onOpenChange={setShowTranslationDialog}>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Key
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Add Translation Key</DialogTitle>
                      <DialogDescription>
                        Create a new translation key for localization
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Key</Label>
                          <Input placeholder="e.g., welcome.title" />
                        </div>
                        <div className="space-y-2">
                          <Label>Namespace</Label>
                          <Select>
                            <SelectTrigger>
                              <SelectValue placeholder="Select namespace" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="onboarding">Onboarding</SelectItem>
                              <SelectItem value="forms">Forms</SelectItem>
                              <SelectItem value="progress">Progress</SelectItem>
                              <SelectItem value="navigation">Navigation</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label>Source Text (English)</Label>
                        <Textarea placeholder="Enter the source text in English" />
                      </div>
                      <div className="space-y-2">
                        <Label>Context</Label>
                        <Textarea placeholder="Provide context for translators" rows={2} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label>Character Limit (optional)</Label>
                          <Input type="number" placeholder="e.g., 50" />
                        </div>
                        <div className="flex items-center space-x-2 pt-6">
                          <Switch id="pluralization" />
                          <Label htmlFor="pluralization">Supports pluralization</Label>
                        </div>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowTranslationDialog(false)}>
                        Cancel
                      </Button>
                      <Button>Create Key</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center space-x-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Search translation keys..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <Select value={selectedNamespace} onValueChange={setSelectedNamespace}>
                    <SelectTrigger className="w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Namespaces</SelectItem>
                      <SelectItem value="onboarding">Onboarding</SelectItem>
                      <SelectItem value="forms">Forms</SelectItem>
                      <SelectItem value="progress">Progress</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Translation Keys */}
                <div className="space-y-4">
                  {filteredKeys.map((key) => (
                    <Card key={key.id} className="hover:shadow-sm transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-base flex items-center space-x-2">
                              <code className="bg-gray-100 px-2 py-1 rounded text-sm">{key.key}</code>
                              <Badge variant="outline">{key.namespace}</Badge>
                              {key.pluralization && (
                                <Badge variant="outline" className="text-xs">Plural</Badge>
                              )}
                            </CardTitle>
                            <CardDescription className="mt-1">
                              "{key.source_text}"
                            </CardDescription>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button size="sm" variant="outline">
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </Button>
                            <Button size="sm" variant="outline">
                              <Copy className="h-4 w-4 mr-2" />
                              Copy
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {key.context && (
                            <div className="text-sm text-gray-600 italic">
                              Context: {key.context}
                            </div>
                          )}
                          
                          {key.variables.length > 0 && (
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">Variables:</span>
                              {key.variables.map((variable, index) => (
                                <Badge key={index} variant="outline" className="text-xs font-mono">
                                  {variable}
                                </Badge>
                              ))}
                            </div>
                          )}

                          <div className="space-y-2">
                            {Object.entries(key.translations).map(([langCode, translation]) => {
                              const language = mockLanguages.find(l => l.code === langCode)
                              const StatusIcon = getStatusIcon(translation.status)
                              
                              return (
                                <div key={langCode} className="flex items-center justify-between p-3 border rounded-lg">
                                  <div className="flex items-center space-x-3">
                                    <span className="text-lg">{language?.flag}</span>
                                    <div>
                                      <div className="font-medium text-sm">"{translation.text}"</div>
                                      <div className="text-xs text-gray-500">
                                        by {translation.translator} • {formatDate(translation.updated_at)}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center space-x-2">
                                    <Badge className={getStatusColor(translation.status)}>
                                      <StatusIcon className="h-3 w-3 mr-1" />
                                      {translation.status}
                                    </Badge>
                                    <Button size="sm" variant="outline">
                                      <Edit className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="projects" className="space-y-6">
          {/* Translation Projects */}
          <div className="space-y-6">
            {mockProjects.map((project) => (
              <Card key={project.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center space-x-3">
                        <span>{project.name}</span>
                        <Badge className={getStatusColor(project.status)}>
                          {project.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>{project.description}</CardDescription>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-blue-600">{project.progress}%</div>
                      <div className="text-xs text-gray-500">complete</div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span>Project Progress</span>
                        <span className="font-medium">{project.progress}%</span>
                      </div>
                      <Progress value={project.progress} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <div className="text-gray-600">Source Language</div>
                        <div className="font-medium">{project.source_language.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Target Languages</div>
                        <div className="font-medium">{project.target_languages.length}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Manager</div>
                        <div className="font-medium">{project.manager}</div>
                      </div>
                      <div>
                        <div className="text-gray-600">Created</div>
                        <div className="font-medium">{formatDate(project.created_at)}</div>
                      </div>
                    </div>

                    {project.deadline && (
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-400" />
                        <span className="text-gray-600">Deadline:</span>
                        <span className="font-medium">{formatDate(project.deadline)}</span>
                      </div>
                    )}

                    <div>
                      <div className="text-sm font-medium text-gray-700 mb-2">Translator Progress</div>
                      <div className="space-y-2">
                        {project.translators.map((translator, index) => {
                          const language = mockLanguages.find(l => l.code === translator.language)
                          const StatusIcon = getStatusIcon(translator.status)
                          
                          return (
                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                              <div className="flex items-center space-x-3">
                                <span className="text-lg">{language?.flag}</span>
                                <div>
                                  <div className="font-medium text-sm">{translator.translator}</div>
                                  <div className="text-xs text-gray-500">{language?.name}</div>
                                </div>
                              </div>
                              <Badge className={getStatusColor(translator.status)}>
                                <StatusIcon className="h-3 w-3 mr-1" />
                                {translator.status}
                              </Badge>
                            </div>
                          )
                        })}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Eye className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit Project
                      </Button>
                      {project.status === 'paused' && (
                        <Button size="sm">
                          <Play className="h-4 w-4 mr-2" />
                          Resume
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          {/* Localization Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Localization Settings</CardTitle>
              <CardDescription>Configure global localization behavior and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Fallback Language</Label>
                    <Select defaultValue="en">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Auto-detect user language</Label>
                    <p className="text-sm text-gray-600">Automatically detect user's preferred language from browser settings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Right-to-left (RTL) support</Label>
                    <p className="text-sm text-gray-600">Enable RTL layout support for Arabic, Hebrew, and other RTL languages</p>
                  </div>
                  <Switch />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base">Pseudo-localization</Label>
                    <p className="text-sm text-gray-600">Enable pseudo-localization for testing UI with longer text</p>
                  </div>
                  <Switch />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Date Format</Label>
                    <Select defaultValue="locale">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="locale">Use locale default</SelectItem>
                        <SelectItem value="iso">ISO 8601 (YYYY-MM-DD)</SelectItem>
                        <SelectItem value="us">US format (MM/DD/YYYY)</SelectItem>
                        <SelectItem value="eu">European format (DD/MM/YYYY)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Number Format</Label>
                    <Select defaultValue="locale">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="locale">Use locale default</SelectItem>
                        <SelectItem value="us">US format (1,234.56)</SelectItem>
                        <SelectItem value="eu">European format (1.234,56)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Timezone Handling</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="auto">Auto-detect user timezone</SelectItem>
                      <SelectItem value="user">User-selected timezone</SelectItem>
                      <SelectItem value="server">Server timezone</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}