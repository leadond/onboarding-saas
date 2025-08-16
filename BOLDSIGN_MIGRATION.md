# DocuSign to BoldSign Migration

This document outlines the changes made to migrate from DocuSign to BoldSign integration.

## 🔄 Changes Made

### 1. Environment Variables
**Updated `.env.local`:**
```bash
# OLD - DocuSign Configuration
DOCUSIGN_INTEGRATION_KEY=placeholder-integration-key
DOCUSIGN_USER_ID=placeholder-user-id
DOCUSIGN_ACCOUNT_ID=placeholder-account-id
DOCUSIGN_BASE_PATH=https://demo.docusign.net/restapi
DOCUSIGN_PRIVATE_KEY=placeholder-private-key

# NEW - BoldSign Configuration
BOLDSIGN_API_KEY=MjRhN2M0ZTUtNDQ5Zi00MDgzLWFjMDctNjY2ZDBmMzQ0Nzgz
BOLDSIGN_BASE_URL=https://api.boldsign.com
BOLDSIGN_WEBHOOK_SECRET=placeholder-webhook-secret
```

### 2. Dependencies
**Updated `package.json`:**
- Removed: `"docusign-esign": "^6.4.0"`
- Added: `"boldsign": "^1.0.4"` (Official BoldSign Node.js SDK)
- Added: `"axios": "^1.11.0"` (For additional HTTP requests if needed)

### 3. Client Library
**Renamed and Updated:**
- `lib/integrations/docusign-client.ts` → `lib/integrations/boldsign-client.ts`
- Updated all interfaces and methods to use BoldSign API
- Changed from DocuSign SDK to Axios HTTP client

### 4. API Routes
**Created new BoldSign routes:**
- `app/api/webhooks/boldsign/route.ts` - Webhook handler
- `app/api/integrations/boldsign/route.ts` - Integration API
- `app/api/boldsign/mock-signing/route.ts` - Mock signing page for development

### 5. Type Definitions
**Updated `types/index.ts`:**
- Changed webhook source from `'docusign'` to `'boldsign'`
- Added `BoldSignWebhookEvent` interface
- Added `WebhookProcessingResult` interface

## 🔧 BoldSign API Integration

### Key Methods Available:
1. **`createDocumentFromTemplate()`** - Create document from template
2. **`createDocumentFromFile()`** - Create document from PDF file (like your example)
3. **`getDocumentStatus()`** - Get document status
4. **`getEmbeddedSigningUrl()`** - Get embedded signing URL
5. **`listTemplates()`** - List available templates
6. **`processWebhookEvent()`** - Process webhook events

### Webhook Events Supported:
- `DocumentCompleted` - Document fully signed
- `DocumentSigned` - Document signed by a signer
- `DocumentDeclined` - Document declined by a signer

## 🚀 Usage Examples

### Creating a Document from Template:
```typescript
import { boldSignClient } from '@/lib/integrations/boldsign-client'

const document = await boldSignClient.createDocumentFromTemplate({
  templateId: 'template-123',
  recipientName: 'John Doe',
  recipientEmail: 'john@example.com',
  customFields: {
    clientName: 'John Doe',
    serviceDate: '2024-01-15'
  },
  returnUrl: 'https://yourapp.com/signing-complete'
})
```

### Creating a Document from File (Your Example):
```typescript
import { boldSignClient } from '@/lib/integrations/boldsign-client'

const document = await boldSignClient.createDocumentFromFile(
  'path/to/agreement.pdf',
  {
    name: 'David',
    email: 'david@cubeflakes.com',
    customFields: {
      companyName: 'Cubeflakes',
      agreementDate: '2024-01-15'
    }
  }
)
```

### Getting Signing URL:
```typescript
const signingUrl = await boldSignClient.getEmbeddedSigningUrl(documentId, {
  userName: 'John Doe',
  email: 'john@example.com',
  returnUrl: 'https://yourapp.com/signing-complete'
})
```

## 🔐 Security

### Webhook Verification:
BoldSign webhooks are verified using HMAC-SHA256 signature validation:
- Header: `x-boldsign-signature`
- Format: `sha256=<hash>`
- Secret: `BOLDSIGN_WEBHOOK_SECRET`

## 📋 Required BoldSign Webhook Events

Configure these webhook events in your BoldSign dashboard:
1. **DocumentCompleted** - When all signers complete signing
2. **DocumentSigned** - When a signer signs the document
3. **DocumentDeclined** - When a signer declines to sign

**Webhook URL:** `https://your-domain.com/api/webhooks/boldsign`

## 🧪 Development Mode

In development mode (`NODE_ENV === 'development`):
- Mock responses are returned instead of actual API calls
- Mock signing page available at `/api/boldsign/mock-signing`
- All operations are logged to the database for testing

## ✅ Migration Checklist

- [x] Update environment variables
- [x] Replace DocuSign dependency with Axios
- [x] Migrate client library to BoldSign API
- [x] Create BoldSign webhook handler
- [x] Create BoldSign integration API routes
- [x] Update TypeScript types
- [x] Create mock signing interface for development
- [x] Create usage examples (`examples/boldsign-usage.ts`)
- [ ] Update BoldSign webhook secret in production
- [ ] Configure BoldSign webhook endpoints
- [ ] Test document creation and signing flow
- [ ] Update any UI components that reference DocuSign

## 🔗 BoldSign Resources

- [BoldSign API Documentation](https://developers.boldsign.com/)
- [BoldSign Node.js SDK](https://github.com/boldsign/boldsign-node-sdk)
- [BoldSign Webhook Documentation](https://developers.boldsign.com/webhooks/introduction)