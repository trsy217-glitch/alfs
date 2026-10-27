import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { drawFrame, FPS, SIZES, THEMES, themeFromColor, colorFromImage, FONT } from '../videomaker/adScene.js'
import { fileToDataUrl, loadImage, trim } from '../videomaker/image.js'
import { record, pickMime } from '../videomaker/recorder.js'
import { generateCopy } from '../videomaker/copywriter.js'
import { LIMITS } from '../videomaker/copyRules.js'
import CutResult from '../videomaker/CutResult.jsx'
import { saveBlob, safeFileName, isMobile } from '../videomaker/saveFile.js'
import { asset } from '../lib/asset.js'
import { ls } from '../lib/safeStorage.js'

// 오륜미네랄 샘플: 처음 만든 홍보영상 파일을 그대로 보여 줌 (템플릿으로 다시 그리지 않음)
const SAMPLE_VIDEO = { mp4: 'video/oryun-promo-10s-music.mp4', webm: 'video/oryun-promo-10s.webm', poster: 'video/oryun-promo-poster.webp' }

// 새 상품 기본값 (참고 코드 템플릿)
const EMPTY = {
  description: '',
  productName: '',
  smallLabel: 'NEW',
  copyL: '',
  copyR: '',
  backWord: '',
  note: '',
  options: [],
  theme: 'auto', // 'auto' 상품 색 자동 · 프리셋 id · 'custom'
  customColor: '#E4002B',
  size: 'wide',
  duration: 6,
  music: true,
  productScale: 1,
  touched: {},
  aiApplied: false,
}
const STORE_KEY = 'alfs_videomaker_v2'
const COPY_KEYS = ['smallLabel', 'copyL', 'copyR', 'backWord', 'note', 'productName']

