"use client";
import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import { usePathname } from "next/navigation";
import "./LineChartV2.css";

const LineChartV2 = ({
  data,
  header,
  metric,
  detentionType,
  comparison = "none",
  labels,
  finalChartYear,
  selectedLegendOptions,
  selectedLegendDetails,
}) => {
  if (detentionType === "alternative-to-detention" && metric === "releases") {
    metric = "exits";
  }
  if (detentionType === "alternative-to-detention" && metric === "admissions") {
    metric = "entries";
  }
  const svgRef = useRef();
  const containerRef = useRef();
  const pathname = usePathname();
  const [dimensions, setDimensions] = useState({ width: 0, height: 300 });
  const [renderKey, setRenderKey] = useState(0);
  const [finalDate, setFinalDate] = useState(null);
  const [isFullYear, setIsFullYear] = useState(null);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (finalChartYear && finalChartYear.length > 0) {
      const finalYearInt = parseInt(finalChartYear.slice(4));
      const finalDateIntermediate = new Date(
        `${finalChartYear.slice(4)}-${finalChartYear.slice(
          0,
          2
        )}-${finalChartYear.slice(2, 4)}`
      );

      const isFullYearCheck =
        finalDateIntermediate.getMonth() === 11 &&
        (finalDateIntermediate.getDate() === 31 ||
          finalDateIntermediate.getDate() === 30);

      setFinalDate(finalYearInt);
      setIsFullYear(isFullYearCheck);
    }
  }, [finalChartYear]);

  useEffect(() => {
    setRenderKey((prev) => prev + 1);
    setIsInitialized(false);
  }, [pathname]);

  useEffect(() => {
    if (!containerRef.current) return;

    const measure = () => {
      const width = containerRef.current.clientWidth;
      if (width !== dimensions.width) {
        setDimensions({ width, height: 300 });
      }
      if (!isInitialized) setIsInitialized(true);
    };

    measure();

    const observer = new ResizeObserver(() => {
      requestAnimationFrame(measure);
    });

    observer.observe(containerRef.current);

    const timeout1 = setTimeout(measure, 50);
    const timeout2 = setTimeout(measure, 200);

    return () => {
      observer.disconnect();
      clearTimeout(timeout1);
      clearTimeout(timeout2);
    };
  }, [dimensions.width, isInitialized]);

  useEffect(() => {
    if (!isInitialized || !data || !metric || !selectedLegendDetails?.length)
      return;

    const svg = d3.select(svgRef.current);
    svg.selectAll(".chart-content").remove();

    const margin =
      labels === "Show"
        ? { top: 20, right: 20, bottom: 40, left: 60 }
        : { top: 10, right: 12, bottom: 40, left: 52 };
    const { width, height } = dimensions;

    svg
      .attr("width", width + (labels === "Show" ? 0 : 4))
      .attr("height", height)
      .attr("viewBox", `0 0 ${width + (labels === "Show" ? 0 : 4)} ${height}`);

    const chartGroup = svg.append("g").attr("class", "chart-content");

    const seriesMap = new Map();

    Object.entries(data).forEach(([year, yearData]) => {
      Object.entries(yearData).forEach(([group, metrics]) => {
        if (!seriesMap.has(group)) seriesMap.set(group, []);
        const value = metrics[metric];
        if (!isNaN(value) && value !== null && value !== 0) {
          seriesMap.get(group).push({ year: +year, value, group });
        }
      });
    });

    const seriesData = Array.from(seriesMap, ([key, values]) => ({
      key,
      values: values.sort((a, b) => a.year - b.year),
    }));

    const allYears = Array.from(
      new Set(seriesData.flatMap((s) => s.values.map((d) => d.year)))
    ).sort();

    const yearIsNotEnd = finalDate !== allYears[allYears.length - 1];

    const xScale = d3
      .scalePoint()
      .domain(allYears)
      .range([margin.left, width - margin.right]);

    const yMax = d3.max(seriesData, (s) => d3.max(s.values, (d) => d.value));
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3
      .scaleOrdinal()
      .domain(
        selectedLegendDetails.map((entry) => entry.label.replace("+", ""))
      )
      .range(selectedLegendDetails.map((entry) => entry.color));

    chartGroup
      .append("g")
      .attr("class", "grid-lines")
      .attr("clip-path", "url(#chart-clip)")
      .selectAll("line")
      .data(yScale.ticks(4))
      .enter()
      .append("line")
      .attr("x1", margin.left)
      .attr("x2", width - margin.right)
      .attr("y1", (d) => yScale(d))
      .attr("y2", (d) => yScale(d))
      .attr("stroke", "#e0e0e0")
      .attr("stroke-width", 1);

    const xAxis = d3
      .axisBottom(xScale)
      .tickFormat((d) => d)
      .tickSizeOuter(0);

    const xAxisGroup = chartGroup
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    // Post-process tick labels
    xAxisGroup.selectAll("text").each(function (d, i) {
      if (allYears[i] > finalDate && yearIsNotEnd) {
        d3.select(this).style("fill", "red").style("font-weight", "bold");
      }
    });

    chartGroup
      .append("g")
      .attr("class", "axis y-axis")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(4));

    const line = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value))
      .defined((d) => d.value != null && d.value !== 0);

    seriesData.forEach((series) => {
      chartGroup
        .append("path")
        .datum(series.values)
        .attr("class", "data-line")
        .attr("clip-path", "url(#chart-clip)")
        .attr("fill", "none")
        .attr("stroke", colorScale(series.key))
        .attr("stroke-width", 3)
        .attr("d", line)
        .attr("opacity", () =>
          selectedLegendOptions.length === 0 ||
          selectedLegendOptions.includes(series.key)
            ? 1
            : 0.3
        );
    });

    seriesData.forEach((series) => {
      chartGroup
        .selectAll(`.point-${series.key}`)
        .data(series.values)
        .enter()
        .append("circle")
        .attr("class", `point-${series.key}`)
        .attr("clip-path", "url(#chart-clip)")
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 3)
        .attr("fill", colorScale(series.key))
        .attr("opacity", () =>
          selectedLegendOptions.length === 0 ||
          selectedLegendOptions.includes(series.key)
            ? 1
            : 0.3
        );
    });

    // Hover line and labels
    const interactionGroup = chartGroup
      .append("g")
      .attr("class", "interaction-layer");

    const hoverLine = interactionGroup
      .append("line")
      .attr("class", "hover-line")
      .attr("stroke", "#444")
      .attr("stroke-width", 3)
      .attr("y1", margin.top)
      .attr("y2", height - margin.bottom)
      .style("display", "none");

    const hoverLabels = interactionGroup
      .append("g")
      .attr("class", "hover-labels");

    const overlay = chartGroup
      .append("rect")
      .attr("class", "hover-overlay")
      .attr("x", margin.left)
      .attr("y", margin.top)
      .attr("width", width - margin.left - margin.right)
      .attr("height", height - margin.top - margin.bottom)
      .attr("fill", "transparent")
      .style("cursor", "crosshair");

    const yearToX = new Map(allYears.map((year) => [year, xScale(year)]));

    const dataByGroupAndYear = new Map();
    seriesData.forEach((series) => {
      series.values.forEach((d) => {
        const key = `${series.key}-${d.year}`;
        dataByGroupAndYear.set(key, d.value);
      });
    });

    let frameId = null;
    const tooltip = d3.select(`#tooltip-${metric}`);
    overlay.on("mousemove", function (event) {
      if (frameId) cancelAnimationFrame(frameId);
      frameId = requestAnimationFrame(() => {
        const [mx, my] = d3.pointer(event, svgRef.current);
        const closestYear = d3.least(allYears, (y) => Math.abs(xScale(y) - mx));
        const x = yearToX.get(closestYear);
        hoverLine.style("display", null).attr("x1", x).attr("x2", x);
        hoverLabels.selectAll("*").remove();

        // Tooltip content
        let tooltipHTML = `<strong>${closestYear} | ${
          metric.toLowerCase() === "averagelengthofstay"
            ? "Average length of stay"
            : metric.toLowerCase() === "averagedailypopulation"
            ? "Average daily population"
            : String(metric)[0].toUpperCase() +
              String(metric).slice(1).toLowerCase()
        }</strong><br/><br/>`;

        let closestCircle = null;
        let minDistance = Infinity;

        seriesData.forEach((series) => {
          const value = dataByGroupAndYear.get(`${series.key}-${closestYear}`);
          if (
            value != null &&
            (selectedLegendOptions.length === 0 ||
              selectedLegendOptions.includes(series.key))
          ) {
            const y = yScale(value);
            hoverLabels
              .append("circle")
              .attr("cx", x)
              .attr("cy", y)
              .attr("r", 4)
              .attr("fill", colorScale(series.key));

            // Tooltip data accumulation
            tooltipHTML += `<span style="color:${colorScale(series.key)};">${
              series.key
            }:</span> ${value}<br/>`;

            // Find closest circle
            const distance = Math.abs(my - y);
            if (distance < minDistance) {
              minDistance = distance;
              closestCircle = series.key;
            }
          }
        });

        const tooltipWidth = 100; // approximate width in px; adjust as needed
        const chartCenterX = width / 2;
        const offsetX = mx > chartCenterX ? -tooltipWidth - 12 : 12;

        tooltip
          .style("display", "block")
          .style("left", `${mx + offsetX}px`)
          .style("top", `${offsetX === 12 ? my + 12 : my + 24}px`)
          .html(tooltipHTML);
      });
    });

    overlay.on("mouseleave", () => {
      if (frameId) cancelAnimationFrame(frameId);
      hoverLine.style("display", "none");
      hoverLabels.selectAll("*").remove();
      d3.select(`#tooltip-${metric}`).style("display", "none");
    });

    // Label simulation (same as before, if labels === "Show")
    if (labels === "Show") {
      const allLabelData = [];
      seriesData.forEach((series) => {
        if (
          selectedLegendOptions.length === 0 ||
          selectedLegendOptions.includes(series.key)
        ) {
          series.values.forEach((d) => {
            allLabelData.push({
              x: xScale(d.year),
              y: yScale(d.value) - 12,
              fx: xScale(d.year),
              valueY: yScale(d.value),
              text: d.value,
              group: series.key,
              color: colorScale(series.key),
            });
          });
        }
      });

      const simulation = d3
        .forceSimulation(allLabelData)
        .force("x", d3.forceX((d) => d.fx).strength(1))
        .force("y", d3.forceY((d) => d.valueY - 20).strength(0.5))
        .force("collision", d3.forceCollide(16))
        .stop();

      for (let i = 0; i < 200; ++i) simulation.tick();

      chartGroup
        .selectAll(".point-label")
        .data(allLabelData)
        .enter()
        .append("text")
        .attr("class", "point-label")
        .attr("x", (d) => d.x)
        .attr("y", (d) => Math.max(margin.top + 6, d.y))
        .attr("text-anchor", "middle")
        .attr("font-size", "10px")
        .attr("fill", (d) => d.color)
        .text((d) => d.text);

      chartGroup
        .selectAll(".leader-line")
        .data(allLabelData)
        .enter()
        .append("line")
        .attr("class", "leader-line")
        .attr("x1", (d) => d.x)
        .attr("x2", (d) => d.x)
        .attr("y1", (d) => d.valueY)
        .attr("y2", (d) => Math.max(margin.top + 6, d.y))
        .attr("stroke", (d) => d.color)
        .attr("stroke-width", 0.5);
    }
  }, [
    data,
    metric,
    dimensions,
    labels,
    selectedLegendOptions,
    selectedLegendDetails,
    isInitialized,
    renderKey,
  ]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: "100%",
        minHeight: "320px",
        position: "relative",
      }}
    >
      <svg
        ref={svgRef}
        key={`chart-svg-${renderKey}`}
        style={{
          width: "100%",
          height: "100%",
          display: isInitialized ? "block" : "none",
        }}
      />
      <div
        id={`tooltip-${metric}`}
        style={{
          position: "absolute",
          pointerEvents: "none",
          backgroundColor: "white",
          border: "1px solid #ccc",
          padding: "8px",
          borderRadius: "4px",
          fontSize: "12px",
          display: "none",
          zIndex: 10,
          maxWidth: "300px",
        }}
      ></div>
      {!isInitialized && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#666",
            fontSize: "14px",
          }}
        >
          Loading chart data...
        </div>
      )}
    </div>
  );
};

export default LineChartV2;
