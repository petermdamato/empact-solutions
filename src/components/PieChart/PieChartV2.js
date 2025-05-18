import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const PieChart = ({
  records = [],
  size = 300,
  chartTitle = "Pie Chart",
  groupByKey,
  setFilterVariable,
  filterVariable,
}) => {
  if (!records || records.length === 0) return null;

  const radius = size / 2;
  const color = ["#5b6069", "#d3d3d3"];

  const pieData = d3.pie().value((d) => d.value)(records);
  const arcGen = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

  // Refs to hold path elements for transition
  const pathRefs = useRef([]);

  useEffect(() => {
    pathRefs.current.forEach((path, i) => {
      if (path) {
        d3.select(path)
          .transition()
          .duration(500)
          .attrTween("d", function () {
            const previous = this._current || pieData[i];
            const interpolate = d3.interpolate(previous, pieData[i]);
            this._current = interpolate(1); // store for next transition
            return (t) => arcGen(interpolate(t));
          });
      }
    });
  }, [records]);

  useEffect(() => {
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

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md inline-block">
      <div className="text-center font-semibold mb-2">{chartTitle}</div>
      <svg width={size} height={size}>
        <g transform={`translate(${radius},${radius})`}>
          {pieData.map((d, i) => {
            return (
              <g key={i}>
                <path
                  ref={(el) => (pathRefs.current[i] = el)}
                  d={arcGen(d)}
                  fill={color[i]}
                  stroke="white"
                  strokeWidth={1.5}
                  onClick={() => handleClick(d)}
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
            );
          })}
        </g>
      </svg>
    </div>
  );
};

export default PieChart;
