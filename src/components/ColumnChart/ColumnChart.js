import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import * as Constants from "./../../constants";

const ColumnChart = ({
  data,
  calculation,
  margin,
  height,
  format,
  context = "percentages",
}) => {
  const svgRef = useRef();
  const [parentWidth, setParentWidth] = useState(0); // State to store parent width

  // Observe the parent width using ResizeObserver
  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setParentWidth(width); // Update parent width
      }
    });

    if (svgRef.current && svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement); // Observe the parent element
    }

    return () => {
      if (svgRef.current && svgRef.current.parentElement) {
        resizeObserver.unobserve(svgRef.current.parentElement); // Cleanup
      }
    };
  }, []);

  useEffect(() => {
    if (!data) return;

    const innerWidth = parentWidth - margin.left - margin.right; // Use parent width
    const innerHeight = height - margin.top - margin.bottom;

    const getValue =
      context === "releases" || context === "exits"
        ? calculation.toLowerCase().includes("average")
          ? (d) =>
              d.value === 0 ? 0 : Math.round((d.days * 10) / d.value) / 10
          : (d) => d.days
        : context === "population"
        ? (d) => Math.round(d.value * 10) / 10
        : (d) => d.value;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    const xScale = d3
      .scaleBand()
      .domain(["Pre-dispo", "Post-dispo"])
      .range([margin.left, innerWidth - margin.right])
      .padding(0.1);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, getValue)])
      .nice()
      .range([innerHeight - margin.bottom, margin.top]);

    const svg = d3
      .select(svgRef.current)
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    svg.selectAll("*").remove();

    // Draw bars
    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.label))
      .attr("y", (d) => yScale(getValue(d)))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - margin.bottom - yScale(getValue(d)))
      .attr("fill", (d) =>
        d.label.toLowerCase().includes("pre")
          ? Constants.prePostColors.pre
          : Constants.prePostColors.post
      );

    // Add text labels
    svg
      .selectAll("text.value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => xScale(d.label) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(getValue(d)) - 16)
      .text((d) =>
        context === "exits" || context === "releases"
          ? `${getValue(d)} days`
          : getValue(d)
      )
      .attr("fill", "black")
      .style("font-size", 14)
      .style("font-weight", "bold")
      .style("text-anchor", "middle");

    // Add text labels
    svg
      .selectAll("text.value-percentage")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-percentage")
      .attr("x", (d) => xScale(d.label) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(getValue(d)) - 5)
      .text((d) =>
        context === "percentages" || context === "population"
          ? `(${((d.value / total) * 100).toFixed(0)}%)`
          : d.value + " " + context
      )
      .attr("fill", "black")
      .style("font-size", 12)
      .style("text-anchor", "middle");

    // Draw x-axis
    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll(".tick text")
      .attr("font-size", 12);
  }, [data, format, height, parentWidth]);

  return (
    <div style={{ display: "flex", justifyContent: "space-around" }}>
      <svg ref={svgRef} width={parentWidth} height={height}></svg>
    </div>
  );
};

export default ColumnChart;
