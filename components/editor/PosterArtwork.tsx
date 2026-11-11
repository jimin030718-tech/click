import { type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from "react"
import { posterContent, type LayoutKind } from "@/lib/posters"
import { fontCombinations, type TextElement, type TextObjectStyle } from "@/lib/styles"

export function PosterArtwork({
  type,
  layout,
  photoSrc,
  photoSrcs,
  logoSrc,
  customContent,
  placeholderContent,
  photoTransforms,
  textStyles,
  logoTransform,
  showPlaceholders,
  hideIssue,
  editable,
  selectedText,
  onSelectText,
  onTextInput,
}: {
  type: string
  layout: LayoutKind
  photoSrc?: string
  photoSrcs?: string[]
  logoSrc?: string
  customContent?: Partial<{
    eyebrow: string
    title: string
    subtitle: string
    flavor: string
    info: string
    date: string
    place: string
    brandName: string
  }>
  placeholderContent?: Partial<{
    title: string
    subtitle: string
    flavor: string
    info: string
    date: string
    place: string
  }>
  photoTransforms?: { x: number; y: number; scale: number }[]
  textStyles?: Record<TextElement, TextObjectStyle>
  logoTransform?: { x: number; y: number; scale: number }
  showPlaceholders?: boolean
  hideIssue?: boolean
  editable?: boolean
  selectedText?: TextElement
  onSelectText?: (element: TextElement) => void
  onTextInput?: (element: TextElement, value: string) => void
  // 예전 드래그 방식용. 지금은 PosterMoveable이 드래그를 맡아서 쓰지 않습니다.
  // (useDesignFlow가 아직 넘겨주고 있어서 자리만 남겨 둠)
  onTextPointerDown?: (
    event: ReactPointerEvent<HTMLElement>,
    element: TextElement,
  ) => void
}) {
  const content = posterContent[type] ?? posterContent.community
  const defaultPhoto = `/assets/posters/${type}.jpg`
  const imageCount = layout === "bottom" || layout === "middle" ? 2 : 1

  const textValue = (element: TextElement) => {
    if (!customContent) {
      if (element === "title") return content.titleAccent
      if (element === "subtitle") return content.title
      if (element === "info") return content.copy
      if (element === "date") return content.date
      if (element === "place") return content.place
      return ""
    }
    const value = customContent[element]
    return value || (showPlaceholders ? placeholderContent?.[element] : "") || ""
  }

  const isPlaceholder = (element: TextElement) =>
    !customContent?.[element] && Boolean(textValue(element))

  const elementStyle = (element: TextElement) => {
    const style = textStyles?.[element]
    const textLength = textValue(element).replace(/\s/g, "").length
    const lengthScale =
      element === "title"
        ? textLength > 20
          ? 0.62
          : textLength > 15
            ? 0.76
            : textLength > 10
              ? 0.88
              : 1
        : element === "subtitle"
          ? textLength > 27
            ? 0.62
            : textLength > 20
              ? 0.74
              : textLength > 14
                ? 0.86
                : 1
          : 1

    if (!style) {
      return element === "title" || element === "subtitle"
        ? ({ fontSize: `${lengthScale}em` } as CSSProperties)
        : undefined
    }
    const combination =
      fontCombinations.find((item) => item.id === style.font) ??
      fontCombinations[0]
    const family =
      element === "title"
        ? combination.families.title
        : element === "subtitle"
          ? combination.families.subtitle
          : combination.families.body

    return {
      color: style.color,
      textAlign: style.align,
      fontFamily: family,
      fontSize:
        element === "title" || element === "subtitle"
          ? `${lengthScale}em`
          : undefined,
      letterSpacing: `${style.letterSpacing}em`,
      transform: `translate3d(${style.x}cqw, ${style.y}cqh, 0) scale(${style.size / 100}) scaleX(${style.width / 100})`,
      transformOrigin:
        style.align === "left"
          ? "left center"
          : style.align === "right"
            ? "right center"
            : "center",
    } as CSSProperties
  }

  const editableTextProps = (
    element: TextElement,
    additionalClassName = "",
  ) => {
    const textLength = textValue(element).replace(/\s/g, "").length
    const lengthClass =
      element === "info" || element === "flavor"
        ? textLength > 60
          ? "long-text"
          : textLength > 36
            ? "medium-text"
            : ""
        : ""

    return {
    // PosterMoveable이 이 글자를 찾을 때 쓰는 이름표
    "data-text": element,
    role: editable ? ("textbox" as const) : undefined,
    tabIndex: editable ? 0 : undefined,
    contentEditable: editable,
    suppressContentEditableWarning: true,
    className: `text-object ${additionalClassName} ${lengthClass} ${
      editable ? "editable-text" : ""
    } ${editable && selectedText === element ? "selected" : ""} ${
      isPlaceholder(element) ? "placeholder-text" : ""
    }`,
    style: elementStyle(element),
    onFocus: (event: FormEvent<HTMLElement>) => {
      onSelectText?.(element)
      if (isPlaceholder(element)) event.currentTarget.textContent = ""
    },
    onClick: () => onSelectText?.(element),
    onBlur: (event: FormEvent<HTMLElement>) =>
      onTextInput?.(element, event.currentTarget.textContent ?? ""),
    }
  }

  // 이동 핸들(위쪽 손잡이 + 네 테두리).
  // 실제 드래그는 PosterMoveable(react-moveable)이 이 묶음(data-text-drag)을 잡아서 처리합니다.
  // 묶음 자체는 클릭을 통과시키고(pointerEvents: none) 손잡이·테두리만 잡히게 해서,
  // 글자를 클릭하면 지금처럼 수정 모드가 됩니다.
  // 글자와 같은 만큼 옮겨 두어야 글자를 옮긴 뒤에도 핸들이 글자를 따라옵니다.
  const dragHandle = (element: TextElement) => {
    if (!editable || selectedText !== element) return null
    const style = textStyles?.[element]
    return (
      <span
        data-text-drag={element}
        contentEditable={false}
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 5,
          pointerEvents: "none",
          transform: style
            ? `translate3d(${style.x}cqw, ${style.y}cqh, 0)`
            : undefined,
        }}
      >
        <i
          className="text-drag-handle"
          aria-label="글자 상자 이동"
          style={{ pointerEvents: "auto" }}
        />
        {["top", "right", "bottom", "left"].map((edge) => (
          <i
            className={`text-drag-edge edge-${edge}`}
            aria-hidden="true"
            key={edge}
            style={{ pointerEvents: "auto" }}
          />
        ))}
      </span>
    )
  }

  return (
    <div
      className={`poster editorial-poster editorial-${type} layout-${layout}`}
    >
      {Array.from({ length: imageCount }, (_, index) => {
        const transform = photoTransforms?.[index]
        return (
          <div
            className={`editorial-image-frame image-frame-${index + 1}`}
            key={index}
          >
            <img
              className="editorial-photo"
              src={photoSrcs?.[index] || photoSrc || defaultPhoto}
              alt=""
              style={
                transform
                  ? {
                      transform: `translate3d(${transform.x}%, ${transform.y}%, 0) scale(${transform.scale})`,
                    }
                  : undefined
              }
            />
          </div>
        )
      })}
      <div className="editorial-grain" aria-hidden="true" />
      <div className="editorial-rule" aria-hidden="true" />
      {!hideIssue && (
        <span className="editorial-issue" aria-hidden="true">
          {content.issue}
        </span>
      )}
      <div className={`editorial-copy ${editable ? "is-editable" : ""}`}>
        {(customContent ? customContent.eyebrow : content.eyebrow) && (
          <span className="editorial-eyebrow">
            {customContent ? customContent.eyebrow : content.eyebrow}
          </span>
        )}
        <div className="editorial-title">
          {/* 비어 있는 보조 문구는 그리지 않는다.
              (편집기에서 빈 편집칸이 한 줄 높이를 차지해, 완성본과 글자 위치가 어긋나던 문제) */}
          {textValue("subtitle") && (
            <span className="text-object-shell">
              <span {...editableTextProps("subtitle")}>
                {textValue("subtitle")}
              </span>
              {dragHandle("subtitle")}
            </span>
          )}
          <span className="text-object-shell">
            <strong {...editableTextProps("title")}>
              {textValue("title")}
            </strong>
            {dragHandle("title")}
          </span>
        </div>
        {textValue("flavor") && (
          <div className="text-object-shell">
            <p {...editableTextProps("flavor", "editorial-flavor")}>
              {textValue("flavor")}
            </p>
            {dragHandle("flavor")}
          </div>
        )}
        {textValue("info") && (
          <div className="text-object-shell">
            <p {...editableTextProps("info", "editorial-info")}>
              {textValue("info")}
            </p>
            {dragHandle("info")}
          </div>
        )}
      </div>
      {(textValue("date") || textValue("place")) && (
        <div className="editorial-details">
          {textValue("date") && (
            <span className="text-object-shell">
              <span {...editableTextProps("date")}>{textValue("date")}</span>
              {dragHandle("date")}
            </span>
          )}
          {textValue("place") && (
            <span className="text-object-shell">
              <strong {...editableTextProps("place")}>
                {textValue("place")}
              </strong>
              {dragHandle("place")}
            </span>
          )}
        </div>
      )}
      <div
        className="editorial-brand"
        // 편집기에서 로고를 올렸을 때만 붙는 이름표. EditorCanvas·PosterMoveable이 이걸로 로고를 찾습니다.
        data-logo={editable && logoSrc ? "" : undefined}
        style={
          logoTransform
            ? {
                transform: `translate3d(${logoTransform.x}%, ${logoTransform.y}%, 0) scale(${logoTransform.scale})`,
              }
            : undefined
        }
      >
        {logoSrc ? (
          // draggable={false}: 로고를 끌 때 브라우저 기본 "이미지 끌기"가 끼어들지 않게
          <img src={logoSrc} alt="업로드한 브랜드 로고" draggable={false} />
        ) : customContent?.brandName ? (
          <span>{customContent.brandName}</span>
        ) : !customContent ? (
          <span>CLICK STUDIO</span>
        ) : null}
      </div>
    </div>
  )
}
