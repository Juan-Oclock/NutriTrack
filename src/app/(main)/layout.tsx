import { BottomNav } from "@/components/layout/bottom-nav"
import { PermissionPrompt } from "@/components/notifications/permission-prompt"
import { SafeAreaTop } from "@/components/layout/safe-area-top"

export default function MainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-background pb-20">
      <SafeAreaTop />
      {children}
      <BottomNav />
      <PermissionPrompt />
    </div>
  )
}
