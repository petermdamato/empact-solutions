import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const ColumnChartMulti = ({
  data,
  margin,
  width,
  height,
  format,
  primary,
  secondary,
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
    if (!data) return;

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const total = data.reduce((sum, d) => sum + d.value, 0);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.label))
      .range([margin.left, innerWidth - margin.right])
      .padding(0.5);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, (d) => d.value)])
      .nice()
      .range([innerHeight - margin.bottom, margin.top]);

    const svg = d3
      .select(svgRef.current)
      .attr("width", innerWidth)
      .attr("height", innerHeight);

    svg.selectAll("*").remove();

    svg
      .selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d) => xScale(d.label))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - margin.bottom - yScale(d.value))
      .attr("fill", (d) =>
        d.label.toLowerCase().includes("pre") ? "#898989" : "#c35a58"
      );

    svg
      .selectAll("text.value-label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-label")
      .attr("x", (d) => xScale(d.label) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 16)
      .text((d) => `${d.value} ${primary}`)
      .attr("fill", "black")
      .style("font-size", 16)
      .style("font-weight", "bold")
      .style("text-anchor", "middle");

    svg
      .selectAll("text.value-percentage")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "value-percentage")
      .attr("x", (d) => xScale(d.label) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .text((d) => `${d.secondary} ${secondary}`)
      .attr("fill", "black")
      .style("font-size", 12)
      .style("text-anchor", "middle");

    svg
      .append("g")
      .attr("transform", `translate(0,${innerHeight - margin.bottom})`)
      .call(d3.axisBottom(xScale));
  }, [data, format, height, parentWidth, primary, secondary]);

  return <svg ref={svgRef} width={parentWidth} height={height}></svg>;
};

export default ColumnChartMulti;
