import React, { useEffect, useState } from "react";
import Pill from "./../Pill/Pill";

import ChangeStatistics from "../ChangeStatistics/ChangeStatistics";
import StackedBarChart from "../StackedBar/StackedBar";
import StackedBarChartMedian from "../StackedBar/StackedBarMedian";
import StackedBarChartMulti from "../StackedBar/StackedBarMulti";
import StackedColumnChart from "../StackedColumn/StackedColumn";
import ColumnChart from "../ColumnChart/ColumnChart";
import ColumnChartMulti from "../ColumnChart/ColumnChartMulti";
import PieChart from "../PieChart/PieChart";
import DistributionChart from "../DistributionChart/DistributionChart";
import TableComponent from "../Table/Table";
import TableCalculations from "../Table/TableCalculations";
import "./PillContainer.css";

const PillContainer = ({ data, display }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    if (!data) return;

    setChartData(data);
  }, [data]);

  return (
    <div
      className="pill-container"
      style={{ width: display === "double" ? "50%" : "100%" }}
    >
      {chartData.map((outer, i) => (
        <Pill
          key={"pill-" + i}
          title={outer.title}
          subtitle={outer.subtitle ? outer.subtitle : ""}
          useDropdown={outer.useDropdown}
          dropdownOptions={outer.dropdownOptions ? outer.dropdownOptions : []}
          selectedValue={outer.dropdownValue}
          onSelectChange={outer.onSelectChange}
          style={{ width: display === "double" ? "100%" : "100%" }}
        >
          {outer.data.map((inner, i) => {
            return outer.charts[i] === "stacked-bar" &&
              outer.dropdownValue !== "Median LOS" ? (
              <StackedBarChart
                key={"stacked-bar-chart-" + i}
                data={inner}
                width={400}
                height={300}
                margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
                context={outer.contexts ? outer.contexts[i] : "percentages"}
                chartTitle={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "stacked-bar" &&
              outer.dropdownValue === "Median LOS" ? (
              <StackedBarChartMedian
                key={"stacked-bar-chart-" + i}
                data={inner}
                width={400}
                height={300}
                margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
                context={outer.contexts ? outer.contexts[i] : "percentages"}
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
              <ColumnChart
                key={"column-chart-" + i}
                data={inner}
                width={400}
                height={340}
                margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
                chartTitle={outer.chartTitles[i]}
                context={outer.contexts ? outer.contexts[i] : "percentages"}
                calculation={outer.dropdownValue}
              />
            ) : outer.title === "LOS" && outer.charts[i] === "table" ? (
              <TableCalculations
                key={"table-chart-" + i}
                data={inner}
                width={400}
                height={340}
                margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
                chartTitle={outer.chartTitles[i]}
              />
            ) : outer.charts[i] === "table" ? (
              <TableComponent
                key={"table-chart-" + i}
                data={inner}
                width={400}
                height={340}
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
                detentionType={outer.detentionType[i]}
                selectedYear={outer.selectedYear[i]}
                exploreType={outer.exploreType ? outer.exploreType[i] : null}
              />
            ) : outer.charts[i] === "stacked-column" ? (
              <StackedColumnChart
                key={"stacked-column-chart-" + i}
                data={inner.data}
                width={400}
                height={340}
                margin={{ top: 60, right: 0, bottom: 30, left: 0 }}
                chartTitle={outer.chartTitles[i]}
                detentionType={outer.detentionType[i]}
                selectedYear={outer.selectedYear[i]}
                exploreType={outer.exploreType ? outer.exploreType[i] : null}
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
            ) : (
              <></>
            );
          })}
        </Pill>
      ))}
    </div>
  );
};

export default PillContainer;
