import { Toaster } from "@/components/ui/toaster"

export const metadata = {
  title: "Resume Editor",
  description: "Create and customize your professional resume"
}

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