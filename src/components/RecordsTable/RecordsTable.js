import React from "react";

const RecordsTable = ({ data }) => {
  if (!data || data.length === 0) return <p>No records available.</p>;

  const getRaceEthnicity = (record) => {
    return record.Ethnicity === "Hispanic"
      ? "Hispanic"
      : record.Race || "Unknown";
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full border-collapse border border-gray-300 text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="border px-4 py-2 text-left">Youth ID</th>
            <th className="border px-4 py-2 text-left">ATD Entry Date</th>
            <th className="border px-4 py-2 text-left">ATD Exit Date</th>
            <th className="border px-4 py-2 text-left">Offense Category</th>
            <th className="border px-4 py-2 text-left">Successful Exit</th>
            <th className="border px-4 py-2 text-left">Race/Ethnicity</th>
            <th className="border px-4 py-2 text-left">Exit To</th>
          </tr>
        </thead>
        <tbody>
          {data.map((record, idx) => (
            <tr key={idx} className="odd:bg-white even:bg-gray-50">
              <td className="border px-4 py-2">{record.Youth_ID}</td>
              <td className="border px-4 py-2">{record.ATD_Entry_Date}</td>
              <td className="border px-4 py-2">{record.ATD_Exit_Date}</td>
              <td className="border px-4 py-2">{record.OffenseCategory}</td>
              <td className="border px-4 py-2">
                {record.ATD_Successful_Exit === "1" ||
                record.ATD_Successful_Exit === 1
                  ? "Successful"
                  : "Unsuccessful"}
              </td>
              <td className="border px-4 py-2">{getRaceEthnicity(record)}</td>
              <td className="border px-4 py-2">{record.Exit_To}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default RecordsTable;
