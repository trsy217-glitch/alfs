import { Link } from 'react-router-dom'
import EngineLoop, { engineSteps } from '../components/EngineLoop.jsx'
import CtaBand from '../components/CtaBand.jsx'
import { useConsult } from '../components/consult.js'
import { asset } from '../lib/asset.js'

const lanes = [
  {
    to: '/distribution',
    title: '총판·유통',
    text: '제조사에서 매장까지, 제품이 흘러가는 길을 직접 설계하고 운영합니다. 체험 카페·파트너샵·공동구매·온라인 네 채널이 서로 고객을 넘겨줍니다.',
    more: '유통 구조 보기',
  },
  {
    to: '/partner',
    title: '파트너샵 입점',
    text: '건강샵·웰니스샵·카페가 샵인샵으로 제품을 들이고, 진열 가이드와 판매 교육, 정착 지원까지 함께 받습니다.',
    more: '입점 조건 보기',
  },
  {
    to: '/ai-marketing',
    title: 'AI 마케팅 컨설팅',
    text: '사장님 혼자서도 SNS가 굴러가도록, 콘텐츠·응대·재구매 알림을 AI 에이전트로 자동화해 드립니다.',
    more: 'AI 마케팅 보기',
  },
]

const channels = [
  { en: 'Cafe · Party', t: '체험 카페·홈파티', d: '호스트가 하루 카페를 열고 체험 키트를 나눕니다. 새 고객이 처음 들어오는 문입니다.' },
  { en: 'Partner shop', t: '오프라인 파트너샵', d: '지역 건강샵이 상시 체험·판매 거점이 됩니다. 교육과 판매 자료는 알프스가 지원합니다.' },
  { en: 'Group buy', t: '인플루언서 공동구매', d: '검증된 콘텐츠로 공동구매를 열고, 주문과 정산은 시스템이 처리합니다.' },
  { en: 'Online', t: '온라인 스토어', d: '네이버·쿠팡에서 재구매를 받는 상시 창구. 오프라인 고객이 여기로 돌아옵니다.' },
]

