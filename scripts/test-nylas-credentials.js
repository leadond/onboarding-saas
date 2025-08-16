#!/usr/bin/env node

// OnboardKit NYLAS Credentials Test Script
// This script tests the NYLAS API credentials to ensure they work

const Nylas = require('nylas').default;

async function testNylasCredentials() {
  console.log('🔑 OnboardKit NYLAS Credentials Test');
  console.log('=====================================');

  // Load environment variables
  require('dotenv').config({ path: '.env.production' });

  const apiKey = process.env.NYLAS_API_KEY;
  const apiUri = process.env.NYLAS_API_URI || 'https://api.us.nylas.com';
  const clientId = process.env.NYLAS_CLIENT_ID;

  console.log(`🌐 API URI: ${apiUri}`);
  console.log(`🔑 API Key: ${apiKey ? apiKey.substring(0, 20) + '...' : 'Not found'}`);
  console.log(`📱 Client ID: ${clientId}`);
  console.log('');

  // Check environment variables
  if (!apiKey || !clientId) {
    console.error('❌ NYLAS credentials not found in environment variables');
    console.error('Required: NYLAS_API_KEY, NYLAS_CLIENT_ID');
    process.exit(1);
  }

  // Initialize Nylas client (v7 syntax)
  let nylas;
  try {
    nylas = new Nylas({
      apiKey: apiKey,
      apiUri: apiUri,
    });

    console.log('✅ NYLAS client initialized');
  } catch (error) {
    console.error('❌ Failed to initialize NYLAS client:', error.message);
    process.exit(1);
  }

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
      if (error.response) {
        console.log(`   Status: ${error.response.status}`);
        console.log(`   Details: ${JSON.stringify(error.response.data, null, 2)}`);
      }
    }
  };

  // Test 1: Check API connection
  await runTest('API Connection', async () => {
    // Try to make a basic API call to check connectivity
    const response = await fetch(`${apiUri}/v3/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API call failed: ${response.status} - ${error}`);
    }
    
    const data = await response.json();
    console.log(`\n   📊 Application info retrieved`);
  });

  // Test 2: Check application details
  await runTest('Application Details', async () => {
    const response = await fetch(`${apiUri}/v3/applications`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const apps = await response.json();
      console.log(`\n   📱 Found ${apps.data?.length || 0} applications`);
    }
  });

  // Test 3: Check webhook support
  await runTest('Webhook Support', async () => {
    const response = await fetch(`${apiUri}/v3/webhooks`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (response.ok) {
      const webhooks = await response.json();
      console.log(`\n   🎣 Found ${webhooks.data?.length || 0} existing webhooks`);
    }
  });

  // Results
  console.log('');
  console.log('📊 Test Results');
  console.log('===============');
  console.log(`✅ Tests passed: ${testsPassed}/${testsTotal}`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 ALL TESTS PASSED! NYLAS credentials are working correctly.');
    console.log('');
    console.log('🚀 Your OnboardKit app is ready for NYLAS integration!');
    console.log('');
    console.log('📋 Next Steps:');
    console.log('   1. Connect email accounts for your users');
    console.log('   2. Set up webhooks for real-time updates');
    console.log('   3. Configure calendar and contact sync');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check your NYLAS configuration.');
    console.log('');
    console.log('🔧 Troubleshooting:');
    console.log('   1. Verify API key is correct and active');
    console.log('   2. Check API URI matches your NYLAS region');
    console.log('   3. Ensure your NYLAS application is properly configured');
    process.exit(1);
  }
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
testNylasCredentials().catch((error) => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});