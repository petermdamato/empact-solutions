"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ChangeStatistics from "@/components/ChangeStatistics/ChangeStatistics";
import Selector from "@/components/Selector/Selector";
import { useCSV } from "@/context/CSVContext";
import { useTags } from "@/context/TagsContext";
import ChartCard from "@/components/ChartCard/ChartCard";
import ZipMap from "@/components/ZipMap/ZipMap";
import { ResponsiveContainer } from "recharts";
import { useEffect, useState, useRef } from "react";
import StackedBarChartGeneric from "@/components/StackedBar/StackedBarChartGeneric";
import StackedBarChartCentered from "@/components/StackedBar/StackedBarChartCentered";
import "./styles.css";
import {
  analyzeExitsByYear,
  analyzeExitsByExploreType,
  analyzeExitsByDisruptionType,
  analyzeDisruptionPercentsByYear,
} from "@/utils/aggFunctions";
import {
  chooseCategory,
  categorizeRaceEthnicity,
  categorizeYoc,
  categorizeAge,
  categorizeDisruptionType,
} from "@/utils/categories";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import LegendStatic from "@/components/LegendStatic/LegendStatic";
import * as Constants from "./../../constants";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

const getAge = (dob, intake) => {
  if (!dob || !intake) return null;
  return (intake - dob) / (365.25 * 24 * 60 * 60 * 1000);
};

