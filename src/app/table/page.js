"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState, useRef } from "react";
import "./styles.css";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import { dataAnalysis } from "@/utils/aggFunctions";

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [dataArray4, setDataArray4] = useState([]);
  const [detentionType] = useState("secure-detention");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [yearsArray, setYearsArray] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandForDownload, setExpandForDownload] = useState(false);

  const onSelectChange = (e) => {
    setSelectedYear(+e);
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

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      const updatedDataArray1 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "countAdmissions",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];

      const updatedDataArray2 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "countReleases",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];

      const updatedDataArray3 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "lengthOfStay",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];

      const updatedDataArray4 = [
        [
          {
            category: "Gender",
            header: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "Gender"
            ),
          },
          {
            category: "Age at admission",
            header: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "Age"
            ),
          },
          {
            category: "Race/ethnicity",
            header: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType
            ),
            body: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "RaceEthnicity"
            ),
          },
          {
            category: "New offenses (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Technicals (pre-dispo)",
            header: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
          {
            category: "Post-disposition",
            header: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseOverall"
            ),
            body: dataAnalysis(
              csvData,
              "averageDailyPopulation",
              selectedYear,
              detentionType,
              "OffenseCategory"
            ),
          },
        ],
      ];

      setDataArray1(updatedDataArray1);
      setDataArray2(updatedDataArray2);
      setDataArray3(updatedDataArray3);
      setDataArray4(updatedDataArray4);
      setLoading(false);
    }, 0);
  }, [csvData, selectedYear]);

  return (
    <div
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div
          style={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            height: expandForDownload ? "1800px" : "100%",
          }}
          className="full-height"
          ref={contentRef}
        >
          <Header
            title="Secure Detention Utilization"
            subtitle="Table"
            selectedYear={selectedYear}
            onSelectChange={onSelectChange}
            dropdownOptions={yearsArray}
            year={selectedYear}
            useDropdown
          >
            <DownloadButton
              elementRef={contentRef}
              filename="secure-detention-table.pdf"
              orientation="portrait"
              onBeforeDownload={() => setExpandForDownload(true)}
              onAfterDownload={() => setExpandForDownload(false)}
            />
          </Header>
          <div
            style={{
              flexGrow: 1,
              overflowY: expandForDownload ? "visible" : "auto",
              maxHeight: expandForDownload ? "none" : "100%",
            }}
            className="scrollable-content"
          >
            {loading ? (
              <div className="spinner-container">
                <div className="spinner" />
              </div>
            ) : (
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
                    data: dataArray3,
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
    </div>
  );
}
