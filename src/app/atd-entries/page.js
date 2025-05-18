import React, { useRef, useEffect, useState } from "react";
import { select } from "d3-selection";
import { scaleLinear, scaleTime } from "d3-scale";
import { extent, max, min } from "d3-array";
import {
  line,
  curveLinear,
  symbol,
  symbolCircle,
  symbolSquare,
  symbolTriangle2,
} from "d3-shape";
import { symbolHexagon } from "d3-symbol-extra";
import { parseISO, formatISO, subMonths, addMonths } from "date-fns";
import XAxisStylized from "./XAxisStylized";
import { raceChartLegend } from "../utils/constants";
import findVaryingAttribute from "../utils/findVaryingAttribute";

const baseKeys = [
  "source_id",
  "metric_id",
  "geo_type",
  "geo_id",
  "geo_name",
  "geom",
  "date",
  "total",
];
const raceGroupKeys = ["black", "white", "other", "asian", "hispanic", "total"];

const LineChart = ({ data, styles, compareBy, minHeight = 300 }) => {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [sizeDimensions, setSizeDimensions] = useState({
    width: 0,
    height: minHeight,
  });
  const [ghostedData, setGhostedData] = useState([]);
  const [tickNumber] = useState(10);
  const [axisHeight] = useState(22);

  const margin = { top: 40, right: 20, bottom: 20, left: 20 };

  useEffect(() => {
    const element = containerRef.current;
    if (!element) return;

    const observer = new ResizeObserver((entries) => {
      const { width } = entries[0].contentRect;
      setSizeDimensions((prev) => ({ width, height: prev.height }));
    });

    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!data || data.length === 0) return;

    // Parse all dates in original data
    const parsedData = data.map((d) => ({
      ...d,
      date: parseISO(d.date),
    }));

    const first = parsedData[0];
    const last = parsedData[parsedData.length - 1];

    // Add flourish by extending start and end dates
    const ghosted = [
      { ...first, date: subMonths(first.date, 1) },
      ...parsedData,
      { ...last, date: addMonths(last.date, 1) },
    ];

    setGhostedData(ghosted);
  }, [data]);

  // Helper function to check for label collisions
  const checkLabelCollision = (newLabel, existingLabels, padding = 10) => {
    return existingLabels.some(
      (label) =>
        Math.abs(label.x - newLabel.x) < padding &&
        Math.abs(label.y - newLabel.y) < padding
    );
  };

  useEffect(() => {
    if (!ghostedData || ghostedData.length === 0 || sizeDimensions.width === 0)
      return;

    const width = sizeDimensions.width;
    const height = sizeDimensions.height - axisHeight;
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const xScale = scaleTime()
      .domain(extent(ghostedData, (d) => d.date))
      .range([0, innerWidth]);

    const raceKeys = raceChartLegend.map((race) =>
      race.label === "all" ? "total" : race.label.toLowerCase()
    );

    const yMax = max(ghostedData, (d) => max(raceKeys.map((race) => d[race])));
    const yMin = min(ghostedData, (d) => min(raceKeys.map((race) => d[race])));

    const yScale = scaleLinear().domain([yMin, yMax]).range([innerHeight, 0]);

    const svg = select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a group for all graphical elements (lines, symbols)
    const graphicsGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Create a separate group for all text elements that will be rendered on top
    const textGroup = svg
      .append("g")
      .attr("transform", `translate(${margin.left}, ${margin.top})`);

    const dataMask = ghostedData.map((d) => ({
      ...d,
      ...(d.onOff === "off" && {
        black: null,
        white: null,
        asian: null,
        hispanic: null,
        total: null,
      }),
    }));

    // Store all labels to check for collisions
    const labels = [];

    if (compareBy === "Race/Ethnicity" || !compareBy) {
      raceChartLegend.forEach((race) => {
        const raceKey =
          race.label === "all" ? "total" : race.label.toLowerCase();
        const hasData = ghostedData.some((d) => d[raceKey] != null);
        if (!hasData) return;

        const raceLookup = raceKey === "total" ? "all" : raceKey;

        const raceColor =
          raceChartLegend.find((i) => i.label === raceLookup)?.color ?? "green";
        const raceSymbol =
          raceChartLegend.find((i) => i.label === raceLookup)?.shape ??
          symbolCircle;

        const linePath = line()
          .defined((d) => d[raceKey] != null)
          .x((d) => xScale(d.date))
          .y((d) => yScale(d[raceKey]))
          .curve(curveLinear);

        const onData = ghostedData.filter((d) => d.onOff !== "off");
        const firstOnX = xScale(onData[1]?.date ?? onData[0]?.date ?? 0);
        const lastOnX = xScale(
          onData[onData.length - 2]?.date ??
            onData[onData.length - 1]?.date ??
            0
        );

        graphicsGroup
          .append("defs")
          .append("clipPath")
          .attr("id", `ghost-clip-${raceKey}`)
          .append("rect")
          .attr("x", firstOnX)
          .attr("y", -margin.top)
          .attr("width", lastOnX - firstOnX)
          .attr("height", height);

        graphicsGroup
          .append("path")
          .datum(ghostedData)
          .attr("fill", "none")
          .attr("stroke", raceColor)
          .attr("stroke-linecap", "square")
          .attr("stroke-width", 10)
          .attr("d", linePath);

        graphicsGroup
          .append("path")
          .datum(dataMask)
          .attr("fill", "none")
          .attr("stroke", "white")
          .attr("stroke-width", 7)
          .attr("stroke-linecap", "square")
          .attr("d", linePath);

        graphicsGroup
          .append("path")
          .datum(dataMask)
          .attr("fill", "none")
          .attr("stroke", raceColor)
          .attr("stroke-width", 7)
          .attr("stroke-linecap", "square")
          .attr("d", linePath)
          .attr("clip-path", `url(#ghost-clip-${raceKey})`);

        // Draw min/max markers
        const shapeGenerator = symbol()
          .type(raceSymbol)
          .size(raceKey === "black" ? 240 : 200);

        const path = shapeGenerator();

        const minRecord = ghostedData.reduce((acc, record) => {
          const val = record[raceKey];
          if (val == null) return acc;
          if (
            acc == null ||
            val < acc.value ||
            (val === acc.value && record.date > acc.date)
          ) {
            return { value: val, date: record.date };
          }
          return acc;
        }, null);

        const maxRecord = ghostedData.reduce((acc, record) => {
          const val = record[raceKey];
          if (val == null) return acc;
          if (
            acc == null ||
            val > acc.value ||
            (val === acc.value && record.date > acc.date)
          ) {
            return { value: val, date: record.date };
          }
          return acc;
        }, null);

        if (minRecord) {
          const minX = xScale(minRecord.date);
          const minY = yScale(minRecord.value);

          graphicsGroup
            .append("path")
            .attr("fill", "white")
            .attr("transform", `translate(${minX},${minY}) scale(1.5)`)
            .attr("d", path);

          graphicsGroup
            .append("path")
            .attr("fill", raceColor)
            .attr("transform", `translate(${minX},${minY})`)
            .attr("d", path);

          // Add label for min value (only for black and total)
          if (raceKey === "black" || raceKey === "total") {
            const labelText = `${minRecord.value.toFixed(1)}`;
            const labelX = minX;
            const labelY = minY - 15; // Position above the point

            // Try different positions if there's a collision
            let finalLabelY = labelY;
            let finalLabelX = labelX;
            let anchor = "middle";
            let attempts = 0;
            const maxAttempts = 4;

            while (attempts < maxAttempts) {
              const testLabel = {
                x: finalLabelX,
                y: finalLabelY,
                width: labelText.length * 6,
                height: 12,
              };

              if (!checkLabelCollision(testLabel, labels)) {
                break;
              }

              attempts++;
              switch (attempts) {
                case 1:
                  finalLabelY = minY + 25; // Try below
                  break;
                case 2:
                  finalLabelX = minX - 30; // Try left
                  anchor = "end";
                  break;
                case 3:
                  finalLabelX = minX + 30; // Try right
                  anchor = "start";
                  break;
                default:
                  finalLabelY = minY - 30; // Try further above
              }
            }

            if (attempts < maxAttempts) {
              labels.push({
                x: finalLabelX,
                y: finalLabelY,
                width: labelText.length * 6,
                height: 12,
              });

              // Add white glow effect by drawing multiple strokes
              for (let i = 3; i > 0; i--) {
                textGroup
                  .append("text")
                  .attr("x", finalLabelX)
                  .attr("y", finalLabelY)
                  .attr("text-anchor", anchor)
                  .attr("font-size", "18px")
                  .attr("fill", "white")
                  .attr("stroke", "white")
                  .attr("stroke-width", i)
                  .attr("stroke-opacity", 0.5)
                  .attr("font-weight", "bold")
                  .text(labelText);
              }

              // Add the main text on top
              textGroup
                .append("text")
                .attr("x", finalLabelX)
                .attr("y", finalLabelY)
                .attr("text-anchor", anchor)
                .attr("font-size", "18px")
                .attr("fill", raceColor)
                .attr("font-weight", "bold")
                .text(labelText);
            }
          }
        }

        if (maxRecord) {
          const maxX = xScale(maxRecord.date);
          const maxY = yScale(maxRecord.value);

          graphicsGroup
            .append("path")
            .attr("fill", "white")
            .attr("transform", `translate(${maxX},${maxY}) scale(1.5)`)
            .attr("d", path);

          graphicsGroup
            .append("path")
            .attr("fill", raceColor)
            .attr("transform", `translate(${maxX},${maxY})`)
            .attr("d", path);

          // Add label for max value (only for black and total)
          if (raceKey === "black" || raceKey === "total") {
            const labelText = `${maxRecord.value.toFixed(1)}`;
            const labelX = maxX;
            const labelY = maxY - 15; // Position above the point

            // Try different positions if there's a collision
            let finalLabelY = labelY;
            let finalLabelX = labelX;
            let anchor = "middle";
            let attempts = 0;
            const maxAttempts = 4;

            while (attempts < maxAttempts) {
              const testLabel = {
                x: finalLabelX,
                y: finalLabelY,
                width: labelText.length * 6,
                height: 12,
              };

              if (!checkLabelCollision(testLabel, labels)) {
                break;
              }

              attempts++;
              switch (attempts) {
                case 1:
                  finalLabelY = maxY + 25; // Try below
                  break;
                case 2:
                  finalLabelX = maxX - 30; // Try left
                  anchor = "end";
                  break;
                case 3:
                  finalLabelX = maxX + 30; // Try right
                  anchor = "start";
                  break;
                default:
                  finalLabelY = maxY - 30; // Try further above
              }
            }

            if (attempts < maxAttempts) {
              labels.push({
                x: finalLabelX,
                y: finalLabelY,
                width: labelText.length * 6,
                height: 12,
              });

              // Add white glow effect by drawing multiple strokes
              for (let i = 3; i > 0; i--) {
                textGroup
                  .append("text")
                  .attr("x", finalLabelX)
                  .attr("y", finalLabelY)
                  .attr("text-anchor", anchor)
                  .attr("font-size", "18px")
                  .attr("fill", "white")
                  .attr("stroke", "white")
                  .attr("stroke-width", i)
                  .attr("stroke-opacity", 0.5)
                  .attr("font-weight", "bold")
                  .text(labelText);
              }

              // Add the main text on top
              textGroup
                .append("text")
                .attr("x", finalLabelX)
                .attr("y", finalLabelY)
                .attr("text-anchor", anchor)
                .attr("font-size", "18px")
                .attr("fill", raceColor)
                .attr("font-weight", "bold")
                .text(labelText);
            }
          }
        }
      });
    } else {
      const varyingKey = findVaryingAttribute(
        ghostedData,
        raceGroupKeys,
        baseKeys
      );

      const compareValues = [...new Set(ghostedData.map((d) => d[varyingKey]))];

      compareValues.forEach((val, idx) => {
        const filteredData = ghostedData.filter((d) => d[varyingKey] === val);
        const color = styles?.[val]?.color || `hsl(${idx * 60}, 70%, 50%)`; // fallback color
        const symbolShape = symbolCircle;

        const linePath = line()
          .defined((d) => d.total != null)
          .x((d) => xScale(d.date))
          .y((d) => yScale(d.total))
          .curve(curveLinear);

        graphicsGroup
          .append("path")
          .datum(filteredData)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-linecap", "square")
          .attr("stroke-width", 7)
          .attr("d", linePath);

        // Optional: draw min/max markers for 'total'
        const minRecord = filteredData.reduce(
          (acc, d) => (acc == null || d.total < acc.total ? d : acc),
          null
        );
        const maxRecord = filteredData.reduce(
          (acc, d) => (acc == null || d.total > acc.total ? d : acc),
          null
        );

        const shapeGen = symbol().type(symbolShape).size(200);
        const path = shapeGen();

        if (minRecord) {
          const minX = xScale(minRecord.date);
          const minY = yScale(minRecord.total);

          graphicsGroup
            .append("path")
            .attr("fill", "white")
            .attr("transform", `translate(${minX},${minY}) scale(1.5)`)
            .attr("d", path);

          graphicsGroup
            .append("path")
            .attr("fill", color)
            .attr("transform", `translate(${minX},${minY})`)
            .attr("d", path);

          // Add label for min value
          const labelText = `${minRecord.total.toFixed(1)}`;
          const labelX = minX;
          const labelY = minY - 15; // Position above the point

          // Try different positions if there's a collision
          let finalLabelY = labelY;
          let finalLabelX = labelX;
          let anchor = "middle";
          let attempts = 0;
          const maxAttempts = 4;

          while (attempts < maxAttempts) {
            const testLabel = {
              x: finalLabelX,
              y: finalLabelY,
              width: labelText.length * 6,
              height: 12,
            };

            if (!checkLabelCollision(testLabel, labels)) {
              break;
            }

            attempts++;
            switch (attempts) {
              case 1:
                finalLabelY = minY + 25; // Try below
                break;
              case 2:
                finalLabelX = minX - 30; // Try left
                anchor = "end";
                break;
              case 3:
                finalLabelX = minX + 30; // Try right
                anchor = "start";
                break;
              default:
                finalLabelY = minY - 30; // Try further above
            }
          }

          if (attempts < maxAttempts) {
            labels.push({
              x: finalLabelX,
              y: finalLabelY,
              width: labelText.length * 6,
              height: 12,
            });

            // Add white glow effect by drawing multiple strokes
            for (let i = 3; i > 0; i--) {
              textGroup
                .append("text")
                .attr("x", finalLabelX)
                .attr("y", finalLabelY)
                .attr("text-anchor", anchor)
                .attr("font-size", "18px")
                .attr("fill", "white")
                .attr("stroke", "white")
                .attr("stroke-width", i)
                .attr("stroke-opacity", 0.5)
                .attr("font-weight", "bold")
                .text(labelText);
            }

            // Add the main text on top
            textGroup
              .append("text")
              .attr("x", finalLabelX)
              .attr("y", finalLabelY)
              .attr("text-anchor", anchor)
              .attr("font-size", "18px")
              .attr("fill", color)
              .attr("font-weight", "bold")
              .text(labelText);
          }
        }

        if (maxRecord) {
          const maxX = xScale(maxRecord.date);
          const maxY = yScale(maxRecord.total);

          graphicsGroup
            .append("path")
            .attr("fill", "white")
            .attr("transform", `translate(${maxX},${maxY}) scale(1.5)`)
            .attr("d", path);

          graphicsGroup
            .append("path")
            .attr("fill", color)
            .attr("transform", `translate(${maxX},${maxY})`)
            .attr("d", path);

          // Add label for max value
          const labelText = `${maxRecord.total.toFixed(1)}`;
          const labelX = maxX;
          const labelY = maxY - 15; // Position above the point

          // Try different positions if there's a collision
          let finalLabelY = labelY;
          let finalLabelX = labelX;
          let anchor = "middle";
          let attempts = 0;
          const maxAttempts = 4;

          while (attempts < maxAttempts) {
            const testLabel = {
              x: finalLabelX,
              y: finalLabelY,
              width: labelText.length * 6,
              height: 12,
            };

            if (!checkLabelCollision(testLabel, labels)) {
              break;
            }

            attempts++;
            switch (attempts) {
              case 1:
                finalLabelY = maxY + 25; // Try below
                break;
              case 2:
                finalLabelX = maxX - 30; // Try left
                anchor = "end";
                break;
              case 3:
                finalLabelX = maxX + 30; // Try right
                anchor = "start";
                break;
              default:
                finalLabelY = maxY - 30; // Try further above
            }
          }

          if (attempts < maxAttempts) {
            labels.push({
              x: finalLabelX,
              y: finalLabelY,
              width: labelText.length * 6,
              height: 12,
            });

            // Add white glow effect by drawing multiple strokes
            for (let i = 3; i > 0; i--) {
              textGroup
                .append("text")
                .attr("x", finalLabelX)
                .attr("y", finalLabelY)
                .attr("text-anchor", anchor)
                .attr("font-size", "18px")
                .attr("fill", "white")
                .attr("stroke", "white")
                .attr("stroke-width", i)
                .attr("stroke-opacity", 0.5)
                .attr("font-weight", "bold")
                .text(labelText);
            }

            // Add the main text on top
            textGroup
              .append("text")
              .attr("x", finalLabelX)
              .attr("y", finalLabelY)
              .attr("text-anchor", anchor)
              .attr("font-size", "18px")
              .attr("fill", color)
              .attr("font-weight", "bold")
              .text(labelText);
          }
        }
      });
    }
  }, [ghostedData, styles, sizeDimensions]);

  return (
    <div
      ref={containerRef}
      style={{
        width: "100%",
        height: `${sizeDimensions.height}px`,
        overflow: "hidden",
      }}
    >
      <svg
        ref={svgRef}
        width={sizeDimensions.width}
        height={sizeDimensions.height - axisHeight}
      />
      <XAxisStylized
        data={ghostedData}
        width={sizeDimensions.width}
        margin={margin}
        height={axisHeight}
        tickNumber={tickNumber}
      />
    </div>
  );
};

export default LineChart;
