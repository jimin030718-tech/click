"use client"

import { moodPresets } from "@/lib/styles"
import { UploadField } from "@/components/ui/UploadField"
import { WorkflowSteps } from "@/components/ui/WorkflowSteps"
import type { DesignFlowState } from "@/components/create/useDesignFlow"

// 3단계: 분위기·색 조합 선택
// 상태는 useDesignFlow에 있고, 이 함수는 화면만 그립니다.
// (컴포넌트 <X />가 아니라 함수로 호출해야 단계를 넘길 때 화면이 예전과 똑같이 이어집니다.)
export function renderMoodStep(flow: DesignFlowState) {
  const {
    poster,
    step,
    mood,
    paletteIndex,
    referencePreview,
    setReferencePreview,
    extraKeyword,
    setExtraKeyword,
    generating,
    generationStage,
    aiCredits,
    showGenerationConfirm,
    setShowGenerationConfirm,
    selectedMood,
    selectedPalette,
    generationMessages,
    startAiPosterGeneration,
    requestAiPosterGeneration,
    readFile,
    selectMood,
    selectPalette,
    goBackStep,
    preview,
  } = flow

    return (
      <main className="workflow-page mood-page">
        <WorkflowSteps step={step} />
        <section className="workflow-heading">
          <button
            type="button"
            className="back-button"
            onClick={goBackStep}
            aria-label="이전 단계로 돌아가기"
          >
            ←
          </button>
          <div>
            <span className="section-kicker">디자인 만들기 · 3단계</span>
            <h1>어떤 분위기로 꾸며볼까요?</h1>
            <p>
              어려운 프롬프트 대신, 가게와 메뉴에 가장 가까운 느낌 하나만
              골라주세요.
            </p>
          </div>
        </section>

        <aside className="mobile-mood-preview" aria-label="포스터 실시간 미리보기">
          <div>{preview}</div>
          <p>
            <span>실시간 미리보기</span>
            <strong>{selectedMood.title}</strong>
          </p>
        </aside>

        <div className="mood-layout">
          <section className="mood-main">
            <button
              type="button"
              role="radio"
              aria-checked={mood === moodPresets[0].id}
              className={`mood-card mood-card-auto mood-auto-feature ${
                mood === moodPresets[0].id ? "selected" : ""
              }`}
              onClick={() => selectMood(moodPresets[0].id)}
            >
              <span className="mood-visual">
                <i />
                <i />
                <i />
              </span>
              <strong>{moodPresets[0].title}</strong>
              <small>{moodPresets[0].caption}</small>
              <b>{moodPresets[0].tone}</b>
            </button>
            <div
              className="mood-grid"
              role="radiogroup"
              aria-label="포스터 분위기"
            >
              {moodPresets.slice(1).map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  role="radio"
                  aria-checked={mood === preset.id}
                  className={`mood-card mood-card-${preset.id} ${
                    mood === preset.id ? "selected" : ""
                  }`}
                  onClick={() => selectMood(preset.id)}
                >
                  <span className="mood-visual">
                    <i />
                    <i />
                    <i />
                  </span>
                  <strong>{preset.title}</strong>
                  <small>{preset.caption}</small>
                  <b>{preset.tone}</b>
                </button>
              ))}
            </div>

            <section className="palette-panel" aria-labelledby="palette-title">
              <div>
                <span>선택한 분위기의 색상 조합</span>
                <h2 id="palette-title">{selectedMood.title}</h2>
                <p>
                  <span className="palette-copy-desktop">
                    추천 조합을 누르면 오른쪽 포스터에 바로 적용됩니다.
                  </span>
                  <span className="palette-copy-mobile">
                    추천 조합을 누르면 위 포스터에 바로 적용됩니다.
                  </span>
                </p>
              </div>
              <div
                className="palette-options"
                role="radiogroup"
                aria-label="색상 조합"
              >
                {selectedMood.palettes.map((palette, index) => (
                  <button
                    type="button"
                    role="radio"
                    aria-checked={paletteIndex === index}
                    className={paletteIndex === index ? "selected" : ""}
                    key={palette.join("-")}
                    onClick={() => selectPalette(index)}
                  >
                    <span>
                      {palette.map((color) => (
                        <i key={color} style={{ background: color }} />
                      ))}
                    </span>
                    <b>추천 조합 {index + 1}</b>
                    <small>{palette.join(" · ")}</small>
                  </button>
                ))}
              </div>
            </section>

            <details className="reference-accordion">
              <summary>
                <span>참고할 분위기 이미지가 있나요?</span>
                <b>선택 사항</b>
              </summary>
              <div>
                <UploadField
                  id="reference-upload"
                  title="캡처한 레퍼런스를 올려주세요"
                  description="색감과 분위기만 참고하며 그대로 복제하지 않아요"
                  accept="image/jpeg,image/png,image/webp"
                  preview={referencePreview}
                  previewAlt="업로드한 분위기 참고 이미지"
                  onChange={(event) => readFile(event, setReferencePreview)}
                  onRemove={() => setReferencePreview("")}
                />
                <label className="extra-request">
                  <span>한 줄 추가 요청</span>
                  <input
                    value={extraKeyword}
                    onChange={(event) => setExtraKeyword(event.target.value)}
                    placeholder="예: 배경에 얼음과 민트 잎 느낌을 살짝 넣어주세요"
                  />
                </label>
              </div>
            </details>
          </section>

          <aside className="mood-summary">
            <div className="mini-poster">{preview}</div>
            <span>선택한 분위기</span>
            <strong>{selectedMood.title}</strong>
            <div className="summary-palette" aria-label="선택한 색상">
              {selectedPalette.map((color) => (
                <i key={color} style={{ background: color }} />
              ))}
            </div>
            <p>
              {poster.label} · {poster.layoutLabel}
            </p>
          </aside>
        </div>

        <div className="workflow-action-bar">
          <div>
            <strong>
              {aiCredits > 0
                ? `AI 생성권 · 남은 횟수 ${aiCredits}회`
                : "생성권을 모두 사용했어요"}
            </strong>
          </div>
          <button
            type="button"
            className="next-button"
            disabled={aiCredits === 0}
            onClick={requestAiPosterGeneration}
          >
            <span>AI 포스터 생성하기</span>
            <span aria-hidden="true">→</span>
          </button>
        </div>

        {generating && (
          <div
            className="generation-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="generation-title"
          >
            <section className="generation-card">
              <div className="generation-preview">
                <i />
                <i />
                <i />
              </div>
              <span className="generation-count">
                {generationStage + 1} / 3
              </span>
              <h2 id="generation-title">포스터를 조립하고 있어요</h2>
              <p>{generationMessages[generationStage]}</p>
              <div className="generation-progress">
                <i style={{ width: `${((generationStage + 1) / 3) * 100}%` }} />
              </div>
              <small>
                이 화면을 닫지 않아도 잠시 후 자동으로 에디터가 열립니다.
              </small>
            </section>
          </div>
        )}

        {showGenerationConfirm && (
          <div
            className="dialog-backdrop"
            role="presentation"
            onMouseDown={() => setShowGenerationConfirm(false)}
          >
            <section
              className="home-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="generation-confirm-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <div className="dialog-brand" aria-hidden="true">
                <img src="/assets/click-logo.png" alt="" />
              </div>
              <h2 id="generation-confirm-title">포스터를 다시 생성할까요?</h2>
              <p>
                생성권 1회가 사용돼요. 지금 편집한 내용은 유지돼요.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => setShowGenerationConfirm(false)}
                >
                  취소
                </button>
                <button type="button" onClick={startAiPosterGeneration}>
                  생성하기
                </button>
              </div>
            </section>
          </div>
        )}
      </main>
    )
}
