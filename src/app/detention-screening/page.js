"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import TileContainer from "@/components/TileContainer/TileContainer";
import DateRangeSlider from "@/components/DateRangeSlider/DateRangeSlider";
import { useEffect, useState, useRef } from "react";
import "./styles.css";
import { aggregateByComparison } from "@/utils";
import RecordsTableDST from "@/components/RecordsTable/RecordsTableDST";
import DownloadButton from "@/components/DownloadButton/DownloadButton";

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [datesRange, setDatesRange] = useState(["2019-01-01", "2024-10-10"]);
  const [datesData, setDatesData] = useState([]);
  const [dataArray1, setDataArray1] = useState([]);

  useEffect(() => {
    setDatesData(
      csvData.filter((entry) => {
        const intake = new Date(entry.Admission_Date);
        const lowerDate = new Date(datesRange[0]);
        const upperDate = new Date(datesRange[1]);
        return intake >= lowerDate && intake <= upperDate;
      })
    );
  }, [datesRange]);
  useEffect(() => {
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
          <Header
            title="Secure Detention Utilization"
            subtitle="Detention Screening"
            dekWithYear="DST Recommendation Restrictiveness Compared to Actual Decision"
          >
            <DownloadButton
              elementRef={contentRef}
              filename="secure-detention-detention-screening.pdf"
            />
          </Header>
          <div
            style={{
              position: "absolute",
              right: "10px",
              width: "30%",
              padding: "0 40px",
            }}
          >
            <DateRangeSlider
              records={csvData}
              accessor={(d) => d.Admission_Date}
              setDatesRange={setDatesRange}
            />
          </div>
          <div ref={contentRef}>
            {dataArray1 && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
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
                      keysArray: [
                        [],
                        ["Intake Decision", "DST Recommendation"],
                      ],
                    },
                  ]}
                />
                <div
                  style={{
                    flex: 1,
                    overflow: "clip",
                    marginTop: "16px",
                    maxHeight: "500px",
                  }}
                >
                  <RecordsTableDST data={datesData} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
