"use client"

import { fontCombinations, type TextElement, type TextObjectStyle } from "@/lib/styles"
import { UploadField } from "@/components/ui/UploadField"
import { WorkflowSteps } from "@/components/ui/WorkflowSteps"
import type { DesignFlowState } from "@/components/create/useDesignFlow"

// 2단계: 사진·로고·문구 정보 입력
// 상태는 useDesignFlow에 있고, 이 함수는 화면만 그립니다.
// (컴포넌트 <X />가 아니라 함수로 호출해야 단계를 넘길 때 화면이 예전과 똑같이 이어집니다.)
export function renderInfoStep(flow: DesignFlowState) {
  const {
    poster,
    onBack,
    imageSlotCount,
    step,
    setStep,
    photoPreviews,
    setPhotoPreviews,
    logoPreview,
    setLogoPreview,
    useAiImage,
    setUseAiImage,
    skipLogo,
    setSkipLogo,
    setActiveField,
    categoryQuestions,
    placeFieldLabel,
    placeFieldPlaceholder,
    form,
    textStyles,
    setTextStyles,
    showTemplateExitDialog,
    setShowTemplateExitDialog,
    readFile,
    readPhoto,
    updateForm,
    formatPrice,
    goBackStep,
    hasEnteredContent,
    preview,
  } = flow


  const showFlavor =
    poster.category === "소개" || poster.category === "할인/프로모션"
  const hasRequiredImage = useAiImage || photoPreviews.every(Boolean)

  return (
    <main className="workflow-page asset-page">
      <WorkflowSteps step={step} />
      <section className="workflow-heading">
        <button
          type="button"
          className="back-button"
          onClick={goBackStep}
          aria-label="템플릿 선택으로 돌아가기"
        >
          ←
        </button>
        <div>
          <span className="section-kicker">디자인 만들기 · 2단계</span>
          <h1>포스터에 들어갈 내용을 채워주세요</h1>
          <p>
            선택한 템플릿에 필요한 항목만 보여드려요. 입력 위치는 왼쪽에서 바로
            확인할 수 있습니다.
          </p>
        </div>
      </section>

      <div className="asset-layout">
        <aside className="template-guide">
          <div className="guide-label">
            <span>템플릿 미니 가이드</span>
            <b>
              <i /> 지금 입력할 위치
            </b>
          </div>
          <div className="guide-poster">{preview}</div>
          <div className="selected-template-meta">
            <span>선택한 템플릿</span>
            <strong>{poster.label}</strong>
            <p>
              {poster.category} · {poster.layoutLabel} · 이미지 {imageSlotCount}
              장
            </p>
          </div>
          <button
            type="button"
            onClick={() =>
              hasEnteredContent ? setShowTemplateExitDialog(true) : onBack()
            }
          >
            다른 템플릿 선택
          </button>
        </aside>

        <section className="dynamic-form" aria-label="포스터 맞춤 정보 입력">
          <div className="form-section">
            <div className="form-section-heading">
              <span>01</span>
              <div>
                <h2>사진</h2>
                <p>
                  템플릿의 이미지 슬롯 {imageSlotCount}개에 맞춰 자동
                  배치됩니다.
                </p>
              </div>
              <b>필수</b>
            </div>
            <div className={`photo-slot-grid slots-${imageSlotCount}`}>
              {photoPreviews.map((photo, index) => (
                <UploadField
                  key={index}
                  id={`photo-upload-${index}`}
                  title={
                    imageSlotCount > 1
                      ? `사진 ${index + 1}을 올려주세요`
                      : "메인 사진을 올려주세요"
                  }
                  description="JPG, PNG · 스마트폰 원본도 가능"
                  accept="image/jpeg,image/png,image/webp"
                  preview={photo}
                  previewAlt={`업로드한 사진 ${index + 1}`}
                  onChange={(event) => {
                    setActiveField("IMAGE")
                    readPhoto(index, event)
                  }}
                  onRemove={() =>
                    setPhotoPreviews((current) =>
                      current.map((value, photoIndex) =>
                        photoIndex === index ? "" : value,
                      ),
                    )
                  }
                />
              ))}
            </div>
            <label className="alternative-check">
              <input
                type="checkbox"
                checked={useAiImage}
                onChange={(event) => setUseAiImage(event.target.checked)}
              />
              <span>
                <strong>직접 찍은 사진이 없어요</strong>
                <small>AI로 샘플 이미지까지 함께 생성하기</small>
              </span>
              <i />
            </label>
          </div>

          <div className="form-section">
            <div className="form-section-heading">
              <span>02</span>
              <div>
                <h2>핵심 문구</h2>
                <p>포스터에 들어갈 순서대로 간단히 적어주세요.</p>
              </div>
              <b>제목만 필수</b>
            </div>
            <div className="dynamic-fields">
              <label onFocus={() => setActiveField("EYEBROW")}>
                <span>
                  짧은 머리말 <b>선택</b>
                  <em>{form.eyebrow.length}/28</em>
                </span>
                <input
                  maxLength={28}
                  value={form.eyebrow}
                  onChange={(event) =>
                    updateForm("eyebrow", event.target.value)
                  }
                  placeholder="예: 가을 한정 · 이번 주말만"
                />
                <small className="field-question">
                  포스터 위에 짧게 강조할 머리말을 적어주세요.
                </small>
              </label>
              <label onFocus={() => setActiveField("BRAND")}>
                <span>
                  가게 이름 <b>선택</b>
                  <em>{form.brandName.length}/24</em>
                </span>
                <input
                  maxLength={24}
                  value={form.brandName}
                  onChange={(event) =>
                    updateForm("brandName", event.target.value)
                  }
                  placeholder="예: 느린 오후 책방"
                />
                <small className="field-question">
                  가게나 브랜드 이름이 있다면 적어주세요.
                </small>
              </label>
              <label onFocus={() => setActiveField("TITLE")}>
                <span>
                  메인 제목 <b className="required">필수</b>
                  <em>{form.title.length}/24</em>
                </span>
                <input
                  maxLength={24}
                  value={form.title}
                  onChange={(event) => updateForm("title", event.target.value)}
                  placeholder="예: 봄 시즌 딸기 라떼 출시"
                />
                <small className="field-question">
                  {categoryQuestions[0]?.label}
                </small>
              </label>
              <label onFocus={() => setActiveField("SUBTITLE")}>
                <span>
                  보조 설명 <b>선택</b>
                  <em>{form.subtitle.length}/32</em>
                </span>
                <input
                  maxLength={32}
                  value={form.subtitle}
                  onChange={(event) =>
                    updateForm("subtitle", event.target.value)
                  }
                  placeholder="예: 생딸기가 듬뿍 들어간"
                />
                <small className="field-question">
                  {categoryQuestions[1]?.label}
                </small>
              </label>
              <label onFocus={() => setActiveField("PRICE")}>
                <span>
                  {placeFieldLabel} <b>선택</b>
                </span>
                <input
                  inputMode={
                    poster.category === "할인/프로모션" ? "numeric" : "text"
                  }
                  value={form.price}
                  onChange={(event) =>
                    poster.category === "할인/프로모션"
                      ? formatPrice(event.target.value)
                      : updateForm("price", event.target.value)
                  }
                  placeholder={placeFieldPlaceholder}
                />
                <small className="field-question">
                  {poster.category === "할인/프로모션"
                    ? "대표 가격이나 할인 금액은 얼마인가요?"
                    : poster.category === "공지/주의"
                      ? "누구에게 알리거나 어느 장소에 해당하나요?"
                      : "어디에서 진행하거나 만날 수 있나요?"}
                </small>
              </label>
              <label onFocus={() => setActiveField("PERIOD")}>
                <span>
                  {poster.category === "소개" ? "운영 시간" : "기간·일시"}{" "}
                  <b>선택</b>
                </span>
                <input
                  value={form.period}
                  onChange={(event) => updateForm("period", event.target.value)}
                  placeholder="예: 4월 1일부터 30일까지"
                />
                <small className="field-question">
                  {categoryQuestions[2]?.label}
                </small>
              </label>
              {showFlavor && (
                <label onFocus={() => setActiveField("FLAVOR")}>
                  <span>
                    특징·맛 표현 <b>선택</b>
                  </span>
                  <input
                    value={form.flavor}
                    onChange={(event) =>
                      updateForm("flavor", event.target.value)
                    }
                    placeholder="예: 상큼한 과육과 부드러운 크림"
                  />
                  <small className="field-question">
                    가장 강조하고 싶은 특징은 무엇인가요?
                  </small>
                </label>
              )}
              <label className="wide" onFocus={() => setActiveField("INFO")}>
                <span>
                  추가 안내 <b>선택</b>
                  <em>{form.info.length}/80</em>
                </span>
                <textarea
                  maxLength={80}
                  value={form.info}
                  onChange={(event) => updateForm("info", event.target.value)}
                  placeholder="한정 수량, 예약 방법, 문의 정보 등을 적어주세요"
                />
                <small className="field-question">
                  {categoryQuestions[3]?.label}
                </small>
              </label>
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-heading">
              <span>03</span>
              <div>
                <h2>폰트 조합</h2>
                <p>제목과 본문에 어울리는 조합을 선택해주세요.</p>
              </div>
              <b>필수</b>
            </div>
            <div
              className="font-combination-grid"
              role="radiogroup"
              aria-label="폰트 조합"
            >
              {fontCombinations.map((combination) => (
                <button
                  type="button"
                  role="radio"
                  aria-checked={textStyles.title.font === combination.id}
                  className={
                    textStyles.title.font === combination.id ? "selected" : ""
                  }
                  key={combination.id}
                  onClick={() =>
                    setTextStyles((current) =>
                      Object.fromEntries(
                        Object.entries(current).map(([key, style]) => [
                          key,
                          { ...style, font: combination.id },
                        ]),
                      ) as Record<TextElement, TextObjectStyle>,
                    )
                  }
                >
                  <span style={{ fontFamily: combination.families.title }}>
                    {form.title || "포스터 제목"}
                  </span>
                  <strong>{combination.name}</strong>
                  <small>
                    {combination.title} · {combination.body}
                  </small>
                </button>
              ))}
            </div>
          </div>

          <div className="form-section">
            <div className="form-section-heading">
              <span>04</span>
              <div>
                <h2>브랜드 로고</h2>
                <p>투명 배경 PNG 또는 SVG를 권장해요.</p>
              </div>
              <b className="optional">선택</b>
            </div>
            {!skipLogo && (
              <UploadField
                id="logo-upload"
                title="매장 로고를 올려주세요"
                description="지정된 LOGO 좌표에 비율을 유지해 배치해요"
                accept="image/png,image/svg+xml,image/webp"
                preview={logoPreview}
                previewAlt="업로드한 브랜드 로고"
                onChange={(event) => {
                  setActiveField("LOGO")
                  readFile(event, setLogoPreview)
                }}
                onRemove={() => setLogoPreview("")}
              />
            )}
            <label className="alternative-check">
              <input
                type="checkbox"
                checked={skipLogo}
                onChange={(event) => setSkipLogo(event.target.checked)}
              />
              <span>
                <strong>로고 파일이 없어요</strong>
                <small>입력한 가게 이름으로 대체하거나 비워두기</small>
              </span>
              <i />
            </label>
          </div>

          <div className="dynamic-form-footer">
            <p>입력한 사진과 문구는 선택한 템플릿 좌표에만 사용됩니다.</p>
            <button
              type="button"
              className="next-button"
              disabled={!hasRequiredImage || !form.title.trim()}
              onClick={() => setStep(3)}
            >
              <span>분위기 선택하기</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>
      </div>
      {showTemplateExitDialog && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={() => setShowTemplateExitDialog(false)}
        >
          <section
            className="home-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="template-exit-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="dialog-brand" aria-hidden="true">
              <img src="/assets/click-logo.png" alt="" />
            </div>
            <h2 id="template-exit-title">입력한 내용이 사라져요</h2>
            <p>다른 템플릿을 선택하면 지금 입력한 사진과 문구가 초기화됩니다.</p>
            <div>
              <button
                type="button"
                onClick={() => setShowTemplateExitDialog(false)}
              >
                계속 입력하기
              </button>
              <button type="button" onClick={onBack}>
                다른 템플릿 선택
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  )
}
