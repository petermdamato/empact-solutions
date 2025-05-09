import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import Slider from "@mui/material/Slider";

const getMinMaxDates = (data, dateAccessor) => {
  const dates = data
    .map(dateAccessor)
    .map((d) => (typeof d === "string" ? new Date(d) : d))
    .filter((d) => !isNaN(d));

  if (dates.length === 0) return [null, null];

  const min = new Date(Math.min(...dates));
  const max = new Date(Math.max(...dates));
  return [min, max];
};

const DateRangeSlider = ({
  records,
  dateAccessor = (d) => d.Admission_Date,
  setDatesRange,
  type = "secure-detention",
}) => {
  if (!records || records.length === 0) return null;

  const data = records.filter((record) =>
    type === "secure-detention"
      ? record.Admission_Date && !isNaN(new Date(record.Admission_Date))
      : record.ADT_Entry_Date && !isNaN(new Date(record.ADT_Entry_Date))
  );

  const [minDate, maxDate] = useMemo(
    () => getMinMaxDates(data, dateAccessor),
    [data]
  );

  if (!minDate || !maxDate) return null;

  const [range, setRange] = useState([minDate.getTime(), maxDate.getTime()]);

  const handleChange = (_, newValue) => {
    setRange(newValue);
    if (setDatesRange) {
      setDatesRange([
        new Date(newValue[0]).toISOString().split("T")[0],
        new Date(newValue[1]).toISOString().split("T")[0],
      ]);
    }
  };

  const formatDate = (timestamp) => format(new Date(timestamp), "yyyy-MM-dd");

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <div className="flex justify-between mb-2 text-sm text-gray-700">
        <span>{formatDate(range[0])}</span>
        <span>{formatDate(range[1])}</span>
      </div>
      <Slider
        value={range}
        onChange={handleChange}
        min={minDate.getTime()}
        max={maxDate.getTime()}
        step={24 * 60 * 60 * 1000} // one day
        valueLabelDisplay="off"
        marks={[
          { value: minDate.getTime(), label: formatDate(minDate) },
          { value: maxDate.getTime(), label: formatDate(maxDate) },
        ]}
      />
    </div>
  );
};

export default DateRangeSlider;
