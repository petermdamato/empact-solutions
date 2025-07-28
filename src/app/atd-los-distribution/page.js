"use client";

import { useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState, useRef, useCallback } from "react";
import Selector from "@/components/Selector/Selector";
import "./styles.css";
import { aggregateByLos } from "@/utils";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import { analyzeByYear } from "@/utils/aggFunctions";

const getFilterValue = (entry, dimension) => {
  switch (dimension) {
    case "Race/Ethnicity":
      return entry.Race_Ethnicity;
    case "Disruptions":
      return entry.ATD_Success;
    case "Age":
      return entry.Age_Group;
    default:
      return null;
  }
};

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData } = useCSV();
  const router = useRouter();
  const contentRef = useRef();
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [incarcerationType] = useState("ATD Utilization");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [programType, setProgramType] = useState("All Program Types");
  const [yearsArray, setYearsArray] = useState([2024]);
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
      router.push("/overview");
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
    setDataArray3(
      analyzeByYear(csvData, {
        detentionType: "alternative-to-detention",
        bySuccess: true,
      })
    );
  }, [csvData, programType]);

  useEffect(() => {
    setYearsArray(
      [...new Set(csvData.map((obj) => parseDateYear(obj.ATD_Exit_Date)))]
        .filter((entry) => entry !== null)
        .sort((a, b) => a - b)
    );
    let programTypeArrayInt = [
      ...new Set(csvData.map((obj) => obj["ATD_Program_Name"])),
    ]
      .filter((entry) => entry !== null && entry !== "")
      .sort((a, b) => a - b);

    const programTypeArrayFinal = [...programTypeArrayInt, "All Program Types"];

    setProgramTypeArray(programTypeArrayFinal);
  }, [csvData]);

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
