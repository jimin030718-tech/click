// posterRender.ts - 브라우저 Canvas 포스터 렌더링 (파이썬 renderer.py의 웹 버전)
import type { Template, TextZone } from "./templates";

export const MOODS: Record<string, [string, string]> = {
  "모던 / 깔끔": ["#3c465a", "#7d879b"],
  "감성 / 따뜻": ["#5a3c2d", "#b98c6e"],
  "활기찬 / 할인": ["#c8373c", "#f0962d"],
  "전통 / 고급": ["#161620", "#503e18"],
};

const ROLE_STYLE: Record<string, { color: string; size: number }> = {
  "제목": { color: "#FFFFFF", size: 70 },
  "가격": { color: "#FFD400", size: 46 },
  "기간·상호": { color: "#FFF3C4", size: 34 },
  "맛 종류": { color: "#FFF3C4", size: 34 },
  "문구": { color: "#F2F2F2", size: 38 },
};

const FONT_FAMILY = "Pretendard, system-ui, sans-serif";

function wrapByPixel(ctx: CanvasRenderingContext2D, text: string, maxW: number): string[] {
  const lines: string[] = [];
  for (const para of text.split("\n")) {
    if (para === "") { lines.push(""); continue; }
    let cur = "";
    for (const ch of para) {
      const trial = cur + ch;
      if (ctx.measureText(trial).width <= maxW || cur === "") cur = trial;
      else { lines.push(cur); cur = ch; }
    }
    lines.push(cur);
  }
  return lines;
}

export type Box = { x: number; y: number; w: number; h: number };

