"use client"

// 2단계 정보 입력: "기억하기" 스위치 (C 담당) — 추가 안내 칸 아래에 있어요.
// 켜져 있으면(기본 켜짐) 입력을 멈추고 잠시 뒤 내 가게 정보에 자동 저장합니다.
//   가게 이름 칸 → 가게 이름
//   추가 안내 칸 속 전화번호(010-…)·인스타(@아이디) → 전화번호·인스타
// 빈 칸은 저장된 값을 지우지 않아요. 끄면 저장하지 않아요. (스위치 상태는 이 브라우저에 기억)
// 모양은 사진 칸의 "직접 찍은 사진이 없어요" 스위치(globals.css 의 .alternative-check)와 같아요.
import { useEffect, useRef, useState } from "react"
import { getMyBusinessInfo, rememberBusinessInfo } from "@/lib/db/actions"
import type { BusinessInfo } from "@/lib/db/types"
import styles from "./LoadBusinessInfo.module.css"

type Props = {
  brandName: string
  info: string
}

const REMEMBER_KEY = "click-remember-business-info"
const SAVE_DELAY = 1500 // 입력을 멈추고 1.5초 뒤 저장

// 포스터 입력값 → 저장할 가게 정보 (찾은 것만)
function extractInfo(brandName: string, info: string): Partial<BusinessInfo> {
  const phone = info.match(/0\d{1,2}[-.\s]?\d{3,4}[-.\s]?\d{4}/)?.[0] ?? ""
  const instagram = info.match(/@([A-Za-z0-9._]{1,30})/)?.[1] ?? ""
  return { shopName: brandName.trim(), phone, instagram }
}

const labelOf: Record<string, string> = {
  shopName: "가게 이름",
  phone: "전화번호",
  instagram: "인스타",
}

export default function RememberBusinessInfo({ brandName, info }: Props) {
  const [remember, setRemember] = useState(true)
  const [note, setNote] = useState("")
  const [ready, setReady] = useState(false) // 저장된 가게 정보를 다 읽었는지

  // 지금 DB에 있는 값 (같은 값이면 다시 저장하지 않음)
  const savedRef = useRef<Partial<BusinessInfo>>({})
  // 아직 보내지 않은 저장 (화면이 사라질 때 바로 보냄)
  const pendingRef = useRef<Partial<BusinessInfo> | null>(null)

  // 스위치 상태 읽기 + 지금 저장된 가게 정보 미리 읽어 두기
  useEffect(() => {
    try {
      if (window.localStorage.getItem(REMEMBER_KEY) === "off") setRemember(false)
    } catch {}
    getMyBusinessInfo()
      .then((saved) => {
        savedRef.current = saved ?? {}
      })
      .catch(() => {})
      .finally(() => setReady(true))
  }, [])

  const toggle = (on: boolean) => {
    setRemember(on)
    setNote("")
    if (!on) pendingRef.current = null // 끄면 대기 중인 저장도 취소
    try {
      window.localStorage.setItem(REMEMBER_KEY, on ? "on" : "off")
    } catch {}
  }

  const flush = (changes: Partial<BusinessInfo> | null) => {
    pendingRef.current = null
    if (!changes || Object.keys(changes).length === 0) return
    rememberBusinessInfo(changes)
      .then(({ ok }) => {
        if (!ok) return
        savedRef.current = { ...savedRef.current, ...changes }
        const names = Object.keys(changes).map((key) => labelOf[key]).join("·")
        setNote(`${names}을(를) 내 가게 정보에 기억했어요`)
      })
      .catch(() => {})
  }

  // 입력이 바뀔 때마다: 켜져 있으면 잠시 뒤 바뀐 칸만 저장
  useEffect(() => {
    pendingRef.current = null
    if (!remember || !ready) return
    const saved = savedRef.current
    const changes: Partial<BusinessInfo> = {}
    for (const [key, value] of Object.entries(extractInfo(brandName, info)) as [
      keyof BusinessInfo,
      string,
    ][]) {
      if (value && value !== saved[key]) changes[key] = value
    }
    if (Object.keys(changes).length === 0) return
    pendingRef.current = changes
    const timer = window.setTimeout(() => flush(changes), SAVE_DELAY)
    return () => window.clearTimeout(timer)
  }, [brandName, info, remember, ready])

  // 다음 단계로 넘어가 화면이 사라질 때, 아직 안 보낸 저장이 있으면 바로 보내기
  useEffect(() => () => flush(pendingRef.current), [])

  return (
    <>
      <label className="alternative-check">
        <input
          type="checkbox"
          role="switch"
          checked={remember}
          onChange={(event) => toggle(event.target.checked)}
        />
        <span>
          <strong>내 가게 정보로 기억하기</strong>
        </span>
        <i />
      </label>
      {remember && note && (
        <p className={styles.note} role="status">
          ✓ {note}
        </p>
      )}
    </>
  )
}
