# Marp MarkdownをHTMLに変換するスクリプト

Write-Host "Marp Markdown to HTML Converter" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Marpがインストールされているか確認
$marpInstalled = Get-Command marp -ErrorAction SilentlyContinue

if (-not $marpInstalled) {
    Write-Host "Error: Marp CLI is not installed." -ForegroundColor Red
    Write-Host ""
    Write-Host "Please install Marp CLI first:" -ForegroundColor Yellow
    Write-Host "  npm install -g @marp-team/marp-cli" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Or use npx (no installation required):" -ForegroundColor Yellow
    Write-Host "  npx @marp-team/marp-cli マトリクス説明_プレゼンテーション.md -o マトリクス説明_プレゼンテーション.html" -ForegroundColor Cyan
    exit 1
}

# 入力ファイルと出力ファイルのパス
$inputFile = "マトリクス説明_プレゼンテーション.md"
$outputFile = "マトリクス説明_プレゼンテーション.html"

# ファイルの存在確認
if (-not (Test-Path $inputFile)) {
    Write-Host "Error: Input file '$inputFile' not found." -ForegroundColor Red
    exit 1
}

Write-Host "Converting: $inputFile -> $outputFile" -ForegroundColor Cyan
Write-Host ""

# Marpで変換
try {
    marp $inputFile -o $outputFile --html --allow-local-files
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "Success! HTML file created: $outputFile" -ForegroundColor Green
        Write-Host ""
        Write-Host "You can now open the HTML file in your browser." -ForegroundColor Yellow
        
        # HTMLファイルを開くか確認
        $openFile = Read-Host "Open the HTML file now? (Y/N)"
        if ($openFile -eq "Y" -or $openFile -eq "y") {
            Start-Process $outputFile
        }
    } else {
        Write-Host "Error: Conversion failed." -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
