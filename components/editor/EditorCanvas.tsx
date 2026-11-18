"use client"

import dynamic from "next/dynamic"
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type DragEvent as ReactDragEvent,
  type PointerEvent as ReactPointerEvent,
} from "react"
import type { DesignFlowState } from "@/components/create/useDesignFlow"
import styles from "./EditorCanvas.module.css"

// react-moveable은 브라우저에서만 동작하므로 서버에서 미리 그리지 않습니다(ssr: false).
const PosterMoveable = dynamic(() => import("@/components/editor/PosterMoveable"), {
  ssr: false,
})

// 오른쪽 패널(사진 탭)과 같은 범위·같은 느낌
const PHOTO_POSITION_LIMIT = 9 // 사진 위치: -9 ~ 9 (%)
const PHOTO_DRAG_SPEED = 20 // 틀 너비만큼 끌면 20% 이동 (패널 미리보기와 같은 계산)
const PHOTO_SCALE_RANGE = { min: 1, max: 1.8 } // 확대 100% ~ 180%
const WHEEL_SPEED = 0.0015 // 휠 한 칸(약 100)에 약 15% 확대/축소
const WHEEL_IDLE_MS = 250 // 휠이 이만큼 멈추면 "한 번 굴리기"가 끝난 것으로 봅니다

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

// 포스터의 사진 틀들 중에서 (x, y) 화면 위치에 있는 틀의 번호를 찾습니다. 없으면 null.
// 틀 위에 반투명 무늬·글자 상자 등이 덮여 있어도 찾을 수 있도록, 누른 요소가 아니라 "위치"로 찾습니다.
const findPhotoFrameAt = (
  root: HTMLElement | null,
  x: number,
  y: number,
): { index: number; frame: HTMLElement } | null => {
  const frames = Array.from(
    root?.querySelectorAll<HTMLElement>(".editorial-image-frame") ?? [],
  )
  // 뒤에 그려진 틀이 위에 보이므로 뒤에서부터 확인합니다.
  for (let index = frames.length - 1; index >= 0; index -= 1) {
    const bounds = frames[index].getBoundingClientRect()
    if (
      x >= bounds.left &&
      x <= bounds.right &&
      y >= bounds.top &&
      y <= bounds.bottom
    ) {
      return { index, frame: frames[index] }
    }
  }
  return null
}

type PhotoDrag = {
  pointerId: number
  index: number
  pointerX: number
  pointerY: number
  startX: number
  startY: number
  width: number
  height: number
  recorded: boolean
  pending: { x: number; y: number } | null
}

type PhotoWheel = {
  index: number
  rawScale: number | null // 반올림 전 값(작은 휠 움직임도 쌓이도록)
  shownScale: number | null // 마지막으로 저장(예약)한 값
  recorded: boolean
  timer: number | null
}

