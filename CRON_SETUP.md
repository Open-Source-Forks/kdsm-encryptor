# CRON Job Setup for Shared Message Expiration

## Overview
This project uses **GitHub Actions** to automatically cleanup expired shared encrypted messages every 5 minutes. GitHub Actions is free for public repos and has no cron job limits (unlike Vercel's 2-job limit).

## Configuration

### 1. Generate Secrets

**Generate a secure CRON_SECRET:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### 2. Add GitHub Secrets
Go to your GitHub repository:
1. Navigate to **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Add these secrets:

| Secret Name | Description | Example |
|------------|-------------|---------|
| `CRON_SECRET` | Authentication token for cron endpoint | `abc123def456...` |
| `APP_URL` | Your production URL (without trailing slash) | `https://kdsm.vercel.app` |

### 3. GitHub Actions Workflow
The workflow is configured in `.github/workflows/cleanup-expired-messages.yml`:

```yaml
on:
  schedule:
    - cron: '*/5 * * * *'  # Every 5 minutes
  workflow_dispatch:        # Manual trigger option
```

**Common cron patterns:**
- `*/5 * * * *` - Every 5 minutes
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Daily at midnight

### 4. Deployment
1. Push your code to GitHub
2. GitHub Actions will automatically start running
3. Verify in the **Actions** tab of your repository

### 5. Verify Cron is Working
Check GitHub Actions logs:
1. Go to your GitHub repository
2. Click **Actions** tab
3. Look for "Cleanup Expired Messages" workflow runs
4. Each run shows execution logs and results

Expected output:
```json
{
  "success": true,
  "message": "Cleanup completed successfully",
  "stats": {
    "checked": 10,
    "deleted": 3,
    "remaining": 7,
    "timestamp": "2025-12-03T10:30:00.000Z"
  }
}
```

## How It Works

1. **Message Creation**: When a user creates a shareable link:
   - Message stored with `$createdAt` timestamp
   - `expire_seconds` field determines lifetime

2. **Expiration Calculation**:
   ```
   expiresAt = $createdAt + expire_seconds
   ```

3. **GitHub Actions Cron**: Every 5 minutes:
   - GitHub triggers the workflow
   - Sends authenticated request to your API
   - API fetches all shared messages
   - Checks if `current_time > expiresAt`
   - Deletes expired messages

4. **API Check**: When user accesses link:
   - Server checks expiration before serving
   - Returns 410 Gone if expired
   - Client-side countdown shows time remaining

## Manual Testing

### Trigger from GitHub
1. Go to **Actions** tab in your repository
2. Select "Cleanup Expired Messages" workflow
3. Click **Run workflow** → **Run workflow**
4. Check the logs to see results

### Local Development
You can manually trigger the cleanup:

```bash
curl -X POST http://localhost:3000/api/cron/cleanup-expired-messages \
  -H "Authorization: Bearer your-cron-secret"
```

### Production
```bash
curl -X POST https://kdsm.vercel.app/api/cron/cleanup-expired-messages \
  -H "Authorization: Bearer your-cron-secret"
```

## Security Notes

1. **CRON_SECRET** protects the endpoint from unauthorized access
2. Stored securely in GitHub Secrets (encrypted)
3. The API validates the Authorization header
4. Never commit `CRON_SECRET` to version control
5. GitHub Secrets are not accessible in pull requests from forks

## Monitoring

Check these for cron job health:
- **GitHub Actions Tab**: See all workflow runs with timestamps
- **Workflow Logs**: Detailed execution logs for each run
- **Email Notifications**: Get notified on workflow failures
- **Appwrite Database**: Verify old messages are being deleted

## Troubleshooting

### Cron not running?
1. Check **Actions** tab for workflow runs
2. Verify secrets `CRON_SECRET` and `APP_URL` are set
3. Make sure workflow file is in `.github/workflows/`
4. Check if Actions are enabled: Settings → Actions → Allow all actions

### 401 Unauthorized?
- `CRON_SECRET` in GitHub Secrets doesn't match your `.env`
- Check the secret name is exactly `CRON_SECRET` (case-sensitive)

### Workflow fails?
1. Check the workflow logs in Actions tab
2. Verify `APP_URL` doesn't have trailing slash
3. Ensure your app is deployed and accessible

### Messages not deleting?
1. Check Appwrite API key permissions
2. Verify collection ID is correct in environment variables
3. Check API endpoint logs in Vercel

## GitHub Actions Advantages

✅ **Completely free** for public repos
✅ **2,000 free minutes/month** for private repos
✅ **Unlimited cron jobs** (no 2-job Vercel limit)
✅ **Runs independently** from your deployment
✅ **Easy monitoring** via Actions tab
✅ **Manual trigger** option via workflow_dispatch
✅ **No build conflicts** with Vercel

## Cost & Limits

**GitHub Actions (Free tier):**
- Public repos: **Unlimited** minutes
- Private repos: **2,000 minutes/month**
- Current usage: ~2 seconds per run × 288 runs/day = **9.6 minutes/day**
- **Monthly usage**: ~288 minutes (well within free tier)

**Comparison:**
| Service | Free Tier | Current Setup Cost |
|---------|-----------|-------------------|
| GitHub Actions | 2000 min/mo | ~288 min/mo ✅ FREE |
| Vercel Hobby | 1 cron job | ❌ Not enough |
| Vercel Pro | 100 runs/day | ❌ Exceeds limit |

## Alternative Schedules

Adjust the cron schedule in the workflow file if needed:

```yaml
# Every 1 minute (for testing)
- cron: '* * * * *'

# Every 10 minutes (reduce API calls)
- cron: '*/10 * * * *'

# Every 15 minutes (more conservative)
- cron: '*/15 * * * *'

# Every hour (minimal usage)
- cron: '0 * * * *'
```
