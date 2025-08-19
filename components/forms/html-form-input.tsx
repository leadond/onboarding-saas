'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { JsonEditor } from '@/components/ui/json-editor'
import { Upload, Download, FileText, Code } from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import type { HtmlForm } from '@/types'

interface HtmlFormInputProps {
  value?: HtmlForm
  onChange: (htmlForm: HtmlForm) => void
  className?: string
}

export function HtmlFormInput({ value, onChange, className }: HtmlFormInputProps) {
  const [activeTab, setActiveTab] = React.useState('html')
  const [htmlForm, setHtmlForm] = React.useState<HtmlForm>(
    value || {
      html_content: '',
      css_content: '',
      submit_button_text: 'Submit',
      field_mappings: {},
    }
  )

  const updateHtmlForm = (updates: Partial<HtmlForm>) => {
    const newHtmlForm = { ...htmlForm, ...updates }
    setHtmlForm(newHtmlForm)
    onChange(newHtmlForm)
  }

  const handleHtmlContentChange = (content: string) => {
    updateHtmlForm({ html_content: content })
  }

  const handleCssContentChange = (content: string) => {
    updateHtmlForm({ css_content: content })
  }

  const handleFieldMappingsChange = (mappings: Record<string, string>) => {
    updateHtmlForm({ field_mappings: mappings })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const fileType = file.name.toLowerCase()
    
    try {
      const content = await file.text()
      
      if (fileType.endsWith('.html')) {
        handleHtmlContentChange(content)
      } else if (fileType.endsWith('.css')) {
        handleCssContentChange(content)
      }
    } catch (error) {
      console.error('Error reading file:', error)
    }
  }

  const downloadHtml = () => {
    const blob = new Blob([htmlForm.html_content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'form.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const downloadCss = () => {
    if (!htmlForm.css_content) return
    
    const blob = new Blob([htmlForm.css_content], { type: 'text/css' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'form-styles.css'
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Code className="h-5 w-5" />
            <span>HTML Form Configuration</span>
          </CardTitle>
          <CardDescription>
            Configure your custom HTML form for client intake. You can write HTML directly or upload an existing HTML file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="html">HTML Content</TabsTrigger>
              <TabsTrigger value="css">CSS Styles</TabsTrigger>
              <TabsTrigger value="mappings">Field Mappings</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="html" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="html_content">HTML Form Content</Label>
                <div className="flex space-x-2">
                  <div>
                    <input
                      type="file"
                      accept=".html"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="html-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('html-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload HTML
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadHtml}
                    disabled={!htmlForm.html_content}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                id="html_content"
                value={htmlForm.html_content}
                onChange={(e) => handleHtmlContentChange(e.target.value)}
                placeholder={`<div class="form-container">
  <h2>Client Information</h2>
  <div class="form-group">
    <label for="name">Name</label>
    <input type="text" id="name" name="name" required>
  </div>
  <div class="form-group">
    <label for="email">Email</label>
    <input type="email" id="email" name="email" required>
  </div>
</div>`}
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500">
                Enter your HTML form code. The form will be rendered to clients going through the onboarding process.
                Note: Form tags will be automatically handled by the system.
              </p>
            </TabsContent>

            <TabsContent value="css" className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="css_content">CSS Styles (Optional)</Label>
                <div className="flex space-x-2">
                  <div>
                    <input
                      type="file"
                      accept=".css"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="css-upload"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => document.getElementById('css-upload')?.click()}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload CSS
                    </Button>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={downloadCss}
                    disabled={!htmlForm.css_content}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
              <Textarea
                id="css_content"
                value={htmlForm.css_content || ''}
                onChange={(e) => handleCssContentChange(e.target.value)}
                placeholder={`.form-container {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

.form-group input,
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}`}
                rows={15}
                className="font-mono text-sm"
              />
              <p className="text-sm text-gray-500">
                Add custom CSS styles to customize the appearance of your form. This is optional.
              </p>
            </TabsContent>

            <TabsContent value="mappings" className="space-y-4">
              <div>
                <Label htmlFor="field_mappings">Field Mappings (Optional)</Label>
                <p className="text-sm text-gray-500 mb-4">
                  Map HTML form field names to standardized field names for better data organization.
                </p>
                <JsonEditor
                  value={htmlForm.field_mappings || {}}
                  onChange={handleFieldMappingsChange}
                  height="300px"
                  placeholder={`{
  "client_name": "name",
  "client_email": "email",
  "project_description": "description",
  "budget_range": "budget"
}`}
                />
              </div>
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Example Field Mappings</h4>
                <pre className="text-sm text-blue-800 overflow-x-auto">
{`{
  "client_name": "name",
  "client_email": "email", 
  "client_phone": "phone",
  "project_type": "projectType",
  "project_description": "description",
  "budget_range": "budget"
}`}
                </pre>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-4">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="submit_button_text">Submit Button Text</Label>
                  <Input
                    id="submit_button_text"
                    value={htmlForm.submit_button_text || 'Submit'}
                    onChange={(e) => updateHtmlForm({ submit_button_text: e.target.value })}
                    placeholder="Submit"
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Customize the text that appears on the submit button.
                  </p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>HTML Form Template</span>
          </CardTitle>
          <CardDescription>
            Use this template as a starting point for your HTML form
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium">Client Intake Form Template</h4>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  handleHtmlContentChange(`<div class="client-intake-form">
  <h2>Project Information</h2>
  
  <div class="form-group">
    <label for="client_name">Full Name *</label>
    <input type="text" id="client_name" name="client_name" required>
  </div>
  
  <div class="form-group">
    <label for="client_email">Email Address *</label>
    <input type="email" id="client_email" name="client_email" required>
  </div>
  
  <div class="form-group">
    <label for="client_phone">Phone Number</label>
    <input type="tel" id="client_phone" name="client_phone">
  </div>
  
  <div class="form-group">
    <label for="company_name">Company Name</label>
    <input type="text" id="company_name" name="company_name">
  </div>
  
  <h3>Project Details</h3>
  
  <div class="form-group">
    <label for="project_type">Project Type *</label>
    <select id="project_type" name="project_type" required>
      <option value="">Select a project type</option>
      <option value="website">Website</option>
      <option value="web_application">Web Application</option>
      <option value="mobile_app">Mobile Application</option>
      <option value="ecommerce">E-commerce Platform</option>
      <option value="other">Other</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="project_description">Project Description *</label>
    <textarea id="project_description" name="project_description" rows="5" required placeholder="Please describe your project in detail..."></textarea>
  </div>
  
  <div class="form-group">
    <label for="budget_range">Budget Range</label>
    <select id="budget_range" name="budget_range">
      <option value="">Select budget range</option>
      <option value="under_5k">Under $5,000</option>
      <option value="5k_10k">$5,000 - $10,000</option>
      <option value="10k_25k">$10,000 - $25,000</option>
      <option value="25k_50k">$25,000 - $50,000</option>
      <option value="over_50k">Over $50,000</option>
    </select>
  </div>
  
  <div class="form-group">
    <label for="timeline">Project Timeline</label>
    <input type="text" id="timeline" name="timeline" placeholder="e.g., 3 months, by end of year, etc.">
  </div>
</div>`)
                  handleCssContentChange(`.client-intake-form {
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

.client-intake-form h2 {
  color: #333;
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}

.client-intake-form h3 {
  color: #555;
  margin-top: 30px;
  margin-bottom: 15px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #333;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="tel"],
.form-group select,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
  box-sizing: border-box;
}

.form-group input:focus,
.form-group select:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}`)
                  handleFieldMappingsChange({
                    "client_name": "name",
                    "client_email": "email",
                    "client_phone": "phone",
                    "company_name": "company",
                    "project_type": "projectType",
                    "project_description": "description",
                    "budget_range": "budget",
                    "timeline": "timeline"
                  })
                }}
              >
                Use Template
              </Button>
            </div>
            <p className="text-sm text-gray-600">
              This template includes common fields for client intake forms. You can customize it to fit your specific needs.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}