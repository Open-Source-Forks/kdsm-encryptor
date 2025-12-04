# GitHub Actions Cleanup Workflow Debugging Guide

## Problem
Messages are not being deleted by the GitHub Actions workflow, but they are deleted when users visit the expired URL.

## Step-by-Step Debugging Process

### Step 1: Verify GitHub Secrets
1. Go to your GitHub repository
2. Navigate to: **Settings → Secrets and variables → Actions**
3. Verify these secrets exist:
   - `CRON_SECRET` - Must match your Vercel environment variable
   - `APP_URL` - Should be `https://kdsm.vercel.app` (no trailing slash)

**Generate CRON_SECRET if missing:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Step 2: Verify Vercel Environment Variables
1. Go to: **Vercel Dashboard → kdsm-encryptor → Settings → Environment Variables**
2. Ensure these are set for **Production**:
   - `CRON_SECRET` - Same value as GitHub Secret
   - `APPWRITE_API_KEY` - Must have delete permissions
   - `APPWRITE_COLLECTION_SHARE_ENCRYPTED_MESSAGES` - Collection ID

3. **After adding/updating variables, redeploy:**
   - Go to Deployments → Latest → ⋯ → Redeploy

### Step 3: Test Local Endpoint
```powershell
# Run your dev server
npm run dev

# In another terminal, run the test script:
# Edit test-cleanup-endpoint.ps1 first - add your CRON_SECRET
./test-cleanup-endpoint.ps1
```

**Expected output:**
```json
{
  "success": true,
  "stats": {
    "checked": X,
    "deleted": Y,
    "remaining": Z
  }
}
```

### Step 4: Test Production Endpoint
```powershell
# Edit test-production-cleanup.ps1 first - add your CRON_SECRET
./test-production-cleanup.ps1
```

**Common errors:**
- **401 Unauthorized**: CRON_SECRET mismatch or missing in Vercel
- **500 Error**: Check Appwrite credentials or collection ID
- **Connection refused**: Wrong APP_URL

### Step 5: Check GitHub Actions Logs
1. Go to: **GitHub Repository → Actions → Cleanup Expired Messages**
2. Click on the latest workflow run
3. Expand the "Cleanup expired shared messages" step
4. Look for:
   - HTTP response code (should be 200)
   - Response body with stats
   - Any curl errors

**Manual trigger:**
- Click "Run workflow" button to test immediately

### Step 6: Check Vercel Logs
1. Go to: **Vercel Dashboard → kdsm-encryptor → Logs**
2. Filter by: `/api/cron/cleanup-expired-messages`
3. Look for `[CRON]` prefixed log messages:
   ```
   [CRON] Cleanup job started at: ...
   [CRON] Auth header present: true
   [CRON] Authorization successful
   [CRON] Found X messages to check
   [CRON] Deleting expired message: ...
   [CRON] ✓ Deleted message: ...
   ```

### Step 7: Verify Appwrite API Key Permissions
1. Go to: **Appwrite Console → Settings → API Keys**
2. Find your API key
3. Ensure it has these scopes:
   - `databases.read`
   - `databases.write`
4. If not, create a new API key with proper scopes

### Step 8: Check Appwrite Collection Settings
1. Go to: **Appwrite Console → Databases → Collections**
2. Find `shared_enc_messages` collection
3. Note the Collection ID
4. Go to **Settings** tab
5. Check **Permissions**:
   - API Key should have read/write access
   - Or set to "All roles" with proper document security

## Common Issues & Solutions

### Issue 1: "Unauthorized" (401)
**Cause:** CRON_SECRET mismatch
**Solution:**
1. Regenerate CRON_SECRET
2. Update in both GitHub Secrets AND Vercel Environment Variables
3. Redeploy on Vercel
4. Re-run GitHub Actions workflow

### Issue 2: Messages not being deleted but endpoint returns success
**Cause:** Wrong collection ID or insufficient permissions
**Solution:**
1. Verify `APPWRITE_COLLECTION_SHARE_ENCRYPTED_MESSAGES` in Vercel
2. Check Appwrite API key has write permissions
3. Look for deletion errors in Vercel logs

### Issue 3: GitHub Actions shows "Connection refused"
**Cause:** Wrong APP_URL or site not accessible
**Solution:**
1. Verify APP_URL in GitHub Secrets: `https://kdsm.vercel.app`
2. Check your Vercel deployment is live
3. Test URL manually: `curl https://kdsm.vercel.app/api/health`

### Issue 4: Endpoint works manually but not from GitHub Actions
**Cause:** Secrets not properly configured in GitHub
**Solution:**
1. Double-check secret names are EXACT (case-sensitive)
2. Ensure secrets are set at Repository level, not Environment level
3. Re-run workflow after confirming secrets

## Verification Checklist

- [ ] CRON_SECRET exists in both GitHub Secrets and Vercel
- [ ] CRON_SECRET values match exactly
- [ ] APP_URL in GitHub Secrets is correct (no trailing slash)
- [ ] APPWRITE_API_KEY in Vercel has delete permissions
- [ ] APPWRITE_COLLECTION_SHARE_ENCRYPTED_MESSAGES is set in Vercel
- [ ] Vercel project redeployed after env var changes
- [ ] Local test script returns success
- [ ] Production test script returns success
- [ ] GitHub Actions workflow runs without curl errors
- [ ] Vercel logs show [CRON] messages
- [ ] Test message gets deleted after expiration

## Quick Test

Create a test message with 5-minute expiry, then:

1. **Wait 6 minutes**
2. **Manually trigger GitHub Actions**: Actions → Cleanup → Run workflow
3. **Check Vercel logs** for deletion confirmation
4. **Verify in Appwrite** that document is deleted
5. **Try accessing the URL** - should show "Message Not Found"

If deletion doesn't happen, check Vercel logs for the actual error message.
