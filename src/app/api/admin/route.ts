import { createClient } from "@/lib/supabase/server";
import { createClient as createServiceClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { data: profile } = await supabase
      .from("profiles").select("is_admin").eq("id", user.id).single();
    if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: "SUPABASE_SERVICE_ROLE_KEY not set" }, { status: 500 });
    }

    const service = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const [{ data: prospects }, { data: profiles }] = await Promise.all([
      service.from("prospects").select("*").order("created_at", { ascending: false }),
      service.from("profiles").select("*"),
    ]);

    // Find users who have prospects but no profile row
    const allProspects = prospects ?? [];
    const allProfiles = profiles ?? [];
    const profileIds = new Set(allProfiles.map((p: { id: string }) => p.id));
    const missingUserIds = [...new Set(
      allProspects
        .map((p: { user_id: string }) => p.user_id)
        .filter((id: string) => !profileIds.has(id))
    )];

    // Fetch missing users from auth.users using service role
    const missingProfiles = [];
    for (const userId of missingUserIds) {
      const { data: authUser } = await service.auth.admin.getUserById(userId);
      if (authUser?.user) {
        missingProfiles.push({
          id: authUser.user.id,
          email: authUser.user.email ?? "unknown",
          is_admin: false,
        });
        // Also insert into profiles so future loads work
        await service.from("profiles").upsert({
          id: authUser.user.id,
          email: authUser.user.email ?? "unknown",
          is_admin: false,
        }, { onConflict: "id" });
      }
    }

    return NextResponse.json({
      prospects: allProspects,
      profiles: [...allProfiles, ...missingProfiles],
    });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
