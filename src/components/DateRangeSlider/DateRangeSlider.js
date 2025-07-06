import React, { useMemo, useState, useEffect, useRef } from "react";
import { format } from "date-fns";
import Slider from "@mui/material/Slider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import TextField from "@mui/material/TextField";
import "./DateRangeSlider.css"; // keep your styles if needed

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
  const debounceTimeout = useRef();

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

  const [range, setRange] = useState(() => {
    if (!minDate || !maxDate) return [0, 0];

    const start = new Date(maxDate);
    start.setFullYear(start.getFullYear() - 1);

    // Ensure start is not before minDate
    const adjustedStart = start < minDate ? minDate : start;

    return [adjustedStart.getTime(), maxDate.getTime()];
  });

  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDatesRange?.([
        new Date(range[0]).toISOString().split("T")[0],
        new Date(range[1]).toISOString().split("T")[0],
      ]);
    }, 300); // debounce delay in ms
    return () => clearTimeout(debounceTimeout.current);
  }, [range]); // only when the range changes

  if (!records || records.length === 0 || !minDate || !maxDate) {
    return;
  }

  const handleSliderChange = (_, newValue) => {
    setRange(newValue);
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
    <div style={{ padding: "8px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "8px",
          fontSize: "14px",
          fontWeight: 500,
          color: "#333",
        }}
      >
        {/* <span>{format(new Date(range[0]), "M/d/yyyy")}</span>
        <span>{format(new Date(range[1]), "M/d/yyyy")}</span> */}
      </div>

      <Slider
        value={range}
        onChange={handleSliderChange}
        min={minDate.getTime()}
        max={maxDate.getTime()}
        step={24 * 60 * 60 * 1000}
        valueLabelDisplay="off"
        sx={{
          color: "#757575",
          height: 4,
          "& .MuiSlider-thumb": {
            width: 16,
            height: 16,
            backgroundColor: "#fff",
            border: "2px solid #757575",
            borderRadius: "50% 50% 0 0",
            transform: "rotate(90deg) translate(-8px, 0px)", // default for left thumb with position adjustment
            boxShadow: "none",
            "&:before": {
              display: "none", // removes the default shadow/effect
            },
          },
          "& .MuiSlider-thumb:nth-of-type(3)": {
            transform: "rotate(270deg) translate(8px, -10px)", // rotate right thumb and adjust position
          },
          "& .MuiSlider-rail": {
            backgroundColor: "#e0e0e0",
            opacity: 1,
          },
          "& .MuiSlider-track": {
            backgroundColor: "#757575",
          },
        }}
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "-4px",
            gap: "12px",
          }}
        >
          <DatePicker
            value={new Date(range[0])}
            onChange={(date) => date && updateStartDate(date)}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{
              textField: {
                size: "small",
                variant: "outlined",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    fontSize: "13px",
                    height: "28px",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    padding: "0", // Remove all padding
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "1px solid #888",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "0 6px", // Only left/right padding, no top/bottom
                    height: "28px",
                    boxSizing: "border-box", // Ensures height includes padding
                  },
                },
              },
            }}
          />

          <DatePicker
            value={new Date(range[1])}
            onChange={(date) => date && updateEndDate(date)}
            minDate={minDate}
            maxDate={maxDate}
            slotProps={{
              textField: {
                size: "small",
                variant: "outlined",
                sx: {
                  "& .MuiOutlinedInput-root": {
                    fontSize: "13px",
                    height: "28px",
                    borderRadius: "4px",
                    backgroundColor: "transparent",
                    padding: "0", // Remove all padding
                    "& fieldset": {
                      border: "none",
                    },
                    "&:hover fieldset": {
                      border: "none",
                    },
                    "&.Mui-focused fieldset": {
                      border: "1px solid #888",
                    },
                  },
                  "& .MuiInputBase-input": {
                    padding: "0 6px", // Only left/right padding, no top/bottom
                    height: "28px",
                    boxSizing: "border-box", // Ensures height includes padding
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
