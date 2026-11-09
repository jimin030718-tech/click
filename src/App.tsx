"use client"

import { useEffect, useState } from "react"
import { categories, posters, type Page } from "./data/posters"
import { UploadPage } from "./screens/DesignFlow"
import { TemplateCard } from "./components/TemplateCard"
import { SavedDesignsPage } from "./screens/SavedPage"
import { GuidePage } from "./screens/GuidePage"
import { NewDesignPage } from "./screens/NewDesignPage"

export default function App() {
  const [activeCategory, setActiveCategory] = useState("전체")
  const [selectedPosterId, setSelectedPosterId] = useState("")
  const [page, setPage] = useState<Page>("home")
  const [savedIds, setSavedIds] = useState<Set<string>>(() => {
    try {
      const saved = window.localStorage.getItem("click-favorite-templates")
      return new Set(saved ? (JSON.parse(saved) as string[]) : [])
    } catch {
      return new Set()
    }
  })
  const [savedViewIds, setSavedViewIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [showHomeDialog, setShowHomeDialog] = useState(false)
  const [pendingPage, setPendingPage] = useState<Page>("home")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [floatingUiOpen, setFloatingUiOpen] = useState(false)
  const filteredPosters =
    activeCategory === "전체"
      ? posters
      : posters.filter((poster) => poster.category === activeCategory)
  const selectedPoster = posters.find(
    (poster) => poster.id === selectedPosterId,
  )
  const savedPosters = posters.filter((poster) =>
    (page === "saved" ? savedViewIds : savedIds).has(poster.id),
  )

  useEffect(() => {
    window.localStorage.setItem(
      "click-favorite-templates",
      JSON.stringify([...savedIds]),
    )
  }, [savedIds])

  useEffect(() => {
    const updateScrollButton = () => setShowScrollTop(window.scrollY >= 400)
    updateScrollButton()
    window.addEventListener("scroll", updateScrollButton, { passive: true })
    return () => window.removeEventListener("scroll", updateScrollButton)
  }, [])

  useEffect(() => {
    const updateFloatingUi = () => {
      setFloatingUiOpen(
        Boolean(
          document.querySelector(
            ".generation-overlay, .dialog-backdrop, .mobile-menu",
          ),
        ),
      )
    }
    updateFloatingUi()
    const observer = new MutationObserver(updateFloatingUi)
    observer.observe(document.body, { childList: true, subtree: true })
    return () => observer.disconnect()
  }, [])

  const navigate = (nextPage: Page) => {
    if (nextPage === "saved" && page !== "saved") {
      setSavedViewIds(new Set(savedIds))
    }
    setSelectedPosterId("")
    setPage(nextPage)
    setMobileMenuOpen(false)
  }

  const requestNavigation = (nextPage: Page) => {
    setMobileMenuOpen(false)
    if (selectedPoster) {
      setPendingPage(nextPage)
      setShowHomeDialog(true)
      return
    }
    navigate(nextPage)
  }

  const requestHome = () => {
    if (selectedPoster) {
      setPendingPage("home")
      setMobileMenuOpen(false)
      setShowHomeDialog(true)
      return
    }
    goHome()
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    )
  }

  const goHome = () => {
    setSelectedPosterId("")
    setPage("home")
    setActiveCategory("전체")
    setShowHomeDialog(false)
    setMobileMenuOpen(false)
  }

  const confirmNavigation = () => {
    setShowHomeDialog(false)
    if (pendingPage === "home") {
      goHome()
      return
    }
    navigate(pendingPage)
  }

  const toggleSaved = (id: string) => {
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const scrollToTop = () => {
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches
    window.scrollTo({
      top: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }

  const scrollTopVisible =
    showScrollTop && !floatingUiOpen && !mobileMenuOpen && !showHomeDialog

  return (
    <div className="app-shell">
      <header className="site-header">
        <button
          className="brand"
          aria-label="CLICK 홈"
          onClick={requestHome}
        >
          <img className="brand-mark" src="/assets/click-logo.png" alt="" />
          <span className="brand-name">CLICK</span>
        </button>
        <nav className="navigation" aria-label="주요 메뉴">
          <button
            className={page === "home" && !selectedPoster ? "current" : ""}
            onClick={() => requestNavigation("home")}
          >
            템플릿
          </button>
          <button
            className={page === "saved" ? "current" : ""}
            onClick={() => requestNavigation("saved")}
          >
            찜한 템플릿
            {savedIds.size > 0 && (
              <span className="saved-count">{savedIds.size}</span>
            )}
          </button>
          <button
            className={page === "guide" ? "current" : ""}
            onClick={() => requestNavigation("guide")}
          >
            이용 안내
          </button>
          <button
            type="button"
            className={`mobile-menu-trigger ${mobileMenuOpen ? "open" : ""}`}
            aria-label="메뉴 열기"
            aria-expanded={mobileMenuOpen}
            onClick={() => setMobileMenuOpen((open) => !open)}
          >
            <span />
            <span />
            <span />
          </button>
          <button
            className="create-button"
            onClick={() => requestNavigation("new")}
          >
            <span>새 디자인 만들기</span>
            <span aria-hidden="true">＋</span>
          </button>
          {mobileMenuOpen && (
            <>
              <button
                type="button"
                className="mobile-menu-backdrop"
                aria-label="메뉴 닫기"
                onClick={() => setMobileMenuOpen(false)}
              />
              <div className="mobile-menu" aria-label="모바일 메뉴">
                <button
                  className={
                    page === "home" && !selectedPoster ? "current" : ""
                  }
                  onClick={() => requestNavigation("home")}
                >
                  <span>템플릿</span>
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  className={page === "saved" ? "current" : ""}
                  onClick={() => requestNavigation("saved")}
                >
                  <span>찜한 템플릿</span>
                  <span>{savedIds.size > 0 ? savedIds.size : "→"}</span>
                </button>
                <button
                  className={page === "guide" ? "current" : ""}
                  onClick={() => requestNavigation("guide")}
                >
                  <span>이용 안내</span>
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  className={page === "new" ? "current" : ""}
                  onClick={() => requestNavigation("new")}
                >
                  <span>새 디자인 만들기</span>
                  <span aria-hidden="true">＋</span>
                </button>
              </div>
            </>
          )}
        </nav>
      </header>

      {selectedPoster ? (
        <UploadPage
          poster={selectedPoster}
          onBack={() => setSelectedPosterId("")}
        />
      ) : page === "saved" ? (
        <SavedDesignsPage
          savedPosters={savedPosters}
          savedIds={savedIds}
          onSelect={setSelectedPosterId}
          onToggleSaved={toggleSaved}
          onBrowse={() => navigate("home")}
        />
      ) : page === "guide" ? (
        <GuidePage onStart={() => navigate("new")} />
      ) : page === "new" ? (
        <NewDesignPage onBrowse={() => navigate("home")} />
      ) : (
        <main>
          <section className="hero" aria-labelledby="hero-title">
            <h1 id="hero-title">어떤 디자인을 만들고 싶으세요?</h1>
            <p className="hero-copy">
              간단하게 &quot;딸깍&quot;하고 포스터를 생성해보세요.
            </p>
            <div
              className="category-tabs"
              role="tablist"
              aria-label="포스터 분류"
            >
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
                  onSelect={() => setSelectedPosterId(poster.id)}
                  onToggleSaved={() => toggleSaved(poster.id)}
                />
              ))}
            </div>
          </section>
        </main>
      )}

      <footer>
        <span>CLICK</span>
        <p>누구나 쉽게, 좋은 디자인을 시작할 수 있도록.</p>
      </footer>

      <button
        type="button"
        className={`scroll-top-button ${scrollTopVisible ? "visible" : ""}`}
        aria-label="맨 위로 이동"
        aria-hidden={!scrollTopVisible}
        tabIndex={scrollTopVisible ? 0 : -1}
        onClick={scrollToTop}
      >
        <span aria-hidden="true">↑</span>
      </button>

      {showHomeDialog && (
        <div
          className="dialog-backdrop"
          role="presentation"
          onMouseDown={() => setShowHomeDialog(false)}
        >
          <section
            className="home-dialog"
            role="dialog"
            aria-modal="true"
            aria-labelledby="home-dialog-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="dialog-brand" aria-label="CLICK">
              <img src="/assets/click-logo.png" alt="" />
            </div>
            <h2 id="home-dialog-title">편집 화면을 떠날까요?</h2>
            <p>
              {selectedPoster
                ? "진행 중인 편집 화면을 나가고 선택한 메뉴로 이동합니다."
                : "현재 화면을 나가고 템플릿 메인으로 이동합니다."}
            </p>
            <div>
              <button type="button" onClick={() => setShowHomeDialog(false)}>
                취소
              </button>
              <button type="button" onClick={confirmNavigation}>
                {pendingPage === "home"
                  ? "메인으로 돌아가기"
                  : pendingPage === "saved"
                    ? "찜한 템플릿으로 이동"
                    : pendingPage === "guide"
                      ? "이용 안내로 이동"
                      : "새 디자인으로 이동"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  )
}
