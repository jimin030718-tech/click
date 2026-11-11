// 5단계 내보내기: 화면의 포스터(.flow-poster)를 PNG/PDF 파일로 저장합니다.
// html-to-image와 jspdf는 무거워서, 버튼을 누를 때만 불러옵니다(await import).
// 그래서 처음 페이지 로딩은 느려지지 않습니다.

// 포스터 원본 비율 (1240 × 1754 = A4 150dpi)
export const POSTER_RATIO = 1754 / 1240

export type ExportFrame = {
  width: number // 저장 파일 가로(px)
  height: number // 저장 파일 세로(px)
}

// ───────────────────────── 웹폰트 ─────────────────────────
// 저장 파일에도 한글 웹폰트가 그대로 나오려면 글꼴 파일을 그림 안에 같이 넣어야(embed) 합니다.
// 그런데 이 사이트는 한글 글꼴을 아주 많이 불러오고, 구글 한글 글꼴은 글꼴 하나가
// 글자 묶음별로 100개 가까운 파일로 나뉘어 있어서 전부 넣으면 너무 무겁고 느립니다.
// 그래서 "브라우저가 이 포스터를 그리는 데 실제로 내려받은 글꼴 조각"만 골라 넣습니다.

const normalizeFamily = (family: string) =>
  family.trim().replace(/["']/g, "").toLowerCase()

const normalizeWeight = (weight: string) => {
  const value = weight.trim().toLowerCase() || "400"
  if (value === "normal") return "400"
  if (value === "bold") return "700"
  return value.replace(/\s+/g, " ")
}

const normalizeStyle = (style: string) => style.trim().toLowerCase() || "normal"

// "U+0000-00FF, U+AC00-D7A3" 와 "U+0-FF,U+AC00-D7A3" 를 같은 값으로 맞춥니다.
const normalizeRange = (range: string) =>
  (range.trim() || "U+0-10FFFF")
    .split(",")
    .map((part) =>
      part
        .trim()
        .replace(/^u\+/i, "")
        .split("-")
        .map((hex) => parseInt(hex.replace(/\?/g, "0"), 16).toString(16))
        .join("-"),
    )
    .join(",")

const faceKey = (
  family: string,
  weight: string,
  style: string,
  range: string,
) =>
  [
    normalizeFamily(family),
    normalizeWeight(weight),
    normalizeStyle(style),
    normalizeRange(range),
  ].join("|")

// 포스터 안에서 쓰인 글꼴 이름들 (font-family 목록 전체)
const collectUsedFamilies = (node: HTMLElement) => {
  const families = new Set<string>()
  const visit = (element: Element) => {
    getComputedStyle(element)
      .fontFamily.split(",")
      .forEach((family) => families.add(normalizeFamily(family)))
    Array.from(element.children).forEach(visit)
  }
  visit(node)
  return families
}

type FontFaceSource = { rule: CSSFontFaceRule; baseUrl: string }

// 페이지의 모든 스타일에서 @font-face 규칙을 모읍니다.
// 다른 주소(구글 폰트, jsdelivr)에서 @import 한 CSS는 브라우저가 내용을 읽지 못하게 막아서
// 같은 주소로 한 번 더 받아(fetch) 읽습니다.
const collectFontFaceRules = async () => {
  const found: FontFaceSource[] = []
  const pending: Promise<void>[] = []

  const readCssText = (cssUrl: string) =>
    fetch(cssUrl)
      .then((response) => (response.ok ? response.text() : ""))
      .then((text) => {
        const sheet = new CSSStyleSheet()
        sheet.replaceSync(text)
        walkRules(Array.from(sheet.cssRules), cssUrl)
      })
      .catch(() => {
        // 글꼴 CSS 하나를 못 받아도 저장은 계속합니다(그 글꼴만 기본 글꼴로 나옴).
      })

  const walkRules = (rules: CSSRule[], baseUrl: string) => {
    rules.forEach((rule) => {
      if (rule instanceof CSSFontFaceRule) {
        found.push({ rule, baseUrl })
      } else if (rule instanceof CSSImportRule) {
        pending.push(readCssText(new URL(rule.href, baseUrl).href))
      } else if ("cssRules" in rule) {
        walkRules(Array.from((rule as CSSGroupingRule).cssRules), baseUrl)
      }
    })
  }

  Array.from(document.styleSheets).forEach((sheet) => {
    const baseUrl = sheet.href ?? location.href
    try {
      walkRules(Array.from(sheet.cssRules), baseUrl)
    } catch {
      if (sheet.href) pending.push(readCssText(sheet.href))
    }
  })

  // @import 안의 @import까지 모두 끝날 때까지 기다립니다.
  while (pending.length) await pending.shift()
  return found
}

const blobToDataUrl = (blob: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })

// html-to-image에 넘길 "글꼴을 품은 CSS"를 만듭니다.
const buildFontEmbedCss = async (node: HTMLElement) => {
  await document.fonts.ready
  const usedFamilies = collectUsedFamilies(node)

  // 브라우저가 실제로 내려받은 글꼴 조각들
  const loadedKeys = new Set<string>()
  document.fonts.forEach((face) => {
    if (face.status !== "loaded") return
    if (!usedFamilies.has(normalizeFamily(face.family))) return
    loadedKeys.add(faceKey(face.family, face.weight, face.style, face.unicodeRange))
  })

  const rules = await collectFontFaceRules()
  const seen = new Set<string>()
  const cssParts = await Promise.all(
    rules.map(async ({ rule, baseUrl }) => {
      const style = rule.style
      const key = faceKey(
        style.getPropertyValue("font-family"),
        style.getPropertyValue("font-weight"),
        style.getPropertyValue("font-style"),
        style.getPropertyValue("unicode-range"),
      )
      if (!loadedKeys.has(key) || seen.has(key)) return ""
      seen.add(key)

      // src 안의 첫 번째 글꼴 파일 주소를 받아서 data: 주소로 바꿉니다.
      const src = style.getPropertyValue("src")
      const match = src.match(/url\(\s*["']?([^"')]+)["']?\s*\)\s*(format\([^)]*\))?/)
      if (!match) return ""
      try {
        const fontUrl = new URL(match[1], baseUrl).href
        const response = await fetch(fontUrl)
        if (!response.ok) return ""
        const dataUrl = await blobToDataUrl(await response.blob())
        const format = match[2] ? ` ${match[2]}` : ""
        return [
          "@font-face {",
          `font-family: ${style.getPropertyValue("font-family")};`,
          `font-style: ${style.getPropertyValue("font-style") || "normal"};`,
          `font-weight: ${style.getPropertyValue("font-weight") || "400"};`,
          style.getPropertyValue("unicode-range")
            ? `unicode-range: ${style.getPropertyValue("unicode-range")};`
            : "",
          `src: url("${dataUrl}")${format};`,
          "}",
        ].join("\n")
      } catch {
        return ""
      }
    }),
  )
  return cssParts.filter(Boolean).join("\n")
}

