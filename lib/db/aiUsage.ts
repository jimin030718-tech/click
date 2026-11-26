// AI 사용 기록 · 1인당 횟수 제한 (C 담당) — 서버 코드에서만 import 하세요.
//
// ★ B(AI) 담당이 app/api/ 의 AI 서버 코드에서 쓰는 법:
//
//   import { checkAiQuota, recordAiUsage } from "@/lib/db/aiUsage"
//
//   export async function POST(request: Request) {
//     const quota = await checkAiQuota("remove-bg")          // ① 쓰기 전에 확인
//     if (!quota.ok) return Response.json({ error: quota.message }, { status: quota.status })
//
//     const result = await 누끼_따기(...)                     // ② AI 호출 (fal 등)
//
//     await recordAiUsage(quota.userId, "remove-bg")          // ③ 성공했을 때만 기록
//     return Response.json({ ...result, remaining: quota.remaining - 1 })
//   }
//
// - 횟수는 한국 시간 기준 "오늘(0시~24시)" 사용량으로 셉니다.
// - DATABASE_URL 이 없는 팀원 컴퓨터에서는 제한 없이 통과해요. (기록도 안 함)
import { auth } from "@/lib/auth"
import { isDbConfigured, sql, upsertUser } from "@/lib/db"

/**
 * AI 기능 이름과 하루 사용 한도 (1인 기준)
 * ⚠️ 숫자는 임시값이에요. B 담당과 정해서 바꾸세요. 새 기능은 여기에 한 줄 추가하면 돼요.
 */
export const AI_LIMITS = {
  generate: 10, // 포스터 AI 생성
  "remove-bg": 20, // 누끼 따기 (배경 지우기)
  upscale: 10, // 사진 화질 올리기
} as const

export type AiFeature = keyof typeof AI_LIMITS

export type AiQuota =
  | { ok: true; userId: string; used: number; limit: number; remaining: number }
  | { ok: false; status: 401 | 429 | 500; message: string; used?: number; limit?: number }

/** 이 기능을 지금 쓸 수 있는지 확인 (로그인 + 오늘 남은 횟수) */
export async function checkAiQuota(feature: AiFeature): Promise<AiQuota> {
  const session = await auth()
  const user = session?.user
  if (!user?.id) return { ok: false, status: 401, message: "로그인이 필요해요." }

  const limit = AI_LIMITS[feature]
  if (!isDbConfigured()) return { ok: true, userId: user.id, used: 0, limit, remaining: limit }

  try {
    const used = await countToday(user.id, feature)
    if (used >= limit) {
      return {
        ok: false,
        status: 429,
        message: `오늘 사용할 수 있는 횟수(${limit}회)를 모두 썼어요. 내일 다시 이용해 주세요.`,
        used,
        limit,
      }
    }
    // 기록할 때 users 에 회원이 있어야 해서 미리 등록해 둬요.
    await upsertUser({ id: user.id, name: user.name, image: user.image })
    return { ok: true, userId: user.id, used, limit, remaining: limit - used }
  } catch (error) {
    console.error("AI 사용량 확인 실패", error)
    return { ok: false, status: 500, message: "잠시 후 다시 시도해 주세요." }
  }
}

/** AI 사용 1회 기록 (AI 호출이 성공했을 때 부르기) */
export async function recordAiUsage(userId: string, feature: AiFeature, detail?: string) {
  if (!isDbConfigured()) return
  try {
    await sql`
      INSERT INTO ai_usage (kakao_id, feature, detail)
      VALUES (${userId}, ${feature}, ${detail?.slice(0, 200) ?? null})`
  } catch (error) {
    // 기록 실패로 사장님 화면이 깨지지 않도록 오류만 남겨요.
    console.error("AI 사용 기록 실패", error)
  }
}

/** 오늘(한국 시간) 이 사람이 이 기능을 쓴 횟수 */
export async function countToday(userId: string, feature: AiFeature) {
  const rows = await sql`
    SELECT count(*)::int AS used FROM ai_usage
    WHERE kakao_id = ${userId} AND feature = ${feature}
      AND created_at >= (date_trunc('day', now() AT TIME ZONE 'Asia/Seoul') AT TIME ZONE 'Asia/Seoul')`
  return (rows[0]?.used as number) ?? 0
}
