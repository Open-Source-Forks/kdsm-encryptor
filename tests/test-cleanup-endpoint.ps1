# Test cleanup endpoint locally
# Replace YOUR_CRON_SECRET with your actual CRON_SECRET from .env

$cronSecret = "YOUR_CRON_SECRET"
$url = "http://localhost:3000/api/cron/cleanup-expired-messages"

Write-Host "Testing cleanup endpoint..." -ForegroundColor Cyan

$response = Invoke-WebRequest -Uri $url -Method POST `
    -Headers @{
        "Authorization" = "Bearer $cronSecret"
        "Content-Type" = "application/json"
    } -UseBasicParsing

Write-Host "Status Code: $($response.StatusCode)" -ForegroundColor Green
Write-Host "Response:" -ForegroundColor Yellow
$response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
