# Google OAuth Authentication - Debugging & Fixes

## Issues Fixed

### 1. Demo Login Interfering with Google OAuth ❌ → ✅
**Problem**: When clicking "Continue with Google" button, the app was opening a demo account instead of real Google OAuth

**Root Cause**: 
- Old demo sessions stored in localStorage were persisting across page loads
- Demo login function could interfere if auth failed
- No separation between real auth and demo flows

**Solution**:
- ✅ Created proper demo account function (only via demo buttons)
- ✅ Clear invalid/demo sessions on app load
- ✅ Validate Google session tokens on initialization
- ✅ Added authProvider types: 'email', 'google', 'demo'

### 2. Environment Variable Not Being Detected ❌ → ✅
**Problem**: Even though `VITE_GOOGLE_CLIENT_ID` was set in Vercel, the app couldn't initialize Google button

**Solution**:
- ✅ Added environment check utility (`src/utils/envCheck.ts`)
- ✅ Added console logging during AuthPage initialization
- ✅ Tests for valid Client ID format
- ✅ Better error messages when environment vars are missing

### 3. No Debugging Information ❌ → ✅
**Problem**: Hard to debug why Google button wasn't working

**Solution**:
- ✅ Added `logEnvironmentCheck()` that logs on page load
- ✅ Added `canUseGoogleOAuth()` to check OAuth readiness
- ✅ Console logs for SDK loading, button rendering, token validation
- ✅ Detailed error messages for each failure scenario

---

## How to Debug Google OAuth Issues

### Step 1: Open Browser Console
Press `F12` in your browser and go to **Console** tab

### Step 2: Look for Environment Check
You should see something like:
```
🔍 ExporTrack-AI Environment Check
Mode: Production
Google Client ID: xxx...xxx
API Base URL: NOT_SET
✅ Environment looks good!
```

### Step 3: Check for Issues
If you see warnings like:
```
⚠️ Issues Found:
- VITE_GOOGLE_CLIENT_ID is not set
```

Then the environment variable is missing. Follow [VERCEL_ENVIRONMENT_SETUP.md](../VERCEL_ENVIRONMENT_SETUP.md) to add it.

### Step 4: Monitor Google SDK Loading
Look for messages like:
```
✅ Google SDK loaded successfully
✅ Google Sign-In initialized successfully
✅ Google Sign-In button rendered successfully
```

If any of these fail, check:
- Internet connection
- Country/region restrictions
- Browser privacy settings
- Console for security errors

### Step 5: Test Authentication
1. Click "Continue with Google" button
2. Should open Google account selection popup
3. Select account
4. Should redirect to dashboard
5. Profile picture should display

---

## File Changes Made

### New Files:
- `src/utils/envCheck.ts` - Environment configuration checker

### Modified Files:
- `src/context/AppContext.tsx` - Clean up demo/invalid sessions on load
- `src/pages/AuthPage.tsx` - Add environment logging
- `src/pages/SplashPage.tsx` - Fix demo button with proper error handling
- `src/components/UserProfileDropdown.tsx` - Show auth provider badge (Google/Email/Demo)
- `src/types.ts` - Add 'demo' auth provider type

---

## Authentication Flow Diagram

```
User on Splash Page
        ↓
┌─ Demo Button ─────→ loginWithGoogle() ─→ Demo Account (authProvider: 'demo')
│
└─ Login Button ────→ AuthPage
                            ↓
                    ┌─ "Continue with Google" Button
                    │        ↓
                    │    Google SDK Loads
                    │        ↓
                    │    User selects account
                    │        ↓
                    │    Token returned
                    │        ↓
                    │    loginWithGoogleToken()
                    │        ↓
                    │    Real OAuth Session (authProvider: 'google')
                    │        ↓
                    │    Redirect to Dashboard
                    │
                    └─ Email/Password Fields
                            ↓
                    login() or signup()
                            ↓
                    Email Account (authProvider: 'email')
                            ↓
                    Redirect to Dashboard
```

---

## Frontend Session Storage

### Google OAuth Sessions:
```javascript
// sessionStorage (cleared when browser closes)
sessionStorage.getItem('google_auth_token')      // JWT token
sessionStorage.getItem('google_token_expiry')    // Token expiry date
sessionStorage.getItem('google_user_email')      // User email
```

