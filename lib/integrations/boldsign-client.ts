// BoldSign Integration Client for Onboard Hero
// Provides document signing capabilities with mock implementation for development

export interface BoldSignConfig {
  apiKey: string
  baseUrl: string
}

export interface Document {
  id: string
  title: string
  status: string
  created_at: string
  documentId?: string
}

export interface Signer {
  name: string
  email: string
  role: string
}

// Mock BoldSign client for development
export class MockBoldSignClient {
  private config: BoldSignConfig

  constructor(config: BoldSignConfig) {
    this.config = config
  }

  // Create document from template
  async createDocumentFromTemplate(templateId: string, data: any): Promise<Document> {
    // Mock document creation
    return {
      id: `doc-${Date.now()}`,
      documentId: `doc-${Date.now()}`,
      title: data.title || 'Untitled Document',
      status: 'draft',
      created_at: new Date().toISOString(),
    }
  }

  // Get document status
  async getDocumentStatus(documentId: string): Promise<string> {
    // Mock status check
    return 'pending'
  }

  // Send document for signing
  async sendForSigning(documentId: string, signers: Signer[]): Promise<boolean> {
    // Mock sending
    console.log(`Mock: Sending document ${documentId} to signers:`, signers)
    return true
  }

  // Get recipient view URL
  async getRecipientViewUrl(documentId: string, signerEmail: string, options: any = {}): Promise<string> {
    // Mock recipient view URL
    return `https://app.boldsign.com/sign/${documentId}?email=${encodeURIComponent(signerEmail)}&token=mock-token`
  }

  // Get embedded signing URL
  async getEmbeddedSigningUrl(documentId: string, options: any): Promise<string> {
    // Mock embedded signing URL
    return `https://app.boldsign.com/embed/sign/${documentId}?token=mock-token`
  }

  // Send reminder
  async sendReminder(documentId: string, signerEmail: string): Promise<void> {
    // Mock reminder
    console.log(`Mock: Sending reminder for document ${documentId} to ${signerEmail}`)
  }

  // Process webhook event
  async processWebhookEvent(event: any): Promise<void> {
    // Mock webhook processing
    console.log('Mock: Processing webhook event:', event)
  }

  // Delete document
  async deleteDocument(documentId: string): Promise<boolean> {
    // Mock document deletion
    console.log(`Mock: Deleting document ${documentId}`)
    return true
  }

  // List templates
  async listTemplates(): Promise<any[]> {
    // Mock templates list
    return [
      {
        id: 'template-1',
        name: 'Client Onboarding Agreement',
        description: 'Standard client onboarding contract',
        created_at: new Date().toISOString(),
      },
      {
        id: 'template-2',
        name: 'Service Agreement',
        description: 'Service level agreement template',
        created_at: new Date().toISOString(),
      },
    ]
  }

  // Create document from file
  async createDocumentFromFile(filePath: string, options: any): Promise<Document> {
    // Mock document creation from file
    return {
      id: `doc-file-${Date.now()}`,
      documentId: `doc-file-${Date.now()}`,
      title: options.title || 'Document from File',
      status: 'draft',
      created_at: new Date().toISOString(),
    }
  }
}

// Real BoldSign client (would be implemented for production)
export class BoldSignClient extends MockBoldSignClient {
  // In production, this would implement actual BoldSign API calls
  // For now, it extends the mock client
}

// Factory function to create client
export function createBoldSignClient(config: BoldSignConfig): MockBoldSignClient {
  // In development, always return mock client
  if (process.env.NODE_ENV === 'development' || !config.apiKey.startsWith('real-')) {
    return new MockBoldSignClient(config)
  }
  
  // In production with real API key, return real client
  return new BoldSignClient(config)
}

// Default client instance
export const boldSignClient = createBoldSignClient({
  apiKey: process.env.BOLDSIGN_API_KEY || 'mock-api-key',
  baseUrl: process.env.BOLDSIGN_BASE_URL || 'https://api.boldsign.com',
})

// Additional types for contract step
export interface ContractSigningData {
  templateId: string
  signers: Array<{
    name: string
    email: string
    role: string
  }>
  title: string
  recipientName?: string
  recipientEmail?: string
  returnUrl?: string
  metadata?: Record<string, any>
  customFields?: Record<string, any>}

export interface BoldSignEnvelope {
  documentId: string
  status: string
  signers: Array<{
    email: string
    status: string
    signedAt?: string
  }>
  createdAt: string
  completedAt?: string
  completedDateTime?: string
}
