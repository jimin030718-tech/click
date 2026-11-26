// 사진·로고 업로드 허가 서버 주소 (C 담당)  POST /api/upload
//
// 브라우저가 사진을 Vercel Blob 에 "직접" 올리기 전에, 여기서 허가증(토큰)을 받아 갑니다.
// (파일이 우리 서버를 거치지 않아서 큰 사진도 빠르고, 서버 용량 제한 4.5MB 에 걸리지 않아요)
//
// 허가 조건
// - 로그인한 사람만
// - 사진 파일(jpg, png, webp)만, 10MB 까지
// - 저장 위치는 photos/ 또는 logos/ 폴더만
// 필요한 비밀 값: BLOB_READ_WRITE_TOKEN (Vercel Storage > Blob 을 프로젝트에 연결하면 자동 생성)
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client"
import { NextResponse } from "next/server"
import { auth } from "@/lib/auth"

const ALLOWED_FOLDERS = ["photos/", "logos/"]

export async function POST(request: Request) {
  const body = (await request.json()) as HandleUploadBody

  try {
    const result = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => {
        const session = await auth()
        if (!session?.user?.id) throw new Error("로그인이 필요해요.")
        if (!ALLOWED_FOLDERS.some((folder) => pathname.startsWith(folder))) {
          throw new Error("저장할 수 없는 위치예요.")
        }
        return {
          allowedContentTypes: ["image/jpeg", "image/png", "image/webp"],
          maximumSizeInBytes: 10 * 1024 * 1024,
          addRandomSuffix: true, // 파일 이름 뒤에 무작위 글자를 붙여서 주소를 추측할 수 없게
          tokenPayload: session.user.id,
        }
      },
    })
    return NextResponse.json(result)
  } catch (error) {
    const message = error instanceof Error ? error.message : "업로드 허가 실패"
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