// ───────────────────────── 그리기 ─────────────────────────

// 포스터를 정확히 width × height 크기의 캔버스로 그립니다. (비율 유지, 잘림·찌그러짐 없음)
// 프레임 비율이 포스터와 다르면(SNS용 4:5) 포스터를 가운데 두고 남는 곳은 포스터 배경색으로 채웁니다.
export const renderPosterCanvas = async (
  node: HTMLElement,
  frame: ExportFrame,
) => {
  const { toCanvas } = await import("html-to-image")
  const fontEmbedCSS = await buildFontEmbedCss(node)

  // 프레임 안에 포스터가 들어갈 크기 (비율 유지)
  const posterHeight = Math.min(frame.height, frame.width * POSTER_RATIO)
  const posterWidth = posterHeight / POSTER_RATIO
  const nodeWidth = node.getBoundingClientRect().width

  const posterCanvas = await toCanvas(node, {
    pixelRatio: posterWidth / nodeWidth,
    fontEmbedCSS,
    cacheBust: false,
    // 미리보기 카드용 둥근 모서리·그림자는 화면 장식이라 파일에서는 뺍니다(인쇄용은 네모 반듯하게).
    style: { borderRadius: "0", boxShadow: "none", margin: "0" },
  })

  const output = document.createElement("canvas")
  output.width = frame.width
  output.height = frame.height
  const context = output.getContext("2d")
  if (!context) throw new Error("캔버스를 만들 수 없어요")
  context.imageSmoothingQuality = "high"

  const x = Math.round((frame.width - posterWidth) / 2)
  const y = Math.round((frame.height - posterHeight) / 2)
  const drawWidth = Math.round(posterWidth)
  const drawHeight = Math.round(posterHeight)

  // 프레임이 포스터보다 넓으면(SNS용) 양옆을 포스터 가장자리 한 줄을 늘려 채웁니다.
  // (배경 질감·그라데이션이 있어서 단색으로 칠하는 것보다 이어지는 모습이 자연스러움)
  if (x > 0) {
    const edge = 2 // 가장자리 바로 안쪽 픽셀 (테두리 번짐 피하기)
    const sourceHeight = posterCanvas.height
    context.drawImage(posterCanvas, edge, 0, 1, sourceHeight, 0, y, x, drawHeight)
    context.drawImage(
      posterCanvas,
      posterCanvas.width - edge - 1,
      0,
      1,
      sourceHeight,
      x + drawWidth,
      y,
      frame.width - x - drawWidth,
      drawHeight,
    )
  }
  context.drawImage(posterCanvas, x, y, drawWidth, drawHeight)
  return output
}

// ───────────────────────── 저장 ─────────────────────────

const downloadBlob = (blob: Blob, fileName: string) => {
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = fileName
  document.body.appendChild(link)
  link.click()
  link.remove()
  // 다운로드가 시작될 시간을 준 뒤 정리합니다.
  setTimeout(() => URL.revokeObjectURL(url), 10_000)
}

export const savePosterPng = async (
  node: HTMLElement,
  frame: ExportFrame,
  fileName: string,
) => {
  const canvas = await renderPosterCanvas(node, frame)
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/png"),
  )
  if (!blob) throw new Error("PNG를 만들 수 없어요")
  downloadBlob(blob, fileName)
}

// PDF: A4 세로 한 페이지(210 × 297mm)에 포스터를 꽉 차게 넣습니다.
// 포스터 비율(1240:1754)과 A4 비율(210:297)은 거의 같아서(차이 0.02%) 여백 없이 들어갑니다.
export const savePosterPdf = async (
  node: HTMLElement,
  frame: ExportFrame,
  fileName: string,
) => {
  const canvas = await renderPosterCanvas(node, frame)
  const { jsPDF } = await import("jspdf")
  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
    compress: true,
  })
  pdf.addImage(canvas, "PNG", 0, 0, 210, 297, undefined, "FAST")
  pdf.save(fileName)
}
