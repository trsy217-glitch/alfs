// 만든 영상 저장하기
// 1) 크롬·엣지(PC): '다른 이름으로 저장' 창으로 고른 폴더에 바로 씀 → 다운로드 관리자를 거치지 않아 실패가 적음
// 2) 그 밖의 브라우저: 누르는 순간 새 다운로드 주소를 만들어 내려받고, 1분 뒤 정리
// 반환: 'saved' | 'downloaded' | 'cancelled'
export async function saveBlob(blob, fileName) {
  if (window.showSaveFilePicker && window.isSecureContext) {
    const ext = fileName.split('.').pop()
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [{ description: '영상 파일', accept: { [blob.type || `video/${ext}`]: [`.${ext}`] } }],
      })
      const w = await handle.createWritable()
      await w.write(blob)
      await w.close()
      return 'saved'
    } catch (err) {
      if (err?.name === 'AbortError') return 'cancelled' // 사용자가 창을 닫음
      // 그 밖의 오류(권한·iframe 안 등)는 아래 일반 다운로드로
    }
  }
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60_000)
  return 'downloaded'
}

// 파일 이름에 쓸 수 없는 글자 정리 (한글은 그대로)
export function safeFileName(name) {
  return name.replace(/[\\/:*?"<>|\u0000-\u001f]+/g, '').replace(/\s+/g, '').replace(/^\.+/, '').slice(0, 60) || '홍보영상'
}
