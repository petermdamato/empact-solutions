import React from "react";
import { MenuItem, Select, FormControl, InputLabel, Chip } from "@mui/material";
import "./Tile.css";

const Tile = ({ title, subtitle, children }) => {
  return (
    <div className="container-tile" key={`container-${title}`}>
      {subtitle && <p className="tile-subtitle">{subtitle}</p>}
      <div style={{ display: "flex" }} className="tile-content">
        {children}
      </div>
    </div>
  );
};

export default Tile;