export default function Overview() {
  const { csvData } = useCSV();
  const { selectedTags } = useTags();
  const router = useRouter();
  const contentRef = useRef();
  const [finalData, setFinalData] = useState(csvData);
  const [filterVariables, setFilterVariable] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [incarcerationType] = useState("alternative-to-detention");
  const [calculationType, setCalculationType] = useState("Average");
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [breakdownType, setBreakdownType] = useState("Overall Total");
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [dataArray5, setDataArray5] = useState([]);
  const [dataArray6, setDataArray6] = useState([]);
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

  useEffect(() => {
    if (!csvData || csvData.length === 0) {
      router.push("/overview");
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

  useEffect(() => {
    setFinalData(csvData);
  }, [breakdownType]);

  // Pull in for the filter of types
  useEffect(() => {
    if (filterVariables.length > 0) {
      let filtered = [...csvData]; // clone csvData

      filterVariables.forEach(({ key, value }) => {
        if (key === "Race/Ethnicity" || key === "YOC/White") {
          if (key === "Race/Ethnicity") {
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
        } else if (key === "Age" || key === "Age at Intake") {
          filtered = filtered.filter(
            (record) => categorizeAge(record, incarcerationType) === value
          );
        } else if (key === "Disruption_Type") {
          filtered = filtered.filter((record) => {
            return categorizeDisruptionType(record, incarcerationType).includes(
              value
            );
          });
        } else if (
          key === "Gender" ||
          key === "Screened/not screened" ||
          key === "Facility"
        ) {
          filtered = filtered.filter((record) => record[key] === value);
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
  }, [filterVariables, csvData, selectedTags]);

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
  }, [finalData, selectedYear, programType]);

  useEffect(() => {
    setYearsArray(
      [...new Set(csvData.map((obj) => parseDateYear(obj.ATD_Exit_Date)))]
        .filter((entry) => entry !== null)
        .sort((a, b) => a - b)
    );
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
        undisrupted: dataArray1[0].body?.successfulExits,
        disrupted: dataArray1[0].body?.unsuccessfulExits,
        total:
          dataArray1[0].body?.successfulExits +
          dataArray1[0].body?.unsuccessfulExits,
      };
      chartArray.push(chartObj);

      const byExploreType = analyzeExitsByExploreType(
        finalData,
        +selectedYear,
        breakdownType
      );
      // By disruption type
      const exploreTypeBreakdown = Object.entries(
        byExploreType.exitsByBreakdown
      ).map(([program, values]) => ({
        category: program,
        ...values,
      }));

      setDataArray3(
        breakdownType === "Overall Total" ? chartArray : exploreTypeBreakdown
      );

      const byDisruptionType = analyzeExitsByDisruptionType(
        finalData,
        +selectedYear
      );
      // By disruption type
      const disruptionTypeBreakdown = Object.entries(
        byDisruptionType.byDisruptionType
      ).map(([program, values]) => ({
        category: program,
        disrupted: 1,
        undisrupted: 1,
        total: values.count,
      }));

      setDataArray4(disruptionTypeBreakdown);
      // Set overall
      const byExitType = analyzeExitsByExploreType(
        finalData,
        +selectedYear,
        "Exit To"
      );
      // By disruption type
      const exitTypeBreakdown = Object.entries(byExitType.exitsByBreakdown).map(
        ([program, values]) => ({
          category: program,
          ...values,
        })
      );
      setDataArray5(exitTypeBreakdown);

      const percentsByYear = analyzeDisruptionPercentsByYear(
        finalData,
        breakdownType
      );

      setDataArray6(percentsByYear);
    }
  }, [dataArray1, calculationType, breakdownType]);

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
              values={[
                "Overall Total",
                "Race/Ethnicity",
                "YOC/White",
                "Gender",
                "Age at Intake",
                "Offense Category",
              ]}
              variable={"Explore"}
              selectedValue={breakdownType}
              setValue={setBreakdownType}
              secondarySetValue={setFilterVariable}
            />
            <Selector
              values={yearsArray}
              variable={"Year"}
              selectedValue={selectedYear}
              setValue={setSelectedYear}
            />
            {/* <Selector
              values={programTypeArray}
              variable={"Program Type"}
              selectedValue={programType}
              setValue={setProgramType}
            />{" "} */}
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
              flexBasis: "40%",
              flexShrink: 0,
              flexGrow: 0,
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
                    caption={"ATD exits"}
                    data={[
                      dataArray1[0]?.body?.totalExits,
                      dataArray1[0]?.body?.previousTotalExits,
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
                    metric={"exits"}
                  />
                </div>
              </div>
            </ChartCard>

            {/* Exits by ATD Type */}
            <ChartCard width="100%">
              <div style={{ height: "340px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray2.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray2}
                      breakdowns={["total"]}
                      height={340}
                      margin={{ top: 20, right: 50, bottom: 20, left: 20 }}
                      chartTitle={"Exits by ATD Program Type"}
                      colorMapOverride={Constants.successColors}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Facility"}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* ATD Disruption Type */}
            <ChartCard width="100%">
              <div style={{ height: "240px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray4.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray4}
                      breakdowns={["total"]}
                      height={240}
                      margin={{ top: 20, right: 50, bottom: 20, left: 20 }}
                      chartTitle={"Exits by ATD Disruption Type"}
                      colorMapOverride={Constants.successColors}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Disruption_Type"}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Column 2 */}
          <div
            style={{
              flexBasis: "60%",
              flexShrink: 0,
              flexGrow: 0,
              display: "flex",
              flexDirection: "column",
              gap: "24px",
            }}
          >
            {/* Success breakdown */}
            <ChartCard width="100%">
              <div style={{ height: "300px", width: "100%" }}>
                <div style={{ position: "relative" }}>
                  <div style={{ position: "absolute", right: "14px", top: 0 }}>
                    <LegendStatic type="success" />
                  </div>
                </div>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray3.length > 0 && (
                    <StackedBarChartCentered
                      data={dataArray3}
                      tooltipPayload={dataArray6}
                      breakdowns={["disrupted", "undisrupted"]}
                      height={300}
                      margin={{ top: 20, right: 40, bottom: 20, left: 40 }}
                      chartTitle={`Exits by ${breakdownType}`}
                      colorMapOverride={Constants.successColors}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={breakdownType}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
            <ChartCard width="100%">
              <div style={{ height: "390px", width: "100%" }}>
                <ResponsiveContainer width="100%" height="100%">
                  {dataArray5.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray5}
                      breakdowns={["total"]}
                      height={390}
                      margin={{ top: 20, right: 50, bottom: 20, left: 20 }}
                      chartTitle={"Exits by Exit To Type"}
                      colorMapOverride={Constants.successColors}
                      filterVariables={filterVariables}
                      groupByKey={"Exit To"}
                      sorted={true}
                      filterable={false}
                      labelContext={"percent"}
                    />
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </div>

        {/* Table at bottom */}
        {/* <div style={{ height: "500px", padding: "24px", overflow: "auto" }}>
          <RecordsTable data={dataArray5} />
        </div> */}
      </div>
    </div>
  );
}
