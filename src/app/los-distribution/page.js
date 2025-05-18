"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import PillContainer from "@/components/PillContainer/PillContainer";
import { useEffect, useState } from "react";
import Selector from "@/components/Selector/Selector";
import "./styles.css";
import { aggregateByLos } from "@/utils";
import { analyzeByYear } from "@/utils/aggFunctions";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData } = useCSV();

  const [dataArray1, setDataArray1] = useState([]);
  const [dataArray2, setDataArray2] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [incarcerationType] = useState("Secure Detention Utilization");
  const [selectedYear, setSelectedYear] = useState(2024);
  // exploreType options: Overall Total | Pre/post-dispo
  const [exploreType, setExploreType] = useState("Overall Total");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);

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
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title={`${incarcerationType}`}
            subtitle={`LOS Distribution`}
            dekWithYear={`Showing length-of-stay (LOS) distribution`}
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
          </Header>
          <div style={{ display: "flex" }}>
            {dataArray1 && (
              <PillContainer
                display={"double"}
                data={[
                  {
                    title: "LOS",
                    data: dataArray1,
                    charts: ["distribution"],
                    chartTitles: ["LOS Distribution"],
                    detentionType: ["secure-detention"],
                    selectedYear: [selectedYear],
                    exploreType: [exploreType],
                  },
                ]}
              />
            )}
            {dataArray2 && (
              <PillContainer
                display={"double"}
                data={[
                  {
                    title: "Number of exits within LOS bucket",
                    data: dataArray2,
                    charts: ["stacked-column"],
                    chartTitles: ["Number of exits within LOS bucket"],
                    detentionType: ["secure-detention"],
                    selectedYear: [selectedYear],
                    exploreType: [exploreType],
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
