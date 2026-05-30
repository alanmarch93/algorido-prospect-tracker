import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { Prospect } from "@/lib/types";
import ProspectForm from "@/components/ProspectForm";
import Link from "next/link";

export default async function EditProspectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: prospect } = await supabase.from("prospects").select("*").eq("id", id).single() as { data: Prospect };
  if (!prospect) notFound();

  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <Link href={`/prospects/${id}`} className="text-sm hover:opacity-80" style={{ color: "#3399ff" }}>← Back to Prospect</Link>
        <h1 className="text-2xl font-bold mt-3" style={{ color: "#f2f4ff" }}>Edit Prospect</h1>
        <p className="text-sm mt-1" style={{ color: "#8d9ec7" }}>{prospect.full_name} · {prospect.company_name}</p>
      </div>
      <ProspectForm prospect={prospect} />
    </div>
  );
}
