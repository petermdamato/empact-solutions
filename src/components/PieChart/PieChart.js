import React from "react";
import * as d3 from "d3";
import { dateDiff } from "./../../utils/dateDiff";

const getAverage = (arr) => {
  if (arr.length === 0) return null;
  const sum = arr.reduce((acc, val) => acc + calculateLengthOfStay(val), 0);
  return sum / arr.length;
};

const groupBy = (arr, accessor) => {
  const groupMap = {};

  arr.forEach((item) => {
    const key = accessor(item);
    if (key !== null && key !== undefined) {
      if (!groupMap[key]) {
        groupMap[key] = [];
      }
      groupMap[key].push(item);
    }
  });

  return Object.entries(groupMap).map(([label, items]) => ({
    label,
    count: items.length,
    average: getAverage(items),
  }));
};

const calculateLengthOfStay = (record) => {
  const exitDate = record.Release_Date
    ? new Date(record.Release_Date)
    : record.ATD_Exit_Date
    ? new Date(record.ATD_Exit_Date)
    : null;

  const admissionDate = record.Admission_Date
    ? new Date(record.Admission_Date)
    : record.ADT_Entry_Date
    ? new Date(record.ADT_Entry_Date)
    : null;

  return admissionDate && exitDate
    ? Math.ceil(dateDiff(admissionDate, exitDate, "days"))
    : null;
};

const getYear = (date) => {
  const thisDate = new Date(date);
  return thisDate.getFullYear();
};

const PieChart = (
  records,
  year = 2024,
  groupByKey = "Screened/not screened",
  type = "secure-detention",
  size = 300,
  chartTitle
) => {
  if (!records.data || records.data.length === 0) return;

  const data = records.data.filter(
    (record) =>
      getYear(
        type === "secure-detention"
          ? record.Admission_Date
          : record.ADT_Entry_Date
      ) === year && calculateLengthOfStay(record)
  );

  const radius = size / 2;
  const color = d3.scaleOrdinal(d3.schemeTableau10);

  const groupedData = groupBy(data, (r) => r[groupByKey]);
  const pieData = d3.pie().value((d) => d.average)(groupedData);
  const arcGen = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md inline-block">
      <div>{records.chartTitle}</div>
      <svg width={size} height={size}>
        <g transform={`translate(${radius},${radius})`}>
          {pieData.map((d, i) => (
            <g key={i}>
              <path
                d={arcGen(d)}
                fill={color(d.data.label)}
                stroke="white"
                strokeWidth={1.5}
              />
              <text
                transform={`translate(${arcGen.centroid(d)})`}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={14}
                fill="#000"
                fontWeight="bold"
              >
                {d.data.label}
              </text>
              <text
                transform={`translate(${arcGen.centroid(d)[0]},${
                  arcGen.centroid(d)[1] + 14
                })`}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={14}
                fill="#000"
              >
                {`${Math.round(d.data.average)} days`}
              </text>
              <text
                transform={`translate(${arcGen.centroid(d)[0]},${
                  arcGen.centroid(d)[1] + 28
                })`}
                textAnchor="middle"
                alignmentBaseline="middle"
                fontSize={14}
                fill="#000"
              >
                {`(${d.data.count} releases)`}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};
export default PieChart;
