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
  breakdowns = ["pre", "post"],
  colorMapOverride = {},
  filterVariable,
  setFilterVariable,
  groupByKey,
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

    if (svgRef.current?.parentElement) {
      resizeObserver.observe(svgRef.current.parentElement);
    }

    return () => {
      if (svgRef.current?.parentElement) {
        resizeObserver.unobserve(svgRef.current.parentElement);
      }
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || parentWidth === 0) return;

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

    data = data.sort((a, b) => {
      const aSum = breakdowns.reduce((sum, key) => sum + (a[key] ?? 0), 0);
      const bSum = breakdowns.reduce((sum, key) => sum + (b[key] ?? 0), 0);
      return bSum - aSum;
    });

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const getTotalValue = (d) =>
      breakdowns.reduce((sum, key) => sum + (d[key] ?? 0), 0);

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, getTotalValue)])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.1);

    const colors = d3.schemeCategory10;

    const handleClick = (event, d) => {
      const selectedValue = d.category;
      const currentKey = Object.keys(filterVariable || {})[0];
      const currentValue = filterVariable?.[currentKey];

      const isSameSelection =
        currentKey === groupByKey && currentValue === selectedValue;

      if (isSameSelection) {
        setFilterVariable(null);
      } else {
        setFilterVariable({ [groupByKey]: selectedValue });
      }
    };

    // Create layers for proper z-index ordering
    const backgroundLayer = chart.append("g").attr("class", "background-layer");
    const barsLayer = chart.append("g").attr("class", "bars-layer");
    const labelsLayer = chart.append("g").attr("class", "labels-layer");
    const axisLayer = chart.append("g").attr("class", "axis-layer");

    // Background hoverable rects - Add them first to be behind everything
    backgroundLayer
      .selectAll(".row-background")
      .data(data)
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

    // Process rows for bars and labels
    data.forEach((d) => {
      let xOffset = 0;

      // Add bars
      breakdowns.forEach((key, bIndex) => {
        const value = d[key] ?? 0;
        const width = xScale(value);

        barsLayer
          .append("rect")
          .attr("x", xOffset)
          .attr("y", yScale(d.category) + yScale.bandwidth() / 4)
          .attr("width", width)
          .attr("height", yScale.bandwidth() / 2)
          .attr("fill", colorMap[key] || colors[bIndex % colors.length])
          .style("pointer-events", "none");

        // Only add label if text fits
        const labelText = value.toString();
        const tempText = chart
          .append("text")
          .text(labelText)
          .attr("font-size", 10)
          .style("visibility", "hidden");

        const textWidth = tempText.node().getBBox().width;
        tempText.remove();

        if (textWidth + 4 < width) {
          labelsLayer
            .append("text")
            .attr("x", xOffset + width / 2)
            .attr("y", yScale(d.category) + yScale.bandwidth() / 2)
            .attr("dy", "0.35em")
            .attr("text-anchor", "middle")
            .attr("fill", "white")
            .style("font-size", 10)
            .style("user-select", "none")
            .style("-webkit-user-select", "none")
            .style("-ms-user-select", "none")
            .text(Math.round(labelText * 10) / 10);
        }

        xOffset += width;
      });
    });

    // Add chart title
    chart
      .append("text")
      .attr("x", -margin.left + 20)
      .attr("y", -10)
      .text(chartTitle)
      .style("font-size", 14)
      .style("font-weight", "bold");

    // Add y-axis
    axisLayer
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "y-axis")
      .selectAll(".tick text")
      .text((d) => (d === "" ? "N/A" : d))
      .call(wrap, 96);
  }, [
    data,
    height,
    margin,
    parentWidth,
    breakdowns,
    context,
    filterVariable,
    setFilterVariable,
    groupByKey,
  ]);

  return <svg ref={svgRef} width={parentWidth} height={height}></svg>;
};

export default StackedBarChartGeneric;
