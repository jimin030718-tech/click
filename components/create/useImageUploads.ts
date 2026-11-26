"use client"

// 2단계에서 고른 사진·로고를 뒤에서 조용히 Blob 에 올려 두는 훅 (C 담당)
// - 화면에는 지금처럼 미리보기를 바로 보여주고, 업로드는 기다리지 않아요.
// - AI 기능을 누를 때쯤이면 이미 주소가 준비돼 있어서 빨라요.
// - 로그인하지 않았거나 Blob 설정이 없으면 "error" 상태가 되고, 포스터 만들기는 그대로 계속할 수 있어요.
import { useEffect, useState } from "react"
import { ensureUploaded, getUploadedUrl, type UploadFolder } from "@/lib/upload/uploadImage"

export type UploadStatus = "idle" | "uploading" | "done" | "error"

export function useImageUploads(items: { src: string; folder: UploadFolder }[]) {
  const [statusMap, setStatusMap] = useState<Record<string, UploadStatus>>({})

  const key = items.map((item) => `${item.folder}:${item.src.length}:${item.src.slice(-32)}`).join("|")

  useEffect(() => {
    for (const { src, folder } of items) {
      if (!src || getUploadedUrl(src)) continue
      setStatusMap((current) => (current[src] ? current : { ...current, [src]: "uploading" }))
      ensureUploaded(src, folder)
        .then(() => setStatusMap((current) => ({ ...current, [src]: "done" })))
        .catch((error) => {
          console.warn("사진 업로드 실패", error)
          setStatusMap((current) => ({ ...current, [src]: "error" }))
        })
    }
    // items 는 매번 새 배열이라, 내용이 바뀌었을 때만(key) 실행합니다.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  const present = items.filter((item) => item.src)
  const statusOf = (src: string): UploadStatus =>
    !src ? "idle" : getUploadedUrl(src) ? "done" : (statusMap[src] ?? "uploading")

  return {
    /** 사진 하나의 업로드 상태 */
    statusOf,
    /** 올린 주소 (아직이면 null) */
    urlOf: getUploadedUrl,
    /** 지금 올리는 중인 게 있는지 */
    uploading: present.some((item) => statusOf(item.src) === "uploading"),
    /** 실패한 게 있는지 */
    failed: present.some((item) => statusOf(item.src) === "error"),
    /** 고른 사진·로고가 모두 올라갔는지 */
    allDone: present.length > 0 && present.every((item) => statusOf(item.src) === "done"),
  }
}
