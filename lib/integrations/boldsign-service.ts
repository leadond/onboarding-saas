import axios from 'axios'

export interface BoldSignSigner {
  name: string
  emailAddress: string
  signerType: 'Signer' | 'Reviewer' | 'CC'
  signerRole?: string
  formFields?: any[]
  locale?: string
}

export interface BoldSignDocument {
  displayName: string
  documentOrder: number
}

export class BoldSignService {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey?: string, baseUrl?: string) {
    this.apiKey = apiKey || process.env.BOLDSIGN_API_KEY!
    this.baseUrl = baseUrl || process.env.BOLDSIGN_BASE_URL || 'https://api.boldsign.com'
  }

  private getHeaders() {
    return {
      'X-API-KEY': this.apiKey,
      'Content-Type': 'application/json'
    }
  }

  async sendDocumentForSignature(
    title: string,
    message: string,
    signers: BoldSignSigner[],
    documentContent: string,
    documentName: string
  ) {
    try {
      // Convert HTML content to PDF (simplified - in production, use proper HTML to PDF conversion)
      const documentBuffer = Buffer.from(documentContent, 'utf-8')

      const formData = new FormData()
      formData.append('Title', title)
      formData.append('Message', message)
      
      signers.forEach((signer, index) => {
        formData.append(`Signers[${index}].Name`, signer.name)
        formData.append(`Signers[${index}].EmailAddress`, signer.emailAddress)
        formData.append(`Signers[${index}].SignerType`, signer.signerType)
        if (signer.signerRole) {
          formData.append(`Signers[${index}].SignerRole`, signer.signerRole)
        }
      })

      formData.append('Files', new Blob([documentBuffer]), documentName)

      const response = await axios.post(
        `${this.baseUrl}/v1/document/send`,
        formData,
        {
          headers: {
            'X-API-KEY': this.apiKey,
            'Content-Type': 'multipart/form-data'
          }
        }
      )

      return {
        success: true,
        document_id: response.data.documentId,
        signers: response.data.signers
      }
    } catch (error) {
      console.error('BoldSign document send failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Document send failed'
      }
    }
  }

  async getDocumentStatus(documentId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/document/${documentId}`,
        { headers: this.getHeaders() }
      )

      return {
        success: true,
        status: response.data.status,
        signers: response.data.signers,
        completed_date: response.data.completedDate
      }
    } catch (error) {
      console.error('BoldSign status check failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Status check failed'
      }
    }
  }

  async downloadDocument(documentId: string) {
    try {
      const response = await axios.get(
        `${this.baseUrl}/v1/document/download/${documentId}`,
        { 
          headers: this.getHeaders(),
          responseType: 'arraybuffer'
        }
      )

      return {
        success: true,
        document: response.data
      }
    } catch (error) {
      console.error('BoldSign document download failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Document download failed'
      }
    }
  }

  async createEmbeddedSigningUrl(documentId: string, signerEmail: string) {
    try {
      const response = await axios.post(
        `${this.baseUrl}/v1/document/getEmbeddedSignLink`,
        {
          documentId,
          signerEmail,
          redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/onboarding/document-signed`
        },
        { headers: this.getHeaders() }
      )

      return {
        success: true,
        sign_url: response.data.signLink
      }
    } catch (error) {
      console.error('BoldSign embedded URL creation failed:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Embedded URL creation failed'
      }
    }
  }
}