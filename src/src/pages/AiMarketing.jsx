import CtaBand from '../components/CtaBand.jsx'
import { useConsult } from '../components/consult.js'
import { Link } from 'react-router-dom'
import { asset } from '../lib/asset.js'

const pains = [
  { img: 'images/pain-nothing.webp', alt: '빈 게시물 화면을 띄운 휴대폰과 "뭘 올리지?" 말풍선', t: '올릴 게 없어요', d: '매일 무엇을 찍고 뭐라고 써야 할지 몰라 계정이 멈춥니다.' },
  { img: 'images/pain-reply.webp', alt: '포장하느라 바쁜 사이 휴대폰에 문의 알림이 쌓이는 카페 카운터', t: '답장할 시간이 없어요', d: '손님을 받는 중에 DM과 카톡 문의가 쌓여 놓칩니다.' },
  { img: 'images/pain-revisit.webp', alt: '손님이 떠난 테이블에 도장 하나만 찍힌 스탬프 카드', t: '한 번 온 손님이 끝이에요', d: '다시 올 때를 알 방법이 없어 재방문 안내를 못 합니다.' },
]

const agents = [
  { tag: '콘텐츠', t: '콘텐츠 에이전트', img: 'images/agents/agent-content.webp', d: '매장 사진과 메뉴만 주면 인스타 게시물, 릴스 대본, 캡션을 주 단위로 준비합니다.' },
  { tag: '콘텐츠', t: '블로그 자동 포스팅', img: 'images/agents/agent-blog.webp', d: '사장님 코멘트 한 줄과 사진으로 2,000~3,000자 블로그 글을 만들고 예약 발행합니다.' },
  { tag: '응대', t: '상담 응대 에이전트', img: 'images/agents/agent-reply.webp', d: '카카오톡 채널의 자주 묻는 질문에 1차로 답하고, 예약과 문의를 정리해 넘깁니다.' },
  { tag: '재구매', t: '고객 DB · 재방문 알림', img: 'images/agents/agent-db.webp', d: '구매·방문 주기에 맞춰 재구매와 이벤트 안내 메시지를 보낼 시점을 알려줍니다.' },
  { tag: '관리', t: '리뷰 관리', img: 'images/agents/agent-review.webp', d: '새 리뷰를 모아 보여주고, 사장님 말투로 답글 초안을 써 둡니다.' },
  { tag: '관리', t: '광고 문구 검수', img: 'images/agents/agent-check.webp', d: '건강식품·뷰티 매장은 올리기 전에 표시·광고 기준에 걸리는 표현을 걸러냅니다.' },
]

const process = [
  { when: '1주', t: '매장 진단', items: ['업종·상권·고객층 확인', '지금 채널 상태 점검', '목표 정하기'] },
  { when: '2–3주', t: '설계와 세팅', items: ['채널·콘텐츠 방향 설계', 'AI 에이전트 세팅', '말투·금지 표현 학습'] },
  { when: '4주 ~', t: '운영과 리포트', items: ['사장님 운영 교육', '월간 성과 리포트', '반응 보고 계속 개선'] },
]

const plans = [
  { t: '스타트', d: 'SNS를 처음 정비하는 매장', items: ['인스타·블로그·카카오 채널 개설과 정비', '프로필·하이라이트·소개 문구', '4주 콘텐츠 가이드와 촬영 팁'] },
  { t: '그로스', d: '마케팅을 자동으로 굴리고 싶은 매장', pick: true, items: ['콘텐츠·블로그·응대 에이전트 세팅', '고객 DB와 재방문 알림', '월간 리포트와 운영 교육'] },
  { t: '파트너샵', d: '알프스 입점 파트너샵 전용', items: ['입점 패키지에 판매·마케팅 교육 포함', '체험 카페 운영 키트와 콘텐츠 제공', '본사 공동 마케팅·체험 행사'] },
]

export default function AiMarketing() {
  const consult = useConsult()
  return (
    <>
      <section className="page-hero dark">
        <div className="wrap intro">
          <span className="kicker">소상공인 AI 마케팅 컨설팅</span>
          <h1>사장님은 매장에, 마케팅은 AI 에이전트에게</h1>
          <p className="lead">식당·카페·건강샵·피부샵·1인 브랜드를 위해, SNS 콘텐츠와 고객 응대, 재구매 관리를 에이전트로 자동화하고 혼자서도 운영할 수 있게 알려드립니다.</p>
          <div className="btn-row mt-m">
            <Link to="/diagnosis" className="btn btn--drop">우리 매장 무료 진단 받기</Link>
            <button className="btn btn--ghost" onClick={consult.open}>상담하기</button>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">마케팅이 멈추는 건 의지가 아니라 시간 때문입니다</h2>
          <div className="pains">
            {pains.map((p) => (
              <figure className="pain" key={p.t}>
                <div className="pain__img"><img src={asset(p.img)} alt={p.alt} width="1024" height="683" loading="lazy" /></div>
                <figcaption><h3>{p.t}</h3><p>{p.d}</p></figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap">
          <h2 className="h-section">매장마다 일하는 AI 에이전트 팀을 꾸려 드립니다</h2>
          <p className="lead muted mt-s">에이전트가 초안을 만들고 사장님은 확인만. 매장의 말투와 금지 표현을 배워 쓸수록 정확해집니다.</p>
          <div className="agents">
            {agents.map((a) => (
              <div className="agent" key={a.t}>
                <div className="agent__head">
                  <div><span className="tag">{a.tag}</span><h3>{a.t}</h3></div>
                  <img className="agent__icon" src={asset(a.img)} alt="" width="312" height="320" loading="lazy" />
                </div>
                <p>{a.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">진단부터 운영까지, 4주면 굴러갑니다</h2>
          <div className="steps steps--light">
            {process.map((p) => (
              <div className="step" key={p.t}>
                <span className="when">{p.when}</span>
                <h3>{p.t}</h3>
                <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <h2 className="h-section">매장 상황에 맞게 고르세요</h2>
          <div className="plans">
            {plans.map((p) => (
              <div className={`plan ${p.pick ? 'plan--pick' : ''}`} key={p.t}>
                <h3>{p.t}</h3>
                <p className="muted">{p.d}</p>
                <ul>{p.items.map((i) => <li key={i}>{i}</li>)}</ul>
                <p style={{ fontWeight: 700 }}>비용은 매장 진단 후 안내</p>
                {p.t === '파트너샵'
                  ? <Link to="/partner" className="btn btn--ghost">입점 조건 보기</Link>
                  : <button className={`btn ${p.pick ? 'btn--drop' : 'btn--primary'}`} onClick={consult.open}>{p.t} 상담하기</button>}
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand title="우리 매장 SNS, 어디서부터 손대야 할지 진단해 드릴게요." text="지금 운영 중인 계정 주소만 알려주시면 됩니다." />
    </>
  )
}
