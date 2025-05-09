import React, { useEffect } from "react";
import "./Table.css";

// Map for offense categories
const offenseMap = {
  "Felony Person": "New offenses (pre-dispo)",
  "Felony Property": "New offenses (pre-dispo)",
  "Felony Weapons": "New offenses (pre-dispo)",
  "Felony Drugs": "New offenses (pre-dispo)",
  "Other Felony": "New offenses (pre-dispo)",
  "Misdemeanor Person": "New offenses (pre-dispo)",
  "Misdemeanor Property": "New offenses (pre-dispo)",
  "Misdemeanor Weapons": "New offenses (pre-dispo)",
  "Other Misdemeanor": "New offenses (pre-dispo)",
  "Status Offense": "New offenses (pre-dispo)",
  "ATD Program Failure": "Technicals (pre-dispo)",
  "Court Order": "Technicals (pre-dispo)",
  "Probation Violation": "Technicals (pre-dispo)",
  Warrant: "Technicals (pre-dispo)",
  "Other Technical Violation": "Technicals (pre-dispo)",
};

const TableComponent = ({ data }) => {
  useEffect(() => {
    if (!data) return;
  }, [data]);

  return (
    <div>
      {data.map((section, index) => (
        <div key={index} style={{ marginBottom: "2rem" }}>
          {/* <h2 className="section-title">{section.category}</h2> */}
          <table>
            <thead>
              <tr key={index + "_" + section.category.replaceAll(" ", "-")}>
                <th>{section.category}</th>
                <th style={{ textAlign: "right" }}>
                  {section.category.includes("Post-dispo")
                    ? Math.round(
                        (section.header["Other"] /
                          (section.header["New Offenses"] +
                            section.header["Technicals"] +
                            section.header["Other"])) *
                          100
                      ) + "%"
                    : section.category.includes("New offenses")
                    ? Math.round(
                        (section.header["New Offenses"] /
                          (section.header["New Offenses"] +
                            section.header["Technicals"] +
                            section.header["Other"])) *
                          100
                      ) + "%"
                    : section.category.includes("Technicals")
                    ? Math.round(
                        (section.header["Technicals"] /
                          (section.header["New Offenses"] +
                            section.header["Technicals"] +
                            section.header["Other"])) *
                          100
                      ) + "%"
                    : "100%"}
                </th>
                <th style={{ textAlign: "right" }}>
                  {section.category.includes("New offenses")
                    ? Math.round(section.header["New Offenses"])
                    : section.category.includes("Technicals")
                    ? Math.round(section.header["Technicals"])
                    : section.category.includes("Post-dispo")
                    ? Math.round(section.header["Other"])
                    : Math.round(section.header.All)}
                </th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(section.body)
                .filter(
                  (entry) =>
                    section.category.includes("Gender") ||
                    (section.category.includes("Post-disp") &&
                      !offenseMap[entry]) ||
                    (section.category.includes("Age") &&
                      entry !== "null" &&
                      entry !== "Unknown") ||
                    section.category.includes("Race") ||
                    offenseMap[entry] === section.category
                )
                .map((category, catIndex) => {
                  return (
                    <tr key={catIndex}>
                      <td>{category}</td>
                      <td style={{ textAlign: "right" }}>
                        {section.category.includes("Post-dispo") ||
                        section.category.includes("New offenses") ||
                        section.category.includes("Technicals")
                          ? Math.round(
                              (section.body[category] /
                                (section.header["New Offenses"] +
                                  section.header["Technicals"] +
                                  section.header["Other"])) *
                                100
                            ) + "%"
                          : Math.round(
                              (section.body[category] / section.header.All) *
                                100
                            ) + "%"}
                      </td>
                      <td style={{ textAlign: "right" }}>
                        {Math.round(section.body[category])}
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
