# Google OAuth Error Fix

## Error: "Authorization Error - App doesn't comply with Google's OAuth 2.0 policy"

### Required Google Console Setup:

1. **Go to Google Cloud Console** → APIs & Services → Credentials
2. **Edit your OAuth 2.0 Client ID**
3. **Add these Authorized JavaScript origins:**
   ```
   http://localhost:3000
   https://your-domain.com
   ```
4. **Add these Authorized redirect URIs:**
   ```
   http://localhost:3000/auth/callback
   https://your-domain.com/auth/callback
   ```
5. **OAuth consent screen** → Edit app:
   - App name: "Onboard Hero"
   - User support email: leadond@gmail.com
   - Developer contact: leadond@gmail.com
   - Add your domain to Authorized domains
6. **Publish app** (change from Testing to Production)

### Quick Test Fix:
Add your email to Test users in OAuth consent screen → Test users → Add users → leadond@gmail.com

### Verification:
- App must be published OR you must be added as test user
- Redirect URIs must match exactly
- JavaScript origins must include your domain