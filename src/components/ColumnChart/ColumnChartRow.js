import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import wrap from "@/utils/wrap";

const ColumnChart = ({ data, margin, width, height, format, chartTitle }) => {
  const svgRef = useRef();

  useEffect(() => {
    if (!data.data || data.data.length === 0) return;

    const finalData = data.data;

    const innerWidth = width - margin.left - margin.right; // Use parent width
    const innerHeight = height - margin.top - margin.bottom;

    const total = finalData.reduce((sum, d) => sum + d.value, 0);

    const xScale = d3
      .scaleBand()
      .domain(finalData.map((d) => d.label))
      .range([margin.left, innerWidth - margin.right])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(finalData, (d) => d.value)])
      .nice()
      .range([innerHeight - margin.bottom, margin.top]);

    const svg = d3
      .select(svgRef.current)
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    svg.selectAll("*").remove();
    // Add text labels
    svg
      .append("text")
      .attr("class", "chart-title")
      .attr("x", width / 2)
      .attr("y", 14)
      .text(chartTitle)
      .attr("fill", "black")
      .style("font-size", 14)
      .style("text-anchor", "middle");
    // Draw bars
    svg
      .selectAll("rect")
      .data(finalData)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.label))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - margin.bottom - yScale(d.value))
      .attr("fill", "#3e5772");

    // Add text labels
    svg
      .selectAll("text.value-label")
      .data(finalData)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => xScale(d.label) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 16)
      .text((d) => d.value)
      .attr("fill", "black")
      .style("font-size", 16)
      .style("font-weight", "bold")
      .style("text-anchor", "middle");

    // Add text labels
    svg
      .selectAll("text.value-percentage")
      .data(finalData)
      .enter()
      .append("text")
      .attr("class", "value-percentage")
      .attr("x", (d) => xScale(d.label) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .text((d) => `(${((d.value / total) * 100).toFixed(0)}%)`)
      .attr("fill", "black")
      .style("font-size", 12)
      .style("text-anchor", "middle");

    // Draw x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight - margin.bottom + 6})`)
      .call(d3.axisBottom(xScale))
      .selectAll(".tick text")
      .call(wrap, 94);
  }, [data, format, height, width]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
};

export default ColumnChart;
