"use client"

import { useState } from "react"
import type { DesignFlowState } from "@/components/create/useDesignFlow"
import {
  savePosterPdf,
  savePosterPng,
  type ExportFrame,
} from "@/components/editor/exportPoster"
import styles from "./ExportOptions.module.css"

type ExportFormat = "png" | "pdf"

type ExportOption = {
  id: string
  label: string
  detail: string
  badge: string
  fileLabel: string // 파일 이름에 들어갈 말 (click-poster-인쇄용.png)
  frame: ExportFrame
  formats: ExportFormat[] // 고를 수 있는 파일 형식
}

// 화면에 적힌 안내(label·detail·badge)는 예전 그대로이고, 실제 저장 크기·형식을 함께 적어 둡니다.
const exportOptions: ExportOption[] = [
  {
    id: "print",
    label: "매장 부착·일반 프린터용",
    detail: "A4/A3 고화질 · PNG 또는 PDF",
    badge: "추천",
    fileLabel: "인쇄용",
    frame: { width: 1240, height: 1754 }, // A4 150dpi
    formats: ["png", "pdf"],
  },
  {
    id: "press",
    label: "인쇄소 의뢰용 초고화질",
    detail: "2배 업스케일 원본 · PNG 또는 PDF",
    badge: "2480 × 3508",
    fileLabel: "인쇄소용",
    frame: { width: 2480, height: 3508 }, // A4 300dpi
    formats: ["png", "pdf"],
  },
  {
    id: "social",
    label: "SNS·배달앱 업로드용",
    detail: "인스타그램과 스마트플레이스 최적화",
    badge: "디지털",
    fileLabel: "SNS용",
    // 인스타그램 세로 게시물(4:5). 포스터가 잘리지 않게 가운데에 두고 양옆은 배경색으로 채움
    frame: { width: 1080, height: 1350 },
    formats: ["png"],
  },
]

// 5단계 내보내기 버튼들. 누르면 실제 파일(PNG/PDF)이 저장됩니다.
export function ExportOptions({ flow }: { flow: DesignFlowState }) {
  const { setDownloaded } = flow
  const [format, setFormat] = useState<ExportFormat>("png")
  const [savingId, setSavingId] = useState("")
  const [failed, setFailed] = useState(false)

  const save = async (option: ExportOption) => {
    if (savingId) return
    const node = document.querySelector<HTMLElement>(
      ".export-preview .flow-poster",
    )
    // 이 옵션이 고른 형식을 지원하지 않으면(SNS용은 PNG만) PNG로 저장합니다.
    const fileFormat = option.formats.includes(format) ? format : "png"
    const fileName = `click-poster-${option.fileLabel}.${fileFormat}`
    setSavingId(option.id)
    setFailed(false)
    setDownloaded("")
    try {
      if (!node) throw new Error("포스터를 찾을 수 없어요")
      if (fileFormat === "pdf") {
        await savePosterPdf(node, option.frame, fileName)
      } else {
        await savePosterPng(node, option.frame, fileName)
      }
      setDownloaded(option.id)
    } catch (error) {
      console.error("포스터 저장 실패", error)
      setFailed(true)
    } finally {
      setSavingId("")
    }
  }

  return (
    <>
      <div className={styles.formatPicker}>
        <span className={styles.formatLabel}>파일 형식</span>
        <div
          className={styles.formatButtons}
          role="radiogroup"
          aria-label="파일 형식 선택"
        >
          {(["png", "pdf"] as const).map((item) => (
            <button
              type="button"
              role="radio"
              aria-checked={format === item}
              key={item}
              disabled={Boolean(savingId)}
              onClick={() => setFormat(item)}
            >
              {item.toUpperCase()}
            </button>
          ))}
        </div>
        <p className={styles.formatHint}>
          PDF는 A4 한 장에 꽉 차게 저장돼요. SNS용은 항상 PNG로 저장돼요.
        </p>
      </div>
      <div className="export-list">
        {exportOptions.map((option) => {
          const saving = savingId === option.id
          const fileFormat = option.formats.includes(format) ? format : "png"
          return (
            <button
              type="button"
              key={option.id}
              disabled={Boolean(savingId)}
              aria-busy={saving}
              onClick={() => save(option)}
            >
              <span className={`export-icon export-icon-${option.id}`} />
              <span>
                <strong>{option.label}</strong>
                <small>
                  {saving
                    ? "저장 중..."
                    : `${option.detail} → ${fileFormat.toUpperCase()} 저장`}
                </small>
              </span>
              <b>{option.badge}</b>
              <i>{saving ? "…" : "↓"}</i>
            </button>
          )
        })}
      </div>
      {failed && (
        <p className={styles.error} role="alert">
          저장에 실패했어요. 다시 시도해 주세요
        </p>
      )}
    </>
  )
}
