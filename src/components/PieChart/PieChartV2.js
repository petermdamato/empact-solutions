import React from "react";
import * as d3 from "d3";

const PieChart = ({ records = [], size = 300, chartTitle = "Pie Chart" }) => {
  if (!records || records.length === 0) return null;

  const radius = size / 2;
  const color = ["#5b6069", "#d3d3d3"];

  const pieData = d3.pie().value((d) => d.value)(records);
  const arcGen = d3
    .arc()
    .innerRadius(0)
    .outerRadius(radius - 10);

  return (
    <div className="p-4 bg-white rounded-2xl shadow-md inline-block">
      <div className="text-center font-semibold mb-2">{chartTitle}</div>
      <svg width={size} height={size}>
        <g transform={`translate(${radius},${radius})`}>
          {pieData.map((d, i) => (
            <g key={i}>
              <path
                d={arcGen(d)}
                fill={color[i]}
                stroke="white"
                strokeWidth={1.5}
              />
              <text
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
  );
};

export default PieChart;
