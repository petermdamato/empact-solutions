import React, { useEffect, useState } from "react";
import Tile from "./../Tile/Tile";
import DistributionChartV2 from "../DistributionChart/DistributionChartV2";
import DistributionChartStacked from "../DistributionChart/DistributionChartStacked";
import OverridePercentStat from "../StatisticWithLine/StatisticWithLine";

import "./TileContainer.css";

const TileContainerV2 = ({ data }) => {
  const [chartData, setChartData] = useState([]);

  useEffect(() => {
    setChartData(data);
  }, [data]);

  return (
    <div className="tile-container-two">
      {chartData.map((outer, i) => (
        <Tile key={"tile-" + i}>
          {outer.data.map((inner, i) =>
            outer.charts[i] === "distributionV2" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    height: "60px",
                    marginTop: "-40px",
                  }}
                >
                  <OverridePercentStat data={chartData} />
                </div>
                <DistributionChartV2
                  key={"distribution-stacked-chart-" + i}
                  data={chartData}
                  width={400}
                  height={300}
                  margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
                  chartTitle={outer.chartTitles[i]}
                />
              </div>
            ) : outer.charts[i] === "distributionStacked" ? (
              <DistributionChartStacked
                key={"distribution-stacked-chart-" + i}
                data={chartData}
                width={400}
                height={300}
                margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
                caption={outer.chartTitles[i]}
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

export default TileContainerV2;
