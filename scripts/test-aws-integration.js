#!/usr/bin/env node

// OnboardKit AWS Integration Test Script
// This script tests the AWS S3 integration to ensure everything is working

const { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command } = require('@aws-sdk/client-s3');

async function testAWSIntegration() {
  console.log('🧪 OnboardKit AWS Integration Test');
  console.log('===================================');

  // Load environment variables
  require('dotenv').config({ path: '.env.production' });

  const region = process.env.AWS_REGION || 'us-east-1';
  const mainBucket = process.env.AWS_S3_BUCKET || 'onboardkit-production-files';
  const backupBucket = process.env.BACKUP_S3_BUCKET || 'onboardkit-production-backups';

  console.log(`📍 Region: ${region}`);
  console.log(`📦 Main Bucket: ${mainBucket}`);
  console.log(`💾 Backup Bucket: ${backupBucket}`);
  console.log('');

  // Check environment variables
  if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
    console.error('❌ AWS credentials not found in environment variables');
    process.exit(1);
  }

  // Initialize S3 client
  const s3Client = new S3Client({
    region: region,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    },
  });

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
    }
  };

  // Test 1: List buckets (check permissions)
  await runTest('List main bucket', async () => {
    const command = new ListObjectsV2Command({
      Bucket: mainBucket,
      MaxKeys: 1,
    });
    await s3Client.send(command);
  });

  // Test 2: Upload test file
  const testKey = `test/${Date.now()}-test-file.txt`;
  const testContent = `OnboardKit AWS Test - ${new Date().toISOString()}`;
  
  await runTest('Upload test file', async () => {
    const command = new PutObjectCommand({
      Bucket: mainBucket,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
      Metadata: {
        testFile: 'true',
        uploadedBy: 'OnboardKit-test-script',
      },
    });
    await s3Client.send(command);
  });

  // Test 3: Download test file
  await runTest('Download test file', async () => {
    const command = new GetObjectCommand({
      Bucket: mainBucket,
      Key: testKey,
    });
    const response = await s3Client.send(command);
    const downloadedContent = await streamToString(response.Body);
    if (downloadedContent !== testContent) {
      throw new Error('Downloaded content does not match uploaded content');
    }
  });

  // Test 4: Upload to backup bucket
  await runTest('Upload to backup bucket', async () => {
    const command = new PutObjectCommand({
      Bucket: backupBucket,
      Key: testKey,
      Body: testContent,
      ContentType: 'text/plain',
    });
    await s3Client.send(command);
  });

  // Test 5: Clean up - delete test files
  await runTest('Clean up main bucket', async () => {
    const command = new DeleteObjectCommand({
      Bucket: mainBucket,
      Key: testKey,
    });
    await s3Client.send(command);
  });

  await runTest('Clean up backup bucket', async () => {
    const command = new DeleteObjectCommand({
      Bucket: backupBucket,
      Key: testKey,
    });
    await s3Client.send(command);
  });

  // Results
  console.log('');
  console.log('📊 Test Results');
  console.log('===============');
  console.log(`✅ Tests passed: ${testsPassed}/${testsTotal}`);
  
  if (testsPassed === testsTotal) {
    console.log('🎉 ALL TESTS PASSED! AWS integration is working correctly.');
    console.log('');
    console.log('🚀 Your OnboardKit app is ready to use AWS S3 for file storage!');
    process.exit(0);
  } else {
    console.log('❌ Some tests failed. Check your AWS configuration.');
    process.exit(1);
  }
}

// Helper function to convert stream to string
async function streamToString(stream) {
  const chunks = [];
  for await (const chunk of stream) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf-8');
}

// Error handling
process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled error:', error.message);
  process.exit(1);
});

// Run the test
testAWSIntegration().catch((error) => {
  console.error('❌ Test failed:', error.message);
  process.exit(1);
});