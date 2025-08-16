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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Palette,
  Upload,
  Eye,
  Save,
  RotateCcw,
  Download,
  Smartphone,
  Monitor,
  Tablet,
  Type,
  Image as ImageIcon,
  Layout,
  Brush,
  Zap
} from 'lucide-react'

interface BrandingConfig {
  // Colors
  primary_color: string
  secondary_color: string
  accent_color: string
  background_color: string
  text_color: string
  border_color: string
  
  // Typography
  font_family: string
  heading_font: string
  font_size_base: number
  font_weight_normal: number
  font_weight_bold: number
  line_height: number
  
  // Logo & Images
  logo_url: string
  logo_width: number
  logo_height: number
  favicon_url: string
  background_image_url: string
  
  // Layout
  border_radius: number
  spacing_unit: number
  container_max_width: number
  sidebar_width: number
  
  // Components
  button_style: 'rounded' | 'square' | 'pill'
  card_style: 'flat' | 'elevated' | 'outlined'
  input_style: 'outlined' | 'filled' | 'underlined'
  
  // Advanced
  custom_css: string
  dark_mode_enabled: boolean
  animations_enabled: boolean
  glassmorphism_enabled: boolean
  gradient_backgrounds: boolean
}

const DEFAULT_CONFIG: BrandingConfig = {
  primary_color: '#0066cc',
  secondary_color: '#6b7280',
  accent_color: '#10b981',
  background_color: '#ffffff',
  text_color: '#111827',
  border_color: '#e5e7eb',
  
  font_family: 'Inter',
  heading_font: 'Inter',
  font_size_base: 16,
  font_weight_normal: 400,
  font_weight_bold: 600,
  line_height: 1.5,
  
  logo_url: '',
  logo_width: 200,
  logo_height: 60,
  favicon_url: '',
  background_image_url: '',
  
  border_radius: 8,
  spacing_unit: 16,
  container_max_width: 1200,
  sidebar_width: 280,
  
  button_style: 'rounded',
  card_style: 'elevated',
  input_style: 'outlined',
  
  custom_css: '',
  dark_mode_enabled: false,
  animations_enabled: true,
  glassmorphism_enabled: false,
  gradient_backgrounds: false
}

const FONT_OPTIONS = [
  'Inter',
  'Roboto',
  'Open Sans',
  'Lato',
  'Montserrat',
  'Poppins',
  'Source Sans Pro',
  'Nunito',
  'Raleway',
  'Ubuntu'
]

const COLOR_PRESETS = [
  {
    name: 'Ocean Blue',
    colors: {
      primary_color: '#0066cc',
      secondary_color: '#64748b',
      accent_color: '#06b6d4',
      background_color: '#ffffff',
      text_color: '#0f172a'
    }
  },
  {
    name: 'Forest Green',
    colors: {
      primary_color: '#059669',
      secondary_color: '#6b7280',
      accent_color: '#10b981',
      background_color: '#ffffff',
      text_color: '#111827'
    }
  },
  {
    name: 'Sunset Orange',
    colors: {
      primary_color: '#ea580c',
      secondary_color: '#78716c',
      accent_color: '#f59e0b',
      background_color: '#ffffff',
      text_color: '#1c1917'
    }
  },
  {
    name: 'Royal Purple',
    colors: {
      primary_color: '#7c3aed',
      secondary_color: '#6b7280',
      accent_color: '#a855f7',
      background_color: '#ffffff',
      text_color: '#111827'
    }
  },
  {
    name: 'Dark Mode',
    colors: {
      primary_color: '#3b82f6',
      secondary_color: '#9ca3af',
      accent_color: '#10b981',
      background_color: '#111827',
      text_color: '#f9fafb'
    }
  }
]

