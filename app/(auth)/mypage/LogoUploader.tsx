"use client"

// 내 정보 > 가게 로고 올리기·바꾸기·지우기 (C 담당)
// 로고를 고르면 크기를 줄여 Vercel Blob 에 올리고, 그 주소를 DB(business_info.logo_url)에 저장해요.
import { useRef, useState, useTransition } from "react"
import { saveMyLogo } from "@/lib/db/actions"
import { ensureUploaded } from "@/lib/upload/uploadImage"
import styles from "./mypage.module.css"

function readAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error("파일을 읽지 못했어요."))
    reader.readAsDataURL(file)
  })
}

export default function LogoUploader({ initialUrl }: { initialUrl: string | null }) {
  const [logo, setLogo] = useState(initialUrl)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()
  const inputRef = useRef<HTMLInputElement>(null)

  const choose = (file: File | undefined) => {
    if (!file) return
    setMessage(null)
    startTransition(async () => {
      try {
        const dataUrl = await readAsDataUrl(file)
        const url = await ensureUploaded(dataUrl, "logos")
        const { ok } = await saveMyLogo(url)
        if (!ok) throw new Error()
        setLogo(url)
        setMessage({ ok: true, text: "로고를 저장했어요." })
      } catch {
        setMessage({ ok: false, text: "로고를 올리지 못했어요. 잠시 후 다시 시도해 주세요." })
      } finally {
        if (inputRef.current) inputRef.current.value = ""
      }
    })
  }

  const remove = () => {
    setMessage(null)
    startTransition(async () => {
      const { ok } = await saveMyLogo(null)
      if (ok) setLogo(null)
      setMessage(ok ? { ok: true, text: "로고를 지웠어요." } : { ok: false, text: "지우지 못했어요." })
    })
  }

  return (
    <div className={styles.logoBox}>
      <span className={styles.fieldLabel}>가게 로고</span>
      <div className={styles.logoRow}>
        <div className={styles.logoPreview}>
          {logo ? <img src={logo} alt="가게 로고" /> : <span>로고 없음</span>}
        </div>
        <div className={styles.logoActions}>
          <button
            type="button"
            className={styles.smallButton}
            onClick={() => inputRef.current?.click()}
            disabled={pending}
          >
            {pending ? "처리 중…" : logo ? "로고 바꾸기" : "로고 올리기"}
          </button>
          {logo && (
            <button type="button" className={styles.textButton} onClick={remove} disabled={pending}>
              지우기
            </button>
          )}
          <small>JPG·PNG·WEBP, 투명 배경 PNG 추천</small>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          hidden
          onChange={(event) => choose(event.target.files?.[0])}
        />
      </div>
      {message && (
        <p className={message.ok ? styles.success : styles.fail} role="status">
          {message.text}
        </p>
      )}
    </div>
  )
}
