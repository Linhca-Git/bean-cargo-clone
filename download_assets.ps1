# download_assets.ps1
# Script to download assets locally and rewrite URLs in index.html and CSS files.

$ErrorActionPreference = "SilentlyContinue"

$baseDir = "C:\Users\LENOVO\\.gemini\\antigravity\\scratch\\bean_cargo_clone"
$assetsDir = Join-Path $baseDir "assets"
$urlsFile = "C:\Users\LENOVO\\.gemini\\antigravity\\brain\\b8639af3-381a-4609-88c0-ab949eaff6e3\\scratch\\urls.txt"
$htmlFile = Join-Path $baseDir "index.html"

# 1. Create assets directory
if (-not (Test-Path $assetsDir)) {
    New-Item -ItemType Directory -Force -Path $assetsDir | Out-Null
}

# Ensure TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

# 2. Download all assets from urls.txt
$urls = Get-Content -Path $urlsFile
$downloadedFiles = @{} # Dictionary to map original URL (or filename) to local path

Write-Host "Starting download of $($urls.Count) URLs..."

foreach ($url in $urls) {
    if ([string]::IsNullOrWhiteSpace($url)) { continue }
    
    # Extract filename from URL
    # Example: https://bizweb.dktcdn.net/100/669/966/themes/1120993/assets/logo.png?1780302527421
    # We want: logo.png
    $cleanUrl = $url.Split('?')[0]
    $fileName = [System.IO.Path]::GetFileName($cleanUrl)
    
    if ([string]::IsNullOrWhiteSpace($fileName)) { continue }
    
    $targetPath = Join-Path $assetsDir $fileName
    
    Write-Host "Downloading $fileName ..."
    try {
        Invoke-WebRequest -Uri $url -OutFile $targetPath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -TimeoutSec 10 -ErrorAction Stop
        $downloadedFiles[$fileName] = $true
    } catch {
        Write-Warning "Failed to download: $url. Error: $_"
    }
}

# 3. Scan CSS files for nested assets (like web fonts or background images)
Write-Host "Scanning CSS files for nested assets..."
$cssFiles = Get-ChildItem -Path $assetsDir -Filter "*.css"

foreach ($cssFile in $cssFiles) {
    $cssContent = Get-Content -Path $cssFile.FullName -Raw
    # Find all url(...) patterns in CSS
    $matches = [regex]::Matches($cssContent, 'url\(([^)]+)\)')
    
    foreach ($match in $matches) {
        $rawUrl = $match.Groups[1].Value.Trim("'", '"')
        
        # We only care about external CDN URLs or fonts/images we want to store locally
        if ($rawUrl -match "bizweb.dktcdn.net" -or $rawUrl -match "\.(woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg)") {
            # Build full URL if it is relative
            $fullUrl = $rawUrl
            if ($rawUrl.StartsWith("//")) {
                $fullUrl = "https:" + $rawUrl
            } elseif ($rawUrl.StartsWith("/")) {
                $fullUrl = "https://bean-cargo.mysapo.net" + $rawUrl
            } elseif (-not ($rawUrl.StartsWith("http"))) {
                # Relative to assets folder
                $fullUrl = "https://bizweb.dktcdn.net/100/669/966/themes/1120993/assets/" + $rawUrl
            }
            
            $cleanUrl = $fullUrl.Split('?')[0]
            $nestedFileName = [System.IO.Path]::GetFileName($cleanUrl)
            
            if (-not [string]::IsNullOrWhiteSpace($nestedFileName) -and -not $downloadedFiles.ContainsKey($nestedFileName)) {
                $targetPath = Join-Path $assetsDir $nestedFileName
                Write-Host "Downloading nested asset: $nestedFileName from $fullUrl ..."
                try {
                    Invoke-WebRequest -Uri $fullUrl -OutFile $targetPath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -TimeoutSec 10 -ErrorAction Stop
                    $downloadedFiles[$nestedFileName] = $true
                } catch {
                    Write-Warning "Failed to download nested: $fullUrl"
                }
            }
        }
    }
}

# 4. Rewrite URLs in CSS files to be relative local paths
Write-Host "Rewriting asset paths in CSS files..."
foreach ($cssFile in $cssFiles) {
    $cssContent = Get-Content -Path $cssFile.FullName -Raw
    
    # Replace url(...) references with local filenames
    # Example: url(//bizweb.dktcdn.net/.../logo.png?123) -> url(logo.png)
    # We replace url("path/to/filename.ext?query") with url("filename.ext")
    $newCssContent = [regex]::Replace($cssContent, 'url\((["'']?)(?:https?:)?//bizweb\.dktcdn\.net/[^"''\)]*/([^"''\?\)]+)(?:\?[^"''\)]*)?\1\)', 'url($1$2$1)')
    
    # Also replace any relative URL paths like url("fonts/font.woff") to url("font.woff")
    $newCssContent = [regex]::Replace($newCssContent, 'url\((["'']?)(?:[^"''\)]+/)?([^"''\?\)]+\.(?:woff2?|ttf|otf|eot|png|jpg|jpeg|gif|svg))(?:\?[^"''\)]*)?\1\)', 'url($1$2$1)')
    
    Set-Content -Path $cssFile.FullName -Value $newCssContent -Encoding utf8
}

# 5. Rewrite URLs in index.html
Write-Host "Rewriting asset paths in index.html..."
$htmlContent = Get-Content -Path $htmlFile -Raw

# Replace CDN script and stylesheet links
# Example: //bizweb.dktcdn.net/100/669/966/themes/1120993/assets/logo.png?1780302527421 -> ./assets/logo.png
$newHtmlContent = [regex]::Replace($htmlContent, '(["''])(?:https?:)?//bizweb\.dktcdn\.net/[^"'']*/([^"''\?]+)(?:\?[^"'']*)?\1', '$1./assets/$2$1')

# Replace relative paths starting with /dist/ or similar to point to local assets if we have them, or prefix them
$newHtmlContent = $newHtmlContent -replace '"/dist/', '"https://bean-cargo.mysapo.net/dist/'

# Let's save the modified index.html
Set-Content -Path $htmlFile -Value $newHtmlContent -Encoding utf8

Write-Host "Completed asset download and link rewriting!"
