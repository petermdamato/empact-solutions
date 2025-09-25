"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import ChangeStatistics from "@/components/ChangeStatistics/ChangeStatistics";
import StackedBarChartGeneric from "@/components/StackedBar/StackedBarChartGeneric";
import ChartCard from "@/components/ChartCard/ChartCard";
import PieChart from "@/components/PieChart/PieChartV2";
import Selector from "@/components/Selector/Selector";
import { useCSV } from "@/context/CSVContext";
import { ResponsiveContainer } from "recharts";
import { useTags } from "@/context/TagsContext";
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
import { groupOffenseCategories, groupReasons } from "@/utils/categories";
import { calculateColumnHeightsStandard } from "@/utils/calculateColumnHeights";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import "./styles.css";
import dynamic from "next/dynamic";

const ZipMap = dynamic(() => import("@/components/ZipMap/ZipMap"), {
  ssr: false,
});

const colors = ["#5a6b7c", "#d5d5d5"];

export default function Overview() {
  const { csvData, fileName } = useCSV();
  const { selectedTags } = useTags();
  const router = useRouter();
  const contentRef = useRef();
  const [finalData, setFinalData] = useState(csvData);
  const [maxLabelWidth, setMaxLabelWidth] = useState(0);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [incarcerationType] = useState("secure-detention");
  const [calculationType] = useState("average");
  const [programType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([]);
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
  const [dataArray22, setDataArray22] = useState([]);
  const [raceData, setRaceData] = useState([]);
  const [showMap, setShowMap] = useState(false);
  const [persistMap, setPersistMap] = useState(false);

  const [windowHeight, setWindowHeight] = useState(0);
  const columnConstants = {
    column1: [0, 286, 286],
    column2: [270, 180, 200],
    column3: [160, 260, 230],
  };
  const [columnHeights, setColumnHeights] = useState(columnConstants);

  const [loading, setLoading] = useState(true);

  // Debounced "final value" detection
  useEffect(() => {
    if (maxLabelWidth > 0) {
      // Delay to ensure layout measurements have finished
      const timeout = setTimeout(() => {
        setLoading(false);
      }, 100); // tweak delay as needed

      return () => clearTimeout(timeout);
    }
  }, [maxLabelWidth]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      setWindowHeight(window.innerHeight);
    };

    // Set initial height
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Update chart heights when window height changes
  useEffect(() => {
    if (windowHeight > 0) {
      setColumnHeights(
        calculateColumnHeightsStandard(windowHeight - 20, columnConstants)
      );
    }
  }, [windowHeight, calculateColumnHeightsStandard]);

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

  const onSelectChange = (e) => {
    setSelectedYear(e);
  };

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
        } else if (key === "Gender" || key === "Screened/not screened") {
          filtered = filtered.filter((record) => record[key] === value);
        } else if (key === "Reason for Detention") {
          filtered = filtered.filter(
            (record) =>
              chooseCategory(record, key).toLowerCase() === value.toLowerCase()
          );
        } else if (key === "Offense Category") {
          filtered = filtered.filter(
            (record) =>
              chooseCategory(record, "Category").toLowerCase() ===
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
  }, [filterVariables, csvData, raceType, selectedTags]);

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
  }, [finalData, selectedYear, programType, filterVariables]);

  useEffect(() => {
    let yearsStringArray;

    if (fileName && fileName.length > 0) {
      const match = fileName.match(/(\d{8}).*?(\d{8})/);
      if (match) {
        yearsStringArray = [match[1], match[2]];
      }
    }

    const parseDateYear = (dateString) => {
      if (!dateString) return null;
      const date = new Date(dateString);
      return isNaN(date) ? null : date.getFullYear();
    };

    const uniqueYears = [
      ...new Set(csvData.map((obj) => parseDateYear(obj.Admission_Date))),
    ]
      .filter((year) => {
        if (year === null || isNaN(year)) return false;

        // Extract years from yearsStringArray if they exist
        const startYear =
          yearsStringArray && yearsStringArray[0]
            ? parseInt(yearsStringArray[0].slice(4, 8))
            : null;
        const endYear =
          yearsStringArray && yearsStringArray[1]
            ? parseInt(yearsStringArray[1].slice(4, 8))
            : null;

        const meetsStartCondition = !startYear || year >= startYear;
        const meetsEndCondition = !endYear || year <= endYear;

        return meetsStartCondition && meetsEndCondition;
      })
      .sort((a, b) => a - b);

    setSelectedYear(uniqueYears[uniqueYears.length - 1]);
    setYearsArray(uniqueYears);
  }, [csvData, fileName]);

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
          total: values["Pre-dispo"] || 0,
          // + (values["Post-dispo"] || 0)
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

      setDataArray21(detData.byGroup.ReasonForDetention);
      setDataArray22(detData.PostDispoGroups);
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
            dekWithYear={`Showing admissions to secure detention for ${
              yearsArray.length > 1
                ? yearsArray[0] + " – " + yearsArray[yearsArray.length - 1]
                : selectedYear
            }.`}
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
        {loading ? (
          // Loading state
          <div className="spinner-container">
            <div className="spinner" />
          </div>
        ) : (
          <></>
        )}
        <div
          style={{
            display: "flex",
            gap: "24px",
            padding: "22px 24px",
            overscrollBehavior: "contain",
            opacity: loading ? 0 : 1,
          }}
        >
          {/* Column 1 */}
          <div
            style={{
              flex: "1 1 33%",
              display: "flex",
              flexDirection: "column",
              gap: "12px",
              minWidth: "380px",
              width: "100%",
            }}
          >
            {/* Change Statistics */}
            <ChartCard width="100%" style={{ position: "relative" }}>
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
                    caption={"admissions"}
                    data={[
                      dataArray11[0]?.body?.totalEntries,
                      dataArray11[0]?.body?.previousTotalEntries,
                    ]}
                    map={true}
                  />
                </ResponsiveContainer>

                {/* Hover Map Tooltip */}

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
                    metric={"admissions"}
                  />
                </div>
              </div>
            </ChartCard>

            {/* Admissions by Type */}
            <ChartCard width="100%">
              <div
                style={{
                  height: `${columnHeights.column1[1] - 13}px`,
                  width: "100%",
                }}
              >
                <PieChart
                  records={dataArray12}
                  year={selectedYear}
                  size={columnHeights.column1[1]}
                  groupByKey={"Screened/not screened"}
                  type={"secure-detention"}
                  chartTitle={"Admissions by screened/not screened"}
                  toggleFilter={toggleFilter}
                  filterVariables={filterVariables}
                />
              </div>
            </ChartCard>
            {/* Pie Chart */}
            <ChartCard width="100%">
              <div
                style={{
                  height: `${columnHeights.column1[2] - 13}px`,
                  width: "100%",
                }}
              >
                <PieChart
                  records={dataArray19}
                  year={selectedYear}
                  groupByKey={"Pre/post-dispo filter"}
                  size={columnHeights.column1[2]}
                  type={"secure-detention"}
                  chartTitle={"Admissions by Pre/Post-Dispo"}
                  toggleFilter={toggleFilter}
                  filterVariables={filterVariables}
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
                  height: `${columnHeights.column2[0]}px`,
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
                  <h5 style={{ fontSize: "16px" }}>
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
                    secondarySetValue={setFilterVariable}
                  />
                </div>
                <div style={{ height: "100%", width: "100%" }}>
                  {dataArray13.length > 0 && (
                    <StackedBarChartGeneric
                      data={dataArray13}
                      breakdowns={["total"]}
                      height={columnHeights.column2[0]}
                      margin={{ top: 0, right: 40, bottom: 30, left: 20 }}
                      chartTitle={""}
                      colorMapOverride={{
                        "Pre-dispo": colors[0],
                        total: colors[0],
                        "Post-dispo": colors[1],
                      }}
                      toggleFilter={toggleFilter}
                      filterVariables={filterVariables}
                      groupByKey={"Race/Ethnicity"}
                      showChart={false}
                      maxLabelWidth={maxLabelWidth}
                      setMaxLabelWidth={setMaxLabelWidth}
                    />
                  )}
                </div>
              </div>
            </ChartCard>

            {/* Admissions by Gender */}
            <ChartCard width="100%">
              <div
                style={{
                  height: `${columnHeights.column2[1]}px`,
                  width: "100%",
                }}
              >
                {dataArray14.length > 0 && (
                  <StackedBarChartGeneric
                    data={dataArray14}
                    breakdowns={["total"]}
                    height={columnHeights.column2[1]}
                    margin={{ top: 20, right: 40, bottom: 0, left: 20 }}
                    chartTitle={"Admissions by Gender"}
                    colorMapOverride={{
                      "Pre-dispo": colors[0],
                      total: colors[0],
                      "Post-dispo": colors[1],
                    }}
                    toggleFilter={toggleFilter}
                    filterVariables={filterVariables}
                    groupByKey={"Gender"}
                    showChart={false}
                    maxLabelWidth={maxLabelWidth}
                    setMaxLabelWidth={setMaxLabelWidth}
                  />
                )}
              </div>
            </ChartCard>
            {/* Admissions by Age */}
            <ChartCard width="100%">
              <div
                style={{
                  height: `${columnHeights.column2[2]}px`,
                  width: "100%",
                }}
              >
                {dataArray15.length > 0 && (
                  <StackedBarChartGeneric
                    data={dataArray15}
                    breakdowns={["total"]}
                    innerBreakdowns={["Pre-dispo"]}
                    height={columnHeights.column2[2]}
                    margin={{ top: 20, right: 40, bottom: 4, left: 20 }}
                    chartTitle={"Admissions by Age"}
                    colorMapOverride={{
                      "Pre-dispo": colors[0],
                      total: colors[0],
                      "Post-dispo": colors[1],
                    }}
                    toggleFilter={toggleFilter}
                    filterVariables={filterVariables}
                    groupByKey={"Age"}
                    showChart={true}
                    innerData={dataArray20}
                    maxLabelWidth={maxLabelWidth}
                    setMaxLabelWidth={setMaxLabelWidth}
                  />
                )}
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
              <div
                style={{
                  height: `${columnHeights.column3[0]}px`,
                  width: "100%",
                }}
              >
                {dataArray18.length > 0 && (
                  <StackedBarChartGeneric
                    data={dataArray18}
                    breakdowns={["total"]}
                    innerBreakdowns={["Pre-dispo"]}
                    height={columnHeights.column3[0]}
                    margin={{ top: 20, right: 40, bottom: 0, left: 20 }}
                    chartTitle={"Admissions by Reason for Detention"}
                    colorMapOverride={{
                      "Pre-dispo": colors[0],
                      total: colors[0],
                      "Post-dispo": colors[1],
                    }}
                    toggleFilter={toggleFilter}
                    filterVariables={filterVariables}
                    groupByKey={"Reason for Detention"}
                    showChart={true}
                    innerData={dataArray21}
                    postDispoData={dataArray22}
                    maxLabelWidth={maxLabelWidth}
                    setMaxLabelWidth={setMaxLabelWidth}
                  />
                )}
              </div>
            </ChartCard>
            {/* Admissions by Category */}
            <ChartCard width="100%">
              <div
                style={{
                  height: `${columnHeights.column3[1]}px`,
                  width: "100%",
                }}
              >
                {dataArray16.length > 0 && (
                  <StackedBarChartGeneric
                    data={dataArray16}
                    breakdowns={["total"]}
                    innerBreakdowns={["Pre-dispo"]}
                    height={columnHeights.column3[1]}
                    margin={{ top: 20, right: 40, bottom: 4, left: 20 }}
                    chartTitle={"Admissions by Offense Category (pre-dispo)"}
                    colorMapOverride={{
                      "Pre-dispo": colors[0],
                      total: colors[0],
                      "Post-dispo": colors[1],
                    }}
                    toggleFilter={toggleFilter}
                    filterVariables={filterVariables}
                    groupByKey={"Offense Category"}
                    // Decide whether to display enhanced tooltip
                    showChart={true}
                    innerData={dataArray21}
                    maxLabelWidth={maxLabelWidth}
                    setMaxLabelWidth={setMaxLabelWidth}
                  />
                )}
              </div>
            </ChartCard>

            {/* Admissions by Jurisdiction */}
            <ChartCard width="100%">
              <div
                style={{
                  height: `${columnHeights.column3[2]}px`,
                  width: "100%",
                }}
              >
                {dataArray17.length > 0 && (
                  <StackedBarChartGeneric
                    data={dataArray17}
                    breakdowns={["total"]}
                    height={columnHeights.column3[2]}
                    margin={{ top: 20, right: 40, bottom: 4, left: 20 }}
                    chartTitle={"Admissions by Jurisdiction"}
                    colorMapOverride={{
                      "Pre-dispo": colors[0],
                      total: colors[0],
                      "Post-dispo": colors[1],
                    }}
                    toggleFilter={toggleFilter}
                    filterVariables={filterVariables}
                    groupByKey={"Jurisdiction"}
                    showChart={false}
                    maxLabelWidth={maxLabelWidth}
                    setMaxLabelWidth={setMaxLabelWidth}
                  />
                )}
              </div>
            </ChartCard>
          </div>
        </div>
      </div>
    </div>
  );
}
