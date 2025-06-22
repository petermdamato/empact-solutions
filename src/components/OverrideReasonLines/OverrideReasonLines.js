import React from "react";
import * as d3 from "d3";

const rowHeight = 70;
const margin = { top: 20, right: 20, bottom: 30, left: 240 };
const labelPadding = 24;
const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

const OverrideReasonTable = ({ data }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div>No override reason data available.</div>;
  }

  // Get all years sorted
  const years = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b);

  // Collect all unique reasons
  const allReasonsSet = new Set();
  Object.values(data).forEach((yearObj) => {
    Object.keys(yearObj).forEach((reason) => {
      if (reason && reason.trim() !== "") allReasonsSet.add(reason);
    });
  });
  const allReasons = Array.from(allReasonsSet).sort();

  // Map each reason to its time series data
  const series = allReasons.map((reason) => ({
    reason,
    values: years.map((year) => ({
      year,
      value: data?.[year]?.[reason] ?? 0,
    })),
  }));

  const chartWidth = 400; // wider container
  const totalHeight = allReasons.length * rowHeight + margin.bottom;

  const x = d3
    .scaleLinear()
    .domain(d3.extent(years))
    .range([margin.left, chartWidth - margin.right]);

  const line = d3
    .line()
    .x((d) => x(d.year))
    .y((d, yScale) => yScale(d.value));

  return (
    <div style={{ overflowX: "auto" }}>
      <svg width={chartWidth} height={totalHeight}>
        {/* X-axis at bottom */}
        <g>
          {years.map((year) => (
            <text
              key={`x-${year}`}
              x={x(year)}
              y={totalHeight - 10}
              textAnchor="middle"
              fontSize="12px"
              fill="#666"
            >
              {year}
            </text>
          ))}
          <line
            x1={margin.left}
            x2={chartWidth - margin.right}
            y1={totalHeight - margin.bottom}
            y2={totalHeight - margin.bottom}
            stroke="#333"
            strokeWidth={1}
          />
        </g>

        {series.map((s, i) => {
          const rowY = i * rowHeight;
          const chartTop = rowY + margin.top;
          const chartBottom = rowY + rowHeight - margin.top;

          const y = d3
            .scaleLinear()
            .domain([0, d3.max(s.values, (d) => d.value)])
            .nice()
            .range([chartBottom, chartTop]);

          const lineGenerator = d3
            .line()
            .x((d) => x(d.year))
            .y((d) => y(d.value));

          return (
            <g key={s.reason}>
              <rect
                x={0}
                y={rowY}
                width={chartWidth}
                height={rowHeight}
                fill={i % 2 === 0 ? "#fafafa" : "white"}
                stroke="#e2e8f0"
                strokeWidth={0.5}
              />

              <text
                x={margin.left - labelPadding}
                y={rowY + rowHeight / 2}
                textAnchor="end"
                alignmentBaseline="middle"
                fontSize="12px"
                fontWeight="500"
                fill="#333"
              >
                {s.reason}
              </text>

              {/* Y ticks */}
              {y.ticks(3).map((tick) => (
                <g key={`${s.reason}-${tick}`}>
                  <text
                    x={margin.left - 5}
                    y={y(tick)}
                    textAnchor="end"
                    alignmentBaseline="middle"
                    fontSize="9px"
                    fill="#999"
                  >
                    {tick}
                  </text>
                  <line
                    x1={margin.left}
                    x2={chartWidth - margin.right}
                    y1={y(tick)}
                    y2={y(tick)}
                    stroke="#e2e8f0"
                    strokeDasharray="1,1"
                    strokeWidth={0.5}
                  />
                </g>
              ))}

              <path
                d={lineGenerator(s.values)}
                fill="none"
                stroke="black"
                strokeWidth={2}
              />

              {s.values.map((d, idx) => (
                <circle
                  key={idx}
                  cx={x(d.year)}
                  cy={y(d.value)}
                  r={3}
                  fill="black"
                />
              ))}

              {s.values.map((d, idx) => (
                <text
                  key={`label-${idx}`}
                  x={x(d.year)}
                  y={y(d.value) - 8}
                  textAnchor="middle"
                  fontSize="9px"
                  fill="#666"
                  fontWeight="500"
                >
                  {d.value > 0 ? d.value : ""}
                </text>
              ))}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default OverrideReasonTable;
