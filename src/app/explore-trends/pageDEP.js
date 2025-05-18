"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import { useEffect, useState } from "react";
import "./styles.css";
import LineChartContainer from "@/components/LineChart/LineChartContainer";

const chartConfigs = [
  {
    title: "Admissions",
    type: "count",
    header: "Admission_Date",
  },
  {
    title: "Releases",
    type: "count",
    header: "Release_Date",
  },
];

export default function Overview() {
  const { csvData } = useCSV();

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header title="Secure Detention Utilization" subtitle="Snapshot" />
          <LineChartContainer
            charts={chartConfigs}
            data={csvData}
            comparison="Pre/post-dispo filter"
          />
        </div>
      </div>
    </div>
  );
}
