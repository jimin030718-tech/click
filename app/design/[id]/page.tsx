import { notFound } from "next/navigation"
import { posters } from "@/data/posters"
import EditorScreen from "@/screens/EditorScreen"

export function generateStaticParams() {
  return posters.map((poster) => ({ id: poster.id }))
}

export default async function DesignRoute({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  if (!posters.some((poster) => poster.id === id)) notFound()
  return <EditorScreen posterId={id} />
}
