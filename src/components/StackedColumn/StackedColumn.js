import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const getYear = (date) => new Date(date).getFullYear();
const dateDiffInDays = (start, end) =>
  Math.ceil((new Date(end) - new Date(start)) / (1000 * 60 * 60 * 24));

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
  exploreType = "Overall Total",
  filterDimension = "Successfulness"
) => {
  if (
    detentionType === "alternative-to-detention" ||
    detentionType === "secure-detention"
  ) {
    switch (filterDimension) {
      case "Disruptions":
        return { 1: "#006890", 0: "#ff7b00" };

      case "Race/Ethnicity":
        return {
          Hispanic: "#006890",
          White: "#73c5e1",
          "African American or Black": "#ff7b00",
          Asian: "#fcb953",
          "American Indian or Alaska Native": "#9b4dca",
          "Native Hawaiian or Pacific Islander": "#5b8a72",
          "Two or more races": "#c02828",
          Unknown: "#ccc",
        };

      case "Age at entry":
        return {
          "10 and younger": "#73c5e1",
          "11-13": "#fcb953",
          "14-17": "#ff7b00",
          "18+": "#c02828",
          Unknown: "#ccc",
        };

      case "Gender":
        return {
          Male: "#006890",
          Female: "#ff7b00",
          Unknown: "#ccc",
        };

      case "YOC/white":
        return {
          White: "#006890",
          YOC: "#ff7b00",
        };

      case "Offense category (pre-dispo)":
        return {
          Felony: "#006890",
          Misdemeanor: "#fcb953",
          "Status Offense": "#ff7b00",
          Technical: "#c02828",
          Other: "#ccc",
        };
      case "Pre/post-dispo":
        return { "Pre-dispo": "#006890", "Post-dispo": "#ff7b00" };

      default:
        return { all: "#006890" };
    }
  }

  if (exploreType === "Pre/post-dispo") {
    return { "Pre-dispo": "#006890", "Post-dispo": "#ff7b00" };
  }

  return { all: "#006890" };
};

