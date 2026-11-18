// ─────────────────────────────────────────────────────────────
// AI 문구 엔진 설정 (방문자 본인 키 · 무료 로컬 LLM)
// 알프스(사이트 운영자)가 비용을 대지 않도록, 문구는 방문자가 고른 엔진과
// 방문자 본인의 키로 만듭니다. 키는 이 브라우저에만 보관하고 서버에 저장하지 않습니다.
// ─────────────────────────────────────────────────────────────
const STORE_KEY = 'alfs_vm_ai_v1'

// 고를 수 있는 엔진 목록 (화면 표시 순서)
export const PROVIDERS = [
  {
    id: 'gemini',
    name: 'Gemini',
    vendor: 'Google AI Studio',
    badge: '무료 등급 있음',
    desc: '구글 계정으로 무료 키를 받아 쓸 수 있습니다. 사진도 읽습니다.',
    needsKey: true,
    keyUrl: 'https://aistudio.google.com/app/apikey',
    keyLabel: 'Google AI Studio에서 키 발급',
    keyPlaceholder: 'AIza… 로 시작하는 키',
    defaultModel: 'gemini-2.5-flash',
    modelHint: 'gemini-2.5-flash',
  },
  {
    id: 'openai',
    name: 'ChatGPT',
    vendor: 'OpenAI',
    badge: '유료 크레딧',
    desc: 'OpenAI에서 발급한 키로 문구를 만듭니다. 사진도 읽습니다.',
    needsKey: true,
    keyUrl: 'https://platform.openai.com/api-keys',
    keyLabel: 'OpenAI에서 키 발급',
    keyPlaceholder: 'sk-… 로 시작하는 키',
    defaultModel: 'gpt-4o-mini',
    modelHint: 'gpt-4o-mini',
  },
  {
    id: 'anthropic',
    name: 'Claude',
    vendor: 'Anthropic',
    badge: '유료 크레딧',
    desc: 'Anthropic 콘솔에서 발급한 키로 문구를 만듭니다. 사진도 읽습니다.',
    needsKey: true,
    keyUrl: 'https://console.anthropic.com/settings/keys',
    keyLabel: 'Anthropic에서 키 발급',
    keyPlaceholder: 'sk-ant-… 로 시작하는 키',
    defaultModel: 'claude-3-5-haiku-latest',
    modelHint: 'claude-3-5-haiku-latest',
  },
  {
    id: 'local',
    name: '로컬 LLM',
    vendor: 'LM Studio · Ollama',
    badge: '무료 · 키 없음',
    desc: '내 PC에서 돌리는 모델로 문구를 만듭니다. 인터넷 요금도, 가입도 필요 없습니다.',
    needsKey: false,
    defaultBaseUrl: 'http://127.0.0.1:1234/v1',
    defaultModel: '',
    modelHint: '예: qwen2.5-7b-instruct / llama3.1:8b',
  },
  {
    id: 'basic',
    name: '키 없이 기본 문구',
    vendor: '브라우저 기본 도우미',
    badge: '설정 없음',
    desc: 'AI 없이 사진·설명에서 문구를 뽑습니다. 알프스 서버 AI가 연결돼 있으면 그것을 먼저 시도합니다.',
    needsKey: false,
  },
]

export const LOCAL_PRESETS = [
  { id: 'lmstudio', name: 'LM Studio', baseUrl: 'http://127.0.0.1:1234/v1', model: '' },
  { id: 'ollama', name: 'Ollama', baseUrl: 'http://127.0.0.1:11434/v1', model: 'llama3.1:8b' },
]

export const providerById = (id) => PROVIDERS.find((p) => p.id === id) || PROVIDERS[0]

// 저장된 설정을 화면에서 쓰기 좋은 모양으로 정리
export function normalizeAi(raw) {
  const src = raw && typeof raw === 'object' ? raw : {}
  const provider = PROVIDERS.some((p) => p.id === src.provider) ? src.provider : 'basic'
  const def = providerById(provider)
  return {
    provider,
    apiKey: String(src.apiKey || '').trim().slice(0, 300),
    model: String(src.model || '').trim().slice(0, 60),
    baseUrl: String(src.baseUrl || def.defaultBaseUrl || '').trim().replace(/\/+$/, '').slice(0, 200),
    localModel: String(src.localModel || '').trim().slice(0, 80),
    remember: src.remember !== false,
  }
}

// 현재 설정으로 쓸 엔진 이름 (화면 표시용)
export function aiLabel(ai) {
  const a = normalizeAi(ai)
  const def = providerById(a.provider)
  if (a.provider === 'local') return a.localModel ? `로컬 LLM · ${a.localModel}` : '로컬 LLM'
  if (def.needsKey) return `${def.name} · ${a.apiKey ? '내 키 사용' : '키 필요'}`
  return '기본 문구 (키 없이)'
}

// 키를 넣지 않아도 되는지 / 키가 준비됐는지
export function aiReady(ai) {
  const a = normalizeAi(ai)
  const def = providerById(a.provider)
  if (!def.needsKey) return a.provider !== 'local' || Boolean(a.baseUrl)
  return Boolean(a.apiKey)
}

function readStore() {
  try {
    const local = window.localStorage.getItem(STORE_KEY)
    if (local) return { ...JSON.parse(local), remember: true }
  } catch { /* 무시 */ }
  try {
    const session = window.sessionStorage.getItem(STORE_KEY)
    if (session) return { ...JSON.parse(session), remember: false }
  } catch { /* 무시 */ }
  return null
}

export function loadAi() {
  try { return normalizeAi(readStore()) } catch { return normalizeAi(null) }
}

// '이 브라우저에 기억'을 켜면 localStorage, 끄면 sessionStorage(탭을 닫으면 사라짐)
export function saveAi(next) {
  const a = normalizeAi(next)
  const body = JSON.stringify(a)
  try {
    if (a.remember) {
      window.localStorage.setItem(STORE_KEY, body)
      window.sessionStorage.removeItem(STORE_KEY)
    } else {
      window.sessionStorage.setItem(STORE_KEY, body)
      window.localStorage.removeItem(STORE_KEY)
    }
  } catch { /* 저장이 막힌 브라우저(시크릿 창)에서도 화면은 계속 동작 */ }
  return a
}

export function clearAi() {
  try { window.localStorage.removeItem(STORE_KEY) } catch { /* 무시 */ }
  try { window.sessionStorage.removeItem(STORE_KEY) } catch { /* 무시 */ }
  return normalizeAi({ provider: 'basic' })
}
