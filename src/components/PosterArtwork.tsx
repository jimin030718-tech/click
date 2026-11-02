import { type CSSProperties, type FormEvent, type PointerEvent as ReactPointerEvent } from "react"
import { posterContent, type LayoutKind } from "../data/posters"
import { fontCombinations, type TextElement, type TextObjectStyle } from "../data/styles"

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
  onTextPointerDown,
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

  const dragHandle = (element: TextElement) =>
    editable && selectedText === element ? (
      <>
        <i
          className="text-drag-handle"
          contentEditable={false}
          aria-label="글자 상자 이동"
          onPointerDown={(event) => onTextPointerDown?.(event, element)}
        />
        {["top", "right", "bottom", "left"].map((edge) => (
          <i
            className={`text-drag-edge edge-${edge}`}
            contentEditable={false}
            aria-hidden="true"
            key={edge}
            onPointerDown={(event) => onTextPointerDown?.(event, element)}
          />
        ))}
      </>
    ) : null

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
        style={
          logoTransform
            ? {
                transform: `translate3d(${logoTransform.x}%, ${logoTransform.y}%, 0) scale(${logoTransform.scale})`,
              }
            : undefined
        }
      >
        {logoSrc ? (
          <img src={logoSrc} alt="업로드한 브랜드 로고" />
        ) : customContent?.brandName ? (
          <span>{customContent.brandName}</span>
        ) : !customContent ? (
          <span>CLICK STUDIO</span>
        ) : null}
      </div>
    </div>
  )
}
