/**
 * 알프스 상담 신청서 → 구글 시트 저장용 Apps Script
 * 1) 구글 시트를 새로 만들고 [확장 프로그램] → [Apps Script]에 이 코드를 붙여넣습니다.
 * 2) [배포] → [새 배포] → 유형: 웹 앱, 실행: 나, 액세스: 모든 사용자 → 배포
 * 3) 나온 웹 앱 URL을 src/config/site.js 의 formEndpoint 에 넣습니다.
 */
function doPost(e) {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('상담신청')
    || SpreadsheetApp.getActiveSpreadsheet().insertSheet('상담신청');
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(['접수시각', '상담분야', '이름', '연락처', '매장/브랜드', '지역', '내용', '페이지']);
  }
  const d = JSON.parse(e.postData.contents);
  sheet.appendRow([new Date(), d.topic, d.name, d.phone, d.shop, d.region, d.message, d.page]);
  // 새 신청 알림 메일 (원하지 않으면 아래 한 줄을 지우세요)
  MailApp.sendEmail(Session.getActiveUser().getEmail(), `[알프스] 새 상담 신청 - ${d.topic}`, `${d.name} / ${d.phone}\n${d.message || ''}`);
  return ContentService.createTextOutput('ok');
}
