# download_products.ps1
# Script to download 4 product detail pages, extract and map new assets, and interlink them.

$ErrorActionPreference = "SilentlyContinue"

$baseDir = "C:\Users\LENOVO\\.gemini\\antigravity\\scratch\\bean_cargo_clone"
$assetsDir = Join-Path $baseDir "assets"
$htmlFile = Join-Path $baseDir "index.html"

# List of products to download and map
$products = @(
    @{
        Url = "https://bean-cargo.mysapo.net/thung-carton-dong-hang-5-lop-25x20x13cm"
        File = "product-1.html"
        Path = "/thung-carton-dong-hang-5-lop-25x20x13cm"
    },
    @{
        Url = "https://bean-cargo.mysapo.net/thung-carton-dong-hang-5-lop-28-5x22x31cm"
        File = "product-2.html"
        Path = "/thung-carton-dong-hang-5-lop-28-5x22x31cm"
    },
    @{
        Url = "https://bean-cargo.mysapo.net/thung-carton-dong-hang-70x60x52cm-in-flexo"
        File = "product-3.html"
        Path = "/thung-carton-dong-hang-70x60x52cm-in-flexo"
    },
    @{
        Url = "https://bean-cargo.mysapo.net/thung-carton-dong-hang-7-lop-in-flexo-50x35x22ccm-duc-lo-tay-cam"
        File = "product-4.html"
        Path = "/thung-carton-dong-hang-7-lop-in-flexo-50x35x22ccm-duc-lo-tay-cam"
    }
)

# Ensure TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$downloadedFiles = @{}
# Populated downloaded files cache from existing assets folder to avoid duplicate downloads
if (Test-Path $assetsDir) {
    Get-ChildItem -Path $assetsDir | ForEach-Object { $downloadedFiles[$_.Name] = $true }
}

# 1. Download product pages and scan for new assets
foreach ($p in $products) {
    $targetHtmlPath = Join-Path $baseDir $p.File
    Write-Host "Downloading product page: $($p.Url) -> $($p.File)..."
    
    try {
        Invoke-WebRequest -Uri $p.Url -OutFile $targetHtmlPath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -TimeoutSec 15 -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download product page: $($p.Url). Error: $_"
        continue
    }
    
    # Read the downloaded HTML to extract assets
    $htmlContent = Get-Content -Path $targetHtmlPath -Raw
    
    # Find any bizweb CDN URLs in the product HTML
    $matches = [regex]::Matches($htmlContent, '(?:"|src="|href="|url\()((?:https?:)?//bizweb\.dktcdn\.net/[^"\)\s\?]+)')
    $urlsToDownload = $matches | ForEach-Object {
        $url = $_.Groups[1].Value
        if (-not $url.StartsWith("http")) { $url = "https:" + $url }
        $url
    } | Select-Object -Unique
    
    foreach ($url in $urlsToDownload) {
        $cleanUrl = $url.Split('?')[0]
        $fileName = [System.IO.Path]::GetFileName($cleanUrl)
        if ([string]::IsNullOrWhiteSpace($fileName)) { continue }
        
        # If not already downloaded, download it
        if (-not $downloadedFiles.ContainsKey($fileName)) {
            $targetPath = Join-Path $assetsDir $fileName
            Write-Host "Downloading new product asset: $fileName ..."
            try {
                Invoke-WebRequest -Uri $url -OutFile $targetPath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -TimeoutSec 10 -ErrorAction Stop
                $downloadedFiles[$fileName] = $true
            } catch {
                Write-Warning "Failed to download product asset: $url"
            }
        }
    }
}

# 2. Rewrite URLs in product pages
Write-Host "Rewriting asset references in product HTML pages..."
foreach ($p in $products) {
    $targetHtmlPath = Join-Path $baseDir $p.File
    if (-not (Test-Path $targetHtmlPath)) { continue }
    
    $htmlContent = Get-Content -Path $targetHtmlPath -Raw
    
    # Rewrite Sapo CDN paths to local assets
    $newHtmlContent = [regex]::Replace($htmlContent, '(["''])(?:https?:)?//bizweb\.dktcdn\.net/[^"'']*/([^"''\?]+)(?:\?[^"'']*)?\1', '$1./assets/$2$1')
    
    # Resolve relative script folders
    $newHtmlContent = $newHtmlContent -replace '"/dist/', '"https://bean-cargo.mysapo.net/dist/'
    
    # Interlink the product pages themselves
    foreach ($pLink in $products) {
        # Replace absolute and relative links to these products
        $newHtmlContent = $newHtmlContent -replace [regex]::Escape($pLink.Path), "./$($pLink.File)"
    }
    
    # Save the updated product page
    Set-Content -Path $targetHtmlPath -Value $newHtmlContent -Encoding utf8
}

# 3. Interlink product pages in index.html
Write-Host "Interlinking product pages in index.html..."
if (Test-Path $htmlFile) {
    $indexContent = Get-Content -Path $htmlFile -Raw
    
    foreach ($pLink in $products) {
        # Replace occurrences of the product path with the local file name
        # Example: href="/thung-carton-dong-hang-5-lop-25x20x13cm" -> href="./product-1.html"
        $indexContent = $indexContent -replace [regex]::Escape($pLink.Path), "./$($pLink.File)"
    }
    
    # For other product links that we didn't clone, let's map them to javascript:void(0) or home
    # to avoid broken links
    # Sapo product handles are typically alphanumeric with hyphens, not matching standard top-level menu paths
    # We will only map links that look like products. Let's find remaining links in index.html containing products
    # and replace them with "#" or similar, but let's be careful not to break collections or categories.
    
    Set-Content -Path $htmlFile -Value $indexContent -Encoding utf8
}

Write-Host "Product download and interlinking completed successfully!"
