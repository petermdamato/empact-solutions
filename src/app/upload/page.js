"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import "./styles.css";
import CSVUploader from "@/components/CSVUploader";
import { useSession, signIn, signOut } from "next-auth/react";
import LogoutButton from "@/components/LogoutButton/LogoutButton";

export default function Overview() {
  const { data: session } = useSession();

  if (session) {
    return (
      <div className="max-w-xl mx-auto mt-10">
        <div style={{ display: "flex" }}>
          <Sidebar />

          <div
            style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}
          >
            <LogoutButton />
            <Header
              title="Upload"
              subtitle=""
              caption="Files missing necessary columns will show up as errors"
              year=""
            />
            <CSVUploader />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title="Not Signed Up"
            subtitle=""
            caption="Contact jason@empactsolutions.com for pricing and login information"
            year=""
          />
          <div style={{ marginTop: "2rem", paddingLeft: "1rem" }}>
            <button
              onClick={() =>
                signIn("credentials", {
                  callbackUrl: "/",
                })
              }
              className="signin-button"
            >
              Log In
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
