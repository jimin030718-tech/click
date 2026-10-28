// PosterEditor.tsx - 포스터 위 글자를 끌어서 옮기고, 스마트 가이드(정렬선 + 자석 스냅)를 보여주는 편집기
// 기준: "실제로 보이는 글자 영역"끼리, 그리고 포스터 정중앙에만 맞춘다. (미리캔버스 방식)
import { forwardRef, useEffect, useRef, useState } from "react";
import type { Template } from "./templates";
import { renderPoster, type Box } from "./posterRender";

type Pos = { x: number; y: number };
// 가이드선: v = 세로선(x 위치), h = 가로선(y 위치). from~to 구간에만 그린다.
type Guide = { axis: "v" | "h"; at: number; from: number; to: number; center?: boolean };

const SNAP_PX = 6; // 화면 기준 이 거리 안에 들어오면 달라붙음
const HIT_PAD = 6; // 작은 글자도 잡기 쉽도록 클릭 영역 여유

export function applyPositions(tpl: Template, pos: Record<string, Pos>): Template {
  return { ...tpl, texts: tpl.texts.map((z) => (pos[z.id] ? { ...z, ...pos[z.id] } : z)) };
}

// 한 요소의 기준점: 시작 · 가운데 · 끝 (kind 1 = 가운데)
type Pt = { at: number; mid: boolean };
function pointsX(b: Box): Pt[] { return [{ at: b.x, mid: false }, { at: b.x + b.w / 2, mid: true }, { at: b.x + b.w, mid: false }]; }
function pointsY(b: Box): Pt[] { return [{ at: b.y, mid: false }, { at: b.y + b.h / 2, mid: true }, { at: b.y + b.h, mid: false }]; }

type Target = { at: number; mid: boolean; box: Box | null }; // box가 null이면 포스터 정중앙

// 가장 가까운 정렬 대상을 고른다. 단, "가운데 ↔ 가운데" 맞춤을 우선한다.
function bestSnap(mine: Pt[], targets: Target[], threshold: number) {
  let best: { delta: number; at: number; score: number } | null = null;
  for (const p of mine) {
    for (const t of targets) {
      const d = t.at - p.at;
      if (Math.abs(d) > threshold) continue;
      const score = Math.abs(d) - (p.mid && t.mid ? threshold * 0.6 : 0);
      if (!best || score < best.score) best = { delta: d, at: t.at, score };
    }
  }
  return best;
}

type Props = {
  tpl: Template;
  mood: string;
  texts: Record<string, string>;
  width: number;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onMove: (id: string, p: Pos) => void;
  photo?: HTMLImageElement | null;
  logo?: HTMLImageElement | null;
};

