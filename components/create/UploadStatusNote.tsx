"use client"

// 2단계 사진 칸 아래 "사진 저장 중 / 완료 / 실패" 한 줄 안내 (C 담당)
import type { useImageUploads } from "@/components/create/useImageUploads"
import styles from "./LoadBusinessInfo.module.css"

export default function UploadStatusNote({
  uploads,
  hasPhoto,
}: {
  uploads: ReturnType<typeof useImageUploads>
  hasPhoto: boolean
}) {
  if (!hasPhoto) return null
  if (uploads.uploading) return <p className={styles.uploadNote}>사진을 저장하는 중이에요…</p>
  if (uploads.failed)
    return (
      <p className={`${styles.uploadNote} ${styles.uploadFail}`}>
        사진 저장에 실패했어요. 포스터 만들기는 그대로 할 수 있어요.
      </p>
    )
  if (uploads.allDone) return <p className={`${styles.uploadNote} ${styles.uploadDone}`}>✓ 사진 저장 완료</p>
  return null
}
