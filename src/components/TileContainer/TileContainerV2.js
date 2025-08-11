import React from "react";
import TileV2 from "./../Tile/TileV2";
import DistributionChartV2 from "../DistributionChart/DistributionChartV2";
import DistributionChartStacked from "../DistributionChart/DistributionChartStacked";
import OverridePercentStat from "../StatisticWithLine/StatisticWithLine";

import "./TileContainer.css";

const TileContainerV2 = ({
  data,
  setSelectedKey,
  setRecordsTableObject,
  selectedKey,
  toggleFilter,
}) => {
  const outer = data[0];

  return (
    <div className="tile-container-two">
      {outer.charts.map((chartType, i) => (
        <TileV2 key={`tile-${i}`}>
          {chartType === "distributionV2" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                width: "100%",
                height: "auto",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  height: "0",
                  marginTop: "0",
                }}
              >
                <OverridePercentStat data={outer.timeSeriesDataPercentage} />
              </div>
              <DistributionChartV2
                data={outer}
                width={400}
                height={300}
                margin={{ top: 20, right: 60, bottom: 30, left: 110 }}
                chartTitle={outer.chartTitles[i]}
                setSelectedKey={setSelectedKey}
                selectedKey={selectedKey}
                setRecordsTableObject={setRecordsTableObject}
                toggleFilter={toggleFilter}
                filterVariable={"Override_Reason"}
              />
            </div>
          ) : chartType === "distributionStacked" ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                position: "relative",
                width: "100%",
                height: "auto",
              }}
            >
              <DistributionChartStacked
                data={outer}
                width={400}
                height={300}
                margin={{ top: 20, right: 20, bottom: 30, left: 20 }}
                caption={outer.chartTitles[i]}
                toggleFilter={toggleFilter}
                filterVariable={"DST v Actual comparison"}
              />
            </div>
          ) : (
            <div key={`empty-${i}`}></div>
          )}
        </TileV2>
      ))}
    </div>
  );
};

export default TileContainerV2;
