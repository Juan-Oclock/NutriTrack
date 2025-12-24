import { BottomNav } from "@/components/layout/bottom-nav"
import { PermissionPrompt } from "@/components/notifications/permission-prompt"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      {children}
      <BottomNav />
      <PermissionPrompt />
    </div>
  )
}
