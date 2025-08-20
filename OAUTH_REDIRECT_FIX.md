# Fix OAuth Redirect Issue

You're getting redirected to `localhost:3000` because the OAuth redirect URLs are not properly configured. Here's how to fix it:

## 1. Fix Supabase OAuth Configuration

### In Supabase Dashboard:
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **URL Configuration**
3. Update the following URLs:

**Site URL:**
```
https://onboard.devapphero.com
```

**Redirect URLs (add both):**
```
https://onboard.devapphero.com/auth/callback
https://onboard.devapphero.com/api/auth/callback/google
```

## 2. Fix Google OAuth Configuration

### In Google Cloud Console:
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Navigate to **APIs & Services** → **Credentials**
3. Find your OAuth 2.0 Client ID
4. Update **Authorized redirect URIs**:

**Remove:**
```
http://localhost:3000/auth/callback
```

**Add:**
```
https://onboard.devapphero.com/auth/callback
```

## 3. Verify Environment Variables

Make sure your Vercel environment variables match your .env.local:

```bash
NEXT_PUBLIC_APP_URL=https://onboard.devapphero.com
NEXTAUTH_URL=https://onboard.devapphero.com
GOOGLE_REDIRECT_URI=https://onboard.devapphero.com/api/auth/callback/google
```

## 4. Test the Fix

1. Clear your browser cache and cookies for the site
2. Try logging in with Google again
3. You should now be redirected to the correct production URL

## 5. Alternative: Force Redirect in Code

If the above doesn't work immediately, you can add a temporary redirect in the auth callback:

```typescript
// In app/auth/callback/route.ts, add this at the top of the GET function:
const { searchParams, origin } = new URL(request.url)

// Force production URL if coming from localhost
if (origin.includes('localhost')) {
  const newUrl = request.url.replace('localhost:3000', 'onboard.devapphero.com').replace('http://', 'https://')
  return NextResponse.redirect(newUrl)
}
```

The main issue is that Google OAuth is configured to redirect to localhost instead of your production domain.