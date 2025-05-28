"use client";

import Sidebar from "@/components/Sidebar/Sidebar";
import Header from "@/components/Header/Header";
import { useCSV } from "@/context/CSVContext";
import { useEffect, useState, useRef } from "react";
import Selector from "@/components/Selector/Selector";
import "./styles.css";
import { analyzeByYear } from "@/utils/aggFunctions";
import DownloadButton from "@/components/DownloadButton/DownloadButton";
import LineChartContainerV2 from "@/components/LineChart/LineChartContainerV2";
import LegendLine from "@/components/LegendLines/LegendLines";

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData } = useCSV();
  const contentRef = useRef();
  const [breakdownType, setBreakdownType] = useState("Overall Total");
  const [legendOptions, setLegendOptions] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [incarcerationType] = useState("ATD Utilization");
  const [selectedLegendOptions, setSelectedLegendOptions] = useState([]);

  const [programType, setProgramType] = useState("All Program Types");
  const [calculationType, setCalculationType] = useState("average");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray, setProgramTypeArray] = useState([
    "All Program Types",
  ]);
  const [labelsArray] = useState(["Hide", "Show"]);
  const [selectedLabelsChoice, setSelectedLabelsChoice] = useState("Hide");

  useEffect(() => {
    setSelectedLegendOptions([]);
  }, [legendOptions]);

  useEffect(() => {
    const dataArray = csvData.filter(
      (record) =>
        programType === "All Program Types" || record.Facility === programType
    );
    setDataArray3(
      analyzeByYear(dataArray, {
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
    let programTypeArrayInt = [...new Set(csvData.map((obj) => obj.Facility))]
      .filter((entry) => entry !== null && entry !== "")
      .sort((a, b) => a - b);

    const programTypeArrayFinal = [...programTypeArrayInt, "All Program Types"];

    setProgramTypeArray(programTypeArrayFinal);
  }, [csvData]);

  useEffect(() => {
    if (!csvData.length) return;

    let options = [];

    if (breakdownType === "Successful/Unsuccessful") {
      options = [...new Set(csvData.map((d) => d.ATD_Successful_Exit))];
    } else if (breakdownType === "Gender") {
      options = [...new Set(csvData.map((d) => d.Gender))];
    } else if (breakdownType === "Race/Ethnicity") {
      options = [
        ...new Set(
          csvData.map((d) =>
            d.Ethnicity?.toLowerCase() === "hispanic"
              ? "Hispanic"
              : d.Race || "Unknown"
          )
        ),
      ];
    } else if (breakdownType === "Overall Total") {
      options = ["Total"];
    }

    // Clean and sort
    setLegendOptions(options.filter(Boolean).sort());
  }, [csvData, breakdownType]);

  return (
    <div className="max-w-xl mx-auto mt-10">
      <div style={{ display: "flex" }}>
        <Sidebar />
        <div style={{ display: "flex", flexGrow: 1, flexDirection: "column" }}>
          <Header
            title={`${incarcerationType}`}
            subtitle={`Explore Trends - ${programType}`}
            dekWithYear={`Showing year-by-year trends`}
          >
            <Selector
              values={labelsArray}
              variable={"Show Labels"}
              selectedValue={selectedLabelsChoice}
              setValue={setSelectedLabelsChoice}
            />
            <Selector
              values={programTypeArray}
              variable={"Program Type"}
              selectedValue={programType}
              setValue={setProgramType}
            />
            <DownloadButton
              elementRef={contentRef}
              filename="alternative-to-detention-explore.pdf"
            />
          </Header>
          <div
            style={{ display: "flex", flexDirection: "column" }}
            ref={contentRef}
          >
            <div style={{ display: "flex", width: "100%" }}>
              <div className="legend-line">
                <Selector
                  values={[
                    "Overall Total",
                    "Race/Ethnicity",
                    "Gender",
                    "Successful/Unsuccessful",
                  ]}
                  variable={"Explore"}
                  selectedValue={breakdownType}
                  setValue={setBreakdownType}
                />

                <LegendLine
                  options={legendOptions}
                  selectedOptions={selectedLegendOptions}
                  setSelectedOptions={setSelectedLegendOptions}
                />
              </div>
              <LineChartContainerV2
                charts={["entries", "averageDailyPopulation"]}
                data={dataArray3}
                selectedLabelsChoice={selectedLabelsChoice}
              />
            </div>
            <div style={{ display: "flex" }}>
              <LineChartContainerV2
                charts={[`${calculationType}LengthOfStay`, "exits"]}
                data={dataArray3}
                selectorChild={["on", "off"]}
                selectedLabelsChoice={selectedLabelsChoice}
              >
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
