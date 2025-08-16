import { boldSignClient } from '@/lib/integrations/boldsign-client'

// Example: Create document from template
export async function createDocumentFromTemplate() {
  try {
    const document = await boldSignClient.createDocumentFromTemplate(
      'template-123',
      {
        title: 'Client Onboarding Agreement',
        signers: [
          {
            name: 'John Doe',
            email: 'john@example.com',
            role: 'Client',
          },
        ],
      }
    )

    console.log('Document created:', document)
    return document
  } catch (error) {
    console.error('Failed to create document:', error)
    throw error
  }
}

// Example: Get document status
export async function getDocumentStatus(documentId: string) {
  try {
    const status = await boldSignClient.getDocumentStatus(documentId)
    console.log('Document status:', status)
    return status
  } catch (error) {
    console.error('Failed to get document status:', error)
    throw error
  }
}

// Example: Send reminder
export async function sendReminder(documentId: string, signerEmail: string) {
  try {
    await boldSignClient.sendReminder(documentId, signerEmail)
    console.log('Reminder sent successfully')
  } catch (error) {
    console.error('Failed to send reminder:', error)
    throw error
  }
}
