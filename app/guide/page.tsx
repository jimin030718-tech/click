"use client"

import { useRouter } from "next/navigation"
import { GuidePage } from "@/screens/GuidePage"

export default function GuideRoute() {
  const router = useRouter()
  return <GuidePage onStart={() => router.push("/new", { scroll: false })} />
}
