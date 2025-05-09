import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import wrap from "@/utils/wrap";
import "./StackedBar.css";

const defaultColorPalette = [
  "#5b6069",
  "#d3d3d3",
  "#a4c2f4",
  "#f4cccc",
  "#b6d7a8",
];

const StackedBarChartGeneric = ({
  data,
  height,
  margin,
  chartTitle,
  context = "number",
  breakdowns = ["pre", "post"], // dynamic fields to stack
  colorMapOverride = {},
}) => {
  const svgRef = useRef();
  const [parentWidth, setParentWidth] = useState(0);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setParentWidth(width);
      }
    });

    if (svgRef.current && svgRef.current.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }

    return () => {
      if (svgRef.current && svgRef.current.parentElement) {
        resizeObserver.unobserve(svgRef.current.parentElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || parentWidth === 0) return;
    // Build dynamic color map
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
    data.forEach((d) => {
      const text = tempSvg
        .append("text")
        .text(d.category)
        .style("font-size", 12);
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

    // Total for percentage calculations
    const totalCount = data.reduce((acc, d) => {
      return acc + breakdowns.reduce((sum, key) => sum + (d[key] ?? 0), 0);
    }, 0);

    // Sort
    data = data.sort((a, b) => {
      const aSum = breakdowns.reduce((sum, key) => sum + (a[key] ?? 0), 0);
      const bSum = breakdowns.reduce((sum, key) => sum + (b[key] ?? 0), 0);
      return bSum - aSum;
    });

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const getTotalValue = (d) =>
      breakdowns.reduce((sum, key) => sum + (d[key] ?? 0), 0);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, getTotalValue)])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(
        data.map((d) => {
          return d.category;
        })
      )
      .range([0, innerHeight])
      .padding(0.1);

    const colors = d3.schemeCategory10;

    // Draw bars
    data.forEach((d, i) => {
      let xOffset = 0;
      breakdowns.forEach((key, bIndex) => {
        const value = d[key] ?? 0;
        const width = xScale(value);

        // Draw breakdown bar
        chart
          .append("rect")
          .attr("x", xOffset)
          .attr("y", yScale(d.category) + yScale.bandwidth() / 4)
          .attr("width", width)
          .attr("height", yScale.bandwidth() / 2)
          .attr("fill", colorMap[key] || colors[bIndex % colors.length]);

        // Add text only if it fits
        const labelText = value.toString();
        const tempText = chart
          .append("text")
          .text(labelText)
          .attr("font-size", 10)
          .style("visibility", "hidden");

        const textWidth = tempText.node().getBBox().width;
        tempText.remove();

        if (textWidth + 4 < width) {
          chart
            .append("text")
            .attr("x", xOffset + width / 2)
            .attr("y", yScale(d.category) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", 10)
            .text(Math.round(labelText * 10) / 10);
        }
        xOffset += width;
      });
    });

    // Title
    chart
      .append("text")
      .attr("x", -margin.left + 20)
      .attr("y", -10)
      .text(chartTitle)
      .style("font-size", 14)
      .style("font-weight", "bold");

    // Y axis
    chart
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "y-axis")
      .selectAll(".tick text")
      .text((d) => (d === "" ? "N/A" : d))
      .call(wrap, 96);
  }, [data, height, margin, parentWidth, breakdowns, context]);

  return <svg ref={svgRef} width={parentWidth} height={height}></svg>;
};

export default StackedBarChartGeneric;
