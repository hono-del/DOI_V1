# Single CSV to Excel Converter
# 指定したCSVファイルを1つだけExcelに変換します

param(
    [string]$CsvFileName = "1-1_道路種別マスタ.csv"
)

Write-Host "Excelファイル作成を開始します..." -ForegroundColor Green
Write-Host "対象ファイル: $CsvFileName" -ForegroundColor Cyan

try {
    # Excelアプリケーションを起動
    $excel = New-Object -ComObject Excel.Application
    $excel.Visible = $false
    $excel.DisplayAlerts = $false

    Write-Host "Excelアプリケーションを起動しました" -ForegroundColor Cyan

    # 新しいワークブックを作成
    $workbook = $excel.Workbooks.Add()
    $worksheet = $workbook.Worksheets.Item(1)

    # スクリプトのディレクトリ
    $scriptDir = $PSScriptRoot
    $csvPath = Join-Path $scriptDir $CsvFileName

    Write-Host "CSVファイルを読み込んでいます..." -ForegroundColor Yellow

    if (Test-Path $csvPath) {
        # CSVデータをインポート
        $QueryTables = $worksheet.QueryTables.Add("TEXT;" + $csvPath, $worksheet.Range("A1"))
        $QueryTables.TextFilePlatform = 65001  # UTF-8
        $QueryTables.TextFileParseType = 1      # xlDelimited
        $QueryTables.TextFileCommaDelimiter = $true
        $QueryTables.RefreshStyle = 1           # xlInsertDeleteCells
        $QueryTables.Refresh($false) | Out-Null

        # ヘッダー行を太字、背景色設定
        $worksheet.Rows.Item(1).Font.Bold = $true
        $worksheet.Rows.Item(1).Interior.Color = 15849925  # 薄い青緑色

        # 列幅を自動調整
        $worksheet.UsedRange.Columns.AutoFit() | Out-Null

        # 枠線を追加
        $worksheet.UsedRange.Borders.LineStyle = 1  # xlContinuous

        # シート名を設定
        $sheetName = $CsvFileName -replace ".csv", ""
        if ($sheetName.Length -gt 31) {
            $sheetName = $sheetName.Substring(0, 31)
        }
        $worksheet.Name = $sheetName

        Write-Host "  ✓ 完了" -ForegroundColor Green

        # 出力パス
        $outputFileName = $CsvFileName -replace ".csv", ".xlsx"
        $outputPath = Join-Path $scriptDir $outputFileName

        # 既存ファイルがあれば削除
        if (Test-Path $outputPath) {
            Remove-Item $outputPath -Force
        }

        # 保存
        $workbook.SaveAs($outputPath, 51)  # 51 = xlOpenXMLWorkbook

        Write-Host "`n✓ Excelファイルを保存しました:" -ForegroundColor Green
        Write-Host $outputPath -ForegroundColor Yellow

    } else {
        Write-Host "  ✗ エラー: ファイルが見つかりません - $csvPath" -ForegroundColor Red
    }

} catch {
    Write-Host "`n✗ エラーが発生しました:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host $_.ScriptStackTrace -ForegroundColor Red

} finally {
    # Excelオブジェクトを解放
    if ($workbook) {
        $workbook.Close($false)
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null
    }
    if ($excel) {
        $excel.Quit()
        [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    }
    [System.GC]::Collect()
    [System.GC]::WaitForPendingFinalizers()

    Write-Host "`n✓ 処理が完了しました！" -ForegroundColor Green
}
