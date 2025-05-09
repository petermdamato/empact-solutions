"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import TileContainer from "@/components/TileContainer/TileContainer";
import DateRangeSlider from "@/components/DateRangeSlider/DateRangeSlider";
import { useEffect, useState } from "react";
import "./styles.css";
import { aggregateByComparison } from "@/utils";

export default function Overview() {
  const { csvData } = useCSV();
  const [datesRange, setDatesRange] = useState(["2019-01-01", "2024-10-10"]);
  const [datesData, setDatesData] = useState([]);
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);

  useEffect(() => {
    setDatesData(csvData);
    setDataArray1([
      {
        title: "categories",
        data: aggregateByComparison(csvData, datesRange[0], datesRange[1]),
      },
      {
        title: "heatmap",
        data: csvData,
      },
    ]);
  }, [csvData, datesRange]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header title="Secure Detention Utilization" subtitle="Snapshot" />
          <div
            style={{
              position: "absolute",
              right: "10px",
              width: "30%",
              padding: "0 40px",
            }}
          >
            <DateRangeSlider
              records={datesData}
              accessor={(d) => d.Admission_Date}
              setDatesRange={setDatesRange}
            />
          </div>
          <div>
            {dataArray1 && (
              <TileContainer
                datesRange={datesRange}
                data={[
                  {
                    title: "Actual Decision Compared to DST",
                    data: dataArray1,
                    charts: ["column", "heatmap"],
                    chartTitles: [
                      "Recommended Restrictivness Compared to Actual Decision",
                      "Actual Decision Compared to DST Decision",
                    ],
                    keysArray: [[], ["Intake Decision", "DST Recommendation"]],
                  },
                ]}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