const StackedColumnChart = ({
  data,
  chartTitle,
  detentionType,
  selectedYear,
  exploreType,
  useFilterDropdown = false,
  filterDimension,
  selectedLegendOptions,
}) => {
  const ref = useRef();
  const [tooltip, setTooltip] = useState(null);
  const [dimensions, setDimensions] = useState({ width: 600, height: 400 });

  const colorScale =
    detentionType === "secure-detention"
      ? colors(detentionType, "Overall Total", exploreType)
      : colors(detentionType, exploreType, filterDimension);

  useEffect(() => {
    const handleResize = () => {
      if (ref.current) {
        const height = Math.round(window.innerHeight) - 200;
        const width = ref.current.clientWidth;
        setDimensions({ width, height });
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const margin = { top: 40, right: 20, bottom: 40, left: 40 };
  const { width, height } = dimensions;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (!data || data.length === 0) return null;

  // Group and filter data
  const finalData = data.filter((record) => {
    const date =
      detentionType === "secure-detention"
        ? record.Admission_Date
        : record.ATD_Entry_Date;
    return getYear(date) === +selectedYear;
  });

  const grouped = {};
  const groupKeySet = new Set();

  finalData.forEach((d) => {
    const entryDate =
      detentionType === "secure-detention"
        ? d.Admission_Date
        : d.ATD_Entry_Date;
    const exitDate =
      detentionType === "secure-detention" ? d.Release_Date : d.ATD_Exit_Date;

    const days = dateDiffInDays(entryDate, exitDate);
    const bucket = getLengthOfStayBucket(days);
    if (!bucket || !exitDate) return;

    let groupKey = "all";

    if (
      detentionType === "alternative-to-detention" ||
      detentionType === "secure-detention"
    ) {
      switch (
        detentionType === "secure-detention" ? exploreType : filterDimension
      ) {
        case "Disruptions": {
          groupKey =
            d.ATD_Successful_Exit === "1"
              ? "1"
              : d.ATD_Successful_Exit === "0"
              ? "0"
              : "";
          break;
        }
        case "Pre/post-dispo": {
          groupKey =
            d["Post-Dispo Stay Reason"] === null ||
            d["Post-Dispo Stay Reason"] === ""
              ? "Pre-dispo"
              : "Post-dispo";
          break;
        }

        case "Age at entry": {
          const dob = new Date(d.Date_of_Birth);
          const entry = new Date(
            detentionType === "secure-detention"
              ? d.Admission_Date
              : d.ATD_Entry_Date
          );
          const age =
            dob instanceof Date &&
            entry instanceof Date &&
            !isNaN(dob) &&
            !isNaN(entry)
              ? entry.getFullYear() -
                dob.getFullYear() -
                (entry <
                new Date(entry.getFullYear(), dob.getMonth(), dob.getDate())
                  ? 1
                  : 0)
              : null;

          if (age === null || isNaN(age)) {
            groupKey = "Unknown";
          } else if (age <= 10) {
            groupKey = "10 and younger";
          } else if (age <= 13) {
            groupKey = "11-13";
          } else if (age <= 17) {
            groupKey = "14-17";
          } else {
            groupKey = "18+";
          }
          break;
        }

        case "YOC/white": {
          const isWhite =
            d.Ethnicity.toLowerCase() !== "hispanic" &&
            d.Race.toLowerCase() === "white";
          groupKey = isWhite ? "White" : "YOC";
          break;
        }

        case "Race/Ethnicity": {
          const isHispanic =
            d.Ethnicity.toLowerCase() === "hispanic" &&
            d.Race.trim() === "White";
          groupKey = isHispanic
            ? "Hispanic"
            : d.Race && d.Race.trim() !== ""
            ? d.Race
            : "Unknown";
          break;
        }

        case "Offense category (pre-dispo)": {
          const reason = d["Post-Dispo Stay Reason"];
          const offense = (d.OffenseCategory || "").toLowerCase();

          if (!reason || reason.trim() === "") {
            if (offense.includes("felony")) {
              groupKey = "Felony";
            } else if (offense.includes("misdemeanor")) {
              groupKey = "Misdemeanor";
            } else if (offense === "status offense") {
              groupKey = "Status Offense";
            } else {
              groupKey = "Technical";
            }
          } else {
            groupKey = "Other";
          }
          break;
        }

        case "Gender": {
          groupKey = d.Gender && d.Gender.trim() !== "" ? d.Gender : "Unknown";
          break;
        }

        default:
          groupKey = "all";
      }

      groupKeySet.add(groupKey);

      if (!grouped[bucket]) grouped[bucket] = {};
      if (!grouped[bucket][groupKey]) grouped[bucket][groupKey] = 0;
      grouped[bucket][groupKey]++;
    } else if (exploreType === "Pre/post-dispo") {
      const dispo = !d["Post-Dispo Stay Reason"] ? "Pre-dispo" : "Post-dispo";
      groupKeySet.add("Pre-dispo");
      groupKeySet.add("Post-dispo");

      if (!grouped[bucket])
        grouped[bucket] = { "Pre-dispo": 0, "Post-dispo": 0 };
      grouped[bucket][dispo]++;
    } else {
      groupKeySet.add("all");

      if (!grouped[bucket]) grouped[bucket] = { all: 0 };
      grouped[bucket]["all"]++;
    }
  });

  const keys = Array.from(groupKeySet);

  const stackedData = bucketOrder.map((bucket) => {
    const group = grouped[bucket] || {};
    const result = { bucket, total: 0 };

    keys.forEach((key) => {
      result[key] = group[key] || 0;
      result.total += result[key];
    });

    return result;
  });

  const stack = d3.stack().keys(keys);
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

  const handleMouseOver = (event, d) => {
    const keys = Object.keys(d).filter(
      (entry) => entry !== "bucket" && entry !== "total"
    );

    const bounds = ref.current.getBoundingClientRect();

    setTooltip({
      x: event.clientX - bounds.left,
      y: event.clientY - bounds.top,
      content: (
        <div>
          <div
            style={{
              marginBottom: "8px",
            }}
          >
            <span style={{ fontStyle: "italic", fontSize: "16px" }}>
              {d.bucket} days in detention
            </span>
          </div>
          {keys.map((entry) => {
            return (
              <div key={"column-" + entry}>
                <strong>
                  {entry === "1"
                    ? "Successful"
                    : entry === "0"
                    ? "Unsuccessful"
                    : entry === "" && filterDimension === "Successfulness"
                    ? "Unknown"
                    : entry === "pre"
                    ? "Pre-dispo"
                    : entry === "post"
                    ? "Post-dispo"
                    : String(entry)[0].toUpperCase() + String(entry).slice(1)}
                  :
                </strong>{" "}
                {d[entry]}
              </div>
            );
          })}
        </div>
      ),
    });
  };

  const handleMouseOut = () => {
    setTooltip(null);
  };

  return (
    <div
      ref={ref}
      style={{
        width: "100%",
        height: `${dimensions.height}px`,
        position: "relative",
      }}
    >
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
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
                    onMouseOver={(e) => handleMouseOver(e, d)}
                    onMouseOut={handleMouseOut}
                    opacity={
                      selectedLegendOptions.length === 0 ||
                      selectedLegendOptions.includes(layer.key)
                        ? 1
                        : 0.3
                    }
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

          {stackedData.map((d) => {
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

      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: `${tooltip.x - 150}px`,
            top: `${tooltip.y - 100}px`,
            backgroundColor: "white",
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            zIndex: 100,
            pointerEvents: "none",
          }}
        >
          {tooltip.content}
        </div>
      )}
    </div>
  );
};

export default StackedColumnChart;
