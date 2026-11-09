"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"

const FAVORITES_KEY = "click-favorite-templates"

type AppState = {
  /** 찜한 템플릿 id (브라우저 localStorage에 저장) */
  savedIds: Set<string>
  /** localStorage에서 찜 목록을 다 읽었는지 */
  savedLoaded: boolean
  toggleSaved: (id: string) => void
  /** 찜한 템플릿 화면에 들어올 때 찍어 둔 목록 (하트를 꺼도 화면을 떠날 때까지 카드 유지) */
  savedViewIds: Set<string> | null
  snapshotSavedView: () => void
  /** 홈 카테고리 탭 (편집기에 갔다 와도 유지) */
  activeCategory: string
  setActiveCategory: (category: string) => void
  /** 편집기에서 '뒤로'를 누르면 돌아갈 주소 */
  editorReturnTo: string
  setEditorReturnTo: (path: string) => void
}

const AppStateContext = createContext<AppState | null>(null)

export function AppStateProvider({ children }: { children: ReactNode }) {
  const [savedIds, setSavedIds] = useState<Set<string>>(() => new Set())
  const [savedLoaded, setSavedLoaded] = useState(false)
  const [savedViewIds, setSavedViewIds] = useState<Set<string> | null>(null)
  const [activeCategory, setActiveCategory] = useState("전체")
  const [editorReturnTo, setEditorReturnTo] = useState("/")

  // 서버에서는 localStorage가 없으므로, 화면이 뜬 뒤에 읽어 옵니다.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(FAVORITES_KEY)
      setSavedIds(new Set(saved ? (JSON.parse(saved) as string[]) : []))
    } catch {
      // 읽기 실패 시 빈 목록 유지
    }
    setSavedLoaded(true)
  }, [])

  useEffect(() => {
    if (!savedLoaded) return
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...savedIds]))
  }, [savedIds, savedLoaded])

  const toggleSaved = useCallback((id: string) => {
    setSavedIds((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const snapshotSavedView = useCallback(() => {
    setSavedViewIds(new Set(savedIds))
  }, [savedIds])

  return (
    <AppStateContext.Provider
      value={{
        savedIds,
        savedLoaded,
        toggleSaved,
        savedViewIds,
        snapshotSavedView,
        activeCategory,
        setActiveCategory,
        editorReturnTo,
        setEditorReturnTo,
      }}
    >
      {children}
    </AppStateContext.Provider>
  )
}

export function useAppState() {
  const value = useContext(AppStateContext)
  if (!value) throw new Error("useAppState must be used inside AppStateProvider")
  return value
}
