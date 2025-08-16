#!/usr/bin/env node

// OnboardKit NYLAS Webhook Setup Script
// This script sets up webhooks with NYLAS for real-time updates

async function setupNylasWebhooks() {
  console.log('🎣 OnboardKit NYLAS Webhook Setup');
  console.log('==================================');

  // Load environment variables
  require('dotenv').config({ path: '.env.production' });

  const apiKey = process.env.NYLAS_API_KEY;
  const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
  const webhookSecret = process.env.NYLAS_WEBHOOK_SECRET;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!apiKey || !appUrl) {
    console.error('❌ Missing required environment variables:');
    console.error('   NYLAS_API_KEY:', apiKey ? 'Present' : 'Missing');
    console.error('   NEXT_PUBLIC_APP_URL:', appUrl ? 'Present' : 'Missing');
    process.exit(1);
  }

  const webhookUrl = `${appUrl}/api/webhooks/nylas`;
  console.log(`🌐 Webhook URL: ${webhookUrl}`);
  console.log('');

  let webhooksCreated = 0;
  let webhooksSkipped = 0;

  // List existing webhooks first
  console.log('🔍 Checking existing webhooks...');
  try {
    const existingResponse = await fetch(`${apiUri}/v3/webhooks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (existingResponse.ok) {
      const existing = await existingResponse.json();
      console.log(`📊 Found ${existing.data?.length || 0} existing webhooks`);
      
      // Check if our webhook already exists
      const existingWebhook = existing.data?.find(w => 
        w.callback_url === webhookUrl || w.webhook_url === webhookUrl
      );
      
      if (existingWebhook) {
        console.log('✅ OnboardKit webhook already exists');
        console.log(`   ID: ${existingWebhook.id}`);
        console.log(`   Status: ${existingWebhook.status || 'active'}`);
        console.log(`   Triggers: ${existingWebhook.trigger_types?.length || 0} events`);
        webhooksSkipped = 1;
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not fetch existing webhooks:', error.message);
  }

  // Create webhook if it doesn't exist
  if (webhooksSkipped === 0) {
    console.log('🔨 Creating new webhook...');
    
    const webhookConfig = {
      webhook_url: webhookUrl,
      trigger_types: [
        'message.send_success',
        'message.send_failed', 
        'message.created',
        'message.updated',
        'message.opened',
        'message.link_clicked',
        'thread.replied',
        'account.connected',
        'account.running',
        'account.stopped',
        'account.invalid',
        'event.created',
        'event.updated',
        'event.deleted',
        'contact.created',
        'contact.updated'
      ],
      description: 'OnboardKit webhook for real-time updates',
      notification_email_addresses: [
        'admin@onboardkit.com'  // Replace with your email
      ]
    };

    // Add webhook secret if available
    if (webhookSecret) {
      webhookConfig.webhook_secret = webhookSecret;
    }

    try {
      const createResponse = await fetch(`${apiUri}/v3/webhooks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookConfig),
      });

      if (createResponse.ok) {
        const webhook = await createResponse.json();
        console.log('✅ Webhook created successfully!');
        console.log(`   ID: ${webhook.data?.id}`);
        console.log(`   URL: ${webhook.data?.webhook_url}`);
        console.log(`   Triggers: ${webhook.data?.trigger_types?.length || 0} events`);
        webhooksCreated = 1;
      } else {
        const error = await createResponse.text();
        console.error('❌ Failed to create webhook:', createResponse.status);
        console.error('   Error:', error);
      }
    } catch (error) {
      console.error('❌ Webhook creation failed:', error.message);
    }
  }

  // Test webhook endpoint
  console.log('');
  console.log('🧪 Testing webhook endpoint...');
  try {
    const testResponse = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Nylas-Signature': 'test-signature',
      },
      body: JSON.stringify({
        type: 'account.connected',
        data: {
          account_id: 'test-account',
          email: 'test@example.com',
          provider: 'gmail'
        }
      }),
    });

    if (testResponse.ok) {
      console.log('✅ Webhook endpoint is accessible');
    } else {
      console.log(`⚠️  Webhook endpoint returned status: ${testResponse.status}`);
    }
  } catch (error) {
    console.log('⚠️  Could not test webhook endpoint:', error.message);
    console.log('   This might be normal if running locally');
  }

  // Summary
  console.log('');
  console.log('📊 Webhook Setup Summary');
  console.log('=======================');
  console.log(`✅ Webhooks created: ${webhooksCreated}`);
  console.log(`⏭️  Webhooks skipped: ${webhooksSkipped}`);
  console.log(`🎯 Total active webhooks: ${webhooksCreated + webhooksSkipped}`);
  
  if (webhooksCreated > 0 || webhooksSkipped > 0) {
    console.log('');
    console.log('🎉 NYLAS WEBHOOKS CONFIGURED!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Test webhook delivery by triggering NYLAS events');
    console.log('   2. Monitor webhook events in your application logs');
    console.log('   3. Process webhook data for onboarding automation');
    console.log('');
    console.log('🔧 Available webhook triggers:');
    console.log('   • Email events (sent, received, opened, clicked)');
    console.log('   • Calendar events (created, updated, deleted)');
    console.log('   • Account status changes (connected, running, stopped)');
    console.log('   • Contact updates (created, modified)');
  } else {
    console.log('');
    console.log('❌ No webhooks were configured');
    console.log('   Please check your NYLAS credentials and try again');
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the setup
setupNylasWebhooks().catch((error) => {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
});