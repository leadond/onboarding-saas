// Quick test script for AWS integration
// Run with: node test-aws.js

require('dotenv').config({ path: '.env.local' })

async function testAWSIntegration() {
  console.log('Testing AWS integration...\n')

  // Test environment variables
  console.log('Environment variables:')
  console.log('AWS_REGION:', process.env.AWS_REGION)
  console.log('AWS_S3_BUCKET:', process.env.AWS_S3_BUCKET)
  console.log('AWS_ACCESS_KEY_ID:', process.env.AWS_ACCESS_KEY_ID ? '✓ Set' : '✗ Missing')
  console.log('AWS_SECRET_ACCESS_KEY:', process.env.AWS_SECRET_ACCESS_KEY ? '✓ Set' : '✗ Missing')
  console.log('AWS_SES_FROM_EMAIL:', process.env.AWS_SES_FROM_EMAIL)

  // Test S3 connection
  try {
    const { S3Client, ListBucketsCommand } = require('@aws-sdk/client-s3')
    
    const s3Client = new S3Client({
      region: process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    console.log('\nTesting S3 connection...')
    const buckets = await s3Client.send(new ListBucketsCommand({}))
    console.log('✓ S3 connection successful')
    console.log(`Found ${buckets.Buckets.length} buckets`)
    
    const targetBucket = buckets.Buckets.find(b => b.Name === process.env.AWS_S3_BUCKET)
    if (targetBucket) {
      console.log('✓ Target bucket found:', process.env.AWS_S3_BUCKET)
    } else {
      console.log('✗ Target bucket not found:', process.env.AWS_S3_BUCKET)
    }
  } catch (error) {
    console.log('✗ S3 connection failed:', error.message)
  }

  // Test SES connection
  try {
    const { SESClient, GetSendStatisticsCommand } = require('@aws-sdk/client-ses')
    
    const sesClient = new SESClient({
      region: process.env.AWS_SES_REGION || process.env.AWS_REGION,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    })

    console.log('\nTesting SES connection...')
    const stats = await sesClient.send(new GetSendStatisticsCommand({}))
    console.log('✓ SES connection successful')
    console.log('Send statistics available')
  } catch (error) {
    console.log('✗ SES connection failed:', error.message)
  }

  console.log('\nAWS integration test complete!')
}

testAWSIntegration().catch(console.error)