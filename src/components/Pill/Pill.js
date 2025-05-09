import React from "react";
import { MenuItem, Select, FormControl, InputLabel } from "@mui/material";
import "./Pill.css";

const Pill = ({
  title,
  subtitle,
  children,
  useDropdown,
  dropdownOptions,
  selectedValue,
  onSelectChange,
}) => {
  return (
    <div className="container-pill">
      <div className="pill-header">
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
          <h3 className="pill-title">{title}</h3>
        )}
      </div>
      {subtitle && <p className="pill-subtitle">{subtitle}</p>}
      <div className="pill-content">{children}</div>
    </div>
  );
};

export default Pill;
