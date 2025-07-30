import { useState, useEffect } from "react";
import StackedBarChartGeneric from "@/components/StackedBar/StackedBarChartGeneric";
import {
  getAgeBracket,
  getSimplifiedOffenseCategory,
  offenseMap,
} from "@/utils/categorizationUtils";

const transformToCategoryValueArray = (obj, breakdowns, valueBreakdowns) => {
  if (!breakdowns || breakdowns.length === 0 || !valueBreakdowns) {
    return Object.entries(obj).map(([key, value]) => ({
      category: key,
      value: value === null ? 0.0001 : value,
    }));
  }

  return Object.entries(obj).map(([key, value]) => {
    const result = { category: key };
    for (const breakdown of breakdowns) {
      if (value && value.hasOwnProperty(breakdown)) {
        result[breakdown] = value[breakdown] === null ? 0 : value[breakdown];
      } else {
        result[breakdown] = 0;
      }
    }
    return result;
  });
};

const EnhancedTooltip = ({
  active,
  payload,
  label,
  valueFormatter = (value) => value,
  colorMapOverride = { "Pre-dispo": "#5b6069", "Post-dispo": "#d3d3d3" },
  showPercentage = false,
  totalValue,
  showChart = false,
  chartData,
  postDispoData,
  chartBreakdowns,
  calculationType,
  chartTitle,
  groupByKey,
  valueBreakdowns = true,
  categoryPercent,
}) => {
  const [innerData, setInnerData] = useState([]);
  const [expanded] = useState(showChart);

  useEffect(() => {
    if (!showChart || !chartData || !label) return;

    const transformedData = transformToCategoryValueArray(
      chartData,
      chartBreakdowns,
      valueBreakdowns
    );
    const postDispoGroups =
      chartTitle && chartTitle.includes("Reason")
        ? [
            "Other",
            "Awaiting Placement",
            "Confinement to secure detention",
            "New Offenses",
            "Technicals",
          ].includes(label)
          ? Object.entries(postDispoData[label]).map(([key, value]) => ({
              category: key,
              "Pre-dispo": value["Post-dispo"] || 0,
            }))
          : []
        : [];

    const normalize = (str) =>
      str ? str.toLowerCase().replace(/ies$/, "y").replace(/s$/, "") : "";

    const finalData =
      chartTitle && chartTitle.includes("Reason") && postDispoGroups.length > 0
        ? postDispoGroups
        : transformedData.filter((entry) => {
            return (!chartBreakdowns ||
              chartBreakdowns.length === 0 ||
              entry[chartBreakdowns[0]] > 0.001) &&
              chartTitle.includes("Age")
              ? getAgeBracket(entry.category) === label
              : chartTitle.includes("Category")
              ? normalize(getSimplifiedOffenseCategory(entry.category)) ===
                normalize(label)
              : chartTitle.includes("Reason")
              ? normalize(offenseMap[entry.category]) === normalize(label)
              : false;
          });

    if (
      finalData.length > 0 &&
      !finalData[0]["Pre-dispo"] &&
      !finalData[0].pre
    ) {
      finalData.forEach((entry) => {
        entry["Pre-dispo"] = entry.value;
      });
    }

    const sortedData = [...finalData]
      .sort((a, b) => {
        const aEntry = Object.entries(a).find(([k]) => k !== "category");
        const bEntry = Object.entries(b).find(([k]) => k !== "category");
        const aValue = aEntry ? aEntry[1] : 0;
        const bValue = bEntry ? bEntry[1] : 0;
        return bValue - aValue;
      })
      .slice(0, 5);

    setInnerData(
      groupByKey === "Reason for Detention" ? sortedData : finalData
    );
  }, [
    showChart,
    chartData,
    postDispoData,
    chartBreakdowns,
    chartTitle,
    valueBreakdowns,
    label,
  ]);

  // Don't render tooltip unless active and payload present
  if (!active || !payload || payload.length === 0) return null;

  const percentage =
    showPercentage && totalValue
      ? `${Math.round((payload[0].value / totalValue) * 100)}%`
      : null;

  return (
    <div
      className="enhanced-tooltip"
      style={{
        background: "white",
        border: "1px solid #ccc",
        borderRadius: "4px",
        padding: "12px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
        minWidth: "200px",
        maxWidth:
          chartTitle && chartTitle.includes("Reason") ? "680px" : "320px",
      }}
    >
      <div style={{ marginBottom: "8px", fontWeight: "bold" }}>
        {label}
        {categoryPercent != null && (
          <span
            style={{
              fontWeight: "normal",
              marginLeft: "8px",
              fontSize: "12px",
            }}
          >
            ({Math.round(categoryPercent * 10) / 10}% of total)
          </span>
        )}
      </div>
      {payload.map((entry, index) =>
        chartTitle && chartTitle?.includes("LOS") ? (
          <div
            key={`item-${index}`}
            style={{
              marginBottom: "4px",
              color: entry.color,
            }}
          >
            <br />
            <span>
              {calculationType
                ? calculationType[0].toUpperCase() + calculationType.slice(1)
                : ""}{" "}
              LOS: <strong>{valueFormatter(entry.value)}</strong>
            </span>
            <br />
            <span>
              Total releases: <strong>{entry.count}</strong>
            </span>
          </div>
        ) : (
          <div
            key={`item-${index}`}
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginBottom: "4px",
              color: entry.color,
            }}
          >
            <span>{entry.name}:&nbsp;</span>
            <span>
              {valueFormatter(entry.value)}
              {percentage && ` (${percentage})`}
            </span>
          </div>
        )
      )}

      {showChart && (
        <>
          {/* <button
            onClick={() => setExpanded(!expanded)}
            style={{
              marginTop: "8px",
              background: "none",
              border: "none",
              color: "#0066cc",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {expanded ? "Hide chart" : "Show chart"}
          </button> */}

          {expanded && innerData.length > 0 && (
            <div
              style={{
                marginTop: "12px",
                height: `${
                  chartTitle && chartTitle.includes("Reason") ? 280 : 180
                }px`,
              }}
            >
              <div>
                <h3>
                  {groupByKey === "Reason for Detention"
                    ? `Top ${innerData.length} Offense${
                        innerData.length > 1 ? "s" : ""
                      }`
                    : "Breakdown"}
                </h3>
              </div>
              <StackedBarChartGeneric
                data={innerData}
                sorted={groupByKey === "Reason for Detention"}
                breakdowns={chartBreakdowns}
                height={chartTitle && chartTitle.includes("Reason") ? 300 : 200}
                margin={{ top: 10, right: 40, bottom: 40, left: 20 }}
                chartTitle={groupByKey}
                hideLegend={true}
                compact={true}
                groupByKey={groupByKey}
                wrapWidth={
                  chartTitle && chartTitle.includes("Reason") ? 300 : 106
                }
                colorMapOverride={colorMapOverride}
              />
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default EnhancedTooltip;
