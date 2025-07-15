import React, { useEffect } from "react";
import "./Table.css";
import offenseMapFunction from "@/utils/offenseMapFunction";

// Format numbers and percentages with fallback for NaN
const formatNumber = (value) =>
  isNaN(value) ? "—" : Math.round(value * 10) / 10;
const formatPercent = (value) => (isNaN(value) ? "—" : `${Math.round(value)}%`);

const TableComponent = ({ data }) => {
  useEffect(() => {
    if (!data) return;
  }, [data]);

  return (
    <div>
      {data.map((section, index) => {
        return (
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
                          (section.body["All Post-Dispo"] /
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
                      ? formatNumber(section.body["All Post-Dispo"])
                      : formatNumber(section.header.All)}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(section.body)
                  .filter((entry) => {
                    // Exclude 'All Post-Dispo' from post-dispo category
                    if (
                      section.category.includes("Post-dispo") &&
                      entry === "All Post-Dispo"
                    ) {
                      return false;
                    }
                    // Include other filtering logic you already have
                    const passesCategoryFilter =
                      section.category.includes("Gender") ||
                      section.category.includes("Post-disp") ||
                      (section.category.includes("Age") &&
                        entry !== "null" &&
                        entry !== "Unknown") ||
                      section.category.includes("Race") ||
                      offenseMapFunction(entry, "table") === section.category;

                    if (!passesCategoryFilter) return false;

                    // Calculate count to filter out zero rows
                    const total =
                      section.category.includes("New offenses") ||
                      section.category.includes("Technicals") ||
                      section.category.includes("Post-dispo")
                        ? section.header["New Offenses"] +
                          section.header["Technicals"] +
                          section.header["Other"]
                        : section.header.All;

                    const count = section.category.includes("Post-dispo")
                      ? section.body[entry] * total
                      : section.body[entry];

                    // Exclude rows where count is zero or falsy
                    return count > 0;
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
                        <td
                          style={{
                            maxWidth: "64px",
                            width: "64px",
                            textAlign: "right",
                          }}
                        >
                          {formatPercent((value / total) * 100)}
                        </td>
                        <td
                          style={{
                            maxWidth: "64px",
                            width: "64px",
                            textAlign: "right",
                          }}
                        >
                          {formatNumber(value)}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        );
      })}
    </div>
  );
};

export default TableComponent;
