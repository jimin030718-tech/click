"use client"

import { useRouter } from "next/navigation"
import { posters } from "@/lib/posters"
import { useAppState } from "@/state/AppState"
import { DesignFlow } from "@/components/create/DesignFlow"

export default function CreateScreen({ templateId }: { templateId: string }) {
  const router = useRouter()
  const { editorReturnTo } = useAppState()
  const poster = posters.find((item) => item.id === templateId)
  if (!poster) return null

  return (
    <DesignFlow
      poster={poster}
      onBack={() => router.push(editorReturnTo, { scroll: false })}
    />
  )
}
