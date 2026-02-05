# OCR FE Demo

## Endpoint
POST /api/ai/ocr/receipts:analyze

## FormData
- file: 영수증 이미지 (jpg/jpeg/png/webp, ≤ 5MB)
- debug: true | false (optional)

## cURL 예시
```bash
curl -X POST \
  -H "Authorization: Bearer <token>" \
  -F "file=@C:\\Users\\SSAFY\\Desktop\\2학기 1PJT\\ai\\model\\OCR\\receipt\\test2.jpg" \
  -F "debug=true" \
  http://localhost:8080/api/ai/ocr/receipts:analyze
```

## FE 처리 포인트
- 응답의 items[]만 UI에 표시
- warnings[]가 있으면 사용자 확인 UI 띄우기
- total은 FE에서 계산 (unitPrice * quantity 합산)
- debug=true는 개발용 (배포에서는 off 권장)

## PowerShell 데모
```powershell
.\ocr_demo.ps1 -BaseUrl http://localhost:8080 -RoomId 1 -Token <token>
```

## HTML 데모
- 같은 폴더의 `ocr_demo.html`을 브라우저로 열고 테스트
- BaseUrl/RoomId/Token/이미지 파일을 입력한 뒤 Upload → Analysis 조회