"use client"

import { useEffect, useLayoutEffect, useRef, useState } from "react"
import Moveable, {
  type OnDrag,
  type OnDragStart,
  type OnScale,
  type OnScaleStart,
} from "react-moveable"
import type { DesignFlowState } from "@/components/create/useDesignFlow"
import type { TextElement, TextObjectStyle } from "@/lib/styles"

// 오른쪽 패널 "글자 크기" 슬라이더와 같은 범위 (EditorStep의 min/max)
const MIN_TEXT_SIZE = 70
const MAX_TEXT_SIZE = 140

// 4단계 편집기에서 선택한 글자를 react-moveable로 옮기고(드래그) 크기를 바꿉니다(모서리 손잡이).
// - 이동: 핸들(위쪽 손잡이·네 테두리)을 잡아야만 움직입니다. 글자를 클릭하면 지금처럼 수정 모드예요.
// - 크기: 모서리 손잡이를 끌면 가로세로 비율을 유지한 채 커지고 작아집니다.
// - Moveable이 글자의 style을 직접 바꾸지 않습니다.
//   위치는 포스터 폭·높이 대비 %(cqw/cqh), 크기는 size(%)로 setTextStyles에 저장하고,
//   그리는 것은 PosterArtwork가 합니다. 그래서 편집기와 완성본이 같은 모습입니다.
// - 드래그 한 번 = 되돌리기 한 칸, 크기 조절 한 번 = 되돌리기 한 칸.
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

  // 드래그·크기 조절을 시작한 순간의 값 (손을 뗄 때까지 기억)
  const gestureOrigin = useRef({
    element: "title" as TextElement,
    pointerX: 0,
    pointerY: 0,
    x: 0,
    y: 0,
    size: 100,
    posterWidth: 1,
    posterHeight: 1,
    recorded: false,
  })

  // 드래그·크기 조절 중 마우스 이벤트는 아주 자주 옵니다. 올 때마다 setTextStyles를 부르면
  // 편집기 전체가 계속 다시 그려지다가, 앞의 그리기가 끝나기 전에 다음 갱신이 쌓여
  // React가 "무한 반복"으로 판단하고 멈춥니다(Maximum update depth exceeded).
  // 그래서 바뀔 값은 여기에 잠깐 적어 두고, 화면 한 프레임에 한 번만 저장합니다.
  const pendingPatch = useRef<Partial<TextObjectStyle> | null>(null)
  const frameRef = useRef<number | null>(null)

  const applyPendingPatch = () => {
    frameRef.current = null
    const patch = pendingPatch.current
    if (!patch) return
    pendingPatch.current = null
    const element = gestureOrigin.current.element
    setTextStyles((current) => ({
      ...current,
      [element]: { ...current[element], ...patch },
    }))
  }

  // 바뀔 값을 적어 두고, 다음 화면 프레임에 한 번만 저장하도록 예약합니다.
  const schedulePatch = (patch: Partial<TextObjectStyle>) => {
    pendingPatch.current = { ...pendingPatch.current, ...patch }
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(applyPendingPatch)
    }
  }

  // 손을 떼면 아직 저장 안 된 마지막 값을 바로 저장합니다.
  const flushPendingPatch = () => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    applyPendingPatch()
  }

  // 실제로 처음 바뀌는 순간에 딱 한 번만 되돌리기 기록을 남깁니다.
  // (손잡이를 눌렀다 바로 떼기만 하면 빈 기록이 생기지 않도록)
  const recordUndoOnce = () => {
    if (gestureOrigin.current.recorded) return
    captureUndoSnapshot()
    gestureOrigin.current.recorded = true
  }

  // 편집기를 떠날 때 예약해 둔 저장이 남아 있으면 취소합니다.
  useEffect(
    () => () => {
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    },
    [],
  )

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

  // 드래그·크기 조절을 시작할 때 공통으로 시작 값을 적어 둡니다.
  const rememberOrigin = (clientX: number, clientY: number) => {
    const posterBounds = canvasPosterRef.current
      ?.querySelector(".editorial-poster")
      ?.getBoundingClientRect()
    const style = textStyles[selectedText]
    gestureOrigin.current = {
      element: selectedText,
      pointerX: clientX,
      pointerY: clientY,
      x: style.x,
      y: style.y,
      size: style.size,
      posterWidth: posterBounds?.width || 405,
      posterHeight: posterBounds?.height || 573,
      recorded: false,
    }
  }

  const handleDragStart = (event: OnDragStart) => {
    rememberOrigin(event.clientX, event.clientY)
  }

  const handleDrag = (event: OnDrag) => {
    const origin = gestureOrigin.current
    const deltaX = event.clientX - origin.pointerX
    const deltaY = event.clientY - origin.pointerY
    if (Math.abs(deltaX) < 0.5 && Math.abs(deltaY) < 0.5) return
    recordUndoOnce()

    // 픽셀 → 포스터 대비 %. 예전과 같이 -45~45 안에서만 움직입니다.
    const clamp = (value: number) => Math.max(-45, Math.min(45, value))
    schedulePatch({
      x: clamp(origin.x + (deltaX / origin.posterWidth) * 100),
      y: clamp(origin.y + (deltaY / origin.posterHeight) * 100),
    })
  }

  const handleScaleStart = (event: OnScaleStart) => {
    rememberOrigin(event.clientX, event.clientY)
  }

  const handleScale = (event: OnScale) => {
    const origin = gestureOrigin.current
    // dist = 시작 크기 대비 몇 배가 됐는지 (비율 유지라 가로·세로가 같음)
    const ratio = event.dist[0]
    const nextSize = Math.round(
      Math.max(MIN_TEXT_SIZE, Math.min(MAX_TEXT_SIZE, origin.size * ratio)),
    )
    if (nextSize === origin.size && !origin.recorded) return
    recordUndoOnce()
    schedulePatch({ size: nextSize })
  }

  if (!elements.target || !elements.handle) return null

  return (
    <Moveable
      ref={moveableRef}
      target={elements.target}
      dragTarget={elements.handle}
      draggable
      scalable
      keepRatio
      // 오른쪽 위(ne)는 이동 손잡이와 겹쳐서 뺐습니다.
      renderDirections={["nw", "sw", "se"]}
      origin={false}
      useResizeObserver
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={flushPendingPatch}
      onScaleStart={handleScaleStart}
      onScale={handleScale}
      onScaleEnd={flushPendingPatch}
    />
  )
}
