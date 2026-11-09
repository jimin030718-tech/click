"use client"

import { useEffect, useRef, useState, type ChangeEvent, type CSSProperties, type PointerEvent as ReactPointerEvent } from "react"
import { posterContent, questionsByCategory } from "@/lib/posters"
import { defaultTextStyle, moodPresets, adjustHexBrightness, type TextElement, type TextObjectStyle } from "@/lib/styles"
import { PosterArtwork } from "@/components/editor/PosterArtwork"

import type { Poster } from "@/lib/posters"

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

// 디자인 만들기 2~5단계가 함께 쓰는 값(입력 내용, 사진, 로고, 글자 위치, 되돌리기 기록 등)을 모두 여기서 관리합니다.
// 한 곳에 있기 때문에 단계를 넘겨도 내용이 그대로 유지됩니다.
export function useDesignFlow(poster: Poster, onBack: () => void) {
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

  return {
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
    activeField,
    setActiveField,
    baseContent,
    categoryQuestions,
    placeFieldLabel,
    placeFieldPlaceholder,
    form,
    setForm,
    mood,
    setMood,
    paletteIndex,
    setPaletteIndex,
    referencePreview,
    setReferencePreview,
    extraKeyword,
    setExtraKeyword,
    generating,
    setGenerating,
    generationStage,
    setGenerationStage,
    aiCredits,
    setAiCredits,
    posterGenerationCount,
    setPosterGenerationCount,
    showGenerationConfirm,
    setShowGenerationConfirm,
    editorTab,
    setEditorTab,
    backgroundVariation,
    setBackgroundVariation,
    brightness,
    setBrightness,
    photoTransforms,
    setPhotoTransforms,
    activePhotoIndex,
    setActivePhotoIndex,
    logoTransform,
    setLogoTransform,
    textStyles,
    setTextStyles,
    selectedText,
    setSelectedText,
    downloaded,
    setDownloaded,
    rating,
    setRating,
    timeSaved,
    setTimeSaved,
    showTemplateExitDialog,
    setShowTemplateExitDialog,
    undoStack,
    setUndoStack,
    redoStack,
    setRedoStack,
    canvasZoom,
    setCanvasZoom,
    canvasPosterRef,
    photoDragRef,
    photoFrameRef,
    pendingPhotoTransform,
    textStyle,
    photoTransform,
    createEditorSnapshot,
    restoreEditorSnapshot,
    captureUndoSnapshot,
    undoLastChange,
    redoLastChange,
    selectedMood,
    selectedPalette,
    previewBackground,
    generationMessages,
    startAiPosterGeneration,
    requestAiPosterGeneration,
    readFile,
    readPhoto,
    updateForm,
    formatPrice,
    selectMood,
    selectPalette,
    updateTextContent,
    selectedTextContent,
    updateSelectedTextStyle,
    updatePhotoTransform,
    updateLogoTransform,
    updateBrightness,
    startTextDrag,
    startPhotoDrag,
    movePhoto,
    goBackStep,
    customContent,
    placeholderContent,
    hasEnteredContent,
    preview,
  }
}

export type DesignFlowState = ReturnType<typeof useDesignFlow>
