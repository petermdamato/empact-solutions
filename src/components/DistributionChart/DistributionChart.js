import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { dateDiff } from "./../../utils/dateDiff";
import Selector from "../Selector/Selector";
import { useLinkOut } from "@/context/LinkOutContext";

const getBucketForRecord = (d, filterDimension, detentionType) => {
  switch (filterDimension) {
    case "Age at entry": {
      const dob = new Date(d.Date_of_Birth);
      const entry = new Date(
        detentionType === "alternative-to-detention"
          ? d.ATD_Entry_Date
          : d.Admission_Date
      );
      if (isNaN(dob) || isNaN(entry)) return "Unknown";

      const age =
        entry.getFullYear() -
        dob.getFullYear() -
        (entry < new Date(entry.getFullYear(), dob.getMonth(), dob.getDate())
          ? 1
          : 0);

      if (isNaN(age)) return "Unknown";
      if (age <= 10) return "10 and younger";
      if (age <= 13) return "11-13";
      if (age <= 17) return "14-17";
      return "18+";
    }

    case "YOC/white": {
      const isWhite =
        (d.Ethnicity || "").toLowerCase() === "non hispanic" &&
        (d.Race || "").toLowerCase() === "white";
      return isWhite ? "White" : "YOC";
    }

    case "Race/Ethnicity": {
      const isHispanic =
        d.Ethnicity.toLowerCase() === "hispanic" && d.Race.trim() === "White";
      return isHispanic
        ? "Hispanic"
        : d.Race && d.Race.trim() !== ""
        ? d.Race
        : "Unknown";
    }

    case "Offense category (pre-dispo)": {
      const reason = d["Post-Dispo Stay Reason"];
      const offense = (d.OffenseCategory || "").toLowerCase();

      if (reason && reason.trim() !== "") return "Other";
      if (offense.includes("felony")) return "Felony";
      if (offense.includes("misdemeanor")) return "Misdemeanor";
      if (offense === "status offense") return "Status Offense";
      return "Technical";
    }

    case "Gender": {
      return d.Gender && d.Gender.trim() !== "" ? d.Gender : "Unknown";
    }
    case "Disruptions": {
      return d["ATD_Successful_Exit"];
    }

    default:
      return "all";
  }
};

const getLegendValues = (data, dimension) => {
  switch (dimension.toLowerCase()) {
    case "disruptions":
      return ["0", "1"];
    case "race/ethnicity":
      return [
        "African American or Black",
        "White",
        "Hispanic",
        "Asian",
        "Other",
      ];
    case "age at entry":
      return ["10 and younger", "11-13", "14-17", "18+"];
    case "yoc/white":
      return ["YOC", "White"];
    case "pre/post-dispo":
      return ["Pre-dispo", "Post-dispo"];
    case "offense category (pre-dispo)":
      return ["Felony", "Misdemeanor", "Technical", "Status Offense", "Other"];
    case "gender":
      return [...new Set(data.map((d) => d.Gender))];
    default:
      return [];
  }
};

const FILTER_DIMENSIONS = [
  "Overall Total",
  "Pre/post-dispo",
  "YOC/white",
  "Race/Ethnicity",
  "Disruptions",
  "Gender",
  "Offense category (pre-dispo)",
  "Age at entry",
];

