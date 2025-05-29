"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import { useEffect, useState, useRef } from "react";
import Selector from "@/components/Selector/Selector";
import "./styles.css";
import { analyzeByYear } from "@/utils/aggFunctions";
import LineChartContainerV2 from "@/components/LineChart/LineChartContainerV2";
import DownloadButton from "@/components/DownloadButton/DownloadButton";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return !dateStr || dateStr === undefined || isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [dataArray3, setDataArray3] = useState([]);
  const [incarcerationType] = useState("Secure Detention");

  const [programType, setProgramType] = useState("All Program Types");
  const [calculationType, setCalculationType] = useState("average");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);

  useEffect(() => {
    const dataArray = csvData.filter(
      (record) =>
        programType === "All Program Types" || record.Facility === programType
    );
    setDataArray3(
      analyzeByYear(dataArray, {
        detentionType: "secure-detention",
        bySuccess: false,
        byDispo: true,
      })
    );
  }, [csvData, programType]);

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
            subtitle={"Secure Detention Trends"}
            dekWithYear={`Showing trends in secure detention`}
          >
            <DownloadButton
              elementRef={contentRef}
              filename="secure-detention-explore-trends.pdf"
            />
          </Header>
          <div
            style={{ display: "flex", flexDirection: "column" }}
            ref={contentRef}
          >
            <div style={{ display: "flex" }}>
              <LineChartContainerV2
                charts={["entries", "averageDailyPopulation"]}
                data={dataArray3}
              />
            </div>
            <div style={{ display: "flex" }}>
              <LineChartContainerV2
                charts={[`${calculationType}LengthOfStay`, "exits"]}
                data={dataArray3}
                selectorChild={["on", "off"]}
              >
                {" "}
                <Selector
                  values={["average", "median"]}
                  variable={"Calculation Type"}
                  selectedValue={calculationType}
                  setValue={setCalculationType}
                />
              </LineChartContainerV2>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
