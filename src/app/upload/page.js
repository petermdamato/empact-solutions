"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import "./styles.css";
import CSVUploader from "@/components/CSVUploader";

export default function Overview() {
  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />

        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
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
