import React from "react";

const ChangeStatistics = ({ data, caption }) => {
  if (!data || data.length !== 2) return null;

  const previous = data[1];
  const current = data[0];
  const percentageChange =
    previous === 0 || previous === null
      ? null
      : ((current - previous) / previous) * 100;
  const isPositive = percentageChange >= 0;

  return (
    <div
      style={{
        flexDirection: "column",
        display: "flex",
        textAlign: "center",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          textAlign: "center",
        }}
      >
        {/* Left Value */}
        <div>
          <div style={{ fontSize: "32px", fontWeight: "bold" }}>
            {isNaN(current) ? "--" : current}
          </div>
          <div style={{ fontSize: "14px", color: "gray" }}>{caption}</div>
        </div>

        {/* Right Value (Percentage Change) */}
        <div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                color: percentageChange < 0 ? "#c35a58" : "#00495f",
                marginTop: isPositive ? "-4px" : "0",
              }}
            >
              {isNaN(percentageChange) ? "" : isPositive ? "▲" : "▼"}
            </span>
            {percentageChange === null || isNaN(percentageChange)
              ? "--"
              : Math.abs(percentageChange).toFixed(0)}
            {percentageChange === null || isNaN(percentageChange) ? "" : "%"}
          </div>
          <div style={{ fontSize: "14px", color: "gray", marginTop: "-4px" }}>
            vs. previous year
          </div>
        </div>
      </div>
      <div
        style={{
          paddingTop: "8px",
          fontVariant: "small-caps",
        }}
      >
        hover to see zip code map
      </div>
    </div>
  );
};

export default ChangeStatistics;
