/**
 * 알프스 대리점·총판 상담 접수 → 구글 시트 저장용 Apps Script 웹훅
 *
 * 1) 시트: 알프스 대리점·총판 상담 접수
 *    https://docs.google.com/spreadsheets/d/12rQD-9s67U_IfXSPk8Q-2_DzILcJ9MSIsuXM3C131dA
 *    Apps Script 프로젝트 '알프스 대리점·총판 상담 접수 웹훅' (시트에 붙은 스크립트가 아니라 독립 프로젝트입니다)
 *    https://script.google.com/home/projects/1vSFPvHXWKKdVSPZFqN5WtoMXFQyCrPQbYIja4Q6aABmnNmI8g3SZ8YFj/edit
 * 2) 이 파일 내용을 편집기에 붙여 넣고 저장 → [배포] → [배포 관리] → 연필 → 버전: 새 버전 → 배포
 *    (같은 배포 ID를 쓰므로 URL 은 바뀌지 않습니다)
 * 3) 배포 설정: 유형 웹 앱 / 실행 계정 나 / 액세스 권한 모든 사용자
 * 4) 배포 URL 은 alfs.kr 서버 함수 api/partner-sheet.js 의 DEFAULT_SHEET_URL 에 들어 있습니다.
 *    (Vercel 환경 변수 PARTNER_SHEET_URL · PARTNER_SHEET_SECRET 을 넣으면 그 값이 우선입니다)
 * 5) SECRET 을 바꾸면 Vercel 의 PARTNER_SHEET_SECRET 도 같이 바꾸고 Redeploy 하세요.
 *
 * 시트 열: 접수일시 · 구분 · 성함/상호 · 연락처 · 지역/업종 · 문의내용 · 답변상태 · 메모 · 접수ID · 유입경로
 * - 접수일시는 한국시간(Asia/Seoul) 기준 'yyyy-MM-dd HH:mm' 문자열로 기록합니다(시트 시간대와 무관).
 * - 같은 접수ID가 이미 있으면 건너뜁니다(중복 방지).
 * - 답변상태는 '미답변'으로 시작하고 G열 드롭다운(미답변·상담중·완료)으로 바꿉니다.
 */
var SECRET = 'alfs-partner-2026-7f3k9q';
var SHEET_ID = '12rQD-9s67U_IfXSPk8Q-2_DzILcJ9MSIsuXM3C131dA';
var SHEET = '접수';
var HEAD = ['접수일시', '구분', '성함/상호', '연락처', '지역/업종', '문의내용', '답변상태', '메모', '접수ID', '유입경로'];
var COL_ID = 9; // 접수ID 열 (I)

function doGet() {
  return out_({ ok: true, app: '알프스 대리점·총판 상담 접수 웹훅' });
}

function doPost(e) {
  var d = {};
  try {
    d = JSON.parse((e && e.postData && e.postData.contents) || '{}');
  } catch (err) {
    return out_({ ok: false, error: 'bad_json' });
  }
  if (String(d.secret || '') !== SECRET) return out_({ ok: false, error: 'unauthorized' });

  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
  } catch (err) {
    return out_({ ok: false, error: 'busy' });
  }
  try {
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    if (sh.getLastRow() === 0) {
      sh.appendRow(HEAD);
      sh.setFrozenRows(1);
      sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#E6E9E1');
    }

    var id = String(d.id || '');
    if (id && sh.getLastRow() > 1) {
      var ids = sh.getRange(2, COL_ID, sh.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === id) return out_({ ok: true, dup: true });
      }
    }

    var stamp = Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm');
    sh.appendRow([
      stamp,
      d.kind || '',
      d.name || '',
      d.phone || '',
      d.region || '',
      d.message || '',
      '미답변',
      '',
      id,
      d.page || ''
    ]);
    return out_({ ok: true, row: sh.getLastRow() });
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