export function AdvancedBrandingCustomizer() {
  const [config, setConfig] = useState<BrandingConfig>(DEFAULT_CONFIG)
  const [previewMode, setPreviewMode] = useState<'desktop' | 'tablet' | 'mobile'>('desktop')
  const [activeTab, setActiveTab] = useState('colors')
  const [saving, setSaving] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    // Load saved branding config
    const loadConfig = async () => {
      try {
        // In a real implementation, fetch from API
        const savedConfig = localStorage.getItem('branding-config')
        if (savedConfig) {
          setConfig({ ...DEFAULT_CONFIG, ...JSON.parse(savedConfig) })
        }
      } catch (error) {
        console.error('Failed to load branding config:', error)
      }
    }

    loadConfig()
  }, [])

  const updateConfig = (updates: Partial<BrandingConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }))
    setHasChanges(true)
  }

  const applyColorPreset = (preset: typeof COLOR_PRESETS[0]) => {
    updateConfig(preset.colors)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      // In a real implementation, save to API
      localStorage.setItem('branding-config', JSON.stringify(config))
      
      // Apply CSS variables to document
      applyCSSVariables(config)
      
      setHasChanges(false)
      console.log('Branding config saved successfully')
    } catch (error) {
      console.error('Failed to save branding config:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    if (confirm('Are you sure you want to reset all branding settings to default?')) {
      setConfig(DEFAULT_CONFIG)
      setHasChanges(true)
    }
  }

  const handleExport = () => {
    const dataStr = JSON.stringify(config, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = 'onboardkit-branding-config.json'
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  const applyCSSVariables = (brandingConfig: BrandingConfig) => {
    const root = document.documentElement
    
    root.style.setProperty('--primary-color', brandingConfig.primary_color)
    root.style.setProperty('--secondary-color', brandingConfig.secondary_color)
    root.style.setProperty('--accent-color', brandingConfig.accent_color)
    root.style.setProperty('--background-color', brandingConfig.background_color)
    root.style.setProperty('--text-color', brandingConfig.text_color)
    root.style.setProperty('--border-color', brandingConfig.border_color)
    root.style.setProperty('--border-radius', `${brandingConfig.border_radius}px`)
    root.style.setProperty('--spacing-unit', `${brandingConfig.spacing_unit}px`)
    root.style.setProperty('--font-family', brandingConfig.font_family)
    root.style.setProperty('--heading-font', brandingConfig.heading_font)
    root.style.setProperty('--font-size-base', `${brandingConfig.font_size_base}px`)
  }

  const getPreviewClasses = () => {
    switch (previewMode) {
      case 'mobile':
        return 'max-w-sm mx-auto'
      case 'tablet':
        return 'max-w-2xl mx-auto'
      default:
        return 'max-w-6xl mx-auto'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Advanced Branding</h1>
          <p className="text-gray-600">
            Customize every aspect of your OnboardKit experience to match your brand.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
            <Button
              variant={previewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'tablet' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('tablet')}
            >
              <Tablet className="h-4 w-4" />
            </Button>
            <Button
              variant={previewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setPreviewMode('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </Button>
          </div>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline" onClick={handleReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
          <Button onClick={handleSave} disabled={saving || !hasChanges}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customization Panel */}
        <div className="lg:col-span-1 space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="colors" className="flex items-center">
                <Palette className="h-4 w-4 mr-2" />
                Colors
              </TabsTrigger>
              <TabsTrigger value="typography" className="flex items-center">
                <Type className="h-4 w-4 mr-2" />
                Typography
              </TabsTrigger>
            </TabsList>

            <TabsContent value="colors" className="space-y-6">
              {/* Color Presets */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Color Presets</CardTitle>
                  <CardDescription>Quick start with pre-designed color schemes</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {COLOR_PRESETS.map((preset, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3">
                        <div className="flex space-x-1">
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.colors.primary_color }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.colors.secondary_color }}
                          />
                          <div 
                            className="w-4 h-4 rounded-full border"
                            style={{ backgroundColor: preset.colors.accent_color }}
                          />
                        </div>
                        <span className="font-medium">{preset.name}</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => applyColorPreset(preset)}
                      >
                        Apply
                      </Button>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Individual Colors */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Custom Colors</CardTitle>
                  <CardDescription>Fine-tune individual color values</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primary-color">Primary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="primary-color"
                          type="color"
                          value={config.primary_color}
                          onChange={(e) => updateConfig({ primary_color: e.target.value })}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={config.primary_color}
                          onChange={(e) => updateConfig({ primary_color: e.target.value })}
                          placeholder="#0066cc"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondary-color">Secondary Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="secondary-color"
                          type="color"
                          value={config.secondary_color}
                          onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={config.secondary_color}
                          onChange={(e) => updateConfig({ secondary_color: e.target.value })}
                          placeholder="#6b7280"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="accent-color">Accent Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="accent-color"
                          type="color"
                          value={config.accent_color}
                          onChange={(e) => updateConfig({ accent_color: e.target.value })}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={config.accent_color}
                          onChange={(e) => updateConfig({ accent_color: e.target.value })}
                          placeholder="#10b981"
                          className="flex-1"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="background-color">Background Color</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="background-color"
                          type="color"
                          value={config.background_color}
                          onChange={(e) => updateConfig({ background_color: e.target.value })}
                          className="w-12 h-10 p-1 border rounded"
                        />
                        <Input
                          value={config.background_color}
                          onChange={(e) => updateConfig({ background_color: e.target.value })}
                          placeholder="#ffffff"
                          className="flex-1"
                        />
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Advanced Effects */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Visual Effects</CardTitle>
                  <CardDescription>Modern visual enhancements</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Dark Mode Support</Label>
                      <p className="text-sm text-gray-500">Enable automatic dark mode</p>
                    </div>
                    <Switch
                      checked={config.dark_mode_enabled}
                      onCheckedChange={(checked) => updateConfig({ dark_mode_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Glassmorphism</Label>
                      <p className="text-sm text-gray-500">Frosted glass effect</p>
                    </div>
                    <Switch
                      checked={config.glassmorphism_enabled}
                      onCheckedChange={(checked) => updateConfig({ glassmorphism_enabled: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Gradient Backgrounds</Label>
                      <p className="text-sm text-gray-500">Use gradient backgrounds</p>
                    </div>
                    <Switch
                      checked={config.gradient_backgrounds}
                      onCheckedChange={(checked) => updateConfig({ gradient_backgrounds: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Animations</Label>
                      <p className="text-sm text-gray-500">Enable smooth animations</p>
                    </div>
                    <Switch
                      checked={config.animations_enabled}
                      onCheckedChange={(checked) => updateConfig({ animations_enabled: checked })}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="typography" className="space-y-6">
              {/* Font Selection */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Font Families</CardTitle>
                  <CardDescription>Choose fonts for your brand</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Body Font</Label>
                    <Select
                      value={config.font_family}
                      onValueChange={(value) => updateConfig({ font_family: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Heading Font</Label>
                    <Select
                      value={config.heading_font}
                      onValueChange={(value) => updateConfig({ heading_font: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_OPTIONS.map(font => (
                          <SelectItem key={font} value={font}>{font}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Font Sizing */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Font Sizing</CardTitle>
                  <CardDescription>Adjust typography scale</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Base Font Size: {config.font_size_base}px</Label>
                    <input
                      type="range"
                      min="12"
                      max="20"
                      value={config.font_size_base}
                      onChange={(e) => updateConfig({ font_size_base: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Line Height: {config.line_height}</Label>
                    <input
                      type="range"
                      min="1.2"
                      max="2.0"
                      step="0.1"
                      value={config.line_height}
                      onChange={(e) => updateConfig({ line_height: parseFloat(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Layout Settings */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Layout & Spacing</CardTitle>
                  <CardDescription>Control spacing and layout</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label>Border Radius: {config.border_radius}px</Label>
                    <input
                      type="range"
                      min="0"
                      max="24"
                      value={config.border_radius}
                      onChange={(e) => updateConfig({ border_radius: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Spacing Unit: {config.spacing_unit}px</Label>
                    <input
                      type="range"
                      min="8"
                      max="32"
                      value={config.spacing_unit}
                      onChange={(e) => updateConfig({ spacing_unit: parseInt(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Live Preview */}
        <div className="lg:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    Live Preview
                  </CardTitle>
                  <CardDescription>See your changes in real-time</CardDescription>
                </div>
                {hasChanges && (
                  <Badge variant="secondary">Unsaved Changes</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className={`transition-all duration-300 ${getPreviewClasses()}`}>
                {/* Preview Content */}
                <div 
                  className="p-6 rounded-lg border"
                  style={{
                    backgroundColor: config.background_color,
                    color: config.text_color,
                    borderColor: config.border_color,
                    borderRadius: `${config.border_radius}px`,
                    fontFamily: config.font_family,
                    fontSize: `${config.font_size_base}px`,
                    lineHeight: config.line_height
                  }}
                >
                  <div className="space-y-6">
                    {/* Header */}
                    <div className="text-center">
                      <h1 
                        className="text-3xl font-bold mb-2"
                        style={{ 
                          color: config.primary_color,
                          fontFamily: config.heading_font
                        }}
                      >
                        Welcome to OnboardKit
                      </h1>
                      <p style={{ color: config.secondary_color }}>
                        Experience your custom branding in action
                      </p>
                    </div>

                    {/* Buttons */}
                    <div className="flex justify-center space-x-4">
                      <button
                        className="px-6 py-2 font-medium transition-colors"
                        style={{
                          backgroundColor: config.primary_color,
                          color: config.background_color,
                          borderRadius: config.button_style === 'pill' ? '9999px' : 
                                       config.button_style === 'square' ? '0px' : 
                                       `${config.border_radius}px`
                        }}
                      >
                        Primary Button
                      </button>
                      <button
                        className="px-6 py-2 font-medium border transition-colors"
                        style={{
                          color: config.primary_color,
                          borderColor: config.primary_color,
                          borderRadius: config.button_style === 'pill' ? '9999px' : 
                                       config.button_style === 'square' ? '0px' : 
                                       `${config.border_radius}px`
                        }}
                      >
                        Secondary Button
                      </button>
                    </div>

                    {/* Card */}
                    <div 
                      className="p-4 border"
                      style={{
                        borderColor: config.border_color,
                        borderRadius: `${config.border_radius}px`,
                        backgroundColor: config.card_style === 'elevated' ? 
                          `${config.background_color}dd` : config.background_color,
                        boxShadow: config.card_style === 'elevated' ? 
                          '0 4px 6px -1px rgba(0, 0, 0, 0.1)' : 'none'
                      }}
                    >
                      <h3 
                        className="text-lg font-semibold mb-2"
                        style={{ 
                          color: config.primary_color,
                          fontFamily: config.heading_font
                        }}
                      >
                        Sample Card
                      </h3>
                      <p style={{ color: config.text_color }}>
                        This is how your content will look with the current branding settings.
                      </p>
                      <div className="mt-3">
                        <span 
                          className="inline-block px-2 py-1 text-sm rounded"
                          style={{
                            backgroundColor: config.accent_color,
                            color: config.background_color
                          }}
                        >
                          Accent Badge
                        </span>
                      </div>
                    </div>

                    {/* Form Elements */}
                    <div className="space-y-3">
                      <input
                        type="text"
                        placeholder="Sample input field"
                        className="w-full px-3 py-2 border transition-colors"
                        style={{
                          borderColor: config.border_color,
                          borderRadius: `${config.border_radius}px`,
                          fontSize: `${config.font_size_base}px`
                        }}
                      />
                      <textarea
                        placeholder="Sample textarea"
                        rows={3}
                        className="w-full px-3 py-2 border transition-colors resize-none"
                        style={{
                          borderColor: config.border_color,
                          borderRadius: `${config.border_radius}px`,
                          fontSize: `${config.font_size_base}px`
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}