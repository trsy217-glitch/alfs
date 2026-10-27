// 배포 빌드 마지막 단계: 공개 페이지마다 정적 HTML 을 만듭니다.
//  - dist/<경로>.html  : 페이지 글자 + 제목·설명·대표 주소·구조화 데이터(JSON-LD)
//  - dist/app.html     : 로그인 화면 등 나머지 주소가 쓰는 빈 껍데기 (vercel.json rewrites)
//  - dist/sitemap.xml  : 검색엔진에 알려 줄 주소 목록
// 어떤 페이지의 서버 렌더가 실패해도 빌드는 멈추지 않고, 그 페이지는 제목·설명만 넣은 껍데기로 둡니다.
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..')
const dist = path.join(root, 'dist')
const ssr = await import(pathToFileURL(path.join(root, 'dist-ssr', 'entry-server.js')).href)
const { ROUTES, metaFor, jsonLdFor, SITE_URL } = ssr

const template = fs.readFileSync(path.join(dist, 'index.html'), 'utf8')
fs.writeFileSync(path.join(dist, 'app.html'), template)

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
const setMeta = (html, attr, key, value) => {
  const re = new RegExp(`<meta ${attr}="${key}" content="[^"]*"\\s*/?>`)
  const tag = `<meta ${attr}="${key}" content="${esc(value)}" />`
  return re.test(html) ? html.replace(re, tag) : html.replace('</head>', `    ${tag}\n  </head>`)
}

let ok = 0
for (const route of Object.keys(ROUTES)) {
  const m = metaFor(route)
  let html = template
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(m.title)}</title>`)
  html = setMeta(html, 'name', 'description', m.description)
  html = setMeta(html, 'property', 'og:title', m.title)
  html = setMeta(html, 'property', 'og:description', m.description)
  html = setMeta(html, 'property', 'og:url', m.url)
  html = setMeta(html, 'name', 'robots', 'index, follow')
  const ld = JSON.stringify(jsonLdFor(route)).replace(/</g, '\\u003c')
  html = html.replace('</head>', `    <link rel="canonical" href="${m.url}" />\n    <script type="application/ld+json" id="ld-json">${ld}</script>\n  </head>`)
  try {
    const body = await ssr.render(route)
    html = html.replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    ok++
  } catch (e) {
    console.warn(`[prerender] ${route} 본문 렌더 실패 → 제목·설명만 넣음:`, e?.message || e)
  }
  const file = route === '/' ? 'index.html' : `${route.slice(1)}.html`
  fs.mkdirSync(path.dirname(path.join(dist, file)), { recursive: true })
  fs.writeFileSync(path.join(dist, file), html)
}

const today = new Date().toISOString().slice(0, 10)
const prio = { '/': '1.0', '/products': '0.9', '/distribution': '0.9', '/mineral-guide': '0.8', '/partner': '0.8' }
const urls = Object.keys(ROUTES).map((r) => `  <url><loc>${SITE_URL}${r === '/' ? '/' : r}</loc><lastmod>${today}</lastmod><priority>${prio[r] || '0.6'}</priority></url>`)
fs.writeFileSync(path.join(dist, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`)
fs.rmSync(path.join(root, 'dist-ssr'), { recursive: true, force: true })
console.log(`[prerender] ${Object.keys(ROUTES).length}개 페이지 (본문 포함 ${ok}개) + sitemap.xml 완료`)
