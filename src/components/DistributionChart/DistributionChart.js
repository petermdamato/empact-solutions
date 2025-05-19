import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { dateDiff } from "./../../utils/dateDiff";

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

const colors = (
  detentionType = "alternative-to-detention",
  exploreType = "Overall Total"
) => {
  return detentionType === "alternative-to-detention"
    ? {
        1: "#006890",
        0: "#ff7b00",
      }
    : exploreType === "Pre/post-dispo"
    ? {
        pre: "#006890",
        post: "#ff7b00",
      }
    : {
        all: "#006890",
      };
};

const getYear = (date) => new Date(date).getFullYear();

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
  return sorted.length % 2 === 0
    ? (calculateLengthOfStay(sorted[mid - 1]) +
        calculateLengthOfStay(sorted[mid])) /
        2
    : calculateLengthOfStay(sorted[mid]);
};

const DistributionChart = (records) => {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(600); // default fallback
  const colorScale = colors(records.detentionType, records.exploreType);

  // Resize observer to detect container size
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) observer.unobserve(containerRef.current);
    };
  }, [records]);

  const margin = { top: 10, right: 10, bottom: 10, left: 10 };
  const height = 400;
  const width = containerWidth;

  if (!records.data || records.data.length === 0) return null;
  const dataCopy = [...records.data];
  const data = dataCopy
    .filter((record) => {
      return (
        getYear(
          records.detentionType === "secure-detention"
            ? record.Admission_Date
            : record.ATD_Entry_Date
        ) === +records.selectedYear && calculateLengthOfStay(record)
      );
    })
    .sort((a, b) => calculateLengthOfStay(a) - calculateLengthOfStay(b));

  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

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
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {data.map((d) => {
            return (
              <rect
                key={d.Youth_ID + "-" + d.Referral_ID}
                x={xScale(d.Youth_ID + "-" + d.Referral_ID)}
                y={yScale(calculateLengthOfStay(d))}
                width={xScale.bandwidth()}
                height={innerHeight - yScale(calculateLengthOfStay(d))}
                fill={
                  colorScale[
                    records.detentionType === "alternative-to-detention"
                      ? d.ATD_Successful_Exit
                      : records.exploreType === "Pre/post-dispo"
                      ? d["Post-Dispo Stay Reason"] === null ||
                        d["Post-Dispo Stay Reason"] === ""
                        ? "pre"
                        : "post"
                      : "all"
                  ]
                }
                rx={4}
              />
            );
          })}

          {/* Median line */}
          <rect
            x={0}
            y={yScale(getMedian(data))}
            width={innerWidth}
            height={2}
            fill="black"
            rx={4}
          />
          <text
            x={10}
            y={
              yScale(getMedian(data)) +
              (getMedian(data) >= getAverage(data) ? -28 : 16)
            }
            fill="black"
          >
            Median: {Math.round(getMedian(data))} days
          </text>

          {/* Average line */}
          <rect
            x={0}
            y={yScale(getAverage(data))}
            width={innerWidth}
            height={2}
            fill="black"
            rx={4}
          />
          <text
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
    </div>
  );
};

export default DistributionChart;
