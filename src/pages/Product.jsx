import CtaBand from '../components/CtaBand.jsx'
import PromoVideo from '../components/PromoVideo.jsx'
import ProductTabs from '../components/ProductTabs.jsx'
import Faq from '../components/Faq.jsx'
import { Link } from 'react-router-dom'
import { FAQ_PRODUCT } from '../seo.js'
import { useConsult } from '../components/consult.js'
import { asset, scrollToId } from '../lib/asset.js'
import { commerce, channels } from '../config/site.js'

// ⚠️ 식품표시광고법: 오륜미네랄은 기타가공품(일반식품)입니다.
// 질병 예방·치료, 기능성(뼈·면역·혈액 개선 등), 흡수율 비교 같은 표현은 넣지 마세요.

const hooks = [
  { big: '50+', t: '뽕잎에서 온 미네랄', d: '보은의 어린 뽕잎에 담긴 50여 종의 미네랄을 누에가 한 번 더 빚어냅니다.' },
  { big: '1 : 30', t: '내 입맛대로 농도', d: '원액을 물에 10~30배 희석해요. 진하게도, 가볍게도 고를 수 있습니다.' },
  { big: '1잔', t: '알약 대신 하루 한 잔', d: '삼키는 영양제가 부담스러운 날에도, 물처럼 마시면 그만입니다.' },
]

const chain = [
  { e: '🌍', t: '토양', s: '50여 종 원소' },
  { e: '🌿', t: '어린 뽕잎', s: '미네랄 농축' },
  { e: '🐛', t: '누에', s: '생체 이온화' },
  { e: '💧', t: '오륜미네랄', s: '유디아미네랄 특허 공법' },
]

const heritage = [
  { y: '조선 ~ 일제강점기', t: '유가비방집의 골수비방전', d: '9대에 걸쳐 한의업을 이어온 유씨 가문의 한의서에서 바이오미네랄 연구가 시작되었습니다.' },
  { y: '1987', t: '국무총리상 수상', d: '바이오미네랄 발명품의 가치를 국가가 처음 인정했습니다.' },
  { y: '1988 – 1991', t: '세계 3대 발명전 금메달', d: '독일 뉘른베르크, 미국 뉴욕 엑스포, 불가리아 플로브디브 유엔 엑스포에서 금메달을 받았습니다.' },
  { y: '1989', t: '발명의 날 대통령 표창', d: '바이오미네랄이 국가 대표 발명품으로 공인되었습니다.' },
  { y: '2015 – 현재', t: '발명특허 제1541516호', d: '유디아미네랄이 누에와 뽕잎을 활용한 공법을 특허로 등록했고, 이 기술로 오륜미네랄을 만들었습니다.' },
]

const awards = [
  { y: '1988', t: '독일 뉘른베르크', s: '국제발명전 금메달' },
  { y: '1989', t: '미국 뉴욕 엑스포', s: '국제발명전 금메달' },
  { y: '1991', t: '유엔 플로브디브', s: '국가대표 발명품 금메달' },
  { y: '1989', t: '대한민국 대통령 표창', s: '발명의 날' },
  { y: '1987', t: '국무총리상', s: '국가 공인 수상' },
  { y: '2001', t: '특허청장상', s: '기술혁신 인정' },
  { y: '2001', t: '무역협회장상', s: '수출 공헌 인정' },
  { y: '특허', t: '제1541516호', s: '바이오미네랄 공법' },
]

const howto = [
  { t: '희석하기', d: '원액을 물에 10~30배 희석합니다. 취향에 맞게 농도를 조절하세요.' },
  { t: '매일 한 잔', d: '아침 공복이나 식사 사이에 한 잔. 꾸준함이 습관을 만듭니다.' },
  { t: '어디서나', d: '휴대용 병에 담아 출근길, 운동, 여행 중에도 챙기세요.' },
]

// TODO: 원재료명은 실제 제품 라벨과 한 번 더 대조하세요.
const spec = [
  ['제품명', '오륜미네랄'],
  ['식품유형', '기타가공품'],
  ['내용량', '1,000ml'],
  ['제조원', '유디아미네랄 (충북 보은)'],
  ['수상·특허 보유', '제조사 유디아미네랄 (발명특허 제1541516호 등)'],
  ['원재료', '정제수, 동·식물성 바이오미네랄, 뽕나무어린가지추출물, 구연산나트륨, 수산화마그네슘, 비타민C, 황산미량원소, 산화아연, 황산망간, 황산동'],
  ['보관방법', '실온 보관 (직사광선을 피해 서늘한 곳)'],
  ['유통기한', '제조일로부터 3년'],
  ['포장재질', 'HDPE (고밀도 폴리에틸렌)'],
  ['원산지', '대한민국'],
]

