import React from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import "./Pill.css";

const contexts = [
  "LOS distribution trends (days)",
  "Number of exits within LOS bucket",
  "Number of releases within LOS bucket",
];

const Pill = ({
  title,
  subtitle,
  context,
  children,
  useDropdown,
  dropdownOptions,
  selectedValue,
  onSelectChange,
  headerColor = "#e6e6e6",
}) => {
  return (
    <div className="container-pill">
      <div
        style={{ backgroundColor: headerColor }}
        className={
          contexts.includes(title) ? "pill-header-transparent" : "pill-header"
        }
      >
        {useDropdown ? (
          <FormControl fullWidth>
            <InputLabel>Type</InputLabel>
            <Select
              labelId="Select"
              id="selector"
              value={selectedValue}
              label="Type"
              onChange={onSelectChange}
            >
              {dropdownOptions.map((entry) => (
                <MenuItem key={entry} value={entry}>
                  {entry}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        ) : (
          <h3
            style={{ color: headerColor !== "#e6e6e6" ? "white" : "black" }}
            className="pill-title"
          >
            {title}
          </h3>
        )}
      </div>
      {subtitle && (
        <p
          className={
            contexts.includes(title)
              ? "pill-subtitle pill-subtitle-transparent"
              : "pill-subtitle"
          }
        >
          {subtitle}
        </p>
      )}
      <div className="pill-content">{children}</div>
    </div>
  );
};

export default Pill;
