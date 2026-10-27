// 자주 묻는 질문 — 검색엔진·AI 검색이 그대로 인용할 수 있도록 질문과 답을 화면에 모두 보여 줍니다.
// 내용은 src/seo.js 에 있고, 같은 내용이 구조화 데이터(FAQPage)로도 들어갑니다.
export default function Faq({ title = '자주 묻는 질문', items, lead }) {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="wrap" style={{ maxWidth: 860 }}>
        <h2 className="h-section">{title}</h2>
        {lead && <p className="lead muted mt-s">{lead}</p>}
        <div className="faq mt-m">
          {items.map((f, i) => (
            <details key={f.q} open={i === 0}>
              <summary>{f.q}</summary>
              <p>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