function drawTextInBox(
  ctx: CanvasRenderingContext2D,
  text: string,
  z: TextZone,
  color: string,
  startSize: number,
): Box {
  const minSize = 14;
  const lineSpacing = 1.2;
  let size = startSize;
  let lines: string[] = [];
  while (size >= minSize) {
    ctx.font = `700 ${size}px ${FONT_FAMILY}`;
    lines = wrapByPixel(ctx, text, z.w);
    const totalH = size * lineSpacing * (lines.length - 1) + size;
    if (totalH <= z.h) break;
    size -= 2;
  }
  ctx.font = `700 ${size}px ${FONT_FAMILY}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const lineH = size * lineSpacing;
  const totalH = lineH * (lines.length - 1) + size;
  let y = z.y + z.h / 2 - totalH / 2 + size / 2;
  const cx = z.x + z.w / 2;
  const top = y - size / 2;
  const stroke = Math.max(2, Math.round(size / 18));
  let maxW = 0;
  for (const line of lines) {
    ctx.lineWidth = stroke;
    ctx.strokeStyle = "#000000";
    ctx.lineJoin = "round";
    ctx.strokeText(line, cx, y);
    ctx.fillStyle = color;
    ctx.fillText(line, cx, y);
    maxW = Math.max(maxW, ctx.measureText(line).width);
    y += lineH;
  }
  // 실제로 보이는 글자 영역 (스마트 가이드 기준)
  return { x: cx - maxW / 2, y: top, w: maxW, h: totalH };
}

export function renderPoster(
  canvas: HTMLCanvasElement,
  tpl: Template,
  mood: string,
  texts: Record<string, string>,
  opts: { showPhotos?: boolean; photo?: HTMLImageElement | null; logo?: HTMLImageElement | null } = {},
): Record<string, Box> {
  const boxes: Record<string, Box> = {};
  const ctx = canvas.getContext("2d");
  if (!ctx) return boxes;
  canvas.width = tpl.w;
  canvas.height = tpl.h;

  const [top, bottom] = MOODS[mood] ?? MOODS["모던 / 깔끔"];
  const grad = ctx.createLinearGradient(0, 0, 0, tpl.h);
  grad.addColorStop(0, top);
  grad.addColorStop(1, bottom);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, tpl.w, tpl.h);

  // 업로드한 사진을 사진 자리(slot)에 꽉 차게(cover) 넣는다
  if (opts.photo) {
    for (const p of tpl.photos) {
      if (!p.slot) continue;
      drawImageInShape(ctx, opts.photo, p.x, p.y, p.w, p.h, p.shape);
    }
  }

  // 로고: 오른쪽 위 여백에 비율 유지해서 작게
  if (opts.logo) {
    const maxW = tpl.w * 0.16, maxH = tpl.h * 0.07;
    const r = Math.min(maxW / opts.logo.naturalWidth, maxH / opts.logo.naturalHeight);
    const lw = opts.logo.naturalWidth * r, lh = opts.logo.naturalHeight * r;
    ctx.drawImage(opts.logo, tpl.w - lw - tpl.w * 0.05, tpl.h * 0.035, lw, lh);
  }

  if (opts.showPhotos) {
    for (const p of tpl.photos) {
      ctx.fillStyle = "rgba(255,255,255,0.08)";
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 2;
      if (p.shape === "ellipse") {
        ctx.beginPath();
        ctx.ellipse(p.x + p.w / 2, p.y + p.h / 2, Math.abs(p.w) / 2, Math.abs(p.h) / 2, 0, 0, Math.PI * 2);
        ctx.fill(); ctx.stroke();
      } else {
        ctx.fillRect(p.x, p.y, p.w, p.h);
        ctx.strokeRect(p.x, p.y, p.w, p.h);
      }
    }
  }

  for (const z of tpl.texts) {
    const t = texts[z.id];
    if (!t) continue;
    const style = ROLE_STYLE[z.role] ?? ROLE_STYLE["문구"];
    boxes[z.id] = drawTextInBox(ctx, t, z, style.color, style.size);
  }
  return boxes;
}

// 사진을 네모/원 모양 안에 꽉 차게(cover) 그린다. 모양 밖은 잘라낸다.
function drawImageInShape(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number, y: number, w: number, h: number,
  shape: "ellipse" | "rect",
) {
  ctx.save();
  ctx.beginPath();
  if (shape === "ellipse") ctx.ellipse(x + w / 2, y + h / 2, Math.abs(w) / 2, Math.abs(h) / 2, 0, 0, Math.PI * 2);
  else ctx.rect(x, y, w, h);
  ctx.clip();
  const r = Math.max(w / img.naturalWidth, h / img.naturalHeight);
  const iw = img.naturalWidth * r, ih = img.naturalHeight * r;
  ctx.drawImage(img, x + (w - iw) / 2, y + (h - ih) / 2, iw, ih);
  ctx.restore();
}

// 첫 화면 카드 배치 → 디자인팀 템플릿 연결
export const LAYOUT_TO_TEMPLATE: Record<string, string> = {
  top: "A형_정중앙",
  bottom: "B형_확대사진 + 오른쪽 글 형",
  middle: "C형_기본 사진 + 확대사진",
  image: "A형_화면 밖 확장형",
};

// 첫 화면 카드 주제 → 기본 문구 / 기본 분위기
const THEME_TEXTS: Record<string, Record<string, string>> = {
  community: { "제목": "함께 만드는 작은 변화", "문구": "새로운 이웃을 기다립니다", "가격": "참여 무료", "기간·상호": "다정한 마을회관", "맛 종류": "" },
  music: { "제목": "초여름의 음악 산책", "문구": "도심 속 작은 연주회", "가격": "전석 무료", "기간·상호": "숲길 야외무대", "맛 종류": "" },
  notice: { "제목": "잠시 쉬어갑니다", "문구": "7월 1일 — 7월 4일 휴무", "가격": "", "기간·상호": "단풍카페", "맛 종류": "" },
  bookstore: { "제목": "우리 동네 책방", "문구": "천천히 읽고 오래 머무는 곳", "가격": "", "기간·상호": "느린 오후 책방", "맛 종류": "" },
  promotion: { "제목": "여름맞이 특별 혜택", "문구": "온·오프라인 동시 진행", "가격": "최대 50%", "기간·상호": "7월 15일까지", "맛 종류": "" },
};
export const THEME_MOOD: Record<string, string> = {
  community: "모던 / 깔끔", music: "감성 / 따뜻", notice: "전통 / 고급", bookstore: "감성 / 따뜻", promotion: "활기찬 / 할인",
};
export function themeTexts(tpl: Template, theme: string): Record<string, string> {
  const map = THEME_TEXTS[theme] ?? THEME_TEXTS.community;
  const out: Record<string, string> = {};
  const used: Record<string, number> = {};
  for (const z of tpl.texts) {
    // 같은 역할 칸이 여러 개면 두 번째부터는 비워둔다 (같은 문구 반복 방지)
    used[z.role] = (used[z.role] ?? 0) + 1;
    out[z.id] = used[z.role] === 1 ? map[z.role] ?? "" : "";
  }
  return out;
}

export function defaultTexts(tpl: Template, func: string): Record<string, string> {
  const base: Record<string, Record<string, string>> = {
    "할인 이벤트": { "제목": "오픈 기념 대할인", "가격": "전 메뉴 20%", "문구": "이번 주만!", "기간·상호": "단풍카페", "맛 종류": "" },
    "신메뉴 출시": { "제목": "가을 신메뉴", "가격": "4,500원", "문구": "한정 판매", "기간·상호": "단풍카페", "맛 종류": "고소함" },
    "매장 공지": { "제목": "임시 휴무 안내", "가격": "", "문구": "10월 9일 하루 쉽니다", "기간·상호": "단풍카페", "맛 종류": "" },
  };
  const map = base[func] ?? base["신메뉴 출시"];
  const out: Record<string, string> = {};
  for (const z of tpl.texts) out[z.id] = map[z.role] ?? "";
  return out;
}
