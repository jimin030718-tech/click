"use client"

import dynamic from "next/dynamic"

// 기존 Vite 버전과 똑같이 브라우저에서만 화면을 그립니다.
// (App이 처음 그릴 때 localStorage의 '찜' 목록을 읽기 때문에,
//  서버에서 미리 그리면 화면이 어긋날 수 있어요.)
const App = dynamic(() => import("@/App"), { ssr: false })

export default function ClientApp() {
  return <App />
}
