"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ChangeStatistics from "@/components/ChangeStatistics/ChangeStatistics";
import StackedBarChartGeneric from "@/components/StackedBar/StackedBarChartGeneric";
import ChartCard from "@/components/ChartCard/ChartCard";
import PieChart from "@/components/PieChart/PieChartV2";
import Selector from "@/components/Selector/Selector";
import { useCSV } from "@/context/CSVContext";
import { ResponsiveContainer } from "recharts";
import {
  dataAnalysisV3,
  analyzeDailyPopByScreenedStatus,
  analyzeDailyPopByDispoStatus,
} from "@/utils/aggFunctions";
import {
  chooseCategoryV2 as chooseCategory,
  categorizeRaceEthnicity,
  categorizeYoc,
  categorizeAge,
} from "@/utils/categories";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import "./styles.css";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [filterVariable, setFilterVariable] = useState(null);
  const [finalData, setFinalData] = useState(csvData);
  const [incarcerationType] = useState("Secure Detention");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [raceType, setRaceType] = useState("RaceEthnicity");

  const [dataArray11, setDataArray11] = useState([]);
  const [dataArray12, setDataArray12] = useState([]);
  const [dataArray13, setDataArray13] = useState([]);
  const [dataArray14, setDataArray14] = useState([]);
  const [dataArray15, setDataArray15] = useState([]);
  const [dataArray16, setDataArray16] = useState([]);
  const [dataArray17, setDataArray17] = useState([]);
  const [dataArray18, setDataArray18] = useState([]);
  const [dataArray19, setDataArray19] = useState([]);
  const [dataArray20, setDataArray20] = useState([]);
  const [dataArray21, setDataArray21] = useState([]);
  const [raceData, setRaceData] = useState([]);

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

  // Pull in for the filter of types
  useEffect(() => {
    if (filterVariable && Object.keys(filterVariable).length > 0) {
      const [key, value] = Object.entries(filterVariable)[0];
      if (key === "Race/Ethnicity") {
        if (raceType === "RaceEthnicity") {
          setFinalData(
            JSON.parse(JSON.stringify(csvData)).filter(
              (record) =>
                categorizeRaceEthnicity(record["Race"], record["Ethnicity"]) ===
                value
            )
          );
        } else {
          setFinalData(
            JSON.parse(JSON.stringify(csvData)).filter(
              (record) =>
                categorizeYoc(record["Race"], record["Ethnicity"]) === value
            )
          );
        }
      } else if (key === "Age") {
        setFinalData(
          JSON.parse(JSON.stringify(csvData)).filter((record) => {
            return categorizeAge(record, incarcerationType) === value;
          })
        );
      } else if (key === "Gender" || key === "Screened/not screened") {
        setFinalData(
          JSON.parse(JSON.stringify(csvData)).filter(
            (record) => record[key] === value
          )
        );
      } else if (key === "Pre/post-dispo filter") {
        if (value === "Pre-dispo") {
          setFinalData(
            JSON.parse(JSON.stringify(csvData)).filter(
              (record) =>
                record["Post-Dispo Stay Reason"] === null ||
                record["Post-Dispo Stay Reason"] === ""
            )
          );
        } else {
          setFinalData(
            JSON.parse(JSON.stringify(csvData)).filter(
              (record) =>
                record["Post-Dispo Stay Reason"] &&
                record["Post-Dispo Stay Reason"].length > 0
            )
          );
        }
      } else {
        setFinalData(
          JSON.parse(JSON.stringify(csvData)).filter(
            (record) => chooseCategory(record, key) === value
          )
        );
      }
    } else {
      setFinalData(csvData);
    }
  }, [filterVariable, csvData, raceType]);

  useEffect(() => {
    setDataArray11([
      {
        title: "Statistics",
        current: dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          null,
          "secure-detention"
        ).All,
        previous: dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear - 1,
          null,
          "secure-detention"
        ).All,
      },
    ]);
  }, [finalData, selectedYear, filterVariable]);

  useEffect(() => {
    setYearsArray(
      [...new Set(csvData.map((obj) => parseDateYear(obj.Admission_Date)))]
        .filter((entry) => entry !== null)
        .sort((a, b) => a - b)
    );
  }, [csvData]);

  useEffect(() => {
    if (dataArray11.length > 0 && dataArray11[0].current) {
      const byRaceEthnicity = Object.entries(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "RaceEthnicity",
          "secure-detention"
        )
      ).map(([race, value]) => {
        return {
          category: race,
          "Pre-dispo": value,
        };
      });

      const bySimplifiedRace = Object.entries(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "RaceSimplified",
          "secure-detention"
        )
      ).map(([race, value]) => {
        return {
          category: race,
          "Pre-dispo": value,
        };
      });

      setRaceData({
        RaceEthnicity: byRaceEthnicity,
        RaceSimplified: bySimplifiedRace,
      });

      // Set current race data based on selected view
      setDataArray13(
        raceType === "RaceEthnicity" ? byRaceEthnicity : bySimplifiedRace
      );

      const byGender = Object.entries(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "Gender",
          "secure-detention"
        )
      ).map(([gender, value]) => {
        return {
          category: gender,
          "Pre-dispo": value,
        };
      });

      setDataArray14(byGender);

      const byAge = Object.entries(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "Age",
          "secure-detention"
        )
      ).map(([age, value]) => {
        return {
          category: age,
          "Pre-dispo": value,
        };
      });

      setDataArray15(byAge);

      const categories = Object.entries(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "SimplifiedOffense",
          "secure-detention"
        )
      ).map(([cat, value]) => {
        return {
          category: cat,
          "Pre-dispo": value,
        };
      });

      setDataArray16(categories);

      const byReasons = Object.entries(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "OffenseOverall",
          "secure-detention"
        )
      ).map(([cat, value]) => {
        return {
          category: cat,
          "Pre-dispo": value,
        };
      });

      setDataArray18(byReasons);

      const byJurisdiction = Object.entries(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "simplifiedReferralSource",
          "secure-detention"
        )
      ).map(([cat, value]) => {
        return {
          category: cat,
          "Pre-dispo": value,
        };
      });

      setDataArray17(byJurisdiction);

      const byDispoStatus = Object.entries(
        analyzeDailyPopByDispoStatus(
          finalData,
          +selectedYear,
          "secure-detention"
        )
      ).map(([dispStatus, value]) => {
        return {
          category: dispStatus,
          value: Math.round(value * 10) / 10,
        };
      });

      const totalSum = byDispoStatus.reduce(
        (accumulator, currentValue) => accumulator + currentValue.value,
        0
      );

      byDispoStatus.map((entry) => {
        entry.percentage = entry.value / totalSum;
        return entry;
      });

      setDataArray19(byDispoStatus);

      const byScreenedStatus = Object.entries(
        analyzeDailyPopByScreenedStatus(
          finalData,
          +selectedYear,
          "secure-detention"
        )
      ).map(([scrStatus, value]) => {
        return {
          category: scrStatus,
          value: Math.round(value * 10) / 10,
        };
      });

      const totalSumScreened = byScreenedStatus.reduce(
        (accumulator, currentValue) => accumulator + currentValue.value,
        0
      );

      byScreenedStatus.map((entry) => {
        entry.percentage = entry.value / totalSum;
        return entry;
      });

      setDataArray12(byScreenedStatus);

      setDataArray20(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "AgeDetail",
          "secure-detention"
        )
      );

      setDataArray21(
        dataAnalysisV3(
          finalData,
          "averageDailyPopulation",
          +selectedYear,
          "OffenseCategory",
          "secure-detention"
        )
      );
    }
  }, [dataArray11, raceType]);

  // Update dataArray13 when raceType changes
  useEffect(() => {
    if (raceData[raceType]) {
      setDataArray13(raceData[raceType]);
    }
  }, [raceType, raceData]);

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
            title={`${incarcerationType} Utilization`}
            subtitle={`Average Daily Population`}
            dekWithYear={`Showing ADP in secure detention for ${selectedYear}`}
            showFilterInstructions
          >
            <Selector
              values={yearsArray}
              variable={"Year"}
              selectedValue={selectedYear}
              setValue={setSelectedYear}
            />
            <DownloadButton
              elementRef={contentRef}
              filename={`secure-detention-average-daily-population-${selectedYear}.pdf`}
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
              gap: "12px",
            }}
          >
            {/* Change Statistics */}
            <ChartCard width="100%">
              <div style={{ maxHeight: "60px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ChangeStatistics
                    caption="avg. daily pop."
                    data={[
                      Math.round(dataArray11[0]?.current * 10) / 10,
                      dataArray11[0]?.previous,
                    ]}
                  />
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* ADP by Screened Type */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <PieChart
                  records={dataArray12}
                  year={selectedYear}
                  groupByKey={"Screened/not screened"}
                  type={"secure-detention"}
                  chartTitle={"ADP by screened/not screened"}
                  setFilterVariable={setFilterVariable}
                  filterVariable={filterVariable}
                />
              </div>
            </ChartCard>
            {/* Pie Chart */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <PieChart
                  records={dataArray19}
                  year={selectedYear}
                  groupByKey={"Pre/post-dispo filter"}
                  type={"secure-detention"}
                  chartTitle={"ADP by Pre/Post-Dispo"}
                  setFilterVariable={setFilterVariable}
                  filterVariable={filterVariable}
                />
              </div>
            </ChartCard>
          </div>

          {/* Column 2 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >
            {/* ADP by Race/Ethnicity */}
            <ChartCard width="100%">
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "270px",
                  width: "100%",
                }}
              >
                {/* Selector for race display type */}
                <div
                  style={{
                    marginBottom: "6px",
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "0 4px 0 4px",
                  }}
                >
                  <h5 style={{ fontSize: "14px" }}>
                    {raceType === "RaceEthnicity"
                      ? "ADP by Race/Ethnicity"
                      : "ADP by Youth of Color vs. White"}
                  </h5>
                  <Selector
                    values={["RaceEthnicity", "RaceSimplified"]}
                    variable={"calc"}
                    selectedValue={raceType}
                    setValue={setRaceType}
                    labelMap={{
                      RaceEthnicity: "Race/Ethnicity",
                      RaceSimplified: "YOC/White",
                    }}
                  />
                </div>
                <div style={{ height: "270px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {dataArray13.length > 0 && (
                      <StackedBarChartGeneric
                        data={dataArray13}
                        breakdowns={["Total"]}
                        height={220}
                        margin={{ top: 0, right: 60, bottom: 20, left: 20 }}
                        chartTitle={""}
                        colorMapOverride={{
                          "Pre-dispo": "#5a6b7c",
                          Total: "#5a6b7c",
                          "Post-dispo": "#d3d3d3",
                        }}
                        setFilterVariable={setFilterVariable}
                        filterVariable={filterVariable}
                        groupByKey={"Race/Ethnicity"}
                        showChart={false}
                      />
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartCard>
            {/* ADP by Gender */}
            <ChartCard width="100%">
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray14.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray14}
                      breakdowns={["Total"]}
                      height={200}
                      margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Gender"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      setFilterVariable={setFilterVariable}
                      filterVariable={filterVariable}
                      groupByKey={"Gender"}
                      showChart={false}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* ADP by Age */}
            <ChartCard width="100%">
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray15.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray15.filter(
                        (entry) =>
                          entry.category !== "null" &&
                          entry.category !== "Unknown"
                      )}
                      breakdowns={["Total"]}
                      height={200}
                      margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Age"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      setFilterVariable={setFilterVariable}
                      filterVariable={filterVariable}
                      groupByKey={"Age"}
                      showChart={true}
                      innerData={dataArray20}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
          {/* Column 3 */}
          <div
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              gap: "4px",
            }}
          >
            {/* ADP by Reason */}
            <ChartCard width="100%">
              <div style={{ height: "180px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray18.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray18}
                      breakdowns={["Total"]}
                      height={180}
                      margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Reason for Detention"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      setFilterVariable={setFilterVariable}
                      filterVariable={filterVariable}
                      groupByKey={"Reason for Detention"}
                      showChart={true}
                      innerData={dataArray21}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* ADP by Category */}
            <ChartCard width="100%">
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray16.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray16}
                      breakdowns={["Total"]}
                      height={260}
                      margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Offense Category (pre-dispo)"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                      }}
                      setFilterVariable={setFilterVariable}
                      filterVariable={filterVariable}
                      groupByKey={"Category"}
                      showChart={true}
                      innerData={dataArray21}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* ADP by Jurisdiction */}
            <ChartCard width="100%">
              <div style={{ height: "250px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray17.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray17}
                      breakdowns={["Total"]}
                      height={250}
                      margin={{ top: 20, right: 60, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Jurisdiction"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      setFilterVariable={setFilterVariable}
                      filterVariable={filterVariable}
                      groupByKey={"Jurisdiction"}
                      showChart={false}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}
