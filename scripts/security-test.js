#!/usr/bin/env node

/**
 * Security Test Script
 * Tests the implemented security measures to ensure they're working correctly
 */

const https = require('https');
const http = require('http');
const { URL } = require('url');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const API_BASE = `${BASE_URL}/api`;

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// Test helpers
function logTest(testName, passed, details = '') {
  const result = { testName, passed, details, timestamp: new Date().toISOString() };
  
  if (passed) {
    testResults.passed.push(result);
    console.log(`✅ ${testName}: ${details}`);
  } else {
    testResults.failed.push(result);
    console.log(`❌ ${testName}: ${details}`);
  }
}

function logWarning(testName, details) {
  const result = { testName, passed: 'warning', details, timestamp: new Date().toISOString() };
  testResults.warnings.push(result);
  console.log(`⚠️  ${testName}: ${details}`);
}

// HTTP request helper
function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const isHttps = urlObj.protocol === 'https:';
    const httpModule = isHttps ? https : http;
    
    const requestOptions = {
      hostname: urlObj.hostname,
      port: urlObj.port || (isHttps ? 443 : 80),
      path: urlObj.pathname + urlObj.search,
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Security-Test-Script/1.0',
        ...options.headers
      }
    };

    if (options.body) {
      requestOptions.headers['Content-Length'] = Buffer.byteLength(options.body);
    }

    const req = httpModule.request(requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({
          status: res.statusCode,
          headers: res.headers,
          body: data
        });
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(options.body);
    }

    req.end();
  });
}

// Security Tests
async function testRateLimiting() {
  console.log('\n🔒 Testing Rate Limiting...');
  
  const loginEndpoint = `${API_BASE}/auth/login`;
  const testData = {
    email: 'test@example.com',
    password: 'wrongpassword'
  };

  // Make 6 consecutive login attempts (should trigger rate limit)
  for (let i = 1; i <= 6; i++) {
    try {
      const response = await makeRequest(loginEndpoint, {
        method: 'POST',
        body: JSON.stringify(testData)
      });

      if (i === 6) {
        // Should be rate limited on 6th attempt
        if (response.status === 429) {
          logTest('Rate Limiting', true, `Rate limited on attempt ${i} with status 429`);
          
          // Check for rate limit headers
          const hasRateLimitHeaders = 
            response.headers['x-ratelimit-limit'] &&
            response.headers['x-ratelimit-remaining'] &&
            response.headers['x-ratelimit-reset'];
          
          if (hasRateLimitHeaders) {
            logTest('Rate Limit Headers', true, 'Proper rate limit headers present');
          } else {
            logWarning('Rate Limit Headers', 'Rate limit headers missing');
          }
        } else {
          logTest('Rate Limiting', false, `Expected 429 on attempt ${i}, got ${response.status}`);
        }
      }
    } catch (error) {
      logTest('Rate Limiting', false, `Request failed: ${error.message}`);
    }
  }
}

