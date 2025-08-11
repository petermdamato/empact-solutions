"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import DateRangeSlider from "@/components/DateRangeSlider/DateRangeSlider";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import { Button } from "@mui/material";
import RecordsTableDST from "@/components/RecordsTable/RecordsTableDST";
import Heatmap from "@/components/Heatmap/Heatmap";
import TileContainerV2 from "@/components/TileContainer/TileContainerV2";
import Selector from "@/components/Selector/Selector";
import { analyzeOverridesByYear } from "@/utils/analyzeOverridesByYear";
import { analyzeOverridesByReasonByYear } from "@/utils/analyzeOverridesByReasonByYear";
import moment from "moment";
import { useEffect, useState, useRef } from "react";
import "./styles.css";

export default function Overview() {
  const { csvData } = useCSV();
  const router = useRouter();
  const contentRef = useRef();
  const [datesRange, setDatesRange] = useState(["2019-01-01", "2024-12-31"]);
  const [datesData, setDatesData] = useState([]);
  const [recordsTableObject, setRecordsTableObject] = useState(false);
  const [filterVariables, setFilterVariable] = useState([]);
  const [showScores, setShowScores] = useState("show");
  const [xKey, setXKey] = useState("DST Recommendation");
  const [filteredData, setFilteredData] = useState(datesData);
  const [selectedKey, setSelectedKey] = useState(null);
  const [autohold, setAutohold] = useState("all");
  const [dstValue, setDstValue] = useState(null);
  const [dstScoreValue, setDstScoreValue] = useState(null);
  const [decisionValue, setDecisionValue] = useState(null);
  const [timeSeriesDataPercentage, setTimeSeriesDataPercentage] = useState([]);
  const [timeSeriesDataCountByReason, setTimeSeriesDataCountByReason] =
    useState([]);

  useEffect(() => {
    if (!csvData || csvData.length === 0) {
      router.push("/detention-overview");
    }
  }, [csvData, router]);

  // Add keydown event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setFilterVariable([]);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const toggleFilter = (newFilter) => {
    setFilterVariable((prev) => {
      const exists = prev.find((f) => f.key === newFilter.key);
      if (exists) {
        return prev.filter((f) => f.key !== newFilter.key);
      } else {
        return [...prev, newFilter];
      }
    });
  };
  useEffect(() => {
    const autoholdVal = autohold === "no" ? 0 : 1;

    setDatesData(
      csvData.filter((entry) => {
        const intake = moment(entry.Intake_Date);
        const lowerDate = moment(datesRange[0]);
        const upperDate = moment(datesRange[1]);
        return (
          intake.isSameOrAfter(lowerDate, "day") &&
          intake.isSameOrBefore(upperDate, "day") &&
          (autohold === "all" || +entry["Auto_Hold"] === autoholdVal)
        );
      })
    );
  }, [datesRange, csvData, autohold, dstValue, dstScoreValue, decisionValue]);

  useEffect(() => {
    let filteredData = [...datesData];

    if (filterVariables.length > 0) {
      filterVariables.forEach(({ key, value }) => {
        if (key === "Auto_Hold") {
          const label = value === "no" ? "0" : "1";
          filteredData = filteredData.filter((record) => record[key] === label);
        } else if (key === "Override_Reason") {
          filteredData = filteredData.filter((record) =>
            record[key].includes(value)
          );
        } else {
          filteredData = filteredData.filter((record) => record[key] === value);
        }
      });
    }

    filteredData = filteredData.filter((entry) => {
      return (
        (selectedKey === null ||
          (selectedKey === "Other" &&
            entry["Override_Reason"]?.toLowerCase().includes("other")) ||
          entry["Override_Reason"] === selectedKey) &&
        (dstValue === null || entry["DST Recommendation"] === dstValue) &&
        (dstScoreValue === null || +entry["DST_Score"] === dstScoreValue) &&
        (decisionValue === null || entry["Intake Decision"] === decisionValue)
      );
    });

    setFilteredData(filteredData);
  }, [
    datesData,
    dstValue,
    dstScoreValue,
    decisionValue,
    selectedKey,
    filterVariables,
  ]);

  useEffect(() => {
    setTimeSeriesDataPercentage(analyzeOverridesByYear(csvData));
    setTimeSeriesDataCountByReason(analyzeOverridesByReasonByYear(csvData));
  }, [filteredData]);

  useEffect(() => {
    setXKey(xKey === "DST Recommendation" ? "DST_Score" : "DST Recommendation");
    setDstValue(null);
    setDstScoreValue(null);
    setDecisionValue(null);
  }, [showScores]);

  const handleGoBack = () => {
    setRecordsTableObject(false);
    setSelectedKey(null);
  };

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div
          style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}
          ref={contentRef}
        >
          <Header
            title="Secure Detention Utilization"
            subtitle="Detention Screening"
            dekWithYear="DST Recommendation Restrictiveness Compared to Actual Decision"
          >
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: "24px",
                flexWrap: "wrap",
                marginTop: "-16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  marginTop: "25px",
                }}
              >
                <h5 style={{ fontSize: "14px", margin: 0 }}>Auto Hold</h5>
                <Selector
                  values={["all", "no", "yes"]}
                  variable="calc"
                  selectedValue={autohold}
                  setValue={setAutohold}
                  labelMap={{ all: "All", no: "No", yes: "Yes" }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column" }}>
                <div
                  className="dateslider-container"
                  style={{ maxWidth: "280px", width: "100%" }}
                >
                  <DateRangeSlider
                    records={csvData}
                    accessor={(d) => d.Intake_Date}
                    setDatesRange={setDatesRange}
                  />
                </div>
                <div className="dateslider-text" style={{ display: "none" }}>
                  <span>
                    {`${new Date(datesRange[0]).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })} to ${new Date(datesRange[1]).toLocaleDateString(
                      "en-US",
                      {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }
                    )}`}
                  </span>
                </div>
              </div>
              <div style={{ marginLeft: "auto" }}>
                <DownloadButton
                  style={{ zIndex: 1 }}
                  elementRef={contentRef}
                  filename={`secure-detention-detention-screening.pdf`}
                />
              </div>
            </div>
          </Header>

          <div ref={contentRef}>
            {recordsTableObject ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                  }}
                >
                  <Button
                    variant="contained"
                    onClick={handleGoBack}
                    sx={{
                      marginBottom: "16px",
                      marginLeft: "4px",
                      alignSelf: "flex-start",
                      backgroundColor: "#333a43",
                      color: "#fff",
                      "&:hover": {
                        backgroundColor: "#4a5568",
                      },
                    }}
                  >
                    Go Back
                  </Button>
                  <span
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      lineHeight: "36px",
                      marginLeft: "8px",
                    }}
                  >
                    {filteredData.length} record
                    {filteredData.length === 1 ? "" : "s"}
                  </span>
                </div>
                <RecordsTableDST
                  data={filteredData}
                  selectedKey={selectedKey}
                  recordsTableObject={recordsTableObject}
                />
              </div>
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  flexGrow: 1,
                }}
              >
                <TileContainerV2
                  data={[
                    {
                      title: "Actual Decision Compared to DST",
                      data: filteredData,
                      charts: ["distributionStacked", "distributionV2"],
                      chartTitles: [
                        "DST Recommendation Restrictivness Compared to Actual Decision",
                        "DST Override Reason",
                      ],
                      keysArray: [
                        ["0", "1"],
                        ["0", "1"],
                      ],
                      timeSeriesDataPercentage: timeSeriesDataPercentage,
                      timeSeriesDataCountByReason: timeSeriesDataCountByReason,
                    },
                  ]}
                  selectedKey={selectedKey}
                  setSelectedKey={setSelectedKey}
                  setRecordsTableObject={setRecordsTableObject}
                  toggleFilter={toggleFilter}
                />

                <Heatmap
                  data={filteredData}
                  dataSkeleton={datesData}
                  xKey={xKey}
                  yKey="Intake Decision"
                  datesRange={datesRange}
                  chartTitle="Actual Decision Compared to DST Recommendation"
                  showScores={showScores}
                  dstValue={dstValue}
                  dstScoreValue={dstScoreValue}
                  setDstValue={setDstValue}
                  setDstScoreValue={setDstScoreValue}
                  decisionValue={decisionValue}
                  setDecisionValue={setDecisionValue}
                  setRecordsTableObject={setRecordsTableObject}
                >
                  <div
                    className="scores-display-selector"
                    style={{ display: "flex", flexDirection: "column" }}
                  >
                    <h5 style={{ fontSize: "14px", margin: 0 }}>Show Scores</h5>
                    <Selector
                      values={["show", "hide"]}
                      variable="calc"
                      selectedValue={showScores}
                      setValue={setShowScores}
                      labelMap={{ show: "Show", hide: "Hide" }}
                    />
                  </div>
                </Heatmap>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
