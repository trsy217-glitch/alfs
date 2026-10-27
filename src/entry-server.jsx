// 배포 빌드 때만 쓰는 서버 렌더 입구 (scripts/prerender.mjs 가 불러옴)
// 페이지마다 실제 글자가 들어간 HTML 을 미리 만들어, 네이버·구글·AI 검색이 자바스크립트 없이도 내용을 읽게 합니다.
import { StrictMode } from 'react'
import { prerenderToNodeStream } from 'react-dom/static'
import { StaticRouter } from 'react-router-dom'
import App from './App.jsx'

export { ROUTES, NOINDEX, metaFor, jsonLdFor, SITE_URL } from './seo.js'

export async function render(url) {
  const errors = []
  const { prelude } = await prerenderToNodeStream(
    <StrictMode>
      <StaticRouter location={url}>
        <App />
      </StaticRouter>
    </StrictMode>,
    { onError: (e) => { errors.push(e) }, progressiveChunkSize: Number.MAX_SAFE_INTEGER },
  )
  let html = ''
  for await (const chunk of prelude) html += chunk
  if (errors.length) throw errors[0]
  return html
}
