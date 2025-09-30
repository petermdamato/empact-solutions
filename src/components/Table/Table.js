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
                    {(() => {
                      const total =
                        (section.header?.["New Offenses"] || 0) +
                        (section.header?.["Technicals"] || 0) +
                        (section.header?.["Other"] || 0);

                      if (section.category.includes("Post-dispo")) {
                        const value = section.body?.["All Post-Dispo"] || 0;
                        return total > 0
                          ? formatPercent((value / total) * 100)
                          : "—";
                      } else if (section.category.includes("New offenses")) {
                        const value = section.header?.["New Offenses"] || 0;
                        return total > 0
                          ? formatPercent((value / total) * 100)
                          : "—";
                      } else if (section.category.includes("Technicals")) {
                        const value = section.header?.["Technicals"] || 0;
                        return total > 0
                          ? formatPercent((value / total) * 100)
                          : "—";
                      } else {
                        return "100%";
                      }
                    })()}
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
                  .sort((a, b) => a.localeCompare(b))
                  .map((category, catIndex) => {
                    const value = section.body[category];

                    // Calculate total based on section type
                    let total;
                    if (
                      section.category.includes("New offenses") ||
                      section.category.includes("Technicals") ||
                      section.category.includes("Post-dispo")
                    ) {
                      total =
                        (section.header?.["New Offenses"] || 0) +
                        (section.header?.["Technicals"] || 0) +
                        (section.header?.["Other"] || 0);
                    } else {
                      total = section.header?.All || 0;
                    }

                    // For Post-dispo sections, value is a percentage that needs to be converted
                    const displayValue = section.category.includes("Post-dispo")
                      ? value * total // Convert percentage back to count
                      : value;

                    const displayPercent = section.category.includes(
                      "Post-dispo"
                    )
                      ? value * 100 // Value is already a decimal percentage
                      : (displayValue / total) * 100;

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
                          {formatPercent(displayPercent)}
                        </td>
                        <td
                          style={{
                            maxWidth: "64px",
                            width: "64px",
                            textAlign: "right",
                          }}
                        >
                          {formatNumber(displayValue)}
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
