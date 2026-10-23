// 진단 리포트를 PDF·이미지로 내려받습니다. 무거운 라이브러리는 버튼을 누를 때만 불러옵니다.
async function capture(el) {
  const { default: html2canvas } = await import('html2canvas')
  await document.fonts?.ready
  el.classList.add('is-capturing')
  el.setAttribute('data-capture', '1')
  try {
    // 캡처는 900px 폭의 복제 문서에서 그려지므로, 끊을 지점(블록 시작 위치)도 그 복제본에서 잽니다.
    let marks = []
    const canvas = await html2canvas(el, {
      scale: 2, backgroundColor: '#ffffff', useCORS: true, windowWidth: 900,
      onclone: (doc) => {
        const c = doc.querySelector('[data-capture]')
        if (!c) return
        const box = c.getBoundingClientRect()
        marks = [...c.querySelectorAll('[data-break]')].map((b) => (b.getBoundingClientRect().top - box.top) / box.height)
      },
    })
    return { canvas, breaks: marks.map((m) => Math.round(m * canvas.height)) }
  } finally {
    el.classList.remove('is-capturing')
    el.removeAttribute('data-capture')
  }
}

function save(blob, filename) {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url; a.download = filename
  document.body.appendChild(a); a.click(); a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 2000)
}

export async function downloadPdf(el, filename) {
  const { canvas, breaks } = await capture(el)
  const { jsPDF } = await import('jspdf')
  const pdf = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' })
  const pageW = 210, pageH = 297, margin = 10
  const w = pageW - margin * 2
  const pxPerMm = canvas.width / w
  const sliceH = Math.floor((pageH - margin * 2) * pxPerMm)
  // 리포트 블록이 페이지 경계에서 잘리지 않도록, 표시된 끊을 지점(data-break)을 우선 사용합니다.
  let y = 0, first = true
  while (y < canvas.height) {
    let end = Math.min(y + sliceH, canvas.height)
    if (end < canvas.height) {
      const candidate = breaks.filter((b) => b > y + sliceH * 0.4 && b <= end).pop()
      if (candidate) end = candidate
    }
    const part = document.createElement('canvas')
    part.width = canvas.width; part.height = end - y
    part.getContext('2d').drawImage(canvas, 0, y, canvas.width, end - y, 0, 0, canvas.width, end - y)
    if (!first) pdf.addPage()
    pdf.addImage(part.toDataURL('image/jpeg', 0.92), 'JPEG', margin, margin, w, (end - y) / pxPerMm)
    first = false
    y = end
  }
  save(pdf.output('blob'), filename)
}

export async function downloadImage(el, filename) {
  const { canvas } = await capture(el)
  await new Promise((resolve) => canvas.toBlob((b) => { save(b, filename); resolve() }, 'image/png'))
}
