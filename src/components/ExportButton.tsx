"use client";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function ExportButton() {
  const [loading, setLoading] = useState(false);

  async function handleExport() {
    setLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from("prospects")
      .select("*")
      .order("created_at", { ascending: false });

    if (!data || data.length === 0) {
      alert("No prospects to export.");
      setLoading(false);
      return;
    }

    const headers = [
      "Full Name", "Email", "Phone", "Company", "Website",
      "Stage", "Lead Source", "Score", "Amount Invested (USD)",
      "Notes", "Converted On", "Added On",
    ];

    const rows = data.map(p => [
      p.full_name ?? "",
      p.email ?? "",
      p.phone ?? "",
      p.company_name ?? "",
      p.website ?? "",
      p.stage ?? "",
      p.lead_source ?? "",
      p.score ?? "",
      p.amount_invested ?? "",
      (p.notes ?? "").replace(/\n/g, " "),
      p.converted_at ? new Date(p.converted_at).toLocaleDateString() : "",
      p.created_at ? new Date(p.created_at).toLocaleDateString() : "",
    ]);

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `algorido-prospects-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setLoading(false);
  }

  return (
    <button
      onClick={handleExport}
      disabled={loading}
      className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-opacity hover:opacity-80"
      style={{ background: "#22d68d20", color: "#22d68d", border: "1px solid #22d68d40", opacity: loading ? 0.7 : 1 }}
    >
      {loading ? "⏳ Exporting…" : "⬇ Export CSV"}
    </button>
  );
}
