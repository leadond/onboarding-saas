'use client'

"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Code,
  Download,
  Copy,
  ExternalLink,
  Zap,
  Layers,
  Globe,
  Smartphone,
  Monitor,
  Package,
  Settings,
  Play,
  Eye,
  BookOpen,
  Github
} from 'lucide-react'

export function EmbeddedOnboardingSDK() {
  const [selectedFramework, setSelectedFramework] = useState('react')
  const [apiKey, setApiKey] = useState('ok_live_1234567890abcdef')
  const [copied, setCopied] = useState('')

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 2000)
  }

  const frameworks = [
    {
      id: 'react',
      name: 'React',
      icon: '⚛️',
      description: 'Modern React components with TypeScript support',
      downloads: '45.2K',
      version: '2.1.4',
      size: '12.3 KB'
    },
    {
      id: 'vue',
      name: 'Vue.js',
      icon: '🟢',
      description: 'Vue 3 composition API with full TypeScript support',
      downloads: '23.8K',
      version: '2.1.2',
      size: '11.8 KB'
    },
    {
      id: 'vanilla',
      name: 'Vanilla JS',
      icon: '🟨',
      description: 'Framework-agnostic JavaScript library',
      downloads: '67.1K',
      version: '2.1.5',
      size: '8.9 KB'
    },
    {
      id: 'angular',
      name: 'Angular',
      icon: '🔴',
      description: 'Angular components with reactive forms',
      downloads: '18.4K',
      version: '2.0.8',
      size: '15.2 KB'
    }
  ]

  const codeExamples = {
    react: `import { OnboardingKit } from '@onboardkit/react'

function App() {
  return (
    <OnboardingKit
      apiKey="${apiKey}"
      kitId="welcome-flow"
      theme="modern"
      onComplete={(data) => {
        console.log('Onboarding completed:', data)
      }}
      onStep={(step, data) => {
        console.log('Step completed:', step, data)
      }}
    />
  )
}`,
    vue: `<template>
  <OnboardingKit
    :api-key="apiKey"
    kit-id="welcome-flow"
    theme="modern"
    @complete="onComplete"
    @step="onStep"
  />
</template>

<script setup>
import { OnboardingKit } from '@onboardkit/vue'

const apiKey = '${apiKey}'

const onComplete = (data) => {
  console.log('Onboarding completed:', data)
}

const onStep = (step, data) => {
  console.log('Step completed:', step, data)
}
</script>`,
    vanilla: `<div id="onboarding-container"></div>

<script>
import OnboardingKit from '@onboardkit/js'

const kit = new OnboardingKit({
  apiKey: '${apiKey}',
  container: '#onboarding-container',
  kitId: 'welcome-flow',
  theme: 'modern',
  onComplete: (data) => {
    console.log('Onboarding completed:', data)
  },
  onStep: (step, data) => {
    console.log('Step completed:', step, data)
  }
})

kit.render()
</script>`,
    angular: `import { Component } from '@angular/core'
import { OnboardingKitModule } from '@onboardkit/angular'

@Component({
  selector: 'app-onboarding',
  template: \`
    <onboarding-kit
      [apiKey]="apiKey"
      kitId="welcome-flow"
      theme="modern"
      (complete)="onComplete($event)"
      (step)="onStep($event)"
    ></onboarding-kit>
  \`
})
export class OnboardingComponent {
  apiKey = '${apiKey}'

  onComplete(data: any) {
    console.log('Onboarding completed:', data)
  }

  onStep(event: any) {
    console.log('Step completed:', event)
  }
}`
  }

  const iframeCode = `<iframe
  src="https://embed.onboardhero.com/kit/welcome-flow?key=${apiKey}&theme=modern"
  width="100%"
  height="600"
  frameborder="0"
  style="border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"
></iframe>`

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Code className="h-6 w-6 text-blue-600" />
            Embedded Onboarding SDK
          </h1>
          <p className="text-gray-600 mt-1">
            Seamlessly integrate Onboard Hero into any application with our comprehensive SDKs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <BookOpen className="h-4 w-4 mr-2" />
            Documentation
          </Button>
          <Button variant="outline" size="sm">
            <Github className="h-4 w-4 mr-2" />
            GitHub
          </Button>
        </div>
      </div>

      {/* SDK Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Downloads</p>
                <p className="text-2xl font-bold">154.5K</p>
              </div>
              <Download className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Active Integrations</p>
                <p className="text-2xl font-bold">2,847</p>
              </div>
              <Layers className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg. Load Time</p>
                <p className="text-2xl font-bold">1.2s</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Uptime</p>
                <p className="text-2xl font-bold">99.9%</p>
              </div>
              <Globe className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="frameworks" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="frameworks">SDK Frameworks</TabsTrigger>
          <TabsTrigger value="iframe">iFrame Embed</TabsTrigger>
          <TabsTrigger value="api">API Integration</TabsTrigger>
          <TabsTrigger value="examples">Live Examples</TabsTrigger>
        </TabsList>

        <TabsContent value="frameworks" className="space-y-6">
          {/* Framework Selection */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {frameworks.map((framework) => (
              <Card
                key={framework.id}
                className={`cursor-pointer transition-all ${
                  selectedFramework === framework.id
                    ? 'ring-2 ring-blue-500 bg-blue-50'
                    : 'hover:shadow-md'
                }`}
                onClick={() => setSelectedFramework(framework.id)}
              >
                <CardContent className="p-4">
                  <div className="text-center space-y-2">
                    <div className="text-3xl">{framework.icon}</div>
                    <h3 className="font-semibold">{framework.name}</h3>
                    <p className="text-xs text-gray-600">{framework.description}</p>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>v{framework.version}</span>
                      <span>{framework.size}</span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      {framework.downloads} downloads
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Installation Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Installation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400"># Install via npm</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(`npm install @onboardkit/${selectedFramework}`, 'install')}
                  >
                    {copied === 'install' ? '✓' : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <div>npm install @onboardkit/{selectedFramework}</div>
              </div>
            </CardContent>
          </Card>

          {/* Code Example */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Implementation Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-blue-400">
                    {frameworks.find(f => f.id === selectedFramework)?.name} Example
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(codeExamples[selectedFramework as keyof typeof codeExamples], 'code')}
                  >
                    {copied === 'code' ? '✓' : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap">
                  {codeExamples[selectedFramework as keyof typeof codeExamples]}
                </pre>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="iframe" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" />
                iFrame Embedding
              </CardTitle>
              <p className="text-sm text-gray-600">
                Embed Onboard Hero directly into any webpage without any JavaScript frameworks
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="kit-id">Kit ID</Label>
                  <Input id="kit-id" defaultValue="welcome-flow" />
                </div>
                <div>
                  <Label htmlFor="theme">Theme</Label>
                  <Input id="theme" defaultValue="modern" />
                </div>
              </div>

              <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-green-400"># iFrame Embed Code</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(iframeCode, 'iframe')}
                  >
                    {copied === 'iframe' ? '✓' : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
                <pre className="whitespace-pre-wrap">{iframeCode}</pre>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Smartphone className="h-4 w-4" />
                <span>Fully responsive and mobile-optimized</span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="api" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                API Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex gap-2">
                  <Input
                    id="api-key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="font-mono"
                  />
                  <Button
                    variant="outline"
                    onClick={() => copyToClipboard(apiKey, 'apikey')}
                  >
                    {copied === 'apikey' ? '✓' : <Copy className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-semibold text-blue-900 mb-2">API Endpoints</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <code className="bg-white px-2 py-1 rounded">GET /api/kits</code>
                    <span className="text-blue-600">List all kits</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-white px-2 py-1 rounded">POST /api/kits/{'{id}'}/start</code>
                    <span className="text-blue-600">Start onboarding</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-white px-2 py-1 rounded">PUT /api/kits/{'{id}'}/step</code>
                    <span className="text-blue-600">Update step data</span>
                  </div>
                  <div className="flex justify-between">
                    <code className="bg-white px-2 py-1 rounded">POST /api/kits/{'{id}'}/complete</code>
                    <span className="text-blue-600">Complete onboarding</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="examples" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-600" />
                  Live Demo - SaaS Onboarding
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-blue-500 to-purple-600 h-32 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="font-semibold">Welcome to SaaSApp</h3>
                    <p className="text-sm opacity-90">Complete your setup in 3 steps</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">React Integration</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-600" />
                  Live Demo - E-commerce Setup
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-green-500 to-teal-600 h-32 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="font-semibold">Store Setup Wizard</h3>
                    <p className="text-sm opacity-90">Get your store ready to sell</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Vue.js Integration</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-600" />
                  Live Demo - Financial Services
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-indigo-500 to-blue-600 h-32 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="font-semibold">Account Opening</h3>
                    <p className="text-sm opacity-90">Secure KYC and verification</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Vanilla JS</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Play className="h-5 w-5 text-green-600" />
                  Live Demo - Healthcare Portal
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gradient-to-r from-red-500 to-pink-600 h-32 rounded-lg flex items-center justify-center text-white">
                  <div className="text-center">
                    <h3 className="font-semibold">Patient Registration</h3>
                    <p className="text-sm opacity-90">HIPAA-compliant onboarding</p>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">Angular Integration</Badge>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    View Demo
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}