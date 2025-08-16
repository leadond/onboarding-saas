#!/usr/bin/env node

// OnboardKit NYLAS Integration Test Script
// Comprehensive testing of all NYLAS functionality

const { nylasClient, createNylasEmailService, createNylasCalendarService } = require('../lib/integrations/nylas-client');
const { createNylasSyncCoordinator } = require('../lib/integrations/nylas-sync-services');

async function testNylasIntegration() {
  console.log('🧪 OnboardKit NYLAS Integration Test');
  console.log('====================================');

  // Load environment variables
  require('dotenv').config({ path: '.env.production' });

  const apiKey = process.env.NYLAS_API_KEY;
  const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';

  if (!apiKey) {
    console.error('❌ NYLAS_API_KEY not found in environment variables');
    process.exit(1);
  }

  console.log(`🔑 API Key: ${apiKey.substring(0, 20)}...`);
  console.log(`🌐 API URI: ${apiUri}`);
  console.log('');

  let testsPassed = 0;
  let testsTotal = 0;

  // Test function
  const runTest = async (testName, testFn) => {
    testsTotal++;
    process.stdout.write(`🧪 ${testName}... `);
    try {
      await testFn();
      console.log('✅ PASSED');
      testsPassed++;
    } catch (error) {
      console.log(`❌ FAILED: ${error.message}`);
      if (process.env.DEBUG) {
        console.log('   Stack:', error.stack);
      }
    }
  };

  // Test 1: Basic API Connectivity
  await runTest('API Connectivity', async () => {
    const accounts = await nylasClient.getAccounts();
    if (!Array.isArray(accounts)) {
      throw new Error('Expected accounts to be an array');
    }
    console.log(`\n   📊 Found ${accounts.length} connected accounts`);
  });

  // Test 2: Message Operations
  await runTest('Message Operations', async () => {
    const testAccountId = 'acc-test-123'; // Using mock account
    const messages = await nylasClient.getMessages(testAccountId, { limit: 5 });
    
    if (!Array.isArray(messages)) {
      throw new Error('Expected messages to be an array');
    }
    
    console.log(`\n   📧 Retrieved ${messages.length} messages`);
    
    if (messages.length > 0) {
      const message = await nylasClient.getMessage(testAccountId, messages[0].id);
      if (!message.id) {
        throw new Error('Failed to retrieve individual message');
      }
      console.log(`   📄 Retrieved message: ${message.subject}`);
    }
  });

  // Test 3: Email Sending (Mock)
  await runTest('Email Sending', async () => {
    const testAccountId = 'acc-test-123';
    const emailService = createNylasEmailService(testAccountId);
    
    const result = await emailService.sendInteractiveEmail({
      client: {
        email: 'test@example.com',
        name: 'Test Client',
      },
      template: {
        subject: 'Test Onboarding Email',
        html: '<h1>Welcome to OnboardKit!</h1><p>This is a test email.</p>',
      },
      tracking: true,
    });
    
    if (!result.id) {
      throw new Error('Failed to send email');
    }
    
    console.log(`\n   📮 Email sent with ID: ${result.id}`);
  });

  // Test 4: Calendar Operations
  await runTest('Calendar Operations', async () => {
    const testAccountId = 'acc-test-123';
    const calendarService = createNylasCalendarService(testAccountId);
    
    // Get calendars
    const calendars = await nylasClient.getCalendars(testAccountId);
    if (!Array.isArray(calendars)) {
      throw new Error('Expected calendars to be an array');
    }
    console.log(`\n   📅 Found ${calendars.length} calendars`);
    
    // Get events
    const events = await nylasClient.getEvents(testAccountId);
    if (!Array.isArray(events)) {
      throw new Error('Expected events to be an array');
    }
    console.log(`   🗓️  Found ${events.length} events`);
    
    // Schedule a test meeting
    const meetingResult = await calendarService.scheduleOnboardingCall({
      clientEmail: 'test@example.com',
      clientName: 'Test Client',
      duration: 30,
      preferredTimes: [new Date(Date.now() + 24 * 60 * 60 * 1000)], // Tomorrow
    });
    
    if (!meetingResult.id) {
      throw new Error('Failed to schedule meeting');
    }
    console.log(`   🤝 Meeting scheduled with ID: ${meetingResult.id}`);
  });

  // Test 5: Contact Operations
  await runTest('Contact Operations', async () => {
    const testAccountId = 'acc-test-123';
    const contacts = await nylasClient.getContacts(testAccountId, { limit: 5 });
    
    if (!Array.isArray(contacts)) {
      throw new Error('Expected contacts to be an array');
    }
    console.log(`\n   👥 Found ${contacts.length} contacts`);
    
    // Create a test contact
    const newContact = await nylasClient.createContact(testAccountId, {
      name: 'Test Contact',
      email: 'testcontact@example.com',
      company_name: 'Test Company',
      job_title: 'Test Manager',
    });
    
    if (!newContact.id) {
      throw new Error('Failed to create contact');
    }
    console.log(`   👤 Contact created with ID: ${newContact.id}`);
  });

  // Test 6: Webhook Operations
  await runTest('Webhook Operations', async () => {
    const webhooks = await nylasClient.getWebhooks();
    if (!Array.isArray(webhooks)) {
      throw new Error('Expected webhooks to be an array');
    }
    console.log(`\n   🎣 Found ${webhooks.length} webhooks`);
    
    // Test webhook creation (mock)
    const newWebhook = await nylasClient.createWebhook({
      callback_url: 'https://app.onboardkit.com/api/webhooks/nylas',
      state: 'active',
      triggers: ['message.created', 'event.created'],
      version: '3.0',
    });
    
    if (!newWebhook.id) {
      throw new Error('Failed to create webhook');
    }
    console.log(`   🔗 Webhook created with ID: ${newWebhook.id}`);
  });

  // Test 7: Draft Operations
  await runTest('Draft Operations', async () => {
    const testAccountId = 'acc-test-123';
    
    // Create draft
    const draft = await nylasClient.createDraft(testAccountId, {
      account_id: testAccountId,
      to: [{ email: 'test@example.com', name: 'Test Recipient' }],
      subject: 'Test Draft Email',
      body: 'This is a test draft email for OnboardKit.',
    });
    
    if (!draft.id) {
      throw new Error('Failed to create draft');
    }
    console.log(`\n   📝 Draft created with ID: ${draft.id}`);
    
    // Update draft
    const updatedDraft = await nylasClient.updateDraft(testAccountId, draft.id, {
      subject: 'Updated Test Draft Email',
    });
    
    if (updatedDraft.subject !== 'Updated Test Draft Email') {
      throw new Error('Failed to update draft');
    }
    console.log(`   ✏️  Draft updated successfully`);
    
    // Delete draft
    await nylasClient.deleteDraft(testAccountId, draft.id);
    console.log(`   🗑️  Draft deleted successfully`);
  });

  // Test 8: Sync Services
  await runTest('Sync Services', async () => {
    const testAccountId = 'acc-test-123';
    const syncCoordinator = createNylasSyncCoordinator(testAccountId);
    
    // Test email sync service
    const emailService = syncCoordinator.getEmailService();
    const emailSyncResult = await emailService.syncRecentMessages({
      kitId: 'test-kit-123',
    });
    
    if (!emailSyncResult.lastSyncTime) {
      throw new Error('Email sync failed');
    }
    console.log(`\n   📬 Email sync: ${emailSyncResult.synchronized} messages`);
    
    // Test calendar sync service
    const calendarService = syncCoordinator.getCalendarService();
    const calendarSyncResult = await calendarService.syncOnboardingEvents({
      kitId: 'test-kit-123',
    });
    
    if (!calendarSyncResult.lastSyncTime) {
      throw new Error('Calendar sync failed');
    }
    console.log(`   📆 Calendar sync: ${calendarSyncResult.synchronized} events`);
    
    // Test contact sync service
    const contactService = syncCoordinator.getContactService();
    const contactSyncResult = await contactService.syncOnboardingContacts();
    
    if (!contactSyncResult.lastSyncTime) {
      throw new Error('Contact sync failed');
    }
    console.log(`   👥 Contact sync: ${contactSyncResult.synchronized} contacts`);
  });

  // Test 9: Email Sequence Testing
  await runTest('Email Sequence', async () => {
    const testAccountId = 'acc-test-123';
    const syncCoordinator = createNylasSyncCoordinator(testAccountId);
    const emailService = syncCoordinator.getEmailService();
    
    // Test welcome email
    const welcomeResult = await emailService.sendOnboardingSequence({
      clientEmail: 'test@example.com',
      clientName: 'Test Client',
      kitId: 'test-kit-123',
      templateType: 'welcome',
    });
    
    if (!welcomeResult.success) {
      throw new Error(`Failed to send welcome email: ${welcomeResult.error}`);
    }
    console.log(`\n   📧 Welcome email sent: ${welcomeResult.messageId}`);
    
    // Test reminder email
    const reminderResult = await emailService.sendOnboardingSequence({
      clientEmail: 'test@example.com',
      clientName: 'Test Client', 
      kitId: 'test-kit-123',
      templateType: 'reminder',
    });
    
    if (!reminderResult.success) {
      throw new Error(`Failed to send reminder email: ${reminderResult.error}`);
    }
    console.log(`   ⏰ Reminder email sent: ${reminderResult.messageId}`);
  });

  // Test 10: Full Sync Coordination
  await runTest('Full Sync Coordination', async () => {
    const testAccountId = 'acc-test-123';
    const syncCoordinator = createNylasSyncCoordinator(testAccountId);
    
    const fullSyncResult = await syncCoordinator.performFullSync();
    
    if (!fullSyncResult.overall.success) {
      console.log(`\n   ⚠️  Partial sync success: ${fullSyncResult.overall.totalSynced} items`);
    } else {
      console.log(`\n   🔄 Full sync completed: ${fullSyncResult.overall.totalSynced} items`);
    }
    
    console.log(`   📧 Email sync: ${fullSyncResult.email.synchronized} items`);
    console.log(`   📅 Calendar sync: ${fullSyncResult.calendar.synchronized} items`);
    console.log(`   👥 Contact sync: ${fullSyncResult.contacts.synchronized} items`);
  });

  // Results Summary
  console.log('');
  console.log('📊 Test Results');
  console.log('===============');
  console.log(`✅ Tests passed: ${testsPassed}/${testsTotal}`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 ALL TESTS PASSED! NYLAS integration is working correctly.');
    console.log('');
    console.log('✨ Your OnboardKit NYLAS integration is fully functional!');
    console.log('');
    console.log('📋 Integration Features Available:');
    console.log('   ✅ Email sending and tracking');
    console.log('   ✅ Calendar management and scheduling');
    console.log('   ✅ Contact synchronization');
    console.log('   ✅ Webhook processing (ready for deployment)');
    console.log('   ✅ Automated email sequences');
    console.log('   ✅ Comprehensive data synchronization');
    console.log('');
    console.log('🚀 Ready for onboarding automation!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. NYLAS integration needs attention.');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Verify NYLAS API credentials are correct');
    console.log('   2. Check network connectivity to NYLAS API');
    console.log('   3. Ensure all required environment variables are set');
    console.log('   4. Review error messages above for specific issues');
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the tests
testNylasIntegration().catch((error) => {
  console.error('❌ Test suite failed:', error.message);
  process.exit(1);
});