const PosterEditor = forwardRef<HTMLCanvasElement, Props>(function PosterEditor(
  { tpl, mood, texts, width, selected, onSelect, onMove, photo, logo },
  ref,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [boxes, setBoxes] = useState<Record<string, Box>>({});
  const [guides, setGuides] = useState<Guide[]>([]);
  const drag = useRef<{ id: string; sx: number; sy: number; zx: number; zy: number; offX: number; offY: number; bw: number; bh: number } | null>(null);
  const scale = width / tpl.w;
  const height = tpl.h * scale;

  function setCanvas(el: HTMLCanvasElement | null) {
    canvasRef.current = el;
    if (typeof ref === "function") ref(el);
    else if (ref) (ref as React.MutableRefObject<HTMLCanvasElement | null>).current = el;
  }

  // 그릴 때마다 실제 글자 영역을 받아 둔다
  useEffect(() => {
    const c = canvasRef.current;
    if (!c) return;
    const draw = () => setBoxes(renderPoster(c, tpl, mood, texts, { photo, logo }));
    if (document.fonts?.ready) document.fonts.ready.then(draw);
    else draw();
  }, [tpl, mood, texts, photo, logo]);

  function onPointerDown(e: React.PointerEvent, id: string) {
    const z = tpl.texts.find((t) => t.id === id);
    const b = boxes[id];
    if (!z || !b) return;
    e.preventDefault();
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    onSelect(id);
    drag.current = { id, sx: e.clientX, sy: e.clientY, zx: z.x, zy: z.y, offX: b.x - z.x, offY: b.y - z.y, bw: b.w, bh: b.h };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    if (!d) return;
    // 글자 영역의 새 위치(스냅 전)
    let bx = d.zx + d.offX + (e.clientX - d.sx) / scale;
    let by = d.zy + d.offY + (e.clientY - d.sy) / scale;
    const next: Guide[] = [];

    if (!e.altKey) {
      const others = Object.entries(boxes).filter(([id]) => id !== d.id).map(([, b]) => b);
      const threshold = SNAP_PX / scale;

      const xTargets: Target[] = [{ at: tpl.w / 2, mid: true, box: null }, ...others.flatMap((o) => pointsX(o).map((pt) => ({ ...pt, box: o })))];
      const yTargets: Target[] = [{ at: tpl.h / 2, mid: true, box: null }, ...others.flatMap((o) => pointsY(o).map((pt) => ({ ...pt, box: o })))];

      const sx = bestSnap(pointsX({ x: bx, y: by, w: d.bw, h: d.bh }), xTargets, threshold);
      if (sx) bx += sx.delta;
      const sy = bestSnap(pointsY({ x: bx, y: by, w: d.bw, h: d.bh }), yTargets, threshold);
      if (sy) by += sy.delta;

      const me: Box = { x: bx, y: by, w: d.bw, h: d.bh };
      // 같은 선에 맞춰진 대상 모두에 대해, "나 ↔ 그 대상" 사이에만 선을 긋는다
      if (sx) {
        for (const t of xTargets) {
          if (Math.abs(t.at - sx.at) > 0.5) continue;
          if (!t.box) next.push({ axis: "v", at: t.at, from: 0, to: tpl.h, center: true });
          else next.push({ axis: "v", at: t.at, from: Math.min(me.y, t.box.y), to: Math.max(me.y + me.h, t.box.y + t.box.h) });
        }
      }
      if (sy) {
        for (const t of yTargets) {
          if (Math.abs(t.at - sy.at) > 0.5) continue;
          if (!t.box) next.push({ axis: "h", at: t.at, from: 0, to: tpl.w, center: true });
          else next.push({ axis: "h", at: t.at, from: Math.min(me.x, t.box.x), to: Math.max(me.x + me.w, t.box.x + t.box.w) });
        }
      }
    }

    // 글자 영역 → 칸 위치로 환산, 포스터 밖으로 완전히 나가지 않게
    let x = bx - d.offX;
    let y = by - d.offY;
    x = Math.max(-d.offX - d.bw / 2, Math.min(tpl.w - d.offX - d.bw / 2, x));
    y = Math.max(-d.offY - d.bh / 2, Math.min(tpl.h - d.offY - d.bh / 2, y));
    setGuides(next);
    onMove(d.id, { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 });
  }

  function onPointerUp() {
    drag.current = null;
    setGuides([]);
  }

  return (
    <div
      className="poster-editor"
      style={{ width, height }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerDown={(e) => { if (e.target === e.currentTarget) onSelect(null); }}
    >
      <canvas ref={setCanvas} className="poster-editor-canvas" style={{ width, height }} />

      {Object.entries(boxes).map(([id, b]) => (
        <div
          key={id}
          className={`edit-box ${selected === id ? "sel" : ""}`}
          style={{
            left: b.x * scale - HIT_PAD,
            top: b.y * scale - HIT_PAD,
            width: b.w * scale + HIT_PAD * 2,
            height: b.h * scale + HIT_PAD * 2,
          }}
          onPointerDown={(e) => onPointerDown(e, id)}
          title="끌어서 옮기기 (Alt: 자석 끄기)"
        />
      ))}

      {guides.map((g, i) =>
        g.axis === "v" ? (
          <div key={i} className={`smart-guide v ${g.center ? "center" : ""}`}
            style={{ left: g.at * scale, top: g.from * scale, height: (g.to - g.from) * scale }} />
        ) : (
          <div key={i} className={`smart-guide h ${g.center ? "center" : ""}`}
            style={{ top: g.at * scale, left: g.from * scale, width: (g.to - g.from) * scale }} />
        ),
      )}
    </div>
  );
});

export default PosterEditor;
