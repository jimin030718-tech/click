"use client"

import { fontCombinations } from "@/lib/styles"
import { WorkflowSteps } from "@/components/ui/WorkflowSteps"
import type { DesignFlowState } from "@/components/create/useDesignFlow"

// 4단계: 편집기(배경·글자·사진·로고 부분 수정)
// 상태는 useDesignFlow에 있고, 이 함수는 화면만 그립니다.
// (컴포넌트 <X />가 아니라 함수로 호출해야 단계를 넘길 때 화면이 예전과 똑같이 이어집니다.)
export function renderEditorStep(flow: DesignFlowState) {
  const {
    poster,
    imageSlotCount,
    step,
    setStep,
    photoPreviews,
    logoPreview,
    setLogoPreview,
    setSkipLogo,
    aiCredits,
    setAiCredits,
    editorTab,
    setEditorTab,
    backgroundVariation,
    setBackgroundVariation,
    brightness,
    activePhotoIndex,
    setActivePhotoIndex,
    logoTransform,
    selectedText,
    undoStack,
    redoStack,
    canvasZoom,
    canvasPosterRef,
    textStyle,
    photoTransform,
    captureUndoSnapshot,
    undoLastChange,
    redoLastChange,
    readFile,
    updateTextContent,
    selectedTextContent,
    updateSelectedTextStyle,
    updatePhotoTransform,
    updateLogoTransform,
    updateBrightness,
    startPhotoDrag,
    movePhoto,
    goBackStep,
    preview,
  } = flow

    return (
      <main className="workflow-page editor-page">
        <WorkflowSteps step={step} />
        <section className="editor-topbar">
          <button
            type="button"
            className="back-button"
            onClick={goBackStep}
            aria-label="분위기 설정으로 돌아가기"
          >
            ←
          </button>
          <div>
            <strong>{poster.label}</strong>
          </div>
          <button
            type="button"
            className="undo-button"
            disabled={undoStack.length === 0}
            onClick={undoLastChange}
          >
            ↶ 되돌리기
          </button>
          <button
            type="button"
            className="redo-button"
            disabled={redoStack.length === 0}
            onClick={redoLastChange}
          >
            ↷ 다시 실행
          </button>
          <button
            type="button"
            className="export-button"
            onClick={() => setStep(5)}
          >
            완성하고 내보내기 <span>→</span>
          </button>
        </section>

        <div className="editor-workspace">
          <section className="canvas-area" aria-label="포스터 캔버스">
            <div className="canvas-toolbar">
              <span>1240 × 1754 px</span>
              <b>{canvasZoom}%</b>
            </div>
            <div className="canvas-poster-wrap">
              <div className="canvas-poster" ref={canvasPosterRef}>
                {preview}
              </div>
            </div>
            <p>
              글자는 직접 클릭해 수정하고, 선택 상자의 핸들을 드래그해
              이동하세요.
            </p>
          </section>

          <aside className="partial-editor">
            <div className="editor-tabs" role="tablist">
              <button
                type="button"
                className={editorTab === "background" ? "active" : ""}
                onClick={() => setEditorTab("background")}
              >
                배경
              </button>
              <button
                type="button"
                className={editorTab === "text" ? "active" : ""}
                onClick={() => setEditorTab("text")}
              >
                글자
              </button>
              <button
                type="button"
                className={editorTab === "image" ? "active" : ""}
                onClick={() => setEditorTab("image")}
              >
                사진
              </button>
              <button
                type="button"
                className={editorTab === "logo" ? "active" : ""}
                onClick={() => setEditorTab("logo")}
              >
                로고
              </button>
            </div>

            {editorTab === "background" && (
              <div className="editor-controls">
                <div className="control-heading">
                  <span>배경만 바꾸기</span>
                  <p>글자와 제품 사진은 그대로 유지됩니다.</p>
                </div>
                <div className="variation-grid">
                  {["a", "b", "c"].map((variation) => (
                    <button
                      type="button"
                      key={variation}
                      className={`variation-${variation} ${
                        backgroundVariation === variation ? "selected" : ""
                      }`}
                      onClick={() => {
                        if (backgroundVariation === variation) return
                        captureUndoSnapshot()
                        setBackgroundVariation(variation)
                      }}
                    >
                      <i />
                      베리에이션 {variation.toUpperCase()}
                    </button>
                  ))}
                </div>
                <label className="range-control">
                  <span>
                    <b>배경 밝기</b>
                    <em>{brightness}%</em>
                  </span>
                  <input
                    type="range"
                    min="70"
                    max="125"
                    value={brightness}
                    onChange={(event) =>
                      updateBrightness(Number(event.target.value))
                    }
                  />
                </label>
                <button
                  type="button"
                  className="regenerate-background"
                  disabled={aiCredits === 0}
                  onClick={() => {
                    if (aiCredits === 0) return
                    captureUndoSnapshot()
                    setAiCredits((credits) => credits - 1)
                    setBackgroundVariation((current) =>
                      current === "a" ? "b" : current === "b" ? "c" : "a",
                    )
                  }}
                >
                  {aiCredits > 0
                    ? `배경만 새로 생성 · 남은 횟수 ${aiCredits}회`
                    : "생성권을 모두 사용했어요"}
                </button>
              </div>
            )}

            {editorTab === "text" && (
              <div className="editor-controls text-controls">
                <div className="control-heading">
                  <span>
                    {selectedText === "title"
                      ? "메인 제목"
                      : selectedText === "subtitle"
                        ? "보조 문구"
                        : selectedText === "flavor"
                          ? "특징·맛 표현"
                          : selectedText === "info"
                            ? "추가 안내"
                          : selectedText === "date"
                            ? "기간·일시"
                            : "가격·장소"}
                  </span>
                  <p>
                    캔버스의 글자를 직접 수정하고 이동 핸들로 위치를 바꿔보세요.
                  </p>
                </div>
                <label className="mobile-text-input">
                  <span>선택한 글자 내용</span>
                  <textarea
                    value={selectedTextContent}
                    onChange={(event) =>
                      updateTextContent(selectedText, event.target.value)
                    }
                    rows={3}
                  />
                </label>
                <div className="editor-font-picker">
                  <span>폰트 조합</span>
                  <div
                    className="editor-font-list"
                    role="radiogroup"
                    aria-label="폰트 조합 선택"
                  >
                    {fontCombinations.map((combination) => {
                      const previewFamily =
                        selectedText === "title"
                          ? combination.families.title
                          : selectedText === "subtitle"
                            ? combination.families.subtitle
                            : combination.families.body
                      return (
                        <button
                          type="button"
                          role="radio"
                          aria-checked={textStyle.font === combination.id}
                          className={
                            textStyle.font === combination.id ? "selected" : ""
                          }
                          key={combination.id}
                          onClick={() =>
                            updateSelectedTextStyle({ font: combination.id })
                          }
                        >
                          <strong style={{ fontFamily: previewFamily }}>
                            {selectedTextContent || "가나다라마바사"}
                          </strong>
                          <span>
                            <b>{combination.name}</b>
                            <small>
                              {selectedText === "title"
                                ? combination.title
                                : selectedText === "subtitle"
                                  ? combination.subtitle
                                  : combination.body}
                            </small>
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
                <label className="range-control compact">
                  <span>
                    <b>글자 크기</b>
                    <em>{textStyle.size}%</em>
                  </span>
                  <input
                    type="range"
                    min="70"
                    max="140"
                    value={textStyle.size}
                    onChange={(event) =>
                      updateSelectedTextStyle({
                        size: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="range-control compact">
                  <span>
                    <b>장평</b>
                    <em>{textStyle.width}%</em>
                  </span>
                  <input
                    type="range"
                    min="70"
                    max="130"
                    value={textStyle.width}
                    onChange={(event) =>
                      updateSelectedTextStyle({
                        width: Number(event.target.value),
                      })
                    }
                  />
                </label>
                <label className="range-control compact">
                  <span>
                    <b>자간</b>
                    <em>{textStyle.letterSpacing.toFixed(2)}em</em>
                  </span>
                  <input
                    type="range"
                    min="-8"
                    max="20"
                    value={textStyle.letterSpacing * 100}
                    onChange={(event) =>
                      updateSelectedTextStyle({
                        letterSpacing: Number(event.target.value) / 100,
                      })
                    }
                  />
                </label>
                <div className="inline-controls">
                  <label>
                    <span>글자 색상</span>
                    <input
                      type="color"
                      value={textStyle.color}
                      onChange={(event) =>
                        updateSelectedTextStyle({ color: event.target.value })
                      }
                    />
                  </label>
                  <div>
                    <span>정렬</span>
                    <div>
                      {(["left", "center", "right"] as const).map((align) => (
                        <button
                          type="button"
                          key={align}
                          className={textStyle.align === align ? "active" : ""}
                          onClick={() => updateSelectedTextStyle({ align })}
                          aria-label={
                            align === "left"
                              ? "왼쪽 정렬"
                              : align === "center"
                                ? "가운데 정렬"
                                : "오른쪽 정렬"
                          }
                        >
                          <i className={`align-icon align-${align}`}>
                            <span />
                            <span />
                            <span />
                          </i>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {editorTab === "image" && (
              <div className="editor-controls">
                <div className="control-heading">
                  <span>사진 위치·크기</span>
                  <p>프레임은 고정하고 안쪽 사진만 미세하게 조절합니다.</p>
                </div>
                {imageSlotCount > 1 && (
                  <div className="photo-selector" role="tablist">
                    {photoPreviews.map((_, index) => (
                      <button
                        type="button"
                        role="tab"
                        aria-selected={activePhotoIndex === index}
                        className={activePhotoIndex === index ? "active" : ""}
                        key={index}
                        onClick={() => setActivePhotoIndex(index)}
                      >
                        사진 {index + 1}
                      </button>
                    ))}
                  </div>
                )}
                <div
                  className="crop-preview draggable"
                  onPointerDown={startPhotoDrag}
                  onPointerMove={movePhoto}
                >
                  <img
                    src={
                      photoPreviews[activePhotoIndex] ||
                      `/assets/posters/${poster.type}.jpg`
                    }
                    alt="조절 중인 사진"
                    style={{
                      transform: `translate3d(${photoTransform.x}%, ${photoTransform.y}%, 0) scale(${photoTransform.scale})`,
                    }}
                  />
                  <span>사진을 드래그해 위치를 조절하세요</span>
                </div>
                <label className="range-control">
                  <span>
                    <b>확대</b>
                    <em>{Math.round(photoTransform.scale * 100)}%</em>
                  </span>
                  <input
                    type="range"
                    min="100"
                    max="180"
                    value={photoTransform.scale * 100}
                    onChange={(event) =>
                      updatePhotoTransform(activePhotoIndex, {
                        scale: Number(event.target.value) / 100,
                      })
                    }
                  />
                </label>
                <button
                  type="button"
                  className="reset-control"
                  onClick={() => {
                    updatePhotoTransform(activePhotoIndex, {
                      x: 0,
                      y: 0,
                      scale: 1,
                    })
                  }}
                >
                  원래 위치로 되돌리기
                </button>
              </div>
            )}

            {editorTab === "logo" && (
              <div className="editor-controls">
                <div className="control-heading">
                  <span>로고 수정</span>
                  <p>로고 파일을 교체하고 크기와 위치를 조절할 수 있어요.</p>
                </div>
                {logoPreview ? (
                  <div className="logo-editor-preview">
                    <img
                      src={logoPreview}
                      alt="편집 중인 브랜드 로고"
                      style={{
                        transform: `translate3d(${logoTransform.x}%, ${logoTransform.y}%, 0) scale(${logoTransform.scale})`,
                      }}
                    />
                  </div>
                ) : (
                  <p className="logo-empty-message">
                    아직 등록된 로고가 없습니다. 아래 버튼에서 PNG, SVG 또는
                    WEBP 파일을 추가해주세요.
                  </p>
                )}
                <label className="logo-file-button">
                  <input
                    type="file"
                    accept="image/png,image/svg+xml,image/webp"
                    onChange={(event) =>
                      readFile(event, (value) => {
                        setLogoPreview(value)
                        setSkipLogo(false)
                      })
                    }
                  />
                  {logoPreview ? "다른 로고로 교체" : "로고 파일 추가"}
                </label>
                {logoPreview && (
                  <>
                    <label className="range-control">
                      <span>
                        <b>로고 크기</b>
                        <em>{Math.round(logoTransform.scale * 100)}%</em>
                      </span>
                      <input
                        type="range"
                        min="50"
                        max="180"
                        value={logoTransform.scale * 100}
                        onChange={(event) =>
                          updateLogoTransform({
                            scale: Number(event.target.value) / 100,
                          })
                        }
                      />
                    </label>
                    <label className="range-control">
                      <span>
                        <b>가로 위치</b>
                        <em>{logoTransform.x}%</em>
                      </span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={logoTransform.x}
                        onChange={(event) =>
                          updateLogoTransform({
                            x: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <label className="range-control">
                      <span>
                        <b>세로 위치</b>
                        <em>{logoTransform.y}%</em>
                      </span>
                      <input
                        type="range"
                        min="-100"
                        max="100"
                        value={logoTransform.y}
                        onChange={(event) =>
                          updateLogoTransform({
                            y: Number(event.target.value),
                          })
                        }
                      />
                    </label>
                    <button
                      type="button"
                      className="reset-control"
                      onClick={() => {
                        updateLogoTransform({ x: 0, y: 0, scale: 1 })
                      }}
                    >
                      로고 위치 초기화
                    </button>
                  </>
                )}
              </div>
            )}
          </aside>
        </div>
      </main>
    )
}
