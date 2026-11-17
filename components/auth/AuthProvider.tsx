"use client"

// 로그인 상태를 화면(브라우저) 어디서든 알 수 있게 해 주는 감싸개 (C 담당)
// - app/layout.tsx 에서 전체를 감쌉니다.
// - 화면 컴포넌트에서는 useSession() 으로 로그인 여부를 확인합니다.
//   예) const { data: session, status } = useSession()
// - 로그인 상태는 브라우저가 /api/auth/session 에 물어봐서 가져오므로,
//   페이지를 미리 만들어 두는 방식(정적 생성)을 그대로 유지할 수 있습니다.
import { SessionProvider } from "next-auth/react"
import type { ReactNode } from "react"

export default function AuthProvider({ children }: { children: ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>
}
