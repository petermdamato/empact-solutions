"use client";

import React from "react";
import LineChartV2 from "./LineChartV2";
import "./LineChartContainer.css";
import { useResizeDetector } from "react-resize-detector";

const LineChartContainerV2 = ({
  charts,
  data,
  selectedLabelsChoice,
  comparison,
  selectedValue = [null, null],
  selectorPlacement = "right",
  selectedLegendOptions,
  selectedLegendDetails,
  selectorChild,
  children,
  detentionType,
}) => {
  const { width, height, ref } = useResizeDetector();

  return (
    <div
      className="line-chart-grid"
      ref={ref}
      style={{ width: "100%", height: "100%" }}
    >
      {charts.map((chart, index) => (
        <div className="line-chart-item" key={index}>
          <div className="line-chart-header" style={{ paddingLeft: "12px" }}>
            {selectorChild &&
              selectorChild[index] === "on" &&
              selectorPlacement === "left" &&
              children}

            <h3 className="line-chart-title">
              {chart.includes("averageDailyPop")
                ? "ADP"
                : chart.includes("LengthOfStay")
                ? `${
                    selectedValue[index].charAt(0).toUpperCase() +
                    selectedValue[index].slice(1)
                  } LOS (days)`
                : chart.charAt(0).toUpperCase() + chart.slice(1)}
            </h3>
            {selectorChild &&
              selectorChild[index] === "on" &&
              selectorPlacement === "right" &&
              children}
          </div>
          <LineChartV2
            data={data}
            header={chart}
            comparison={comparison}
            metric={chart}
            labels={selectedLabelsChoice}
            selectedValue={selectedValue[index]}
            width={width}
            height={height}
            selectedLegendOptions={selectedLegendOptions}
            selectedLegendDetails={selectedLegendDetails}
            detentionType={detentionType}
          />
        </div>
      ))}
    </div>
  );
};

export default LineChartContainerV2;
