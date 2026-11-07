/**
 * 알프스 우리가게 진단 → 구글 시트 저장용 Apps Script (알프스 내부 보관용)
 *
 * 1) 구글 시트를 새로 만듭니다 (예: '알프스 진단 리포트'). 이 시트는 알프스만 보는 곳입니다 — 공유하지 마세요.
 * 2) [확장 프로그램] → [Apps Script] 에 이 코드를 통째로 붙여 넣고, 아래 SECRET 을 아무 긴 문자열로 바꿉니다.
 * 3) [배포] → [새 배포] → 유형: 웹 앱 / 실행: 나 / 액세스 권한: 모든 사용자 → 배포 → 권한 허용
 * 4) 나온 '웹 앱 URL' 과 SECRET 을 Vercel 환경 변수에 넣습니다:
 *      DIAG_SHEET_URL    = https://script.google.com/macros/s/AKfycbxXMNmVRABroM3PPHmhxqxRC7geTYfNYHzjrVh2d8Ksvs9tJVen_FFFIvppeJMqC_gV/exec
 *      DIAG_SHEET_SECRET = asdfghjklpoiuytrewq
 *    → Vercel 에서 Redeploy
 * 코드를 고친 뒤에는 [배포] → [배포 관리] → 연필 → 버전: 새 버전 으로 다시 배포해야 반영됩니다.
 */
const SECRET = 'asdfghjklpoiuytrewq';
const SHEET = '진단리포트';
const AREAS = ['시장 경쟁력', '매출 건강도', '온라인 홍보', '오프라인 홍보', '고객 관리', '상품 구성', '운영 여건'];
const HEAD = ['진단시각', '이메일', '이름', '가게 이름', '지역', '업종', '가게 형태', '총점', '등급', '요약']
  .concat(AREAS)
  .concat(['구조 점수', '미네랄 적합도', '가장 큰 고민', '전체 응답', '리포트 ID', '고객 UID']);

function doPost(e) {
  const d = JSON.parse(e.postData.contents || '{}');
  if (d.secret !== SECRET) return ContentService.createTextOutput('no');

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#E6E9E1');
  }
  const score = {};
  (d.areas || []).forEach(function (a) { score[a.label] = a.score === '' ? '' : Number(a.score); });

  // 같은 리포트가 두 번 들어오면 건너뜀
  if (d.id && sh.getLastRow() > 1) {
    const idCol = HEAD.indexOf('리포트 ID') + 1;
    const ids = sh.getRange(2, idCol, sh.getLastRow() - 1, 1).getValues().flat();
    if (ids.indexOf(d.id) !== -1) return ContentService.createTextOutput('dup');
  }

  sh.appendRow([new Date(), d.email, d.name, d.shopName, d.region, d.category, d.size,
    d.total === '' ? '' : Number(d.total), d.grade, d.summary]
    .concat(AREAS.map(function (k) { return k in score ? score[k] : ''; }))
    .concat([d.value, d.mineral, d.worry, d.qa, d.id, d.uid]));
  return ContentService.createTextOutput('ok');
}
