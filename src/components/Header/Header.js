import React from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import "./Header.css";

const Header = ({
  year = "",
  title = "Secure Detention Utilization",
  subtitle = "Test",
  dekWithYear,
  caption = "",
  useDropdown = false,
  selectedYear,
  onSelectChange,
  dropdownOptions,
  children,
}) => {
  return (
    <header
      className="header-header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
      }}
    >
      {/* Left side: Title and info */}
      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
        <h1 style={{ margin: 0 }}>
          {title}
          {subtitle === "" ? "" : ":"}
          <span style={{ fontWeight: "bold", marginLeft: "6px" }}>
            {subtitle}
          </span>
        </h1>
        <h2 style={{ margin: 0 }}>
          <span style={{ fontWeight: 200 }}>{dekWithYear}</span>
        </h2>
        {caption && <span>{caption}</span>}
        {useDropdown && (
          <FormControl fullWidth>
            <InputLabel>Intake Year</InputLabel>
            <Select
              labelId="Select"
              id="selector"
              value={selectedYear}
              onChange={onSelectChange}
              displayEmpty
              variant="standard"
              sx={{
                backgroundColor: "#fff",
                border: "1px solid #ccc",
                borderRadius: "4px",
                padding: "6px 10px",
                fontSize: "16px",
                boxShadow: "none",
                ".MuiOutlinedInput-notchedOutline": { border: "none" },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "none",
                },
                "&.Mui-focused": {
                  boxShadow: "none",
                  borderColor: "#ccc",
                },
                ".MuiSelect-icon": {
                  color: "#000",
                },
              }}
              renderValue={(selected) =>
                selected ? (
                  selected
                ) : (
                  <span style={{ color: "#888" }}>-- Select a year --</span>
                )
              }
            >
              {dropdownOptions.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </div>

      {/* Right side: Children */}
      <div
        className="header-children"
        style={{ display: "flex", alignItems: "center", gap: "12px" }}
      >
        {children}
      </div>
    </header>
  );
};

export default Header;
