"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ChangeStatistics from "@/components/ChangeStatistics/ChangeStatistics";
import Selector from "@/components/Selector/Selector";
import { useCSV } from "@/context/CSVContext";
import ChartCard from "@/components/ChartCard/ChartCard";
import { ResponsiveContainer } from "recharts";
import { useEffect, useState, useRef } from "react";
import RecordsTable from "@/components/RecordsTable/RecordsTable";
import StackedBarChartGeneric from "@/components/StackedBar/StackedBarChartGeneric";
import "./styles.css";
import { analyzeExitsByYear } from "@/utils/aggFunctions";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import LegendStatic from "@/components/LegendStatic/LegendStatic";
import * as Constants from "./../../constants";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [finalData, setFinalData] = useState(csvData);
  const [filterVariable, setFilterVariable] = useState(null);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [incarcerationType] = useState("alternative-to-detention");
  const [calculationType, setCalculationType] = useState("Average");
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);

  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [dataArray5, setDataArray5] = useState([]);

  // Add keydown event handler
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setFilterVariable(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    if (filterVariable && Object.keys(filterVariable).length > 0) {
      const [key, value] = Object.entries(filterVariable)[0];
      if (key === "Facility") {
        setFinalData(
          JSON.parse(JSON.stringify(csvData)).filter(
            (record) => record[key] === value
          )
        );
      }
    } else {
      setFinalData(csvData);
    }
  }, [filterVariable, csvData]);

  useEffect(() => {
    if (programType === "All Program Types") {
      setDataArray1([
        {
          title: "Exits by Successfulness",
          header: analyzeExitsByYear(finalData, +selectedYear),
          body: analyzeExitsByYear(finalData, +selectedYear),
        },
      ]);
    } else {
      const intermediate = finalData.filter(
        (entry) => entry.Facility === programType
      );

      setDataArray1([
        {
          title: "Exits by Successfulness",
          header: analyzeExitsByYear(intermediate, +selectedYear),
          body: analyzeExitsByYear(intermediate, +selectedYear),
        },
      ]);
    }

    setDataArray5(
      programType === "All Program Types"
        ? finalData.filter((record) => {
            return (
              record.ATD_Exit_Date &&
              parseDateYear(record.ATD_Exit_Date) === +selectedYear
            );
          })
        : finalData.filter(
            (record) =>
              record.Facility === programType &&
              record.ATD_Exit_Date &&
              parseDateYear(record.ATD_Exit_Date) === +selectedYear
          )
    );
  }, [finalData, selectedYear, programType]);

  useEffect(() => {
    setYearsArray(
      [...new Set(csvData.map((obj) => parseDateYear(obj.ATD_Exit_Date)))]
        .filter((entry) => entry !== null)
        .sort((a, b) => a - b)
    );
    let programTypeArrayInt = [...new Set(finalData.map((obj) => obj.Facility))]
      .filter((entry) => entry !== null && entry !== "")
      .sort((a, b) => a - b);

    const programTypeArrayFinal = [...programTypeArrayInt, "All Program Types"];

    setProgramTypeArray(programTypeArrayFinal);
  }, [finalData]);

  useEffect(() => {
    if (dataArray1.length > 0 && dataArray1[0].body?.exitsByProgramType) {
      const byProgramType = Object.entries(
        dataArray1[0].body?.exitsByProgramType
      ).map(([program, values]) => ({
        category: program,
        ...values,
      }));
      // Set overall
      setDataArray2(byProgramType);
      let chartArray = [];
      let chartObj = {
        category: programType,
        successful: dataArray1[0].body?.successfulExits,
        unsuccessful: dataArray1[0].body?.unsuccessfulExits,
      };
      chartArray.push(chartObj);

      setDataArray3(chartArray);
      // Set LOS data
      let chartArrayLOS = [];
      let chartObjLOS = {
        category: programType,
        total:
          calculationType.toLowerCase() === "average"
            ? dataArray1[0].body?.successfulAvgLengthOfStay +
              dataArray1[0].body?.unsuccessfulAvgLengthOfStay
            : dataArray1[0].body?.successfulMedianLengthOfStay +
              dataArray1[0].body?.unsuccessfulMedianLengthOfStay,
        successful:
          calculationType.toLowerCase() === "average"
            ? Math.round(dataArray1[0].body?.successfulAvgLengthOfStay * 10) /
              10
            : Math.round(
                dataArray1[0].body?.successfulMedianLengthOfStay * 10
              ) / 10,
        unsuccessful:
          calculationType.toLowerCase() === "average"
            ? Math.round(dataArray1[0].body?.unsuccessfulAvgLengthOfStay * 10) /
              10
            : Math.round(
                dataArray1[0].body?.unsuccessfulMedianLengthOfStay * 10
              ) / 10,
      };
      chartArrayLOS.push(chartObjLOS);

      setDataArray4(chartArrayLOS);
    }
  }, [dataArray1, calculationType]);

  return (
    // Top-level container
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f5f7fa" }}
    >
      <Sidebar />

      {/* Main content area */}
      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
        ref={contentRef}
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
            title={`${
              incarcerationType === "alternative-to-detention"
                ? "ATD Utilization"
                : incarcerationType
            }`}
            subtitle={`Exits - ${programType}`}
            dekWithYear={`Showing exits to ATDs for ${selectedYear}`}
            showFilterInstructions
          >
            <Selector
              values={yearsArray}
              variable={"Year"}
              selectedValue={selectedYear}
              setValue={setSelectedYear}
            />
            <Selector
              values={programTypeArray}
              variable={"Program Type"}
              selectedValue={programType}
              setValue={setProgramType}
            />{" "}
            <DownloadButton
              elementRef={contentRef}
              filename={`alternative-to-detention-exits-${selectedYear}.pdf`}
            />
          </Header>
        </div>

        {/* Charts */}
        <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
          {/* Column 1 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Change Statistics */}
            <ChartCard width="100%">
              <div style={{ maxHeight: "60px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ChangeStatistics
                    data={[
                      dataArray1[0]?.body?.totalExits,
                      dataArray1[0]?.body?.previousTotalExits,
                    ]}
                  />
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Exits by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray2.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray2}
                      breakdowns={["unsuccessful", "successful"]}
                      height={400}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={""}
                      colorMapOverride={Constants.successColors}
                      setFilterVariable={setFilterVariable}
                      filterVariable={filterVariable}
                      groupByKey={"Facility"}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Column 2 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Success breakdown */}
            <ChartCard width="100%">
              <div style={{ height: "140px", width: "100%" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", right: "14px", top: 0 }}>
                    <LegendStatic type="success" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray3.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray3}
                      breakdowns={["unsuccessful", "successful"]}
                      height={140}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={`Exits by ${programType}`}
                      colorMapOverride={Constants.successColors}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            <Selector
              values={["Average", "Median"]}
              variable={"Calculation"}
              selectedValue={calculationType}
              setValue={setCalculationType}
            />
            {/* LOS breakdown */}
            <ChartCard width="100%">
              <div style={{ height: "140px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray4.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray4}
                      breakdowns={["unsuccessful", "successful"]}
                      height={140}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={`${calculationType} LOS by ${programType}`}
                      colorMapOverride={Constants.successColors}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Table at bottom */}
        <div style={{ height: "500px", padding: "24px", overflow: "auto" }}>
          <RecordsTable data={dataArray5} />
        </div>
      </div>
    </div>
  );
}
