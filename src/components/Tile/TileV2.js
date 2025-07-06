import React from "react";
import "./Tile.css";

const Tile = ({ title, subtitle, children }) => {
  return (
    <div className="container-tile">
      {title && <h3 className="tile-title">{title}</h3>}
      {subtitle && <p className="tile-subtitle">{subtitle}</p>}
      <div className="tile-content">{children}</div>
    </div>
  );
};

export default Tile;