const calculateLengthOfStay = (record, detentionType) => {
  const exitDate =
    detentionType === "secure-detention" && record.Release_Date
      ? new Date(record.Release_Date)
      : record.ATD_Exit_Date
      ? new Date(record.ATD_Exit_Date)
      : null;

  const admissionDate =
    detentionType === "secure-detention" && record.Admission_Date
      ? new Date(record.Admission_Date)
      : record.ATD_Entry_Date
      ? new Date(record.ATD_Entry_Date)
      : null;

  return admissionDate && exitDate
    ? Math.ceil(dateDiff(admissionDate, exitDate, "days"))
    : null;
};
const expandedColors = (
  detentionType = "alternative-to-detention",
  exploreType = "Overall Total",
  filterDimension = "Disruptions"
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
          Hispanic: "#fcb953",
          White: "#ff7b00",
          "African American or Black": "#006890",
          Asian: "#73c5e1",
          "American Indian or Alaska Native": "#9b4dca",
          "Native Hawaiian or Pacific Islander": "#5b8a72",
          "Two or more races": "#c02828",
          Unknown: "#ccc",
          Other: "#ccc",
        };

      case "Age at entry":
        return {
          "10 and younger": "#ff7b00",
          "11-13": "#fcb953",
          "14-17": "#006890",
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
          White: "#ff7b00",
          YOC: "#006890",
        };

      case "Offense category (pre-dispo)":
        return {
          Felony: "#c02828",
          Misdemeanor: "#fcb953",
          "Status Offense": "#ff7b00",
          Technical: "#006890",
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

const getYear = (date) => new Date(date).getFullYear();

const getAverage = (arr, detentionType) => {
  if (arr.length === 0) return null;
  const sum = arr.reduce(
    (acc, val) => acc + calculateLengthOfStay(val, detentionType),
    0
  );
  return sum / arr.length;
};

const getMedian = (arr, detentionType) => {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort(
    (a, b) =>
      calculateLengthOfStay(a, detentionType) -
      calculateLengthOfStay(b, detentionType)
  );
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 0
    ? (calculateLengthOfStay(sorted[mid - 1], detentionType) +
        calculateLengthOfStay(sorted[mid], detentionType)) /
        2
    : calculateLengthOfStay(sorted[mid], detentionType);
};

const DistributionChart = (records) => {
  const linkText = useLinkOut();
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({
    width: 600,
    height: 300,
  });
  const [tooltip, setTooltip] = useState(null);

  const legendHeight =
    records.legendOptions && records.legendOptions.length > 0
      ? records.legendOptions.length * 24
      : 0;

  const colorScale = expandedColors(
    records.detentionType,
    "Overall Total",
    records.exploreType
  );
  const colorMap = expandedColors(
    records.detentionType,
    records.exploreType,
    records.filterDimension
  );

  // Process data and group by length of stay
  const dataCopy = [...records.data];

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        const height = Math.round(window.innerHeight) - 200 - legendHeight;
        const width = containerRef.current.clientWidth;
        setDimensions({ width, height });
      }
    };

    handleResize(); // initial
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [records.legendOptions]);

  useEffect(() => {
    if (records.filterDimension && records.filterDimension.length > 0) {
      const legendVals = getLegendValues(dataCopy, records.filterDimension);
      records.setLegendOptions?.(legendVals);
      records.setSelectedLegendOptions([]);
    }
  }, [records.data, records.filterDimension]);

  useEffect(() => {
    if (
      records.detentionType === "secure-detention" &&
      records.exploreType &&
      records.exploreType.length > 0
    ) {
      const legendVals = getLegendValues(dataCopy, records.exploreType);
      records.setLegendOptions?.(legendVals);
      records.setSelectedLegendOptions([]);
    }
  }, [records.data, records.exploreType]);

  const margin = { top: 0, right: 10, bottom: 40, left: 10 };
  const { width, height } = dimensions;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  if (
    !records.data ||
    records.data.length === 0 ||
    records.exploreType === undefined
  )
    return null;

  const filteredData = dataCopy.filter((record) => {
    return (
      getYear(
        records.detentionType === "secure-detention"
          ? record.Release_Date
          : record.ATD_Exit_Date
      ) === +records.selectedYear &&
      calculateLengthOfStay(record, records.detentionType)
    );
  });

  // Sort and group data by length of stay
  const sortedData = filteredData.sort(
    (a, b) =>
      calculateLengthOfStay(a, records.detentionType) -
      calculateLengthOfStay(b, records.detentionType)
  );

  // Group data by length of stay to identify series
  const groupedData = {};
  sortedData.forEach((d) => {
    const days = calculateLengthOfStay(d, records.detentionType);
    if (!groupedData[days]) groupedData[days] = [];
    groupedData[days].push(d);
  });

  // Flatten back to array with group info
  const dataWithGroups = sortedData.map((d) => {
    const days = calculateLengthOfStay(d, records.detentionType);
    return {
      ...d,
      days,
      isLastInGroup: groupedData[days][groupedData[days].length - 1] === d,
      groupSize: groupedData[days].length,
    };
  });

  const xScale = d3
    .scaleBand()
    .domain(dataWithGroups.map((d) => d.Youth_ID + "-" + d.Referral_ID))
    .range([0, innerWidth])
    .padding(0.1);

  const yScale = d3
    .scaleLinear()
    .domain([
      0,
      d3.max(dataWithGroups, (d) =>
        calculateLengthOfStay(d, records.detentionType)
      ),
    ])
    .range([innerHeight, 0]);

  const handleMouseOver = (event, d) => {
    const days = calculateLengthOfStay(d, records.detentionType);
    const dateOfEntry = new Date(
      records.detentionType === "secure-detention"
        ? d.Admission_Date
        : d.ATD_Entry_Date
    );
    const raceEthnicity =
      (d.Ethnicity === "Hispanic" ? "Hispanic" : d.Race) || "Unknown";
    const dob = d.Date_of_Birth
      ? new Date(d.Date_of_Birth).toLocaleDateString()
      : "Unknown";
    const age =
      d.Date_of_Birth && dateOfEntry
        ? Math.floor(dateDiff(new Date(d.Date_of_Birth), dateOfEntry, "years"))
        : null;

    setTooltip({
      x: event.clientX,
      y: event.clientY,
      content: (
        <div className={"tooltip-list"}>
          <div style={{ fontSize: "16px" }}>
            <em>{days} days in detention</em>
          </div>
          <div>
            <div>Youth ID: </div>
            <div>
              <strong>{d.Youth_ID}</strong>
            </div>
          </div>
          <div>
            <div>Race: </div>
            <div>
              <strong>{raceEthnicity}</strong>
            </div>
          </div>
          <div>
            <div>Gender: </div>
            <div>
              <strong>{d.Gender}</strong>
            </div>
          </div>
          <div>
            <div>
              Age at{" "}
              {records.detentionType === "secure-detention"
                ? "Admission"
                : "Intake"}
              :
            </div>
            <div>
              <strong>{age}</strong>
            </div>
          </div>
          <div>
            <div>Pre/Post-Dispo: </div>
            <div>
              <strong>
                {d["Post-Dispo Stay Reason"] ? "Post-Dispo" : "Pre-Dispo"}
              </strong>
            </div>
          </div>
          <div>
            <div>Offense Category: </div>
            <div>
              <strong>
                {getBucketForRecord(
                  d,
                  "Offense category (pre-dispo)",
                  records.detentionType
                )}
              </strong>
            </div>
          </div>
          <div>
            <div>Post-Dispo Status: </div>
            <div>
              <strong>
                {d["Post-Dispo Stay Reason"]
                  ? d["Post-Dispo Stay Reason"]
                  : "--"}
              </strong>
            </div>
          </div>
        </div>
      ),
    });
  };

  const handleMouseOut = () => {
    setTooltip(null);
  };

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${dimensions.height}px`,
        overflow: "visible",
        position: "relative",
      }}
    >
      {records.useFilterDropdown && (
        <div style={{ marginLeft: "14px" }}>
          <Selector
            variable="calc"
            values={FILTER_DIMENSIONS}
            selectedValue={records.filterDimension}
            setValue={records.setFilterDimension}
          />
        </div>
      )}
      {records.legendOptions &&
        records.legendOptions.map((option) => {
          return (
            <div
              key={option}
              onClick={() => {
                records.setSelectedLegendOptions((prev) =>
                  prev.includes(option)
                    ? prev.filter((item) => item !== option)
                    : [...prev, option]
                );
              }}
              style={{
                padding: "4px 0.8rem",
                border: "none",
                cursor: "pointer",
                display: "flex",
                gap: "4px",
              }}
            >
              <div
                style={{
                  background:
                    records.detentionType === "secure-detention"
                      ? colorScale[option]
                      : colorMap[option],
                  opacity:
                    !records.selectedLegendOptions ||
                    records.selectedLegendOptions.length === 0 ||
                    records.selectedLegendOptions.includes(option)
                      ? 1
                      : 0.3,
                  height: "16px",
                  width: "16px",
                  content: "",
                }}
              ></div>
              <span>
                {option === "1"
                  ? "Undisrupted"
                  : option === "0"
                  ? "Disrupted"
                  : option}
              </span>
            </div>
          );
        })}
      <svg width={width} height={height}>
        <g transform={`translate(${margin.left},${margin.top})`}>
          {dataWithGroups.map((d) => {
            const days = calculateLengthOfStay(d, records.detentionType);
            const barHeight = innerHeight - yScale(days);
            const showLabel =
              d.isLastInGroup && d.groupSize > 1 && days % 10 === 0;
            return (
              <g
                key={d.Youth_ID + "-" + d.Referral_ID}
                onMouseOver={(e) => handleMouseOver(e, d)}
                onMouseOut={handleMouseOut}
              >
                <rect
                  data-inmate-id={d.Youth_ID}
                  x={xScale(d.Youth_ID + "-" + d.Referral_ID)}
                  y={yScale(days)}
                  width={xScale.bandwidth()}
                  height={barHeight}
                  fill={
                    records.detentionType === "alternative-to-detention"
                      ? colorMap[
                          records.filterDimension === "Pre/post-dispo"
                            ? d["Post-Dispo Stay Reason"] === null ||
                              d["Post-Dispo Stay Reason"] === ""
                              ? "Pre-dispo"
                              : "Post-dispo"
                            : getBucketForRecord(
                                d,
                                records.filterDimension,
                                records.detentionType
                              )
                        ]
                      : colorScale[
                          records.exploreType === "Pre/post-dispo"
                            ? d["Post-Dispo Stay Reason"] === null ||
                              d["Post-Dispo Stay Reason"] === ""
                              ? "Pre-dispo"
                              : "Post-dispo"
                            : getBucketForRecord(
                                d,
                                records.exploreType,
                                records.detentionType
                              )
                        ]
                  }
                  opacity={
                    !records.selectedLegendOptions ||
                    records.selectedLegendOptions.length === 0 ||
                    records.selectedLegendOptions.includes(
                      records.filterDimension === "Pre/post-dispo" ||
                        records.exploreType === "Pre/post-dispo"
                        ? d["Post-Dispo Stay Reason"] === null ||
                          d["Post-Dispo Stay Reason"] === ""
                          ? "Pre-dispo"
                          : "Post-dispo"
                        : records.detentionType === "secure-detention"
                        ? getBucketForRecord(
                            d,
                            records.exploreType,
                            records.detentionType
                          )
                        : getBucketForRecord(
                            d,
                            records.filterDimension,
                            records.detentionType
                          )
                    )
                      ? 1
                      : 0.3
                  }
                  rx={4}
                  onClick={(e) => {
                    const inmateId = e.target.getAttribute("data-inmate-id");

                    // Build base URL dynamically
                    const baseUrl = window.location.origin; // e.g., "http://localhost:3000" or "https://empact-solutions.onrender.com"

                    // Determine final URL
                    const url =
                      !linkText.linkOut || linkText.linkOut.length === 0
                        ? `${baseUrl}/sample-lookup?${inmateId}`
                        : (linkText.linkOut.startsWith("http")
                            ? ""
                            : "http://") +
                          linkText.linkOut +
                          "/" +
                          inmateId;

                    if (url) window.open(url, "_blank");
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.setAttribute("stroke", "#000");
                    e.currentTarget.setAttribute("stroke-width", "1");
                    e.currentTarget.setAttribute("stroke-opacity", "0.3");
                    handleMouseOver(e, d);
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.removeAttribute("stroke");
                    e.currentTarget.removeAttribute("stroke-width");
                    handleMouseOut(e);
                  }}
                  style={{ cursor: "pointer" }}
                />
                {showLabel && (
                  <text
                    x={
                      xScale(d.Youth_ID + "-" + d.Referral_ID) +
                      xScale.bandwidth() / 2 -
                      8
                    }
                    y={days ? yScale(days) - 4 : 0}
                    textAnchor="middle"
                    fontSize="14"
                    fill="#333"
                  >
                    {days}
                  </text>
                )}
              </g>
            );
          })}

          {/* Median and Average lines (unchanged) */}
          <rect
            x={0}
            y={
              sortedData && sortedData.length
                ? yScale(getMedian(sortedData, records.detentionType))
                : 0
            }
            width={innerWidth}
            height={2}
            fill="black"
            rx={4}
          />
          <text
            x={10}
            y={
              sortedData && sortedData.length
                ? yScale(getMedian(sortedData, records.detentionType)) +
                  (getMedian(sortedData, records.detentionType) >=
                  getAverage(sortedData, records.detentionType)
                    ? -10
                    : 16)
                : 0
            }
            fill="black"
          >
            Median: {Math.round(getMedian(sortedData, records.detentionType))}{" "}
            days
          </text>

          <rect
            x={0}
            y={
              sortedData && sortedData.length
                ? yScale(getAverage(sortedData, records.detentionType))
                : 0
            }
            width={innerWidth}
            height={2}
            fill="black"
            rx={4}
          />
          <text
            x={10}
            y={
              sortedData && sortedData.length
                ? yScale(getAverage(sortedData, records.detentionType)) +
                  (getMedian(sortedData, records.detentionType) <
                  getAverage(sortedData, records.detentionType)
                    ? -10
                    : 16)
                : 0
            }
            fill="black"
          >
            Average: {Math.round(getAverage(sortedData, records.detentionType))}{" "}
            days
          </text>
        </g>
      </svg>
      {/* Tooltip */}
      {tooltip && (
        <div
          style={{
            position: "absolute",
            left: `${tooltip.x - 390}px`,
            top: `${
              tooltip.y > dimensions.height
                ? tooltip.y - 360 // show above if in bottom 25%
                : tooltip.y + 20 // show below otherwise
            }px`,
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

export default DistributionChart;
