import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import wrap from "@/utils/wrap";
import "./StackedBar.css";
import { useTags } from "@/context/TagsContext";
import EnhancedTooltip from "@/components/EnhancedTooltip/EnhancedTooltip";

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
  const { selectedTags } = useTags();
  const [parentWidth, setParentWidth] = useState(0);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({
    x: 0,
    y: 0,
    screenY: 0,
    screenX: 0,
  });

  const {
    data,
    height,
    margin = { top: 0, right: 40, bottom: 20, left: 20 },
    chartTitle,
    showChart = false,
    context = "number",
    labelContext,
    breakdowns = ["pre", "post"],
    innerBreakdowns,
    innerData = [],
    postDispoData = [],
    colorMapOverride = {},
    filterVariable,
    toggleFilter,
    calculationType,
    groupByKey,
    hasSelector = false,
    valueBreakdowns,
    sorted = false,
    filterable = true,
    compact = false,
  } = props;

  const key = groupByKey === "Disruption Type" ? "Disruption_Type" : groupByKey;

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
    showChart;

    const svg = d3.select(svgRef.current);

    const tempSvg = svg.append("g").attr("class", "temp-label-svg");
    // .style("visibility", "hidden");

    let maxLabelWidth = 0;
    filteredData.forEach((d, i) => {
      const text = tempSvg
        .append("text")
        .attr("x", margin.left)
        .attr("y", 40 + i * 20)
        .text(d.category)
        .call(wrap, 136)
        .style("font-size", 14);

      const width = text.node().getBBox().width;
      if (width > maxLabelWidth) maxLabelWidth = width;
      text.remove();
    });
    tempSvg.remove();

    const paddingForAxis = 24;
    margin.left = Math.max(margin.left, maxLabelWidth + paddingForAxis);

    svg.selectAll("*").remove();

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const finalFilteredData = [...filteredData].sort((a, b) => {
      if (selectedTags.includes(key.toLowerCase())) {
        const totalA = breakdowns.reduce((sum, key) => sum + (a[key] ?? 0), 0);
        const totalB = breakdowns.reduce((sum, key) => sum + (b[key] ?? 0), 0);
        return totalB - totalA; // descending by total value
      } else {
        return a.category.localeCompare(b.category); // alphabetical by category
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
      if (filterable) {
        setTooltipData(null);
        const selectedValue = d.category;
        const currentKey = Object.keys(filterVariable || {})[0];
        const currentValue = filterVariable?.[currentKey];
        const isSameSelection =
          currentKey === key && currentValue === selectedValue;
        toggleFilter(
          isSameSelection ? null : { key: key, value: selectedValue }
        );
      }
    };

    const handleMouseMove = (event, d) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();
      const x = event.clientX - containerRect.left;
      const y = event.clientY - containerRect.top;

      const totalAcrossAllCategories = d3.sum(filteredData, (row) =>
        breakdowns.reduce((sum, key) => sum + (row[key] ?? 0), 0)
      );

      const totalForThisCategory = breakdowns.reduce(
        (sum, key) => sum + (d[key] ?? 0),
        0
      );

      setTooltipData({
        active: true,
        payload: breakdowns.map((breakdown) => ({
          name: breakdown,
          value: d[breakdown] ?? 0,
          color:
            colorMap[breakdown] ||
            colors[breakdowns.indexOf(breakdown) % colors.length],
          ...(chartTitle.includes("LOS") && { count: d["Releases"] ?? 0 }),
        })),
        label: d.category,
        categoryTotal: totalForThisCategory,
        categoryPercent:
          totalAcrossAllCategories > 0
            ? (totalForThisCategory / totalAcrossAllCategories) * 100
            : null,
      });

      setTooltipPosition({
        x: x + 10,
        y: y + 10,
        screenY: event.y,
        screenX: event.x,
      });
    };

    const handleMouseOut = () => setTooltipData(null);

    const backgroundLayer = chart.append("g").attr("class", "background-layer");
    const barsLayer = chart.append("g").attr("class", "bars-layer");
    const labelsLayer = chart.append("g").attr("class", "labels-layer");
    const axisLayer = chart.append("g").attr("class", "axis-layer");

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
      .style("cursor", filterable ? "pointer" : "auto")
      .on("mouseover", function () {
        if (filterable) {
          d3.select(this).attr("fill", "#000").attr("fill-opacity", 0.05);
        }
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "transparent");
      })
      .on("click", handleClick);

    finalFilteredData.forEach((d) => {
      let xOffset = 0;
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
          .style("cursor", "pointer")
          .on("mousemove", (event) => handleMouseMove(event, d))
          .on("mouseout", handleMouseOut)
          .on("click", () => handleClick(event, d));

        // Label logic...
        const labelText = value.toString();
        const tempText = chart
          .append("text")
          .text(labelText)
          .attr("font-size", 14)
          .style("visibility", "hidden");

        const textWidth = tempText.node().getBBox().width;
        tempText.remove();

        labelsLayer
          .append("text")
          .style("opacity", labelText > 0 ? 1 : 0)
          .attr("x", width + 8)
          .attr("y", yScale(d.category) + yScale.bandwidth() / 2)
          .attr("dy", "0.35em")
          .attr("text-anchor", "start")
          .attr("fill", "black")
          .style("font-size", 14)
          .style("user-select", "none")
          .attr("pointer-events", "none")
          .text(
            labelContext && labelContext === "percent"
              ? Math.round(
                  (+labelText * 100) /
                    d3.sum(filteredData, (row) =>
                      breakdowns.reduce((sum, key) => sum + (row[key] ?? 0), 0)
                    )
                ) + "%"
              : Math.round(labelText * 10) / 10
          );

        xOffset += width;
      });
    });

    if (!hasSelector && !compact) {
      chart
        .append("text")
        .attr("x", -margin.left + 6)
        .attr("y", -8)
        .text(chartTitle)
        .style("font-size", 16)
        .style("font-weight", "bold");
    }

    axisLayer
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "y-axis")
      .selectAll(".tick text")
      .text((d) => (d === "" ? "N/A" : d))
      .attr("pointer-events", "none")
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
    key,
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
      style={{ position: "relative", width: "100%", height: "100%" }}
    >
      <svg ref={svgRef} width={parentWidth} height={height}></svg>
      {tooltipData && (
        <div
          style={{
            position: "absolute",
            left:
              tooltipPosition.screenX < 800
                ? `${tooltipPosition.x}px`
                : `${tooltipPosition.x - 340}px`,
            top: `${
              tooltipPosition.screenY > 700 && showChart
                ? tooltipPosition.y - 220
                : tooltipPosition.screenY > 760
                ? tooltipPosition.y - 60
                : tooltipPosition.y
            }px`,
            pointerEvents: "none",
            zIndex: 100,
            width: "420px",
          }}
        >
          <EnhancedTooltip
            active={tooltipData.active}
            chartBreakdowns={innerBreakdowns ?? breakdowns}
            payload={tooltipData.payload}
            chartData={showChart ? innerData : []}
            postDispoData={showChart ? postDispoData : []}
            showChart={showChart}
            label={tooltipData.label}
            chartTitle={chartTitle}
            groupByKey={key}
            valueFormatter={(value) => {
              const identifier = chartTitle.split(" by")[0];
              return value === "N/A"
                ? "N/A"
                : `${Math.round(value * 10) / 10}${
                    context === "percentage"
                      ? "%"
                      : identifier === "LOS"
                      ? " days"
                      : identifier === "Admissions"
                      ? " admissions"
                      : " " + identifier
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
