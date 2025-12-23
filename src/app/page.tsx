import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    // Check if user has completed onboarding
    const { data: profileData } = await supabase
      .from("profiles")
      .select("goal_type, height_cm, current_weight_kg")
      .eq("id", user.id)
      .single()

    const profile = profileData as { goal_type: string | null; height_cm: number | null; current_weight_kg: number | null } | null
    if (!profile?.goal_type || !profile?.height_cm || !profile?.current_weight_kg) {
      redirect("/onboarding/welcome")
    }

    redirect("/dashboard")
  }

  redirect("/login")
}
