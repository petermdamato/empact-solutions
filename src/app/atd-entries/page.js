"use client";

import { useEffect, useState, useRef } from "react";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ChangeStatistics from "@/components/ChangeStatistics/ChangeStatistics";
import StackedBarChartGeneric from "@/components/StackedBar/StackedBarChartGeneric";
import ChartCard from "@/components/ChartCard/ChartCard";
import PieChart from "@/components/PieChart/PieChartV2";
import Selector from "@/components/Selector/Selector";
import ZipMap from "@/components/ZipMap/ZipMap";
import { useCSV } from "@/context/CSVContext";
import { ResponsiveContainer } from "recharts";
import {
  analyzeAdmissionsOnly,
  analyzeEntriesByYear,
  dataAnalysisV2,
} from "@/utils/aggFunctions";
import {
  chooseCategory,
  categorizeRaceEthnicity,
  categorizeYoc,
  categorizeAge,
} from "@/utils/categories";
import { offenseMap } from "@/utils/categorizationUtils";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import "./styles.css";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

const groupReasons = (data) => {
  const result = {
    "New Offense": {},
    Technical: {},
  };

  for (const [label, counts] of Object.entries(data)) {
    let group;
    group = offenseMap[label]
      ? offenseMap[label]
      : label.toLowerCase().includes("misdemeanor") ||
        label.toLowerCase().includes("felony")
      ? "New Offense"
      : label.toLowerCase().includes("other")
      ? "Other"
      : label;

    if (!result[group]) result[group] = {};

    // Sum counts into group-level counts
    for (const [dispo, count] of Object.entries(counts)) {
      result[group][dispo] = (result[group][dispo] || 0) + count;
    }
  }

  return result;
};

