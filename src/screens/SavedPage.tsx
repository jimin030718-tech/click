import { type Poster } from "../data/posters"
import { TemplateCard } from "../components/ui/TemplateCard"

export function SavedDesignsPage({
  savedPosters,
  savedIds,
  onSelect,
  onToggleSaved,
  onBrowse,
}: {
  savedPosters: Poster[]
  savedIds: Set<string>
  onSelect: (id: string) => void
  onToggleSaved: (id: string) => void
  onBrowse: () => void
}) {
  return (
    <main className="sub-page">
      <section className="sub-page-heading">
        <span className="section-kicker">나만의 컬렉션</span>
        <h1>찜한 템플릿</h1>
        <p>마음에 드는 템플릿을 모아두고 언제든 디자인을 시작해보세요.</p>
      </section>
      {savedPosters.length ? (
        <>
          <div className="saved-summary">
            <strong>{savedPosters.length}개의 디자인</strong>
            <button type="button" onClick={onBrowse}>
              템플릿 더 보기 →
            </button>
          </div>
          <div className="template-grid saved-grid">
            {savedPosters.map((poster) => (
              <TemplateCard
                key={poster.id}
                poster={poster}
                saved={savedIds.has(poster.id)}
                onSelect={() => onSelect(poster.id)}
                onToggleSaved={() => onToggleSaved(poster.id)}
              />
            ))}
          </div>
        </>
      ) : (
        <section className="empty-saved">
          <span className="empty-heart" aria-hidden="true">
            ♡
          </span>
          <h2>아직 저장한 디자인이 없어요</h2>
          <p>템플릿 옆 하트를 누르면 이곳에 모아볼 수 있어요.</p>
          <button type="button" onClick={onBrowse}>
            템플릿 둘러보기
          </button>
        </section>
      )}
    </main>
  )
}
