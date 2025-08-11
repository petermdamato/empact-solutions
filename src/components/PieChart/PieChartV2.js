import React, { useRef, useEffect, useState, useMemo } from "react";
import * as d3 from "d3";
import EnhancedTooltip from "@/components/EnhancedTooltip/EnhancedTooltip";
import "./PieChart.css";

const PieChart = ({
  records = [],
  size,
  chartTitle = "Pie Chart",
  groupByKey,
  toggleFilter,
  filterVariable,
  detentionType = "secure-detention",
  offset = 0,
}) => {
  // Watch container size
  const containerWidth = size;
  const containerHeight = size;

  // Margins stay constant
  const margin = { top: 6, right: 4, bottom: 6, left: 4 };

  // Recompute radius + arcs when size changes
  const { radius, arcGen, outerArc } = useMemo(() => {
    const width = containerWidth - margin.left - margin.right + 80;
    const height = containerHeight - margin.top - margin.bottom;
    const radius = Math.min(width, height) / 2 - 30;

    return {
      radius,
      arcGen: d3
        .arc()
        .innerRadius(0)
        .outerRadius(radius - 10),
      outerArc: d3
        .arc()
        .innerRadius(radius + 4)
        .outerRadius(radius + 4),
    };
  }, [size, margin]);

  const color =
    detentionType === "secure-detention"
      ? ["#5a6b7c", "#d5d5d5", "#979ca4"]
      : ["#5b6069", "#d3d3d3"];

  const svgRef = useRef();
  const pathRefs = useRef([]);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const pieData = useMemo(
    () => d3.pie().value((d) => d.value)(records || []),
    [records]
  );

  useEffect(() => {
    if (!records || records.length === 0) return;

    pathRefs.current.forEach((path, i) => {
      if (path) {
        d3.select(path)
          .transition()
          .duration(500)
          .attrTween("d", function () {
            const previous = this._current || pieData[i];
            const interpolate = d3.interpolate(previous, pieData[i]);
            this._current = interpolate(1);
            return (t) => arcGen(interpolate(t));
          });
      }
    });
  }, [records, size, arcGen, pieData]);

  useEffect(() => {
    if (!records || records.length === 0) return;

    pieData.forEach((d, i) => {
      const isSelected =
        !filterVariable?.[groupByKey] ||
        d.data.category === filterVariable[groupByKey];

      d3.selectAll(`[data-label-index='${i}']`)
        .transition()
        .duration(500)
        .style("opacity", isSelected ? 1 : 0);
    });
  }, [filterVariable, records]);

  if (!records || records.length === 0) return null;

  const handleClick = (data) => {
    setTooltipData(null);
    const selectedValue = data.data.category;
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

  const handleMouseOver = (event, d) => {
    setTooltipData({
      active: true,
      payload: [
        {
          name: d.data.category,
          value: d.data.value,
          color: color[pieData.indexOf(d)],
          percentage: Math.round(d.data.percentage * 1000) / 10,
        },
      ],
      label: d.data.category,
    });
    setTooltipPosition({
      x: event.pageX,
      y: event.pageY,
    });
  };

  const handleMouseOut = () => {
    setTooltipData(null);
  };

  return (
    <>
      <div
        className="text-center"
        style={{ marginLeft: "4px", fontSize: "16px" }}
      >
        <strong>{chartTitle}</strong>
      </div>
      {records &&
      (records.length > 1 || (records.length === 1 && records[0].value > 0)) ? (
        <>
          <div
            className="centered-chart"
            style={{ width: "100%", height: "100%" }}
          >
            <svg
              ref={svgRef}
              width={containerWidth + margin.left + margin.right}
              height={containerHeight + margin.top + margin.bottom}
            >
              <g
                transform={`translate(${
                  (containerWidth + margin.left + margin.right) / 2
                }, ${
                  (containerHeight + margin.top + margin.bottom) / 2 - offset
                })`}
              >
                {(() => {
                  const usedLabelAngles = [];

                  return pieData.map((d, i) => {
                    const angle = (d.startAngle + d.endAngle) / 2;
                    const angleDegrees = (angle * 180) / Math.PI;

                    const isTooClose = usedLabelAngles.some(
                      (prev) => Math.abs(prev - angleDegrees) < 45
                    );

                    const renderLabel = !isTooClose;
                    if (renderLabel) usedLabelAngles.push(angleDegrees);

                    return (
                      <g key={i}>
                        <path
                          ref={(el) => (pathRefs.current[i] = el)}
                          d={arcGen(d)}
                          fill={color[i]}
                          stroke="white"
                          strokeWidth={1.5}
                          onClick={() => handleClick(d)}
                          onMouseMove={(e) => handleMouseOver(e, d)}
                          onMouseOut={handleMouseOut}
                        />
                        {renderLabel && (
                          <>
                            <text
                              data-label-index={i}
                              transform={`translate(${
                                outerArc.centroid(d)[0]
                              },${outerArc.centroid(d)[1]})`}
                              textAnchor={
                                outerArc.centroid(d)[0] > 0 ? "start" : "end"
                              }
                              alignmentBaseline="middle"
                              fontSize={14}
                              dy={-6}
                              fontWeight={700}
                              fill="#333"
                            >
                              {`${d.data.category}`}
                            </text>
                            <text
                              data-label-index={i}
                              transform={`translate(${
                                outerArc.centroid(d)[0]
                              },${outerArc.centroid(d)[1]})`}
                              textAnchor={
                                outerArc.centroid(d)[0] > 0 ? "start" : "end"
                              }
                              alignmentBaseline="middle"
                              dy={8}
                              fontSize={12}
                              fill="#333"
                            >
                              {`${d.data.value} (${
                                Math.round(d.data.percentage * 1000) / 10
                              }%)`}
                            </text>
                          </>
                        )}
                      </g>
                    );
                  });
                })()}
              </g>
            </svg>
          </div>

          {tooltipData && (
            <div
              style={{
                position: "absolute",
                left: `${tooltipPosition.x + 10}px`,
                top: `${tooltipPosition.y + 10}px`,
                pointerEvents: "none",
                zIndex: 100,
              }}
            >
              <EnhancedTooltip
                active={tooltipData.active}
                payload={tooltipData.payload}
                label={tooltipData.label}
                valueFormatter={(value) => {
                  let identifier;
                  const title = chartTitle;
                  identifier = title.split(" by")[0];

                  return `${
                    value === "N/A"
                      ? "N/A"
                      : Math.round(value * 10) / 10 +
                        (identifier === "LOS"
                          ? " days"
                          : identifier === "Admissions"
                          ? " admissions"
                          : identifier === "ADP"
                          ? " avg. daily pop."
                          : " " + identifier.toLowerCase())
                  }`;
                }}
                showPercentage={false}
                totalValue={records.reduce((sum, item) => sum + item.value, 0)}
                categoryPercent={tooltipData.payload[0]?.percentage}
              />
            </div>
          )}
        </>
      ) : (
        <div style={{ display: "flex" }}>
          <div style={{ display: "flex", flexDirection: "column" }}>
            No records match the chosen filters
          </div>
        </div>
      )}
    </>
  );
};

export default PieChart;