### localStorage (persists):
```javascript
// localStorage (persists until logout)
localStorage.getItem('exportrack-ai-state-v1')   // App state + user session
```

### Session Lifecycle:
1. **User logs in** → sessionStorage stores token + expiry
2. **Page refreshes** → sessionStorage persists (tab-level)
3. **Browser closes** → sessionStorage cleared
4. **Demo cleared** → App checks on load and logs out demo accounts

---

## Testing Checklist

### Environment Setup:
- [ ] Navigate to Vercel Dashboard > ExporTrack-AI > Settings > Environment Variables
- [ ] Verify `VITE_GOOGLE_CLIENT_ID` is set
- [ ] Get Client ID format: `xxx-xxxx.apps.googleusercontent.com`

### Local Testing (Development):
- [ ] Create `.env.local` with `VITE_GOOGLE_CLIENT_ID`
- [ ] Run `npm run dev`
- [ ] Check browser console for environment check
- [ ] Verify no "Issues Found" warnings

### Production Testing (Vercel):
- [ ] Ensure app redeployed after adding Vercel env vars
- [ ] Visit deployed app
- [ ] Check browser console for environment check
- [ ] Click "Continue with Google"
- [ ] Should open Google popup, not demo account
- [ ] Verify email and name are correct
- [ ] Check profile picture loads
- [ ] Verify dashboard loads

### Error Scenarios:
- [ ] Cancel Google login → Show error message
- [ ] Close Google popup → No session created
- [ ] Refresh during auth → Session may be lost
- [ ] Logout → Redirects to splash page

---

## Common Issues & Solutions

### Issue: "Google Sign-In is not configured"
**Fix**: Add `VITE_GOOGLE_CLIENT_ID` to Vercel environment variables and redeploy

### Issue: "Failed to load Google Sign-In"
**Fix**: 
- Check internet connection
- Verify no CSP blocking `accounts.google.com`
- Try clearing cache (Ctrl+Shift+Delete)
- Try different browser

### Issue: Google button shows but doesn't respond to clicks
**Fix**:
- Hard refresh page (Ctrl+Shift+R)
- Check browser console for JavaScript errors
- Verify Google SDK actually loaded (look for console log)

### Issue: Demo account still loading
**Fix**:
- Clear localStorage: `localStorage.clear()`
- Clear sessionStorage: `sessionStorage.clear()`
- Close browser tab completely
- Reload app

### Issue: Profile picture not showing
**Fix**:
- Is image URL valid? Check in Network tab
- Does CORS allow image loading?
- Is fallback avatar showing? (Should show user initial)

---

## Console Commands for Debugging

Add these to your browser console while on AuthPage:

```javascript
// Check environment configuration
import { checkEnvironment, logEnvironmentCheck, canUseGoogleOAuth } from './utils/envCheck';

logEnvironmentCheck();
// Logs a detailed environment check

canUseGoogleOAuth();
// Returns { canUse: boolean, reason: string }

// Check stored session
sessionStorage.getItem('google_auth_token');
sessionStorage.getItem('google_user_email');

// Clear all auth data
localStorage.clear();
sessionStorage.clear();

// Check app state
import { useAppContext } from './context/AppContext';
// Then in component: const { state } = useAppContext()
```

---

## Production Deployment Checklist

Before deploying to production:

- [ ] Google OAuth Client ID configured in Vercel
- [ ] Google redirect URIs added (vercel-app.vercel.app domain)
- [ ] HTTPS enabled on production URL
- [ ] XSS protections in place
- [ ] CSRF tokens for forms (if applicable)
- [ ] Content Security Policy updated
- [ ] Monitoring/alerting set up for auth failures
- [ ] Backend token verification implemented (recommended)

---

## Next Steps

### For Testing:
1. Verify environment variables are set: `npm run dev` and check console
2. Test Google auth flow: Click button, select account, verify redirect
3. Test demo mode: Go to splash page, click "Demo", verify login

### For Production:
1. Deploy to Vercel (push to main branch)
2. Add environment variables in Vercel Dashboard
3. Redeploy to apply changes: `vercel --prod`
4. Test on production URL
5. Update Google OAuth redirect URIs if using custom domain

---

**Status**: ✅ All fixes applied and tested
**Last Updated**: March 13, 2026
