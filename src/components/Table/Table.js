import React, { useEffect } from "react";
import "./Table.css";
import offenseMapFunction from "@/utils/offenseMapFunction";

// Format numbers and percentages with fallback for NaN
const formatNumber = (value) => (isNaN(value) ? "—" : Math.round(value));
const formatPercent = (value) => (isNaN(value) ? "—" : `${Math.round(value)}%`);

const TableComponent = ({ data }) => {
  useEffect(() => {
    if (!data) return;
  }, [data]);

  return (
    <div>
      {data.map((section, index) => (
        <div key={index} style={{ marginBottom: "0.5rem" }}>
          <table>
            {index === 0 && (
              <thead>
                <tr key={index + "_" + section.category.replaceAll(" ", "-")}>
                  <th></th>
                  <th style={{ textAlign: "right" }}>%</th>
                  <th style={{ textAlign: "right" }}>#</th>
                </tr>
              </thead>
            )}
            <thead>
              <tr key={index + "_" + section.category.replaceAll(" ", "-")}>
                <th>{section.category}</th>
                <th style={{ textAlign: "right" }}>
                  {section.category.includes("Post-dispo")
                    ? formatPercent(
                        (section.header["Other"] /
                          (section.header["New Offenses"] +
                            section.header["Technicals"] +
                            section.header["Other"])) *
                          100
                      )
                    : section.category.includes("New offenses")
                    ? formatPercent(
                        (section.header["New Offenses"] /
                          (section.header["New Offenses"] +
                            section.header["Technicals"] +
                            section.header["Other"])) *
                          100
                      )
                    : section.category.includes("Technicals")
                    ? formatPercent(
                        (section.header["Technicals"] /
                          (section.header["New Offenses"] +
                            section.header["Technicals"] +
                            section.header["Other"])) *
                          100
                      )
                    : "100%"}
                </th>
                <th style={{ textAlign: "right" }}>
                  {section.category.includes("New offenses")
                    ? formatNumber(section.header["New Offenses"])
                    : section.category.includes("Technicals")
                    ? formatNumber(section.header["Technicals"])
                    : section.category.includes("Post-dispo")
                    ? formatNumber(section.header["Other"])
                    : formatNumber(section.header.All)}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(section.body)
                .filter((entry) => {
                  return (
                    section.category.includes("Gender") ||
                    (section.category.includes("Post-disp") &&
                      !offenseMapFunction(entry, "table")) ||
                    (section.category.includes("Age") &&
                      entry !== "null" &&
                      entry !== "Unknown") ||
                    section.category.includes("Race") ||
                    offenseMapFunction(entry, "table") === section.category
                  );
                })
                .map((category, catIndex) => {
                  const value = section.body[category];
                  const total =
                    section.category.includes("New offenses") ||
                    section.category.includes("Technicals") ||
                    section.category.includes("Post-dispo")
                      ? section.header["New Offenses"] +
                        section.header["Technicals"] +
                        section.header["Other"]
                      : section.header.All;

                  return (
                    <tr key={catIndex}>
                      <td>{category}</td>
                      <td style={{ textAlign: "right" }}>
                        {formatPercent((value / total) * 100)}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {formatNumber(value)}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
};

export default TableComponent;
