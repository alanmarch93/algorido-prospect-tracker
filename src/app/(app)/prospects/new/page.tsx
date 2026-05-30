import ProspectForm from "@/components/ProspectForm";

export default function NewProspectPage() {
  return (
    <div className="p-8 max-w-2xl">
      <div className="mb-8">
        <a href="/prospects" className="text-sm hover:opacity-80" style={{ color: "#3399ff" }}>← Back to Prospects</a>
        <h1 className="text-2xl font-bold mt-3" style={{ color: "#f2f4ff" }}>Add New Prospect</h1>
        <p className="text-sm mt-1" style={{ color: "#8d9ec7" }}>Track a new potential customer for Algorido AI Market Maker Bot</p>
      </div>
      <ProspectForm />
    </div>
  );
}
