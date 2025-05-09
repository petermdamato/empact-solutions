import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";

const LineChart = ({ data, type = "count", header, comparison = "none" }) => {
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
    if (!data || data.length === 0 || !header) return;

    const finalData = data.filter((entry) => entry[header]);

    const parseYear = (d) => new Date(d[header]).getFullYear();

    let seriesData = [];

    if (comparison === "none") {
      const grouped = d3.group(finalData, (d) => parseYear(d));
      const aggregated = Array.from(grouped, ([year, values]) => {
        const parsedYear = +year;
        if (type === "count") {
          return {
            year: parsedYear,
            value: values.filter((v) => v[header] != null).length,
            group: "All",
          };
        } else if (type === "average") {
          const nums = values.map((v) => +v[header]).filter((v) => !isNaN(v));
          const avg = d3.mean(nums);
          return {
            year: parsedYear,
            value: avg,
            group: "All",
          };
        }
        return null;
      })
        .filter(Boolean)
        .sort((a, b) => a.year - b.year);

      seriesData = [{ key: "All", values: aggregated }];
    } else {
      const grouped = d3.group(
        finalData.filter((d) => d[comparison] != null),
        (d) => d[comparison],
        (d) => parseYear(d)
      );

      seriesData = Array.from(grouped, ([groupKey, yearMap]) => {
        const values = Array.from(yearMap, ([year, records]) => {
          if (type === "count") {
            return {
              year: +year,
              value: records.length,
              group: groupKey,
            };
          } else if (type === "average") {
            const nums = records
              .map((v) => +v[header])
              .filter((v) => !isNaN(v));
            return {
              year: +year,
              value: d3.mean(nums),
              group: groupKey,
            };
          }
          return null;
        })
          .filter(Boolean)
          .sort((a, b) => a.year - b.year);

        return { key: groupKey, values };
      });
    }

    const width = containerWidth;
    const height = 240;
    const margin = { top: 10, right: 10, bottom: 30, left: 50 };

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

    const blues =
      d3.schemeBlues[seriesData.length + 1] ||
      d3.quantize(d3.interpolateBlues, seriesData.length + 1);
    const colorScale = d3
      .scaleOrdinal()
      .domain(seriesData.map((s) => s.key))
      .range(blues.slice(1));

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
    });

    // // Optional legend
    // svg
    //   .selectAll(".legend")
    //   .data(seriesData.map((s) => s.key))
    //   .enter()
    //   .append("text")
    //   .attr("x", width - margin.right - 80)
    //   .attr("y", (d, i) => margin.top + i * 20)
    //   .text((d) => d)
    //   .attr("fill", (d) => colorScale(d))
    //   .style("font-size", "12px")
    //   .style("cursor", "default");
  }, [data, type, header, comparison, containerWidth]);

  return (
    <div ref={containerRef} style={{ width: "100%" }}>
      <svg ref={svgRef} style={{ width: "100%" }} />
    </div>
  );
};

export default LineChart;
