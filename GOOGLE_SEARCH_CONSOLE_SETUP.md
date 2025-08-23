# Google Search Console Setup Guide

## 🎯 Overview
This guide will help you set up Google Search Console for Onboard Hero to monitor SEO performance and track search visibility.

## 📋 Prerequisites
- Access to Google Search Console (https://search.google.com/search-console)
- Domain ownership verification capabilities
- Access to the website's DNS settings or file upload capabilities

## 🚀 Step-by-Step Setup

### 1. **Add Property to Search Console**

1. Go to [Google Search Console](https://search.google.com/search-console)
2. Click "Add Property"
3. Choose "URL prefix" method
4. Enter: `https://onboard.devapphero.com`
5. Click "Continue"

### 2. **Verify Domain Ownership**

Choose one of these verification methods:

#### Option A: HTML File Upload (Recommended)
1. Download the HTML verification file provided by Google
2. Upload it to `/public/` directory in your project
3. Ensure it's accessible at: `https://onboard.devapphero.com/google[verification-code].html`
4. Click "Verify" in Search Console

#### Option B: DNS Verification
1. Add the TXT record provided by Google to your DNS settings
2. Wait for DNS propagation (can take up to 24 hours)
3. Click "Verify" in Search Console

#### Option C: Google Analytics (if already set up)
1. Ensure Google Analytics is properly configured on the site
2. Use the same Google account for both services
3. Select "Google Analytics" verification method

### 3. **Submit Sitemap**

1. In Search Console, go to "Sitemaps" in the left sidebar
2. Click "Add a new sitemap"
3. Enter: `sitemap.xml`
4. Click "Submit"
5. Verify the sitemap shows as "Success" status

### 4. **Configure Settings**

#### Set Preferred Domain
1. Go to "Settings" → "Address Change"
2. Ensure the preferred version is set to `https://onboard.devapphero.com`

#### Set Target Country (Optional)
1. Go to "Settings" → "International Targeting"
2. Set country targeting to "United States" if primarily targeting US market

### 5. **Set Up Monitoring**

#### Enable Email Notifications
1. Go to "Settings" → "Users and permissions"
2. Ensure your email is set to receive notifications for:
   - Critical crawl errors
   - Manual actions
   - Security issues

## 📊 Key Metrics to Monitor

### Weekly Monitoring
- **Coverage Report**: Check for crawl errors and indexing issues
- **Performance Report**: Monitor clicks, impressions, CTR, and average position
- **Core Web Vitals**: Track page experience metrics

### Monthly Analysis
- **Search Queries**: Identify top-performing keywords
- **Pages Report**: See which pages get the most traffic
- **Countries Report**: Understand geographic performance
- **Devices Report**: Monitor mobile vs desktop performance

## 🎯 Goals to Set Up in Search Console

### 1. **Indexing Goals**
- Target: 100% of important pages indexed within 7 days
- Monitor: Coverage report for "Valid" pages

### 2. **Performance Goals**
- Target: 5% monthly increase in organic clicks
- Target: Maintain CTR above 3%
- Target: Improve average position for target keywords

### 3. **Technical Goals**
- Target: Zero critical crawl errors
- Target: Core Web Vitals "Good" status for 75%+ of pages
- Target: Mobile usability issues = 0

## 🔧 Advanced Setup

### 1. **URL Inspection Tool**
Use this to:
- Test if specific pages are indexed
- Request indexing for new/updated pages
- Troubleshoot crawling issues

### 2. **Enhancement Reports**
Monitor:
- **Breadcrumbs**: Ensure structured data is working
- **Sitelinks Searchbox**: Monitor search functionality
- **Logo**: Verify organization schema

### 3. **Security & Manual Actions**
- Check for security issues weekly
- Monitor for manual penalties
- Set up alerts for critical issues

## 📈 Expected Timeline for Results

### Week 1-2: Setup & Initial Data
- Property verified and sitemap submitted
- Initial crawling and indexing begins
- Basic performance data starts appearing

### Week 3-4: Data Accumulation
- More comprehensive performance data
- Coverage report shows indexing status
- Core Web Vitals data becomes available

### Month 2-3: Trend Analysis
- Sufficient data for trend analysis
- Keyword performance patterns emerge
- Optimization opportunities identified

## 🚨 Common Issues & Solutions

### Issue: Sitemap Not Found
**Solution**: 
- Verify sitemap is accessible at `https://onboard.devapphero.com/sitemap.xml`
- Check for any server errors or redirects
- Ensure sitemap follows XML format standards

### Issue: Pages Not Indexed
**Solution**:
- Use URL Inspection tool to test specific pages
- Check robots.txt isn't blocking important pages
- Verify internal linking structure
- Request indexing through URL Inspection tool

### Issue: Core Web Vitals Issues
**Solution**:
- Use PageSpeed Insights to identify specific issues
- Optimize images and reduce file sizes
- Minimize JavaScript and CSS
- Implement lazy loading for images

## 📋 Monthly Checklist

- [ ] Review Coverage report for new errors
- [ ] Analyze Performance report for trends
- [ ] Check Core Web Vitals status
- [ ] Monitor top search queries and pages
- [ ] Review and update target keywords
- [ ] Check for manual actions or security issues
- [ ] Analyze mobile usability report
- [ ] Review enhancement reports (structured data)

## 🎯 Success Metrics

### 3-Month Goals
- [ ] 90%+ of pages successfully indexed
- [ ] 25% increase in organic impressions
- [ ] 15% increase in organic clicks
- [ ] Average CTR above 3%
- [ ] Core Web Vitals "Good" for 75%+ pages

### 6-Month Goals
- [ ] 50% increase in organic traffic
- [ ] Top 10 rankings for 5+ target keywords
- [ ] Zero critical technical SEO issues
- [ ] Featured snippets for key queries
- [ ] Consistent month-over-month growth

## 📞 Support Resources

- **Google Search Console Help**: https://support.google.com/webmasters
- **SEO Starter Guide**: https://developers.google.com/search/docs/beginner/seo-starter-guide
- **Structured Data Testing**: https://search.google.com/test/rich-results

Remember to regularly review and act on the insights provided by Google Search Console to continuously improve your SEO performance!