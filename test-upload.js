// Test file upload to S3
const fs = require('fs')
const FormData = require('form-data')

async function testFileUpload() {
  try {
    console.log('Testing file upload to S3...\n')

    // Create a simple test file
    const testContent = 'This is a test file for AWS S3 upload'
    fs.writeFileSync('test-file.txt', testContent)

    // Create form data
    const form = new FormData()
    form.append('file', fs.createReadStream('test-file.txt'))

    // Make request to upload endpoint
    const response = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: form,
      headers: {
        // Note: Don't set Content-Type header when using FormData
        'Authorization': 'Bearer fake-token-for-testing'
      }
    })

    const result = await response.json()
    
    console.log('Upload Response Status:', response.status)
    console.log('Upload Response:', JSON.stringify(result, null, 2))

    // Cleanup
    fs.unlinkSync('test-file.txt')

    if (result.success) {
      console.log('\n✅ File upload successful!')
      console.log('File URL:', result.data.url)
      
      // Test downloading the file
      const downloadResponse = await fetch(result.data.url)
      if (downloadResponse.ok) {
        const downloadedContent = await downloadResponse.text()
        console.log('Downloaded content:', downloadedContent)
        console.log('\n✅ File download successful!')
      } else {
        console.log('❌ File download failed')
      }
    } else {
      console.log('\n❌ File upload failed:', result.error)
    }

  } catch (error) {
    console.error('Test failed:', error.message)
  }
}

// Note: This test will fail with authentication error since we're not properly authenticated
// But it will show us if the endpoint is working
testFileUpload()