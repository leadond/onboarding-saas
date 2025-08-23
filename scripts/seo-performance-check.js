#!/usr/bin/env node

/**
 * SEO Performance Monitoring Script for Onboard Hero
 * 
 * This script checks various SEO elements and performance metrics
 * Run with: node scripts/seo-performance-check.js
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://onboard.devapphero.com';

class SEOChecker {
  constructor() {
    this.results = {
      timestamp: new Date().toISOString(),
      url: BASE_URL,
      checks: {},
      score: 0,
      recommendations: []
    };
  }

  async runAllChecks() {
    console.log('🔍 Starting SEO Performance Check for Onboard Hero...\n');
    
    try {
      await this.checkSitemap();
      await this.checkRobots();
      await this.checkCanonicalURL();
      await this.checkMetaTags();
      await this.checkStructuredData();
      await this.checkSocialImages();
      await this.checkPageSpeed();
      
      this.calculateScore();
      this.generateReport();
      
    } catch (error) {
      console.error('❌ Error running SEO checks:', error.message);
    }
  }

  async makeRequest(url) {
    return new Promise((resolve, reject) => {
      const isHttps = url.startsWith('https:');
      const client = isHttps ? https : http;
      const request = client.get(url, (response) => {
        let data = '';
        
        response.on('data', (chunk) => {
          data += chunk;
        });
        
        response.on('end', () => {
          resolve({
            statusCode: response.statusCode,
            headers: response.headers,
            body: data
          });
        });
      });
      
      request.on('error', (error) => {
        reject(error);
      });
      
      request.setTimeout(10000, () => {
        request.destroy();
        reject(new Error('Request timeout'));
      });
    });
  }

  async checkSitemap() {
    console.log('📄 Checking sitemap.xml...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/sitemap.xml`);
      
      if (response.statusCode === 200) {
        const isValidXML = response.body.includes('<?xml') && response.body.includes('<urlset');
        const urlCount = (response.body.match(/<url>/g) || []).length;
        
        this.results.checks.sitemap = {
          status: 'pass',
          accessible: true,
          validXML: isValidXML,
          urlCount: urlCount,
          message: `✅ Sitemap accessible with ${urlCount} URLs`
        };
        
        if (!isValidXML) {
          this.results.recommendations.push('Fix sitemap XML format');
        }
        
      } else {
        this.results.checks.sitemap = {
          status: 'fail',
          accessible: false,
          message: `❌ Sitemap not accessible (Status: ${response.statusCode})`
        };
        this.results.recommendations.push('Make sitemap.xml accessible');
      }
    } catch (error) {
      this.results.checks.sitemap = {
        status: 'fail',
        accessible: false,
        message: `❌ Sitemap check failed: ${error.message}`
      };
    }
  }

  async checkRobots() {
    console.log('🤖 Checking robots.txt...');
    
    try {
      const response = await this.makeRequest(`${BASE_URL}/robots.txt`);
      
      if (response.statusCode === 200) {
        const hasSitemap = response.body.includes('Sitemap:');
        const hasUserAgent = response.body.includes('User-agent:');
        
        this.results.checks.robots = {
          status: 'pass',
          accessible: true,
          hasSitemap: hasSitemap,
          hasUserAgent: hasUserAgent,
          message: '✅ Robots.txt accessible and properly configured'
        };
        
        if (!hasSitemap) {
          this.results.recommendations.push('Add sitemap reference to robots.txt');
        }
        
      } else {
        this.results.checks.robots = {
          status: 'fail',
          accessible: false,
          message: `❌ Robots.txt not accessible (Status: ${response.statusCode})`
        };
        this.results.recommendations.push('Make robots.txt accessible');
      }
    } catch (error) {
      this.results.checks.robots = {
        status: 'fail',
        accessible: false,
        message: `❌ Robots.txt check failed: ${error.message}`
      };
    }
  }

  async checkCanonicalURL() {
    console.log('🔗 Checking canonical URL...');
    
    try {
      const response = await this.makeRequest(BASE_URL);
      
      if (response.statusCode === 200) {
        const hasCanonical = response.body.includes('rel="canonical"');
        const canonicalMatch = response.body.match(/rel="canonical"\s+href="([^"]+)"/);
        const canonicalURL = canonicalMatch ? canonicalMatch[1] : null;
        
        this.results.checks.canonical = {
          status: hasCanonical ? 'pass' : 'fail',
          present: hasCanonical,
          url: canonicalURL,
          message: hasCanonical ? 
            `✅ Canonical URL present: ${canonicalURL}` : 
            '❌ Canonical URL missing'
        };
        
        if (!hasCanonical) {
          this.results.recommendations.push('Add canonical URL to prevent duplicate content');
        }
        
      } else {
        this.results.checks.canonical = {
          status: 'fail',
          message: `❌ Cannot check canonical URL (Status: ${response.statusCode})`
        };
      }
    } catch (error) {
      this.results.checks.canonical = {
        status: 'fail',
        message: `❌ Canonical URL check failed: ${error.message}`
      };
    }
  }

  async checkMetaTags() {
    console.log('📝 Checking meta tags...');
    
    try {
      const response = await this.makeRequest(BASE_URL);
      
      if (response.statusCode === 200) {
        const titleMatch = response.body.match(/<title>([^<]+)<\/title>/);
        const descMatch = response.body.match(/name="description"\s+content="([^"]+)"/);
        const keywordsMatch = response.body.match(/name="keywords"\s+content="([^"]+)"/);
        
        const title = titleMatch ? titleMatch[1] : null;
        const description = descMatch ? descMatch[1] : null;
        const keywords = keywordsMatch ? keywordsMatch[1] : null;
        
        this.results.checks.metaTags = {
          status: (title && description) ? 'pass' : 'fail',
          title: {
            present: !!title,
            content: title,
            length: title ? title.length : 0,
            optimal: title ? (title.length >= 30 && title.length <= 60) : false
          },
          description: {
            present: !!description,
            content: description,
            length: description ? description.length : 0,
            optimal: description ? (description.length >= 120 && description.length <= 160) : false
          },
          keywords: {
            present: !!keywords,
            content: keywords
          },
          message: `${title ? '✅' : '❌'} Title: ${title ? 'Present' : 'Missing'} | ${description ? '✅' : '❌'} Description: ${description ? 'Present' : 'Missing'}`
        };
        
        if (!title) this.results.recommendations.push('Add page title');
        if (!description) this.results.recommendations.push('Add meta description');
        if (title && (title.length < 30 || title.length > 60)) {
          this.results.recommendations.push('Optimize title length (30-60 characters)');
        }
        if (description && (description.length < 120 || description.length > 160)) {
          this.results.recommendations.push('Optimize description length (120-160 characters)');
        }
        
      } else {
        this.results.checks.metaTags = {
          status: 'fail',
          message: `❌ Cannot check meta tags (Status: ${response.statusCode})`
        };
      }
    } catch (error) {
      this.results.checks.metaTags = {
        status: 'fail',
        message: `❌ Meta tags check failed: ${error.message}`
      };
    }
  }

  async checkStructuredData() {
    console.log('📊 Checking structured data...');
    
    try {
      const response = await this.makeRequest(BASE_URL);
      
      if (response.statusCode === 200) {
        const hasJSONLD = response.body.includes('application/ld+json');
        const jsonLDMatches = response.body.match(/<script[^>]*type="application\/ld\+json"[^>]*>(.*?)<\/script>/gs);
        
        let schemas = [];
        if (jsonLDMatches) {
          jsonLDMatches.forEach(match => {
            try {
              const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
              const parsed = JSON.parse(jsonContent);
              if (parsed['@type']) {
                schemas.push(parsed['@type']);
              } else if (parsed['@graph']) {
                parsed['@graph'].forEach(item => {
                  if (item['@type']) schemas.push(item['@type']);
                });
              }
            } catch (e) {
              // Invalid JSON-LD
            }
          });
        }
        
        this.results.checks.structuredData = {
          status: hasJSONLD ? 'pass' : 'fail',
          present: hasJSONLD,
          schemas: schemas,
          count: schemas.length,
          message: hasJSONLD ? 
            `✅ Structured data present (${schemas.length} schemas: ${schemas.join(', ')})` : 
            '❌ No structured data found'
        };
        
        if (!hasJSONLD) {
          this.results.recommendations.push('Add structured data (JSON-LD) for better search visibility');
        }
        
      } else {
        this.results.checks.structuredData = {
          status: 'fail',
          message: `❌ Cannot check structured data (Status: ${response.statusCode})`
        };
      }
    } catch (error) {
      this.results.checks.structuredData = {
        status: 'fail',
        message: `❌ Structured data check failed: ${error.message}`
      };
    }
  }

  async checkSocialImages() {
    console.log('🖼️ Checking social media images...');
    
    const imagesToCheck = [
      '/og-image.png',
      '/og-image.svg',
      '/twitter-image.png',
      '/twitter-image.svg'
    ];
    
    let foundImages = [];
    
    for (const imagePath of imagesToCheck) {
      try {
        const response = await this.makeRequest(`${BASE_URL}${imagePath}`);
        if (response.statusCode === 200) {
          foundImages.push(imagePath);
        }
      } catch (error) {
        // Image not found, continue
      }
    }
    
    this.results.checks.socialImages = {
      status: foundImages.length > 0 ? 'pass' : 'fail',
      foundImages: foundImages,
      count: foundImages.length,
      message: foundImages.length > 0 ? 
        `✅ Social images found: ${foundImages.join(', ')}` : 
        '❌ No social media images found'
    };
    
    if (foundImages.length === 0) {
      this.results.recommendations.push('Add Open Graph and Twitter Card images');
    }
  }

  async checkPageSpeed() {
    console.log('⚡ Checking basic performance metrics...');
    
    try {
      const startTime = Date.now();
      const response = await this.makeRequest(BASE_URL);
      const loadTime = Date.now() - startTime;
      
      const contentLength = response.headers['content-length'] || response.body.length;
      const hasGzip = response.headers['content-encoding'] === 'gzip';
      const hasCaching = !!response.headers['cache-control'];
      
      this.results.checks.performance = {
        status: loadTime < 3000 ? 'pass' : 'warning',
        loadTime: loadTime,
        contentLength: contentLength,
        hasGzip: hasGzip,
        hasCaching: hasCaching,
        message: `${loadTime < 3000 ? '✅' : '⚠️'} Load time: ${loadTime}ms | Size: ${Math.round(contentLength/1024)}KB | Gzip: ${hasGzip ? 'Yes' : 'No'}`
      };
      
      if (loadTime > 3000) {
        this.results.recommendations.push('Optimize page load time (target: <3 seconds)');
      }
      if (!hasGzip) {
        this.results.recommendations.push('Enable Gzip compression');
      }
      if (!hasCaching) {
        this.results.recommendations.push('Implement proper caching headers');
      }
      
    } catch (error) {
      this.results.checks.performance = {
        status: 'fail',
        message: `❌ Performance check failed: ${error.message}`
      };
    }
  }

  calculateScore() {
    const checks = Object.values(this.results.checks);
    const passCount = checks.filter(check => check.status === 'pass').length;
    const totalChecks = checks.length;
    
    this.results.score = Math.round((passCount / totalChecks) * 100);
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 SEO PERFORMANCE REPORT - ONBOARD HERO');
    console.log('='.repeat(60));
    console.log(`🎯 Overall Score: ${this.results.score}/100`);
    console.log(`📅 Checked: ${new Date(this.results.timestamp).toLocaleString()}`);
    console.log(`🌐 URL: ${this.results.url}\n`);
    
    // Detailed results
    Object.entries(this.results.checks).forEach(([checkName, result]) => {
      console.log(`${checkName.toUpperCase()}: ${result.message}`);
    });
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('\n📋 RECOMMENDATIONS:');
      this.results.recommendations.forEach((rec, index) => {
        console.log(`${index + 1}. ${rec}`);
      });
    }
    
    // Save report to file
    const reportPath = path.join(__dirname, '..', 'seo-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(this.results, null, 2));
    console.log(`\n💾 Detailed report saved to: ${reportPath}`);
    
    console.log('\n' + '='.repeat(60));
    
    // Exit with appropriate code
    process.exit(this.results.score >= 80 ? 0 : 1);
  }
}

// Run the checker
const checker = new SEOChecker();
checker.runAllChecks();