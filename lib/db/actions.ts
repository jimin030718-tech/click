"use server"

// 화면에서 바로 부를 수 있는 서버 함수들 (C 담당)
// - 화면("use client") 파일에서 import 해서 await getMyBusinessInfo() 처럼 부르면 됩니다.
// - 항상 로그인한 "본인" 정보만 읽고 씁니다. (남의 kakao_id 를 넘겨받지 않아요)
import { auth } from "@/lib/auth"
import { posters } from "@/lib/posters"
import { isDbConfigured, sql, upsertUser } from "@/lib/db"
import { checkAiQuota, type AiFeature } from "@/lib/db/aiUsage"
import {
  businessInfoLimits as limits,
  isBlobUrl,
  type BusinessInfo,
  type SavedBusinessInfo,
} from "@/lib/db/types"

// 로그인한 사람 확인. 로그인 안 했거나 DB 설정이 없으면 null
async function currentUser() {
  if (!isDbConfigured()) return null
  const session = await auth()
  const user = session?.user
  if (!user?.id) return null
  return { id: user.id, name: user.name, image: user.image }
}

// ── 가게 기본정보 ─────────────────────────────

/** 내 가게 정보 불러오기. 로그인 안 했거나 저장한 적 없으면 null */
export async function getMyBusinessInfo(): Promise<SavedBusinessInfo | null> {
  const user = await currentUser()
  if (!user) return null
  const rows = await sql`
    SELECT shop_name, phone, instagram, address, hours, logo_url
    FROM business_info WHERE kakao_id = ${user.id}`
  const row = rows[0]
  if (!row) return null
  return {
    shopName: row.shop_name,
    phone: row.phone,
    instagram: row.instagram,
    address: row.address,
    hours: row.hours,
    logoUrl: row.logo_url ?? null,
  }
}

/** 내 가게 정보 저장하기 */
export async function saveMyBusinessInfo(
  input: BusinessInfo,
): Promise<{ ok: true } | { ok: false; message: string }> {
  const user = await currentUser()
  if (!user) return { ok: false, message: "로그인이 필요해요." }

  // 앞뒤 공백 정리 + 글자 수 자르기
  const clean = {} as BusinessInfo
  for (const key of Object.keys(limits) as (keyof BusinessInfo)[]) {
    clean[key] = String(input?.[key] ?? "").trim().slice(0, limits[key])
  }
  clean.instagram = clean.instagram.replace(/^@+/, "") // "@가게" → "가게"

  try {
    await upsertUser(user)
    await sql`
      INSERT INTO business_info (kakao_id, shop_name, phone, instagram, address, hours)
      VALUES (${user.id}, ${clean.shopName}, ${clean.phone}, ${clean.instagram},
              ${clean.address}, ${clean.hours})
      ON CONFLICT (kakao_id) DO UPDATE SET
        shop_name = EXCLUDED.shop_name, phone = EXCLUDED.phone,
        instagram = EXCLUDED.instagram, address = EXCLUDED.address,
        hours = EXCLUDED.hours, updated_at = now()`
    return { ok: true }
  } catch (error) {
    console.error("가게 정보 저장 실패", error)
    return { ok: false, message: "저장 중 문제가 생겼어요. 잠시 후 다시 시도해 주세요." }
  }
}

/**
 * 포스터를 만들면서 입력한 정보로 내 가게 정보 갱신하기 (2단계 '기억하기')
 * - 값이 있는 칸만 바꾸고, 빈 칸("")은 원래 저장된 값을 그대로 둡니다.
 */
