// ContentPage.tsx - 3단계 "내용 입력"(문구 + 분위기 + 스마트 가이드 편집) / 4단계 "완성"
import { useEffect, useMemo, useRef, useState } from "react";
import { templates } from "./templates";
import { LAYOUT_TO_TEMPLATE, MOODS } from "./posterRender";
import PosterEditor, { applyPositions } from "./PosterEditor";
import StepBar from "./StepBar";

export type Draft = {
  texts: Record<string, string>;
  pos: Record<string, { x: number; y: number }>;
  mood: string;
};

type PosterInfo = { id: string; type: string; layout: string; label: string; category: string; layoutLabel: string };

// 업로드한 이미지(dataURL)를 캔버스에 그릴 수 있는 형태로 불러오기
function useImage(src: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    if (!src) { setImg(null); return; }
    const el = new Image();
    el.onload = () => setImg(el);
    el.src = src;
  }, [src]);
  return img;
}

export function templateFor(layout: string) {
  const name = LAYOUT_TO_TEMPLATE[layout] ?? LAYOUT_TO_TEMPLATE.top;
  return templates.find((t) => t.name === name) ?? templates[0];
}

export function ContentPage({
  poster, photoSrc, logoSrc, draft, onDraft, onBack, onDone,
}: {
  poster: PosterInfo;
  photoSrc: string;
  logoSrc: string;
  draft: Draft;
  onDraft: (d: Draft) => void;
  onBack: () => void;
  onDone: (imageUrl: string) => void;
}) {
  const base = useMemo(() => templateFor(poster.layout), [poster.layout]);
  const tpl = applyPositions(base, draft.pos);
  const photo = useImage(photoSrc);
  const logo = useImage(logoSrc);
  const [selected, setSelected] = useState<string | null>(null);
  const canvas = useRef<HTMLCanvasElement | null>(null);

  // 같은 역할 칸이 여러 개면 "문구 1, 문구 2"처럼 번호를 붙인다
  const labels = useMemo(() => {
    const count: Record<string, number> = {};
    const total: Record<string, number> = {};
    base.texts.forEach((z) => (total[z.role] = (total[z.role] ?? 0) + 1));
    return Object.fromEntries(
      base.texts.map((z) => {
        count[z.role] = (count[z.role] ?? 0) + 1;
        return [z.id, total[z.role] > 1 ? `${z.role} ${count[z.role]}` : z.role];
      }),
    );
  }, [base]);

  return (
    <main className="upload-page">
      <StepBar current={3} />

      <section className="upload-heading">
        <button type="button" className="back-button" onClick={onBack} aria-label="사진 업로드로 돌아가기">←</button>
        <div>
          <span className="section-kicker">디자인 만들기 · 3단계</span>
          <h1>포스터에 들어갈 내용을 입력해주세요</h1>
          <p>문구를 고치고, 오른쪽 포스터에서 글자를 끌어 위치를 맞춰보세요. 분홍 선에 맞춰 자동 정렬돼요.</p>
        </div>
      </section>

      <div className="content-layout">
        <section className="content-panel" aria-label="내용 입력">
          <div className="content-group">
            <strong className="content-label">분위기</strong>
            <div className="mood-row">
              {Object.keys(MOODS).map((m) => (
                <button key={m} type="button" className={`mood-pill ${draft.mood === m ? "active" : ""}`}
                  onClick={() => onDraft({ ...draft, mood: m })}>
                  <i style={{ background: `linear-gradient(${MOODS[m][0]}, ${MOODS[m][1]})` }} />
                  {m}
                </button>
              ))}
            </div>
          </div>

          <div className="content-group">
            <strong className="content-label">문구</strong>
            {base.texts.map((z) => (
              <label key={z.id} className={`text-field ${selected === z.id ? "focused" : ""}`}>
                <span>{labels[z.id]}</span>
                <input
                  value={draft.texts[z.id] ?? ""}
                  placeholder="비워두면 포스터에 표시되지 않아요"
                  onFocus={() => setSelected(z.id)}
                  onChange={(e) => onDraft({ ...draft, texts: { ...draft.texts, [z.id]: e.target.value } })}
                />
              </label>
            ))}
          </div>

          <div className="upload-form-footer">
            <p>{Object.keys(draft.pos).length > 0 ? (
              <button type="button" className="link-button" onClick={() => onDraft({ ...draft, pos: {} })}>↺ 글자 위치 원래대로</button>
            ) : "Alt를 누른 채 끌면 자석 없이 자유롭게 옮길 수 있어요."}</p>
            <button type="button" className="next-button" onClick={() => canvas.current && onDone(canvas.current.toDataURL("image/png"))}>
              <span>완성하기</span>
              <span aria-hidden="true">→</span>
            </button>
          </div>
        </section>

        <aside className="content-preview">
          <PosterEditor
            ref={canvas}
            tpl={tpl}
            mood={draft.mood}
            texts={draft.texts}
            width={360}
            selected={selected}
            onSelect={setSelected}
            onMove={(id, p) => onDraft({ ...draft, pos: { ...draft.pos, [id]: p } })}
            photo={photo}
            logo={logo}
          />
          <p className="content-preview-meta">{poster.label} · {poster.layoutLabel}</p>
        </aside>
      </div>
    </main>
  );
}

export function DonePage({ imageUrl, onEdit, onRestart }: { imageUrl: string; onEdit: () => void; onRestart: () => void }) {
  function download() {
    const a = document.createElement("a");
    a.href = imageUrl;
    a.download = "click-poster.png";
    a.click();
  }
  return (
    <main className="upload-page">
      <StepBar current={4} />
      <section className="upload-heading">
        <button type="button" className="back-button" onClick={onEdit} aria-label="내용 입력으로 돌아가기">←</button>
        <div>
          <span className="section-kicker">디자인 만들기 · 4단계</span>
          <h1>포스터가 완성됐어요</h1>
          <p>마음에 들면 내려받고, 고칠 곳이 있으면 수정하기를 눌러주세요.</p>
        </div>
      </section>
      <div className="done-layout">
        <img className="done-poster" src={imageUrl} alt="완성된 포스터" />
        <div className="done-actions">
          <button type="button" className="next-button" onClick={download}>
            <span>PNG로 내려받기</span>
            <span aria-hidden="true">↓</span>
          </button>
          <button type="button" className="ghost-button" onClick={onEdit}>수정하기</button>
          <button type="button" className="ghost-button" onClick={onRestart}>새 디자인 만들기</button>
        </div>
      </div>
    </main>
  );
}
