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
        display: "flex",
        justifyContent: "center",
        gap: "20px",
        textAlign: "center",
      }}
    >
      {/* Left Value */}
      <div>
        <div style={{ fontSize: "32px", fontWeight: "bold" }}>{current}</div>
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
            }}
          >
            {isPositive ? "▲" : "▼"}
          </span>
          {percentageChange === null
            ? "--"
            : Math.abs(percentageChange).toFixed(0)}
          %
        </div>
        <div style={{ fontSize: "14px", color: "gray" }}>vs. previous year</div>
      </div>
    </div>
  );
};

export default ChangeStatistics;
