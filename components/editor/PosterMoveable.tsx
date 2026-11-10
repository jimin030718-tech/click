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
import styles from "./PosterMoveable.module.css"

// 오른쪽 패널 슬라이더와 같은 범위 (EditorStep의 min/max)
const TEXT_SIZE_RANGE = { min: 70, max: 140 } // 글자 크기(%)
const TEXT_POSITION_LIMIT = 45 // 글자 위치: 포스터 대비 ±45%
const LOGO_SCALE_RANGE = { min: 0.5, max: 1.8 } // 로고 크기 50~180%
const LOGO_POSITION_LIMIT = 100 // 로고 위치: 로고 자신의 크기 대비 ±100%

// 스마트 가이드: 이 거리(화면 px) 안으로 가까워지면 정렬선에 딱 붙습니다.
const SNAP_PX = 6

// 내 요소와 다른 요소의 왼쪽·가운데·오른쪽, 위·가운데·아래를 모두 맞춤 기준으로 씁니다.
const ALL_SNAP_DIRECTIONS = {
  left: true,
  center: true,
  right: true,
  top: true,
  middle: true,
  bottom: true,
}

// 포스터 정중앙(세로선·가로선). 점선으로 그리기 위해 이름표(className)를 붙입니다.
const POSTER_CENTER_GUIDES = [{ pos: "50%", className: "poster-center-guide" }]

type MoveableElements = {
  target: HTMLElement | null
  handle: HTMLElement | null
  poster: HTMLElement | null
  others: HTMLElement[]
}

type LogoTransform = { x: number; y: number; scale: number }

// 지금 움직이는 것: 글자(어떤 글자인지) 또는 로고
type GestureKind = { kind: "text"; element: TextElement } | { kind: "logo" }

const sameElements = (a: MoveableElements, b: MoveableElements) =>
  a.target === b.target &&
  a.handle === b.handle &&
  a.poster === b.poster &&
  a.others.length === b.others.length &&
  a.others.every((element, index) => element === b.others[index])

const clamp = (value: number, min: number, max: number) =>
  Math.max(min, Math.min(max, value))

