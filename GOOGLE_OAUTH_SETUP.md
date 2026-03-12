# Google OAuth 2.0 Integration Setup Guide

## Overview
This document provides step-by-step instructions for setting up Google OAuth 2.0 authentication in ExporTrack-AI. This integration allows users to securely log in with their Google accounts.

## ⚠️ Security Notice
- **Never** commit the `.env.local` file to version control (it's already in `.gitignore`)
- **Never** expose your Google Client Secret in frontend code
- Client IDs are safe to use in frontend JavaScript code
- Always verify tokens on your backend server in production

## Step 1: Set Up Google Cloud Project

### 1.1 Create a Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Sign in with your Google account
3. Click the project dropdown at the top
4. Click "NEW PROJECT"
5. Enter project name: **ExporTrack-AI** (or your preferred name)
6. Click "CREATE"

### 1.2 Enable Google Identity Services API
1. In the Console, go to **APIs & Services** > **Library**
2. Search for **"Google Identity"**
3. Click on **"Google Identity Service"**
4. Click the **"ENABLE"** button

### 1.3 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** > **Credentials**
2. Click **"CREATE CREDENTIALS"** button
3. Select **"OAuth client ID"**
4. You'll be prompted to create a consent screen first. Click **"CREATE CONSENT SCREEN"**

### 1.4 Configure OAuth Consent Screen
1. Select **"External"** user type (unless you have a Google Workspace)
2. Click **"CREATE"**
3. Fill in the required fields:
   - **App name**: ExporTrack-AI
   - **User support email**: your-email@example.com
   - **Developer contact**: your-email@example.com
4. Click **"SAVE AND CONTINUE"**
5. On "Scopes" page, click **"SAVE AND CONTINUE"** (default scopes are fine)
6. On "Test users" page, click **"SAVE AND CONTINUE"**
7. Click **"BACK TO DASHBOARD"**

### 1.5 Create OAuth Client ID
1. Go back to **APIs & Services** > **Credentials**
2. Click **"CREATE CREDENTIALS"** > **"OAuth client ID"**
3. Select **"Web application"**
4. Give it a name: **ExporTrack-AI Web**
5. Under **Authorized JavaScript origins**, click **"ADD URI"** and add:
   - `http://localhost:5173`
   - `http://localhost:5174`
   - `http://localhost:5175`
   - `http://localhost:5176`
   - (And any other local dev ports you use)
   - `https://yourdomain.com` (for production)

6. Under **Authorized redirect URIs**, click **"ADD URI"** and add:
   - `http://localhost:5173/dashboard`
   - `http://localhost:5174/dashboard`
   - `https://yourdomain.com/dashboard` (for production)

7. Click **"CREATE"**

### 1.6 Download Credentials JSON
1. A modal will appear showing your credentials
2. Click **"DOWNLOAD JSON"** button
3. A JSON file (typically named `client_secret_*.json`) will download
4. **Important**: Keep this file secure and never commit it

## Step 2: Configure ExporTrack-AI

### 2.1 Extract Client ID from JSON
1. Open the downloaded JSON file
2. Find the `"client_id"` field
3. It will look like: `XXXXXXXXXX-XXXXXXXXXXXXXXXXXXXX.apps.googleusercontent.com`
4. Copy this value

### 2.2 Create `.env.local` File
1. In the project root directory (`c:\Users\bheda\Music\Desktop\ExporTrack-AI`), create a new file named `.env.local`
2. Add the following content:

```env
VITE_API_BASE_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=your_client_id_here
```

Replace `your_client_id_here` with the Client ID you copied in step 2.1

### 2.3 Example `.env.local`
```env
VITE_API_BASE_URL=http://localhost:4000
VITE_GOOGLE_CLIENT_ID=170362832040-r48o6ch7nv3id7muo1g6935ms7u9oe2o.apps.googleusercontent.com
```

## Step 3: Restart Development Server

```bash
npm run dev
```

The development server will reload with the new environment variables.

## Step 4: Test Google Sign-In

1. Navigate to `http://localhost:5173` (or your dev port)
2. You should be redirected to the Auth page
3. Click **"Continue with Google"**
4. Google account selector popup should appear
5. Select your Google account
6. You should be logged in and redirected to the dashboard
7. Your profile picture, name, and email should display in the top-right corner

## Troubleshooting

### Error: "Google Sign-In is not configured"
- Make sure `.env.local` file exists in the project root
- Verify `VITE_GOOGLE_CLIENT_ID` is set correctly
- Restart the dev server after creating/modifying `.env.local`

### Error: "Not authorized to access this resource"
- Check that the Client ID matches your Google Cloud Console credentials
- Verify your authorized JavaScript origins include `http://localhost:5173`

### Google button doesn't appear
- Check browser console for errors
- Make sure Google SDK script loaded (check Network tab in DevTools)
- Verify `googleButtonRef.current` is mounted before rendering button

### Profile picture not showing
- Make sure Google account has a profile picture set
- Check that `picture` field exists in JWT token (browser console > Network > Google callback)

### Mobile login not working
- Ensure authorized origins include `http://192.168.x.x:5173` for local network testing
- Test on Android Chrome with `chrome://inspect`
- On iOS, use remote debugging or physical device with proper CORS setup

## Production Deployment

### For Browser-Based SPA:
1. Add your production domain to **Authorized JavaScript origins**:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

2. Add production redirect URIs:
   - `https://yourdomain.com/dashboard`
   - `https://www.yourdomain.com/dashboard`

3. Update `.env.production.local`:
```env
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_GOOGLE_CLIENT_ID=your_production_client_id
```

### Important: Backend Verification
Create an endpoint on your backend to verify the Google JWT token:

```javascript
// Example Node.js backend endpoint
app.post('/api/auth/verify-google', async (req, res) => {
  const token = req.body.token;
  
  // Verify token with Google
  const ticket = await client.verifyIdToken({
    idToken: token,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  
  const payload = ticket.getPayload();
  // Create session with verified data
  // Don't trust client-side token claims alone
});
```

## File Structure

```
ExporTrack-AI/
├── .env.example          # Template (commit to repo)
├── .env.local           # Actual config (gitignored)
├── .gitignore           # Should include .env.local
├── src/
│   ├── utils/
│   │   └── googleAuth.ts       # Google OAuth utilities
│   ├── context/
│   │   └── AppContext.tsx      # Auth state management
│   ├── pages/
│   │   └── AuthPage.tsx        # Login UI with Google button
│   └── components/
│       ├── UserProfileDropdown.tsx  # Profile menu
│       ├── AppLayout.tsx        # Header with profile
│       └── AppIcon.tsx         # Icons including profile picture
└── index.html           # Google SDK script tag
```

## API References

### Google Sign-In Documentation
- [Google Identity Services for Web](https://developers.google.com/identity/gsi/web)
- [OAuth 2.0 Playground](https://developers.google.com/oauthplayground)
- [ID Token Format](https://developers.google.com/identity/gsi/web/reference/js-reference#id_token)

### JWT Token Structure
The Google JWT token payload contains:
- `iss`: Issuer
- `aud`: Audience (your Client ID)
- `sub`: Subject (unique user ID)
- `email`: User email
- `email_verified`: Boolean
- `name`: User full name
- `picture`: Profile picture URL
- `given_name`: First name
- `family_name`: Last name
- `locale`: User locale
- `iat`: Issued at (timestamp)
- `exp`: Expiration (timestamp)

## Support

For issues with Google OAuth configuration:
1. Check [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
2. Review browser console for specific error messages
3. Verify .env.local file exists and has correct Client ID
4. Check Google Cloud Console quotas and API status
