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
} from "@/utils/aggFunctions";
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

  useEffect(() => {
    if (programType === "All Program Types") {
      setDataArray11([
        {
          title: "Entries by Successfulness",
          header: analyzeEntriesByYear(csvData, +selectedYear),
          body: analyzeEntriesByYear(csvData, +selectedYear),
        },
      ]);
    } else {
      const intermediate = csvData.filter(
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
          calculationType === "average"
            ? dataArray1[0].body?.successfulAvgLengthOfStay +
              dataArray1[0].body?.unsuccessfulAvgLengthOfStay
            : dataArray1[0].body?.successfulMedianLengthOfStay +
              dataArray1[0].body?.unsuccessfulMedianLengthOfStay,
        successful:
          calculationType === "average"
            ? Math.round(dataArray1[0].body?.successfulAvgLengthOfStay * 10) /
              10
            : Math.round(
                dataArray1[0].body?.successfulMedianLengthOfStay * 10
              ) / 10,
        unsuccessful:
          calculationType === "average"
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

  useEffect(() => {
    if (dataArray11.length > 0 && dataArray11[0].body?.entriesByProgramType) {
      const byProgramType = Object.entries(
        dataArray11[0].body?.entriesByProgramType
      ).map(([program, values]) => ({
        category: program,
        ...values,
      }));
      const detData = analyzeAdmissionsOnly(csvData, +selectedYear);

      // Set overall

      const byRaceEthnicity = Object.entries(detData.byGroup.RaceEthnicity).map(
        ([race, values]) => ({
          category: race,
          ...values,
        })
      );
      setDataArray12(byProgramType);

      setDataArray13(byRaceEthnicity);

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
        detData.byGroup.Referral_Source
      ).map(([source, values]) => ({
        category: source,
        ...values,
      }));

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
    }
  }, [dataArray11, calculationType]);
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
            subtitle={`Entries - All Programs`}
            dekWithYear={`Showing entries to ATDs for ${selectedYear}`}
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
                      dataArray11[0]?.body?.totalEntries,
                      dataArray11[0]?.body?.previousTotalEntries,
                    ]}
                  />
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Entries by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "400px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray12.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray12}
                      breakdowns={["total"]}
                      height={400}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"Entries by ATD Program Type"}
                      colorMapOverride={{
                        total: "#5b6069",
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
                    title={"Entries by Pre/Post-Dispo"}
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
            {/* Entries by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray13.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray13}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={300}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Race/Ethnicity"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            {/* Entries by Gender */}
            <ChartCard width="100%">
              <div style={{ height: "200px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray14.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray14}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={200}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Gender"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
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
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={200}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Age"}
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
            {/* Entries by Reason */}
            <ChartCard width="100%">
              <div style={{ height: "260px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray18.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray18}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={260}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Reason for Detention"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
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
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={260}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Offense Category (pre-dispo)"}
                      colorMapOverride={{
                        "Pre-dispo": "#5b6069",
                        "Post-dispo": "#d3d3d3",
                      }}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Entries by Jurisdiction */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray17.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray17}
                      breakdowns={["Pre-dispo", "Post-dispo"]}
                      height={300}
                      margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
                      chartTitle={"Entries by Jurisdiction"}
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
