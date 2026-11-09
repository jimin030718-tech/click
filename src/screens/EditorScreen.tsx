"use client"

import { useRouter } from "next/navigation"
import { posters } from "../data/posters"
import { useAppState } from "../state/AppState"
import { UploadPage } from "./DesignFlow"

export default function EditorScreen({ posterId }: { posterId: string }) {
  const router = useRouter()
  const { editorReturnTo } = useAppState()
  const poster = posters.find((item) => item.id === posterId)
  if (!poster) return null

  return (
    <UploadPage
      poster={poster}
      onBack={() => router.push(editorReturnTo, { scroll: false })}
    />
  )
}
