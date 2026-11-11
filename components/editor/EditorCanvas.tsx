"use client"

import dynamic from "next/dynamic"
import { useState, type PointerEvent as ReactPointerEvent } from "react"
import type { DesignFlowState } from "@/components/create/useDesignFlow"
import styles from "./EditorCanvas.module.css"

// react-moveable은 브라우저에서만 동작하므로 서버에서 미리 그리지 않습니다(ssr: false).
const PosterMoveable = dynamic(() => import("@/components/editor/PosterMoveable"), {
  ssr: false,
})

// 4단계 편집기의 포스터 캔버스 부분.
// "지금 고른 것이 글자인지, 로고인지"를 여기서 관리합니다.
// (useDesignFlow는 글자 선택만 알고 있어서, 로고 선택은 편집기 안에서만 따로 기억합니다.
//  단계를 넘기면 선택은 처음으로 돌아가지만, 로고 위치·크기는 useDesignFlow에 그대로 남습니다.)
// - 로고를 누르면 로고가 선택되고(글자 선택 표시는 숨김), 오른쪽 패널은 로고 탭으로 바뀝니다.
// - 글자를 누르면 로고 선택이 풀립니다.
export function EditorCanvas({ flow }: { flow: DesignFlowState }) {
  const { preview, setEditorTab } = flow
  const [logoSelected, setLogoSelected] = useState(false)

  // 포스터 안을 누를 때 무엇을 눌렀는지 보고 선택을 바꿉니다.
  // (PosterArtwork는 홈 화면 카드에서도 쓰여서, 그 안에는 손대지 않고 여기서 한 번에 처리)
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-logo]")) {
      if (!logoSelected) {
        setLogoSelected(true)
        setEditorTab("logo")
      }
      return
    }
    if (target.closest("[data-text]") && logoSelected) {
      setLogoSelected(false)
    }
  }

  return (
    <div
      className={`${styles.canvas} ${logoSelected ? styles.logoSelected : ""}`}
      onPointerDown={handlePointerDown}
    >
      {preview}
      <PosterMoveable flow={flow} logoSelected={logoSelected} />
    </div>
  )
}
