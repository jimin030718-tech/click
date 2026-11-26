"use client"

// 사진·로고를 Vercel Blob 에 올리고 인터넷 주소(URL)를 돌려주는 도우미 (C 담당)
//
// ★ B(AI) 담당이 쓰는 법 — fal 에 사진 주소를 넘길 때:
//     import { ensureUploaded } from "@/lib/upload/uploadImage"
//     const url = await ensureUploaded(photoPreviews[0])          // 사진
//     const logoUrl = await ensureUploaded(logoPreview, "logos")  // 로고
//   - 이미 올린 사진이면 기다리지 않고 바로 주소를 돌려줘요. (2단계에서 사진을 고르면 미리 올려 둡니다)
//   - 이미 https:// 주소면 그대로 돌려줘요.
//
// 올리기 전에 크기를 줄여요. (사진 긴 변 2048px·JPG, 로고 긴 변 1024px·투명 배경 유지)
import { upload } from "@vercel/blob/client"

export type UploadFolder = "photos" | "logos"

// 같은 사진을 두 번 올리지 않도록: 원본(미리보기 값) → 올린 주소
const done = new Map<string, string>()
const inFlight = new Map<string, Promise<string>>()

const isRemote = (src: string) => /^https?:\/\//.test(src)

/** 이미 올린 주소가 있으면 돌려주기 (없으면 null) */
export function getUploadedUrl(src: string): string | null {
  if (!src) return null
  if (isRemote(src)) return src
  return done.get(src) ?? null
}

/** 이미 올려져 있는 사진이라고 알려 두기 (예: DB에 저장된 로고를 불러왔을 때) */
export function rememberUploaded(src: string, url: string) {
  if (src && url) done.set(src, url)
}

/** 사진을 Blob 에 올리고 주소 받기 (이미 올렸으면 바로 돌려줌) */
export function ensureUploaded(src: string, folder: UploadFolder = "photos"): Promise<string> {
  if (!src) return Promise.reject(new Error("사진이 없어요."))
  const ready = getUploadedUrl(src)
  if (ready) return Promise.resolve(ready)
  const running = inFlight.get(src)
  if (running) return running

  const task = (async () => {
    const { blob, ext } = await shrink(src, folder)
    const result = await upload(`${folder}/${folder === "logos" ? "logo" : "photo"}.${ext}`, blob, {
      access: "public",
      handleUploadUrl: "/api/upload",
      contentType: blob.type,
    })
    done.set(src, result.url)
    return result.url
  })().finally(() => inFlight.delete(src))

  inFlight.set(src, task)
  return task
}

// ── 크기 줄이기 ─────────────────────────────

function loadImage(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error("사진을 읽지 못했어요."))
    image.src = src
  })
}

async function shrink(src: string, folder: UploadFolder) {
  const image = await loadImage(src)
  const maxSide = folder === "logos" ? 1024 : 2048
  const scale = Math.min(1, maxSide / Math.max(image.naturalWidth, image.naturalHeight))
  const width = Math.max(1, Math.round(image.naturalWidth * scale))
  const height = Math.max(1, Math.round(image.naturalHeight * scale))

  const canvas = document.createElement("canvas")
  canvas.width = width
  canvas.height = height
  const context = canvas.getContext("2d")
  if (!context) throw new Error("사진을 처리하지 못했어요.")
  context.drawImage(image, 0, 0, width, height)

  // 로고는 투명 배경을 지키려고 PNG, 사진은 용량이 작은 JPG
  const keepTransparent = folder === "logos" && !src.startsWith("data:image/jpeg")
  const type = keepTransparent ? "image/png" : "image/jpeg"
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, type, type === "image/jpeg" ? 0.88 : undefined),
  )
  if (!blob) throw new Error("사진을 처리하지 못했어요.")
  return { blob, ext: type === "image/png" ? "png" : "jpg" }
}
