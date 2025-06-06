import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import wrap from "@/utils/wrap";
import "./StackedBar.css";
import * as Constants from "./../../constants";

const StackedBarChartMedian = ({
  data,
  height,
  margin,
  chartTitle,
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

  // Redraw the chart when data, parent width, or other dependencies change
  useEffect(() => {
    if (!data || data.length === 0 || parentWidth === 0) return;

    const getValue =
      context === "releases"
        ? (d) => d.medianPost + d.medianPre
        : (d) => d.medianPost + d.medianPre;

    const totalCount = 0;

    data = data.sort((a, b) => {
      return b.medianPre + b.medianPost - (a.medianPre + a.medianPost);
    });

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous content

    const innerWidth = parentWidth - margin.left - margin.right; // Use parent width
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, getValue)])
      .range([0, innerWidth]);

    const yScale = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerHeight])
      .padding(0.1);

    // Create a group for the chart
    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Add pre bars
    chart
      .selectAll(".pre-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "pre-bar")
      .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 4 - 2)
      .attr("x", 0)
      .attr("height", yScale.bandwidth() / 2 + 2)
      .attr("width", (d) =>
        xScale(context === "percentages" ? d.pre : d.medianPre) > 0
          ? Math.max(xScale(context === "percentages" ? d.pre : d.medianPre), 2)
          : 0
      )
      .attr("fill", Constants.prePostColors.pre);

    // Add post bars
    chart
      .selectAll(".post-bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "post-bar")
      .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 4 - 2)
      .attr("x", (d) =>
        xScale(context === "percentages" ? d.pre : d.medianPre) > 0
          ? Math.max(xScale(context === "percentages" ? d.pre : d.medianPre), 2)
          : 0
      )
      .attr("height", yScale.bandwidth() / 2 + 2)
      .attr("width", (d) =>
        xScale(context === "percentages" ? d.post : d.medianPost) > 0
          ? Math.max(
              xScale(context === "percentages" ? d.post : d.medianPost),
              2
            )
          : 0
      )
      .attr("fill", Constants.prePostColors.post);
    let textWidths = [];
    const labels = chart
      .selectAll(".label-invisible")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label-invisible")
      .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 2)
      .attr("x", (d) => xScale(getValue(d)))
      .attr("dy", "0.35em")
      .text((d) =>
        context === "percentages"
          ? "(" + Math.round(((d.pre + d.post) * 100) / totalCount) + "%)"
          : d.countTotal + " " + context
      )
      .attr("fill", "none")
      .style("font-size", 12);
    // Measure the width of the text elements

    labels.each(function () {
      const bbox = this.getBBox(); // Get the bounding box of the text element
      textWidths.push(bbox.width); // Log the width of the text
    });
    // Add labels
    chart
      .selectAll(".label-percent")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label-percent")
      .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 2 + 5)
      .attr("x", (d, i) => xScale(getValue(d)) + textWidths[i] / 2 + 4)
      .attr("dy", "0.35em")
      .text((d) =>
        context === "percentages"
          ? "(" + Math.round(((d.pre + d.post) * 100) / totalCount) + "%)"
          : d.countTotal + " " + context
      )
      .attr("fill", "black")
      .style("font-size", 12)
      .style("text-anchor", "middle");

    // Add labels
    chart
      .selectAll(".label-nominal")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label-nominal")
      .attr("y", (d) => yScale(d.category) + yScale.bandwidth() / 2 - 7)
      .attr("x", (d, i) => xScale(getValue(d)) + textWidths[i] / 2 + 4)
      .attr("dy", "0.35em")
      .text((d) => (context === "percentages" ? d.pre + d.post : d.medianTotal))
      .attr("fill", "black")
      .style("font-size", 16)
      .style("font-weight", "bold")
      .style("text-anchor", "middle");

    // Add labels
    chart
      .append("text")
      .attr("class", "label")
      .attr("y", -10)
      .attr("x", -margin.left + 10)
      .text(chartTitle)
      .style("font-size", 12);

    // Add y-axis
    chart
      .append("g")
      .call(d3.axisLeft(yScale))
      .attr("class", "y-axis")
      .selectAll(".tick text")
      .text((d) => (d === "" ? "N/A" : d))
      .call(wrap, 96);
  }, [data, height, margin, parentWidth]);

  return <svg ref={svgRef} width={parentWidth} height={height}></svg>;
};

export default StackedBarChartMedian;
