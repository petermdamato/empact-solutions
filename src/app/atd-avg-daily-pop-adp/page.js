"use client";

import { useEffect, useState } from "react";
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
import { analyzeDailyPopByProgramType } from "@/utils/aggFunctions";
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
    const lower = label.toLowerCase();

    if (lower.includes("felony")) {
      group = "New Offense";
    } else if (lower.includes("misdemeanor")) {
      group = "New Offense";
    } else if (label === "Status Offense") {
      group = "New Offense";
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
  const [selectedYear, setSelectedYear] = useState(2024);

  const [incarcerationType] = useState("ATD Utilization");
  const [calculationType, setCalculationType] = useState("average");
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);

  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);

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

  // Race array 2
  // Gender array 3
  // Age array 4

  useEffect(() => {
    if (programType === "All Program Types") {
      setDataArray11([
        {
          title: "Statistics",
          current: dataAnalysisV2(
            csvData,
            "averageDailyPopulation",
            +selectedYear,
            null,
            "alternative-to-detention"
          ).All,
          previous: dataAnalysisV2(
            csvData,
            "averageDailyPopulation",
            +selectedYear - 1,
            null,
            "alternative-to-detention"
          ).All,
        },
      ]);
      setDataArray2(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "RaceEthnicity",
          "alternative-to-detention"
        )
      );
      setDataArray3(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "Gender",
          "alternative-to-detention"
        )
      );
      setDataArray4(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "Age",
          "alternative-to-detention"
        )
      );
    } else {
      const intermediate = csvData.filter(
        (entry) => entry.Facility === programType
      );

      setDataArray11([
        {
          title: "Average Daily Population",
          header: analyzeEntriesByYear(intermediate, +selectedYear),
          current: analyzeEntriesByYear(intermediate, +selectedYear),
        },
      ]);
    }
  }, [csvData, selectedYear, programType]);

  useEffect(() => {
    setYearsArray(
      [...new Set(csvData.map((obj) => parseDateYear(obj.ATD_Exit_Date)))]
        .filter((entry) => entry !== null)
        .sort((a, b) => a - b)
    );
    let programTypeArrayInt = [...new Set(csvData.map((obj) => obj.Facility))]
      .filter((entry) => entry !== null && entry !== "")
      .sort((a, b) => a - b);

    const programTypeArrayFinal = [...programTypeArrayInt, "All Program Types"];

    setProgramTypeArray(programTypeArrayFinal);
  }, [csvData]);

  useEffect(() => {
    if (dataArray11.length > 0 && dataArray11[0].current) {
      // Set overall
      console.log(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          null,
          "alternative-to-detention"
        )
      );
      const byProgram = Object.entries(
        analyzeDailyPopByProgramType(csvData, +selectedYear)
      ).map(([program, value]) => {
        return {
          category: program,
          averageDailyPopulation: value,
        };
      });
      setDataArray12(byProgram);
      const byRaceEthnicity = Object.entries(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "RaceEthnicity",
          "alternative-to-detention"
        )
      ).map(([race, value]) => {
        return {
          category: race,
          "Pre-dispo": value,
        };
      });

      setDataArray13(byRaceEthnicity);

      const byGender = Object.entries(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "Gender",
          "alternative-to-detention"
        )
      ).map(([gender, value]) => {
        return {
          category: gender,
          "Pre-dispo": value,
        };
      });

      setDataArray14(byGender);

      const byAge = Object.entries(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "Gender",
          "alternative-to-detention"
        )
      ).map(([age, value]) => {
        return {
          category: age,
          "Pre-dispo": value,
        };
      });

      setDataArray15(byAge);

      const categories = Object.entries(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "SimplifiedOffense",
          "alternative-to-detention"
        )
      ).map(([cat, value]) => {
        return {
          category: cat,
          "Pre-dispo": value,
        };
      });

      setDataArray16(categories);

      const byReasons = Object.entries(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "OffenseOverall",
          "alternative-to-detention"
        )
      ).map(([cat, value]) => {
        return {
          category: cat,
          "Pre-dispo": value,
        };
      });

      setDataArray18(byReasons);

      const byJurisdiction = Object.entries(
        dataAnalysisV2(
          csvData,
          "averageDailyPopulation",
          +selectedYear,
          "simplifiedReferralSource",
          "alternative-to-detention"
        )
      ).map(([cat, value]) => {
        return {
          category: cat,
          "Pre-dispo": value,
        };
      });

      setDataArray17(byJurisdiction);
      const detData = analyzeAdmissionsOnly(csvData, +selectedYear);
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
    }
  }, [dataArray11]);
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
            title={`${incarcerationType}`}
            subtitle={`Average Daily Population of Stay - All Programs`}
            dekWithYear={`Showing ADP in ATDs for ${selectedYear}`}
          >
            <Selector
              values={yearsArray}
              variable={"Year"}
              selectedValue={selectedYear}
              setValue={setSelectedYear}
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
                      Math.round(dataArray11[0]?.current * 10) / 10,

                      dataArray11[0]?.previous,
                    ]}
                  />
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* ADP by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray12.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray12}
                      breakdowns={["averageDailyPopulation"]}
                      height={400}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"ADP by ATD Program Type"}
                      colorMapOverride={{
                        averageDailyPopulation: "#5b6069",
                      }}
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
                    title={"ADP by Pre/Post-Dispo"}
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
              gap: "24px",
            }}
          >
            {/* ADP by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray13.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray13}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={300}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Race/Ethnicity"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* ADP by Gender */}
            <ChartCard width="100%">
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray14.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray14}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={200}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Gender"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
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
                      data={dataArray15}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={200}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Age"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
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
              gap: "24px",
            }}
          >
            {/* ADP by Reason */}
            <ChartCard width="100%">
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray18.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray18}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={260}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Reason for Detention"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
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
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={260}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Offense Category (pre-dispo)"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* ADP by Jurisdiction */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray17.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray17}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={300}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"ADP by Jurisdiction"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
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
