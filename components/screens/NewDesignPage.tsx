"use client"

import { useState } from "react"

export function NewDesignPage({ onBrowse }: { onBrowse: () => void }) {
  const [format, setFormat] = useState("portrait")

  return (
    <main className="sub-page new-design-page">
      <section className="sub-page-heading">
        <span className="section-kicker">새 디자인</span>
        <h1>어떤 포스터를 만들까요?</h1>
        <p>사용할 곳에 맞는 크기를 선택하고 디자인을 시작해보세요.</p>
      </section>
      <section className="format-panel">
        <div className="format-options">
          <button
            type="button"
            className={format === "portrait" ? "active" : ""}
            onClick={() => setFormat("portrait")}
          >
            <i className="format-shape portrait" />
            <strong>세로형 포스터</strong>
            <span>인쇄물 · 게시판 · 안내문</span>
          </button>
          <button
            type="button"
            className="coming-soon"
            disabled
          >
            <b className="format-badge">준비 중</b>
            <i className="format-shape square" />
            <strong>정사각형</strong>
            <span>소셜 미디어 · 카드 뉴스</span>
          </button>
          <button
            type="button"
            className="coming-soon"
            disabled
          >
            <b className="format-badge">준비 중</b>
            <i className="format-shape landscape" />
            <strong>가로형 배너</strong>
            <span>웹 배너 · 행사 스크린</span>
          </button>
        </div>
        <div className="format-footer">
          <p>선택한 형식에 잘 맞는 템플릿을 보여드릴게요.</p>
          <button type="button" onClick={onBrowse}>
            템플릿 선택하기 <span>→</span>
          </button>
        </div>
      </section>
    </main>
  )
}
