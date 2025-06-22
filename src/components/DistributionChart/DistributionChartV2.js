import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import OverrideReasonTable from "../OverrideReasonLines/OverrideReasonLines";

const DistributionChartV2 = ({
  data,
  keysArray = ["no", "yes"],
  height,
  width,
}) => {
  const svgRef = useRef();
  const [hoveredReason, setHoveredReason] = useState(null);
  const [hoverPosition, setHoverPosition] = useState({ x: 0, y: 0 });
  const [showChart, setShowChart] = useState(false);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const groupKey = "Override_Reason";

    const rawData = data?.[0]?.data || [];
    if (!rawData.length) return;

    const filteredData = rawData
      .filter((d) => d[groupKey] && d[groupKey].trim() !== "")
      .map((d) => ({
        ...d,
        [groupKey]: d[groupKey].toLowerCase().includes("other")
          ? "Other"
          : d[groupKey],
      }));

    if (!filteredData.length) {
      svg
        .attr("width", width)
        .attr("height", height)
        .append("text")
        .attr("x", width / 2)
        .attr("y", height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("No records found");
      return;
    }

    const margin = { top: 60, right: 20, bottom: 80, left: 10 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const grouped = d3.rollups(
      filteredData,
      (records) => {
        const breakdown = {};
        keysArray.forEach((key) => {
          breakdown[key] = records.filter((d) => {
            const hold = +d.Auto_Hold;
            return (
              (hold === 0 && key === "no") || (hold === 1 && key === "yes")
            );
          }).length;
        });
        return breakdown;
      },
      (d) => d[groupKey]
    );

    const formattedData = grouped.map(([group, values]) => ({
      [groupKey]: group,
      ...values,
    }));

    const x = d3
      .scaleBand()
      .domain(formattedData.map((d) => d[groupKey]))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(formattedData, (d) => d3.sum(keysArray, (key) => d[key] || 0)),
      ])
      .nice()
      .range([innerHeight, 0]);

    const chart = svg
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .on("mouseleave", () => {
        setHoveredReason(null);
        setShowChart(false);
      });

    chart
      .append("text")
      .attr("x", margin.left)
      .attr("y", margin.top / -2 - 8)
      .attr("text-anchor", "left")
      .style("font-size", "14px")
      .style("font-weight", "bold")
      .attr("fill", "#333")
      .text("DST Override Reason");

    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(""));

    formattedData.forEach((d) => {
      const xPos = x(d[groupKey]) + x.bandwidth() / 2;
      const label = d[groupKey];
      const words = label.split(/\s+/);
      const maxWidth = x.bandwidth() - 10;

      const textElement = chart
        .append("text")
        .attr("x", xPos)
        .attr("y", innerHeight + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .attr("fill", "#333");

      let line = [];
      let lineNumber = 0;
      const lineHeight = 14;

      words.forEach((word, i) => {
        line.push(word);
        const testLine = line.join(" ");
        const tempText = chart
          .append("text")
          .attr("opacity", 0)
          .style("font-size", "12px")
          .text(testLine);
        const textWidth = tempText.node().getBBox().width;
        tempText.remove();

        if (textWidth > maxWidth && line.length > 1) {
          line.pop();
          textElement
            .append("tspan")
            .attr("x", xPos)
            .attr("dy", lineNumber === 0 ? 0 : lineHeight)
            .text(line.join(" "));
          line = [word];
          lineNumber++;
        }

        if (i === words.length - 1) {
          textElement
            .append("tspan")
            .attr("x", xPos)
            .attr("dy", lineNumber === 0 ? 0 : lineHeight)
            .text(line.join(" "));
        }
      });
    });

    // Bars
    formattedData.forEach((d) => {
      const total = d3.sum(keysArray, (key) => d[key] || 0);
      const barHeight = innerHeight - y(total);
      const xPos = x(d[groupKey]);
      const yPos = y(total);

      chart
        .append("rect")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("width", x.bandwidth())
        .attr("height", barHeight)
        .attr("fill", "#5a6b7c")
        .on("mousemove", (event) => {
          setHoveredReason(d[groupKey]);
          setHoverPosition({ x: event.clientX, y: event.clientY });
          setShowChart(true);
        })
        .on("mouseleave", () => {
          setHoveredReason(null);
          setShowChart(false);
        });

      chart
        .append("text")
        .attr("x", xPos + x.bandwidth() / 2)
        .attr("y", yPos - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "11px")
        .style("font-weight", "bold")
        .attr("fill", "#333")
        .text(total);
    });
  }, [data, keysArray, width, height]);

  const reasonTableData = (() => {
    if (!hoveredReason || !data?.[0]?.timeSeriesDataCountByReason) return null;
    const timeSeries = data[0].timeSeriesDataCountByReason;

    return timeSeries;
  })();

  return (
    <>
      <svg ref={svgRef}></svg>
      {showChart && hoveredReason && reasonTableData && (
        <div
          style={{
            position: "fixed",
            top: hoverPosition.y + 10,
            left: hoverPosition.x + 10,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px",
            zIndex: 999,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            // pointerEvents: "none",
          }}
        >
          <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>
            {hoveredReason}
          </h4>
          <OverrideReasonTable data={reasonTableData} />
        </div>
      )}
    </>
  );
};

export default DistributionChartV2;
