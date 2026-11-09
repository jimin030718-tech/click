"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { posters } from "@/lib/posters"
import { SavedDesignsPage } from "@/components/screens/SavedPage"
import { useAppState } from "@/state/AppState"

export default function SavedRoute() {
  const router = useRouter()
  const {
    savedIds,
    savedLoaded,
    toggleSaved,
    savedViewIds,
    snapshotSavedView,
    setEditorReturnTo,
  } = useAppState()

  // 주소로 바로 들어온 경우: 찜 목록을 다 읽은 뒤 한 번 찍어 둡니다.
  useEffect(() => {
    if (savedLoaded && savedViewIds === null) snapshotSavedView()
  }, [savedLoaded, savedViewIds, snapshotSavedView])

  // 찜 목록을 읽기 전에는 '비어 있음' 화면이 잠깐 보이지 않도록 기다립니다.
  if (savedViewIds === null) return <main className="sub-page" />

  const savedPosters = posters.filter((poster) => savedViewIds.has(poster.id))

  return (
    <SavedDesignsPage
      savedPosters={savedPosters}
      savedIds={savedIds}
      onSelect={(id) => {
        setEditorReturnTo("/saved")
        router.push(`/create/${id}`, { scroll: false })
      }}
      onToggleSaved={toggleSaved}
      onBrowse={() => router.push("/", { scroll: false })}
    />
  )
}
