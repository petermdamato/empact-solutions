"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import "./styles.css";
import CSVUploader from "@/components/CSVUploader";
import LogoutButton from "@/components/LogoutButton/LogoutButton";

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
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <LogoutButton />
          <Header
            title="Upload"
            subtitle=""
            caption="Files missing necessary columns will show up as errors"
            year=""
          />
          {status === "loading" ? <div>Loading...</div> : <CSVUploader />}
        </div>
      </div>
    </div>
  );
}
