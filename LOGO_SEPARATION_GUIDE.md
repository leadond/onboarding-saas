# Logo Separation Implementation Guide

## Overview

This document outlines the implementation of proper logo separation between app logos (owner-controlled) and kit logos (client-controlled) in the onboarding platform.

## Architecture

### App Logo (Owner-Controlled)
- **Location**: Managed through environment variables
- **Access**: Only Global Admin (app owner) can change
- **Usage**: Main navigation, login page, system-wide branding
- **Component**: `AppLogo` (`/components/branding/app-logo.tsx`)

### Kit Logo (Client-Controlled)
- **Location**: Stored in kit settings database
- **Access**: Super Admins can change for their clients
- **Usage**: Kit portal headers, client-specific branding
- **Component**: `KitLogo` (`/components/branding/kit-logo.tsx`)

## Environment Variables (App Logo Configuration)

Add these to your `.env.local` file to customize the app logo:

```bash
# App Logo URL - Set to a public URL of your app logo image
# Leave empty to use the default LogoIcon
NEXT_PUBLIC_APP_LOGO_URL=https://your-domain.com/logo.png

# App Name - Your application name
NEXT_PUBLIC_APP_NAME=Your App Name

# App Tagline - Your application tagline/subtitle
NEXT_PUBLIC_APP_TAGLINE=Your App Tagline
```

## Role-Based Access Control

### Global Admin (App Owner)
- ✅ Can change app logo via environment variables
- ✅ Can change kit logos for any client
- ✅ Full access to branding management

### Super Admin (Client Admin)
- ❌ Cannot change app logo
- ✅ Can change kit logos for their own clients
- ✅ Limited branding access

### Other Roles
- ❌ Cannot change app logo
- ❌ Cannot change kit logos
- ❌ View-only access

## Implementation Details

### Components Created

1. **AppLogo Component** (`/components/branding/app-logo.tsx`)
   - Displays app logo with fallback to default icon
   - Configurable via environment variables
   - Multiple size and variant options

2. **KitLogo Component** (`/components/branding/kit-logo.tsx`)
   - Displays client-specific kit logos
   - Fallback to building icon when no logo set
   - Used in kit portal headers

3. **LogoManagement Component** (`/components/branding/logo-management.tsx`)
   - Role-based logo management interface
   - Separate sections for app and kit logos
   - Clear access control messaging

### Pages Updated

1. **Protected Layout** (`/app/(protected)/layout.tsx`)
   - Now uses AppLogo component
   - Consistent app branding

2. **Login Page** (`/components/auth/LoginLandingWrapper.tsx`)
   - Updated to use AppLogo component
   - Maintains branding consistency

3. **Kit Header** (`/components/kit-portal/kit-header.tsx`)
   - Now uses KitLogo component
   - Shows client-specific branding

4. **Branding Page** (`/app/(protected)/dashboard/branding/page.tsx`)
   - Added LogoManagement component
   - Role-based access control

5. **Kit Settings** (`/app/(protected)/dashboard/kits/[kitId]/settings/page.tsx`)
   - Added role checking for logo editing
   - Clear messaging about access restrictions

## Security Features

- Environment variables can only be changed by app owner with server access
- Database-level role checking prevents unauthorized logo changes
- Clear UI messaging about access restrictions
- Separate storage and management for different logo types

## Usage Examples

### Changing App Logo (Global Admin Only)

1. Upload your logo to a public URL (e.g., `/public/app-logo.png`)
2. Update environment variables:
   ```bash
   NEXT_PUBLIC_APP_LOGO_URL=/app-logo.png
   NEXT_PUBLIC_APP_NAME=My Company
   NEXT_PUBLIC_APP_TAGLINE=Professional Services
   ```
3. Restart the application

### Changing Kit Logo (Super Admin)

1. Navigate to Kit Settings → Branding
2. Enter the logo URL in the "Kit Logo URL" field
3. Save settings
4. Logo will appear in the kit portal header

## File Structure

```
components/
├── branding/
│   ├── app-logo.tsx          # App logo component
│   ├── kit-logo.tsx          # Kit logo component
│   └── logo-management.tsx   # Logo management interface
└── kit-portal/
    └── kit-header.tsx        # Updated to use KitLogo

app/(protected)/
├── layout.tsx                # Updated to use AppLogo
└── dashboard/
    ├── branding/page.tsx     # Logo management page
    └── kits/[kitId]/settings/page.tsx  # Kit settings with role control
```

## Migration Notes

- Old upload server script moved to `/scripts/upload-logo-server.js`
- No breaking changes to existing functionality
- Existing kit logos continue to work
- Default app branding maintained if no environment variables set

## Testing

To test the role-based access:

1. **As Global Admin**: Should see app logo management instructions
2. **As Super Admin**: Should be able to edit kit logos but not app logo
3. **As Regular User**: Should see view-only access with appropriate messaging

## Troubleshooting

### App Logo Not Showing
- Check environment variables are set correctly
- Ensure logo URL is publicly accessible
- Restart application after environment changes

### Kit Logo Not Updating
- Verify user has Super Admin role
- Check logo URL is valid and accessible
- Ensure kit settings are being saved properly

### Access Denied Messages
- Confirm user role is correct in database
- Check role-based access control logic
- Verify API endpoints are working correctly