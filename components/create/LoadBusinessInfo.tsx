"use client"

// 2단계 정보 입력: "내 가게 정보 불러오기" 버튼 (C 담당) — 핵심 문구 칸 위에 있어요.
// 내 정보에 저장된 가게 정보를 비어 있는 칸에만 채워 넣습니다. (이미 쓴 내용은 덮어쓰지 않아요)
//   가게 이름 → 가게 이름 칸
//   주소      → 장소 칸 (할인/프로모션처럼 그 칸이 '가격'인 템플릿은 제외)
//   전화·인스타 → 추가 안내 칸
// 자동 저장(기억하기)은 RememberBusinessInfo.tsx 에 있어요.
import { useState, useTransition } from "react"
import { getMyBusinessInfo } from "@/lib/db/actions"
import type { BusinessInfo } from "@/lib/db/types"
import styles from "./LoadBusinessInfo.module.css"

type FormKey = "brandName" | "price" | "info"

type Props = {
  form: Record<FormKey, string>
  updateForm: (key: FormKey, value: string) => void
  placeFieldLabel: string
}

function contactLine(info: BusinessInfo) {
  const parts = [
    info.phone && `문의 ${info.phone}`,
    info.instagram && `인스타 @${info.instagram}`,
  ].filter(Boolean)
  return parts.join(" · ").slice(0, 80)
}

export default function LoadBusinessInfo({ form, updateForm, placeFieldLabel }: Props) {
  const [message, setMessage] = useState<{ text: string; empty?: boolean } | null>(null)
  const [pending, startTransition] = useTransition()

  const load = () => {
    setMessage(null)
    startTransition(async () => {
      const saved = await getMyBusinessInfo().catch(() => null)
      if (!saved) {
        setMessage({ text: "아직 저장된 가게 정보가 없어요.", empty: true })
        return
      }

      const filled: string[] = []
      if (saved.shopName && !form.brandName.trim()) {
        updateForm("brandName", saved.shopName)
        filled.push("가게 이름")
      }
      if (saved.address && placeFieldLabel !== "가격" && !form.price.trim()) {
        updateForm("price", saved.address)
        filled.push("장소")
      }
      const contact = contactLine(saved)
      if (contact && !form.info.trim()) {
        updateForm("info", contact)
        filled.push("연락처")
      }

      setMessage({
        text:
          filled.length > 0
            ? `${filled.join(", ")}을(를) 채웠어요.`
            : "채울 빈칸이 없어요. 이미 입력한 내용은 그대로 둬요.",
      })
    })
  }

  return (
    <div className={styles.box}>
      <button type="button" className={styles.button} onClick={load} disabled={pending}>
        <span aria-hidden="true">🏪</span>
        {pending ? "불러오는 중…" : "내 가게 정보 불러오기"}
      </button>
      {message && (
        <p className={styles.message} role="status">
          {message.text}
          {message.empty && (
            // 새 탭으로 열어서 지금 입력 중인 내용이 사라지지 않게 합니다.
            <a href="/mypage" target="_blank" rel="noreferrer">
              내 정보에서 저장하기 ↗
            </a>
          )}
        </p>
      )}
    </div>
  )
}
