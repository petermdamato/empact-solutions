import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import * as d3 from "d3";
import OverrideReasonTable from "../OverrideReasonLines/OverrideReasonLines";

const DistributionChartV2 = ({
  data,
  height,
  setSelectedKey,
  setRecordsTableObject,
  toggleFilter,
  filterVariable,
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height });
  const [hoveredReason, setHoveredReason] = useState(null);
  const [leftWidth, setLeftWidth] = useState(0);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipVisible, setTooltipVisible] = useState(false);

  const handleClick = (d) => {
    const key = "Override_Reason";
    const selectedValue = d[key];
    const currentKey = Object.keys(filterVariable || {})[0];
    const currentValue = filterVariable?.[currentKey];
    const isSameSelection =
      currentKey === key && currentValue === selectedValue;
    toggleFilter(isSameSelection ? null : { key: key, value: selectedValue });
  };

  const handleClickFilteredData = (key) => {
    setSelectedKey(key);
    setRecordsTableObject(true);
  };

  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: height || containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [height]);

  useEffect(() => {
    if (dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const groupKey = "Override_Reason";
    const rawData = data?.data || [];
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
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("No records found");
      return;
    }

    const margin = { top: 60, right: 20, bottom: 80, left: 10 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const grouped = d3.rollups(
      filteredData,
      (records) => records.length,
      (d) => d[groupKey]
    );

    const formattedData = grouped.map(([group, total]) => ({
      [groupKey]: group,
      total,
    }));

    const x = d3
      .scaleBand()
      .domain(formattedData.map((d) => d[groupKey]))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(formattedData, (d) => d.total)])
      .nice()
      .range([innerHeight, 0]);

    const chart = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    chart
      .append("text")
      .attr("x", margin.left)
      .attr("y", margin.top / -2 - 8)
      .attr("text-anchor", "left")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .attr("fill", "#333")
      .text("DST Override Reason");

    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(""));

    // Labels
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
      const barHeight = innerHeight - y(d.total);
      const xPos = x(d[groupKey]);
      const yPos = y(d.total);

      chart
        .append("rect")
        .attr("x", xPos)
        .attr("y", yPos)
        .attr("width", x.bandwidth())
        .attr("height", barHeight)
        .attr("fill", "#5a6b7c")
        .on("mouseenter", () => {
          const containerBox = containerRef.current.getBoundingClientRect();

          setHoveredReason(d[groupKey]);
          setTooltipVisible(true);
          setTooltipPosition({
            x: containerBox.left + xPos + 5 - (leftWidth > 40 ? 10 : 0),
            y: containerBox.top + yPos,
          });
        })
        .on("mouseleave", (e) => {
          // We'll hide tooltip only if not hovering over the tooltip
          requestAnimationFrame(() => {
            const el = document.elementFromPoint(e.clientX, e.clientY);
            if (!el?.closest(".override-tooltip")) {
              setTooltipVisible(false);
              setHoveredReason(null);
            }
          });
        })
        .on("click", () => handleClick(d));

      chart
        .append("text")
        .attr("x", xPos + x.bandwidth() / 2)
        .attr("y", yPos - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .attr("fill", "#333")
        .text(d.total);
    });
  }, [data, dimensions, leftWidth]);

  const reasonTableData =
    hoveredReason && data?.timeSeriesDataCountByReason
      ? Object.entries(data.timeSeriesDataCountByReason).reduce(
          (acc, [year, reasons]) => {
            const foundKey = Object.keys(reasons).find(
              (k) =>
                k.trim().toLowerCase() === hoveredReason.trim().toLowerCase()
            );
            if (foundKey) {
              acc[year] = { [foundKey]: reasons[foundKey] };
            }
            return acc;
          },
          {}
        )
      : null;

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      <svg
        ref={svgRef}
        style={{ width: "100%", height: "100%", overflow: "hidden" }}
      />
      {tooltipVisible && hoveredReason && reasonTableData && (
        <div
          className="override-tooltip"
          onMouseEnter={() => setTooltipVisible(true)}
          onMouseLeave={() => {
            setTooltipVisible(false);
            setHoveredReason(null);
          }}
          style={{
            position: "fixed",
            top: tooltipPosition.y + 60,
            left: tooltipPosition.x - 380,
            background: "#fff",
            border: "1px solid #e2e8f0",
            borderRadius: "8px",
            padding: "12px",
            zIndex: 999,
            boxShadow: "0 2px 12px rgba(0,0,0,0.15)",
            pointerEvents: "auto",
          }}
        >
          <h4 style={{ margin: "0 0 8px", fontSize: "14px" }}>
            {hoveredReason}{" "}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault();
                handleClickFilteredData(hoveredReason);
              }}
              style={{
                fontSize: "12px",
                color: "#3182ce",
                textDecoration: "underline",
                marginLeft: "8px",
              }}
            >
              View Records
            </a>
          </h4>
          <OverrideReasonTable
            data={reasonTableData}
            setLeftWidth={setLeftWidth}
          />
        </div>
      )}
    </div>
  );
};

export default DistributionChartV2;
