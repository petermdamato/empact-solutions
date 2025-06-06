"use client";
import * as Constants from "./../../constants";

// Simple hash-color generator based on index
const getColor = (paletteType) => {
  const staticPalette = Object.keys(Constants.prePostColors).map(
    (entry) => Constants.prePostColors[entry]
  );
  const successPalette = Object.keys(Constants.successColors).map(
    (entry) => Constants.successColors[entry]
  );

  return paletteType === "static"
    ? staticPalette
    : paletteType === "success"
    ? successPalette
    : staticPalette;
};

// Simple hash-color generator based on index
const getText = (type) => {
  const successArray = ["Successful", "Unsuccessful"];
  const staticArray = ["Pre-dispo", "Post-dispo"];
  return type === "static"
    ? staticArray
    : type === "success"
    ? successArray
    : staticArray;
};

const LegendStatic = ({ type = "static" }) => {
  const textArray = getText(type);
  const colorArray = getColor(type);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: type === "success" ? "row" : "column",
        gap: "8px",
      }}
    >
      {textArray.map((option, i) => {
        return (
          <div
            key={i}
            style={{
              display: "flex",
            }}
          >
            <span
              style={{
                display: "inline-block",
                width: "16px",
                height: "16px",
                marginRight: "4px",
                backgroundColor: colorArray[i],
              }}
            />
            <span>{option}</span>
          </div>
        );
      })}
    </div>
  );
};

export default LegendStatic;
