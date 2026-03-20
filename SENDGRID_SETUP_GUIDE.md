# SendGrid API Key Setup Guide for ExporTrack-AI

## Step-by-Step Instructions to Get SendGrid API Key

### **Step 1: Create SendGrid Account**
1. Go to [https://sendgrid.com/free](https://sendgrid.com/free)
2. Click **"Get Started Free"** or **"Sign Up"**
3. Fill in your details:
   - Email address (use your company/personal email)
   - Password
   - Basic account information
4. Click **"Create Account"**
5. Verify your email address when SendGrid sends a confirmation link

### **Step 2: Access API Keys Section**
1. Log in to your SendGrid account at [https://app.sendgrid.com](https://app.sendgrid.com)
2. In the left sidebar, click **"Settings"** (gear icon)
3. Select **"API Keys"** from the dropdown menu
4. You'll see the API Keys management page

### **Step 3: Create API Key**
1. Click the **"Create API Key"** button (top right)
2. Choose **"Full Access"** for simplicity (recommended for development)
   - *Alternative*: Choose **"Restricted Access"** and manually select:
     - **Mail Send** → **Full Access** (this is the minimum required)
3. Give your key a name like: `ExporTrack-AI-Invitations`
4. Click **"Create & View"**

### **Step 4: Copy Your API Key**
1. **IMPORTANT**: Your API key will only be shown ONCE
2. Copy the entire key that looks like: `SG.xxxxxxxx.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
3. **Save it securely** - you won't be able to view it again!
4. If you lose it, you'll need to create a new key

### **Step 5: Add to Your Environment**
1. Open your project's `.env.local` file
2. Add this line:
   ```
   SENDGRID_API_KEY=your_actual_sendgrid_api_key_here
   ```
   Replace `your_actual_sendgrid_api_key_here` with the key you copied
3. Also add (if not present):
   ```
   FROM_EMAIL=noreply@yourdomain.com
   NEXT_PUBLIC_APP_URL=http://localhost:5173
   ```
4. Save the file

### **Step 6: Test the Configuration**
1. Restart your development server: `npm run dev`
2. Try sending a test invitation
3. Check your email inbox (and spam folder) for the invitation
4. If successful, you'll see the email with "Accept Invitation" button

## 🔒 Security Notes
- **Never commit API keys to git**: `.env.local` is already in `.gitignore`
- **Use environment-specific keys**: Consider different keys for dev/staging/prod
- **Rotate keys periodically**: For security best practices
- **Monitor usage**: Check SendGrid dashboard for email statistics

## 🔄 Alternative: Use Resend Instead
If you prefer Resend (mentioned in `.env.example`):
1. Go to [https://resend.com](https://resend.com)
2. Sign up and verify your domain
3. Create API key from "API Keys" section
4. Add to `.env.local`:
   ```
   RESEND_API_KEY=your_resend_api_key_here
   FROM_EMAIL=onboarding@resend.dev
   NEXT_PUBLIC_APP_URL=http://localhost:5173
   ```

## 📝 Troubleshooting Tips
- **Email not arriving?** Check spam/junk folder
- **Still not working?** Verify:
  - API key is correctly copied (no extra spaces)
  - `.env.local` is in project root
  - Development server restarted after env changes
  - You're using a valid email address for testing
- **SendGrid free tier**: 100 emails/day - plenty for testing

Once configured, your invitation system will send actual emails instead of just showing in-app notifications, solving the issue you reported.