// 4단계 편집기의 포스터 캔버스 부분.
// "지금 고른 것이 글자인지, 로고인지, 사진인지"를 여기서 관리합니다.
// (useDesignFlow는 글자 선택만 알고 있어서, 로고·사진 선택은 편집기 안에서만 따로 기억합니다.
//  단계를 넘기면 선택은 처음으로 돌아가지만, 위치·크기 값은 useDesignFlow에 그대로 남습니다.)
// - 로고를 누르면 로고가 선택되고(글자 선택 표시는 숨김), 오른쪽 패널은 로고 탭으로 바뀝니다.
// - 사진 틀을 누르면 그 사진이 선택되고(분홍 테두리), 오른쪽 패널은 사진 탭으로 바뀝니다.
//   선택된 사진은 끌어서 위치를, 마우스 휠로 크기를 바꿀 수 있습니다.
// - 글자·로고가 사진 위에 겹쳐 있으면 글자·로고가 먼저 잡힙니다.
// - 글자나 로고를 누르면 사진 선택이 풀립니다.
export function EditorCanvas({ flow }: { flow: DesignFlowState }) {
  const {
    preview,
    canvasPosterRef,
    editorTab,
    setEditorTab,
    activePhotoIndex,
    setActivePhotoIndex,
  } = flow
  const [logoSelected, setLogoSelected] = useState(false)
  const [photoSelected, setPhotoSelected] = useState(false)
  // 다른 탭(글자·배경·로고)으로 바꾸면 사진 선택 표시는 숨깁니다.
  const photoActive = photoSelected && editorTab === "image"

  const canvasRef = useRef<HTMLDivElement>(null)
  // 창(window)·휠 이벤트 안에서도 항상 최신 값을 쓰도록 ref에 담아 둡니다.
  const flowRef = useRef(flow)
  const photoActiveRef = useRef({ active: photoActive, index: activePhotoIndex })
  useLayoutEffect(() => {
    flowRef.current = flow
    photoActiveRef.current = { active: photoActive, index: activePhotoIndex }
  })

  // 드래그·휠 이벤트는 아주 자주 옵니다. 바뀔 값을 적어 두고 화면 한 프레임에 한 번만 저장합니다.
  const photoDrag = useRef<PhotoDrag | null>(null)
  const photoWheel = useRef<PhotoWheel>({
    index: 0,
    rawScale: null,
    shownScale: null,
    recorded: false,
    timer: null,
  })
  const pendingScale = useRef<{ index: number; scale: number } | null>(null)
  const frameRef = useRef<number | null>(null)
  const stopDragRef = useRef<(() => void) | null>(null)

  const applyPending = () => {
    frameRef.current = null
    const { updatePhotoTransform } = flowRef.current
    const drag = photoDrag.current
    if (drag?.pending) {
      updatePhotoTransform(drag.index, drag.pending, false)
      drag.pending = null
    }
    const scale = pendingScale.current
    if (scale) {
      updatePhotoTransform(scale.index, { scale: scale.scale }, false)
      pendingScale.current = null
    }
  }

  const scheduleApply = () => {
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(applyPending)
    }
  }

  const flushPending = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    applyPending()
  }

  // 사진 드래그 시작: 손을 뗄 때까지 창 전체에서 움직임을 지켜봅니다.
  const startPhotoDrag = (
    event: ReactPointerEvent<HTMLDivElement>,
    index: number,
    frame: HTMLElement,
  ) => {
    stopDragRef.current?.()
    const bounds = frame.getBoundingClientRect()
    const current = flowRef.current.photoTransforms[index]
    photoDrag.current = {
      pointerId: event.pointerId,
      index,
      pointerX: event.clientX,
      pointerY: event.clientY,
      startX: current.x,
      startY: current.y,
      width: bounds.width || 1,
      height: bounds.height || 1,
      recorded: false,
      pending: null,
    }

    const move = (moveEvent: PointerEvent) => {
      const drag = photoDrag.current
      if (!drag || moveEvent.pointerId !== drag.pointerId) return
      const x = clamp(
        drag.startX +
          ((moveEvent.clientX - drag.pointerX) / drag.width) * PHOTO_DRAG_SPEED,
        -PHOTO_POSITION_LIMIT,
        PHOTO_POSITION_LIMIT,
      )
      const y = clamp(
        drag.startY +
          ((moveEvent.clientY - drag.pointerY) / drag.height) *
            PHOTO_DRAG_SPEED,
        -PHOTO_POSITION_LIMIT,
        PHOTO_POSITION_LIMIT,
      )
      // 실제로 움직이기 시작한 순간에 딱 한 번만 되돌리기 기록을 남깁니다.
      // (눌렀다 바로 떼기만 하면 빈 기록이 생기지 않도록)
      if (!drag.recorded) {
        if (x === drag.startX && y === drag.startY) return
        flowRef.current.captureUndoSnapshot()
        drag.recorded = true
      }
      drag.pending = { x, y }
      scheduleApply()
    }

    const stop = (endEvent?: PointerEvent) => {
      const drag = photoDrag.current
      if (endEvent && drag && endEvent.pointerId !== drag.pointerId) return
      window.removeEventListener("pointermove", move)
      window.removeEventListener("pointerup", stop)
      window.removeEventListener("pointercancel", stop)
      flushPending()
      photoDrag.current = null
      stopDragRef.current = null
    }

    window.addEventListener("pointermove", move)
    window.addEventListener("pointerup", stop)
    window.addEventListener("pointercancel", stop)
    stopDragRef.current = () => stop()
  }

  // 포스터 안을 누를 때 무엇을 눌렀는지 보고 선택을 바꿉니다.
  // (PosterArtwork는 홈 화면 카드에서도 쓰여서, 그 안에는 손대지 않고 여기서 한 번에 처리)
  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement
    if (target.closest("[data-logo]")) {
      setPhotoSelected(false)
      if (!logoSelected) {
        setLogoSelected(true)
        setEditorTab("logo")
      }
      return
    }
    if (target.closest("[data-text]")) {
      setPhotoSelected(false)
      if (logoSelected) setLogoSelected(false)
      return
    }
    // 글자 이동 핸들, Moveable 테두리·손잡이는 PosterMoveable이 처리합니다.
    if (target.closest("[data-text-drag], .moveable-control-box")) return

    // 마우스는 왼쪽 버튼만
    if (event.pointerType === "mouse" && event.button !== 0) return
    const hit = findPhotoFrameAt(
      canvasPosterRef.current,
      event.clientX,
      event.clientY,
    )
    if (!hit) {
      setPhotoSelected(false)
      return
    }
    setLogoSelected(false)
    setPhotoSelected(true)
    if (activePhotoIndex !== hit.index) setActivePhotoIndex(hit.index)
    if (editorTab !== "image") setEditorTab("image")
    startPhotoDrag(event, hit.index, hit.frame)
  }

  // 사진을 끌 때 브라우저 기본 "이미지 끌어다 놓기"가 끼어들지 않게 막습니다.
  const handleDragStart = (event: ReactDragEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest(".editorial-image-frame")) {
      event.preventDefault()
    }
  }

  // 마우스 휠로 선택된 사진 확대/축소.
  // 페이지 스크롤을 막으려면(preventDefault) passive: false로 직접 등록해야 합니다.
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const wheel = photoWheel.current

    const endWheel = () => {
      flushPending()
      wheel.timer = null
      wheel.rawScale = null
      wheel.shownScale = null
      wheel.recorded = false
    }

    const onWheel = (event: WheelEvent) => {
      const { active, index } = photoActiveRef.current
      if (!active) return
      const hit = findPhotoFrameAt(
        flowRef.current.canvasPosterRef.current,
        event.clientX,
        event.clientY,
      )
      if (!hit || hit.index !== index) return
      event.preventDefault()

      // 다른 사진으로 바뀌었으면 이전 휠 묶음은 끝냅니다.
      if (wheel.timer !== null && wheel.index !== index) {
        window.clearTimeout(wheel.timer)
        endWheel()
      }
      if (wheel.timer !== null) window.clearTimeout(wheel.timer)
      wheel.timer = window.setTimeout(endWheel, WHEEL_IDLE_MS)
      wheel.index = index

      const currentScale = flowRef.current.photoTransforms[index].scale
      const shown = wheel.shownScale ?? currentScale
      const raw = wheel.rawScale ?? currentScale
      // deltaMode 1 = 줄 단위(일부 마우스·브라우저). 픽셀 단위로 맞춰 줍니다.
      const deltaY = event.deltaMode === 1 ? event.deltaY * 16 : event.deltaY
      const nextRaw = clamp(
        raw * Math.exp(-deltaY * WHEEL_SPEED),
        PHOTO_SCALE_RANGE.min,
        PHOTO_SCALE_RANGE.max,
      )
      wheel.rawScale = nextRaw
      // 패널 슬라이더처럼 1% 단위로 저장합니다.
      const next = Math.round(nextRaw * 100) / 100
      if (next === shown) return
      // 휠 한 번 굴리는 동안은 되돌리기 1칸
      if (!wheel.recorded) {
        flowRef.current.captureUndoSnapshot()
        wheel.recorded = true
      }
      wheel.shownScale = next
      pendingScale.current = { index, scale: next }
      scheduleApply()
    }

    canvas.addEventListener("wheel", onWheel, { passive: false })
    return () => {
      canvas.removeEventListener("wheel", onWheel)
      if (wheel.timer !== null) window.clearTimeout(wheel.timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 편집기를 떠날 때 끄는 중이던 것·예약해 둔 저장을 정리합니다.
  useEffect(
    () => () => {
      stopDragRef.current?.()
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    },
    [],
  )

  return (
    <div
      ref={canvasRef}
      className={`${styles.canvas} ${logoSelected ? styles.logoSelected : ""} ${
        photoActive ? styles.photoSelected : ""
      }`}
      data-active-photo={photoActive ? activePhotoIndex : undefined}
      onPointerDown={handlePointerDown}
      onDragStart={handleDragStart}
    >
      {preview}
      {/* 사진을 고른 동안에는 글자·로고 선택 상자를 숨깁니다. */}
      {!photoActive && (
        <PosterMoveable flow={flow} logoSelected={logoSelected} />
      )}
    </div>
  )
}
