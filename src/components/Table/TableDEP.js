import React from "react";
import "./Table.css";

const TableComponent = ({ data }) => {
  return (
    <div>
      {data.data.map((section, index) => (
        <div key={index} style={{ marginBottom: "2rem" }}>
          <h2 className="section-title">{section.title}</h2>
          <table>
            <tbody>
              {section.categories.map((category, catIndex) => {
                const total = section.categories.reduce(
                  (sum, item) => sum + item.value,
                  0
                );
                return (
                  <tr key={catIndex}>
                    <td>{category.label}</td>
                    <td style={{ textAlign: "right" }}>{category.value}</td>
                    <td style={{ textAlign: "right" }}>
                      {total > 0
                        ? ((category.value / total) * 100).toFixed(2) + "%"
                        : "-"}
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
