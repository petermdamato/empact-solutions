import React, { useMemo } from "react";
import "./Heatmap.css";

const Heatmap = ({ data, xKey, yKey, datesRange, chartTitle }) => {
  const { xLabels, yLabels, counts, maxCount } = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        xLabels: [],
        yLabels: [],
        counts: {},
        maxCount: 0,
      };
    }

    const dates = datesRange.map((date) => new Date(date));
    const finalData = data.filter((entry) => {
      return (
        entry[xKey] &&
        entry[yKey] &&
        new Date(entry.Admission_Date) <= dates[1] &&
        new Date(entry.Admission_Date) >= dates[0]
      );
    });

    const xSet = new Set();
    const ySet = new Set();
    const countMap = {};

    finalData.forEach((item) => {
      const x = item[xKey];
      const y = item[yKey];
      xSet.add(x);
      ySet.add(y);
      const key = `${x}|${y}`;
      countMap[key] = (countMap[key] || 0) + 1;
    });

    const xLabels = Array.from(xSet);
    const yLabels = Array.from(ySet);

    let max = 0;
    Object.values(countMap).forEach((val) => {
      if (val > max) max = val;
    });

    return {
      xLabels,
      yLabels,
      counts: countMap,
      maxCount: max,
    };
  }, [data, xKey, yKey, datesRange]);

  if (
    !data ||
    data.length === 0 ||
    xLabels.length === 0 ||
    yLabels.length === 0
  )
    return null;

  const getColor = (count) => {
    if (!count) return "rgb(255, 255, 255)";
    const blueIntensity = count / maxCount;
    return `rgba(38, 67, 97, ${blueIntensity})`;
  };

  return (
    <div>
      <div style={{ width: "100%", textAlign: "center" }}>{chartTitle}</div>
      <div
        className="heatmap-grid"
        style={{
          display: "grid",
          gridTemplateColumns: `auto repeat(${xLabels.length}, 1fr)`,
        }}
      >
        <div className="heatmap-corner" />

        {xLabels.map((x) => (
          <div key={x} className="heatmap-label x-label">
            {x}
          </div>
        ))}

        {yLabels.map((y) => (
          <React.Fragment key={y}>
            <div className="heatmap-label y-label">{y}</div>
            {xLabels.map((x) => {
              const count = counts[`${x}|${y}`] || 0;
              return (
                <div
                  key={`${x}|${y}`}
                  className="heatmap-cell"
                  style={{ backgroundColor: getColor(count) }}
                >
                  <div
                    style={{
                      color: count / maxCount > 0.5 ? "white" : "black",
                    }}
                  >
                    {count > 0 ? count : ""}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Heatmap;
