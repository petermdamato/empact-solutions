"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ChangeStatistics from "@/components/ChangeStatistics/ChangeStatistics";
import StackedBarChartGeneric from "@/components/StackedBar/StackedBarChartGeneric";
import ChartCard from "@/components/ChartCard/ChartCard";
import PieChart from "@/components/PieChart/PieChartV3";
import ZipMap from "@/components/ZipMap/ZipMap";
import Selector from "@/components/Selector/Selector";
import { useCSV } from "@/context/CSVContext";
import { ResponsiveContainer } from "recharts";
import {
  analyzeExits,
  dataAnalysisV2,
  dataAnalysisLOS,
  analyzeLengthByProgramType,
  analyzeLengthByDispoStatus,
} from "@/utils/aggFunctions";
import {
  chooseCategoryV2 as chooseCategory,
  chooseCategory as chooseCategoryAligned,
  categorizeRaceEthnicity,
  categorizeAge,
  categorizeYoc,
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
  const router = useRouter();
  const contentRef = useRef();
  const [selectedYear, setSelectedYear] = useState(2024);
  const [filterVariables, setFilterVariable] = useState([]);
  const [finalData, setFinalData] = useState(csvData);
  const [incarcerationType] = useState("alternative-to-detention");
  const [calculationType, setCalculationType] = useState("average");
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);
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
  const [showMap, setShowMap] = useState(false);
  const [persistMap, setPersistMap] = useState(false);

  useEffect(() => {
    if (!csvData || csvData.length === 0) {
      router.push("/upload");
    }
  }, [csvData, router]);

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

  // Pull in for the filter of types
  useEffect(() => {
    if (filterVariables.length > 0) {
      let filtered = [...csvData]; // clone csvData

      filterVariables.forEach(({ key, value }) => {
        if (key === "Race/Ethnicity") {
          if (raceType === "RaceEthnicity") {
            filtered = filtered.filter(
              (record) =>
                categorizeRaceEthnicity(record["Race"], record["Ethnicity"]) ===
                value
            );
          } else {
            filtered = filtered.filter(
              (record) =>
                categorizeYoc(record["Race"], record["Ethnicity"]) === value
            );
          }
        } else if (key === "Age") {
          filtered = filtered.filter(
            (record) => categorizeAge(record, incarcerationType) === value
          );
        } else if (
          key === "Gender" ||
          key === "Screened/not screened" ||
          key === "Facility"
        ) {
          filtered = filtered.filter((record) => record[key] === value);
        } else if (key === "Reason for Detention") {
          filtered = filtered.filter(
            (record) =>
              chooseCategoryAligned(record, key).toLowerCase() ===
              value.toLowerCase()
          );
        } else if (key === "Category") {
          filtered = filtered.filter(
            (record) =>
              chooseCategoryAligned(record, key).toLowerCase() ===
              value.toLowerCase()
          );
        } else if (key === "Pre/post-dispo filter") {
          if (value === "Pre-dispo") {
            filtered = filtered.filter(
              (record) =>
                record["Post-Dispo Stay Reason"] === null ||
                record["Post-Dispo Stay Reason"] === ""
            );
          } else {
            filtered = filtered.filter(
              (record) =>
                record["Post-Dispo Stay Reason"] &&
                record["Post-Dispo Stay Reason"].length > 0
            );
          }
        } else {
          filtered = filtered.filter(
            (record) => chooseCategory(record, key) === value
          );
        }
      });

      setFinalData(filtered);
    } else {
      setFinalData(csvData);
    }
  }, [filterVariables, csvData, raceType]);

  useEffect(() => {
    if (programType === "All Program Types") {
      setDataArray11([
        {
          title: "Statistics",
          current: analyzeExits(
            finalData,
            +selectedYear,
            "alternative-to-detention"
          ),
          previous: analyzeExits(
            finalData,
            +selectedYear - 1,
            "alternative-to-detention"
          ),
        },
      ]);
    } else {
      const intermediate = finalData.filter(
        (entry) => entry.Facility === programType
      );

      setDataArray11([
        {
          title: "Average Length of Stay",
          header: analyzeExits(intermediate, +selectedYear),
          current: analyzeExits(intermediate, +selectedYear),
        },
      ]);
    }
  }, [finalData, selectedYear, programType, filterVariables]);

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
    if (
      dataArray11.length > 0 &&
      dataArray11[0].current?.entriesByProgramType
    ) {
      const lengthByProgram = analyzeLengthByProgramType(
        finalData,
        +selectedYear,
        incarcerationType
      );
      // Set overall
      setDataArray12(
        lengthByProgram.map((entry) => {
          entry.Releases = entry.count;
          return entry;
        })
      );

      const byRaceEthnicity = Object.entries(
        dataAnalysisLOS(
          finalData,
          `${calculationType}LengthOfStay`,
          +selectedYear,
          "RaceEthnicity",
          "alternative-to-detention"
        )
      ).map(([race, values]) => {
        return {
          category: race,
          Total: values.los,
          Releases: values.count,
        };
      });

      const bySimplifiedRace = Object.entries(
        dataAnalysisLOS(
          finalData,
          `${calculationType}LengthOfStay`,
          +selectedYear,
          "RaceSimplified",
          "alternative-to-detention"
        )
      ).map(([race, values]) => {
        return {
          category: race,
          Total: values.los,
          Releases: values.count,
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
        dataAnalysisLOS(
          finalData,
          `${calculationType}LengthOfStay`,
          +selectedYear,
          "Gender",
          "alternative-to-detention"
        )
      ).map(([race, values]) => {
        return {
          category: race,
          Total: values.los,
          Releases: values.count,
        };
      });

      setDataArray14(byGender);

      const byAge = Object.entries(
        dataAnalysisLOS(
          finalData,
          `${calculationType}LengthOfStay`,
          +selectedYear,
          "Age",
          "alternative-to-detention"
        )
      ).map(([race, values]) => {
        return {
          category: race,
          Total: values.los,
          Releases: values.count,
        };
      });

      setDataArray15(byAge);

      const categories = Object.entries(
        dataAnalysisLOS(
          finalData,
          `${calculationType}LengthOfStay`,
          +selectedYear,
          "SimplifiedOffense",
          "alternative-to-detention"
        )
      ).map(([race, values]) => {
        return {
          category: race,
          Total: values.los,
          Releases: values.count,
        };
      });

      setDataArray16(categories);

      const byReasons = Object.entries(
        dataAnalysisLOS(
          finalData,
          `${calculationType}LengthOfStay`,
          +selectedYear,
          "OffenseOverall",
          "alternative-to-detention"
        )
      ).map(([race, values]) => {
        return {
          category: race,
          Total: values.los,
          Releases: values.count,
        };
      });

      setDataArray18(byReasons);

      const byJurisdiction = Object.entries(
        dataAnalysisLOS(
          finalData,
          `${calculationType}LengthOfStay`,
          +selectedYear,
          "simplifiedReferralSource",
          "alternative-to-detention"
        )
      ).map(([race, values]) => {
        return {
          category: race,
          Total: values.los,
          Releases: values.count,
        };
      });

      setDataArray17(byJurisdiction);

      const byStatus = analyzeLengthByDispoStatus(
        finalData,
        +selectedYear,
        "alternative-to-detention"
      );

      let overallArr = [];

      byStatus.forEach((status) => {
        overallArr.push({
          category: status.category,
          count: status.count,
          value:
            calculationType === "average"
              ? Math.round(status.averageLengthOfStay * 10) / 10
              : status.medianLengthOfStay,
        });
      });

      const totalSum = overallArr.reduce(
        (accumulator, currentValue) => accumulator + currentValue.count,
        0
      );

      overallArr.map((entry) => {
        entry.percentage = entry.count / totalSum;
        return entry;
      });

      setDataArray19(overallArr);

      const losByAge = dataAnalysisLOS(
        finalData,
        `${calculationType}LengthOfStay`,
        +selectedYear,
        "AgeDetail",
        "alternative-to-detention"
      );
      const losByAgeTransformed = Object.fromEntries(
        Object.entries(losByAge).map(([category, { count, los }]) => [
          category,
          los,
        ])
      );

      setDataArray20(losByAgeTransformed);

      const losByCat = dataAnalysisLOS(
        finalData,
        `${calculationType}LengthOfStay`,
        +selectedYear,
        "OffenseCategory",
        "alternative-to-detention"
      );

      const losByCatTransformed = Object.fromEntries(
        Object.entries(losByCat).map(([category, { count, los }]) => [
          category,
          los,
        ])
      );
      setDataArray21(losByCatTransformed);
    }
  }, [dataArray11, calculationType, raceType]);

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
            subtitle={`Average Length of Stay - All Programs`}
            dekWithYear={`Showing length of stay in ATDs for ${selectedYear}`}
            showFilterInstructions
          >
            <Selector
              values={yearsArray}
              variable={"Year"}
              selectedValue={selectedYear}
              setValue={setSelectedYear}
            />
            <Selector
              values={["average", "median"]}
              variable={"Calculation"}
              selectedValue={calculationType}
              setValue={setCalculationType}
            />
            <DownloadButton
              elementRef={contentRef}
              filename={`alternative-to-detention-length-of-stay-${selectedYear}.pdf`}
            />
          </Header>
        </div>

        {/* Charts */}
        <div
          style={{ display: "flex", gap: "24px", padding: "24px" }}
          ref={contentRef}
        >
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
              <div
                style={{ maxHeight: "78px", width: "100%" }}
                onMouseEnter={() => setShowMap(true)}
                onMouseLeave={() => setShowMap(!persistMap ? false : true)}
                onClick={() => {
                  setPersistMap(!persistMap);
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ChangeStatistics
                    caption={"days in ATD"}
                    data={[
                      Math.round(
                        dataArray11[0]?.current[
                          calculationType === "average"
                            ? "avgLengthOfStay"
                            : "medianLengthOfStay"
                        ] * 10
                      ) / 10,
                      Math.round(
                        dataArray11[0]?.previous[
                          calculationType === "average"
                            ? "avgLengthOfStay"
                            : "medianLengthOfStay"
                        ] * 10
                      ) / 10,
                    ]}
                    map={true}
                  />
                </ResponsiveContainer>
                <div
                  style={{
                    position: "absolute",
                    top: "185px",
                    left: "270px",
                    zIndex: 10,
                    width: "320px",
                    height: "320px",
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    display: `${showMap || persistMap ? "block" : "none"}`,
                    overflow: "hidden",
                  }}
                >
                  <ZipMap
                    persistMap={persistMap}
                    setPersistMap={setPersistMap}
                    setShowMap={setShowMap}
                    csvData={finalData}
                    selectedYear={selectedYear}
                    detentionType={incarcerationType}
                    metric={`${calculationType}LengthOfStay`}
                  />
                </div>
              </div>
            </ChartCard>

            {/* LOS by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray12.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray12}
                      breakdowns={[`${calculationType}LengthOfStay`]}
                      height={300}
                      margin={{ top: 20, right: 50, bottom: 10, left: 20 }}
                      chartTitle={"LOS by ATD Program Type"}
                      colorMapOverride={{
                        averageLengthOfStay: "#5a6b7c",
                        medianLengthOfStay: "#5a6b7c",
                      }}
                      calculationType={calculationType}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Facility"}
                      showChart={false}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* Pie Chart */}
            <ChartCard width="100%">
              <div style={{ height: "290px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart
                    records={dataArray19}
                    year={selectedYear}
                    calculationType={calculationType}
                    groupByKey={"Pre/post-dispo filter"}
                    type={"alternative-to-detention"}
                    title={"LOS by Pre/Post-Dispo"}
                    chartTitle={"LOS by Pre/Post-Dispo"}
                    filterVariables={filterVariables}
                    toggleFilter={toggleFilter}
                  />
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
              gap: "12px",
            }}
          >
            {/* LOS by Race/Ethnicity */}
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
                      ? "LOS by Race/Ethnicity"
                      : "LOS by Youth of Color vs. White"}
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
                    secondarySetValue={setFilterVariable}
                  />
                </div>
                <div style={{ height: "260px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {dataArray13.length > 0 && (
                      <StackedBarChartGeneric
                        data={dataArray13}
                        breakdowns={["Total"]}
                        height={220}
                        margin={{ top: 0, right: 50, bottom: 20, left: 20 }}
                        chartTitle={
                          raceType === "RaceEthnicity"
                            ? "LOS by Race/Ethnicity"
                            : "LOS by Race (Simplified)"
                        }
                        colorMapOverride={{
                          "Pre-dispo": "#5a6b7c",
                          Total: "#5a6b7c",
                          "Post-dispo": "#d3d3d3",
                        }}
                        calculationType={calculationType}
                        toggleFilter={toggleFilter}
                        filterVariables={filterVariables}
                        groupByKey={"Race/Ethnicity"}
                        showChart={false}
                      />
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            </ChartCard>
            {/* LOS by Gender */}
            <ChartCard width="100%">
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray14.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray14}
                      breakdowns={["Total"]}
                      height={200}
                      margin={{ top: 20, right: 50, bottom: 20, left: 20 }}
                      chartTitle={"LOS by Gender"}
                      calculationType={calculationType}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Gender"}
                      showChart={false}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* LOS by Age */}
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
                      innerBreakdowns={["Pre-dispo"]}
                      calculationType={calculationType}
                      height={200}
                      margin={{ top: 20, right: 50, bottom: 20, left: 20 }}
                      chartTitle={"LOS by Age"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Age"}
                      showChart={true}
                      innerData={dataArray20}
                      valueBreakdowns={false}
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
            {/* LOS by Reason */}
            <ChartCard width="100%">
              <div style={{ height: "180px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray18.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray18}
                      breakdowns={["Total"]}
                      innerBreakdowns={["Pre-dispo"]}
                      height={180}
                      calculationType={calculationType}
                      margin={{ top: 20, right: 50, bottom: 0, left: 20 }}
                      chartTitle={"LOS by Reason for Detention"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Reason for Detention"}
                      showChart={true}
                      innerData={dataArray21}
                      valueBreakdowns={false}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* LOS by Category */}
            <ChartCard width="100%">
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray16.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray16}
                      breakdowns={["Total"]}
                      innerBreakdowns={["Pre-dispo"]}
                      height={260}
                      calculationType={calculationType}
                      margin={{ top: 20, right: 50, bottom: 20, left: 20 }}
                      chartTitle={"LOS by Offense Category (pre-dispo)"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Category"}
                      showChart={true}
                      innerData={dataArray21}
                      valueBreakdowns={false}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* LOS by Jurisdiction */}
            <ChartCard width="100%">
              <div style={{ height: "240px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray17.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray17}
                      breakdowns={["Total"]}
                      height={240}
                      margin={{ top: 20, right: 50, bottom: 0, left: 20 }}
                      chartTitle={"LOS by Jurisdiction"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        Total: "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
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
