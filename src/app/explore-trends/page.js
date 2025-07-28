"use client";

import { useRouter } from "next/navigation";
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
import getSimplifiedOffenseCategory from "@/utils/helper";

const breakdownMapping = {
  "Overall Total": "none",
  "Pre/Post-Dispo": "byDispo",
  "Race/Ethnicity": "byRaceEthnicity",
  "YOC/White": "byYOC",
  Gender: "byGender",
  "Age at Intake": "byAge",
  "Age at Admission": "byAge",
  "Offense Category": "byOffenseCategory",
  "Successful/Unsuccessful": "bySuccess",
};

const parseDateYear = (dateStr) => {
  const date = new Date(dateStr);
  const year = date.getFullYear();

  return isNaN(year) ? null : year;
};

export default function Overview() {
  const { csvData, fileName } = useCSV();
  const router = useRouter();
  const contentRef = useRef();
  const [finalChartYear, setFinalChartYear] = useState(null);
  const [breakdownType, setBreakdownType] = useState("Overall Total");
  const [legendOptions, setLegendOptions] = useState([]);
  const [dataArray3, setDataArray3] = useState([]);
  const [incarcerationType] = useState("Secure Detention");
  const [selectedLegendOptions, setSelectedLegendOptions] = useState([]);
  const [selectedLegendDetails, setSelectedLegendDetails] = useState([]);
  const [programType] = useState("All Program Types");
  const [calculationType, setCalculationType] = useState("average");
  const [yearsArray, setYearsArray] = useState([2024]);
  const [programTypeArray] = useState(["All Program Types"]);
  const [labelsArray] = useState(["Hide", "Show"]);
  const [selectedLabelsChoice, setSelectedLabelsChoice] = useState("Hide");

  useEffect(() => {
    if (!csvData || csvData.length === 0) {
      router.push("/overview");
    }
  }, [csvData, router]);

  useEffect(() => {
    if (fileName && fileName.length > 0) {
      const match = fileName.match(/(\d{8}).*?(\d{8})/);
      let secondGroup;
      if (match) {
        secondGroup = match[2];
      }
      setFinalChartYear(secondGroup);
    }
  }, [fileName]);

  useEffect(() => {
    setSelectedLegendOptions([]);
  }, [legendOptions]);

  useEffect(() => {
    const dataArray = csvData.filter(
      (record) =>
        programType === "All Program Types" || record.Facility === programType
    );

    const mappedBreakdown = breakdownMapping[breakdownType] || "none";

    setDataArray3(
      analyzeByYear(dataArray, {
        detentionType: "secure-detention",
        breakdown: mappedBreakdown,
      })
    );
  }, [csvData, programType, breakdownType, selectedLegendOptions]);

  useEffect(() => {
    setYearsArray(
      [...new Set(csvData.map((obj) => parseDateYear(obj.Admission_Date)))]
        .filter((entry) => entry !== null)
        .sort((a, b) => a - b)
    );
  }, [csvData]);

  useEffect(() => {
    if (!csvData.length) return;

    let options = [];

    if (breakdownType === "Gender") {
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
    } else if (breakdownType === "YOC/White") {
      options = ["White", "YOC"];
    } else if (breakdownType === "Offense Category") {
      options = [
        ...new Set(
          csvData.map((d) => getSimplifiedOffenseCategory(d.OffenseCategory))
        ),
      ];
    } else if (breakdownType === "Age at Admission") {
      const getAge = (dobStr, intakeStr) => {
        const dob = new Date(dobStr);
        const intake = new Date(intakeStr);
        if (!dob || !intake || isNaN(dob) || isNaN(intake)) return null;
        return (intake - dob) / (365.25 * 24 * 60 * 60 * 1000);
      };

      const getAgeBracket = (age) => {
        if (age == null || isNaN(age)) return age;
        if (age <= 10) return "10 and younger";
        if (age <= 13) return "11-13";
        if (age <= 17) return "14-17";
        return "18+";
      };

      options = [
        ...new Set(
          csvData.map((d) =>
            getAgeBracket(getAge(d.Date_of_Birth, d.Admission_Date))
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
        <div
          ref={contentRef}
          style={{
            display: "flex",
            flexGrow: 1,
            flexDirection: "column",
            overflowY: "auto",
            maxHeight: "100vh",
          }}
        >
          <Header
            title={`${incarcerationType} Utilization`}
            subtitle={`Explore Trends`}
            dekWithYear={`Showing trended data for admissions, average daily population (ADP), length of stay (LOS) and releases - ${breakdownType}`}
          >
            <Selector
              values={labelsArray}
              variable={"Show Labels"}
              selectedValue={selectedLabelsChoice}
              setValue={setSelectedLabelsChoice}
            />
            <DownloadButton
              elementRef={contentRef}
              filename="secure-detention-explore.pdf"
            />
          </Header>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              maxHeight: "800px",
            }}
          >
            {/* Top Row */}
            <div
              style={{ display: "flex", width: "100%", flex: 1, minHeight: 0 }}
            >
              <div
                className="legend-line"
                style={{ flex: 1, maxWidth: "260px" }}
              >
                <Selector
                  values={[
                    "Overall Total",
                    "Race/Ethnicity",
                    "YOC/White",
                    "Gender",
                    "Age at Admission",
                    "Offense Category",
                  ]}
                  variable={"Explore"}
                  selectedValue={breakdownType}
                  setValue={setBreakdownType}
                />
                <LegendLine
                  options={legendOptions}
                  selectedOptions={selectedLegendOptions}
                  setSelectedOptions={setSelectedLegendOptions}
                  setSelectedLegendDetails={setSelectedLegendDetails}
                />
              </div>
              <div
                style={{
                  flex: 1,
                  minHeight: 0,
                  height: "100%",
                  width: "100%",
                }}
              >
                <LineChartContainerV2
                  charts={["admissions", "averageDailyPopulation"]}
                  data={dataArray3}
                  selectedLabelsChoice={selectedLabelsChoice}
                  selectedLegendOptions={selectedLegendOptions}
                  selectedLegendDetails={selectedLegendDetails}
                  detentionType={incarcerationType}
                  finalChartYear={finalChartYear}
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div
              style={{
                flex: 1,
                minHeight: 0,
                height: "100%",
                width: "100%",
              }}
            >
              <LineChartContainerV2
                charts={[
                  `${calculationType.toLowerCase()}LengthOfStay`,
                  "releases",
                ]}
                data={dataArray3}
                selectorChild={["on", "off"]}
                selectedLabelsChoice={selectedLabelsChoice}
                selectedValue={[calculationType.toLowerCase(), null]}
                selectorPlacement="left"
                selectedLegendOptions={selectedLegendOptions}
                selectedLegendDetails={selectedLegendDetails}
                detentionType={incarcerationType}
                finalChartYear={finalChartYear}
              >
                <Selector
                  values={["Average", "Median"]}
                  variable={"calc"}
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
