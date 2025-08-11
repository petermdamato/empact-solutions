import React, { useRef, useEffect, useState, useLayoutEffect } from "react";
import * as d3 from "d3";

const DistributionChartStacked = ({
  data,
  keysArray = ["no", "yes"],
  height,
  toggleFilter,
  filterVariable,
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [dimensions, setDimensions] = useState({ width: 0, height });

  const handleClick = (e, d, payload) => {
    const selectedValue = d.category;
    const currentKey = Object.keys(filterVariable || {})[0];
    const currentValue = filterVariable?.[currentKey];

    const isSameSelection = false;
    // const isSameSelection =
    //   currentKey === key && currentValue === selectedValue;
    toggleFilter(
      isSameSelection
        ? null
        : { key: "DST v Actual comparison", value: d.label }
    );
    toggleFilter(isSameSelection ? null : { key: "Auto_Hold", value: d.key });
  };

  // Handle resize and initial width measurement
  useLayoutEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: height || containerRef.current.offsetHeight,
        });
      }
    };

    updateSize();
    window.addEventListener("resize", updateSize);
    return () => window.removeEventListener("resize", updateSize);
  }, [height]);

  useEffect(() => {
    if (dimensions.width === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    if (!data?.data?.length || !keysArray.length) {
      svg
        .attr("width", dimensions.width)
        .attr("height", dimensions.height)
        .append("text")
        .attr("x", dimensions.width / 2)
        .attr("y", dimensions.height / 2)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "#666")
        .text("No records found");
      return;
    }

    const finalData = data.data;
    const groupKey = "DST v Actual comparison";

    const cleanedData = finalData.filter(
      (d) => d[groupKey] !== null && d[groupKey] !== ""
    );

    const margin = { top: 60, right: 120, bottom: 80, left: 10 };
    const innerWidth = dimensions.width - margin.left - margin.right;
    const innerHeight = dimensions.height - margin.top - margin.bottom;

    const grouped = d3.rollups(
      cleanedData,
      (records) => {
        const breakdown = {};
        keysArray.forEach((key) => {
          breakdown[key] = records.filter((d) => {
            const hold = +d.Auto_Hold;
            return (
              (hold === 0 && key === "no") || (hold === 1 && key === "yes")
            );
          }).length;
        });
        return breakdown;
      },
      (d) => d[groupKey]
    );

    const formattedData = grouped.map(([group, values]) => ({
      [groupKey]: group,
      ...values,
    }));

    const totalOverall = d3.sum(formattedData, (d) =>
      d3.sum(keysArray, (key) => d[key] || 0)
    );

    const x = d3
      .scaleBand()
      .domain(formattedData.map((d) => d[groupKey]))
      .range([0, innerWidth])
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(formattedData, (d) => d3.sum(keysArray, (key) => d[key] || 0)),
      ])
      .nice()
      .range([innerHeight, 0]);

    const color = d3.scaleOrdinal(["#5a6b7c", "#333a43"]).domain(keysArray);

    const stackGenerator = d3.stack().keys(keysArray);
    const layers = stackGenerator(formattedData);

    const chart = svg
      .attr("width", dimensions.width)
      .attr("height", dimensions.height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)
      .attr("clip-path", "url(#chart-clip)");

    chart
      .append("text")
      .attr("x", margin.left)
      .attr("y", margin.top / -2 - 8)
      .attr("text-anchor", "left")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .attr("fill", "#333")
      .text(data.title);

    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(x).tickFormat(""));

    formattedData.forEach((d) => {
      const xPos = x(d[groupKey]) + x.bandwidth() / 2;
      const label = d[groupKey];
      const words = label.split(/\s+/);
      const maxWidth = x.bandwidth() - 10;

      const textElement = chart
        .append("text")
        .attr("x", xPos)
        .attr("y", innerHeight + 15)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .attr("fill", "#333");

      let line = [];
      let lineNumber = 0;
      const lineHeight = 14;

      words.forEach((word, i) => {
        line.push(word);
        const testLine = line.join(" ");
        const tempText = chart
          .append("text")
          .attr("opacity", 0)
          .style("font-size", "12px")
          .text(testLine);
        const textWidth = tempText.node().getBBox().width;
        tempText.remove();

        if (textWidth > maxWidth && line.length > 1) {
          line.pop();
          textElement
            .append("tspan")
            .attr("x", xPos)
            .attr("dy", lineNumber === 0 ? 0 : lineHeight)
            .text(line.join(" "));
          line = [word];
          lineNumber++;
        }

        if (i === words.length - 1) {
          textElement
            .append("tspan")
            .attr("x", xPos)
            .attr("dy", lineNumber === 0 ? 0 : lineHeight)
            .text(line.join(" "));
        }
      });
    });

    const barGroups = chart
      .selectAll(".layer")
      .data(layers)
      .enter()
      .append("g")
      .attr("fill", (d) => color(d.key));

    barGroups
      .selectAll("rect")
      .data((layer) =>
        layer.map((seg) => ({
          ...seg,
          key: layer.key,
          label: seg.data[groupKey],
        }))
      )
      .enter()
      .append("rect")
      .style("cursor", "pointer")
      .attr("x", (d) => x(d.label))
      .attr("y", (d) => y(d[1]))
      .attr("height", (d) => y(d[0]) - y(d[1]))
      .attr("width", x.bandwidth())
      .on("click", (event, d) => {
        handleClick(event, { key: d.key, label: d.label });
      });

    formattedData.forEach((d) => {
      const xCenter = x(d[groupKey]) + x.bandwidth() / 2;
      const total = d3.sum(keysArray, (key) => d[key] || 0);
      const percent =
        totalOverall > 0 ? ((total / totalOverall) * 100).toFixed(1) : "0";

      chart
        .append("text")
        .attr("x", xCenter)
        .attr("y", y(total) - 22)
        .attr("text-anchor", "middle")
        .style("font-size", "14px")
        .style("font-weight", "bold")
        .attr("fill", "#333")
        .text(`${total}`);

      chart
        .append("text")
        .attr("x", xCenter)
        .attr("y", y(total) - 8)
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .attr("fill", "#333")
        .text(`(${percent}%)`);
    });

    const legend = svg
      .append("g")
      .attr(
        "transform",
        `translate(${dimensions.width - margin.right + 20}, ${margin.top - 30})`
      );

    legend.append("text").attr("x", 0).attr("y", -8).text("Auto Hold");

    keysArray.forEach((key, i) => {
      const legendRow = legend
        .append("g")
        .attr("transform", `translate(0, ${i * 20})`);

      legendRow
        .append("rect")
        .attr("width", 14)
        .attr("height", 14)
        .attr("fill", color(key));

      legendRow
        .append("text")
        .attr("x", 20)
        .attr("y", 12)
        .text(key[0].toUpperCase() + key.slice(1))
        .style("font-size", "14px")
        .attr("fill", "#333");
    });
  }, [data, keysArray, dimensions]);

  return (
    <div
      ref={containerRef}
      style={{ width: "100%", height: "100%", overflow: "visible" }}
    >
      <svg
        ref={svgRef}
        style={{
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      ></svg>
    </div>
  );
};

export default DistributionChartStacked;
