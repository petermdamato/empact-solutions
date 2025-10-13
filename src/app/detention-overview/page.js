"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState, useRef } from "react";
import "./styles.css";
import {
  aggregateByGender,
  aggregateByRace,
  aggregateByOffense,
  aggregateCalculationByOffense,
  aggregateMedianByOffense,
  aggregatePopulationByOffense,
} from "@/utils";
import { isLeapYear } from "date-fns";
import DownloadButton from "@/components/DownloadButton/DownloadButton";

export default function Overview() {
  const { csvData, fileName } = useCSV();
  const router = useRouter();
  const contentRef = useRef();
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [detentionType] = useState("secure-detention");
  const [calculation, setCalculation] = useState("Average LOS");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [yearsArray, setYearsArray] = useState([]);

  const onSelectChange = (e) => {
    setSelectedYear(e);
  };

  useEffect(() => {
    if (!csvData || csvData.length === 0) {
      router.push("/detention-overview");
    }
  }, [csvData, router]);

  useEffect(() => {
    let yearsArray;

    if (fileName && fileName.length > 0) {
      const match = fileName.match(/(\d{8}).*?(\d{8})/);
      if (match) {
        yearsArray = [match[1], match[2]];
      }
    }

    const uniqueYears = [
      ...new Set(
        csvData.map((row) => {
          const date = new Date(row.Admission_Date);
          return date.getFullYear();
        })
      ),
    ]
      .sort()
      .filter((year) => {
        // Check if year is a valid number
        if (isNaN(year)) return false;

        // Extract years from yearsArray if they exist
        const startYear =
          yearsArray && yearsArray[0]
            ? parseInt(yearsArray[0].slice(4, 8))
            : null;
        const endYear =
          yearsArray && yearsArray[1]
            ? parseInt(yearsArray[1].slice(4, 8))
            : null;

        const meetsStartCondition = !startYear || year >= startYear;
        const meetsEndCondition = !endYear || year <= endYear;

        return meetsStartCondition && meetsEndCondition;
      });

    setSelectedYear(uniqueYears[uniqueYears.length - 1]);
    setYearsArray(uniqueYears);
  }, [csvData, fileName]);

  const handleSelectChange = (event) => {
    setCalculation(event.target.value);
  };

  useEffect(() => {
    setDataArray1([
      aggregateByGender(csvData, selectedYear, detentionType),
      aggregateByRace(csvData, selectedYear, detentionType),
    ]);
    const statusData = aggregateByOffense(csvData, selectedYear, detentionType);
    const columnAgg = statusData.results.reduce(
      (acc, curr) => {
        acc.post += curr.post;
        acc.pre += curr.pre;
        return acc;
      },
      { post: 0, pre: 0 }
    );

    // Check if selected year is the earliest year
    const isEarliestYear = selectedYear === Math.min(...yearsArray);
    const previousPeriodCount = isEarliestYear
      ? null
      : statusData.previousPeriodCount;

    setDataArray2([
      [columnAgg.pre + columnAgg.post, previousPeriodCount],
      Object.entries(columnAgg).map(([key, value]) => ({
        label: key === "pre" ? "Pre-dispo" : "Post-dispo",
        value,
      })),
      statusData.results,
    ]);

    const statusDataCalculations = aggregateCalculationByOffense(
      csvData,
      +selectedYear,
      detentionType
    );
    const statusDataMedian = aggregateMedianByOffense(
      csvData,
      +selectedYear,
      detentionType
    );

    const columnAggCalculations = statusDataCalculations.results.reduce(
      (acc, curr) => {
        acc.post += curr.post;
        acc.pre += curr.pre;
        acc.daysPost += curr.daysPost;
        acc.daysPre += curr.daysPre;
        return acc;
      },
      { post: 0, pre: 0, daysPost: 0, daysPre: 0 }
    );

    const columnAggAvgByOffense = statusDataCalculations.results.map(
      (category) => {
        let payload = {};
        payload["category"] = category.category;
        payload["all"] = {};
        payload["all"]["count"] = category.post + category.pre;
        payload["all"]["average"] =
          category.post + category.pre === 0
            ? 0
            : (category.daysPost + category.daysPre) /
              (category.post + category.pre);
        payload["post"] = {
          count: category.post,
          average: category.post === 0 ? 0 : category.daysPost / category.post,
        };
        payload["pre"] = {
          count: category.pre,
          average: category.pre === 0 ? 0 : category.daysPre / category.pre,
        };
        return payload;
      }
    );
    setDataArray3(
      calculation.toLowerCase().includes("average")
        ? [
            [
              Math.round(
                ((columnAggCalculations.daysPre +
                  columnAggCalculations.daysPost) *
                  10) /
                  (columnAggCalculations.pre + columnAggCalculations.post)
              ) / 10,
              isEarliestYear
                ? null
                : statusDataCalculations.previousPeriodCount,
            ],
            // The statistic and change stat calculations (currently only mapped as average)
            ["pre", "post"].map((key) => ({
              label: key === "pre" ? "Pre-dispo" : "Post-dispo",
              value: columnAggCalculations[key],
              days: columnAggCalculations[
                `days${key.charAt(0).toUpperCase()}${key.slice(1)}`
              ],
            })),
            columnAggAvgByOffense.map((status) => ({
              category: status.category,
              countTotal: status.all.count,
              averageTotal: status.all.average,
              averagePre: status.pre.average,
              averagePost: status.post.average,
            })),
          ]
        : [
            [
              statusDataMedian.overall.all.median,
              isEarliestYear ? null : statusDataMedian.previousPeriod.median,
            ],
            ["pre", "post"].map((key) => ({
              label: key === "pre" ? "Pre-dispo" : "Post-dispo",
              value: statusDataMedian.overall[key].count,
              days: statusDataMedian.overall[key].median,
            })),
            statusDataMedian.byStatus.map((status) => ({
              category: status.category,
              countTotal: status.all.count,
              medianTotal: status.all.median,
              medianPre: status.pre.median,
              medianPost: status.post.median,
            })),
          ]
    );

    const statusDataPopulation = aggregatePopulationByOffense(
      csvData,
      selectedYear,
      detentionType
    );

    const columnAggPopulations = statusDataPopulation.results.reduce(
      (acc, curr) => {
        acc.post += curr.post;
        acc.pre += curr.pre;
        return acc;
      },
      { post: 0, pre: 0 }
    );

    setDataArray4([
      [
        Math.round(
          (columnAggPopulations.pre + columnAggPopulations.post) * 10
        ) / 10,
        isEarliestYear ? null : statusDataPopulation.previousPeriodCount,
      ],
      ["pre", "post"].map((key) => ({
        label: key === "pre" ? "Pre-dispo" : "Post-dispo",
        value: columnAggPopulations[key],
        days: isLeapYear(selectedYear) ? 366 : 365,
      })),
      statusDataPopulation.results.map((entry) => {
        entry.daysPre = isLeapYear(selectedYear) ? 366 : 365;
        entry.daysPost = isLeapYear(selectedYear) ? 366 : 365;
        return entry;
      }),
    ]);
  }, [csvData, selectedYear, calculation, yearsArray]); // Added yearsArray to dependencies

  return (
    <div className="max-w-xl mx-auto mt-10" style={{ height: "100vh" }}>
      <div style={{ display: "flex", height: "100%" }}>
        <Sidebar /> {/* Sidebar will take full height of parent */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minWidth: 0,
            overflowY: "auto", // enables scrolling
            maxHeight: "100vh", // ensures it doesn't exceed viewport
          }}
          ref={contentRef}
        >
          <Header
            title="Secure Detention Utilization"
            subtitle="Overview"
            selectedYear={selectedYear}
            onSelectChange={onSelectChange}
            dropdownOptions={yearsArray}
            year={selectedYear}
            useDropdown
            useLegendStatic
          >
            <DownloadButton
              elementRef={contentRef}
              filename={`secure-detention-${selectedYear}-overview.pdf`}
            />
          </Header>

          <div style={{ display: "flex", justifyContent: "space-around" }}>
            {csvData && csvData.length > 0 ? (
              dataArray1 &&
              dataArray1.length > 0 &&
              dataArray2 &&
              dataArray2.length > 0 &&
              dataArray3 &&
              dataArray3.length > 0 &&
              dataArray4 &&
              dataArray4.length > 0 && (
                <PillContainer
                  data={[
                    {
                      title: "Population",
                      subtitle:
                        "Showing all youth who were in detention during time period",
                      data: dataArray1,
                      charts: ["stacked-bar", "stacked-bar"],
                      chartTitles: [
                        "Population by gender",
                        "Population by race/ethnicity",
                      ],
                    },
                    {
                      title: "Admissions",
                      data: dataArray2,
                      charts: ["change", "column", "stacked-bar"],
                      chartTitles: ["Total admissions", "", ""],
                    },
                    {
                      title: "LOS",
                      data: dataArray3,
                      charts: ["change", "column", "stacked-bar"],
                      chartTitles: ["Days", "", ""],
                      contexts: ["releases", "releases", "releases"],
                      useDropdown: true,
                      dropdownOptions: ["Average LOS", "Median LOS"],
                      dropdownValue: calculation,
                      onSelectChange: handleSelectChange,
                    },
                    {
                      title: "ADP",
                      data: dataArray4,
                      charts: ["change", "column", "stacked-bar"],
                      chartTitles: ["Average daily pop.", "", ""],
                      contexts: ["population", "population", "population"],
                    },
                  ]}
                />
              )
            ) : (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  height: "400px",
                  justifyContent: "space-around",
                }}
              >
                <div>
                  Use the upload functionality in the top left to upload data
                  for view
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
