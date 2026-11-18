// 카카오 로그인 설정 (C 담당)
//
// - 로그인 상태는 쿠키(JWT)에 저장하고, 로그인할 때마다 회원 정보를 DB(Neon) users 테이블에 기록합니다.
// - 필요한 비밀 값 (.env.local 에만 넣고 커밋하지 않기):
//     AUTH_SECRET        로그인 쿠키 암호화용. `npx auth secret` 으로 만들 수 있음
//     AUTH_KAKAO_ID      카카오 개발자 사이트 > 앱 키 > REST API 키
//     AUTH_KAKAO_SECRET  카카오 개발자 사이트 > 보안 > Client Secret (활성화 상태 "사용함" 필수)
// - 다른 파일에서 쓰는 법:
//     서버 코드:  import { auth } from "@/lib/auth"  →  const session = await auth()
//     session?.user.id  =  카카오 고유번호 (회원 구분용. 가이드 11장 users.kakao_id)

import NextAuth from "next-auth"
import Kakao from "next-auth/providers/kakao"

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [Kakao],
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    // proxy.ts 에서 로그인이 필요한 주소(/create/...)에 들어올 때 호출됩니다.
    // false 를 돌려주면 /login?callbackUrl=원래주소 로 보내고, 로그인 후 원래 주소로 돌아옵니다.
    authorized({ auth }) {
      return Boolean(auth?.user)
    },
    // 카카오 고유번호(token.sub)를 session.user.id 로 꺼내 쓸 수 있게 합니다.
    session({ session, token }) {
      if (token.sub) session.user.id = token.sub
      return session
    },
  },
  events: {
    // 카카오 로그인에 성공하면 users 테이블에 저장(또는 갱신)합니다.
    // DB에 문제가 있어도 로그인 자체는 막지 않습니다.
    async signIn({ user }) {
      if (!user.id) return
      try {
        const { isDbConfigured, upsertUser } = await import("@/lib/db")
        if (isDbConfigured()) await upsertUser({ id: user.id, name: user.name, image: user.image })
      } catch (error) {
        console.error("회원 정보 DB 저장 실패", error)
      }
    },
  },
})
