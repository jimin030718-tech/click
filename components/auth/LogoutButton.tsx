"use client"

// 로그아웃 버튼 (C 담당)
// 브라우저 쪽 signOut 을 써야 상단 메뉴의 '내 정보' → '로그인' 이 바로 바뀝니다.
import { signOut } from "next-auth/react"

export default function LogoutButton({ className }: { className?: string }) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => signOut({ redirectTo: "/" })}
    >
      로그아웃
    </button>
  )
}
