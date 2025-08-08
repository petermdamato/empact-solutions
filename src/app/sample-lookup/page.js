"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import { IconButton } from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import { useRouter } from "next/navigation";
import "./styles.css";
import { useCSV } from "@/context/CSVContext";
import { useState, useEffect } from "react";

export default function Overview() {
  const { csvData } = useCSV();
  const [youthId, setYouthId] = useState("");
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      setYouthId(window.location?.search.replace("?", "") || "961436");
    }
  }, []);

  return (
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f5f7fa" }}
    >
      {/* Optional Sidebar */}
      <Sidebar />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
          position: "relative", // For positioning the back button
          padding: "24px",
        }}
      >
        {/* Back button top-left */}
        <IconButton
          onClick={() => router.back()}
          style={{ position: "absolute", top: 16, left: 16 }}
          aria-label="Go back"
        >
          <ArrowBackIcon />
        </IconButton>

        {/* Main Centered Content */}
        <div
          style={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            color: "#333",
          }}
        >
          {/* Title + Subheading */}
          <h1 style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>
            Inmate Lookup Sample: Test
          </h1>
          <h2
            style={{
              fontSize: "1.25rem",
              fontWeight: "400",
              marginBottom: "2rem",
              color: "#555",
            }}
          >
            Visited from Youth ID {youthId}
          </h2>

          {/* Description */}
          <div style={{ maxWidth: "600px" }}>
            <p style={{ fontSize: "1rem", marginBottom: "1rem" }}>
              You clicked on an element that is designed to link to your inmate
              record lookup system, but you haven't configured a link to your
              lookup system. Return to the Youth Detention Analytics system and
              click the gear icon to access the settings, then add the link to
              your inmate record lookup system.
            </p>
            <p style={{ fontSize: "1rem" }}>
              This will allow you to easily view inmate information through the
              Detention Screening table and the Length of Stay and ATD Length of
              Stay distribution charts by clicking on each individual's record.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
