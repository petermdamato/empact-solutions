"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState } from "react";
import "./styles.css";
import { aggregateByLos } from "@/utils";

export default function Overview() {
  const { csvData } = useCSV();

  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);

  useEffect(() => {
    setDataArray1([
      {
        title: "distribution",
        data: csvData,
      },
    ]);
  }, [csvData]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title="Secure Detention Utilization"
            subtitle="Snapshot"
            year={2024}
          />
          {dataArray1 && (
            <PillContainer
              data={[
                {
                  title: "LOS",
                  data: dataArray1,
                  charts: ["distribution"],
                  chartTitles: ["LOS Distribution"],
                  detentionType: ["secure-detention"],
                  selectedYear: [selectedYear],
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