async function testSecurityHeaders() {
  console.log('\n🛡️  Testing Security Headers...');
  
  const endpoints = [
    '/',
    '/login',
    '/api/auth/login',
    '/dashboard'
  ];

  const requiredHeaders = [
    'x-content-type-options',
    'x-frame-options',
    'x-xss-protection',
    'strict-transport-security',
    'referrer-policy',
    'permissions-policy',
    'content-security-policy'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`);
      const headers = response.headers;
      
      let missingHeaders = [];
      for (const header of requiredHeaders) {
        if (!headers[header]) {
          missingHeaders.push(header);
        }
      }

      if (missingHeaders.length === 0) {
        logTest(`Security Headers - ${endpoint}`, true, 'All required headers present');
      } else {
        logTest(`Security Headers - ${endpoint}`, false, `Missing headers: ${missingHeaders.join(', ')}`);
      }

      // Check specific header values
      if (headers['x-content-type-options'] === 'nosniff') {
        logTest('X-Content-Type-Options', true, 'Correctly set to nosniff');
      } else {
        logTest('X-Content-Type-Options', false, `Incorrect value: ${headers['x-content-type-options']}`);
      }

      if (headers['x-frame-options'] === 'DENY') {
        logTest('X-Frame-Options', true, 'Correctly set to DENY');
      } else {
        logTest('X-Frame-Options', false, `Incorrect value: ${headers['x-frame-options']}`);
      }

    } catch (error) {
      logTest(`Security Headers - ${endpoint}`, false, `Request failed: ${error.message}`);
    }
  }
}

async function testInputValidation() {
  console.log('\n🔍 Testing Input Validation...');
  
  const loginEndpoint = `${API_BASE}/auth/login`;
  
  // Test SQL injection
  const sqlInjectionTests = [
    { email: "' OR '1'='1", password: "password" },
    { email: "admin'--", password: "password" },
    { email: "test@example.com'; DROP TABLE users;--", password: "password" }
  ];

  for (const test of sqlInjectionTests) {
    try {
      const response = await makeRequest(loginEndpoint, {
        method: 'POST',
        body: JSON.stringify(test)
      });

      if (response.status === 400) {
        logTest('SQL Injection Protection', true, `Blocked malicious input: ${test.email}`);
      } else {
        logWarning('SQL Injection Protection', `Potential vulnerability with input: ${test.email}`);
      }
    } catch (error) {
      logTest('SQL Injection Protection', false, `Request failed: ${error.message}`);
    }
  }

  // Test XSS
  const xssTests = [
    { email: "<script>alert('xss')</script>@example.com", password: "password" },
    { email: "test@example.com", password: "<img src=x onerror=alert('xss')>" },
    { email: "javascript:alert('xss')@example.com", password: "password" }
  ];

  for (const test of xssTests) {
    try {
      const response = await makeRequest(loginEndpoint, {
        method: 'POST',
        body: JSON.stringify(test)
      });

      if (response.status === 400) {
        logTest('XSS Protection', true, `Blocked XSS attempt: ${test.email}`);
      } else {
        logWarning('XSS Protection', `Potential XSS vulnerability with input: ${test.email}`);
      }
    } catch (error) {
      logTest('XSS Protection', false, `Request failed: ${error.message}`);
    }
  }
}

async function testSessionSecurity() {
  console.log('\n🔑 Testing Session Security...');
  
  const loginEndpoint = `${API_BASE}/auth/login`;
  
  // Test with valid credentials (assuming test user exists)
  const validCredentials = {
    email: 'test@example.com',
    password: 'testpassword123'
  };

  try {
    const response = await makeRequest(loginEndpoint, {
      method: 'POST',
      body: JSON.stringify(validCredentials)
    });

    if (response.status === 200) {
      const responseObj = JSON.parse(response.body);
      
      // Check if session is returned
      if (responseObj.session) {
        logTest('Session Creation', true, 'Session created successfully');
      } else {
        logTest('Session Creation', false, 'No session returned in response');
      }

      // Check for secure cookie headers
      const setCookieHeader = response.headers['set-cookie'];
      if (setCookieHeader) {
        const hasSecure = setCookieHeader.includes('Secure');
        const hasHttpOnly = setCookieHeader.includes('HttpOnly');
        const hasSameSite = setCookieHeader.includes('SameSite=strict');
        
        if (hasSecure && hasHttpOnly && hasSameSite) {
          logTest('Session Cookie Security', true, 'All secure cookie flags present');
        } else {
          logTest('Session Cookie Security', false, 
            `Missing flags - Secure: ${hasSecure}, HttpOnly: ${hasHttpOnly}, SameSite: ${hasSameSite}`);
        }
      } else {
        logTest('Session Cookie Security', false, 'No session cookie set');
      }
    } else {
      logTest('Session Security', false, `Login failed with status ${response.status}`);
    }
  } catch (error) {
    logTest('Session Security', false, `Request failed: ${error.message}`);
  }
}

async function testCORS() {
  console.log('\n🌐 Testing CORS Security...');
  
  const apiEndpoint = `${API_BASE}/auth/login`;
  
  // Test with different origins
  const testOrigins = [
    'https://malicious.com',
    'https://phishing-site.com',
    'null'
  ];

  for (const origin of testOrigins) {
    try {
      const response = await makeRequest(apiEndpoint, {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      const acaoHeader = response.headers['access-control-allow-origin'];
      
      if (acaoHeader === origin) {
        logTest('CORS Security', false, `Insecure origin allowed: ${origin}`);
      } else if (!acaoHeader || acaoHeader === 'null' || acaoHeader.includes(BASE_URL)) {
        logTest('CORS Security', true, `Properly restricted origin: ${origin}`);
      } else {
        logWarning('CORS Security', `Unexpected ACAO header: ${acaoHeader}`);
      }
    } catch (error) {
      logTest('CORS Security', false, `Request failed: ${error.message}`);
    }
  }
}

async function testInformationDisclosure() {
  console.log('\n📋 Testing Information Disclosure...');
  
  const endpoints = [
    '/api/auth/login',
    '/api/auth/signup',
    '/nonexistent-endpoint'
  ];

  for (const endpoint of endpoints) {
    try {
      const response = await makeRequest(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        body: JSON.stringify({ invalid: 'data' })
      });

      const responseBody = JSON.parse(response.body);
      
      // Check for sensitive information in error messages
      const sensitivePatterns = [
        /stack trace/i,
        /internal server error/i,
        /database error/i,
        /syntax error/i,
        /undefined/i,
        /null/i
      ];

      let hasSensitiveInfo = false;
      for (const pattern of sensitivePatterns) {
        if (pattern.test(JSON.stringify(responseBody))) {
          hasSensitiveInfo = true;
          break;
        }
      }

      if (!hasSensitiveInfo) {
        logTest(`Information Disclosure - ${endpoint}`, true, 'No sensitive information disclosed');
      } else {
        logTest(`Information Disclosure - ${endpoint}`, false, 'Sensitive information may be disclosed');
      }

      // Check server headers
      const serverHeader = response.headers['server'];
      const xPoweredBy = response.headers['x-powered-by'];
      
      if (!serverHeader && !xPoweredBy) {
        logTest('Server Information Disclosure', true, 'No server information disclosed');
      } else {
        logWarning('Server Information Disclosure', 
          `Server headers present - Server: ${serverHeader}, X-Powered-By: ${xPoweredBy}`);
      }

    } catch (error) {
      logTest(`Information Disclosure - ${endpoint}`, false, `Request failed: ${error.message}`);
    }
  }
}

// Main test runner
async function runSecurityTests() {
  console.log('🚀 Starting Security Tests...');
  console.log(`📍 Target: ${BASE_URL}`);
  console.log('='.repeat(50));

  try {
    await testRateLimiting();
    await testSecurityHeaders();
    await testInputValidation();
    await testSessionSecurity();
    await testCORS();
    await testInformationDisclosure();

    // Print summary
    console.log('\n'.repeat(2));
    console.log('='.repeat(50));
    console.log('📊 SECURITY TEST SUMMARY');
    console.log('='.repeat(50));
    
    console.log(`✅ Passed: ${testResults.passed.length}`);
    console.log(`❌ Failed: ${testResults.failed.length}`);
    console.log(`⚠️  Warnings: ${testResults.warnings.length}`);
    
    const totalTests = testResults.passed.length + testResults.failed.length + testResults.warnings.length;
    const successRate = (testResults.passed.length / totalTests * 100).toFixed(1);
    console.log(`📈 Success Rate: ${successRate}%`);
    
    if (testResults.failed.length > 0) {
      console.log('\n❌ FAILED TESTS:');
      testResults.failed.forEach(test => {
        console.log(`   - ${test.testName}: ${test.details}`);
      });
    }
    
    if (testResults.warnings.length > 0) {
      console.log('\n⚠️  WARNINGS:');
      testResults.warnings.forEach(test => {
        console.log(`   - ${test.testName}: ${test.details}`);
      });
    }
    
    // Overall assessment
    console.log('\n🎯 SECURITY ASSESSMENT:');
    if (testResults.failed.length === 0) {
      console.log('🟢 EXCELLENT: All security tests passed!');
    } else if (testResults.failed.length <= 2) {
      console.log('🟡 GOOD: Most security measures are working, but some issues need attention');
    } else if (testResults.failed.length <= 5) {
      console.log('🟠 FAIR: Several security issues detected, immediate attention required');
    } else {
      console.log('🔴 CRITICAL: Multiple security vulnerabilities detected, urgent action needed');
    }
    
    // Save results to file
    const fs = require('fs');
    const resultsFile = `security-test-results-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(resultsFile, JSON.stringify(testResults, null, 2));
    console.log(`\n💾 Detailed results saved to: ${resultsFile}`);
    
  } catch (error) {
    console.error('💥 Test execution failed:', error);
    process.exit(1);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  runSecurityTests();
}

module.exports = {
  runSecurityTests,
  testRateLimiting,
  testSecurityHeaders,
  testInputValidation,
  testSessionSecurity,
  testCORS,
  testInformationDisclosure
};