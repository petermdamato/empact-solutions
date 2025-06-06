import React from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import "./Header.css";
import Selector from "../Selector/Selector"; // Adjust path as needed
import LegendStatic from "../LegendStatic/LegendStatic";

const Header = ({
  year,
  title = "Secure Detention Utilization",
  subtitle = "Test",
  dekWithYear,
  caption = "",
  useDropdown = false,
  useLegendStatic = false,
  selectedYear,
  onSelectChange,
  dropdownOptions,
  children,
  showFilterInstructions = false,
}) => {
  return (
    <header
      className="header-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        width: "100%",
        flexWrap: "wrap", // optional for better responsiveness
      }}
    >
      {/* Left side: Title and info */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          minWidth: 0, // prevent overflow
        }}
      >
        <h1 style={{ margin: 0 }}>
          {title}
          {subtitle === "" ? "" : ":"}
          <span style={{ fontWeight: "bold", marginLeft: "6px" }}>
            {subtitle}
          </span>
        </h1>
        <div style={{ display: "flex" }}>
          {year ? (
            <h3 style={{ margin: 0 }}>{year}</h3>
          ) : (
            <h4 style={{ margin: 0 }}>{dekWithYear}</h4>
          )}
          {showFilterInstructions && (
            <p>
              <span style={{ fontWeight: "bold", marginLeft: "6px" }}>
                Click charts to filter.
              </span>
              {" Press [Esc] key to escape filter."}
            </p>
          )}
        </div>
        {caption && <span>{caption}</span>}
      </div>
      {/* Middle: Dropdown */}
      {useDropdown && (
        <div
          style={{
            margin: "0 0 0 24px", // space on left and right
            flexShrink: 0, // prevent shrinking
          }}
        >
          <Selector
            values={dropdownOptions}
            variable={
              title === "Secure Detention Utilization"
                ? "Admission Year"
                : "Intake Year"
            }
            selectedValue={selectedYear}
            setValue={onSelectChange}
          />
        </div>
      )}
      {useLegendStatic && (
        <div
          style={{
            margin: "0 24px", // space on left and right
            flexShrink: 0, // prevent shrinking
          }}
        >
          <LegendStatic type="static" />
        </div>
      )}
      {/* Right side: Children */}
      <div
        className="header-children"
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0, // optional
        }}
      >
        {children}
      </div>
    </header>
  );
};

export default Header;
