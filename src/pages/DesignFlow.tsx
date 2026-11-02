import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { posterContent, questionsByCategory, type Poster } from "../data/posters"
import { defaultTextStyle, fontCombinations, moodPresets, adjustHexBrightness, type TextElement, type TextObjectStyle } from "../data/styles"
import { PosterArtwork } from "../components/PosterArtwork"
import { UploadField } from "../components/UploadField"
import { WorkflowSteps } from "../components/WorkflowSteps"

export type PosterForm = {
  eyebrow: string
  title: string
  subtitle: string
  price: string
  period: string
  flavor: string
  info: string
  brandName: string
}

export type EditorSnapshot = {
  form: PosterForm
  textStyles: Record<TextElement, TextObjectStyle>
  photoTransforms: { x: number; y: number; scale: number }[]
  logoTransform: { x: number; y: number; scale: number }
  backgroundVariation: string
  brightness: number
}

export function UploadPage({ poster, onBack }: { poster: Poster; onBack: () => void }) {
  const imageSlotCount =
    poster.layout === "bottom" || poster.layout === "middle" ? 2 : 1
  const [step, setStep] = useState<2 | 3 | 4 | 5>(2)
  const [photoPreviews, setPhotoPreviews] = useState<string[]>(() =>
    Array(imageSlotCount).fill(""),
  )
  const [logoPreview, setLogoPreview] = useState("")
  const [useAiImage, setUseAiImage] = useState(false)
  const [skipLogo, setSkipLogo] = useState(false)
  const [activeField, setActiveField] = useState("TITLE")
  const baseContent = posterContent[poster.type]
  const categoryQuestions = questionsByCategory[poster.category] ?? []
  const placeFieldLabel =
    poster.category === "할인/프로모션"
      ? "가격"
      : poster.category === "공지/주의"
        ? "안내 대상 또는 장소"
        : "장소"
  const placeFieldPlaceholder =
    poster.category === "할인/프로모션"
      ? "예: 6,500원"
      : poster.category === "공지/주의"
        ? "예: 방문 고객 또는 1층 매장"
        : `예: ${baseContent.place}`
  const [form, setForm] = useState<PosterForm>({
    eyebrow: "",
    title: "",
    subtitle: "",
    price: "",
    period: "",
    flavor: "",
    info: "",
    brandName: "",
  })
  const [mood, setMood] = useState("modern")
  const [paletteIndex, setPaletteIndex] = useState(0)
  const [referencePreview, setReferencePreview] = useState("")
  const [extraKeyword, setExtraKeyword] = useState("")
  const [generating, setGenerating] = useState(false)
  const [generationStage, setGenerationStage] = useState(0)
  const [aiCredits, setAiCredits] = useState(10)
  const [posterGenerationCount, setPosterGenerationCount] = useState(0)
  const [showGenerationConfirm, setShowGenerationConfirm] = useState(false)
  const [editorTab, setEditorTab] = useState<
    "background" | "text" | "image" | "logo"
  >("background")
  const [backgroundVariation, setBackgroundVariation] = useState("a")
  const [brightness, setBrightness] = useState(100)
  const [photoTransforms, setPhotoTransforms] = useState(() =>
    Array.from({ length: imageSlotCount }, () => ({ x: 0, y: 0, scale: 1 })),
  )
  const [activePhotoIndex, setActivePhotoIndex] = useState(0)
  const [logoTransform, setLogoTransform] = useState({
    x: 0,
    y: 0,
    scale: 1,
  })
  const [textStyles, setTextStyles] = useState<
    Record<TextElement, TextObjectStyle>
  >(() => ({
    title: { ...defaultTextStyle },
    subtitle: { ...defaultTextStyle },
    flavor: { ...defaultTextStyle },
    info: { ...defaultTextStyle },
    date: { ...defaultTextStyle },
    place: { ...defaultTextStyle },
  }))
  const [selectedText, setSelectedText] = useState<TextElement>("title")
  const [downloaded, setDownloaded] = useState("")
  const [rating, setRating] = useState(0)
  const [timeSaved, setTimeSaved] = useState("")
  const [showTemplateExitDialog, setShowTemplateExitDialog] = useState(false)
  const [undoStack, setUndoStack] = useState<EditorSnapshot[]>([])
  const [redoStack, setRedoStack] = useState<EditorSnapshot[]>([])
  const [canvasZoom, setCanvasZoom] = useState(0)
  const canvasPosterRef = useRef<HTMLDivElement | null>(null)
  const photoDragRef = useRef({
    x: 0,
    y: 0,
    startX: 0,
    startY: 0,
    recorded: false,
  })
  const photoFrameRef = useRef<number | null>(null)
  const pendingPhotoTransform = useRef({ x: 0, y: 0 })
  const textStyle = textStyles[selectedText]
  const photoTransform = photoTransforms[activePhotoIndex]

  const createEditorSnapshot = (): EditorSnapshot => ({
      form: { ...form },
      textStyles: Object.fromEntries(
        Object.entries(textStyles).map(([key, style]) => [
          key,
          { ...style },
        ]),
      ) as Record<TextElement, TextObjectStyle>,
      photoTransforms: photoTransforms.map((transform) => ({ ...transform })),
      logoTransform: { ...logoTransform },
      backgroundVariation,
      brightness,
  })

  const restoreEditorSnapshot = (snapshot: EditorSnapshot) => {
    setForm(snapshot.form)
    setTextStyles(snapshot.textStyles)
    setPhotoTransforms(snapshot.photoTransforms)
    setLogoTransform(snapshot.logoTransform)
    setBackgroundVariation(snapshot.backgroundVariation)
    setBrightness(snapshot.brightness)
  }

  const captureUndoSnapshot = () => {
    const snapshot = createEditorSnapshot()
    setUndoStack((current) => [...current, snapshot].slice(-20))
    setRedoStack([])
  }

  const undoLastChange = () => {
    const snapshot = undoStack.at(-1)
    if (!snapshot) return
    setUndoStack((current) => current.slice(0, -1))
    setRedoStack((current) =>
      [...current, createEditorSnapshot()].slice(-20),
    )
    restoreEditorSnapshot(snapshot)
  }

  const redoLastChange = () => {
    const snapshot = redoStack.at(-1)
    if (!snapshot) return
    setRedoStack((current) => current.slice(0, -1))
    setUndoStack((current) =>
      [...current, createEditorSnapshot()].slice(-20),
    )
    restoreEditorSnapshot(snapshot)
  }

  const selectedMood =
    moodPresets.find((preset) => preset.id === mood) ?? moodPresets[1]
  const selectedPalette = selectedMood.palettes[paletteIndex]
  const previewBackground = adjustHexBrightness(selectedPalette[0], brightness)
  const generationMessages = [
    "사진을 레이아웃에 맞추는 중...",
    `‘${selectedMood.title}’ 배경을 만드는 중...`,
    "글자를 선명하게 올리는 중...",
  ]

  const startAiPosterGeneration = () => {
    if (aiCredits === 0) return
    setAiCredits((credits) => credits - 1)
    setPosterGenerationCount((count) => count + 1)
    setGenerationStage(0)
    setGenerating(true)
    setShowGenerationConfirm(false)
  }

  const requestAiPosterGeneration = () => {
    if (aiCredits === 0) return
    if (posterGenerationCount > 0) {
      setShowGenerationConfirm(true)
      return
    }
    startAiPosterGeneration()
  }

  useEffect(() => {
    if (!generating) return
    const timer = window.setTimeout(() => {
      if (generationStage < generationMessages.length - 1) {
        setGenerationStage((stage) => stage + 1)
      } else {
        setGenerating(false)
        setStep(4)
      }
    }, 1100)
    return () => window.clearTimeout(timer)
  }, [generating, generationStage, generationMessages.length])

  useEffect(
    () => () => {
      if (photoFrameRef.current !== null) {
        window.cancelAnimationFrame(photoFrameRef.current)
      }
    },
    [],
  )

  useEffect(() => {
    if (step !== 4 || !canvasPosterRef.current) return
    const canvas = canvasPosterRef.current
    const updateZoom = () => {
      setCanvasZoom(Math.round((canvas.getBoundingClientRect().width / 1240) * 100))
    }
    updateZoom()
    const observer = new ResizeObserver(updateZoom)
    observer.observe(canvas)
    return () => observer.disconnect()
  }, [step])

  const readFile = (
    event: ChangeEvent<HTMLInputElement>,
    setPreview: (value: string) => void,
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => setPreview(String(reader.result))
    reader.readAsDataURL(file)
  }

  const readPhoto = (index: number, event: ChangeEvent<HTMLInputElement>) => {
    readFile(event, (value) => {
      setPhotoPreviews((current) =>
        current.map((photo, photoIndex) =>
          photoIndex === index ? value : photo,
        ),
      )
    })
  }

  const updateForm = (key: keyof PosterForm, value: string) => {
    setForm((current) => ({ ...current, [key]: value }))
  }

  const formatPrice = (value: string) => {
    const digits = value.replace(/\D/g, "")
    updateForm(
      "price",
      digits ? `${Number(digits).toLocaleString("ko-KR")}원` : "",
    )
  }

  const selectMood = (nextMood: string) => {
    const preset =
      moodPresets.find((item) => item.id === nextMood) ?? moodPresets[1]
    setMood(nextMood)
    setPaletteIndex(0)
    setTextStyles((current) =>
      Object.fromEntries(
        Object.entries(current).map(([key, style]) => [
          key,
          { ...style, color: preset.palettes[0][1] },
        ]),
      ) as Record<TextElement, TextObjectStyle>,
    )
  }

  const selectPalette = (index: number) => {
    setPaletteIndex(index)
    setTextStyles((current) =>
      Object.fromEntries(
        Object.entries(current).map(([key, style]) => [
          key,
          { ...style, color: selectedMood.palettes[index][1] },
        ]),
      ) as Record<TextElement, TextObjectStyle>,
    )
  }

  const updateTextContent = (element: TextElement, value: string) => {
    const key =
      element === "title"
        ? "title"
        : element === "subtitle"
          ? "subtitle"
          : element === "flavor"
            ? "flavor"
            : element === "info"
              ? "info"
              : element === "date"
                ? "period"
                : "price"
    if (form[key] === value) return
    captureUndoSnapshot()
    updateForm(key, value)
  }

  const selectedTextContent =
    selectedText === "title"
      ? form.title
      : selectedText === "subtitle"
        ? form.subtitle
        : selectedText === "flavor"
          ? form.flavor
          : selectedText === "info"
            ? form.info
            : selectedText === "date"
              ? form.period
              : form.price

  const updateSelectedTextStyle = (patch: Partial<TextObjectStyle>) => {
    if (
      Object.entries(patch).every(
        ([key, value]) =>
          textStyles[selectedText][key as keyof TextObjectStyle] === value,
      )
    ) {
      return
    }
    captureUndoSnapshot()
    setTextStyles((current) => ({
      ...current,
      [selectedText]: { ...current[selectedText], ...patch },
    }))
  }

  const updatePhotoTransform = (
    index: number,
    patch: Partial<{ x: number; y: number; scale: number }>,
    recordHistory = true,
  ) => {
    const currentTransform = photoTransforms[index]
    if (
      Object.entries(patch).every(
        ([key, value]) =>
          currentTransform[key as keyof typeof currentTransform] === value,
      )
    ) {
      return
    }
    if (recordHistory) captureUndoSnapshot()
    setPhotoTransforms((current) =>
      current.map((transform, photoIndex) =>
        photoIndex === index ? { ...transform, ...patch } : transform,
      ),
    )
  }

  const updateLogoTransform = (
    patch: Partial<{ x: number; y: number; scale: number }>,
  ) => {
    if (
      Object.entries(patch).every(
        ([key, value]) =>
          logoTransform[key as keyof typeof logoTransform] === value,
      )
    ) {
      return
    }
    captureUndoSnapshot()
    setLogoTransform((current) => ({ ...current, ...patch }))
  }

  const updateBrightness = (value: number) => {
    if (brightness === value) return
    captureUndoSnapshot()
    setBrightness(value)
  }

  const startTextDrag = (
    event: ReactPointerEvent<HTMLElement>,
    element: TextElement,
  ) => {
    event.preventDefault()
    event.stopPropagation()
    setSelectedText(element)
    setEditorTab("text")
    const origin = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: textStyles[element].x,
      y: textStyles[element].y,
    }
    const target = event.currentTarget
    target.setPointerCapture(event.pointerId)
    const posterBounds = target
      .closest(".editorial-poster")
      ?.getBoundingClientRect()

    let recorded = false
    const move = (moveEvent: PointerEvent) => {
      const deltaX = moveEvent.clientX - origin.pointerX
      const deltaY = moveEvent.clientY - origin.pointerY
      if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return
      if (!recorded) {
        captureUndoSnapshot()
        recorded = true
      }
      const posterWidth = posterBounds?.width ?? 405
      const posterHeight = posterBounds?.height ?? posterWidth * 1.414
      setTextStyles((current) => ({
        ...current,
        [element]: {
          ...current[element],
          x: Math.max(
            -45,
            Math.min(
              45,
              origin.x + (deltaX / posterWidth) * 100,
            ),
          ),
          y: Math.max(
            -45,
            Math.min(
              45,
              origin.y + (deltaY / posterHeight) * 100,
            ),
          ),
        },
      }))
    }
    const stop = () => {
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
    }
    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
  }

  const startPhotoDrag = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId)
    photoDragRef.current = {
      x: event.clientX,
      y: event.clientY,
      startX: photoTransform.x,
      startY: photoTransform.y,
      recorded: false,
    }
  }

  const movePhoto = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!event.currentTarget.hasPointerCapture(event.pointerId)) return
    const bounds = event.currentTarget.getBoundingClientRect()
    pendingPhotoTransform.current = {
      x: Math.max(
        -9,
        Math.min(
          9,
          photoDragRef.current.startX +
            ((event.clientX - photoDragRef.current.x) / bounds.width) * 20,
        ),
      ),
      y: Math.max(
        -9,
        Math.min(
          9,
          photoDragRef.current.startY +
            ((event.clientY - photoDragRef.current.y) / bounds.height) * 20,
        ),
      ),
    }
    if (
      pendingPhotoTransform.current.x === photoTransform.x &&
      pendingPhotoTransform.current.y === photoTransform.y
    ) {
      return
    }
    if (!photoDragRef.current.recorded) {
      captureUndoSnapshot()
      photoDragRef.current.recorded = true
    }
    if (photoFrameRef.current !== null) return
    photoFrameRef.current = window.requestAnimationFrame(() => {
      updatePhotoTransform(
        activePhotoIndex,
        pendingPhotoTransform.current,
        false,
      )
      photoFrameRef.current = null
    })
  }

  const goBackStep = () => {
    if (step === 2) onBack()
    else setStep((current) => (current - 1) as 2 | 3 | 4 | 5)
  }

  const customContent = {
    eyebrow: form.eyebrow,
    title: form.title,
    subtitle: form.subtitle,
    flavor: form.flavor,
    info: form.info,
    date: form.period,
    place: form.price,
    brandName: form.brandName,
  }

  const placeholderContent = {
    title: baseContent.titleAccent,
    subtitle: baseContent.title,
    flavor:
      poster.category === "소개" || poster.category === "할인/프로모션"
        ? "예: 상큼한 과육과 부드러운 크림"
        : "",
    info: baseContent.copy,
    date: baseContent.date,
    place:
      poster.category === "할인/프로모션"
        ? "예: 6,500원"
        : poster.category === "공지/주의"
          ? "예: 방문 고객 또는 1층 매장"
          : baseContent.place,
  }
  const hasEnteredContent =
    Object.values(form).some((value) => value.trim()) ||
    photoPreviews.some(Boolean) ||
    Boolean(logoPreview) ||
    useAiImage ||
    skipLogo

  const preview = (
    <div
      className={`flow-poster mood-${mood} variation-${backgroundVariation}`}
      style={
        {
          "--preview-background": previewBackground,
          "--preview-ink": selectedPalette[1],
          "--preview-accent": selectedPalette[2],
        } as CSSProperties
      }
    >
      <PosterArtwork
        type={poster.type}
        layout={poster.layout}
        photoSrcs={photoPreviews}
        logoSrc={skipLogo ? "" : logoPreview}
        customContent={customContent}
        placeholderContent={placeholderContent}
        photoTransforms={photoTransforms}
        textStyles={textStyles}
        logoTransform={logoTransform}
        showPlaceholders={step === 2}
        hideIssue
        editable={step === 4}
        selectedText={selectedText}
        onSelectText={(element) => {
          setSelectedText(element)
          setEditorTab("text")
        }}
        onTextInput={updateTextContent}
        onTextPointerDown={startTextDrag}
      />
      {step === 2 && (
        <span
          className={`guide-highlight guide-${activeField.toLowerCase()}`}
          aria-hidden="true"
        />
      )}
    </div>
  )

  if (step === 3) {
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

  if (step === 4) {
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

  if (step === 5) {
    const exportOptions = [
      {
        id: "print",
        label: "매장 부착·일반 프린터용",
        detail: "A4/A3 고화질 · PNG 또는 PDF",
        badge: "추천",
      },
      {
        id: "press",
        label: "인쇄소 의뢰용 초고화질",
        detail: "2배 업스케일 원본 · PNG 또는 PDF",
        badge: "2480 × 3508",
      },
      {
        id: "social",
        label: "SNS·배달앱 업로드용",
        detail: "인스타그램과 스마트플레이스 최적화",
        badge: "디지털",
      },
    ]
    return (
      <main className="workflow-page export-page-view">
        <WorkflowSteps step={step} />
        <section className="workflow-heading export-heading">
          <button
            type="button"
            className="back-button"
            onClick={goBackStep}
            aria-label="에디터로 돌아가기"
          >
            ←
          </button>
          <div>
            <span className="section-kicker">디자인 만들기 · 마지막 단계</span>
            <h1>포스터가 완성됐어요</h1>
            <p>사용할 곳에 맞는 크기를 고르면 선명한 파일로 준비해드려요.</p>
          </div>
        </section>
        <div className="export-layout">
          <aside className="export-preview">
            {preview}
            <span>최종 미리보기 · 1240 × 1754 px</span>
          </aside>
          <section className="export-options">
            <div className="export-list">
              {exportOptions.map((option) => (
                <button
                  type="button"
                  key={option.id}
                  onClick={() => setDownloaded(option.id)}
                >
                  <span className={`export-icon export-icon-${option.id}`} />
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.detail}</small>
                  </span>
                  <b>{option.badge}</b>
                  <i>↓</i>
                </button>
              ))}
            </div>
            {downloaded && (
              <div className="download-success">
                <span>✓</span>
                <div>
                  <strong>다운로드를 준비했어요</strong>
                  <p>곧 다운로드가 시작돼요.</p>
                </div>
              </div>
            )}
            <section className="feedback-card">
              <span>빠른 만족도 조사</span>
              <h2>오늘 포스터 제작은 만족스러우셨나요?</h2>
              <div className="rating-row" aria-label="별점 선택">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    type="button"
                    key={star}
                    className={star <= rating ? "selected" : ""}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </button>
                ))}
              </div>
              <p>기존 방식보다 시간이 얼마나 줄었나요?</p>
              <div className="time-chips">
                {["10분 이내", "30분 이상", "1시간 이상", "반나절 이상"].map(
                  (time) => (
                    <button
                      type="button"
                      key={time}
                      className={timeSaved === time ? "selected" : ""}
                      onClick={() => setTimeSaved(time)}
                    >
                      {time}
                    </button>
                  ),
                )}
              </div>
              {(rating > 0 || timeSaved) && (
                <small>
                  소중한 답변이 저장됐어요. 다음 포스터를 더 쉽게 만드는 데
                  활용할게요.
                </small>
              )}
            </section>
          </section>
        </div>
      </main>
    )
  }

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
