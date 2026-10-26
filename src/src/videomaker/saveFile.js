// 만든 영상 저장하기
// 1) 크롬·엣지(PC): '다른 이름으로 저장' 창으로 고른 폴더에 바로 씀 → 다운로드 관리자를 거치지 않아 실패가 적음
// 2) 그 밖의 브라우저: 누르는 순간 새 다운로드 주소를 만들어 내려받고, 1분 뒤 정리
// 3) 휴대폰: 공유 창으로 사진첩에 저장 (안 되면 일반 다운로드)
// 반환: 'saved' | 'shared' | 'downloaded' | 'cancelled'
export const isMobile = () => {
  const ua = navigator.userAgent || ''
  return /Android|iPhone|iPad|iPod/i.test(ua) || (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
}

export async function saveBlob(blob, fileName) {
  // 휴대폰: 공유 창 → '동영상 저장'·'파일에 저장'으로 사진첩(갤러리)에 바로 저장
  if (isMobile() && navigator.canShare) {
    const file = new File([blob], fileName, { type: blob.type || 'video/mp4' })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: fileName })
        return 'shared'
      } catch (err) {
        if (err?.name === 'AbortError') return 'cancelled'
        // 공유가 막히면 아래 일반 다운로드로
      }
    }
  }
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
