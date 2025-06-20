import React, { useRef, useEffect, useState } from "react";
import * as d3 from "d3";
import EnhancedTooltip from "@/components/EnhancedTooltip/EnhancedTooltip";
import "./PieChart.css";

const PieChart = ({
  records = [],
  size = 300,
  chartTitle = "Pie Chart",
  groupByKey,
  setFilterVariable,
  filterVariable,
}) => {
  const radius = size / 2;
  const color = ["#5b6069", "#d3d3d3"];
  const svgRef = useRef();
  const pathRefs = useRef([]);
  const [tooltipData, setTooltipData] = useState(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const pieData = d3.pie().value((d) => d.value)(records || []);
  const arcGen = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

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
  }, [records]);

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
    const selectedValue = data.data.category;
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
    <div className="p-4 bg-white rounded-2xl shadow-md inline-block relative">
      <div className="text-center font-semibold mb-2">{chartTitle}</div>
      <div className="centered-chart">
        <svg ref={svgRef} width={size} height={size}>
          <g transform={`translate(${radius},${radius})`}>
            {pieData.map((d, i) => (
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
                <text
                  data-label-index={i}
                  transform={`translate(${arcGen.centroid(d)[0] + 4},${
                    arcGen.centroid(d)[1]
                  })`}
                  textAnchor="start"
                  alignmentBaseline="middle"
                  fontSize={14}
                  fill="#fff"
                  fontWeight="bold"
                >
                  {d.data.category}
                </text>
                <text
                  data-label-index={i}
                  transform={`translate(${arcGen.centroid(d)[0] + 4},${
                    arcGen.centroid(d)[1] + 16
                  })`}
                  textAnchor="start"
                  alignmentBaseline="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill="#fff"
                >
                  {d.data.value}
                </text>
                <text
                  data-label-index={i}
                  transform={`translate(${arcGen.centroid(d)[0] + 4},${
                    arcGen.centroid(d)[1] + 32
                  })`}
                  textAnchor="start"
                  alignmentBaseline="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill="#fff"
                >
                  {Math.round(d.data.percentage * 1000) / 10}%
                </text>
              </g>
            ))}
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
                      : identifier)
              }`;
            }}
            showPercentage={true}
            totalValue={records.reduce((sum, item) => sum + item.value, 0)}
          />
        </div>
      )}
    </div>
  );
};

export default PieChart;
