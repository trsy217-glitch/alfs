import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { metaFor, jsonLdFor } from '../seo.js'

// 사이트 안에서 페이지를 옮길 때 제목·설명·대표 주소(canonical)·구조화 데이터를 바꿉니다.
// 처음 열 때의 값은 배포 빌드(scripts/prerender.mjs)가 페이지마다 HTML 에 미리 넣어 둡니다.
function setMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}

export default function SeoHead() {
  const { pathname } = useLocation()
  useEffect(() => {
    const m = metaFor(pathname)
    document.title = m.title
    setMeta('name', 'description', m.description)
    setMeta('property', 'og:title', m.title)
    setMeta('property', 'og:description', m.description)
    setMeta('property', 'og:url', m.url)
    setMeta('name', 'robots', m.noindex ? 'noindex, follow' : 'index, follow')
    let link = document.head.querySelector('link[rel="canonical"]')
    if (!link) { link = document.createElement('link'); link.rel = 'canonical'; document.head.appendChild(link) }
    link.href = m.url
    let ld = document.getElementById('ld-json')
    if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'ld-json'; document.head.appendChild(ld) }
    ld.textContent = JSON.stringify(jsonLdFor(pathname))
  }, [pathname])
  return null
}
