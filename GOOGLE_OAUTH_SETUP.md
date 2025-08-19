# Google OAuth Setup Instructions

## 1. Google Cloud Console Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set Application type to "Web application"
6. Add Authorized redirect URIs:
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```

## 2. Supabase Configuration

1. Go to your Supabase project dashboard
2. Navigate to Authentication → Providers
3. Enable Google provider
4. Add your Google OAuth credentials:
   - Client ID: `your-google-client-id`
   - Client Secret: `your-google-client-secret`

## 3. Environment Variables

Add to your `.env.local`:
```bash
# These are automatically used by Supabase
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## 4. Test the Setup

1. Start your development server: `npm run dev`
2. Go to `/login`
3. Click "Continue with Google"
4. Should redirect to Google, then back to `/dashboard`

## Troubleshooting

- **Redirect loop**: Check that callback URL matches exactly
- **Invalid client**: Verify Client ID in Supabase matches Google Console
- **Unauthorized**: Check redirect URIs in Google Console
- **CORS errors**: Ensure domain is added to authorized origins

The callback URL should be: `https://your-domain.com/auth/callback`