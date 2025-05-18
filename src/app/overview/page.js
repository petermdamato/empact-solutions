"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState } from "react";
import "./styles.css";
import {
  aggregateByGender,
  aggregateByRace,
  aggregateByStatus,
  aggregateCalculationByStatus,
  aggregateMedianByStatus,
  aggregatePopulationByStatus,
  aggregatePrePost,
} from "@/utils";
import { isLeapYear } from "date-fns";

export default function Overview() {
  const { csvData } = useCSV();
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [detentionType] = useState("secure-detention");
  const [calculation, setCalculation] = useState("Average LOS");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [yearsArray, setYearsArray] = useState([]);

  const onSelectChange = (e) => {
    setSelectedYear(e.target.value);
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
    const statusData = aggregateByStatus(csvData, selectedYear, detentionType);
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

    const statusDataCalculations = aggregateCalculationByStatus(
      csvData,
      selectedYear,
      detentionType
    );
    const statusDataMedian = aggregateMedianByStatus(
      csvData,
      selectedYear,
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

    setDataArray3(
      calculation.toLowerCase().includes("average")
        ? [
            // The statistic and change stat calculations (currently only average)
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
            ["post", "pre"].map((key) => ({
              label: key === "pre" ? "Pre-dispo" : "Post-dispo",
              value: columnAggCalculations[key],
              days: columnAggCalculations[
                `days${key.charAt(0).toUpperCase()}${key.slice(1)}`
              ],
            })),
            statusDataCalculations.results,
          ]
        : [
            [
              statusDataMedian.overall.all.median,
              statusDataMedian.previousPeriod.median,
            ],
            // The statistic and change stat calculations (currently only mapped as average)
            ["post", "pre"].map((key) => ({
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
    const statusDataPopulation = aggregatePopulationByStatus(
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
          ((columnAggPopulations.pre + columnAggPopulations.post) * 10) /
            (isLeapYear(selectedYear) ? 366 : 365)
        ) / 10,
        statusDataPopulation.previousPeriodCount,
      ],
      ["post", "pre"].map((key) => ({
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
    console.log(dataArray4);
  }, [csvData, selectedYear, calculation]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title="Secure Detention Utilization"
            subtitle="Snapshot"
            selectedYear={selectedYear}
            onSelectChange={onSelectChange}
            dropdownOptions={yearsArray}
            useDropdown
          />
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
                    title: "Who was in detention?",
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
  );
}
