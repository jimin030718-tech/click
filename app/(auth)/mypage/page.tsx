// /mypage  내 정보 페이지 (C 담당)
//
// - 로그인한 사람만 볼 수 있어요. 로그인 안 했으면 /login 으로 보낸 뒤 다시 여기로 돌아옵니다.
// - 카카오 프로필, 가게 기본정보(다음 작업에서 DB 연결), 찜한 템플릿 바로가기, 로그아웃을 보여줍니다.
import type { Metadata } from "next"
import Link from "next/link"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import LogoutButton from "@/components/auth/LogoutButton"
import { getMyBusinessInfo } from "@/lib/db/actions"
import { emptyBusinessInfo } from "@/lib/db/types"
import BusinessInfoForm from "./BusinessInfoForm"
import LogoUploader from "./LogoUploader"
import styles from "./mypage.module.css"

export const metadata: Metadata = {
  title: "내 정보 - 딸깍 포스터",
}

export default async function MyPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?callbackUrl=/mypage")

  const { name, image } = session.user
  const businessInfo = await getMyBusinessInfo().catch(() => null)

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>내 정보</h1>

      {/* 카카오 프로필 */}
      <section className={styles.card}>
        <div className={styles.profile}>
          {image ? (
            // 카카오 프로필 사진 (외부 주소라 일반 img 사용)
            <img className={styles.avatar} src={image} alt="" />
          ) : (
            <span className={styles.avatarEmpty} aria-hidden="true">
              {(name ?? "사").slice(0, 1)}
            </span>
          )}
          <div>
            <p className={styles.name}>{name ?? "사장"}님</p>
            <p className={styles.sub}>
              <span className={styles.kakaoDot} aria-hidden="true" />
              카카오 계정으로 로그인됨
            </p>
          </div>
        </div>
      </section>

      {/* 가게 기본정보 — DB(business_info)에 저장 */}
      <section className={styles.card}>
        <div className={styles.cardHead}>
          <h2 className={styles.cardTitle}>가게 기본정보</h2>
          <span className={styles.badge}>모두 선택</span>
        </div>
        <p className={styles.desc}>
          저장해 두면 포스터를 만들 때 &lsquo;내 가게 정보 불러오기&rsquo;로 한 번에 채워져요.
        </p>
        {/* 로고는 고르는 즉시 저장, 아래 글자 칸은 '저장하기' 버튼으로 저장 */}
        <LogoUploader initialUrl={businessInfo?.logoUrl ?? null} />
        <BusinessInfoForm initial={businessInfo ?? emptyBusinessInfo} />
      </section>

      {/* 바로가기 */}
      <section className={styles.card}>
        <Link href="/saved" className={styles.row}>
          <span>찜한 템플릿</span>
          <span aria-hidden="true">→</span>
        </Link>
        <Link href="/" className={styles.row}>
          <span>템플릿 보러 가기</span>
          <span aria-hidden="true">→</span>
        </Link>
      </section>

      <LogoutButton className={styles.logout} />
    </main>
  )
}