const groupOffenseCategories = (data) => {
  const result = {
    Felonies: {},
    Misdemeanors: {},
    "Status Offense": {},
    Technicals: {},
  };

  for (const [label, counts] of Object.entries(data)) {
    let group;
    const lower = label.toLowerCase();

    if (lower.includes("felony")) {
      group = "Felonies";
    } else if (lower.includes("misdemeanor")) {
      group = "Misdemeanors";
    } else if (label === "Status Offense") {
      group = "Status Offense";
    } else {
      group = "Technicals";
    }

    if (!result[group]) result[group] = {};

    // Sum counts into group-level counts
    for (const [dispo, count] of Object.entries(counts)) {
      result[group][dispo] = (result[group][dispo] || 0) + count;
    }
  }

  return result;
};

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [finalData, setFinalData] = useState(csvData);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [incarcerationType] = useState("alternative-to-detention");
  const [calculationType, setCalculationType] = useState("average");
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);
  const [filterVariables, setFilterVariable] = useState([]);
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
              chooseCategory(record, key).toLowerCase() === value.toLowerCase()
          );
        } else if (key === "Category") {
          filtered = filtered.filter(
            (record) =>
              chooseCategory(record, key).toLowerCase() === value.toLowerCase()
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
          title: "Entries by Successfulness",
          header: analyzeEntriesByYear(
            finalData,
            +selectedYear,
            "alternative-to-detention"
          ),
          body: analyzeEntriesByYear(
            finalData,
            +selectedYear,
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
          title: "Entries by Successfulness",
          header: analyzeEntriesByYear(intermediate, +selectedYear),
          body: analyzeEntriesByYear(intermediate, +selectedYear),
        },
      ]);
    }
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
    if (dataArray11.length > 0 && dataArray11[0].body?.entriesByProgramType) {
      const byProgramType = Object.entries(
        dataArray11[0].body?.entriesByProgramType
      ).map(([program, values]) => ({
        category: program,
        ...values,
      }));

      setDataArray12(byProgramType);

      const detData = analyzeAdmissionsOnly(
        finalData,
        +selectedYear,
        "alternative-to-detention"
      );

      // Set race/ethnicity data for both views
      const detailedRaceData = Object.entries(
        detData.byGroup.RaceEthnicity
      ).map(([race, values]) => ({
        category: race,
        ...values,
      }));

      const simplifiedRaceData = Object.entries(
        detData.byGroup.RaceSimplified
      ).map(([race, values]) => ({
        category: race,
        ...values,
      }));

      setRaceData({
        RaceEthnicity: detailedRaceData,
        RaceSimplified: simplifiedRaceData,
      });

      // Set current race data based on selected view
      setDataArray13(
        raceType === "RaceEthnicity" ? detailedRaceData : simplifiedRaceData
      );

      const byGender = Object.entries(detData.byGroup.Gender).map(
        ([gender, values]) => ({
          category: gender,
          ...values,
        })
      );

      setDataArray14(byGender);

      const byAge = Object.entries(detData.byGroup.AgeBracket).map(
        ([age, values]) => ({
          category: age,
          ...values,
        })
      );

      setDataArray15(byAge);

      const categories = groupOffenseCategories(
        detData.byGroup.OffenseCategory
      );
      const byOffenseCategory = Object.entries(categories).map(
        ([offense, values]) => ({
          category: offense,
          ...values,
        })
      );

      setDataArray16(byOffenseCategory);

      const byReasons = groupReasons(detData.byGroup.OffenseCategory);
      const groupedByReasons = Object.entries(byReasons).map(
        ([offense, values]) => ({
          category: offense,
          ...values,
        })
      );

      setDataArray18(groupedByReasons);

      const byJurisdiction = Object.entries(
        dataAnalysisV2(
          finalData,
          `countAdmissions`,
          +selectedYear,
          "simplifiedReferralSource",
          "alternative-to-detention"
        )
      ).map(([category, values]) => {
        return {
          category: category,
          ...values,
        };
      });

      setDataArray17(byJurisdiction);

      let overallArr = [];

      Object.keys(detData.overall).forEach((source) => {
        overallArr.push({
          category: source,
          value: detData.overall[source],
        });
      });
      const totalSum = overallArr.reduce(
        (accumulator, currentValue) => accumulator + currentValue.value,
        0
      );

      overallArr.map((entry) => {
        entry.percentage = entry.value / totalSum;
        return entry;
      });

      setDataArray19(overallArr);

      setDataArray20(detData.byGroup.AgeDetail);

      setDataArray21(detData.byGroup.OffenseCategory);
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
            subtitle={`Entries - All Programs`}
            dekWithYear={`Showing entries to ATDs for ${selectedYear}`}
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
              filename={`alternative-to-detention-entries-${selectedYear}.pdf`}
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
              <div
                style={{ maxHeight: "60px", width: "100%" }}
                onMouseEnter={() => setShowMap(true)}
                onMouseLeave={() => setShowMap(!persistMap ? false : true)}
                onClick={() => {
                  setPersistMap(!persistMap);
                }}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ChangeStatistics
                    caption={"entries to ATD"}
                    data={[
                      dataArray11[0]?.body?.totalEntries,
                      dataArray11[0]?.body?.previousTotalEntries,
                    ]}
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
                    metric={"entries"}
                  />
                </div>
              </div>
            </ChartCard>

            {/* Entries by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "340px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray12.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray12}
                      breakdowns={["total"]}
                      height={340}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Entries by ATD Program Type"}
                      colorMapOverride={{
                        total: "#5a6b7c",
                      }}
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
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart
                    records={dataArray19}
                    year={selectedYear}
                    groupByKey={"Pre/post-dispo filter"}
                    type={"alternative-to-detention"}
                    chartTitle={"Entries by Pre/Post-Dispo"}
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
            {/* Entries by Race/Ethnicity */}
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
                      ? "Entries by Race/Ethnicity"
                      : "Entries by Youth of Color vs. White"}
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
                <div style={{ height: "270px", width: "100%" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    {dataArray13.length > 0 && (
                      <StackedBarChartGeneric
                        data={dataArray13}
                        breakdowns={["Pre-dispo"]}
                        height={220}
                        margin={{ top: 0, right: 40, bottom: 20, left: 20 }}
                        chartTitle={""}
                        colorMapOverride={{
                          "Pre-dispo": "#5a6b7c",
                          "Post-dispo": "#d3d3d3",
                        }}
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
            {/* Entries by Gender */}
            <ChartCard width="100%">
              <div style={{ height: "180px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray14.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray14}
                      breakdowns={["Pre-dispo"]}
                      height={180}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Gender"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
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
            {/* Entries by Age */}
            <ChartCard width="100%">
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray15.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray15}
                      breakdowns={["Pre-dispo"]}
                      height={200}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Age"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
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
            {/* Entries by Reason */}
            <ChartCard width="100%">
              <div style={{ height: "180px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray18.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray18}
                      breakdowns={["Pre-dispo"]}
                      height={180}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Reason for Detention"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Reason for Detention"}
                      showChart={true}
                      innerData={dataArray21}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* Entries by Category */}
            <ChartCard width="100%">
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray16.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray16}
                      breakdowns={["Pre-dispo"]}
                      height={260}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Offense Category (pre-dispo)"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
                        "Post-dispo": "#d3d3d3",
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Category"}
                      showChart={true}
                      innerData={dataArray21}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Entries by Jurisdiction */}
            <ChartCard width="100%">
              <div style={{ height: "250px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray17.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray17}
                      breakdowns={["Pre-dispo"]}
                      height={250}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Jurisdiction"}
                      colorMapOverride={{
                        "Pre-dispo": "#5a6b7c",
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
