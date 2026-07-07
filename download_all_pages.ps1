# download_all_pages.ps1
# Script to download and map all remaining subpages of the Bean Cargo website clone.

$ErrorActionPreference = "SilentlyContinue"

$baseDir = "C:\Users\LENOVO\\.gemini\\antigravity\\scratch\\bean_cargo_clone"
$assetsDir = Join-Path $baseDir "assets"

$pages = @(
    @{ Url = "https://bean-cargo.mysapo.net/dich-vu"; File = "services.html"; Path = "/dich-vu" },
    @{ Url = "https://bean-cargo.mysapo.net/van-tai-duong-bien"; File = "service-1.html"; Path = "/van-tai-duong-bien" },
    @{ Url = "https://bean-cargo.mysapo.net/van-tai-hang-khong"; File = "service-2.html"; Path = "/van-tai-hang-khong" },
    @{ Url = "https://bean-cargo.mysapo.net/van-tai-duong-bo"; File = "service-3.html"; Path = "/van-tai-duong-bo" },
    @{ Url = "https://bean-cargo.mysapo.net/mua-gioi-hai-quan"; File = "service-4.html"; Path = "/mua-gioi-hai-quan" },
    @{ Url = "https://bean-cargo.mysapo.net/kho-bai-phan-phoi"; File = "service-5.html"; Path = "/kho-bai-phan-phoi" },
    @{ Url = "https://bean-cargo.mysapo.net/giai-phap"; File = "solutions.html"; Path = "/giai-phap" },
    @{ Url = "https://bean-cargo.mysapo.net/tuyen-dung"; File = "recruitment.html"; Path = "/tuyen-dung" },
    @{ Url = "https://bean-cargo.mysapo.net/cau-hoi-thuong-gap"; File = "faq.html"; Path = "/cau-hoi-thuong-gap" },
    @{ Url = "https://bean-cargo.mysapo.net/he-thong-cua-hang"; File = "stores.html"; Path = "/he-thong-cua-hang" },
    @{ Url = "https://bean-cargo.mysapo.net/giai-phap-luu-kho-my-pham-hoan-hao-cho-doanh-nghiep"; File = "post-1.html"; Path = "/giai-phap-luu-kho-my-pham-hoan-hao-cho-doanh-nghiep" },
    @{ Url = "https://bean-cargo.mysapo.net/giai-phap-4pl-logistics-hop-dong-contract-logistics"; File = "post-2.html"; Path = "/giai-phap-4pl-logistics-hop-dong-contract-logistics" },
    @{ Url = "https://bean-cargo.mysapo.net/giai-phap-dich-vu-hang-du-an-cho-doanh-nghiep"; File = "post-3.html"; Path = "/giai-phap-dich-vu-hang-du-an-cho-doanh-nghiep" }
)

# Ensure TLS 1.2
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$downloadedFiles = @{}
if (Test-Path $assetsDir) {
    Get-ChildItem -Path $assetsDir | ForEach-Object { $downloadedFiles[$_.Name] = $true }
}

# 1. Download HTML files and scan for new assets
foreach ($p in $pages) {
    $targetPath = Join-Path $baseDir $p.File
    Write-Host "Downloading $($p.Url) -> $($p.File)..."
    
    try {
        Invoke-WebRequest -Uri $p.Url -OutFile $targetPath -UserAgent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" -TimeoutSec 15 -ErrorAction Stop
    } catch {
        Write-Warning "Failed to download page: $($p.Url). Error: $_"
        continue
    }
    
    # Read HTML content to parse asset links
    $htmlContent = Get-Content -Path $targetPath -Raw
    
    # Find CDN paths
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

# 2. Rewrite URLs in all newly downloaded HTML files to use local assets
Write-Host "Rewriting asset references in newly downloaded HTML files..."
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

# 3. Interlink navigation links across ALL HTML files in the folder (including previous ones)
Write-Host "Interlinking navigation links across all HTML files..."
$allHtmlFiles = Get-ChildItem -Path $baseDir -Filter "*.html"

# Mappings of all pages we have cloned so far
$mappings = @(
    # standard navigation
    @{ Pattern = 'href="/gioi-thieu"'; Replacement = 'href="./about.html"' },
    @{ Pattern = 'href="/tin-tuc"'; Replacement = 'href="./blog.html"' },
    @{ Pattern = 'href="/lien-he"'; Replacement = 'href="./contact.html"' },
    @{ Pattern = 'href="/thung-carton"'; Replacement = 'href="./category.html"' },
    @{ Pattern = 'href="/cart"'; Replacement = 'href="./cart.html"' },
    @{ Pattern = 'href="/checkout"'; Replacement = 'href="./checkout.html"' },
    
    # newly added subpages
    @{ Pattern = 'href="/dich-vu"'; Replacement = 'href="./services.html"' },
    @{ Pattern = 'href="/van-tai-duong-bien"'; Replacement = 'href="./service-1.html"' },
    @{ Pattern = 'href="/van-tai-hang-khong"'; Replacement = 'href="./service-2.html"' },
    @{ Pattern = 'href="/van-tai-duong-bo"'; Replacement = 'href="./service-3.html"' },
    @{ Pattern = 'href="/mua-gioi-hai-quan"'; Replacement = 'href="./service-4.html"' },
    @{ Pattern = 'href="/kho-bai-phan-phoi"'; Replacement = 'href="./service-5.html"' },
    @{ Pattern = 'href="/giai-phap"'; Replacement = 'href="./solutions.html"' },
    @{ Pattern = 'href="/tuyen-dung"'; Replacement = 'href="./recruitment.html"' },
    @{ Pattern = 'href="/cau-hoi-thuong-gap"'; Replacement = 'href="./faq.html"' },
    @{ Pattern = 'href="/he-thong-cua-hang"'; Replacement = 'href="./stores.html"' },
    
    # blog details
    @{ Pattern = 'href="/giai-phap-luu-kho-my-pham-hoan-hao-cho-doanh-nghiep"'; Replacement = 'href="./post-1.html"' },
    @{ Pattern = 'href="/giai-phap-4pl-logistics-hop-dong-contract-logistics"'; Replacement = 'href="./post-2.html"' },
    @{ Pattern = 'href="/giai-phap-dich-vu-hang-du-an-cho-doanh-nghiep"'; Replacement = 'href="./post-3.html"' },
    
    # root
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

Write-Host "All remaining pages downloaded and fully interlinked!"
