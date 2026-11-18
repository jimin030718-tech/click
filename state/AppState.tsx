"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import { useSession } from "next-auth/react"
import { mergeFavorites, setFavorite } from "@/lib/db/actions"

const FAVORITES_KEY = "click-favorite-templates"

type AppState = {
  /** 찜한 템플릿 id (브라우저 localStorage에 저장 + 로그인했으면 DB favorites 에도 저장) */
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

  // 로그인한 사장님은 찜 목록을 DB에도 저장합니다. (C 담당)
  // 로그인 직후 한 번: 이 브라우저의 찜 + 계정의 찜을 합쳐서 양쪽을 똑같이 맞춥니다.
  const { status: authStatus } = useSession()
  const loggedIn = authStatus === "authenticated"
  const syncedRef = useRef(false)

  useEffect(() => {
    if (!loggedIn || !savedLoaded || syncedRef.current) return
    syncedRef.current = true
    mergeFavorites([...savedIds])
      .then((ids) => {
        if (ids) setSavedIds((current) => new Set([...current, ...ids]))
      })
      .catch(() => {
        // DB에 문제가 있으면 브라우저 저장만 사용
      })
  }, [loggedIn, savedLoaded, savedIds])

  const toggleSaved = useCallback(
    (id: string) => {
      const willSave = !savedIds.has(id)
      setSavedIds((current) => {
        const next = new Set(current)
        if (willSave) next.add(id)
        else next.delete(id)
        return next
      })
      if (loggedIn) setFavorite(id, willSave).catch(() => {})
    },
    [savedIds, loggedIn],
  )

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
