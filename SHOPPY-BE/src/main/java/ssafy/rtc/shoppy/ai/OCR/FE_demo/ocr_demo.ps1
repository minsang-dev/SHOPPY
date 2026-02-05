param(
    [string]$BaseUrl = "http://localhost:8080",
    [string]$Token = "",
    [string]$RoomId = "1",
    [string]$FilePath = "C:\\Users\\SSAFY\\Desktop\\2학기 1PJT\\ai\\model\\OCR\\receipt\\test2.jpg"
)

# Authorization 헤더는 필요할 때만 추가
$headers = @{}
if ($Token -ne "") {
    $headers["Authorization"] = "Bearer $Token"
}

# multipart/form-data 구성
$form = @{
    file = Get-Item $FilePath
}

Write-Host "Uploading receipt..." -ForegroundColor Cyan
$uploadUrl = "$BaseUrl/api/rooms/$RoomId/settlements/receipt"
$uploadResponse = Invoke-RestMethod -Method Post -Uri $uploadUrl -Headers $headers -Form $form
$uploadResponse | ConvertTo-Json -Depth 10

if ($uploadResponse.data.receipt_id) {
    $receiptId = $uploadResponse.data.receipt_id
    Write-Host "Fetching OCR analysis for receipt_id=$receiptId" -ForegroundColor Cyan
    $analysisUrl = "$BaseUrl/api/ai/ocr/receipts/$receiptId/analysis"
    $analysisResponse = Invoke-RestMethod -Method Get -Uri $analysisUrl -Headers $headers
    $analysisResponse | ConvertTo-Json -Depth 10
}