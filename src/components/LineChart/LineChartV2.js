import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const colors = ["#006890", "#ff7b00"];

const LineChartV2 = ({ data, header, metric, comparison = "none", labels }) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [containerWidth, setContainerWidth] = useState(600); // default fallback

  // ResizeObserver to track width of container
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data || !metric) return;

    // Build the dataset in the required shape: [{ year, value, group }]
    const seriesMap = new Map();

    Object.entries(data).forEach(([year, yearData]) => {
      Object.entries(yearData).forEach(([group, metrics]) => {
        if (!seriesMap.has(group)) seriesMap.set(group, []);
        const value = metrics[metric];
        if (value != null) {
          seriesMap.get(group).push({ year: +year, value, group });
        }
      });
    });

    const seriesData = Array.from(seriesMap, ([key, values]) => ({
      key,
      values: values.sort((a, b) => a.year - b.year),
    }));

    // D3 rendering code below remains mostly unchanged, just update line logic to use this seriesData
    const width = containerWidth;
    const height = 240;
    const margin =
      labels === "Show"
        ? { top: 20, right: 20, bottom: 30, left: 60 }
        : { top: 10, right: 10, bottom: 30, left: 50 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove();

    const allYears = Array.from(
      new Set(seriesData.flatMap((s) => s.values.map((d) => d.year)))
    ).sort();

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
      .domain(seriesData.map((s) => s.key))
      .range(colors);

    const xAxis = d3.axisBottom(xScale).tickFormat(d3.format("d"));
    const yAxis = d3.axisLeft(yScale).ticks(4);

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    const line = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.value));

    seriesData.forEach((series) => {
      svg
        .append("path")
        .datum(series.values)
        .attr("fill", "none")
        .attr("stroke", colorScale(series.key))
        .attr("stroke-width", 2)
        .attr("d", line);

      svg
        .selectAll(`.circle-${series.key}`)
        .data(series.values)
        .enter()
        .append("circle")
        .attr("cx", (d) => xScale(d.year))
        .attr("cy", (d) => yScale(d.value))
        .attr("r", 3)
        .attr("fill", colorScale(series.key));

      if (labels === "Show") {
        // Combine all label data across series
        const allLabelData = [];

        seriesData.forEach((series) => {
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
        });

        // Global simulation to avoid all label collisions
        const simulation = d3
          .forceSimulation(allLabelData)
          .force("x", d3.forceX((d) => d.fx).strength(1)) // lock to X
          .force("y", d3.forceY((d) => d.valueY - 20).strength(0.5))
          .force("collision", d3.forceCollide(16))
          .stop();

        for (let i = 0; i < 200; ++i) simulation.tick(); // more ticks = more stable layout

        // Draw labels after resolving all collisions
        svg
          .selectAll(".point-label")
          .data(allLabelData)
          .enter()
          .append("text")
          .attr("class", "point-label")
          .attr("x", (d) => d.x)
          .attr("y", (d) => Math.max(margin.top + 6, d.y)) // prevent clipping top
          .attr("text-anchor", "middle")
          .attr("font-size", "10px")
          .attr("fill", (d) => d.color)
          .text((d) => d.text);

        // Optional: Add leader lines from point to label
        svg
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
    });
  }, [data, metric, containerWidth, labels]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg ref={svgRef} style={{ width: "100%" }} />
    </div>
  );
};

export default LineChartV2;