// 4단계 편집기에서 선택한 글자 또는 로고를 react-moveable로 옮기고(드래그) 크기를 바꿉니다(모서리 손잡이).
// - 글자 이동: 핸들(위쪽 손잡이·네 테두리)을 잡아야만 움직입니다. 글자를 클릭하면 지금처럼 수정 모드예요.
// - 로고 이동: 로고를 클릭해 고른 뒤 로고를 그대로 끌면 됩니다.
// - 크기: 모서리 손잡이를 끌면 가로세로 비율을 유지한 채 커지고 작아집니다.
// - Moveable이 style을 직접 바꾸지 않습니다.
//   글자는 위치를 포스터 대비 %(cqw/cqh), 크기를 size(%)로 setTextStyles에,
//   로고는 위치를 "로고 자신의 크기" 대비 %, 크기를 scale로 setLogoTransform에 저장하고,
//   그리는 것은 PosterArtwork가 합니다. 그래서 편집기와 완성본이 같은 모습입니다.
// - 드래그 한 번 = 되돌리기 한 칸, 크기 조절 한 번 = 되돌리기 한 칸.
// - 스마트 가이드: 포스터 정중앙(점선)과 다른 글자·로고의 가장자리·가운데(실선)에 6px 안으로
//   가까워지면 딱 붙습니다. Alt 키를 누르고 있으면 붙지 않고 자유롭게 움직입니다.
//   (참고: legacy/src_old/PosterEditor.tsx의 예전 스마트 가이드)
export default function PosterMoveable({
  flow,
  logoSelected,
}: {
  flow: DesignFlowState
  logoSelected: boolean
}) {
  const {
    canvasPosterRef,
    selectedText,
    textStyles,
    logoTransform,
    form,
    setTextStyles,
    setLogoTransform,
    captureUndoSnapshot,
  } = flow
  const moveableRef = useRef<Moveable>(null)
  const [elements, setElements] = useState<MoveableElements>({
    target: null,
    handle: null,
    poster: null,
    others: [],
  })
  // Alt 키를 누르고 있는 동안은 스냅을 끕니다.
  const [snapOff, setSnapOff] = useState(false)
  const gestureActive = useRef(false)

  // 드래그·크기 조절을 시작한 순간의 값 (손을 뗄 때까지 기억)
  // unitX·unitY = 위치 1(%)이 화면에서 몇 px인지 (글자는 포스터 기준, 로고는 로고 자신 기준)
  const gestureOrigin = useRef({
    gesture: { kind: "text", element: "title" } as GestureKind,
    x: 0,
    y: 0,
    size: 1, // 글자는 size(%), 로고는 scale
    unitX: 1,
    unitY: 1,
    recorded: false,
  })

  // 드래그·크기 조절 중 마우스 이벤트는 아주 자주 옵니다. 올 때마다 상태를 저장하면
  // 편집기 전체가 계속 다시 그려지다가, 앞의 그리기가 끝나기 전에 다음 갱신이 쌓여
  // React가 "무한 반복"으로 판단하고 멈춥니다(Maximum update depth exceeded).
  // 그래서 바뀔 값은 여기에 잠깐 적어 두고, 화면 한 프레임에 한 번만 저장합니다.
  const pendingPatch = useRef<{ x?: number; y?: number; size?: number } | null>(
    null,
  )
  const frameRef = useRef<number | null>(null)

  const applyPendingPatch = () => {
    frameRef.current = null
    const patch = pendingPatch.current
    if (!patch) return
    pendingPatch.current = null
    const { gesture } = gestureOrigin.current
    if (gesture.kind === "logo") {
      const logoPatch: Partial<LogoTransform> = {}
      if (patch.x !== undefined) logoPatch.x = patch.x
      if (patch.y !== undefined) logoPatch.y = patch.y
      if (patch.size !== undefined) logoPatch.scale = patch.size
      setLogoTransform((current) => ({ ...current, ...logoPatch }))
      return
    }
    const element = gesture.element
    setTextStyles((current) => ({
      ...current,
      [element]: {
        ...current[element],
        ...(patch as Partial<TextObjectStyle>),
      },
    }))
  }

  // 바뀔 값을 적어 두고, 다음 화면 프레임에 한 번만 저장하도록 예약합니다.
  const schedulePatch = (patch: { x?: number; y?: number; size?: number }) => {
    pendingPatch.current = { ...pendingPatch.current, ...patch }
    if (frameRef.current === null) {
      frameRef.current = requestAnimationFrame(applyPendingPatch)
    }
  }

  // 손을 떼면 아직 저장 안 된 마지막 값을 바로 저장합니다.
  const flushPendingPatch = () => {
    gestureActive.current = false
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current)
    applyPendingPatch()
  }

  // Alt 키 누름/뗌을 지켜봅니다. (이 상태는 이 작은 컴포넌트만 다시 그리게 해서 가볍습니다)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      // 끄는 중에 Alt를 누르면 브라우저 메뉴로 초점이 가지 않게 막습니다.
      if (event.key === "Alt" && gestureActive.current) event.preventDefault()
      setSnapOff(event.altKey)
    }
    const onBlur = () => setSnapOff(false)
    window.addEventListener("keydown", onKey)
    window.addEventListener("keyup", onKey)
    window.addEventListener("blur", onBlur)
    return () => {
      window.removeEventListener("keydown", onKey)
      window.removeEventListener("keyup", onKey)
      window.removeEventListener("blur", onBlur)
    }
  }, [])

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

  // 화면이 다시 그려질 때마다 "지금 움직일 대상", "잡을 곳(핸들)",
  // "포스터", "맞춤 기준이 될 다른 요소들"을 찾아 둡니다.
  // (요소가 비었다가 다시 생기면 바뀌기 때문에 매번 확인하고, 바뀌었을 때만 저장)
  useLayoutEffect(() => {
    const root = canvasPosterRef.current
    const logo = root?.querySelector<HTMLElement>("[data-logo]") ?? null
    const texts = Array.from(
      root?.querySelectorAll<HTMLElement>("[data-text]") ?? [],
    )
    const poster = root?.querySelector<HTMLElement>(".editorial-poster") ?? null
    const next: MoveableElements =
      logoSelected && logo
        ? // 로고: 로고 자체를 잡고 끕니다. 맞춤 기준은 모든 글자.
          { target: logo, handle: logo, poster, others: texts }
        : {
            // 글자: 이동 핸들을 잡고 끕니다. 맞춤 기준은 다른 글자 + 로고.
            target:
              root?.querySelector<HTMLElement>(
                `[data-text="${selectedText}"]`,
              ) ?? null,
            handle:
              root?.querySelector<HTMLElement>(
                `[data-text-drag="${selectedText}"]`,
              ) ?? null,
            poster,
            others: [
              ...texts.filter(
                (element) => element.dataset.text !== selectedText,
              ),
              ...(logo ? [logo] : []),
            ],
          }
    if (!sameElements(next, elements)) setElements(next)
  })

  // 위치·크기·내용이 바뀐 뒤에는 Moveable 테두리를 다시 맞춥니다.
  useEffect(() => {
    moveableRef.current?.updateRect()
  }, [textStyles, logoTransform, form, selectedText, logoSelected, elements])

  const isLogo = logoSelected && elements.target?.dataset.logo !== undefined

  // 드래그·크기 조절을 시작할 때 공통으로 시작 값을 적어 둡니다.
  const rememberOrigin = () => {
    gestureActive.current = true
    if (isLogo && elements.target) {
      // 로고 위치(%)는 로고 상자 자신의 크기 기준입니다. (offsetWidth = 크기 조절 전 원래 크기)
      gestureOrigin.current = {
        gesture: { kind: "logo" },
        x: logoTransform.x,
        y: logoTransform.y,
        size: logoTransform.scale,
        unitX: (elements.target.offsetWidth || 1) / 100,
        unitY: (elements.target.offsetHeight || 1) / 100,
        recorded: false,
      }
      return
    }
    const posterBounds = elements.poster?.getBoundingClientRect()
    const style = textStyles[selectedText]
    gestureOrigin.current = {
      gesture: { kind: "text", element: selectedText },
      x: style.x,
      y: style.y,
      size: style.size,
      unitX: (posterBounds?.width || 405) / 100,
      unitY: (posterBounds?.height || 573) / 100,
      recorded: false,
    }
  }

  // 시작 위치에서 [가로, 세로] 픽셀만큼 옮긴 위치를 %로 바꾸고, 슬라이더와 같은 범위로 제한합니다.
  const positionFromDistance = ([distX, distY]: number[]) => {
    const origin = gestureOrigin.current
    const limit =
      origin.gesture.kind === "logo" ? LOGO_POSITION_LIMIT : TEXT_POSITION_LIMIT
    return {
      x: clamp(origin.x + distX / origin.unitX, -limit, limit),
      y: clamp(origin.y + distY / origin.unitY, -limit, limit),
    }
  }

  const handleDragStart = (_event: OnDragStart) => {
    rememberOrigin()
  }

  const handleDrag = (event: OnDrag) => {
    // beforeDist = 시작부터 움직인 픽셀. 스냅이 켜져 있으면 정렬선에 붙은 만큼이 이미 반영돼 있습니다.
    // (마우스 거리를 직접 쓰면 스냅이 무시되므로 Moveable이 계산한 값을 씁니다)
    const [distX, distY] = event.beforeDist
    if (Math.abs(distX) < 0.5 && Math.abs(distY) < 0.5) return
    recordUndoOnce()
    schedulePatch(positionFromDistance(event.beforeDist))
  }

  const handleScaleStart = (_event: OnScaleStart) => {
    rememberOrigin()
  }

  const handleScale = (event: OnScale) => {
    const origin = gestureOrigin.current
    // dist = 시작 크기 대비 몇 배가 됐는지 (비율 유지라 가로·세로가 같음)
    const ratio = event.dist[0]
    // 글자 size는 슬라이더처럼 정수(%), 로고 scale은 0.01 단위로 저장합니다.
    const nextSize =
      origin.gesture.kind === "logo"
        ? Math.round(
            clamp(
              origin.size * ratio,
              LOGO_SCALE_RANGE.min,
              LOGO_SCALE_RANGE.max,
            ) * 100,
          ) / 100
        : Math.round(
            clamp(origin.size * ratio, TEXT_SIZE_RANGE.min, TEXT_SIZE_RANGE.max),
          )
    if (nextSize === origin.size && !origin.recorded) return
    recordUndoOnce()
    // 크기를 바꿀 때 반대쪽 모서리가 제자리에 있도록 Moveable이 알려 주는 이동량(event.drag)도
    // 함께 저장합니다. 그래야 스냅으로 맞춘 가장자리가 실제 그림과도 정확히 맞습니다.
    // 이동량은 "크기가 변한 만큼"에 비례하므로, 최소·최대에 걸리거나 반올림해
    // 실제 크기가 덜 변했으면 이동량도 같은 비율로 줄입니다.
    const appliedRatio = nextSize / origin.size
    const factor = ratio === 1 ? 0 : (appliedRatio - 1) / (ratio - 1)
    const [distX, distY] = event.drag.beforeDist
    schedulePatch({
      size: nextSize,
      ...positionFromDistance([distX * factor, distY * factor]),
    })
  }

  if (!elements.target || !elements.handle) return null

  return (
    <Moveable
      ref={moveableRef}
      className={styles.moveable}
      target={elements.target}
      // 글자는 이동 핸들만 잡히게, 로고는 로고 자체를 잡고 끕니다.
      dragTarget={isLogo ? undefined : elements.handle}
      draggable
      scalable
      keepRatio
      // 글자: 오른쪽 위(ne)는 이동 손잡이와 겹쳐서 뺐습니다. 로고는 네 모서리 모두.
      renderDirections={isLogo ? ["nw", "ne", "sw", "se"] : ["nw", "sw", "se"]}
      origin={false}
      useResizeObserver
      // 스마트 가이드(정렬선·스냅)
      snappable={!snapOff}
      snapContainer={elements.poster}
      snapHorizontalThreshold={SNAP_PX}
      snapVerticalThreshold={SNAP_PX}
      snapDirections={ALL_SNAP_DIRECTIONS}
      elementSnapDirections={ALL_SNAP_DIRECTIONS}
      elementGuidelines={elements.others}
      verticalGuidelines={POSTER_CENTER_GUIDES}
      horizontalGuidelines={POSTER_CENTER_GUIDES}
      snapGap={false}
      isDisplaySnapDigit={false}
      isDisplayInnerSnapDigit={false}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragEnd={flushPendingPatch}
      onScaleStart={handleScaleStart}
      onScale={handleScale}
      onScaleEnd={flushPendingPatch}
    />
  )
}
