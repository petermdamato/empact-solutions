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
          <FormControl
            fullWidth
            sx={{
              "& label": {
                color: "#5a6b7c",
                fontSize: "18px",
                fontWeight: 600,
              },
              "& label.Mui-focused": {
                color: "#5a6b7c",
              },
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: "#ccc", // default border
                },
                "&:hover fieldset": {
                  borderColor: "#5a6b7c",
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#5a6b7c",
                },
              },
            }}
          >
            <InputLabel>Type</InputLabel>
            <Select
              labelId="Select"
              id="selector"
              value={selectedValue}
              label="Type"
              onChange={onSelectChange}
              sx={{
                fontSize: "18px",
                fontWeight: 600,
                textAlign: "center",
                "& .MuiSelect-select": {
                  textAlign: "center",
                },
              }}
              MenuProps={{
                PaperProps: {
                  sx: {
                    fontSize: "18px",
                    fontWeight: 600,
                  },
                },
              }}
            >
              {dropdownOptions.map((entry) => (
                <MenuItem
                  key={entry}
                  value={entry}
                  sx={{ justifyContent: "center" }}
                >
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
