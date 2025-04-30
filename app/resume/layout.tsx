import { Toaster } from "@/components/ui/toaster"

export default function ResumeLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      {children}
      <Toaster />
    </>
  )
} 