"use client";

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
  aggregatePrePost,
} from "@/utils";
import { isLeapYear } from "date-fns";
import DownloadButton from "@/components/DownloadButton/DownloadButton";

export default function Overview() {
  const { csvData } = useCSV();
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
    const uniqueYears = [
      ...new Set(
        csvData.map((row) => {
          const date = new Date(row.Admission_Date);
          return date.getFullYear();
        })
      ),
    ]
      .sort()
      .filter((year) => !isNaN(year));

    setYearsArray(uniqueYears);
  }, [csvData]);

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

    setDataArray2([
      [columnAgg.pre + columnAgg.post, statusData.previousPeriodCount],
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
              statusDataCalculations.previousPeriodCount,
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
              statusDataMedian.previousPeriod.median,
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
    console.log(dataArray3);
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
          ((columnAggPopulations.pre + columnAggPopulations.post) * 10) /
            (isLeapYear(selectedYear) ? 366 : 365)
        ) / 10,
        statusDataPopulation.previousPeriodCount,
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
  }, [csvData, selectedYear, calculation]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            flexGrow: 1,
            minWidth: 0,
          }}
          ref={contentRef}
        >
          <Header
            title="Secure Detention Utilization"
            subtitle="Snapshot"
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
          <div>
            {dataArray1 &&
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
              )}
          </div>
        </div>
      </div>
    </div>
  );
}
