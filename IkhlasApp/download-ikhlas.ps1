# ============================================================
#  Ikhlas APK Downloader & Assembler
#  Run in PowerShell:  .\download-ikhlas.ps1
# ============================================================

$repo    = "botuns/ff"
$branch  = "claude/donation-tracker-android-Z2fGH"
$parts   = @("ikhlas-part-aa", "ikhlas-part-ab", "ikhlas-part-ac")
$output  = "$PSScriptRoot\ikhlas.apk"
$baseUrl = "https://raw.githubusercontent.com/$repo/$branch/IkhlasApp"

Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║   Ikhlas APK Downloader v1.0         ║" -ForegroundColor Green
Write-Host "  ║   Jama'at Donation Tracker           ║" -ForegroundColor Green
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

# ----- GitHub token (needed if repo is private) -----
$token = $env:GITHUB_TOKEN
if (-not $token) {
    Write-Host "  If your repo is private, enter your GitHub token." -ForegroundColor Yellow
    Write-Host "  (Press Enter to skip — works if repo is public)" -ForegroundColor DarkGray
    $token = Read-Host "  GitHub Token"
}

$headers = @{ "User-Agent" = "IkhlasDownloader" }
if ($token) { $headers["Authorization"] = "token $token" }

# ----- Download parts -----
$tmpDir = Join-Path $env:TEMP "ikhlas_parts"
New-Item -ItemType Directory -Force -Path $tmpDir | Out-Null

$total = $parts.Count
for ($i = 0; $i -lt $total; $i++) {
    $part = $parts[$i]
    $url  = "$baseUrl/$part"
    $dest = Join-Path $tmpDir $part

    Write-Host "  [$($i+1)/$total] Downloading $part ..." -ForegroundColor Cyan
    try {
        Invoke-WebRequest -Uri $url -Headers $headers -OutFile $dest -UseBasicParsing
        $size = [math]::Round((Get-Item $dest).Length / 1MB, 1)
        Write-Host "        ✓ $size MB" -ForegroundColor Green
    } catch {
        Write-Host "  ERROR downloading $part : $_" -ForegroundColor Red
        Write-Host "  Make sure the repo is public or your token is correct." -ForegroundColor Yellow
        exit 1
    }
}

# ----- Assemble APK -----
Write-Host ""
Write-Host "  Assembling APK ..." -ForegroundColor Cyan

$outStream = [System.IO.File]::OpenWrite($output)
foreach ($part in $parts) {
    $bytes = [System.IO.File]::ReadAllBytes((Join-Path $tmpDir $part))
    $outStream.Write($bytes, 0, $bytes.Length)
}
$outStream.Close()

$apkSize = [math]::Round((Get-Item $output).Length / 1MB, 1)
Write-Host "  ✓ ikhlas.apk assembled ($apkSize MB)" -ForegroundColor Green

# ----- Cleanup -----
Remove-Item -Recurse -Force $tmpDir

# ----- Done -----
Write-Host ""
Write-Host "  ╔══════════════════════════════════════╗" -ForegroundColor Green
Write-Host "  ║  Done! File saved to:                ║" -ForegroundColor Green
Write-Host "  ║  $output" -ForegroundColor White
Write-Host "  ╚══════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""
Write-Host "  To install on Android:" -ForegroundColor Yellow
Write-Host "   1. Transfer ikhlas.apk to your phone" -ForegroundColor White
Write-Host "   2. Settings > Install unknown apps > Allow" -ForegroundColor White
Write-Host "   3. Tap the APK file to install" -ForegroundColor White
Write-Host ""

# Open folder so user can see the APK
explorer.exe /select, $output
