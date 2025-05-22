import React, { useMemo, useState } from "react";
import { format } from "date-fns";
import Slider from "@mui/material/Slider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./DateRangeSlider.css";

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
  records = [],
  dateAccessor = (d) => d.Admission_Date,
  setDatesRange,
  type = "secure-detention",
}) => {
  const filteredData = useMemo(() => {
    return records.filter((record) =>
      type === "secure-detention"
        ? record.Admission_Date && !isNaN(new Date(record.Admission_Date))
        : record.ADT_Entry_Date && !isNaN(new Date(record.ADT_Entry_Date))
    );
  }, [records, type]);

  const [minDate, maxDate] = useMemo(
    () => getMinMaxDates(filteredData, dateAccessor),
    [filteredData, dateAccessor]
  );

  const [range, setRange] = useState(() => [
    minDate ? minDate.getTime() : 0,
    maxDate ? maxDate.getTime() : 0,
  ]);

  if (!records || records.length === 0 || !minDate || !maxDate) {
    return null;
  }

  const handleSliderChange = (_, newValue) => {
    setRange(newValue);
    if (setDatesRange) {
      setDatesRange([
        new Date(newValue[0]).toISOString().split("T")[0],
        new Date(newValue[1]).toISOString().split("T")[0],
      ]);
    }
  };

  const updateStartDate = (date) => {
    const newStart = date.getTime();
    const newRange = [newStart, range[1]];
    setRange(newRange);
    setDatesRange?.([
      new Date(newRange[0]).toISOString().split("T")[0],
      new Date(newRange[1]).toISOString().split("T")[0],
    ]);
  };

  const updateEndDate = (date) => {
    const newEnd = date.getTime();
    const newRange = [range[0], newEnd];
    setRange(newRange);
    setDatesRange?.([
      new Date(newRange[0]).toISOString().split("T")[0],
      new Date(newRange[1]).toISOString().split("T")[0],
    ]);
  };

  return (
    <div className="p-4 bg-white rounded-xl shadow-md">
      <Slider
        value={range}
        onChange={handleSliderChange}
        min={minDate.getTime()}
        max={maxDate.getTime()}
        step={24 * 60 * 60 * 1000} // one day
        valueLabelDisplay="off"
        marks={[]} // removes labels under the slider
      />
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div
          className="dates-layer"
          style={{
            display: "flex",
            justifyContent: "space-between",
            gap: "16px",
            marginBottom: "16px",
          }}
        >
          <DatePicker
            label="Start Date"
            value={new Date(range[0])}
            onChange={(date) => date && updateStartDate(date)}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  "& .MuiInputBase-input": {
                    padding: "6px 8px",
                  },
                },
              },
            }}
          />
          <DatePicker
            label="End Date"
            value={new Date(range[1])}
            onChange={(date) => date && updateEndDate(date)}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{
              textField: {
                size: "small",
                sx: {
                  "& .MuiInputBase-input": {
                    padding: "6px 8px",
                  },
                },
              },
            }}
          />
        </div>
      </LocalizationProvider>
    </div>
  );
};

export default DateRangeSlider;