export async function rememberBusinessInfo(
  input: Partial<BusinessInfo> & { logoUrl?: string },
): Promise<{ ok: boolean }> {
  const user = await currentUser()
  if (!user) return { ok: false }

  const clean = {} as BusinessInfo
  for (const key of Object.keys(limits) as (keyof BusinessInfo)[]) {
    clean[key] = String(input?.[key] ?? "").trim().slice(0, limits[key])
  }
  clean.instagram = clean.instagram.replace(/^@+/, "")
  // 로고는 우리 Blob 에 올린 주소만 받아요.
  const logoUrl = input?.logoUrl && isBlobUrl(input.logoUrl) ? input.logoUrl : null
  if (!Object.values(clean).some(Boolean) && !logoUrl) return { ok: true }

  try {
    await upsertUser(user)
    await sql`
      INSERT INTO business_info (kakao_id, shop_name, phone, instagram, address, hours, logo_url)
      VALUES (${user.id}, ${clean.shopName}, ${clean.phone}, ${clean.instagram},
              ${clean.address}, ${clean.hours}, ${logoUrl})
      ON CONFLICT (kakao_id) DO UPDATE SET
        logo_url  = COALESCE(EXCLUDED.logo_url, business_info.logo_url),
        shop_name = COALESCE(NULLIF(EXCLUDED.shop_name, ''), business_info.shop_name),
        phone     = COALESCE(NULLIF(EXCLUDED.phone, ''),     business_info.phone),
        instagram = COALESCE(NULLIF(EXCLUDED.instagram, ''), business_info.instagram),
        address   = COALESCE(NULLIF(EXCLUDED.address, ''),   business_info.address),
        hours     = COALESCE(NULLIF(EXCLUDED.hours, ''),     business_info.hours),
        updated_at = now()`
    return { ok: true }
  } catch (error) {
    console.error("가게 정보 기억하기 실패", error)
    return { ok: false }
  }
}

/** 내 정보 페이지: 로고 저장(주소) 또는 지우기(null) */
export async function saveMyLogo(url: string | null): Promise<{ ok: boolean }> {
  const user = await currentUser()
  if (!user) return { ok: false }
  if (url !== null && !isBlobUrl(url)) return { ok: false }
  try {
    await upsertUser(user)
    await sql`
      INSERT INTO business_info (kakao_id, logo_url) VALUES (${user.id}, ${url})
      ON CONFLICT (kakao_id) DO UPDATE SET logo_url = EXCLUDED.logo_url, updated_at = now()`
    return { ok: true }
  } catch (error) {
    console.error("로고 저장 실패", error)
    return { ok: false }
  }
}

// ── AI 남은 횟수 (화면 표시용) ─────────────────────────────

/** 화면에 "오늘 남은 AI 횟수"를 보여줄 때. 로그인 안 했으면 null */
export async function getMyAiQuota(feature: AiFeature) {
  const quota = await checkAiQuota(feature)
  if (!quota.ok) {
    return quota.status === 401 ? null : { used: quota.used ?? 0, limit: quota.limit ?? 0, remaining: 0 }
  }
  return { used: quota.used, limit: quota.limit, remaining: quota.remaining }
}

// ── 찜한 템플릿 ─────────────────────────────

const templateIds = new Set(posters.map((poster) => poster.id))

/** 내 찜 목록 (템플릿 id 배열). 로그인 안 했으면 null */
export async function getMyFavorites(): Promise<string[] | null> {
  const user = await currentUser()
  if (!user) return null
  const rows = await sql`
    SELECT template_id FROM favorites
    WHERE kakao_id = ${user.id} ORDER BY created_at`
  return rows.map((row) => row.template_id as string)
}

/** 찜 켜기/끄기 */
export async function setFavorite(templateId: string, saved: boolean) {
  const user = await currentUser()
  if (!user || !templateIds.has(templateId)) return
  if (saved) {
    await upsertUser(user)
    await sql`
      INSERT INTO favorites (kakao_id, template_id) VALUES (${user.id}, ${templateId})
      ON CONFLICT DO NOTHING`
  } else {
    await sql`
      DELETE FROM favorites WHERE kakao_id = ${user.id} AND template_id = ${templateId}`
  }
}

/** 이 브라우저에 있던 찜 목록을 내 계정에 합치기 (로그인 직후 한 번) */
export async function mergeFavorites(templateIdsFromBrowser: string[]) {
  const user = await currentUser()
  if (!user) return null
  const valid = [...new Set(templateIdsFromBrowser)].filter((id) => templateIds.has(id))
  if (valid.length > 0) {
    await upsertUser(user)
    await sql`
      INSERT INTO favorites (kakao_id, template_id)
      SELECT ${user.id}, unnest(${valid}::text[])
      ON CONFLICT DO NOTHING`
  }
  return getMyFavorites()
}
