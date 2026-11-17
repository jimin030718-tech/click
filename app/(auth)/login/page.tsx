// /login  카카오 로그인 페이지 (C 담당)
//
// - 템플릿을 고르면 proxy.ts 가 로그인 안 된 사람을 /login?callbackUrl=/create/템플릿id 로 보냅니다.
// - 로그인을 마치면 callbackUrl(원래 가려던 주소)로 돌아갑니다.
// - 그냥 /login 으로 들어오면 지금 로그인 상태와 로그아웃 버튼을 보여줍니다.
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth, signIn } from "@/lib/auth"
import LogoutButton from "@/components/auth/LogoutButton"
import styles from "./login.module.css"

export const metadata: Metadata = {
  title: "로그인 - 딸깍 포스터",
}

// 돌아갈 주소에서 "경로 부분"(/create/... 등)만 꺼냅니다.
// proxy.ts 는 http://localhost:3000/create/... 처럼 전체 주소를 넘기기 때문에, 앞의 사이트 주소는 버리고 경로만 씁니다.
// 경로만 쓰니까 다른 사이트(https://evil.com 등)로 보내는 주소가 와도 우리 사이트 안에서만 이동합니다.
function safeCallbackUrl(value: string | string[] | undefined) {
  const raw = Array.isArray(value) ? value[0] : value
  if (!raw) return null
  try {
    const url = new URL(raw, "http://localhost")
    const path = url.pathname + url.search
    if (path.startsWith("//") || path === "/" || path.startsWith("/login")) return null
    return path
  } catch {
    return null
  }
}

const errorMessages: Record<string, string> = {
  Configuration: "로그인 설정에 문제가 있어요. 잠시 후 다시 시도해 주세요.",
  AccessDenied: "카카오 로그인 동의가 취소되었어요. 다시 시도해 주세요.",
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const callbackUrl = safeCallbackUrl(params.callbackUrl)
  const errorCode = Array.isArray(params.error) ? params.error[0] : params.error
  const session = await auth()

  // 이미 로그인했고 가려던 곳이 있으면 바로 보냅니다.
  if (session?.user && callbackUrl) redirect(callbackUrl)

  async function loginWithKakao() {
    "use server"
    await signIn("kakao", { redirectTo: callbackUrl ?? "/" })
  }

  return (
    <main className={styles.page}>
      <section className={styles.card}>
        {session?.user ? (
          <>
            <span className={styles.kicker}>로그인됨</span>
            <h1 className={styles.title}>
              {session.user.name ?? "사장"}님, 반가워요
            </h1>
            <p className={styles.desc}>카카오 계정으로 로그인되어 있어요.</p>
            <div className={styles.actions}>
              <Link href="/mypage" className={styles.primary}>
                내 정보 보기
              </Link>
              <LogoutButton className={styles.secondary} />
            </div>
          </>
        ) : (
          <>
            <span className={styles.kicker}>딸깍 포스터 시작하기</span>
            <h1 className={styles.title}>
              카카오로 3초 만에
              <br />
              포스터를 만들어 보세요
            </h1>
            <p className={styles.desc}>
              한 번 로그인하면 가게 정보는 다음부터 자동으로 채워드려요.
            </p>

            {errorCode && (
              <p className={styles.error} role="alert">
                {errorMessages[errorCode] ?? "로그인 중 문제가 생겼어요. 다시 시도해 주세요."}
              </p>
            )}

            <form action={loginWithKakao}>
              <button type="submit" className={styles.kakao}>
                <svg
                  className={styles.kakaoIcon}
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M12 3C6.48 3 2 6.54 2 10.9c0 2.8 1.86 5.27 4.66 6.67l-.95 3.48c-.08.3.26.54.52.37l4.14-2.74c.53.07 1.07.11 1.63.11 5.52 0 10-3.54 10-7.9S17.52 3 12 3z" />
                </svg>
                카카오로 시작하기
              </button>
            </form>

            <Link href="/" className={styles.back}>
              템플릿 먼저 구경하기
            </Link>
          </>
        )}
      </section>
    </main>
  )
}
