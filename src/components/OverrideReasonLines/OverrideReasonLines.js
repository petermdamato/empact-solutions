import React, { useEffect } from "react";
import * as d3 from "d3";
import wrap from "@/utils/wrap";

const rowHeight = 70;
const labelPadding = 24;

const getMaxTextWidth = (
  labels,
  fontSize = "12px",
  fontFamily = "sans-serif"
) => {
  const svg = d3.select("body").append("svg").attr("visibility", "hidden");
  const text = svg
    .append("text")
    .style("font-size", fontSize)
    .style("font-family", fontFamily);
  let maxWidth = 0;
  labels.forEach((label) => {
    text.text(label);
    const width = text.node().getBBox().width;
    if (width > maxWidth) maxWidth = width;
  });
  svg.remove();
  return maxWidth;
};

const OverrideReasonTable = ({ data, setLeftWidth }) => {
  if (!data || Object.keys(data).length === 0) {
    return <div>No override reason data available.</div>;
  }

  const xOffset = 8;
  const years = Object.keys(data)
    .map(Number)
    .sort((a, b) => a - b);

  const allReasonsSet = new Set();
  Object.values(data).forEach((yearObj) => {
    Object.keys(yearObj).forEach((reason) => {
      if (reason && reason.trim() !== "") allReasonsSet.add(reason);
    });
  });
  const allReasons = Array.from(allReasonsSet).sort();

  // Calculate dynamic margin
  const maxLabelWidth = getMaxTextWidth(allReasons);
  const dynamicLeftMargin = Math.max(180, maxLabelWidth + labelPadding + 20);
  const chartWidth = dynamicLeftMargin + 200;

  // Move setLeftWidth to useEffect
  useEffect(() => {
    setLeftWidth(maxLabelWidth);
  }, [maxLabelWidth, setLeftWidth]);

  const margin = { top: 20, right: 40, bottom: 30, left: dynamicLeftMargin };

  const series = allReasons.map((reason) => ({
    reason,
    values: years.map((year) => {
      const val = data?.[year]?.[reason];
      return {
        year,
        value: Number.isFinite(val) ? val : 0,
      };
    }),
  }));

  const totalHeight = allReasons.length * rowHeight + margin.bottom;

  const x = d3
    .scaleLinear()
    .domain(d3.extent(years))
    .range([margin.left, chartWidth - margin.right]);

  return (
    <div style={{ overflowX: "auto", width: `${chartWidth}px` }}>
      <svg width={chartWidth} height={totalHeight}>
        <g>
          {years.map((year) => (
            <text
              key={`x-${year}`}
              x={x(year) + xOffset}
              y={margin.top - 10}
              textAnchor="middle"
              fontSize="12px"
              fill="#666"
            >
              {year}
            </text>
          ))}
          <line
            x1={margin.left + xOffset}
            x2={chartWidth - margin.right + xOffset}
            y1={margin.top - 5}
            y2={margin.top - 5}
            stroke="#333"
            strokeWidth={1}
          />
        </g>
        {series.map((s, i) => {
          const rowY = i * rowHeight + 14;
          const chartTop = rowY + margin.top;
          const chartBottom = rowY + rowHeight - margin.top;

          const maxY = d3.max(s.values, (d) => d.value) || 1;
          const y = d3
            .scaleLinear()
            .domain([0, maxY])
            .nice()
            .range([chartBottom, chartTop]);

          const lineGenerator = d3
            .line()
            .defined((d) => d.value > 0 && Number.isFinite(d.value))
            .x((d) => x(d.year) + xOffset)
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
                    {Number.isFinite(tick) ? tick : ""}
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

              {s.values.map(
                (d, idx) =>
                  Number.isFinite(d.value) && (
                    <circle
                      key={idx}
                      cx={x(d.year) + xOffset}
                      cy={y(d.value)}
                      r={3}
                      opacity={d.value > 0 ? 1 : 0}
                      fill="black"
                    />
                  )
              )}

              {s.values.map(
                (d, idx) =>
                  Number.isFinite(d.value) &&
                  d.value > 0 && (
                    <text
                      key={`label-${idx}`}
                      x={x(d.year) + xOffset}
                      y={y(d.value) - 8}
                      textAnchor="middle"
                      fontSize="9px"
                      fill="#666"
                      fontWeight="500"
                    >
                      {d.value}
                    </text>
                  )
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default OverrideReasonTable;
