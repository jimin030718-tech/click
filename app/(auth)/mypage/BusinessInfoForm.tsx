"use client"

// 내 정보 > 가게 기본정보 입력·저장 칸 (C 담당)
// 저장하면 포스터 만들기 2단계에서 "내 가게 정보 불러오기"로 자동 입력할 수 있어요.
import { useState, useTransition } from "react"
import { saveMyBusinessInfo } from "@/lib/db/actions"
import { businessInfoLimits, type BusinessInfo } from "@/lib/db/types"
import styles from "./mypage.module.css"

const fields: {
  key: keyof BusinessInfo
  label: string
  placeholder: string
  inputMode?: "tel" | "text"
  prefix?: string
}[] = [
  { key: "shopName", label: "가게 이름", placeholder: "예: 느린 오후 책방" },
  { key: "phone", label: "전화번호", placeholder: "예: 010-1234-5678", inputMode: "tel" },
  { key: "instagram", label: "인스타그램", placeholder: "가게 아이디", prefix: "@" },
  { key: "address", label: "주소 / 위치", placeholder: "예: 서울 마포구 연남동 123, 1층" },
  { key: "hours", label: "영업시간", placeholder: "예: 매일 11:00 - 21:00 (월 휴무)" },
]

export default function BusinessInfoForm({ initial }: { initial: BusinessInfo }) {
  const [info, setInfo] = useState(initial)
  const [savedInfo, setSavedInfo] = useState(initial)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [pending, startTransition] = useTransition()

  const changed = fields.some(({ key }) => info[key] !== savedInfo[key])

  const save = () => {
    setMessage(null)
    startTransition(async () => {
      const result = await saveMyBusinessInfo(info)
      if (result.ok) {
        setSavedInfo(info)
        setMessage({ ok: true, text: "저장했어요. 다음 포스터부터 불러올 수 있어요." })
      } else {
        setMessage({ ok: false, text: result.message })
      }
    })
  }

  return (
    <form
      className={styles.form}
      onSubmit={(event) => {
        event.preventDefault()
        save()
      }}
    >
      {fields.map(({ key, label, placeholder, inputMode, prefix }) => (
        <label key={key} className={styles.field}>
          <span className={styles.fieldLabel}>
            {label}
            <em>
              {info[key].length}/{businessInfoLimits[key]}
            </em>
          </span>
          <span className={styles.inputWrap}>
            {prefix && <span className={styles.prefix}>{prefix}</span>}
            <input
              value={info[key]}
              maxLength={businessInfoLimits[key]}
              inputMode={inputMode}
              placeholder={placeholder}
              onChange={(event) => {
                const value =
                  key === "instagram" ? event.target.value.replace(/^@+/, "") : event.target.value
                setInfo((current) => ({ ...current, [key]: value }))
                setMessage(null)
              }}
            />
          </span>
        </label>
      ))}

      <button type="submit" className={styles.save} disabled={pending || !changed}>
        {pending ? "저장 중…" : changed ? "저장하기" : "저장됨"}
      </button>
      {message && (
        <p className={message.ok ? styles.success : styles.fail} role="status">
          {message.text}
        </p>
      )}
    </form>
  )
}
