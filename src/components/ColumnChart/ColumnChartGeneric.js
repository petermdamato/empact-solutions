import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import EnhancedTooltip from "@/components/EnhancedTooltip/EnhancedTooltip";

const defaultColor = "#5a6b7c";
const defaultATDColor = "#5a6b7c";

const ColumnChartGeneric = ({
  data,
  height = 300,
  margin = { top: 60, right: 20, bottom: 30, left: 40 },
  chartTitle = "",
  filterVariable,
  toggleFilter,
  groupByKey,
  calculationType,
  context = "number",
}) => {
  const svgRef = useRef();
  const containerRef = useRef();
  const [parentWidth, setParentWidth] = useState(0);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const { width } = entry.contentRect;
        setParentWidth(width);
      }
    });

    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!data || data.length === 0 || parentWidth === 0) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const innerWidth = parentWidth - margin.left - margin.right;
    const innerHeight = height - margin.bottom;

    const chart = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const xScale = d3
      .scaleBand()
      .domain(data.map((d) => d.category))
      .range([0, innerWidth])
      .padding(0.1);

    const yMax = d3.max(data, (d) => d.value);
    const yScale = d3
      .scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([innerHeight, 0]);

    // Click handlers
    const handleClick = (event, d) => {
      const selectedValue = d.category;
      const currentKey = Object.keys(filterVariable || {})[0];
      const currentValue = filterVariable?.[currentKey];

      const isSameSelection =
        currentKey === groupByKey && currentValue === selectedValue;

      if (isSameSelection) {
        toggleFilter(null);
      } else {
        toggleFilter({ key: groupByKey, value: selectedValue });
      }
    };

    const handleDirectClick = (d) => {
      const selectedValue = d.category;
      const currentKey = Object.keys(filterVariable || {})[0];
      const currentValue = filterVariable?.[currentKey];

      const isSameSelection =
        currentKey === groupByKey && currentValue === selectedValue;

      if (isSameSelection) {
        toggleFilter(null);
      } else {
        toggleFilter({ key: groupByKey, value: selectedValue });
      }
    };

    // Tooltip handlers
    const handleMouseMove = (event, d) => {
      if (!containerRef.current) return;

      const containerRect = containerRef.current.getBoundingClientRect();

      const x = event.clientX - containerRect.left;
      const y = event.clientY - containerRect.top;

      setTooltipData({
        active: true,
        payload: [
          {
            name: d.category,
            value: d.value,
            count: d.count,
            percentage:
              (d.count * 100) /
              data.reduce(
                (accumulator, currentValue) => accumulator + currentValue.count,
                0
              ),
            color: defaultColor,
          },
        ],
        label: d.category,
      });

      setTooltipPosition({
        x: x + 10,
        y: y + 10,
      });
    };

    const handleMouseOut = () => {
      setTooltipData(null);
    };

    // x-axis
    chart
      .append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(d3.axisBottom(xScale))
      .selectAll("text") // select all tick labels
      .style("font-size", "12px");

    // background rectangles for hover + click (behind bars)
    chart
      .selectAll(".background")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "background")
      .attr("x", (d) => xScale(d.category))
      .attr("y", 0)
      .attr("width", xScale.bandwidth())
      .attr("height", innerHeight)
      .attr("fill", "transparent")
      .style("cursor", "pointer")
      .lower()
      .on("mouseover", function (event) {
        d3.select(this).attr("fill", "#000").attr("fill-opacity", 0.05);
      })
      .on("mouseout", function () {
        d3.select(this).attr("fill", "transparent");
      })
      .on("mousemove", handleMouseOut)
      .on("click", (event, d) => handleClick(event, d));

    // bars with direct click
    chart
      .selectAll(".bar")
      .data(data)
      .enter()
      .append("rect")
      .attr("class", "bar")
      .attr("x", (d) => xScale(d.category))
      .attr("y", (d) => yScale(d.value))
      .attr("width", xScale.bandwidth())
      .attr("height", (d) => innerHeight - yScale(d.value))
      .attr("fill", defaultColor)
      .style("cursor", "pointer")
      .on("mousemove", (event, d) => handleMouseMove(event, d))
      .on("mouseout", handleMouseOut)
      .on("click", (event, d) => handleDirectClick(d));

    // value labels above bars
    chart
      .selectAll(".label")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "label")
      .attr("x", (d) => xScale(d.category) + xScale.bandwidth() / 2)
      .attr("y", (d) => yScale(d.value) - 5)
      .attr("text-anchor", "middle")
      .style("font-size", "14px")
      .attr("pointer-events", "none")
      .text((d) => d.value);

    // chart title
    svg
      .append("text")
      .attr("x", margin.left)
      .attr("y", margin.top / 2) // centers title within top margin
      .text(chartTitle)
      .style("font-size", 16)
      .style("font-weight", "bold");
  }, [
    data,
    height,
    margin,
    parentWidth,
    chartTitle,
    filterVariable,
    groupByKey,
    toggleFilter,
    context,
  ]);

  return (
    <div
      ref={containerRef}
      style={{ position: "relative", width: "100%", height }}
    >
      <svg ref={svgRef} width={parentWidth} height={height}></svg>
      {tooltipData && (
        <div
          style={{
            position: "absolute",
            left: `${tooltipPosition.x}px`,
            top: `${tooltipPosition.y}px`,
            pointerEvents: "none",
            zIndex: 100,
          }}
        >
          <EnhancedTooltip
            active={tooltipData.active}
            payload={tooltipData.payload}
            label={tooltipData.label}
            chartTitle={chartTitle}
            calculationType={calculationType}
            valueFormatter={(value) => {
              return `${Math.round(value * 10) / 10}${
                context === "percentage" ? "%" : ""
              }`;
            }}
            showPercentage={true}
            totalValue={tooltipData.payload.reduce(
              (sum, item) => sum + item.value,
              0
            )}
            categoryPercent={tooltipData.payload[0]?.percentage || 0}
          />
        </div>
      )}
    </div>
  );
};

export default ColumnChartGeneric;
