# Checklist for Vercel Environment Variables

## Required Environment Variables:

1. **CRON_SECRET**
   - Must match the GitHub Secret
   - Generate if missing: 
     ```bash
     node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
     ```

2. **APPWRITE_COLLECTION_SHARE_ENCRYPTED_MESSAGES**
   - Must be set to your Appwrite collection ID
   - Check in Appwrite Console → Database → Collections

3. **APPWRITE_API_KEY**
   - Must have permissions to delete documents
   - Check: Appwrite Console → Settings → API Keys
   - Required scopes: `databases.read`, `databases.write`

4. **APP_URL** (in GitHub Secrets)
   - Should be: `https://kdsm.vercel.app`
   - NO trailing slash

## Verification Steps:

1. Go to: Vercel Dashboard → Your Project → Settings → Environment Variables
2. Check all variables are present for Production environment
3. After adding/updating, redeploy the project
