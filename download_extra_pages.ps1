# download_extra_pages.ps1
# Script to download and link remaining pages for a full static replica.

$ErrorActionPreference = "SilentlyContinue"

$baseDir = "C:\Users\LENOVO\\.gemini\\antigravity\\scratch\\bean_cargo_clone"
$assetsDir = Join-Path $baseDir "assets"

$pages = @(
    @{ Url = "https://bean-cargo.mysapo.net/gioi-thieu"; File = "about.html"; Path = "/gioi-thieu" },
    @{ Url = "https://bean-cargo.mysapo.net/tin-tuc"; File = "blog.html"; Path = "/tin-tuc" },
    @{ Url = "https://bean-cargo.mysapo.net/lien-he"; File = "contact.html"; Path = "/lien-he" },
    @{ Url = "https://bean-cargo.mysapo.net/thung-carton"; File = "category.html"; Path = "/thung-carton" },
    @{ Url = "https://bean-cargo.mysapo.net/cart"; File = "cart.html"; Path = "/cart" },
    @{ Url = "https://bean-cargo.mysapo.net/checkout"; File = "checkout.html"; Path = "/checkout" }
)

# Ensure TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$downloadedFiles = @{}
if (Test-Path $assetsDir) {
    Get-ChildItem -Path $assetsDir | ForEach-Object { $downloadedFiles[$_.Name] = $true }
}

# 1. Download pages and get assets
foreach ($p in $pages) {
    $targetPath = Join-Path $baseDir $p.File
    Write-Host "Downloading $($p.Url) -> $($p.File)..."
    
    try {
        Invoke-WebRequest -Uri $p.Url -OutFile $targetPath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -TimeoutSec 15 -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download page: $($p.Url). Error: $_"
        continue
    }
    
    # Read page content to search for assets
    $htmlContent = Get-Content -Path $targetPath -Raw
    
    # Find bizweb CDN paths
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
        
        if (-not $downloadedFiles.ContainsKey($fileName)) {
            $targetFile = Join-Path $assetsDir $fileName
            Write-Host "Downloading asset: $fileName ..."
            try {
                Invoke-WebRequest -Uri $url -OutFile $targetFile -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" -TimeoutSec 10 -ErrorAction Stop
                $downloadedFiles[$fileName] = $true
            } catch {
                Write-Warning "Failed to download asset: $url"
            }
        }
    }
}

# 2. Rewrite URLs in new HTML files to use local assets
Write-Host "Rewriting asset paths in new HTML pages..."
foreach ($p in $pages) {
    $targetPath = Join-Path $baseDir $p.File
    if (-not (Test-Path $targetPath)) { continue }
    
    $htmlContent = Get-Content -Path $targetPath -Raw
    
    # Rewrite CDN paths
    $newHtmlContent = [regex]::Replace($htmlContent, '(["''])(?:https?:)?//bizweb\.dktcdn\.net/[^"'']*/([^"''\?]+)(?:\?[^"'']*)?\1', '$1./assets/$2$1')
    
    # Resolve relative script folders
    $newHtmlContent = $newHtmlContent -replace '"/dist/', '"https://bean-cargo.mysapo.net/dist/'
    
    # Save back
    Set-Content -Path $targetPath -Value $newHtmlContent -Encoding utf8
}

# 3. Interlink navigation links across ALL HTML files in the folder
Write-Host "Interlinking navigation links across all HTML files..."
$allHtmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html"

# Define mappings
# Note we sort by length descending so longer paths match first (e.g. /gioi-thieu before /)
$mappings = @(
    @{ Pattern = 'href="/gioi-thieu"'; Replacement = 'href="./about.html"' },
    @{ Pattern = 'href="/tin-tuc"'; Replacement = 'href="./blog.html"' },
    @{ Pattern = 'href="/lien-he"'; Replacement = 'href="./contact.html"' },
    @{ Pattern = 'href="/thung-carton"'; Replacement = 'href="./category.html"' },
    @{ Pattern = 'href="/cart"'; Replacement = 'href="./cart.html"' },
    @{ Pattern = 'href="/checkout"'; Replacement = 'href="./checkout.html"' },
    @{ Pattern = 'href="/"'; Replacement = 'href="./index.html"' }
)

# Product detail page mappings
$productMappings = @(
    @{ Pattern = '/thung-carton-dong-hang-5-lop-25x20x13cm'; Replacement = './product-1.html' },
    @{ Pattern = '/thung-carton-dong-hang-5-lop-28-5x22x31cm'; Replacement = './product-2.html' },
    @{ Pattern = '/thung-carton-dong-hang-70x60x52cm-in-flexo'; Replacement = './product-3.html' },
    @{ Pattern = '/thung-carton-dong-hang-7-lop-in-flexo-50x35x22ccm-duc-lo-tay-cam'; Replacement = './product-4.html' }
)

foreach ($htmlFile in $allHtmlFiles) {
    $content = Get-Content -Path $htmlFile.FullName -Raw
    
    # Replace standard navigation links
    foreach ($m in $mappings) {
        $content = $content -replace $m.Pattern, $m.Replacement
    }
    
    # Replace product links
    foreach ($p in $productMappings) {
        $content = $content -replace [regex]::Escape($p.Pattern), $p.Replacement
    }
    
    Set-Content -Path $htmlFile.FullName -Value $content -Encoding utf8
}

Write-Host "Extra pages download and interlinking completed successfully!"
