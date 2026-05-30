export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ background: "#0d0f1a", minHeight: "100vh", color: "#f2f4ff" }}>
      {children}
    </div>
  );
}
