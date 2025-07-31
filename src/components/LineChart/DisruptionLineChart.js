import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const DisruptionLineChart = ({ data, selectedKey }) => {
  const svgRef = useRef();

  useEffect(() => {
    // Prepare SVG
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // clear

    const width = 294;
    const height = 300;
    const margin = { top: 40, right: 40, bottom: 40, left: 60 };

    // Transform data to array of objects
    const parsedData = Object.entries(data).map(([year, values]) => {
      const key = selectedKey === "All Program Types" ? "Overall" : selectedKey;
      return {
        year: +year,
        percentDisrupted: values[key]?.disrupted / values[key]?.total,
        percentUndisrupted: values[key]?.undisrupted / values[key]?.total,
      };
    });

    // Scales
    const xScale = d3
      .scaleLinear()
      .domain(d3.extent(parsedData, (d) => d.year))
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([0, 1])
      .range([height - margin.bottom, margin.top]);

    // Line generators
    const lineDisrupted = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.percentDisrupted));

    const lineUndisrupted = d3
      .line()
      .x((d) => xScale(d.year))
      .y((d) => yScale(d.percentUndisrupted));

    // Axes
    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat(d3.format("d"))
          .tickValues(parsedData.map((d) => d.year))
      ); // format as year

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale).ticks(5).tickFormat(d3.format(".0%")));

    // Lines
    svg
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#5b6069")
      .attr("stroke-width", 2)
      .attr("d", lineDisrupted);

    svg
      .append("path")
      .datum(parsedData)
      .attr("fill", "none")
      .attr("stroke", "#acacac")
      .attr("stroke-width", 2)
      .attr("d", lineUndisrupted);

    // Circles + Labels for Disrupted
    svg
      .selectAll(".circle-disrupted")
      .data(parsedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.percentDisrupted))
      .attr("opacity", (d) => (yScale(d.percentDisrupted) ? 1 : 0))
      .attr("r", 3)
      .attr("fill", "#5b6069");

    svg
      .selectAll(".label-disrupted")
      .data(parsedData)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.year))
      .attr("text-anchor", "middle")
      .attr("y", (d) => {
        const y = yScale(d.percentDisrupted);
        // If label would overflow top, put below
        return y - 10 < margin.top ? y + 15 : y - 5;
      })
      .text((d) => d3.format(".0%")(d.percentDisrupted))
      .style("font-size", "10px")
      .style("fill", "#5b6069");

    // Circles + Labels for Undisrupted
    svg
      .selectAll(".circle-undisrupted")
      .data(parsedData)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.year))
      .attr("cy", (d) => yScale(d.percentUndisrupted))
      .attr("opacity", (d) => (yScale(d.percentUndisrupted) ? 1 : 0))
      .attr("r", 3)
      .attr("fill", "#acacac");

    svg
      .selectAll(".label-undisrupted")
      .data(parsedData)
      .enter()
      .append("text")
      .attr("x", (d) => xScale(d.year))
      .attr("text-anchor", "middle")
      .attr("y", (d) => {
        const y = yScale(d.percentUndisrupted);
        return y - 10 < margin.top ? y + 15 : y - 5;
      })
      .text((d) => d3.format(".0%")(d.percentUndisrupted))
      .style("font-size", "10px")
      .style("fill", "#acacac");

    svg
      .append("text")
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("y", () => {
        const firstYearData = parsedData[0];
        // If label would overflow top, put below
        return firstYearData.percentDisrupted
          ? firstYearData.percentUndisrupted > firstYearData.percentDisrupted
            ? yScale(firstYearData.percentDisrupted) - 24
            : yScale(firstYearData.percentDisrupted) + 24
          : 220;
      })
      .text("Disrupted")
      .style("font-size", 14)
      .style("font-weight", 700)
      .style("fill", "#5b6069");

    svg
      .append("text")
      .attr("x", margin.left)
      .attr("text-anchor", "start")
      .attr("y", () => {
        const firstYearData = parsedData[0];
        // If label would overflow top, put below
        return firstYearData.percentUndisrupted
          ? firstYearData.percentUndisrupted > firstYearData.percentDisrupted
            ? yScale(firstYearData.percentUndisrupted) + 24
            : yScale(firstYearData.percentUndisrupted) - 24
          : 80;
      })
      .text("Undisrupted")
      .style("font-size", 14)
      .style("font-weight", 700)
      .style("fill", "#acacac");
  }, [data, selectedKey]);

  return (
    <svg
      ref={svgRef}
      width={294}
      height={300}
      style={{ border: "1px solid #ccc", background: "white" }}
    ></svg>
  );
};

export default DisruptionLineChart;
