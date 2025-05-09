import React, { useEffect, useRef } from "react";
import * as d3 from "d3";
import { dateDiff } from "./../../utils/dateDiff";

const calculateLengthOfStay = (record) => {
  const exitDate = record.Release_Date
    ? new Date(record.Release_Date)
    : record.ATD_Exit_Date
    ? new Date(record.ATD_Exit_Date)
    : null;

  const admissionDate = record.Intake_Date
    ? new Date(record.Intake_Date)
    : record.ADT_Entry_Date
    ? new Date(record.ADT_Entry_Date)
    : null;

  return admissionDate && exitDate
    ? Math.ceil(dateDiff(admissionDate, exitDate, "days"))
    : null;
};

const DistributionChart = (records) => {
  if (!records.data || records.data.length === 0) return;
  const svgRef = useRef();

  useEffect(() => {
    const data = records.data
      .map(calculateLengthOfStay)
      .filter((d) => typeof d === "number" && d >= 0);

    if (data.length === 0) return;

    // Chart setup
    const width = 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height);

    svg.selectAll("*").remove(); // Clear previous render

    const x = d3
      .scaleLinear()
      .domain([0, d3.max(data)])
      .nice()
      .range([margin.left, width - margin.right]);

    const bins = d3.bin().domain(x.domain()).thresholds(120)(data);

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(bins, (d) => d.length)])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const bar = svg
      .append("g")
      .selectAll("rect")
      .data(bins)
      .join("rect")
      .attr("x", (d) => x(d.x0) + 1)
      .attr("y", (d) => y(d.length))
      .attr("width", (d) => Math.max(0, x(d.x1) - x(d.x0) - 1))
      .attr("height", (d) => y(0) - y(d.length))
      .attr("fill", "#3b82f6");

    svg
      .append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(x).ticks(width / 80))
      .attr("font-size", 12);

    svg
      .append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(y))
      .attr("font-size", 12);

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", margin.top)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .attr("font-weight", "bold")
      .text("Length of Stay Distribution");
  }, [records.data]);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md w-full overflow-x-auto">
      <svg ref={svgRef} />
    </div>
  );
};

export default DistributionChart;
