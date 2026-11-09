"use client"

import type { Poster } from "@/lib/posters"
import { useDesignFlow } from "@/components/create/useDesignFlow"
import { renderInfoStep } from "@/components/create/InfoStep"
import { renderMoodStep } from "@/components/create/MoodStep"
import { renderEditorStep } from "@/components/editor/EditorStep"
import { renderExportStep } from "@/components/editor/ExportStep"

// 디자인 만들기 흐름: 2 정보 입력 → 3 분위기 → 4 편집 → 5 내보내기
export function DesignFlow({ poster, onBack }: { poster: Poster; onBack: () => void }) {
  const flow = useDesignFlow(poster, onBack)

  if (flow.step === 3) return renderMoodStep(flow)
  if (flow.step === 4) return renderEditorStep(flow)
  if (flow.step === 5) return renderExportStep(flow)
  return renderInfoStep(flow)
}