export default function VideoMaker() {
  const [form, setForm] = useState(() => ({ ...EMPTY, ...(ls.get(STORE_KEY) || {}) }))
  const [rawImg, setRawImg] = useState(null) // 올린 원본 (없으면 샘플 모드)
  const [img, setImg] = useState(null) // 누끼 결과
  const [cutBg, setCutBg] = useState(true)
  const [cutBusy, setCutBusy] = useState(false)
  const [autoColor, setAutoColor] = useState(null)
  const [frame, setFrame] = useState(0)
  const [playing, setPlaying] = useState(true)
  const [rec, setRec] = useState({ state: 'idle', progress: 0, blob: null, ext: '', error: '' })
  const [imgError, setImgError] = useState('')
  const [gen, setGen] = useState({ state: 'idle', source: '', msg: '', step: '' })
  const canvasRef = useRef(null)
  const frameRef = useRef(0)

  const sample = !rawImg
  const durationFrames = form.duration * FPS
  const size = SIZES[form.size]
  const theme = useMemo(() => {
    if (form.theme === 'custom') return themeFromColor(form.customColor)
    if (form.theme === 'auto') return autoColor ? themeFromColor(autoColor) : THEMES.forest
    return THEMES[form.theme] || THEMES.forest
  }, [form.theme, form.customColor, autoColor])
  const opts = useMemo(() => ({ ...form, theme, image: img, durationFrames }), [form, theme, img, durationFrames])
  const mime = useMemo(() => pickMime(), [])

  useEffect(() => { ls.set(STORE_KEY, form) }, [form])
  useEffect(() => { document.fonts?.load(`900 84px ${FONT}`, '가나다ABC') }, [])

  // 배경 지우기를 끄면 원본 그대로
  useEffect(() => { if (rawImg && !cutBg) setImg(trim(rawImg)) }, [rawImg, cutBg])
  // 상품 색 자동
  useEffect(() => { if (img) setAutoColor(colorFromImage(img)) }, [img])

  const draw = useCallback((f) => {
    const c = canvasRef.current
    if (c) drawFrame(c.getContext('2d'), f, opts)
  }, [opts])

  // 미리보기 재생 (샘플 모드에서는 영상 파일이 재생됨)
  useEffect(() => {
    if (sample || rec.state === 'recording') return
    let raf, last = performance.now()
    const loop = (now) => {
      if (playing) {
        frameRef.current = (frameRef.current + ((now - last) / 1000) * FPS) % durationFrames
        setFrame(Math.floor(frameRef.current))
      }
      last = now
      draw(Math.floor(frameRef.current))
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [sample, playing, draw, durationFrames, rec.state])

  const set = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  const setText = (k) => (e) => setForm((s) => ({ ...s, [k]: e.target.value, touched: { ...s.touched, [k]: true } }))
  const pickOption = (o) => setForm((s) => ({ ...s, copyL: o.copyL, copyR: o.copyR, touched: { ...s.touched, copyL: true, copyR: true } }))

  // 자동 문구: 상품 사진 → 템플릿 칸에 나눠 넣기
  const runGenerate = async (productImage = rawImg) => {
    setGen({ state: 'loading', source: '', msg: '', step: '' })
    const out = await generateCopy({
      description: '', image: productImage, docs: [], productName: form.touched.productName ? form.productName : '',
      onStep: (step) => setGen((g) => ({ ...g, step })),
    })
    if (!out.copyL && !out.copyR) {
      setGen({ state: 'idle', source: out.source, msg: '문구를 자동으로 만들지 못했어요. 2번 칸에 직접 적어 주세요.', step: '' })
      return
    }
    frameRef.current = 0
    setForm((s) => ({
      ...s,
      description: out.ocrText && !s.description.includes(out.ocrText) ? [s.description, out.ocrText].filter((x) => x.trim()).join('\n') : s.description,
      productName: out.productName || s.productName,
      smallLabel: out.smallLabel || s.smallLabel,
      copyL: out.copyL, copyR: out.copyR,
      backWord: out.backWord || s.backWord,
      note: out.note || s.note,
      options: out.options,
      touched: {},
      aiApplied: out.source === 'ai',
    }))
    setGen({ state: 'done', source: out.source, msg: '', step: '' })
  }

  const onFile = async (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return
    setImgError('')
    if (!file.type.startsWith('image/')) { setImgError('이미지 파일(PNG·JPG)을 골라 주세요.'); return }
    if (file.size > 15 * 1024 * 1024) { setImgError('15MB 이하의 사진을 올려 주세요.'); return }
    try {
      const im = await loadImage(await fileToDataUrl(file))
      setImg(null); setRawImg(im); setCutBg(true); frameRef.current = 0; setPlaying(true)
      // 자동생성: 직접 고친 문구가 없으면 사진(과 설명)으로 문구를 바로 채움
      if (!COPY_KEYS.some((k) => form.touched[k])) runGenerate(im)
    } catch (err) { setImgError(err.message) }
  }

  const backToSample = () => {
    setRawImg(null); setImg(null); setDocs([]); setAutoColor(null)
    setForm((s) => ({ ...EMPTY, size: s.size, duration: s.duration, music: s.music }))
    setGen({ state: 'idle', source: '', msg: '', step: '' })
    setRec({ state: 'idle', progress: 0, blob: null, ext: '', error: '' })
  }

  const makeVideo = async () => {
    setPlaying(false)
    setRec({ state: 'recording', progress: 0, blob: null, ext: '', error: '' })
    try {
      const { blob, ext } = await record(canvasRef.current, { ...opts, musicUrl: form.music ? asset(`video-maker/bgm-ad-${form.duration}s.mp3`) : '' }, (p) => setRec((r) => ({ ...r, progress: p })))
      setRec({ state: 'done', progress: 1, blob, ext, error: '', saved: '' })
    } catch (err) {
      setRec({ state: 'idle', progress: 0, blob: null, ext: '', error: err.message || '영상을 만들지 못했습니다. 다시 시도해 주세요.' })
    }
    frameRef.current = 0
    setPlaying(true)
  }

  const fileName = `${safeFileName(form.productName || form.copyR || '홍보영상')}_${form.duration}초_${form.size === 'tall' ? '세로' : '가로'}.${rec.ext || 'mp4'}`
  const onSave = async () => {
    if (!rec.blob) return
    try {
      const r = await saveBlob(rec.blob, fileName)
      setRec((x) => ({ ...x, saved: r, error: '' }))
    } catch (err) {
      setRec((x) => ({ ...x, error: '저장하지 못했어요. 한 번 더 눌러 주세요. (' + (err?.message || err) + ')' }))
    }
  }
  const recording = rec.state === 'recording'
  const scalePct = Math.round((form.productScale || 1) * 100)

  return (
    <section className="section vm">
      <div className="wrap">
        <header className="vm__head">
          <span className="kicker">무료 · 로그인 없이</span>
          <h1>10초만에 제품홍보영상만들기<small className="vm__trial">(체험용)</small></h1>
          <p className="lead muted">상품 사진을 올리면 배경을 지워 상품만 남기고(누끼), 상품 색에 맞춘 배경과 광고 문구까지 자동으로 채워 6초·10초 제품 광고 영상을 만듭니다. 채워진 문구와 색은 마음대로 고칠 수 있어요.</p>
        </header>

        <div className="vm__grid">
          <div className="vm__stage">
            {sample ? (
              <>
                <div className="vm__screen vm__screen--wide">
                  <video key="sample" controls autoPlay muted loop playsInline poster={asset(SAMPLE_VIDEO.poster)} aria-label="오륜미네랄 샘플 홍보영상">
                    <source src={asset(SAMPLE_VIDEO.mp4)} type="video/mp4" />
                    <source src={asset(SAMPLE_VIDEO.webm)} type="video/webm" />
                  </video>
                </div>
                <p className="vm__hint"><b>오륜미네랄 샘플 영상</b> · 처음 만든 영상 그대로입니다. 오른쪽에서 내 상품 사진을 올리면 이 자리에서 내 상품 영상이 자동으로 만들어져요.</p>
                <div className="vm__make">
                  <a className="btn btn--line" href={asset(SAMPLE_VIDEO.mp4)} download="오륜미네랄_홍보영상_10초.mp4">샘플 영상 저장하기 (MP4)</a>
                </div>
              </>
            ) : (
              <>
                <div className={`vm__screen vm__screen--${form.size}`}>
                  <canvas ref={canvasRef} width={size.w} height={size.h} aria-label="내 상품 홍보영상 미리보기" />
                  {recording && <div className="vm__rec" role="status"><span className="vm__dot" /> 영상 만드는 중 {Math.round(rec.progress * 100)}%</div>}
                  {!img && <div className="vm__rec" role="status"><span className="vm__dot" /> 상품만 남기는 중…</div>}
                </div>
                <div className="vm__controls">
                  <button type="button" className="icon-btn" onClick={() => setPlaying((p) => !p)} disabled={recording} aria-label={playing ? '미리보기 멈춤' : '미리보기 재생'}>
                    {playing
                      ? <svg viewBox="0 0 24 24" aria-hidden="true"><rect x="6" y="5" width="4" height="14" rx="1" fill="currentColor" /><rect x="14" y="5" width="4" height="14" rx="1" fill="currentColor" /></svg>
                      : <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z" fill="currentColor" /></svg>}
                  </button>
                  <input type="range" min="0" max={durationFrames - 1} value={frame} disabled={recording} aria-label="미리보기 위치"
                    onChange={(e) => { setPlaying(false); frameRef.current = Number(e.target.value); setFrame(Number(e.target.value)) }} />
                  <span className="vm__time">{(frame / FPS).toFixed(1)}초 / {form.duration}초</span>
                </div>
                <div className="vm__make">
                  <button type="button" className="btn btn--primary" onClick={makeVideo} disabled={recording || !img || cutBusy}>
                    {recording ? `만드는 중… ${Math.round(rec.progress * 100)}%` : cutBusy ? '상품 배경 지우는 중…' : '영상 만들기'}
                  </button>
                  {rec.state === 'done' && <button type="button" className="btn btn--line" onClick={onSave}>{isMobile() ? '휴대폰에 저장하기' : '영상 저장하기'} ({rec.ext.toUpperCase()} · {(rec.blob.size / 1048576).toFixed(1)}MB)</button>}
                </div>
                <p className="vm__hint">
                  {recording ? '영상이 실제 시간으로 녹화됩니다. 끝날 때까지 이 탭을 보이는 상태로 두세요.'
                    : mime ? `${form.duration}초 동안 녹화한 뒤 ${mime.ext.toUpperCase()} 파일로 저장할 수 있어요.${mime.ext === 'webm' ? ' 이 브라우저는 MP4를 지원하지 않아 WebM으로 저장됩니다.' : ''}`
                      : '이 브라우저는 영상 저장을 지원하지 않습니다. 크롬·엣지·사파리 최신 버전에서 열어 주세요.'}
                </p>
                {rec.saved === 'saved' && <p className="vm__hint" role="status">저장했어요. 고른 폴더에서 '{fileName}' 파일을 확인하세요.</p>}
                {rec.saved === 'shared' && <p className="vm__hint" role="status">공유 창에서 '동영상 저장'(또는 '파일에 저장')을 고르면 사진첩에 저장돼요.</p>}
                {rec.saved === 'downloaded' && <p className="vm__hint" role="status">다운로드를 시작했어요. 브라우저 다운로드 목록에서 '{fileName}'을 확인하세요.</p>}
                {rec.error && <p className="err" role="alert">{rec.error}</p>}
              </>
            )}
          </div>

          <form className="vm__form form" onSubmit={(e) => e.preventDefault()}>
            <fieldset className="vm__box">
              <legend>1. 상품 사진</legend>
              <label className="vm__file">
                <input type="file" accept="image/png,image/jpeg,image/webp" onChange={onFile} disabled={recording} />
                <span>{sample ? '내 상품 사진 올리기' : '다른 사진으로 바꾸기'}</span>
              </label>
              {sample && <p className="hint">사진을 올리면 상품만 남기고 배경을 자동으로 지워요(누끼). 사진은 서버로 보내지 않고 이 브라우저 안에서 처리합니다.</p>}
              {!sample && cutBg && <CutResult image={rawImg} onResult={setImg} onBusy={setCutBusy} hidden />}
              {imgError && <p className="err">{imgError}</p>}
              {!sample && (
                <label className="vm__range vm__scale">영상 속 상품 크기 <b>{scalePct}%</b>
                  <input type="range" min="50" max="150" step="5" value={scalePct} aria-label="영상 속 상품 크기"
                    onChange={(e) => setForm((s) => ({ ...s, productScale: Number(e.target.value) / 100 }))} />
                </label>
              )}

              {(gen.state === 'loading' || gen.msg) && <p className="hint" role="status">{gen.msg || gen.step || '사진을 보고 문구를 만드는 중…'}</p>}
            </fieldset>

            <fieldset className="vm__box">
              <legend>2. 영상에 들어갈 문구 (자동 생성 · 고쳐 쓸 수 있어요)</legend>
              <div className="vm__copyrow">
                <div className="field"><label htmlFor="vm-small">왼쪽 위 작은 글자</label><input id="vm-small" value={form.smallLabel} onChange={setText('smallLabel')} maxLength={LIMITS.smallLabel} placeholder="예: NEW" /></div>
                <div className="field"><label htmlFor="vm-l">왼쪽 큰 문구</label><input id="vm-l" value={form.copyL} onChange={setText('copyL')} maxLength={LIMITS.copyL} placeholder="예: 시원하게" /></div>
                <div className="field"><label htmlFor="vm-r">오른쪽 큰 문구</label><input id="vm-r" value={form.copyR} onChange={setText('copyR')} maxLength={LIMITS.copyR} placeholder="예: 한 잔" /></div>
              </div>
              {form.options?.length > 1 && (
                <div className="field">
                  <span className="vm__label">다른 문구 조합 (누르면 바로 바뀌어요)</span>
                  <div className="vm__opts">
                    {form.options.map((o) => {
                      const on = o.copyL === form.copyL && o.copyR === form.copyR
                      return <button type="button" key={o.copyL + o.copyR} className={`cut__tool ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => pickOption(o)}>{o.copyL} {o.copyR}</button>
                    })}
                  </div>
                </div>
              )}
              <div className="two">
                <div className="field"><label htmlFor="vm-back">뒤에 깔리는 큰 영문 글자</label><input id="vm-back" value={form.backWord} onChange={setText('backWord')} maxLength={LIMITS.backWord} placeholder="예: REFRESH" /></div>
                <div className="field"><label htmlFor="vm-name">상품·가게 이름 (파일 이름에 씀)</label><input id="vm-name" value={form.productName} onChange={setText('productName')} maxLength={LIMITS.productName} placeholder="예: 제주 감귤청" /></div>
              </div>
              <div className="field"><label htmlFor="vm-note">왼쪽 아래 작은 안내 문구 (선택)</label><input id="vm-note" value={form.note} onChange={setText('note')} maxLength={LIMITS.note} placeholder="예: 제조원 표기, 매장 주소" /></div>
              <p className="hint">문구가 길면 글자가 자동으로 작아져요. 식품·건강 상품은 '병이 낫는다', '면역력 강화' 같은 효능 표현을 쓰면 표시·광고 법 위반이 될 수 있어서, 자동 문구에서는 이런 표현을 빼고 만듭니다.</p>
            </fieldset>

            <fieldset className="vm__box">
              <legend>3. 스타일</legend>
              <div className="field">
                <span className="vm__label">배경 색</span>
                <div className="vm__themes">
                  <button type="button" className={`vm__theme ${form.theme === 'auto' ? 'on' : ''}`} onClick={() => setForm((s) => ({ ...s, theme: 'auto' }))}
                    style={autoColor ? { '--sw1': autoColor, '--sw2': themeFromColor(autoColor).deep, '--sw3': '#fff' } : { '--sw1': THEMES.forest.main, '--sw2': THEMES.forest.deep, '--sw3': '#fff' }}>
                    <i aria-hidden="true" />상품 색 자동
                  </button>
                  {Object.entries(THEMES).map(([id, t]) => (
                    <button type="button" key={id} className={`vm__theme ${form.theme === id ? 'on' : ''}`} onClick={() => setForm((s) => ({ ...s, theme: id }))}
                      style={{ '--sw1': t.main, '--sw2': t.deep, '--sw3': '#fff' }}>
                      <i aria-hidden="true" />{t.name}
                    </button>
                  ))}
                  <label className={`vm__theme ${form.theme === 'custom' ? 'on' : ''}`}>
                    <input type="color" value={form.customColor} onChange={(e) => setForm((s) => ({ ...s, theme: 'custom', customColor: e.target.value }))} />
                    직접 고르기
                  </label>
                </div>
                {form.theme === 'auto' && !sample && !autoColor && img && <p className="hint">상품이 흰색·회색 위주라 기본 색(숲)을 썼어요. 원하는 색을 골라 보세요.</p>}
              </div>
              <div className="two">
                <div className="field">
                  <span className="vm__label">길이</span>
                  <div className="chips">
                    {[6, 10].map((d) => (
                      <label key={d}><input type="radio" name="vm-dur" checked={form.duration === d} onChange={() => { frameRef.current = 0; setForm((s) => ({ ...s, duration: d })) }} /><span>{d}초</span></label>
                    ))}
                  </div>
                </div>
                <div className="field">
                  <span className="vm__label">화면 비율</span>
                  <div className="chips">
                    {Object.entries(SIZES).map(([id, s]) => (
                      <label key={id}><input type="radio" name="vm-size" checked={form.size === id} onChange={() => setForm((f) => ({ ...f, size: id }))} /><span>{s.label}</span></label>
                    ))}
                  </div>
                </div>
              </div>
              <label className="consent"><input type="checkbox" checked={form.music} onChange={set('music')} /> <span>배경음악 넣기 (알프스가 직접 만든 무료 음원 · 저장한 영상에 들어갑니다)</span></label>
            </fieldset>

            <div className="btn-row">
              <button type="button" className="btn btn--ghost" onClick={backToSample} disabled={recording}>처음으로 (오륜미네랄 샘플 보기)</button>
            </div>
          </form>
        </div>

        <div className="vm__more">
          <p><b>더 많은 영상이 필요하세요?</b> 알프스 AI 마케팅은 매장에 맞춘 영상·게시물을 에이전트가 매주 만들어 드립니다.</p>
          <Link to="/ai-marketing" className="btn btn--primary">AI 마케팅 보기</Link>
        </div>
      </div>
    </section>
  )
}
