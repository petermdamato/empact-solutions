"use client";
import * as Constants from "./../../constants";

// Simple hash-color generator based on index
const getColor = (paletteType) => {
  const staticPalette = Object.keys(Constants.prePostColors).map(
    (entry) => Constants.prePostColors[entry]
  );
  return paletteType === "static" ? staticPalette : staticPalette;
};

// Simple hash-color generator based on index
const getText = (type) => {
  const staticArray = ["Pre-dispo", "Post-dispo"];
  return type === "static" ? staticArray : staticArray;
};

const LegendStatic = ({ type = "static" }) => {
  const textArray = getText(type);
  const colorArray = getColor(type);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
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
