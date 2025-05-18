import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const getYear = (date) => new Date(date).getFullYear();

// Utility: Days between two dates
const dateDiffInDays = (start, end) =>
  Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

// Utility: Length of stay buckets
const getLengthOfStayBucket = (days) => {
  if (days <= 3) return "0-3 days";
  if (days <= 7) return "4-7 days";
  if (days <= 14) return "8-14 days";
  if (days <= 30) return "15-30 days";
  return "More than 30 days";
};

const bucketOrder = [
  "0-3 days",
  "4-7 days",
  "8-14 days",
  "15-30 days",
  "More than 30 days",
];
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

const StackedColumnChart = ({
  data,
  chartTitle,
  detentionType,
  selectedYear,
  exploreType,
}) => {
  const ref = useRef();
  const [containerWidth, setContainerWidth] = useState(600);
  const colorScale = colors(detentionType, exploreType);
  // Observe parent width
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        setContainerWidth(entries[0].contentRect.width);
      }
    });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const margin = { top: 40, right: 20, bottom: 40, left: 40 };
  const width = containerWidth;
  const height = 400;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (!data || data.length === 0) return null;
  // Process data
  const grouped = {};

  const dataCopy = [...data];
  const finalData = dataCopy.filter((record) => {
    return (
      getYear(
        detentionType === "secure-detention"
          ? record.Admission_Date
          : record.ATD_Entry_Date
      ) === +selectedYear
    );
  });

  finalData.forEach((d) => {
    const days = dateDiffInDays(
      detentionType === "secure-detention" ? d.Admission_Date : d.ATD_Entry_Date,
      detentionType === "secure-detention" ? d.Release_Date : d.ATD_Exit_Date
    );
    const bucket = getLengthOfStayBucket(days);

    const exit = d.ATD_Successful_Exit === "1" ? "1" : "0";
    const dispo = d["Pre/post-dispo filter"] === "Pre-dispo" ? "pre" : "post";
    if (detentionType === "alternative-to-detention") {
      if (!grouped[bucket]) grouped[bucket] = { 0: 0, 1: 0 };
      grouped[bucket][exit]++;
    } else if (exploreType === "Pre/post-dispo") {
      if (!grouped[bucket]) grouped[bucket] = { pre: 0, post: 0 };
      grouped[bucket][dispo]++;
    } else {
      if (!grouped[bucket]) grouped[bucket] = { all: 0 };
      grouped[bucket]["all"]++;
    }
  });

  // Convert to stacked data format
  const stackedData = bucketOrder.map((bucket) => {
    const group = grouped[bucket] || { 0: 0, 1: 0 };
    return {
      bucket,
      ...group,
      total:
        detentionType === "alternative-to-detention"
          ? group["0"] + group["1"]
          : exploreType === "Pre/post-dispo"
          ? group["pre"] + group["post"]
          : group["all"],
    };
  });

  const stack = d3
    .stack()
    .keys(
      detentionType === "alternative-to-detention"
        ? ["0", "1"]
        : exploreType === "Pre/post-dispo"
        ? ["pre", "post"]
        : ["all"]
    );
  const series = stack(stackedData);

  const xScale = d3
    .scaleBand()
    .domain(bucketOrder)
    .range([0, innerWidth])
    .padding(0.2);

  const yScale = d3
    .scaleLinear()
    .domain([0, d3.max(stackedData, (d) => d.total)])
    .nice()
    .range([innerHeight, 0]);

  return (
    <div ref={ref} style={{ width: "100%" }}>
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {/* Bars */}
          {series.map((layer) =>
            layer.map(([y0, y1], i) => {
              const d = stackedData[i];
              const bucket = d.bucket;
              const x = xScale(bucket);
              const y = yScale(y1);
              const barHeight = yScale(y0) - yScale(y1);
              const value = y1 - y0;
              const percent = Math.round((value / d.total) * 100);

              return (
                <g key={`${bucket}-${layer.key}`}>
                  <rect
                    x={x}
                    y={y}
                    width={xScale.bandwidth()}
                    height={barHeight}
                    fill={colorScale[layer.key]}
                  />
                  {barHeight > 18 && (
                    <text
                      x={x + xScale.bandwidth() / 2}
                      y={y + barHeight / 2}
                      textAnchor="middle"
                      fill="white"
                      fontSize="12"
                    >
                      {value} ({percent}%)
                    </text>
                  )}
                </g>
              );
            })
          )}

          {/* Total labels */}
          {stackedData.map((d, i) => {
            const x = xScale(d.bucket);
            const y = yScale(d.total);
            return (
              <text
                key={`label-${d.bucket}`}
                x={x + xScale.bandwidth() / 2}
                y={y - 5}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
              >
                {d.total}
              </text>
            );
          })}

          {/* X Axis */}
          {bucketOrder.map((bucket) => (
            <text
              key={`x-${bucket}`}
              x={xScale(bucket) + xScale.bandwidth() / 2}
              y={innerHeight + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#333"
            >
              {bucket}
            </text>
          ))}

          {/* Y Axis ticks */}
          {yScale.ticks(5).map((tick) => (
            <g key={tick} transform={`translate(0,${yScale(tick)})`}>
              <line x2={innerWidth} stroke="#eee" />
              <text x={-10} dy="0.32em" textAnchor="end" fontSize="10">
                {tick}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
};

export default StackedColumnChart;
