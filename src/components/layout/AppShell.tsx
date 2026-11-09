"use client"

import { useEffect, useState, type ReactNode } from "react"
import { usePathname, useRouter } from "next/navigation"
import { useAppState } from "../../state/AppState"

type MenuPath = "/" | "/saved" | "/guide" | "/new"

export default function AppShell({ children }: { children: ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const {
    savedIds,
    snapshotSavedView,
    setActiveCategory,
    editorReturnTo,
  } = useAppState()
  const [showHomeDialog, setShowHomeDialog] = useState(false)
  const [pendingPath, setPendingPath] = useState<MenuPath>("/")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [floatingUiOpen, setFloatingUiOpen] = useState(false)

  // 편집기(/design/...)에 있으면, 편집기를 열기 전 화면을 기준으로 메뉴를 표시합니다.
  const isEditing = pathname.startsWith("/design/")
  const basePath = isEditing ? editorReturnTo : pathname

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

  const navigate = (nextPath: MenuPath) => {
    if (nextPath === "/saved" && basePath !== "/saved") {
      snapshotSavedView()
    }
    router.push(nextPath, { scroll: false })
    setMobileMenuOpen(false)
  }

  const goHome = () => {
    router.push("/", { scroll: false })
    setActiveCategory("전체")
    setShowHomeDialog(false)
    setMobileMenuOpen(false)
  }

  const requestNavigation = (nextPath: MenuPath) => {
    setMobileMenuOpen(false)
    if (isEditing) {
      setPendingPath(nextPath)
      setShowHomeDialog(true)
      return
    }
    navigate(nextPath)
  }

  const requestHome = () => {
    if (isEditing) {
      setPendingPath("/")
      setMobileMenuOpen(false)
      setShowHomeDialog(true)
      return
    }
    goHome()
    window.requestAnimationFrame(() =>
      window.scrollTo({ top: 0, behavior: "smooth" }),
    )
  }

  const confirmNavigation = () => {
    setShowHomeDialog(false)
    if (pendingPath === "/") {
      goHome()
      return
    }
    navigate(pendingPath)
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
            className={pathname === "/" ? "current" : ""}
            onClick={() => requestNavigation("/")}
          >
            템플릿
          </button>
          <button
            className={basePath === "/saved" ? "current" : ""}
            onClick={() => requestNavigation("/saved")}
          >
            찜한 템플릿
            {savedIds.size > 0 && (
              <span className="saved-count">{savedIds.size}</span>
            )}
          </button>
          <button
            className={basePath === "/guide" ? "current" : ""}
            onClick={() => requestNavigation("/guide")}
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
            onClick={() => requestNavigation("/new")}
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
                  className={pathname === "/" ? "current" : ""}
                  onClick={() => requestNavigation("/")}
                >
                  <span>템플릿</span>
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  className={basePath === "/saved" ? "current" : ""}
                  onClick={() => requestNavigation("/saved")}
                >
                  <span>찜한 템플릿</span>
                  <span>{savedIds.size > 0 ? savedIds.size : "→"}</span>
                </button>
                <button
                  className={basePath === "/guide" ? "current" : ""}
                  onClick={() => requestNavigation("/guide")}
                >
                  <span>이용 안내</span>
                  <span aria-hidden="true">→</span>
                </button>
                <button
                  className={basePath === "/new" ? "current" : ""}
                  onClick={() => requestNavigation("/new")}
                >
                  <span>새 디자인 만들기</span>
                  <span aria-hidden="true">＋</span>
                </button>
              </div>
            </>
          )}
        </nav>
      </header>

      {children}

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
              {isEditing
                ? "진행 중인 편집 화면을 나가고 선택한 메뉴로 이동합니다."
                : "현재 화면을 나가고 템플릿 메인으로 이동합니다."}
            </p>
            <div>
              <button type="button" onClick={() => setShowHomeDialog(false)}>
                취소
              </button>
              <button type="button" onClick={confirmNavigation}>
                {pendingPath === "/"
                  ? "메인으로 돌아가기"
                  : pendingPath === "/saved"
                    ? "찜한 템플릿으로 이동"
                    : pendingPath === "/guide"
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
