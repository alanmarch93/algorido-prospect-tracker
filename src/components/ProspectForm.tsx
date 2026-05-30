"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Prospect, Stage, LeadSource } from "@/lib/types";

const STAGES: Stage[] = ["Outreach","Contacted","Interested","Demo Set","Converted","Lost"];
const SOURCES: LeadSource[] = ["LinkedIn","Twitter","Referral","Cold Email","Event","Other"];

const inputStyle = {
  background: "#1e2338", border: "1px solid #2d3757", color: "#f2f4ff",
  borderRadius: 8, padding: "10px 14px", fontSize: 14, width: "100%", outline: "none",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: "#8d9ec7" }}>
        {label}{required && <span style={{ color: "#ff5959" }}> *</span>}
      </label>
      {children}
    </div>
  );
}

export default function ProspectForm({ prospect }: { prospect?: Prospect }) {
  const router = useRouter();
  const supabase = createClient();
  const isEdit = !!prospect;

  const [form, setForm] = useState({
    full_name: prospect?.full_name ?? "",
    email: prospect?.email ?? "",
    phone: prospect?.phone ?? "",
    linkedin_url: prospect?.linkedin_url ?? "",
    company_name: prospect?.company_name ?? "",
    website: prospect?.website ?? "",
    stage: prospect?.stage ?? "Outreach" as Stage,
    lead_source: prospect?.lead_source ?? "LinkedIn" as LeadSource,
    score: prospect?.score ?? 50,
    notes: prospect?.notes ?? "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(key: string, value: string | number) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setError("Not authenticated"); setLoading(false); return; }

    const payload = {
      ...form,
      user_id: user.id,
      converted_at: form.stage === "Converted" && (!prospect || prospect.stage !== "Converted")
        ? new Date().toISOString() : prospect?.converted_at ?? null,
    };

    if (isEdit) {
      const { error: err } = await supabase.from("prospects").update(payload).eq("id", prospect.id);
      if (err) { setError(err.message); setLoading(false); return; }
      // Log stage change activity
      if (form.stage !== prospect.stage) {
        await supabase.from("activities").insert({
          prospect_id: prospect.id, user_id: user.id, type: "status_change",
          title: `Stage changed to ${form.stage}`, body: `Previous stage: ${prospect.stage}`,
        });
      }
      router.push(`/prospects/${prospect.id}`);
    } else {
      const { data, error: err } = await supabase.from("prospects").insert(payload).select().single();
      if (err) { setError(err.message); setLoading(false); return; }
      await supabase.from("activities").insert({
        prospect_id: data.id, user_id: user.id, type: "created",
        title: "Prospect added to pipeline", body: `Added via prospect tracker. Stage: ${form.stage}`,
      });
      router.push(`/prospects/${data.id}`);
    }
    router.refresh();
  }

  async function handleDelete() {
    if (!prospect || !confirm("Delete this prospect? This cannot be undone.")) return;
    const supabase = createClient();
    await supabase.from("prospects").delete().eq("id", prospect.id);
    router.push("/prospects");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Contact Info */}
      <div className="rounded-xl p-6" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <div className="text-xs font-semibold mb-4" style={{ color: "#596494" }}>CONTACT INFORMATION</div>
        <div className="space-y-4">
          <Field label="Full Name" required>
            <input style={inputStyle} required value={form.full_name} onChange={e => set("full_name", e.target.value)} placeholder="e.g. Marcus Lee" />
          </Field>
          <Field label="Email Address">
            <input style={inputStyle} type="email" value={form.email} onChange={e => set("email", e.target.value)} placeholder="e.g. marcus@company.io" />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phone Number">
              <input style={inputStyle} value={form.phone} onChange={e => set("phone", e.target.value)} placeholder="+1 (415) 000-0000" />
            </Field>
            <Field label="LinkedIn / Twitter URL">
              <input style={inputStyle} value={form.linkedin_url} onChange={e => set("linkedin_url", e.target.value)} placeholder="https://linkedin.com/in/..." />
            </Field>
          </div>
        </div>
      </div>

      {/* Company */}
      <div className="rounded-xl p-6" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <div className="text-xs font-semibold mb-4" style={{ color: "#596494" }}>COMPANY DETAILS</div>
        <div className="space-y-4">
          <Field label="Company Name" required>
            <input style={inputStyle} required value={form.company_name} onChange={e => set("company_name", e.target.value)} placeholder="e.g. CryptoFlow Ltd" />
          </Field>
          <Field label="Website">
            <input style={inputStyle} value={form.website} onChange={e => set("website", e.target.value)} placeholder="https://company.io" />
          </Field>
        </div>
      </div>

      {/* Pipeline */}
      <div className="rounded-xl p-6" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <div className="text-xs font-semibold mb-4" style={{ color: "#596494" }}>PIPELINE & ACCOUNT</div>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <Field label="Stage" required>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.stage} onChange={e => set("stage", e.target.value)}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Lead Source" required>
            <select style={{ ...inputStyle, cursor: "pointer" }} value={form.lead_source} onChange={e => set("lead_source", e.target.value)}>
              {SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </Field>
        </div>
        <Field label={`Prospect Score: ${form.score}/100`}>
          <input type="range" min={0} max={100} value={form.score} onChange={e => set("score", Number(e.target.value))}
            className="w-full accent-blue-400" />
          <div className="flex justify-between text-xs mt-1" style={{ color: "#596494" }}>
            <span>0 — Cold</span><span>50 — Warm</span><span>100 — Hot</span>
          </div>
        </Field>

        {/* Value box */}
        <div className="mt-4 px-4 py-3 rounded-lg flex items-center gap-3" style={{ background: "#3399ff15", border: "1px solid #3399ff30" }}>
          <span style={{ color: "#3399ff" }}>💰</span>
          <div>
            <div className="text-sm font-semibold" style={{ color: "#3399ff" }}>Account Value: $100 USD / month</div>
            <div className="text-xs" style={{ color: "#8d9ec7" }}>Each converted prospect generates $100/month on dash.algorido.com</div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl p-6" style={{ background: "#161927", border: "1px solid #2d3757" }}>
        <Field label="Notes / Context">
          <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }}
            value={form.notes} onChange={e => set("notes", e.target.value)}
            placeholder="Add relevant notes about this prospect…"
          />
        </Field>
      </div>

      {error && (
        <div className="px-4 py-3 rounded-lg text-sm" style={{ background: "#ff595920", color: "#ff5959", border: "1px solid #ff595940" }}>{error}</div>
      )}

      <div className="flex gap-3">
        {isEdit && (
          <button type="button" onClick={handleDelete}
            className="px-4 py-2.5 rounded-lg text-sm font-medium hover:opacity-80"
            style={{ background: "#ff595920", color: "#ff5959", border: "1px solid #ff595940" }}
          >
            Delete
          </button>
        )}
        <div className="flex-1" />
        <a href={isEdit ? `/prospects/${prospect?.id}` : "/prospects"}
          className="px-6 py-2.5 rounded-lg text-sm font-medium"
          style={{ background: "#1e2338", color: "#8d9ec7", border: "1px solid #2d3757" }}
        >
          Cancel
        </a>
        <button type="submit" disabled={loading}
          className="px-6 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
          style={{ background: "#3399ff", color: "#0d0f1a", opacity: loading ? 0.7 : 1 }}
        >
          {loading ? "Saving…" : isEdit ? "Save Changes" : "+ Add Prospect"}
        </button>
      </div>
    </form>
  );
}
