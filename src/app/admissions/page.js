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
import dynamic from "next/dynamic";
const ZipMap = dynamic(() => import("@/components/ZipMap/ZipMap"), {
  ssr: false,
});
const colors = ["#5a6b7c", "#d5d5d5"];
const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

const groupReasons = (data) => {
  offenseMap;
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
    Felony: {},
    Misdemeanor: {},
    "Status Offense": {},
    Technical: {},
  };

  for (const [label, counts] of Object.entries(data)) {
    let group;
    const lower = label.toLowerCase();

    if (lower.includes("felony")) {
      group = "Felony";
    } else if (lower.includes("misdemeanor")) {
      group = "Misdemeanor";
    } else if (label === "Status Offense") {
      group = "Status Offense";
    } else {
      group = "Technical";
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
  const [incarcerationType] = useState("secure-detention");
  const [calculationType] = useState("average");
  const [programType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);
  const [filterVariable, setFilterVariable] = useState(null);
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

  const onSelectChange = (e) => {
    setSelectedYear(e);
  };

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
          JSON.parse(JSON.stringify(csvData)).filter(
            (record) => categorizeAge(record, incarcerationType) === value
          )
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
    if (programType === "All Program Types") {
      setDataArray11([
        {
          title: "Admissions by Successfulness",
          header: analyzeEntriesByYear(
            finalData,
            +selectedYear,
            incarcerationType
          ),
          body: analyzeEntriesByYear(
            finalData,
            +selectedYear,
            incarcerationType
          ),
        },
      ]);
    } else {
      const intermediate = finalData.filter(
        (entry) => entry.Facility === programType
      );

      setDataArray11([
        {
          title: "Admissions by Successfulness",
          header: analyzeEntriesByYear(
            intermediate,
            +selectedYear,
            incarcerationType
          ),
          body: analyzeEntriesByYear(
            intermediate,
            +selectedYear,
            incarcerationType
          ),
        },
      ]);
    }
  }, [finalData, selectedYear, programType, filterVariable]);

  useEffect(() => {
    setYearsArray(
      [...new Set(finalData.map((obj) => parseDateYear(obj.Admission_Date)))]
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
      const detData = analyzeAdmissionsOnly(
        finalData,
        +selectedYear,
        incarcerationType
      );

      // Set race/ethnicity data for both views
      const detailedRaceData = Object.entries(
        detData.byGroup.RaceEthnicity
      ).map(([race, values]) => ({
        category: race,
        ...values,
        total: (values["Pre-dispo"] || 0) + (values["Post-dispo"] || 0),
      }));

      const simplifiedRaceData = Object.entries(
        detData.byGroup.RaceSimplified
      ).map(([race, values]) => ({
        category: race,
        ...values,
        total: (values["Pre-dispo"] || 0) + (values["Post-dispo"] || 0),
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
          total: (values["Pre-dispo"] || 0) + (values["Post-dispo"] || 0),
        })
      );

      setDataArray14(byGender);

      const byAge = Object.entries(detData.byGroup.AgeBracket).map(
        ([age, values]) => ({
          category: age,
          ...values,
          total: (values["Pre-dispo"] || 0) + (values["Post-dispo"] || 0),
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
          total: (values["Pre-dispo"] || 0) + (values["Post-dispo"] || 0),
        })
      );

      setDataArray16(byOffenseCategory);

      const byReasons = groupReasons(detData.byGroup.OffenseCategory);

      const groupedByReasons = Object.entries(byReasons).map(
        ([offense, values]) => ({
          category: offense,
          ...values,
          total: (values["Pre-dispo"] || 0) + (values["Post-dispo"] || 0),
        })
      );

      setDataArray18(groupedByReasons);

      const byJurisdiction = Object.entries(
        dataAnalysisV2(
          finalData,
          `countAdmissions`,
          +selectedYear,
          "simplifiedReferralSource",
          "secure-detention"
        )
      ).map(([category, values]) => {
        return {
          category: category,
          ...values,
          total: (values["Pre-dispo"] || 0) + (values["Post-dispo"] || 0),
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

      let overallArrScreened = [];

      Object.keys(detData.screened).forEach((source) => {
        overallArrScreened.push({
          category: source,
          value: detData.screened[source],
        });
      });
      const totalSumScreened = overallArrScreened.reduce(
        (accumulator, currentValue) => accumulator + currentValue.value,
        0
      );

      overallArrScreened.map((entry) => {
        entry.percentage = entry.value / totalSumScreened;
        return entry;
      });

      setDataArray12(overallArrScreened);

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
    <div
      style={{ display: "flex", height: "100vh", backgroundColor: "#f5f7fa" }}
    >
      <Sidebar />

      <div
        style={{
          flexGrow: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "auto",
        }}
        ref={contentRef}
      >
        <div
          style={{
            height: "60px",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <Header
            title="Secure Detention Utilization"
            subtitle="Admissions"
            dekWithYear={`Showing admissions to secure detention for ${selectedYear}.`}
            showFilterInstructions
            selectedYear={selectedYear}
            onSelectChange={onSelectChange}
            dropdownOptions={yearsArray}
            useDropdown
          >
            <DownloadButton
              elementRef={contentRef}
              filename={`secure-detention-admissions-${selectedYear}.pdf`}
            />
          </Header>
        </div>

        <div style={{ display: "flex", gap: "24px", padding: "24px" }}>
          {/* Column 1 */}
          <div
            style={{
              flex: "1 1 33%",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Change Statistics */}
            <ChartCard width="100%" style={{ position: "relative" }}>
              <div
                style={{ maxHeight: "60px", width: "100%" }}
                onMouseEnter={() => setShowMap(true)}
                onMouseLeave={() => setShowMap(false)}
              >
                <ResponsiveContainer width="100%" height="100%">
                  <ChangeStatistics
                    caption={"admissions"}
                    data={[
                      dataArray11[0]?.body?.totalEntries,
                      dataArray11[0]?.body?.previousTotalEntries,
                    ]}
                  />
                </ResponsiveContainer>

                {/* Hover Map Tooltip */}

                <div
                  style={{
                    position: "absolute",
                    top: "135px",
                    left: "60px",
                    zIndex: 10,
                    width: "320px",
                    height: "320px",
                    background: "#fff",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.2)",
                    borderRadius: "8px",
                    opacity: `${showMap ? 1 : 0}`,
                    overflow: "hidden",
                    pointerEvents: "none",
                  }}
                >
                  <ZipMap csvData={finalData} selectedYear={selectedYear} />
                </div>
              </div>
            </ChartCard>

            {/* Admissions by Type */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <PieChart
                  records={dataArray12}
                  year={selectedYear}
                  groupByKey={"Screened/not screened"}
                  type={"secure-detention"}
                  chartTitle={"Admissions by screened/not screened"}
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
                  chartTitle={"Admissions by Pre/Post-Dispo"}
                  setFilterVariable={setFilterVariable}
                  filterVariable={filterVariable}
                />
              </div>
            </ChartCard>
          </div>

          {/* Column 2 */}
          <div
            style={{
              flex: "1 1 33%",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Admissions by Race/Ethnicity */}
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
                      ? "Admissions by Race/Ethnicity"
                      : "Admissions by Youth of Color vs. White"}
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
                        breakdowns={["total"]}
                        height={220}
                        margin={{ top: 0, right: 40, bottom: 20, left: 20 }}
                        chartTitle={
                          raceType === "RaceEthnicity"
                            ? "Admissions by Race/Ethnicity"
                            : "Admissions by Race (Simplified)"
                        }
                        colorMapOverride={{
                          "Pre-dispo": colors[0],
                          total: colors[0],
                          "Post-dispo": colors[1],
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

            {/* Admissions by Gender */}
            <ChartCard width="100%">
              <div style={{ height: "180px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray14.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray14}
                      breakdowns={["total"]}
                      height={200}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Admissions by Gender"}
                      colorMapOverride={{
                        "Pre-dispo": colors[0],
                        total: colors[0],
                        "Post-dispo": colors[1],
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
            {/* Admissions by Age */}
            <ChartCard width="100%">
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray15.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray15}
                      breakdowns={["total"]}
                      height={200}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Admissions by Age"}
                      colorMapOverride={{
                        "Pre-dispo": colors[0],
                        total: colors[0],
                        "Post-dispo": colors[1],
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
              flex: "1 1 33%",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              width: "100%",
            }}
          >
            {/* Admissions by Reason */}
            <ChartCard width="100%">
              <div style={{ height: "160px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray18.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray18}
                      breakdowns={["total"]}
                      height={180}
                      margin={{ top: 20, right: 40, bottom: 0, left: 20 }}
                      chartTitle={"Admissions by Reason for Detention"}
                      colorMapOverride={{
                        "Pre-dispo": colors[0],
                        total: colors[0],
                        "Post-dispo": colors[1],
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
            {/* Admissions by Category */}
            <ChartCard width="100%">
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray16.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray16}
                      breakdowns={["total"]}
                      height={260}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Admissions by Offense Category (pre-dispo)"}
                      colorMapOverride={{
                        "Pre-dispo": colors[0],
                        total: colors[0],
                        "Post-dispo": colors[1],
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

            {/* Admissions by Jurisdiction */}
            <ChartCard width="100%">
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray17.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray17}
                      breakdowns={["total"]}
                      height={260}
                      margin={{ top: 20, right: 40, bottom: 20, left: 20 }}
                      chartTitle={"Admissions by Jurisdiction"}
                      colorMapOverride={{
                        "Pre-dispo": colors[0],
                        total: colors[0],
                        "Post-dispo": colors[1],
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
