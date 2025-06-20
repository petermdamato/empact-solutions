"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import "./styles.css";
import CSVUploader from "@/components/CSVUploader";
import LogoutButton from "@/components/LogoutButton/LogoutButton";
import { useLinkOut } from "@/context/LinkOutContext";

export default function Overview() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { linkOut, setLinkOut } = useLinkOut();
  const [inputValue, setInputValue] = useState("");

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

  const handleSave = () => {
    setLinkOut(inputValue);
  };

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
          <div
            style={{
              marginBottom: "1rem",
              padding: "1rem",
              maxWidth: "500px",
            }}
          >
            <label htmlFor="linkInput">
              Enter link out (This is the prefix attached to offense record
              links):
            </label>
            <input
              id="linkInput"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Paste your link here"
              style={{
                width: "100%",
                padding: "0.5rem",
                marginTop: "0.5rem",
                marginBottom: "0.5rem",
                border: "1px solid #ccc",
                backgroundColor: "white",
                color: "black",
                borderRadius: "4px",
              }}
            />
            <div style={{ display: "flex" }}>
              {" "}
              <button
                onClick={handleSave}
                style={{
                  padding: "0.5rem 1rem",
                  backgroundColor: "#333a43",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Save
              </button>
              {linkOut && (
                <p
                  style={{
                    marginTop: "0.5rem",
                    marginLeft: "16px",
                    color: "#555",
                  }}
                >
                  Saved link: <strong>{linkOut}</strong>
                </p>
              )}
            </div>
          </div>
          {status === "loading" ? <div>Loading...</div> : <CSVUploader />}
        </div>
      </div>
    </div>
  );
}
