import React, { useEffect, useState } from "react";
import Tile from "./../Tile/Tile";

import ChangeStatistics from "../ChangeStatistics/ChangeStatistics";
import StackedBarChart from "../StackedBar/StackedBar";
import StackedBarChartMulti from "../StackedBar/StackedBarMulti";
import ColumnChartRow from "../ColumnChart/ColumnChartRow";
import ColumnChartMulti from "../ColumnChart/ColumnChartMulti";
import PieChart from "../PieChart/PieChart";
import Heatmap from "../Heatmap/Heatmap";
import DistributionChart from "../DistributionChart/DistributionChart";
import TableComponent from "../Table/Table";
import "./TileContainer.css";

const TileContainer = ({ data, datesRange }) => {
  const [chartData, setChartData] = useState([]);
  const [dropdownValue, setDropdownValue] = useState("Average LOS");

  useEffect(() => {
    setChartData(data);
  }, [data]);

  return (
    <div className="tile-container">
      {chartData.map((outer, i) => (
        <Tile
          key={"tile-" + i}
          title={outer.title}
          subtitle={outer.subtitle ? outer.subtitle : ""}
        >
          {outer.data.map((inner, i) =>
            outer.charts[i] === "stacked-bar" ? (
              <StackedBarChart
                key={"stacked-bar-chart-" + i}
                data={inner}
                width={400}
                height={300}
                margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
                chartTitle={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "change" ? (
              <ChangeStatistics
                key={"change-chart-" + i}
                data={inner}
                width={400}
                height={300}
                margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
                caption={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "column" ? (
              <ColumnChartRow
                key={"column-chart-" + i}
                data={inner}
                width={400}
                height={340}
                margin={{ top: 60, right: 0, bottom: 40, left: 0 }}
                chartTitle={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "table" ? (
              <TableComponent
                key={"table-chart-" + i}
                data={inner}
                width={500}
                height={460}
                margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
                chartTitle={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "distribution" ? (
              <DistributionChart
                key={"distribution-chart-" + i}
                data={inner.data}
                width={400}
                height={340}
                margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
                chartTitle={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "pie" ? (
              <PieChart
                key={"pie-chart-" + i}
                data={inner.data}
                width={400}
                height={340}
                margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
                chartTitle={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "heatmap" ? (
              <Heatmap
                key={"heatmap-chart-" + i}
                data={inner.data}
                width={400}
                height={340}
                margin={{ top: 0, right: 0, bottom: 0, left: 0 }}
                chartTitle={outer.chartTitles[i]}
                xKey={outer.keysArray[i][0]}
                yKey={outer.keysArray[i][1]}
                datesRange={datesRange}
              />
            ) : (
              <></>
            )
          )}
        </Tile>
      ))}
    </div>
  );
};

export default TileContainer;
