import React from "react";

const ChartCard = ({ title, width, children }) => {
  return (
    <div
      className="bg-white rounded-2xl shadow p-4"
      width="200px"
      style={{
        marginTop: "20px",
        padding: "12px 4px",
        width: `${width}px`,
        backgroundColor: "white",
      }}
    >
      {title && <h2 className="text-lg font-semibold mb-2">{title}</h2>}
      <div className="w-full h-full">{children}</div>
    </div>
  );
};

export default ChartCard;
