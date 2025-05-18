"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState } from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import "./styles.css";
import {
  dataAnalysisV2,
  analyzeReasonForDetention,
} from "@/utils/aggFunctions";

export default function Overview() {
  const { csvData } = useCSV();
  const [selectedYear, setSelectedYear] = useState(2024);

  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [dataArray5, setDataArray5] = useState([]);
  const [dataArray6, setDataArray6] = useState([]);
  const [dataArray7, setDataArray7] = useState([]);

  // setDataArray1([
  //   {
  //     title: "Gender",
  //     header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
  //     body: dataAnalysisV2(
  //       csvData,
  //       "countAdmissions",
  //       selectedYear,
  //       "Gender"
  //     ),
  //   },
  // ]);

  useEffect(() => {
    setDataArray1([
      {
        title: "Gender",
        header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
        body: dataAnalysisV2(
          csvData,
          "countAdmissions",
          selectedYear,
          "Gender"
        ),
      },
    ]);
    setDataArray2([
      {
        title: "Age",
        header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
        body: dataAnalysisV2(csvData, "countAdmissions", selectedYear, "Age"),
      },
    ]);
    setDataArray3([
      {
        title: "ATD Program Type",
        header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
        body: dataAnalysisV2(
          csvData,
          "countAdmissions",
          selectedYear,
          "Facility"
        ),
      },
    ]);
    setDataArray4([
      {
        title: "Race/Ethnicity",
        header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
        body: dataAnalysisV2(
          csvData,
          "countAdmissions",
          selectedYear,
          "RaceEthnicity"
        ),
      },
    ]);
    setDataArray5([
      {
        title: "Jurisdiction",
        header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
        body: dataAnalysisV2(
          csvData,
          "countAdmissions",
          selectedYear,
          "Referral_Source"
        ),
      },
    ]);
    setDataArray6([
      {
        title: "Reason for Detention",
        header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
        body: dataAnalysisV2(
          csvData,
          "countAdmissions",
          selectedYear,
          "OffenseOverall"
        ),
      },
    ]);
    setDataArray7([
      {
        title: "Offense Category",
        header: dataAnalysisV2(csvData, "countAdmissions", selectedYear),
        body: dataAnalysisV2(
          csvData,
          "countAdmissions",
          selectedYear,
          "SimplifiedOffense"
        ),
      },
    ]);
  }, [csvData]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          {/* Header row with fixed 60px height */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: "60px",
              padding: "0 16px",
            }}
          >
            {/* Left side: Header */}
            <div style={{ flexShrink: 1 }}>
              <Header
                title="Secure Detention Utilization"
                subtitle="Admissions"
                year={2024}
              />
            </div>
          </div>

          {/* Content area */}
          <div>
            {[
              dataArray1,
              dataArray2,
              dataArray3,
              dataArray4,
              dataArray5,
              dataArray6,
              dataArray7,
            ].map((entry, index) => (
              <div key={`array-${index}`}>
                {entry.map((arr, arrIndex) => (
                  <div
                    key={`item-${arrIndex}`}
                    style={{
                      marginBottom: "20px",
                      height: "100%",
                      width: "100%",
                    }}
                  >
                    <h2>{arr.title}</h2>
                    <div>{JSON.stringify(arr.body)}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
