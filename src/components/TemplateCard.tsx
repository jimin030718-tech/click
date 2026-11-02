import { type Poster } from "../data/posters"
import { PosterArtwork } from "./PosterArtwork"

export function TemplateCard({
  poster,
  saved,
  onSelect,
  onToggleSaved,
}: {
  poster: Poster
  saved: boolean
  onSelect: () => void
  onToggleSaved: () => void
}) {
  return (
    <article className="template-card">
      <button
        className="poster-button"
        aria-label={`${poster.label} ${poster.layoutLabel} 템플릿 선택`}
        onClick={onSelect}
      >
        <PosterArtwork type={poster.type} layout={poster.layout} />
        <span className="card-action">
          <span>이 디자인 사용하기</span>
          <span aria-hidden="true">→</span>
        </span>
      </button>
      <div className="card-meta">
        <div>
          <strong>{poster.layoutLabel}</strong>
          <span>{poster.category}</span>
        </div>
        <button
          aria-label={`${poster.label} ${poster.layoutLabel} ${
            saved ? "저장 취소" : "저장"
          }`}
          className={`save-button ${saved ? "saved" : ""}`}
          onClick={onToggleSaved}
          aria-pressed={saved}
        >
          <span aria-hidden="true">{saved ? "♥" : "♡"}</span>
        </button>
      </div>
    </article>
  )
}
