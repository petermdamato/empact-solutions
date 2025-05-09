import React from "react";
import LineChart from "./LineChart"; // Make sure the path is right
import "./LineChartContainer.css"; // optional CSS file

const LineChartContainer = ({ charts, data, comparison }) => {
  return (
    <div className="line-chart-grid">
      {charts.map((chart, index) => (
        <div className="line-chart-item" key={index}>
          <div className="line-chart-header">
            <h3 className="line-chart-title">{chart.title}</h3>
          </div>
          <LineChart
            data={data}
            type={chart.type}
            header={chart.header}
            comparison={comparison}
          />
        </div>
      ))}
    </div>
  );
};

export default LineChartContainer;
