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
  aggregatePrePost,
  aggregateByAgeGroup,
} from "@/utils";

import { dataAnalysis } from "@/utils/aggFunctions";

export default function Overview() {
  const { csvData } = useCSV();

  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [selectedYear, setSelectedYear] = useState(2024);
  const [yearsArray, setYearsArray] = useState([]);

  const onSelectChange = (e) => {
    setSelectedYear(e.target.value);
  };

  useEffect(() => {
    const uniqueYears = [
      ...new Set(
        csvData.map((row) => {
          const date = new Date(row.Intake_Date);
          return date.getFullYear();
        })
      ),
    ]
      .sort()
      .filter((year) => !isNaN(year));

    setYearsArray(uniqueYears);
  }, [csvData]);

  useEffect(() => {
    setDataArray1([
      [
        {
          category: "Gender",
          header: dataAnalysis(csvData, "countAdmissions", selectedYear),
          body: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "Gender"
          ),
        },
        {
          category: "Age at admission",
          header: dataAnalysis(csvData, "countAdmissions", selectedYear),
          body: dataAnalysis(csvData, "countAdmissions", selectedYear, "Age"),
        },
        {
          category: "Race/ethnicity",
          header: dataAnalysis(csvData, "countAdmissions", selectedYear),
          body: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "RaceEthnicity"
          ),
        },
        {
          category: "New offenses (pre-dispo)",
          header: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "OffenseCategory"
          ),
        },
        {
          category: "Technicals (pre-dispo)",
          header: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "OffenseCategory"
          ),
        },
        {
          category: "Post-disposition",
          header: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "countAdmissions",
            selectedYear,
            "OffenseCategory"
          ),
        },
      ],
    ]);
    setDataArray2([
      [
        {
          category: "Gender",
          header: dataAnalysis(csvData, "countReleases", selectedYear),
          body: dataAnalysis(csvData, "countReleases", selectedYear, "Gender"),
        },
        {
          category: "Age at admission",
          header: dataAnalysis(csvData, "countReleases", selectedYear),
          body: dataAnalysis(csvData, "countReleases", selectedYear, "Age"),
        },
        {
          category: "Race/ethnicity",
          header: dataAnalysis(csvData, "countReleases", selectedYear),
          body: dataAnalysis(
            csvData,
            "countReleases",
            selectedYear,
            "RaceEthnicity"
          ),
        },
        {
          category: "New offenses (pre-dispo)",
          header: dataAnalysis(
            csvData,
            "countReleases",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "countReleases",
            selectedYear,
            "OffenseCategory"
          ),
        },
        {
          category: "Technicals (pre-dispo)",
          header: dataAnalysis(
            csvData,
            "countReleases",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "countReleases",
            selectedYear,
            "OffenseCategory"
          ),
        },
        {
          category: "Post-disposition",
          header: dataAnalysis(
            csvData,
            "countReleases",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "countReleases",
            selectedYear,
            "OffenseCategory"
          ),
        },
      ],
    ]);
    setDataArray4([
      [
        {
          category: "Gender",
          header: dataAnalysis(csvData, "averageDailyPopulation", selectedYear),
          body: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "Gender"
          ),
        },
        {
          category: "Age at admission",
          header: dataAnalysis(csvData, "averageDailyPopulation", selectedYear),
          body: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "Age"
          ),
        },
        {
          category: "Race/ethnicity",
          header: dataAnalysis(csvData, "averageDailyPopulation", selectedYear),
          body: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "RaceEthnicity"
          ),
        },
        {
          category: "New offenses (pre-dispo)",
          header: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "OffenseCategory"
          ),
        },
        {
          category: "Technicals (pre-dispo)",
          header: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "OffenseCategory"
          ),
        },
        {
          category: "Post-disposition",
          header: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "OffenseOverall"
          ),
          body: dataAnalysis(
            csvData,
            "averageDailyPopulation",
            selectedYear,
            "OffenseCategory"
          ),
        },
      ],
    ]);
  }, [csvData]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title="Secure Detention Utilization"
            subtitle="Snapshot"
            year={2024}
          />
          {dataArray1 && dataArray4 && (
            <PillContainer
              data={[
                {
                  title: "Admissions",
                  data: dataArray1,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
                {
                  title: "Releases",
                  data: dataArray2,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
                {
                  title: "LOS",
                  data: dataArray1,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
                {
                  title: "ADP",
                  data: dataArray4,
                  charts: ["table"],
                  chartTitles: ["Table"],
                },
              ]}
            />
          )}
        </div>
      </div>
    </div>
  );
}
