// DB 테이블 만들기 (C 담당)
// 실행: npm run db:setup   (.env.local 의 DATABASE_URL 을 사용)
// schema.sql 을 읽어서 문장(;)마다 하나씩 실행합니다.
import { readFileSync } from "node:fs"
import { neon } from "@neondatabase/serverless"

const url = process.env.DATABASE_URL
if (!url) {
  console.error("DATABASE_URL 이 없어요. .env.local 을 확인해 주세요.")
  process.exit(1)
}

const sql = neon(url)
const schema = readFileSync(new URL("./schema.sql", import.meta.url), "utf8")
const statements = schema
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n")
  .split(";")
  .map((s) => s.trim())
  .filter(Boolean)

for (const statement of statements) {
  await sql.query(statement)
  console.log("✓", statement.split("(")[0].trim())
}

const tables = await sql`
  SELECT table_name FROM information_schema.tables
  WHERE table_schema = 'public' ORDER BY table_name`
console.log("지금 있는 테이블:", tables.map((t) => t.table_name).join(", "))
