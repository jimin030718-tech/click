// 카카오 로그인 서버 주소 (C 담당)
// 카카오에서 로그인을 마치면 /api/auth/callback/kakao 로 돌아옵니다.
// → 카카오 개발자 사이트의 Redirect URI 에 이 주소를 등록해야 합니다.
import { handlers } from "@/lib/auth"

export const { GET, POST } = handlers
