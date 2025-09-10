"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Header from "@/components/Header/Header";
import "./styles.css";
import CSVUploader from "@/components/CSVUploader";

export default function Overview() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // Still loading
    if (!session) {
      router.push("/api/auth/signin");
    }
  }, [session, status, router]);

  // Don't render anything if not authenticated (redirect will happen)
  if (!session) {
    return null;
  }

  return (
    <div>
      <div style={{ display: "flex" }}>
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title="Import"
            subtitle=""
            caption="Add your organization's detention statistics file in CSV or Excel format"
            year=""
          />
          {status === "loading" ? <div>Loading...</div> : <CSVUploader />}
        </div>
      </div>
    </div>
  );
}