export default function Product() {
  const consult = useConsult()
  const insta = channels.find((c) => c.id === 'instagram' && c.url)
  const buyLinks = [
    commerce.smartstore && { label: '스마트스토어에서 구매', url: commerce.smartstore },
    commerce.coupang && { label: '쿠팡에서 구매', url: commerce.coupang },
  ].filter(Boolean)

  return (
    <>
      <ProductTabs />
      <section className="p-hero dark">
        <div className="wrap p-hero__grid p-hero__grid--video">
          <div className="intro">
            <span className="kicker">알프스 유통 첫 제품 · 오륜미네랄</span>
            <h1>물 한 잔에 타는, 뽕잎과 누에의 미네랄</h1>
            <div className="badges">
              <span className="badge">제조사 특허 제1541516호</span>
              <span className="badge">제조사 국제 발명전 금메달</span>
              <span className="badge">제조사 대통령 표창</span>
            </div>
            <p className="credit">수상·특허는 제조사 <b>유디아미네랄</b>의 이력입니다. 오륜미네랄은 유디아미네랄이 이 기술과 원료로 만든 제품입니다.</p>
            <p className="lead muted">충북 보은의 어린 뽕잎을 먹고 자란 누에가 빚은 바이오 유기이온 미네랄. 알약 대신, 하루 한 잔으로 시작하는 미네랄 습관입니다.</p>
            <div className="btn-row mt-m">
              {buyLinks.length > 0
                ? buyLinks.map((b) => <a key={b.url} href={b.url} target="_blank" rel="noreferrer" className="btn btn--drop">{b.label}</a>)
                : <button className="btn btn--drop" onClick={consult.open}>구매 상담하기</button>}
              <button type="button" className="btn btn--ghost" onClick={() => scrollToId('story')}>제품 이야기 보기</button>
            </div>
          </div>
          <PromoVideo />
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">이야기가 있는 제품은, 매일 손이 갑니다</h2>
          <div className="hooks">
            {hooks.map((h) => (
              <div className="hook" key={h.t}>
                <div className="big">{h.big}</div>
                <h3>{h.t}</h3>
                <p>{h.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section--tight" id="story" style={{ background: 'var(--silk-2)' }}>
        <div className="wrap">
          <h2 className="h-section">땅에서 뽕잎으로, 뽕잎에서 누에로</h2>
          <p className="lead muted mt-s">땅속 미네랄이 식물과 생명체를 거쳐 사람에게 오는 자연의 순환. 오륜미네랄은 제조사 유디아미네랄의 특허 공법으로 이 흐름을 담았습니다.</p>
          <div className="chain" role="list">
            {chain.map((c, i) => (
              <Step key={c.t} c={c} last={i === chain.length - 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="section dark">
        <div className="wrap split">
          <div>
            <h2 className="h-section">9대 한의 가문의 비방에서 시작된 이야기</h2>
            <p className="lead muted mt-s">제조사 유디아미네랄은 가문의 한의서 속 비방을 현대의 특허 기술로 이어 왔습니다. 아래 이력과 수상은 모두 유디아미네랄의 것입니다.</p>
            <ol className="timeline">
              {heritage.map((h) => (
                <li key={h.t}><span className="y">{h.y}</span><h3>{h.t}</h3><p className="muted">{h.d}</p></li>
              ))}
            </ol>
          </div>
          <div className="cocoon" style={{ maxWidth: 420, margin: '0 auto' }}>
            <img src={asset('images/bottle-mulberry.webp')} alt="오디와 누에고치로 둘러싸인 오륜미네랄" loading="lazy" width="1024" height="1024" />
          </div>
        </div>
        <div className="wrap">
          <h3 className="awards__title">제조사 유디아미네랄 수상·특허 이력</h3>
          <div className="awards">
            {awards.map((a) => (
              <div className="award" key={a.t + a.y}><span className="y">{a.y}</span><b>{a.t}</b><span>{a.s}</span></div>
            ))}
          </div>
          <p className="notice">위 수상·특허는 모두 제조사 유디아미네랄의 이력이며, 오륜미네랄 제품이 받은 상이 아닙니다. 오륜미네랄은 유디아미네랄이 이 기술과 원료로 만든 제품입니다.</p>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <h2 className="h-section">하루 한 잔, 이렇게 마셔요</h2>
          <ol className="howto">
            {howto.map((h, i) => (
              <li key={h.t}><span className="n">{i + 1}</span><h3>{h.t}</h3><p>{h.d}</p></li>
            ))}
          </ol>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap split split--flip">
          <div>
            <h2 className="h-section">그냥 물이 심심하다면, 미네랄카페 레시피</h2>
            <p className="lead muted mt-s">과일 에이드, 단백질 쉐이크, 홈카페 음료에 원액을 한 스푼. 인스타그램 미네랄카페에서 매주 새 레시피를 올립니다.</p>
            {insta && <div className="btn-row mt-m"><a className="btn btn--primary" href={insta.url} target="_blank" rel="noreferrer">미네랄카페 레시피 보기</a></div>}
          </div>
          <div className="cocoon cocoon--wide">
            <img src={asset('images/lifestyle-drink.webp')} alt="야외 테이블에서 오륜미네랄을 탄 물을 마시는 사람" loading="lazy" width="500" height="506" />
          </div>
        </div>
      </section>

      <section className="section--tight" style={{ background: '#fff' }}>
        <div className="wrap split">
          <div>
            <h2 className="h-section">제품 정보</h2>
            <p className="notice">오륜미네랄은 기타가공품(일반식품)이며, 질병의 예방이나 치료를 위한 의약품 또는 건강기능식품이 아닙니다. 섭취 중 이상이 느껴지면 섭취를 중단하고 전문가와 상담하세요.</p>
          </div>
          <table className="spec">
            <tbody>{spec.map(([k, v]) => <tr key={k}><th scope="row">{k}</th><td>{v}</td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <Faq title="오륜미네랄 자주 묻는 질문" items={FAQ_PRODUCT} lead={<>미네랄 제품을 고르는 기준이 궁금하다면 <Link to="/mineral-guide">미네랄 고르는 법</Link>도 읽어 보세요.</>} />

      <CtaBand
        title="매장에서 오륜미네랄을 팔고 싶으신가요?"
        text="파트너샵은 체험 키트, 진열 가이드, 판매 교육과 정착 지원을 함께 받습니다."
        to="/partner"
        toLabel="파트너 입점 조건 보기"
      />
    </>
  )
}

function Step({ c, last }) {
  return (
    <>
      <div className="chain__item" role="listitem">
        <div className="dot" aria-hidden="true">{c.e}</div>
        <b>{c.t}</b>
        <span>{c.s}</span>
      </div>
      {!last && <span className="chain__arrow" aria-hidden="true">›</span>}
    </>
  )
}
