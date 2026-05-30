"use client";
import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <div className="p-8">
      <div className="rounded-xl p-6" style={{ background: "#ff595915", border: "1px solid #ff595940" }}>
        <div className="font-semibold mb-2" style={{ color: "#ff5959" }}>Something went wrong</div>
        <pre className="text-xs whitespace-pre-wrap break-all mb-4" style={{ color: "#8d9ec7" }}>
          {error.message}
          {error.digest ? `\nDigest: ${error.digest}` : ""}
        </pre>
        <button onClick={reset} className="px-4 py-2 rounded-lg text-sm font-medium" style={{ background: "#3399ff", color: "#0d0f1a" }}>
          Try again
        </button>
      </div>
    </div>
  );
}
