# Vercel Deployment Guide for Onboard Hero

## Step 1: Connect GitHub to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Sign up/login with your GitHub account
3. Click "New Project"
4. Import your `onboarding-saas` repository
5. Configure project settings:
   - **Project Name**: `onboard-hero`
   - **Framework**: Next.js
   - **Root Directory**: `./` (default)

## Step 2: Add Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add these **PRODUCTION** variables:

> **Note**: Replace placeholder values with actual keys from your local `.env.local` file

### Core Configuration
```
NEXT_PUBLIC_APP_URL = https://onboard.devapphero.com
NEXT_PUBLIC_APP_NAME = Onboard Hero
NEXT_PUBLIC_APP_VERSION = 1.0.0
```

### Supabase (Database)
```
NEXT_PUBLIC_SUPABASE_URL = [Your Supabase Project URL]
NEXT_PUBLIC_SUPABASE_ANON_KEY = [Your Supabase Anon Key]
SUPABASE_SERVICE_ROLE_KEY = [Your Supabase Service Role Key]
```

### Stripe (Payments)
```
STRIPE_SECRET_KEY = [Your Stripe Secret Key]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY = [Your Stripe Publishable Key]
STRIPE_WEBHOOK_SECRET = [Your Stripe Webhook Secret]
```

### Authentication
```
NEXTAUTH_SECRET = [Generate 32+ character secret]
NEXTAUTH_URL = https://onboard.devapphero.com
```

### Email Services
```
RESEND_API_KEY = [Your Resend API Key]
RESEND_FROM_EMAIL = onboard@devapphero.com
RESEND_FROM_NAME = Onboard Hero
```

### AWS Services
```
AWS_ACCESS_KEY_ID = [Your AWS Access Key ID]
AWS_SECRET_ACCESS_KEY = [Your AWS Secret Access Key]
AWS_REGION = us-east-1
AWS_S3_BUCKET = onboardhero-production-files
```

### OpenAI (AI Features)
```
OPENAI_API_KEY = [Your OpenAI API Key]
OPENAI_ORGANIZATION_ID = [Your OpenAI Organization ID]
```

### Cloudinary (Image Processing)
```
CLOUDINARY_CLOUD_NAME = [Your Cloudinary Cloud Name]
CLOUDINARY_API_KEY = [Your Cloudinary API Key]
CLOUDINARY_API_SECRET = [Your Cloudinary API Secret]
```

## Step 3: Deploy

1. Click "Deploy" in Vercel dashboard
2. Or push to main branch (auto-deploys)
3. Your app will be live at: `https://onboard-hero.vercel.app`

## Step 4: Custom Domain (Optional)

1. In Vercel → Project Settings → Domains
2. Add `onboard.devapphero.com`
3. Configure DNS records as shown

## Security Notes

- ✅ Environment variables are encrypted in Vercel
- ✅ Never committed to GitHub
- ✅ Only accessible to your Vercel team
- ✅ Can be updated without redeploying

## Quick Setup Instructions

1. **Copy values** from your local `.env.local` file
2. **Paste each variable** into Vercel dashboard
3. **Set environment** to "Production"
4. **Deploy** your application

Your Onboard Hero app will be securely deployed with all necessary environment variables!