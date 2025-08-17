# Onboard Hero Deployment Checklist

## ✅ Completed
- [x] Fixed authentication system
- [x] Simplified auth routes
- [x] Configured CORS headers
- [x] Deployed to Vercel successfully
- [x] Created test endpoints

## 🔄 In Progress
- [ ] **CRITICAL: Disable Vercel Authentication Protection**
- [ ] Set up Supabase credentials
- [ ] Configure custom domain DNS
- [ ] Test authentication flow

## 📋 Step-by-Step Instructions

### 1. Disable Vercel Protection (DO THIS FIRST!)
- Go to: https://vercel.com/derrick-ls-projects/onboarding-saas
- Settings → General → Vercel Authentication → **DISABLE**

### 2. Add Environment Variables
- Go to: https://vercel.com/derrick-ls-projects/onboarding-saas/settings/environment-variables
- Add Supabase credentials (see SUPABASE_SETUP_GUIDE.md)

### 3. Set Up Custom Domain
- Cloudflare: Add CNAME record `onboard` → `onboarding-saas-cvrsg4zuv-derrick-ls-projects.vercel.app`
- Vercel: Add domain `onboard.devapphero.com`

### 4. Test Everything
- [ ] App loads without Vercel auth screen
- [ ] Can access login page
- [ ] Can create new account
- [ ] Can login with existing account
- [ ] OAuth works (if configured)
- [ ] Custom domain works

## 🚀 Current Deployment URLs
- **Vercel**: https://onboarding-saas-cvrsg4zuv-derrick-ls-projects.vercel.app
- **Custom Domain**: https://onboard.devapphero.com (after DNS setup)
- **Test Endpoint**: /api/test
- **Login**: /login
- **Dashboard**: /test-dashboard

## 🔧 Troubleshooting
- **401/403 errors**: Vercel protection still enabled
- **Auth not working**: Missing Supabase credentials
- **Domain not working**: DNS not propagated or not added to Vercel
- **OAuth errors**: Missing provider credentials or wrong redirect URLs

## 📞 Next Steps After Basic Setup
1. Configure OAuth providers
2. Set up email templates
3. Configure Stripe for payments
4. Set up other integrations (Nylas, BoldSign, etc.)
5. Configure monitoring and analytics