export default function Home() {
  const consult = useConsult()
  return (
    <>
      <section className="hero">
        <div className="wrap hero__grid">
          <div className="intro">
            <h1 className="hero__title">
              <span>좋은 제품은 많습니다.</span>
              <span className="soft">팔리는 구조를 가진 제품은</span>
              <span className="soft">많지 않습니다.</span>
            </h1>
            <p className="hero__lead">
              알프스는 제품 발굴부터 콘텐츠·체험·판매·재구매까지, 상품이 시장에 안착하는 시스템을 만드는 웰니스 유통 회사입니다.
            </p>
            <div className="btn-row">
              <button className="btn btn--primary" onClick={consult.open}>파트너 상담 시작하기</button>
              <Link to="/product" className="btn btn--ghost">첫 제품, 오륜미네랄</Link>
            </div>
          </div>
          <div className="hero__visual">
            <div className="cocoon intro-img">
              <img src={asset('images/bottle-stage.webp')} alt="무대 위에 놓인 오륜미네랄 1,000ml 병과 뽕나무 가지" width="1400" height="1400" fetchpriority="high" />
            </div>
            <div className="hero__tag">
              <b>90일 시장검증 프로젝트</b>
              오륜미네랄로 첫 판매 모델을 숫자로 증명하고 있습니다.
            </div>
          </div>
        </div>
        <div className="wordmark" aria-hidden="true">ALFS</div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">유통을 하고, 마케팅을 심고, 다시 팔리게 만듭니다</h2>
          <p className="lead muted mt-s">물건을 가져다 파는 총판이 아니라, 제품이 계속 팔리는 길을 만드는 유통·마케팅 파트너입니다.</p>
          <div className="lanes mt-l">
            {lanes.map((l) => (
              <Link key={l.to} to={l.to} className="lane">
                <h3>{l.title}</h3>
                <p>{l.text}</p>
                <span className="more">{l.more}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap engine">
          <EngineLoop />
          <div>
            <h2 className="h-section">한 명의 고객이 재구매하고, 추천하고, 파트너가 됩니다</h2>
            <ol className="engine__steps">
              {engineSteps.map((s, i) => (
                <li key={s.t}>
                  <span className="n">{String(i + 1).padStart(2, '0')}</span>
                  <span><b>{s.t}</b><span className="d">{s.d}</span></span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap split">
          <div className="cocoon cocoon--wide">
            <img src={asset('images/bottle-mulberry.webp')} alt="오디와 누에고치 사이에 놓인 오륜미네랄" loading="lazy" width="1024" height="1024" />
          </div>
          <div>
            <h2 className="h-section">누에가 먹고, 뽕잎이 키운 미네랄 한 병</h2>
            <p className="lead muted mt-s">
              충북 보은의 어린 뽕잎을 누에가 먹고 빚어낸 50여 종의 바이오 유기이온 미네랄. 물에 타서 하루 한 잔이면 됩니다.
            </p>
            <p className="mt-m">9대 한의 가문의 비방을 이은 제조사 유디아미네랄의 특허 기술로 만들었습니다. 수상·특허는 유디아미네랄의 이력입니다.</p>
            <div className="btn-row mt-m">
              <Link to="/product" className="btn btn--primary">오륜미네랄 자세히 보기</Link>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="h-section">네 개의 채널이 서로 고객을 넘겨줍니다</h2>
          <div className="channels">
            {channels.map((c) => (
              <div key={c.t} className="channel">
                <span className="en">{c.en}</span>
                <h3>{c.t}</h3>
                <p>{c.d}</p>
              </div>
            ))}
          </div>
          <p className="channels-flow">처음은 체험으로, 다음은 매장에서, 그 다음은 온라인 재구매로.</p>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap split split--flip">
          <div>
            <h2 className="h-section">사장님은 매장에, SNS는 AI 에이전트에게</h2>
            <p className="lead muted mt-s">
              게시물 기획, 숏폼 대본, 블로그, 고객 응대, 재구매 알림까지. 소상공인이 혼자서도 마케팅을 이어갈 수 있도록 자동화 구조를 세팅하고 운영법을 알려드립니다.
            </p>
            <div className="btn-row mt-m">
              <Link to="/ai-marketing" className="btn btn--drop">AI 마케팅 컨설팅 보기</Link>
            </div>
          </div>
          <ChatPreview />
        </div>
      </section>

      <section className="section">
        <div className="wrap diag-band">
          <div>
            <h2 className="h-section">우리 가게, 어디가 비어 있는지 무료로 진단해 보세요</h2>
            <p className="lead muted mt-s">업종을 고르고 짧은 질문에 답하면 강점과 없는 것, 보완할 것, 이번 주에 할 일이 정리된 진단표가 나옵니다. 결과는 본인만 볼 수 있고 PDF로 받을 수 있어요.</p>
            <div className="btn-row mt-m">
              <Link to="/diagnosis" className="btn btn--primary">우리가게 진단하기</Link>
            </div>
          </div>
          <ul className="diag-band__list">
            <li><b>11개 업종</b><span>카페, 웰니스샵, 피부샵, 스튜디오, 식당, 약국·건강원 등</span></li>
            <li><b>7개 영역</b><span>시장 · 매출 · 온라인 · 오프라인 · 고객 · 상품 · 운영 여건</span></li>
            <li><b>실행 계획</b><span>이번 주 · 한 달 안 · 석 달 계획으로 정리</span></li>
          </ul>
        </div>
      </section>

      <CtaBand
        title="제품은 준비되어 있습니다. 이제 시장을 함께 만들 차례입니다."
        text="파트너샵 입점, 공동구매, AI 마케팅 중 무엇이든 편하게 물어보세요."
      />
    </>
  )
}

function ChatPreview() {
  return (
    <div className="chat-demo" aria-label="AI 상담 에이전트 응대 예시">
      <div className="chat-demo__top">
        <div className="chat-demo__avatar">AI</div>
        <div><b>OO웰니스샵 상담 에이전트</b><span>카카오톡 채널 · 1차 자동 응대</span></div>
      </div>
      <p className="bubble bubble--in">미네랄 체험 카페 다음 주에도 열리나요?</p>
      <p className="bubble bubble--out">네, 다음 주 목요일 오후 2시에 열려요. 자리 예약해 드릴까요? 오시면 100ml 체험 키트를 드려요.</p>
      <p className="bubble bubble--in">네 2명이요!</p>
      <p className="bubble bubble--out">2명 예약했어요. 하루 전에 알림 드릴게요.</p>
      <p className="bubble bubble--sys">예약 내용이 고객 DB와 사장님 일정표에 자동 저장됨</p>
    </div>
  )
}
