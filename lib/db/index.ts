// DB 연결 (C 담당) — 서버 코드에서만 import 하세요. ("use client" 파일에서 쓰면 안 돼요)
// .env.local / Vercel 환경변수의 DATABASE_URL 로 Neon(Postgres)에 연결합니다.
//
// 사용 예)  const rows = await sql`SELECT * FROM users WHERE kakao_id = ${id}`
// ${ } 안의 값은 자동으로 안전하게 처리돼서, 사용자가 입력한 글자로 DB가 공격당하지 않아요.
//
// DATABASE_URL 이 없는 팀원 컴퓨터에서도 사이트는 켜지도록, 실제로 DB를 쓸 때 연결합니다.
import { neon, type NeonQueryFunction } from "@neondatabase/serverless"

export function isDbConfigured() {
  return Boolean(process.env.DATABASE_URL)
}

let client: NeonQueryFunction<false, false> | null = null

export const sql: NeonQueryFunction<false, false> = ((
  strings: TemplateStringsArray,
  ...values: unknown[]
) => {
  if (!client) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error("DATABASE_URL 이 없어요. .env.local 을 확인해 주세요.")
    client = neon(url)
  }
  return client(strings, ...values)
}) as NeonQueryFunction<false, false>

// 로그인한 사장님을 users 테이블에 등록(이미 있으면 이름·사진·마지막 로그인만 갱신)
export async function upsertUser(user: {
  id: string
  name?: string | null
  image?: string | null
}) {
  await sql`
    INSERT INTO users (kakao_id, name, image)
    VALUES (${user.id}, ${user.name ?? null}, ${user.image ?? null})
    ON CONFLICT (kakao_id) DO UPDATE
      SET name = EXCLUDED.name, image = EXCLUDED.image, last_login = now()`
}
