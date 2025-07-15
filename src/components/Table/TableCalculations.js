import React, { useEffect } from "react";
import "./Table.css";
import offenseMapFunction from "@/utils/offenseMapFunction";

// Format numbers with fallback for NaN
const formatNumber = (value) =>
  isNaN(value) ? "—" : Math.round(value * 10) / 10;

const TableCalculations = ({ data }) => {
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
                    <th
                      style={{
                        maxWidth: "64px",
                        width: "64px",
                        textAlign: "right",
                      }}
                    >
                      Avg.
                    </th>
                    <th
                      style={{
                        maxWidth: "64px",
                        paddingLeft: "6px",
                        width: "64px",
                        textAlign: "left",
                      }}
                    >
                      Median
                    </th>
                  </tr>
                </thead>
              )}
              <thead>
                <tr key={index + "_" + section.category.replaceAll(" ", "-")}>
                  <th>{section.category}</th>
                  <th
                    style={{
                      maxWidth: "64px",
                      width: "64px",
                      textAlign: "right",
                    }}
                  >
                    {section.header["All"] && section.header["All"].average
                      ? section.header["All"].average
                      : ""}
                    {section.category.includes("Technicals")
                      ? section.header["Technicals"]
                        ? section.header["Technicals"].average
                        : ""
                      : section.category.includes("New offenses")
                      ? section.header["New Offenses"]
                        ? section.header["New Offenses"].average
                        : ""
                      : section.header["Other"]
                      ? section.body["All Post-Dispo"].average
                      : ""}
                  </th>
                  <th
                    style={{
                      maxWidth: "64px",
                      width: "64px",
                      textAlign: "right",
                    }}
                  >
                    {section.header["All"] && section.header["All"].median
                      ? section.header["All"].median
                      : ""}
                    {section.category.includes("Technicals")
                      ? section.header["Technicals"]
                        ? section.header["Technicals"].median
                        : ""
                      : section.category.includes("New offenses")
                      ? section.header["New Offenses"]
                        ? section.header["New Offenses"].median
                        : ""
                      : section.header["Other"]
                      ? section.body["All Post-Dispo"].median
                      : ""}
                  </th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(section.body)
                  .filter((entry) => {
                    if (
                      section.category.includes("Post-dispo") &&
                      entry === "All Post-Dispo"
                    ) {
                      return false;
                    }

                    const passesCategoryFilter =
                      section.category.includes("Gender") ||
                      section.category.includes("Post-disp") ||
                      (section.category.includes("Age") &&
                        entry !== "null" &&
                        entry !== "Unknown") ||
                      section.category.includes("Race") ||
                      offenseMapFunction(entry, "table") === section.category;

                    if (!passesCategoryFilter) return false;

                    const value = section.body[entry];

                    // Filter out if average and median are both zero or falsy
                    return (
                      (value.average && value.average !== 0) ||
                      (value.median && value.median !== 0)
                    );
                  })
                  .map((category, catIndex) => {
                    const value = section.body[category];

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
                          {formatNumber(value.average)}
                        </td>
                        <td
                          style={{
                            maxWidth: "64px",
                            width: "64px",
                            textAlign: "right",
                          }}
                        >
                          {formatNumber(value.median)}
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

export default TableCalculations;
