"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState, useRef, useCallback } from "react";
import Selector from "@/components/Selector/Selector";
import "./styles.css";
import DownloadButton from "@/components/DownloadButton/DownloadButton";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData, fileName } = useCSV();
  const router = useRouter();
  const contentRef = useRef();
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [incarcerationType] = useState("Secure Detention Utilization");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [exploreType, setExploreType] = useState("Overall Total");
  const [yearsArray, setYearsArray] = useState([]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);
  const [legendOptions, setLegendOptions] = useState([]);
  const [selectedLegendOptions, setSelectedLegendOptions] = useState([]);

  // Memoize the filter dimension setter
  const memoizedSetFilterDimension = useCallback((dimension) => {
    setFilterDimension(dimension);
  }, []);

  useEffect(() => {
    if (!router) return; // router not yet mounted

    if (!csvData || csvData.length === 0) {
      router.push("/detention-overview");
    }
  }, [csvData, router]);

  useEffect(() => {
    setDataArray1([
      {
        title: "distribution",
        data: csvData,
      },
    ]);
    setDataArray2([
      {
        title: "stacked-column",
        data: csvData,
      },
    ]);
  }, [csvData]);

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

    let programTypeArrayInt = [
      ...new Set(csvData.map((obj) => obj["ATD_Program_Name"])),
    ]
      .filter((entry) => entry !== null && entry !== "")
      .sort((a, b) => a - b);

    const programTypeArrayFinal = [...programTypeArrayInt, "All Program Types"];

    setProgramTypeArray(programTypeArrayFinal);
  }, [csvData, fileName]);

  return (
    <div style={{ width: "100%" }}>
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div
          style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}
          ref={contentRef}
        >
          <Header
            title={`${incarcerationType}`}
            subtitle={`LOS Distribution`}
            dekWithYear={`Showing length-of-stay (LOS) distribution across ${
              exploreType.includes("YOC")
                ? "YOC/white"
                : exploreType.toLowerCase()
            }`}
          >
            <Selector
              values={[
                "Overall Total",
                "Pre/post-dispo",
                "YOC/white",
                "Race/Ethnicity",
                "Gender",
                "Offense category (pre-dispo)",
                "Age at entry",
              ]}
              variable={"Explore"}
              selectedValue={exploreType}
              setValue={setExploreType}
            />
            <Selector
              values={yearsArray}
              variable={"Year"}
              selectedValue={selectedYear}
              setValue={setSelectedYear}
            />
            <DownloadButton
              elementRef={contentRef}
              filename="secure-detention-length-of-stay-distribution.pdf"
            />
          </Header>
          <div style={{ display: "flex", width: "100%" }}>
            {dataArray1 && (
              <div style={{ flex: 1 }}>
                <PillContainer
                  display={"double"}
                  data={[
                    {
                      title: "LOS distribution trends (days)",
                      subtitle:
                        "Each bar = 1 release within the selected time period. Hover over the legend to highlight a category.",
                      data: dataArray1,
                      charts: ["distribution"],
                      chartTitles: ["LOS Distribution"],
                      detentionType: ["secure-detention"],
                      selectedYear: [selectedYear],
                      exploreType: [exploreType],
                    },
                  ]}
                  exploreType={exploreType}
                  legendOptions={legendOptions}
                  selectedLegendOptions={selectedLegendOptions}
                  setLegendOptions={setLegendOptions}
                  setSelectedLegendOptions={setSelectedLegendOptions}
                />
              </div>
            )}
            {dataArray2 && (
              <div style={{ flex: 1 }}>
                <PillContainer
                  display={"double"}
                  data={[
                    {
                      title: "Number of releases within LOS bucket",
                      subtitle:
                        "Hover over the legend to highlight a category.",
                      data: dataArray2,
                      charts: ["stacked-column"],
                      chartTitles: ["Number of releases within LOS bucket"],
                      detentionType: ["secure-detention"],
                      selectedYear: [selectedYear],
                      exploreType: [exploreType],
                    },
                  ]}
                  selectedLegendOptions={selectedLegendOptions}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
