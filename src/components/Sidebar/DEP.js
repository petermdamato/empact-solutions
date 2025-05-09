import React, { useState } from "react";
import Pill from "./../Pill/Pill";
import ChangeStatistics from "../ChangeStatistics/ChangeStatistics";
import StackedBarChart from "../StackedBar/StackedBar";
import StackedBarChartMulti from "../StackedBar/StackedBarMulti";
import ColumnChart from "../ColumnChart/ColumnChart";
import ColumnChartMulti from "../ColumnChart/ColumnChartMulti";
import "./PillContainer.css";
const data1 = [
  { category: "Male", pre: 30, post: 20 },
  { category: "Female", pre: 20, post: 5 },
  { category: "Trans Male", pre: 2, post: 2 },
  { category: "Trans Female", pre: 2, post: 2 },
  { category: "Non-Binary", pre: 1, post: 0 },
  { category: "Agender", pre: 1, post: 0 },
  { category: "Pangender", pre: 0, post: 1 },
];

const data2 = [
  { category: "Latino", pre: 50, post: 15 },
  { category: "Unknown", pre: 20, post: 30 },
  { category: "American Indian/Alaska Native", pre: 20, post: 30 },
  { category: "Black", pre: 10, post: 40 },
  { category: "White", pre: 20, post: 30 },
  { category: "More than one race", pre: 60, post: 10 },
  { category: "Asian/Pacific Islander", pre: 10, post: 15 },
];
const data3 = [
  { label: "Total admissions", value: 15 },
  { label: "Total admissions", value: 20 },
];
const data4 = [
  { label: "Pre-dispo", value: 15 },
  { label: "Post-dispo", value: 20 },
];
const data9 = [
  { label: "Pre-dispo", value: 11, secondary: 19 },
  { label: "Post-dispo", value: 17, secondary: 12 },
];
const data5 = [
  { category: "New Offense", pre: 50, post: 0 },
  { category: "Confinement to secure detention", pre: 0, post: 30 },
  { category: "Awaiting placement", pre: 0, post: 25 },
  { category: "Technical", pre: 10, post: 0 },
  { category: "Other post-disto status", pre: 0, post: 15 },
];
const data6 = [
  { label: "Avg daily pop", value: 5.5 },
  { label: "Avg daily pop", value: 7.5 },
];
const data7 = [
  { label: "Days in detention", value: 6.0 },
  { label: "Days in detention", value: 7.0 },
];
const data8 = [
  { category: "New Offense", pre: 8.5, post: 0 },
  { category: "Confinement to secure detention", pre: 0, post: 2.3 },
  { category: "Awaiting placement", pre: 0, post: 2.5 },
  { category: "Technical", pre: 4.5, post: 0 },
  { category: "Other post-disto status", pre: 0, post: 1.3 },
];
const data10 = [
  {
    category: "New Offense",
    pre: 8.5,
    post: 0,
    preSecondary: 11,
    postSecondary: 0,
  },
  {
    category: "Confinement to secure detention",
    pre: 0,
    post: 1.4,
    preSecondary: 0,
    postSecondary: 8,
  },
  {
    category: "Awaiting placement",
    pre: 0,
    post: 4.5,
    preSecondary: 0,
    postSecondary: 9,
  },
  {
    category: "Technical",
    pre: 2.5,
    post: 0,
    preSecondary: 1,
    postSecondary: 3,
  },
  {
    category: "Other post-disto status",
    pre: 0,
    post: 1.9,
    postSecondary: 3,
    preSecondary: 0,
  },
];
const PillContainer = () => {
  const [dropdownValue, setDropdownValue] = useState("Average LOS");

  const handleChange = (evt) => {
    setDropdownValue(evt.target.value);
  };
  return (
    <div className="pill-container">
      <Pill
        title="Who was in detention?"
        subtitle="Showing all youth who were in detention during time period"
      >
        <StackedBarChart
          data={data1}
          width={400}
          height={300}
          margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
          chartTitle={"Population by gender"}
        />
        <StackedBarChart
          data={data2}
          width={400}
          height={300}
          margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
          chartTitle={"Population by race/ethnicity"}
        />
      </Pill>
      <Pill title="Admissions">
        <ChangeStatistics
          data={data3}
          width={400}
          height={300}
          margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          chartTitle={""}
        />
        <ColumnChart
          data={data4}
          width={400}
          height={340}
          margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
          chartTitle={""}
        />
        <StackedBarChart
          data={data5}
          width={400}
          height={300}
          margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
          chartTitle={""}
        />
      </Pill>
      <Pill
        useDropdown
        dropdownOptions={["Median LOS", "Average LOS"]}
        selectedValue={dropdownValue}
        onSelectChange={handleChange}
      >
        <ChangeStatistics
          data={data7}
          width={400}
          height={300}
          margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          chartTitle={""}
        />
        <ColumnChartMulti
          data={data9}
          width={400}
          height={340}
          margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
          primary={"days"}
          secondary={"releases"}
        />
        <StackedBarChartMulti
          data={data10}
          width={400}
          height={300}
          margin={{ top: 20, right: 80, bottom: 30, left: 110 }}
          chartTitle={""}
          primary={"days"}
          secondary={"releases"}
        />
      </Pill>
      <Pill title="ADP">
        <ChangeStatistics
          data={data6}
          width={400}
          height={300}
          margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
          chartTitle={""}
        />
        <ColumnChart
          data={data4}
          width={400}
          height={340}
          margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
          chartTitle={""}
        />
        <StackedBarChart
          data={data8}
          width={400}
          height={300}
          margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
          chartTitle={""}
        />
      </Pill>
    </div>
  );
};

export default PillContainer;
