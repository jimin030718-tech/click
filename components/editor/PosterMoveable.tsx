"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import { flushSync } from "react-dom"
import Moveable, { type OnDrag, type OnDragStart } from "react-moveable"
import type { DesignFlowState } from "@/components/create/useDesignFlow"

// 4단계 편집기에서 선택한 글자를 react-moveable로 드래그해 옮깁니다.
// - 핸들(위쪽 손잡이·네 테두리)을 잡아야만 움직입니다. 글자를 클릭하면 지금처럼 수정 모드예요.
// - Moveable이 글자의 style을 직접 바꾸지 않습니다.
//   움직인 픽셀을 포스터 폭·높이 대비 %(cqw/cqh)로 바꿔 setTextStyles에 저장하고,
//   그리는 것은 PosterArtwork가 합니다. 그래서 편집기와 완성본이 같은 모습입니다.
// - 드래그 한 번 = 되돌리기 한 칸.
export default function PosterMoveable({ flow }: { flow: DesignFlowState }) {
  const {
    canvasPosterRef,
    selectedText,
    textStyles,
    form,
    setTextStyles,
    captureUndoSnapshot,
  } = flow
  const moveableRef = useRef<Moveable>(null)
  const [elements, setElements] = useState<{
    target: HTMLElement | null
    handle: HTMLElement | null
  }>({ target: null, handle: null })

  // 드래그를 시작한 순간의 값 (손을 뗄 때까지 기억)
  const dragOrigin = useRef({
    pointerX: 0,
    pointerY: 0,
    x: 0,
    y: 0,
    posterWidth: 1,
    posterHeight: 1,
    recorded: false,
  })

  // 화면이 다시 그려질 때마다 "지금 선택된 글자"와 "그 글자의 핸들"을 찾아 둡니다.
  // (글자가 비었다가 다시 생기면 요소가 바뀌기 때문에 매번 확인)
  useLayoutEffect(() => {
    const root = canvasPosterRef.current
    const target =
      root?.querySelector<HTMLElement>(`[data-text="${selectedText}"]`) ?? null
    const handle =
      root?.querySelector<HTMLElement>(`[data-text-drag="${selectedText}"]`) ??
      null
    if (target !== elements.target || handle !== elements.handle) {
      setElements({ target, handle })
    }
  })

  // 글자 위치·크기·내용이 바뀐 뒤에는 Moveable 테두리를 글자에 다시 맞춥니다.
  useEffect(() => {
    moveableRef.current?.updateRect()
  }, [textStyles, form, selectedText, elements])

  const handleDragStart = (event: OnDragStart) => {
    const posterBounds = canvasPosterRef.current
      ?.querySelector(".editorial-poster")
      ?.getBoundingClientRect()
    dragOrigin.current = {
      pointerX: event.clientX,
      pointerY: event.clientY,
      x: textStyles[selectedText].x,
      y: textStyles[selectedText].y,
      posterWidth: posterBounds?.width || 405,
      posterHeight: posterBounds?.height || 573,
      recorded: false,
    }
  }

  const handleDrag = (event: OnDrag) => {
    const origin = dragOrigin.current
    const deltaX = event.clientX - origin.pointerX
    const deltaY = event.clientY - origin.pointerY
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return

    // 실제로 움직이기 시작한 첫 순간에 딱 한 번만 되돌리기 기록을 남깁니다.
    // (핸들을 눌렀다 바로 떼기만 하면 빈 기록이 생기지 않도록)
    if (!origin.recorded) {
      captureUndoSnapshot()
      origin.recorded = true
    }

    // 픽셀 → 포스터 대비 %. 예전과 같이 -45~45 안에서만 움직입니다.
    const clamp = (value: number) => Math.max(-45, Math.min(45, value))
    const nextX = clamp(origin.x + (deltaX / origin.posterWidth) * 100)
    const nextY = clamp(origin.y + (deltaY / origin.posterHeight) * 100)

    setTextStyles((current) => ({
      ...current,
      [selectedText]: { ...current[selectedText], x: nextX, y: nextY },
    }))
  }

  if (!elements.target || !elements.handle) return null

  return (
    <Moveable
      ref={moveableRef}
      target={elements.target}
      dragTarget={elements.handle}
      draggable
      origin={false}
      flushSync={flushSync}
      useResizeObserver
      onDragStart={handleDragStart}
      onDrag={handleDrag}
    />
  )
}
