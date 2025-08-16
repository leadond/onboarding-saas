# Supabase Database Configuration Guide

## 🎯 Your Supabase Project
- **Project URL**: https://tfuhfrjokvmectwfrazm.supabase.co
- **Dashboard**: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm

## 📋 Step-by-Step Database Setup

### Step 1: Access SQL Editor
1. Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/sql/new
2. You'll see the SQL Editor interface

### Step 2: Run Database Setup Script
1. **Copy the entire contents** of `scripts/setup-supabase-complete.sql`
2. **Paste into the SQL Editor**
3. **Click "Run"** (this may take 30-60 seconds)
4. **Verify success** - you should see success messages

### Step 3: Configure Authentication Settings
Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/auth/settings

#### Site URL:
```
https://onboard.devapphero.com
```

#### Redirect URLs (add all of these):
```
https://onboard.devapphero.com/api/auth/callback
https://onboard.devapphero.com/login
https://onboard.devapphero.com/signup
https://onboard.devapphero.com/verify-email
https://onboarding-saas-rbpi6vqrb-derrick-ls-projects.vercel.app/api/auth/callback
```

#### Additional Redirect URLs:
```
http://localhost:3000/api/auth/callback
http://localhost:3000/login
```

### Step 4: Configure Email Templates
Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/auth/templates

#### Confirm Signup Template:
**Subject**: `Welcome to OnboardKit - Confirm Your Email`

**Body**:
```html
<h2>Welcome to OnboardKit!</h2>
<p>Thanks for signing up! Please confirm your email address by clicking the link below:</p>
<p><a href="{{ .ConfirmationURL }}">Confirm your email</a></p>
<p>If you didn't create an account, you can safely ignore this email.</p>
<p>Best regards,<br>The OnboardKit Team</p>
```

#### Reset Password Template:
**Subject**: `Reset Your OnboardKit Password`

**Body**:
```html
<h2>Reset Your Password</h2>
<p>You requested to reset your password for your OnboardKit account.</p>
<p><a href="{{ .ConfirmationURL }}">Reset your password</a></p>
<p>If you didn't request this, you can safely ignore this email.</p>
<p>Best regards,<br>The OnboardKit Team</p>
```

### Step 5: Enable Storage
Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/storage/buckets

The setup script automatically creates these buckets:
- ✅ `avatars` (public) - User profile pictures
- ✅ `kit-assets` (public) - Kit logos, backgrounds
- ✅ `client-uploads` (private) - Client file uploads
- ✅ `documents` (private) - Signed documents, contracts

### Step 6: Verify Database Tables
Go to: https://supabase.com/dashboard/project/tfuhfrjokvmectwfrazm/editor

You should see these tables:
- ✅ `users` - User profiles and settings
- ✅ `organizations` - Company/team management
- ✅ `organization_members` - Team membership
- ✅ `kits` - Onboarding kits/workflows
- ✅ `kit_steps` - Individual steps in kits
- ✅ `client_progress` - Client completion tracking
- ✅ `file_uploads` - File management
- ✅ `payments` - Payment tracking
- ✅ `user_integrations` - Third-party integrations
- ✅ `audit_logs` - Security and activity logs
- ✅ `api_keys` - API access management

## 🔧 Database Features Enabled

### ✅ Row Level Security (RLS)
- Users can only access their own data
- Kit owners can manage their kits and view client progress
- Organization members can access shared resources

### ✅ Real-time Subscriptions
- Live updates for client progress
- Real-time notifications
- Collaborative editing capabilities

### ✅ Storage Integration
- Secure file uploads with proper permissions
- Public assets for branding
- Private client documents

### ✅ Audit Logging
- All user actions are logged
- Security event tracking
- Compliance reporting

### ✅ Performance Optimization
- Proper indexes on all tables
- Efficient query patterns
- Optimized for scale

## 🧪 Test Database Connection

After setup, test the connection by running this in the SQL Editor:

```sql
-- Test query to verify setup
SELECT 
  'Database setup successful!' as message,
  COUNT(*) as table_count
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'users', 'organizations', 'kits', 'kit_steps', 
    'client_progress', 'file_uploads', 'payments'
  );
```

Expected result: `table_count: 7`

## 🚀 What This Enables

### Authentication Features:
- ✅ Email/password signup and login
- ✅ Email verification
- ✅ Password reset
- ✅ User profile management
- ✅ Session management

### Core Application Features:
- ✅ Create and manage onboarding kits
- ✅ Multi-step workflows
- ✅ Client progress tracking
- ✅ File uploads and management
- ✅ Payment processing integration
- ✅ Team collaboration
- ✅ Analytics and reporting

### Advanced Features:
- ✅ Real-time updates
- ✅ Audit logging
- ✅ API access management
- ✅ Third-party integrations
- ✅ Multi-tenant organizations

## 🔍 Troubleshooting

### Common Issues:

**"Permission denied for schema public"**
- Solution: The script includes proper permission grants

**"Relation already exists"**
- Solution: Script uses `IF NOT EXISTS` - safe to re-run

**"RLS policy conflict"**
- Solution: Script drops existing policies before creating new ones

**"Storage bucket already exists"**
- Solution: Script uses `ON CONFLICT DO NOTHING` - safe to re-run

### Verification Steps:

1. **Check tables exist**: Go to Database → Tables
2. **Verify RLS enabled**: Look for shield icons next to table names
3. **Test authentication**: Try signing up in your app
4. **Check storage**: Go to Storage → Buckets

## 📞 Next Steps

After database setup:
1. ✅ Test authentication in your app
2. ✅ Create your first onboarding kit
3. ✅ Upload some test files
4. ✅ Configure integrations (Stripe, etc.)
5. ✅ Set up custom domain

Your OnboardKit database is now fully configured and ready for production use!