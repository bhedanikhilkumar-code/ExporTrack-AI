# Vercel Environment Variables Setup Guide

## Overview
This guide provides step-by-step instructions for configuring Google OAuth environment variables in Vercel for the ExporTrack-AI application.

## Prerequisites
- Vercel CLI installed (`npm i -g vercel`) or access to Vercel Dashboard
- Google OAuth Client ID and Client Secret ready
- Vercel project linked to ExporTrack-AI repository

## Step 1: Understanding Environment Variables in This Project

### Frontend Environment Variables (Exposed to Browser)
Frontend variables must be prefixed with `VITE_` to be accessible via `import.meta.env`:

- **VITE_GOOGLE_CLIENT_ID** - Your Google OAuth Client ID (safe to expose)
- **VITE_API_BASE_URL** - Backend API base URL (optional, for future use)

### Backend Environment Variables (Secrets)
These should NOT be prefixed with `VITE_` if you have a backend:

- **GOOGLE_CLIENT_SECRET** - Your Google Client Secret (should never be exposed to frontend)
- **GOOGLE_CLIENT_ID** - Backup copy of Client ID

## Step 2: Add Variables via Vercel Dashboard

### 2.1 Navigate to Project Settings
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your **ExporTrack-AI** project
3. Click **Settings** tab
4. From the left sidebar, click **Environment Variables**

### 2.2 Add VITE_GOOGLE_CLIENT_ID
1. Click **Add New**
2. Fill in the form:
   - **Name:** `VITE_GOOGLE_CLIENT_ID`
   - **Value:** Your Google Client ID (e.g., `170362832040-r48o6ch7nv3id7muo1g6935ms7u9oe2o.apps.googleusercontent.com`)
   - **Environments:** Select all (Development, Preview, Production)
3. Click **Save**

### 2.3 Add VITE_API_BASE_URL (Optional)
1. Click **Add New**
2. Fill in the form:
   - **Name:** `VITE_API_BASE_URL`
   - **Value:** Your backend URL (e.g., `https://api.yourdomain.com`)
   - **Environments:** Choose based on your environment needs
3. Click **Save**

### 2.4 Add Backend Secrets (If You Have a Backend)
1. Click **Add New**
2. Fill in the form:
   - **Name:** `GOOGLE_CLIENT_SECRET`
   - **Value:** Your Google Client Secret (keep this secure!)
   - **Environments:** Production only (and Preview if needed for testing)
3. Click **Save**

## Step 3: Add Variables via Vercel CLI

If you prefer command-line setup:

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Link project (if not already linked)
vercel link

# Add environment variables
vercel env add VITE_GOOGLE_CLIENT_ID
# Paste your Google Client ID when prompted

vercel env add VITE_API_BASE_URL  
# Paste your API base URL when prompted

vercel env add GOOGLE_CLIENT_SECRET
# Paste your Google Client Secret when prompted
```

## Step 4: Verify Environment Variables

### 4.1 In Vercel Dashboard
1. Go to **Settings** > **Environment Variables**
2. Verify all three variables are listed:
   - ✅ VITE_GOOGLE_CLIENT_ID (visible, prefixed with VITE_)
   - ✅ VITE_API_BASE_URL (visible, prefixed with VITE_)
   - ✅ GOOGLE_CLIENT_SECRET (hidden, not prefixed with VITE_)

### 4.2 Test Locally with .env.local
1. Create `.env.local` in project root (if not already exists)
2. Add your local development variables:

```env
VITE_GOOGLE_CLIENT_ID=170362832040-r48o6ch7nv3id7muo1g6935ms7u9oe2o.apps.googleusercontent.com
VITE_API_BASE_URL=http://localhost:4000
```

3. Start development server:
```bash
npm run dev
```

4. The Google Sign-In button should now work

## Step 5: Update Google OAuth Redirect URIs

Ensure your Google Cloud project includes Vercel deployment URLs:

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Select your ExporTrack-AI project
3. Go to **APIs & Services** > **Credentials**
4. Click on your OAuth 2.0 Client ID
5. Under **Authorized redirect URIs**, add:
   - `https://your-vercel-app.vercel.app/dashboard`
   - `https://yourdomain.com/dashboard` (if using custom domain)

## Step 6: Deploy to Vercel

### 6.1 Using Git (Recommended)
```bash
# Push to main branch
git add .
git commit -m "feat: Configure Google OAuth for Vercel"
git push origin main
```

Vercel will automatically deploy and use the environment variables.

### 6.2 Using Vercel CLI
```bash
vercel --prod
```

## Troubleshooting

### "Google Sign-In is not configured"
- ✅ Verify `VITE_GOOGLE_CLIENT_ID` is set in Vercel
- ✅ Rebuild and redeploy: `vercel --prod`
- ✅ Check browser DevTools > Application > Local Storage for the variable

### "Google SDK not loaded"
- ✅ Check internet connection
- ✅ Verify Content Security Policy allows `accounts.google.com`
- ✅ Clear browser cache and hard refresh (Ctrl+Shift+R)

### "Google sign-in failed" during OAuth
- ✅ Verify your Vercel domain is in Google OAuth redirect URIs
- ✅ Ensure `GOOGLE_CLIENT_SECRET` is configured on backend (if you have one)
- ✅ Check browser console for specific error messages

### "Invalid token or missing email"
- ✅ Ensure Google account has email verified
- ✅ Check token hasn't expired (token expires ~1 hour)
- ✅ Verify token payload includes email claim

## Security Best Practices

### ✅ DO:
- Store Client Secret in backend-only environment variables (no VITE_ prefix)
- Use HTTPS only in production
- Verify tokens on your backend server before creating sessions
- Rotate Client IDs and Secrets periodically
- Monitor and log authentication failures

### ❌ DON'T:
- Commit `.env.local` or any secrets to git (already in `.gitignore`)
- Expose Client Secret in frontend code or browser console
- Log full tokens in production
- Use the same credentials for multiple environments without rotation
- Share environment variables via insecure channels

## Environment Variable Reference

| Variable | Visibility | Environment | Purpose |
|----------|-----------|-------------|---------|
| VITE_GOOGLE_CLIENT_ID | Frontend | All | Google OAuth Client ID |
| VITE_API_BASE_URL | Frontend | All | Backend API endpoint |
| GOOGLE_CLIENT_SECRET | Backend Only | Production | Google OAuth Client Secret |

## Additional Resources

- [Vercel Environment Variables Documentation](https://vercel.com/docs/concepts/projects/environment-variables)
- [Google OAuth Setup Guide](./GOOGLE_OAUTH_SETUP.md)
- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Google Identity Services Documentation](https://developers.google.com/identity/gsi/web)

## Need Help?

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all environment variables are set correctly
4. Check that your Google OAuth credentials are valid
5. Ensure Vercel has been redeployed after adding environment variables
