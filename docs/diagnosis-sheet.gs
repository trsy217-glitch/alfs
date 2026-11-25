/**
 * 알프스 무료 가게 진단 → 구글 시트 저장용 Apps Script (알프스 내부 보관용)
 *
 * 1) 시트: 알프스 가게 진단 접수 (구글 드라이브 '알프스' 폴더)
 *    https://docs.google.com/spreadsheets/d/182p1xVn_PYaedocmwV9l0f4ulkeAjWgtfNI8b85qws0
 *    이 시트는 알프스만 보는 곳입니다 — 공유하지 마세요.
 * 2) Apps Script 프로젝트 '내가게 진단(고객)' — 이 시트에 붙은 스크립트입니다.
 *    https://script.google.com/home/projects/12DQm7QqF6zgJWE6SVkV93-vM5fpfTDZHmzrAusUtY8SeMlXPfiGe50jv/edit
 * 3) 코드를 고친 뒤: [배포] → [배포 관리] → 연필 → 버전: 새 버전 → 배포 (같은 URL 유지)
 *    배포 설정: 유형 웹 앱 / 실행 계정 나 / 액세스 권한 모든 사용자
 * 4) 배포 URL 은 alfs.kr 서버 함수 api/diagnosis-sheet.js 의 DEFAULT_SHEET_URL 과 같습니다.
 *    (Vercel 환경 변수 DIAG_SHEET_URL · DIAG_SHEET_SECRET 을 넣으면 그 값이 우선입니다)
 *
 * 남기는 값 (2026-11-25 정리): 이메일 주소 + 진단 결과 목록만.
 *   이름·전화번호·가게 이름·지역·가장 큰 고민·전체 응답은 받지도 저장하지도 않습니다.
 * 열: 진단시각 · 이메일 · 업종 · 총점 · 등급 · 요약 · 영역별 7 · 구조 점수 · 미네랄 적합도
 *     · 강점 · 없는 것 · 보완할 것 · 이번 주 · 한 달 안 · 석 달 계획 · 상품군 · 리포트 ID
 * 열은 이름으로 찾아 쓰므로 순서를 바꾸거나 열을 더해도 값이 밀리지 않습니다.
 */
const SECRET = 'asdfghjklpoiuytrewq';
const SHEET = '진단리포트';
const AREAS = ['시장 경쟁력', '매출 건강도', '온라인 홍보', '오프라인 홍보', '고객 관리', '상품 구성', '운영 여건'];
const HEAD = ['진단시각', '이메일', '업종', '총점', '등급', '요약']
  .concat(AREAS)
  .concat(['구조 점수', '미네랄 적합도', '강점', '없는 것', '보완할 것', '이번 주', '한 달 안', '석 달 계획', '상품군', '리포트 ID']);

function doGet() {
  return out_({ ok: true, app: '알프스 가게 진단 접수' });
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
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sh = ss.getSheetByName(SHEET) || ss.insertSheet(SHEET);
    var head = ensureHead_(sh);

    if (!String(d.email || '').trim()) return out_({ ok: false, error: 'email' });

    var idCol = head.indexOf('리포트 ID');
    if (d.id && idCol !== -1 && sh.getLastRow() > 1) {
      var ids = sh.getRange(2, idCol + 1, sh.getLastRow() - 1, 1).getValues();
      for (var i = 0; i < ids.length; i++) {
        if (String(ids[i][0]) === String(d.id)) return out_({ ok: true, dup: true });
      }
    }

    var score = {};
    (d.areas || []).forEach(function (a) {
      score[a.label] = a.score === '' || a.score == null ? '' : Number(a.score);
    });

    var values = {
      '진단시각': Utilities.formatDate(new Date(), 'Asia/Seoul', 'yyyy-MM-dd HH:mm'),
      '이메일': d.email || '',
      '업종': d.category || '',
      '총점': d.total === '' || d.total == null ? '' : Number(d.total),
      '등급': d.grade || '',
      '요약': d.summary || '',
      '구조 점수': d.value || '',
      '미네랄 적합도': d.mineral || '',
      '강점': d.strengths || '',
      '없는 것': d.missing || '',
      '보완할 것': d.weak || '',
      '이번 주': d.planNow || '',
      '한 달 안': d.planMonth || '',
      '석 달 계획': d.planQuarter || '',
      '상품군': d.product || '',
      '리포트 ID': d.id || ''
    };
    AREAS.forEach(function (k) { values[k] = k in score ? score[k] : ''; });

    sh.appendRow(head.map(function (h) { return values[h] !== undefined ? values[h] : ''; }));
    return out_({ ok: true, row: sh.getLastRow() });
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

// 머리글을 확인하고, 코드에만 있는 열은 시트 맨 뒤에 붙입니다 (기존 기록이 밀리지 않게).
function ensureHead_(sh) {
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEAD);
    sh.setFrozenRows(1);
    sh.getRange(1, 1, 1, HEAD.length).setFontWeight('bold').setBackground('#E6E9E1');
    return HEAD.slice();
  }
  var lastCol = Math.max(sh.getLastColumn(), 1);
  var cols = sh.getRange(1, 1, 1, lastCol).getValues()[0].map(function (v) { return String(v || '').trim(); });
  while (cols.length && cols[cols.length - 1] === '') cols.pop();
  var added = false;
  HEAD.forEach(function (h) {
    if (cols.indexOf(h) === -1) { cols.push(h); added = true; }
  });
  if (added) {
    sh.getRange(1, 1, 1, cols.length).setValues([cols]);
    sh.getRange(1, 1, 1, cols.length).setFontWeight('bold').setBackground('#E6E9E1');
  }
  if (sh.getFrozenRows() < 1) sh.setFrozenRows(1);
  return cols;
}

function out_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
