import React from "react";
import LineChartV2 from "./LineChartV2"; // Make sure the path is right
import "./LineChartContainer.css"; // optional CSS file

const LineChartContainerV2 = ({
  charts,
  data,
  selectedLabelsChoice,
  comparison,
  selectorChild,
  children,
}) => {
  console.log(data);
  return (
    <div className="line-chart-grid">
      {charts.map((chart, index) => (
        <div className="line-chart-item" key={index}>
          <div className="line-chart-header">
            <h3 className="line-chart-title">
              {chart.includes("LengthOfStay") ? "LOS" : chart}
            </h3>
            {selectorChild && selectorChild[index] === "on" && children}
          </div>
          <LineChartV2
            data={data}
            header={chart}
            comparison={comparison}
            metric={chart}
            labels={selectedLabelsChoice}
          />
        </div>
      ))}
    </div>
  );
};

export default LineChartContainerV2;
