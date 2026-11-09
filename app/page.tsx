"use client"

import { useRouter } from "next/navigation"
import { categories, posters } from "@/lib/posters"
import { TemplateCard } from "@/components/ui/TemplateCard"
import { useAppState } from "@/state/AppState"

export default function HomePage() {
  const router = useRouter()
  const {
    savedIds,
    toggleSaved,
    activeCategory,
    setActiveCategory,
    setEditorReturnTo,
  } = useAppState()
  const filteredPosters =
    activeCategory === "전체"
      ? posters
      : posters.filter((poster) => poster.category === activeCategory)

  const openEditor = (id: string) => {
    setEditorReturnTo("/")
    router.push(`/create/${id}`, { scroll: false })
  }

  return (
    <main>
      <section className="hero" aria-labelledby="hero-title">
        <h1 id="hero-title">어떤 디자인을 만들고 싶으세요?</h1>
        <p className="hero-copy">
          간단하게 &quot;딸깍&quot;하고 포스터를 생성해보세요.
        </p>
        <div className="category-tabs" role="tablist" aria-label="포스터 분류">
          {categories.map((category) => (
            <button
              key={category}
              className={activeCategory === category ? "active" : ""}
              onClick={() => setActiveCategory(category)}
              role="tab"
              aria-selected={activeCategory === category}
            >
              {category}
            </button>
          ))}
        </div>
      </section>

      <section className="template-section" aria-label="포스터 템플릿">
        <div className="section-heading">
          <div>
            <span className="section-kicker">추천 템플릿</span>
            <h2>
              {activeCategory === "전체"
                ? "지금 인기 있는 디자인"
                : `${activeCategory} 디자인`}
            </h2>
          </div>
          <p>{filteredPosters.length}개의 템플릿</p>
        </div>

        <div className="template-grid">
          {filteredPosters.map((poster) => (
            <TemplateCard
              key={poster.id}
              poster={poster}
              saved={savedIds.has(poster.id)}
              onSelect={() => openEditor(poster.id)}
              onToggleSaved={() => toggleSaved(poster.id)}
            />
          ))}
        </div>
      </section>
    </main>
  )
}
