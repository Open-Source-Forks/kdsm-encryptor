# Test production cleanup endpoint
# Replace YOUR_CRON_SECRET with your actual CRON_SECRET

$cronSecret = "00f55720b2437f1610eb316cef91626ee7ed470e69c095de61fdda3acdab0a42"
$url = "https://kdsm.vercel.app/api/cron/cleanup-expired-messages"

Write-Host "Testing PRODUCTION cleanup endpoint..." -ForegroundColor Cyan
Write-Host "URL: $url" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri $url -Method POST `
        -Headers @{
            "Authorization" = "Bearer $cronSecret"
            "Content-Type" = "application/json"
        } -UseBasicParsing

    Write-Host "`nStatus Code: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "`nResponse Body:" -ForegroundColor Yellow
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "`nError occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "`nResponse Body:" -ForegroundColor Yellow
        Write-Host $responseBody
    }
}
