import { useState, useEffect } from "react";
import DisruptionLineChart from "@/components/LineChart/DisruptionLineChart";
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

const LineChartEnhancedTooltip = ({
  active,
  payload,
  label,
  tooltipPayload,
  valueFormatter = (value) => value,
  showPercentage = false,
  totalValue,
  showChart = true,
  chartData,
  chartBreakdowns,
  calculationType,
  chartTitle,
  selectedKey,
  valueBreakdowns = true,
  categoryPercent,
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
        maxWidth: "320px",
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
        chartTitle?.includes("LOS") ? (
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
            <span>{entry.name}:</span>
            <span>
              {valueFormatter(entry.value)}
              {percentage && ` (${percentage})`}
            </span>
          </div>
        )
      )}

      {showChart && (
        <>
          <div style={{ marginTop: "12px", height: "300px" }}>
            <DisruptionLineChart
              data={tooltipPayload}
              selectedKey={selectedKey}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default LineChartEnhancedTooltip;
