// 팀 가이드의 포스터 데이터 모양입니다. (아직 화면 코드와 연결하지 않음)
// 글자 위치(x, y)와 크기는 포스터 크기 대비 비율로 저장하는 것이 규칙입니다. (CLAUDE.md 참고)

export type PosterCategory = "event" | "discount" | "hiring"

export type PosterText = {
  id: string
  content: string
  x: number
  y: number
  fontSize: number
  color?: string
  /** AI가 채운 문구인지 */
  aiFilled?: boolean
}

export type Poster = {
  id: string
  category: PosterCategory
  templateId: string
  mood: string
  backgroundUrl: string
  logoUrl?: string
  texts: PosterText[]
  width: number
  height: number
}
