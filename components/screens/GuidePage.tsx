

export function GuidePage({ onStart }: { onStart: () => void }) {
  const steps = [
    [
      "01",
      "템플릿 고르기",
      "목적과 분위기에 맞는 포스터 디자인을 선택해주세요.",
    ],
    [
      "02",
      "정보 입력하기",
      "사진, 로고와 포스터에 들어갈 문구를 입력해주세요.",
    ],
    [
      "03",
      "분위기 고르기",
      "원하는 분위기와 색상 조합을 선택해 포스터를 생성하세요.",
    ],
    [
      "04",
      "부분 수정하기",
      "글자, 사진, 배경과 로고를 필요한 만큼 세밀하게 수정하세요.",
    ],
    [
      "05",
      "내보내기",
      "완성된 포스터를 확인하고 원하는 규격으로 내려받으세요.",
    ],
  ]

  return (
    <main className="sub-page guide-page">
      <section className="sub-page-heading guide-heading">
        <span className="section-kicker">CLICK 이용 안내</span>
        <h1>
          좋은 포스터를 만드는
          <br />
          가장 간단한 방법
        </h1>
        <p>디자인 경험이 없어도 다섯 단계만 따라오면 포스터가 완성됩니다.</p>
        <button type="button" onClick={onStart}>
          지금 디자인 시작하기 <span>→</span>
        </button>
      </section>
      <section className="guide-steps" aria-label="포스터 제작 순서">
        {steps.map(([number, title, description]) => (
          <article key={number}>
            <span>{number}</span>
            <div>
              <h2>{title}</h2>
              <p>{description}</p>
            </div>
          </article>
        ))}
      </section>
      <section className="guide-tip">
        <span>TIP</span>
        <div>
          <h2>어떤 템플릿을 골라야 할지 고민되나요?</h2>
          <p>
            전달할 내용이 많다면 텍스트형을, 사진을 강조하고 싶다면 이미지
            중심형을 추천해요.
          </p>
        </div>
      </section>
    </main>
  )
}
