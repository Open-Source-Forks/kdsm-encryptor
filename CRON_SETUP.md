# CRON Job Setup for Shared Message Expiration

## Overview
This project uses Vercel Cron Jobs to automatically cleanup expired shared encrypted messages every 5 minutes.

## Configuration

### 1. Environment Variables
Add this to your `.env.local` and Vercel environment variables:

```bash
CRON_SECRET=your-secure-random-string-here
```

**Generate a secure secret:**
```bash
# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Or using OpenSSL
openssl rand -hex 32
```

### 2. Vercel Cron Configuration
The cron job is configured in `vercel.json`:

```json
{
  "crons": [
    {
      "path": "/api/cron/cleanup-expired-messages",
      "schedule": "*/5 * * * *"
    }
  ]
}
```

**Schedule**: Runs every 5 minutes (`*/5 * * * *`)

**Common cron patterns:**
- `*/5 * * * *` - Every 5 minutes
- `*/15 * * * *` - Every 15 minutes
- `0 * * * *` - Every hour
- `0 0 * * *` - Daily at midnight

### 3. Deployment
1. Push your code to GitHub
2. Deploy to Vercel
3. Add `CRON_SECRET` to Vercel Environment Variables:
   - Go to your project settings → Environment Variables
   - Add `CRON_SECRET` with your generated value
   - Redeploy for changes to take effect

### 4. Verify Cron is Working
Check Vercel logs:
1. Go to your Vercel project dashboard
2. Navigate to "Logs" tab
3. Look for cron execution logs every 5 minutes

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

3. **Cron Job**: Every 5 minutes:
   - Fetches all shared messages
   - Checks if `current_time > expiresAt`
   - Deletes expired messages

4. **API Check**: When user accesses link:
   - Server checks expiration before serving
   - Returns 410 Gone if expired
   - Client-side countdown shows time remaining

## Manual Testing

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
2. Only Vercel's cron service should know this secret
3. The API validates the Authorization header
4. Never commit `CRON_SECRET` to version control

## Monitoring

Check these for cron job health:
- **Vercel Logs**: Real-time execution logs
- **Function Duration**: Should be < 10 seconds
- **Error Rate**: Should be near 0%
- **Appwrite Database**: Verify old messages are being deleted

## Troubleshooting

### Cron not running?
1. Verify `vercel.json` is in project root
2. Check Vercel deployment logs
3. Ensure `CRON_SECRET` is set in Vercel

### 401 Unauthorized?
- `CRON_SECRET` mismatch between code and environment variables
- Redeploy after updating environment variables

### Messages not deleting?
1. Check Appwrite API key permissions
2. Verify collection ID is correct
3. Check function logs for errors

## Cost Considerations

- **Vercel Pro**: 100 cron executions/day included
- **Vercel Hobby**: 1 cron job, 1 execution/day
- Current setup: ~288 executions/day (every 5 min)
- **Recommendation**: Adjust to `*/15 * * * *` for Hobby tier

## Alternative Approaches

If you need more frequent cleanup or have high volume:
1. Use Vercel Edge Config for state management
2. Implement database triggers (Appwrite Functions)
3. Use external cron service (cron-job.org, EasyCron)
