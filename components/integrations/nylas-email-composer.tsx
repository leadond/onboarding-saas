'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Send,
  Save,
  Eye,
  MousePointer,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from 'lucide-react'

interface NylasEmailComposerProps {
  accountId: string
}

interface EmailTemplate {
  id: string
  name: string
  subject: string
  body: string
  category: string
}

const emailTemplates: EmailTemplate[] = [
  {
    id: 'welcome',
    name: 'Welcome Email',
    subject: 'Welcome to Onboard Hero!',
    body: `<p>Hi {{client_name}},</p>
<p>Welcome to Onboard Hero! We're excited to help you streamline your onboarding process.</p>
<p>Here's what you can expect:</p>
<ul>
<li>Personalized onboarding journey</li>
<li>Real-time progress tracking</li>
<li>Automated follow-ups</li>
</ul>
<p>Best regards,<br>The Onboard Hero Team</p>`,
    category: 'onboarding',
  },
  {
    id: 'followup',
    name: 'Follow-up Email',
    subject: 'How are you progressing with your onboarding?',
    body: `<p>Hi {{client_name}},</p>
<p>I wanted to check in and see how you're progressing with your onboarding.</p>
<p>If you have any questions or need assistance, please don't hesitate to reach out.</p>
<p>Best regards,<br>{{sender_name}}</p>`,
    category: 'follow-up',
  },
  {
    id: 'reminder',
    name: 'Reminder Email',
    subject: 'Reminder: Complete your onboarding steps',
    body: `<p>Hi {{client_name}},</p>
<p>This is a friendly reminder that you have pending onboarding steps to complete.</p>
<p>Please log in to your dashboard to continue: <a href="{{dashboard_url}}">Continue Onboarding</a></p>
<p>Best regards,<br>The Onboard Hero Team</p>`,
    category: 'reminder',
  },
]

export function NylasEmailComposer({ accountId }: NylasEmailComposerProps) {
  const [to, setTo] = useState('')
  const [cc, setCc] = useState('')
  const [bcc, setBcc] = useState('')
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState<string>('')
  const [trackingEnabled, setTrackingEnabled] = useState(true)
  const [scheduledSend, setScheduledSend] = useState(false)
  const [scheduleTime, setScheduleTime] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState('')
  const [error, setError] = useState('')

  const handleTemplateSelect = (templateId: string) => {
    const template = emailTemplates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(templateId)
      setSubject(template.subject)
      setBody(template.body)
    }
  }

  const handleSend = async () => {
    if (!to || !subject || !body) {
      setError('Please fill in all required fields')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await fetch('/api/integrations/nylas/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          account_id: accountId,
          to,
          cc: cc || undefined,
          bcc: bcc || undefined,
          subject,
          body,
          tracking: trackingEnabled,
          scheduled_at: scheduledSend && scheduleTime ? new Date(scheduleTime).toISOString() : undefined,
        }),
      })

      const data = await response.json()
      if (data.success) {
        setSuccess('Email sent successfully!')
        // Reset form
        setTo('')
        setCc('')
        setBcc('')
        setSubject('')
        setBody('')
        setSelectedTemplate('')
      } else {
        setError(data.error || 'Failed to send email')
      }
    } catch (err) {
      setError('Network error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSaveDraft = async () => {
    setLoading(true)
    try {
      // Mock save draft functionality
      await new Promise(resolve => setTimeout(resolve, 1000))
      setSuccess('Draft saved successfully!')
    } catch (err) {
      setError('Failed to save draft')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Email Templates */}
      <Card>
        <CardHeader>
          <CardTitle>Email Templates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {emailTemplates.map((template) => (
              <div
                key={template.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedTemplate === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                onClick={() => handleTemplateSelect(template.id)}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium">{template.name}</h3>
                  <Badge variant="outline">{template.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{template.subject}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Email Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Send className="h-5 w-5" />
            Compose Email
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {success && (
            <Alert>
              <CheckCircle className="h-4 w-4" />
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="to">To *</Label>
              <Input
                id="to"
                type="email"
                placeholder="recipient@example.com"
                value={to}
                onChange={(e) => setTo(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="cc">CC</Label>
              <Input
                id="cc"
                type="email"
                placeholder="cc@example.com"
                value={cc}
                onChange={(e) => setCc(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bcc">BCC</Label>
              <Input
                id="bcc"
                type="email"
                placeholder="bcc@example.com"
                value={bcc}
                onChange={(e) => setBcc(e.target.value)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="subject">Subject *</Label>
            <Input
              id="subject"
              placeholder="Email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="body">Message *</Label>
            <Textarea
              id="body"
              placeholder="Write your message here..."
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
          </div>

          {/* Email Options */}
          <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium">Email Options</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="tracking">Enable Tracking</Label>
                <p className="text-sm text-muted-foreground">
                  Track opens, clicks, and replies
                </p>
              </div>
              <Switch
                id="tracking"
                checked={trackingEnabled}
                onCheckedChange={setTrackingEnabled}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="scheduled">Schedule Send</Label>
                <p className="text-sm text-muted-foreground">
                  Send email at a specific time
                </p>
              </div>
              <Switch
                id="scheduled"
                checked={scheduledSend}
                onCheckedChange={setScheduledSend}
              />
            </div>

            {scheduledSend && (
              <div>
                <Label htmlFor="schedule-time">Schedule Time</Label>
                <Input
                  id="schedule-time"
                  type="datetime-local"
                  value={scheduleTime}
                  onChange={(e) => setScheduleTime(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* Tracking Preview */}
          {trackingEnabled && (
            <div className="p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Tracking Features
              </h3>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-blue-600" />
                  <span>Open tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <MousePointer className="h-4 w-4 text-green-600" />
                  <span>Click tracking</span>
                </div>
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-purple-600" />
                  <span>Reply tracking</span>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleSend}
              disabled={loading || !to || !subject || !body}
              className="flex-1"
            >
              {loading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : scheduledSend ? (
                <Clock className="mr-2 h-4 w-4" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              {scheduledSend ? 'Schedule Send' : 'Send Email'}
            </Button>
            <Button
              onClick={handleSaveDraft}
              variant="outline"
              disabled={loading}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}