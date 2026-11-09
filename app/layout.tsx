import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "CLICK - 딸깍 포스터",
  description:
    "Create stunning Korean posters effortlessly with a user-friendly interface that offers customizable templates and easy navigation for all design needs.",
  robots: { index: false, follow: false },
  openGraph: {
    title: "CLICK - 딸깍 포스터",
    description:
      "Create stunning Korean posters effortlessly with a user-friendly interface that offers customizable templates and easy navigation for all design needs.",
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
