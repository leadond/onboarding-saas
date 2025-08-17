# Supabase Configuration for Onboard Hero

## 🎯 Your Supabase Project Details

**Project URL**: https://tfuhfrjokvmectwfrazm.supabase.co
**Project Ref**: tfuhfrjokvmectwfrazm

## 📋 Step-by-Step Setup

### 1. Access Your Supabase Dashboard
Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm

### 2. Configure Authentication Settings

**Go to Authentication → Settings:**

#### Site URL:
```
https://onboard.devapphero.com
```

#### Redirect URLs (add both):
```
https://onboard.devapphero.com/api/auth/callback
https://onboarding-saas-3dro7159u-derrick-ls-projects.vercel.app/api/auth/callback
```

#### Additional Redirect URLs:
```
https://onboard.devapphero.com/login
https://onboard.devapphero.com/signup
https://onboard.devapphero.com/verify-email
```

### 3. Set Up Database Schema

**Go to SQL Editor and run the script:**
- Copy the contents of `scripts/setup-supabase-auth.sql`
- Paste into Supabase SQL Editor
- Click "Run"

### 4. Configure Email Templates (Optional)

**Go to Authentication → Email Templates:**

#### Confirm Signup Template:
- **Subject**: Welcome to Onboard Hero - Confirm Your Email
- **Body**: Customize with your branding

#### Reset Password Template:
- **Subject**: Reset Your Onboard Hero Password
- **Body**: Customize with your branding

### 5. Enable Email Provider

**Go to Authentication → Providers:**
- **Email**: ✅ Enabled (should already be enabled)
- **Confirm email**: ✅ Enabled
- **Secure email change**: ✅ Enabled

### 6. Test Authentication

Once configured, your app will support:
- ✅ Email/Password signup
- ✅ Email/Password login
- ✅ Email verification
- ✅ Password reset
- ✅ User profile management

## 🔧 Environment Variables for Vercel

Add these to Vercel (https://vercel.com/derrick-ls-projects/onboarding-saas/settings/environment-variables):

```
NEXT_PUBLIC_SUPABASE_URL=https://tfuhfrjokvmectwfrazm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdWhmcmpva3ZtZWN0d2ZyYXptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNTE3NjUsImV4cCI6MjA3MDYyNzc2NX0.tYKnTxnKqEVm3mMqo-s6vx06dKPEJBziADgkXJuQ8Ng
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmdWhmcmpva3ZtZWN0d2ZyYXptIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTA1MTc2NSwiZXhwIjoyMDcwNjI3NzY1fQ.rxrs8UVe4NhFq2Lnb2suiM-fohDW4kHXIT5k144xryM
NEXT_PUBLIC_APP_URL=https://onboard.devapphero.com
```

**Set Environment to**: Production, Preview, Development (all three)

## ✅ Verification Checklist

- [ ] Supabase project accessible
- [ ] Authentication settings configured
- [ ] Database schema created
- [ ] Environment variables added to Vercel
- [ ] Vercel protection disabled
- [ ] App URL updated to custom domain

## 🚀 Testing Authentication

After setup, test these flows:
1. **Signup**: Create new account with email/password
2. **Email Verification**: Check email and click verification link
3. **Login**: Sign in with verified account
4. **Password Reset**: Test forgot password flow
5. **Profile**: Update user profile information

## 🔍 Troubleshooting

### Common Issues:
- **"Invalid redirect URL"**: Check redirect URLs in Supabase settings
- **"Email not confirmed"**: Check email templates and SMTP settings
- **"Database connection failed"**: Verify environment variables
- **"CORS errors"**: Check site URL configuration

### Debug Steps:
1. Check Supabase logs: Authentication → Logs
2. Check Vercel function logs: Vercel dashboard → Functions
3. Test API endpoints directly: `/api/test`, `/api/health`