import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import wrap from "@/utils/wrap";
import "./StackedBar.css";
import Selector from "../Selector/Selector";
import LineChartEnhancedTooltip from "@/components/EnhancedTooltip/LineChartEnhancedTooltip";

const defaultColorPalette = [
  "#5b6069",
  "#d3d3d3",
  "#a4c2f4",
  "#f4cccc",
  "#b6d7a8",
];

const StackedBarChartGeneric = (props) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [parentWidth, setParentWidth] = useState(0);
  const [tooltipData, setTooltipData] = useState(null);
  const [selectedKey, setSelectedKey] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const {
    data,
    height,
    margin = { top: 0, right: 40, bottom: 20, left: 20 },
    chartTitle,
    showChart = false,
    context = "number",
    labelContext,
    breakdowns = ["pre", "post"],
    tooltipPayload,
    innerBreakdowns,
    innerData = [],
    colorMapOverride = {},
    filterVariable,
    toggleFilter,
    calculationType,
    groupByKey,
    hasSelector = false,
    valueBreakdowns,
    sorted = false,
  } = props;

  // Resize observer for width changes
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setParentWidth(width);
      }
    });

    const parentElement = svgRef.current?.parentElement;
    if (parentElement) {
      resizeObserver.observe(parentElement);
    }

    return () => {
      if (parentElement) {
        resizeObserver.unobserve(parentElement);
      }
    };
  }, []);

  // Main chart rendering effect
  useEffect(() => {
    if (!data || data.length === 0 || parentWidth === 0) return;

    const filteredData = data.filter(
      (d) => breakdowns.reduce((sum, key) => sum + (d[key] ?? 0), 0) > 0
    );
    if (filteredData.length === 0) return;

    const colorMap = {};
    breakdowns.forEach((key, i) => {
      colorMap[key] =
        colorMapOverride[key] ||
        defaultColorPalette[i % defaultColorPalette.length];
    });

    const tempSvg = d3
      .select(document.body)
      .append("svg")
      .attr("class", "temp-label-svg")
      .style("visibility", "hidden");

    let maxLabelWidth = 0;
    filteredData.forEach((d) => {
      const text = tempSvg
        .append("text")
        .text(d.category)
        .style("font-size", 14);
      const width = text.node().getBBox().width;
      if (width > maxLabelWidth) maxLabelWidth = width;
      text.remove();
    });
    tempSvg.remove();

    const paddingForAxis = 12;
    margin.left = Math.max(margin.left, maxLabelWidth + paddingForAxis);

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const finalFilteredData = [...filteredData].sort((a, b) => {
      if (sorted) {
        const totalA = breakdowns.reduce((sum, key) => sum + (a[key] ?? 0), 0);
        const totalB = breakdowns.reduce((sum, key) => sum + (b[key] ?? 0), 0);
        return totalB - totalA;
      } else {
        return a.category.localeCompare(b.category);
      }
    });

    const chart = svg
      .append("g")
      .attr(
        "transform",
        `translate(${margin.left},${hasSelector ? -10 : margin.top})`
      );

    const getTotalValue = (d) =>
      breakdowns.reduce((sum, key) => sum + (d[key] ?? 0), 0);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(finalFilteredData, getTotalValue)])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(finalFilteredData.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.1);

    const colors = d3.schemeCategory10;

    const handleClick = (event, d) => {
      if (groupByKey !== "Overall Total") {
        setTooltipData(null);
        const selectedValue = d.category;
        const currentKey = Object.keys(filterVariable || {})[0];
        const currentValue = filterVariable?.[currentKey];
        const isSameSelection =
          currentKey === groupByKey && currentValue === selectedValue;

        toggleFilter(
          isSameSelection ? null : { key: groupByKey, value: selectedValue }
        );
      }
    };

    const handleDirectClick = (cat) => {
      if (groupByKey !== "Overall Total") {
        setTooltipData(null);
        const selectedValue = cat.category;
        const currentKey = Object.keys(filterVariable || {})[0];
        const currentValue = filterVariable?.[currentKey];
        const isSameSelection =
          currentKey === groupByKey && currentValue === selectedValue;
        if (isSameSelection) {
          toggleFilter(null);
        } else {
          toggleFilter({ key: groupByKey, value: selectedValue });
        }
      }
    };

    const handleMouseMove = (event, d) => {
      if (!containerRef.current) return;

      setSelectedKey(d.category);

      // Get container position relative to viewport
      const containerRect = containerRef.current.getBoundingClientRect();

      // Calculate position relative to container
      const x = event.clientX - containerRect.left;
      const y = chartTitle.includes("Disruption")
        ? event.clientY - containerRect.top
        : event.clientY > 600
        ? event.clientY - containerRect.top - 300
        : event.clientY - containerRect.top;

      const totalAcrossAllCategories = d3.sum(filteredData, (row) =>
        breakdowns.reduce((sum, key) => sum + (row[key] ?? 0), 0)
      );

      const totalForThisCategory = breakdowns.reduce(
        (sum, key) => sum + (d[key] ?? 0),
        0
      );

      setTooltipData(
        chartTitle.includes("LOS")
          ? {
              active: true,
              payload: breakdowns.map((breakdown) => ({
                name: breakdown,
                value: d[breakdown] ?? 0,
                count: d["Releases"] ?? 0,
                color:
                  colorMap[breakdown] ||
                  colors[breakdowns.indexOf(breakdown) % colors.length],
              })),
              label: d.category,
              categoryTotal: totalForThisCategory,
              categoryPercent: null,
            }
          : {
              active: true,
              payload: breakdowns.map((breakdown) => ({
                name: breakdown,
                value: d[breakdown] ?? 0,
                color:
                  colorMap[breakdown] ||
                  colors[breakdowns.indexOf(breakdown) % colors.length],
              })),
              label: d.category,
              categoryTotal: totalForThisCategory,
              categoryPercent:
                totalAcrossAllCategories > 0
                  ? (totalForThisCategory / totalAcrossAllCategories) * 100
                  : null,
            }
      );

      setTooltipPosition({
        x: x + 10, // Add small offset
        y: y + 10,
      });
    };

    const handleMouseOut = () => setTooltipData(null);

    const backgroundLayer = chart.append("g").attr("class", "background-layer");
    const barsLayer = chart.append("g").attr("class", "bars-layer");
    const axisLayer = chart.append("g").attr("class", "axis-layer");
    const labelsLayer = chart.append("g").attr("class", "labels-layer");

    backgroundLayer
      .selectAll(".row-background")
      .data(finalFilteredData)
      .enter()
      .append("rect")
      .attr("class", "row-background")
      .attr("x", -margin.left)
      .attr("y", (d) => yScale(d.category))
      .attr("width", parentWidth)
      .attr("height", yScale.bandwidth())
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .on("mouseover", function () {
        d3.select(this).attr("fill", "#000").attr("fill-opacity", 0.05);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "transparent");
      })
      .on("click", handleClick);

    finalFilteredData.forEach((d) => {
      let xOffset = 0;
      const cat = d;
      breakdowns.forEach((key, bIndex) => {
        const value = d[key] ?? 0;
        const width = xScale(value) > 0 ? Math.max(xScale(value), 2) : 0;
        barsLayer
          .append("rect")
          .attr("x", xOffset)
          .attr("y", yScale(d.category))
          .attr("width", width)
          .attr("height", yScale.bandwidth())
          .attr("fill", colorMap[key] || colors[bIndex % colors.length])
          .style("cursor", "default")
          .on("mousemove", (event) => handleMouseMove(event, d))
          .on("mouseout", handleMouseOut)
          .style("cursor", "pointer")
          .on("click", () => {
            handleDirectClick(cat);
          });

        const labelText = value.toString();

        labelsLayer
          .append("text")
          .attr("x", xOffset + width / 2)
          .attr("y", yScale(d.category) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "middle")
          .attr("fill", colorMap[key] === "#5b6069" ? "white" : "black") // white text if inside bar
          .attr("opacity", width < 74 ? 0 : 1)
          .style("font-size", 14)
          .style("user-select", "none")
          .attr("pointer-events", "none")
          .text(
            Math.round(
              (+labelText * 100) /
                d3.sum(filteredData, (row) =>
                  breakdowns.reduce((sum, key) => sum + (row[key] ?? 0), 0)
                )
            ) +
              "% (" +
              Math.round(labelText * 10) / 10 +
              ")"
          );

        xOffset += width;
      });
    });

    if (!hasSelector) {
      chart
        .append("text")
        .attr("x", -margin.left + 20)
        .attr("y", -8)
        .text(chartTitle)
        .style("font-size", 14)
        .style("font-weight", "bold");
    }

    axisLayer
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "y-axis")
      .selectAll(".tick text")
      .text((d) => (d === "" ? "N/A" : d))
      .attr("font-size", 14)
      .call(wrap, 106);
  }, [
    data,
    height,
    margin,
    parentWidth,
    breakdowns,
    context,
    filterVariable,
    toggleFilter,
    groupByKey,
    chartTitle,
    colorMapOverride,
    hasSelector,
    labelContext,
    sorted,
  ]);

  if (!data || data.every((d) => d.total === 0)) {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: 0.6,
        }}
      >
        No records match the filters
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <svg ref={svgRef} width={parentWidth} height={height}></svg>
      {tooltipData && (
        <div
          style={{
            position: "absolute",
            left: `${
              tooltipPosition.x > 400
                ? tooltipPosition.x - 320
                : tooltipPosition.x
            }px`,
            top: `${tooltipPosition.y}px`,
            pointerEvents: "none",
            zIndex: 100,
            width: "420px",
          }}
        >
          <LineChartEnhancedTooltip
            active={tooltipData.active}
            chartBreakdowns={breakdowns}
            payload={tooltipData.payload}
            chartData={showChart ? innerData : []}
            label={tooltipData.label}
            chartTitle={chartTitle}
            selectedKey={selectedKey}
            tooltipPayload={tooltipPayload}
            valueFormatter={(value) => {
              let identifier;
              const title = chartTitle;
              identifier = title.split(" by")[0];

              return `${
                value === "N/A"
                  ? "N/A"
                  : Math.round(value * 10) / 10 +
                    (context === "percentage"
                      ? "%"
                      : identifier === "LOS"
                      ? " days"
                      : identifier === "Admissions"
                      ? " admissions"
                      : " " + identifier)
              }`;
            }}
            showPercentage={context === "percentage"}
            totalValue={tooltipData.payload.reduce(
              (sum, item) => sum + item.value,
              0
            )}
            calculationType={calculationType}
            valueBreakdowns={valueBreakdowns}
            categoryTotal={tooltipData.categoryTotal}
            categoryPercent={tooltipData.categoryPercent}
          />
        </div>
      )}
    </div>
  );
};

export default StackedBarChartGeneric;
