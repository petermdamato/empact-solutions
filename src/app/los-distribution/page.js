"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState, useRef } from "react";
import Selector from "@/components/Selector/Selector";
import "./styles.css";
import DownloadButton from "@/components/DownloadButton/DownloadButton";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [incarcerationType] = useState("Secure Detention Utilization");
  const [selectedYear, setSelectedYear] = useState(2024);
  const [exploreType, setExploreType] = useState("Overall Total");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);
  const [legendOptions, setLegendOptions] = useState([]);
  const [selectedLegendOptions, setSelectedLegendOptions] = useState([]);

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
    setYearsArray(
      [...new Set(csvData.map((obj) => parseDateYear(obj.ATD_Exit_Date)))]
        .filter((entry) => entry !== null)
        .sort((a, b) => a - b)
    );
    let programTypeArrayInt = [...new Set(csvData.map((obj) => obj.Facility))]
      .filter((entry) => entry !== null && entry !== "")
      .sort((a, b) => a - b);

    const programTypeArrayFinal = [...programTypeArrayInt, "All Program Types"];

    setProgramTypeArray(programTypeArrayFinal);
  }, [csvData]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div
          style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}
          ref={contentRef}
        >
          <Header
            title={`${incarcerationType}`}
            subtitle={`LOS Distribution`}
            dekWithYear={`Showing length-of-stay (LOS) distribution across ${exploreType}`}
          >
            <Selector
              values={["Overall Total", "Pre/post-dispo"]}
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
          <div style={{ display: "flex" }}>
            {dataArray1 && (
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
                legendOptions={legendOptions}
                selectedLegendOptions={selectedLegendOptions}
                setLegendOptions={setLegendOptions}
                setSelectedLegendOptions={setSelectedLegendOptions}
              />
            )}
            {dataArray2 && (
              <PillContainer
                display={"double"}
                data={[
                  {
                    title: "Number of releases within LOS bucket",
                    subtitle: "Hover over the legend to highlight a category.",
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
