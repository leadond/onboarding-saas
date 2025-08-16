'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2, FileText, CheckCircle, AlertCircle, Clock } from 'lucide-react'
import {
  boldSignClient,
  type ContractSigningData,
  type BoldSignEnvelope,
} from '@/lib/integrations/boldsign-client'

interface ContractStepProps {
  stepData: any
  clientData: any
  onComplete: (data: any) => void
  onUpdate: (data: any) => void
}

export function ContractStep({ stepData, clientData, onComplete, onUpdate }: ContractStepProps) {
  const [envelope, setEnvelope] = useState<BoldSignEnvelope | null>(null)
  const [signingUrl, setSigningUrl] = useState<string>('')
  const [signatureStatus, setSignatureStatus] = useState<string>('pending')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    if (stepData.envelope_id) {
      checkSignatureStatus()
    }
  }, [stepData.envelope_id])

  const checkSignatureStatus = async () => {
    if (!stepData.envelope_id) return

    try {
      const status = await boldSignClient.getDocumentStatus(stepData.envelope_id)
      setSignatureStatus(status)
      
      if (status === 'completed') {
        const mockEnvelope: BoldSignEnvelope = {
          documentId: stepData.envelope_id,
          status: 'completed',
          signers: [{
            email: clientData.email,
            status: 'signed',
            signedAt: new Date().toISOString(),
          }],
          createdAt: stepData.created_at || new Date().toISOString(),
          completedAt: new Date().toISOString(),
        }
        setEnvelope(mockEnvelope)
        await handleSignatureCompleted(mockEnvelope)
        setSignatureStatus(status)
      }
    } catch (error) {
      console.error('Error checking signature status:', error)
      setError('Failed to check signature status')
    }
  }

  const handleSignatureCompleted = async (completedEnvelope: BoldSignEnvelope) => {
    const completionData = {
      envelope_id: completedEnvelope.documentId,
      signed_at: completedEnvelope.completedAt,
      signer_email: clientData.email,
      status: 'completed'
    }

    onUpdate(completionData)
    onComplete(completionData)
  }

  const initiateContract = async () => {
    setLoading(true)
    setError('')

    try {
      const signingData: ContractSigningData = {
        templateId: stepData.template_id || 'template-1',
        title: stepData.contract_title || 'Client Agreement',
        recipientName: clientData.name || 'Client',
        recipientEmail: clientData.email,
        returnUrl: window.location.href,
        signers: [{
          name: clientData.name || 'Client',
          email: clientData.email,
          role: 'Client',
        }],
        customFields: {
          client_name: clientData.name,
          company_name: clientData.company || '',
          date: new Date().toLocaleDateString(),
        },
        metadata: {
          kit_id: stepData.kit_id,
          step_id: stepData.id,
          client_id: clientData.id,
        }
      }

      const newDocument = await boldSignClient.createDocumentFromTemplate(
        signingData.templateId,
        signingData
      )

      const mockEnvelope: BoldSignEnvelope = {
        documentId: newDocument.documentId || newDocument.id,
        status: 'sent',
        signers: signingData.signers.map(signer => ({
          email: signer.email,
          status: 'pending',
        })),
        createdAt: new Date().toISOString(),
      }

      setEnvelope(mockEnvelope)

      const recipientView = await boldSignClient.getRecipientViewUrl(
        mockEnvelope.documentId,
        signingData.recipientEmail || clientData.email,
        {
          userName: signingData.recipientName,
          email: signingData.recipientEmail,
          returnUrl: signingData.returnUrl || window.location.href,
        }
      )

      setSigningUrl(recipientView)

      const updateData = {
        envelope_id: mockEnvelope.documentId,
        signing_url: recipientView,
        status: 'sent',
        created_at: new Date().toISOString(),
      }

      onUpdate(updateData)
    } catch (error) {
      console.error('Error initiating contract:', error)
      setError('Failed to initiate contract signing')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = () => {
    switch (signatureStatus) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'sent':
        return <FileText className="h-5 w-5 text-blue-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusColor = () => {
    switch (signatureStatus) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'sent':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Contract Signing
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="contract-title">Contract Title</Label>
            <Input
              id="contract-title"
              value={stepData.contract_title || 'Client Agreement'}
              readOnly
            />
          </div>

          <div>
            <Label htmlFor="client-info">Client Information</Label>
            <Textarea
              id="client-info"
              value={`Name: ${clientData.name || 'N/A'}\nEmail: ${clientData.email || 'N/A'}\nCompany: ${clientData.company || 'N/A'}`}
              readOnly
              rows={3}
            />
          </div>
        </div>

        {envelope && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {getStatusIcon()}
                <div>
                  <p className="font-medium">Contract Status</p>
                  <p className="text-sm text-muted-foreground">
                    Document ID: {envelope.documentId}
                  </p>
                </div>
              </div>
              <Badge className={getStatusColor()}>
                {signatureStatus.charAt(0).toUpperCase() + signatureStatus.slice(1)}
              </Badge>
            </div>

            {envelope.completedAt && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-800">
                  <strong>Completed:</strong> {new Date(envelope.completedAt).toLocaleString()}
                </p>
              </div>
            )}

            {signingUrl && signatureStatus !== 'completed' && (
              <div className="space-y-2">
                <Label>Signing URL</Label>
                <div className="flex gap-2">
                  <Input value={signingUrl} readOnly />
                  <Button
                    variant="outline"
                    onClick={() => window.open(signingUrl, '_blank')}
                  >
                    Open
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex gap-2">
          {!envelope ? (
            <Button
              onClick={initiateContract}
              disabled={loading || !clientData.email}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Send Contract for Signing
            </Button>
          ) : (
            <Button
              onClick={checkSignatureStatus}
              variant="outline"
              disabled={loading}
              className="flex-1"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Check Status
            </Button>
          )}
        </div>

        {signatureStatus === 'completed' && (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Contract has been successfully signed and completed!
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}
