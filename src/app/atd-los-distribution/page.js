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
import { analyzeByYear } from "@/utils/aggFunctions";

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
  const [incarcerationType] = useState("ATD Utilization");
  const [selectedYear, setSelectedYear] = useState(2025);
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);
  const [filterDimension, setFilterDimension] = useState("Disruptions");
  const [legendOptions, setLegendOptions] = useState([]);
  const [selectedLegendOptions, setSelectedLegendOptions] = useState([]);

  // Memoize the filter dimension setter
  const memoizedSetFilterDimension = useCallback((dimension) => {
    setFilterDimension(dimension);
  }, []);

  useEffect(() => {
    if (!csvData || csvData.length === 0) {
      router.push("/detention-overview");
    }
  }, [csvData, router]);

  useEffect(() => {
    setDataArray1([
      {
        title: "distribution",
        data: csvData.filter(
          (entry) =>
            programType === "All Program Types" ||
            entry.ATD_Program_Name === programType
        ),
      },
    ]);
    setDataArray2([
      {
        title: "stacked-column",
        data: csvData.filter(
          (entry) =>
            programType === "All Program Types" ||
            entry.ATD_Program_Name === programType
        ),
      },
    ]);
  }, [csvData, programType]);

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
      ...new Set(csvData.map((obj) => parseDateYear(obj.ATD_Exit_Date))),
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
            subtitle={`LOS Distribution - ${programType}`}
            dekWithYear={`Showing length-of-stay (LOS) distribution trends for ${selectedYear}`}
          >
            <Selector
              values={yearsArray}
              variable={"Year"}
              selectedValue={selectedYear}
              setValue={setSelectedYear}
            />
            <Selector
              values={programTypeArray}
              variable={"Program Type"}
              selectedValue={programType}
              setValue={setProgramType}
            />
            <DownloadButton
              elementRef={contentRef}
              filename="alternative-to-detention-los-distribution.pdf"
            />
          </Header>
          <div>
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
                        detentionType: ["alternative-to-detention"],
                        selectedYear: [selectedYear],
                        useFilterDropdown: true,
                        filterDimension,
                        setFilterDimension: memoizedSetFilterDimension,
                      },
                    ]}
                    legendOptions={legendOptions}
                    selectedLegendOptions={selectedLegendOptions}
                    setLegendOptions={setLegendOptions}
                    setSelectedLegendOptions={setSelectedLegendOptions}
                  />
                </div>
              )}

              <div style={{ flex: 1 }}>
                {dataArray2 && (
                  <PillContainer
                    display={"double"}
                    data={[
                      {
                        title: "Number of exits within LOS bucket",
                        subtitle: "Click on the bars to highlight by category.",
                        data: dataArray2,
                        charts: ["stacked-column"],
                        chartTitles: ["Number of exits within LOS bucket"],
                        detentionType: ["alternative-to-detention"],
                        selectedYear: [selectedYear],
                        useFilterDropdown: true,
                        filterDimension,
                      },
                    ]}
                    selectedLegendOptions={selectedLegendOptions}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
