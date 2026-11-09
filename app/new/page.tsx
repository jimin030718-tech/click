"use client"

import { useRouter } from "next/navigation"
import { NewDesignPage } from "@/components/screens/NewDesignPage"

export default function NewDesignRoute() {
  const router = useRouter()
  return <NewDesignPage onBrowse={() => router.push("/", { scroll: false })} />
}
