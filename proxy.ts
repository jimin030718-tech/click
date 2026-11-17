// 🔒 공용 파일 — 고치기 전에 팀에 먼저 공유하기
//
// 페이지가 열리기 전에 로그인 여부를 확인합니다. (Next.js 16에서 middleware.ts 의 새 이름)
// 템플릿을 고른 뒤(/create/...)에만 로그인을 요구하고, 홈·찜·이용 안내는 로그인 없이 볼 수 있습니다.
// 로그인이 안 돼 있으면 /login?callbackUrl=원래주소 로 보내고, 로그인 후 원래 주소로 돌아옵니다.
export { auth as proxy } from "@/lib/auth"

export const config = {
  matcher: ["/create/:path*"],
}
