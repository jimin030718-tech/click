import { notFound } from "next/navigation"
import { posters } from "@/lib/posters"
import CreateScreen from "@/components/create/CreateScreen"

export function generateStaticParams() {
  return posters.map((poster) => ({ templateId: poster.id }))
}

export default async function CreateRoute({
  params,
}: {
  params: Promise<{ templateId: string }>
}) {
  const { templateId } = await params
  if (!posters.some((poster) => poster.id === templateId)) notFound()
  return <CreateScreen templateId={templateId} />
}
