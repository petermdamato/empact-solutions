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
      value: value,
    }));
  }

  return Object.entries(obj).map(([key, value]) => {
    const result = { category: key };
    for (const breakdown of breakdowns) {
      if (value[breakdown]) {
        result[breakdown] = value[breakdown];
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
  chartBreakdowns,
  chartTitle,
  valueBreakdowns = true,
  categoryPercent,
  categoryTotal,
}) => {
  const [innerData, setInnerData] = useState([]);
  const [expanded, setExpanded] = useState(showChart);

  useEffect(() => {
    if (!showChart || !chartData || !label) return;

    const transformedData = transformToCategoryValueArray(
      chartData,
      chartBreakdowns,
      valueBreakdowns
    );

    const normalize = (str) =>
      str ? str.toLowerCase().replace(/ies$/, "y").replace(/s$/, "") : "";

    const finalData = transformedData.filter((entry) =>
      chartTitle.includes("Age")
        ? getAgeBracket(entry.category) === label
        : chartTitle.includes("Category")
        ? normalize(getSimplifiedOffenseCategory(entry.category)) ===
          normalize(label)
        : chartTitle.includes("Reason")
        ? normalize(offenseMap[entry.category]) === normalize(label)
        : false
    );

    if (
      finalData.length > 0 &&
      !finalData[0]["Pre-dispo"] &&
      !finalData[0].pre
    ) {
      finalData.forEach((entry) => {
        entry["Pre-dispo"] = entry.value;
      });
    }

    setInnerData(finalData);
  }, [
    showChart,
    chartData,
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
        maxWidth: "400px",
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
      {payload.map((entry, index) => (
        <div
          key={`item-${index}`}
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "4px",
            color: entry.color,
          }}
        >
          <span>{entry.name}:</span>
          <span>
            {valueFormatter(entry.value)}
            {percentage && ` (${percentage})`}
          </span>
        </div>
      ))}

      {showChart && (
        <>
          <button
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
          </button>

          {expanded && innerData.length > 0 && (
            <div style={{ marginTop: "12px", height: "140px" }}>
              <div>
                <h3>Breakdown</h3>
              </div>
              <StackedBarChartGeneric
                data={innerData}
                showChart={true}
                breakdowns={chartBreakdowns}
                height={180}
                margin={{ top: 0, right: 40, bottom: 40, left: 20 }}
                chartTitle={chartTitle}
                hideLegend={true}
                compact={true}
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
