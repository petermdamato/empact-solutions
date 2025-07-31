import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const OverridePercentStat = ({ data }) => {
  const svgRef = useRef();
  const [showChart, setShowChart] = useState(false);

  // Set defaults to avoid conditional hook execution
  const finalData = data || {};

  const parsedData = Object.entries(finalData)
    .map(([year, stats]) => ({
      year: +year,
      percent:
        stats && stats.percentWithOverride
          ? parseFloat(stats.percentWithOverride)
          : 0,
    }))
    .sort((a, b) => a.year - b.year);

  const latestYear = parsedData[parsedData.length - 1];
  const chartWidth = 260;
  const chartHeight = 100;

  useEffect(() => {
    if (!showChart || parsedData.length === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const margin = { top: 20, right: 16, bottom: 20, left: 40 };
    const innerWidth = chartWidth - margin.left - margin.right;
    const innerHeight = chartHeight - margin.top - margin.bottom;

    const x = d3
      .scaleLinear()
      .domain(d3.extent(parsedData, (d) => d.year))
      .range([0, innerWidth]);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(parsedData, (d) => d.percent)])
      .nice()
      .range([innerHeight, 0]);

    const line = d3
      .line()
      .x((d) => x(d.year))
      .y((d) => y(d.percent));

    const chart = svg
      .attr("width", chartWidth)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chart
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#5a6b7c")
      .attr("stroke-width", 2)
      .attr("d", line);

    chart
      .selectAll("circle")
      .data(parsedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => x(d.year))
      .attr("cy", (d) => y(d.percent))
      .attr("r", 3.5)
      .attr("fill", "#1a202c");

    chart
      .selectAll("text.label")
      .data(parsedData)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => x(d.year))
      .attr("y", (d) => y(d.percent) - 8)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .style("fill", "#4a5568")
      .text((d) => `${d.percent}%`);

    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(
        d3.axisBottom(x).ticks(parsedData.length).tickFormat(d3.format("d"))
      );

    chart.append("g").call(
      d3
        .axisLeft(y)
        .ticks(4)
        .tickFormat((d) => `${d}%`)
    );
  }, [showChart, parsedData]);

  // Render nothing if there's no usable data
  if (parsedData.length === 0 || !latestYear) return null;

  return (
    <div
      style={{
        position: "relative",
        width: "200px",
        textAlign: "center",
        background: "transparent",
        marginTop: "-16px",
        padding: "16px",
        cursor: "pointer",
      }}
      onMouseEnter={() => setShowChart(true)}
      onMouseLeave={() => setShowChart(false)}
    >
      <div style={{ fontSize: "28px", fontWeight: "bold", color: "#1a202c" }}>
        {latestYear.percent}%
      </div>
      <div style={{ fontSize: "14px", color: "#4a5568" }}>
        Override Percentage{" "}
        {Object.keys(finalData)[Object.keys(finalData).length - 1]}
      </div>

      {showChart && (
        <div
          style={{
            position: "absolute",
            top: "calc(100% + 12px)",
            left: "24%",
            transform: "translateX(-50%)",
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px",
            zIndex: 10,
            boxShadow: "0 2px 12px rgba(0,0,0,0.1)",
          }}
        >
          <svg ref={svgRef}></svg>
        </div>
      )}
    </div>
  );
};

export default OverridePercentStat;
