"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import "./styles.css";
import { useCSV } from "@/context/CSVContext";
import { useState, useEffect } from "react";

export default function Overview() {
  const { csvData } = useCSV();
  const [youthId, setYouthId] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setYouthId(window.location?.search.replace("?", ""));
    }
  }, []);

  return (
    // Top-level container
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f5f7fa" }}
    >
      {/* Main content area */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
      >
        {/* Header */}
        <div
          style={{
            height: "60px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Header
            title="Inmate Lookup"
            dekWithYear={`Showing info on Youth ID ${youthId}`}
          ></Header>
        </div>

        {/* Charts */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-around",
            marginTop: "100px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-around" }}>
            Inmate Here
          </div>
        </div>
      </div>
    </div>
  );
}
