import React from "react";
import * as d3 from "d3";
import { dateDiff } from "./../../utils/dateDiff";

const calculateLengthOfStay = (record) => {
  const exitDate = record.Release_Date
    ? new Date(record.Release_Date)
    : record.ATD_Exit_Date
    ? new Date(record.ATD_Exit_Date)
    : null;

  const admissionDate = record.Intake_Date
    ? new Date(record.Intake_Date)
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

const getAverage = (arr) => {
  if (arr.length === 0) return null;
  const sum = arr.reduce((acc, val) => acc + calculateLengthOfStay(val), 0);
  return sum / arr.length;
};

const getMedian = (arr) => {
  if (arr.length === 0) return null;

  const sorted = [...arr].sort(
    (a, b) => calculateLengthOfStay(a) - calculateLengthOfStay(b)
  );

  const mid = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (
      (calculateLengthOfStay(sorted[mid - 1]) +
        calculateLengthOfStay(sorted[mid])) /
      2
    );
  } else {
    return calculateLengthOfStay(sorted[mid]);
  }
};

const DistributionChart = (records, year = 2024, type = "secure-detention") => {
  if (!records.data || records.data.length === 0) return;
  const data = records.data
    .filter(
      (record) =>
        getYear(
          type === "secure-detention"
            ? record.Admission_Date
            : record.ADT_Entry_Date
        ) === year && calculateLengthOfStay(record)
    )
    .sort((a, b) => calculateLengthOfStay(a) - calculateLengthOfStay(b));

  const margin = { top: 10, right: 10, bottom: 10, left: 10 },
    width = 600 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  const innerWidth = width - margin.left - margin.right;

  const innerHeight = height - margin.top - margin.bottom;

  // Scales
  const xScale = d3
    .scaleBand()
    .domain(data.map((d) => d.Youth_ID + "-" + d.Referral_ID))
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(data, (d) => calculateLengthOfStay(d))])
    .range([innerHeight, 0]);

  return (
    <svg width={width} height={height}>
      <g transform={`translate(${margin.left},${margin.top})`}>
        {/* Bars */}
        {data.map((d) => (
          <rect
            key={d.Youth_ID + "-" + d.Referral_ID}
            x={xScale(d.Youth_ID + "-" + d.Referral_ID)}
            y={yScale(calculateLengthOfStay(d))}
            width={1}
            height={innerHeight - yScale(calculateLengthOfStay(d))}
            fill="steelblue"
            rx={4}
          />
        ))}
      </g>
      <g transform={`translate(${margin.left},${margin.top})`}>
        <rect
          key={"median-rect"}
          x={0}
          y={yScale(getMedian(data))}
          width={innerWidth}
          height={2}
          fill="black"
          rx={4}
        />
        <text
          key={"median-rect-text"}
          x={10}
          y={
            yScale(getMedian(data)) +
            (getMedian(data) >= getAverage(data) ? -28 : 16)
          }
          fill="black"
        >
          Median: {Math.round(getMedian(data))} days
        </text>
        <rect
          key={"average-rect"}
          x={0}
          y={yScale(getAverage(data))}
          width={innerWidth}
          height={2}
          fill="black"
          rx={4}
        />
        <text
          key={"average-rect-text"}
          x={10}
          y={
            yScale(getMedian(data)) +
            (getMedian(data) < getAverage(data) ? -28 : 16)
          }
          fill="black"
        >
          Average: {Math.round(getAverage(data))} days
        </text>
      </g>
    </svg>
  );
};

export default DistributionChart;
