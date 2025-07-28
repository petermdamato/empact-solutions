import React, { useMemo, useState, useEffect, useRef } from "react";
import Slider from "@mui/material/Slider";
import moment from "moment";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import "./DateRangeSlider.css";

const getMinMaxDates = (data, dateAccessor) => {
  const dates = data
    .map(dateAccessor)
    .map((d) => (typeof d === "string" ? moment(d) : moment(d)))
    .filter((d) => d.isValid());

  if (dates.length === 0) return [null, null];

  const min = moment.min(dates);
  const max = moment.max(dates);
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

    const startOfYear = moment(maxDate).startOf("year");
    const endOfYear = moment(maxDate).endOf("year");

    return [startOfYear.valueOf(), endOfYear.valueOf()];
  });

  useEffect(() => {
    clearTimeout(debounceTimeout.current);
    debounceTimeout.current = setTimeout(() => {
      setDatesRange?.([
        moment(range[0]).format("YYYY-MM-DD"),
        moment(range[1]).format("YYYY-MM-DD"),
      ]);
    }, 100);
    return () => clearTimeout(debounceTimeout.current);
  }, [range]);

  if (!records || records.length === 0 || !minDate || !maxDate) {
    return;
  }

  const handleSliderChange = (_, newValue) => {
    setRange(newValue);
  };

  const updateStartDate = (date) => {
    const newStart = moment(date).valueOf();
    const newRange = [newStart, range[1]];
    setRange(newRange);
    setDatesRange?.([
      moment(newRange[0]).format("YYYY-MM-DD"),
      moment(newRange[1]).format("YYYY-MM-DD"),
    ]);
  };

  const updateEndDate = (date) => {
    const newEnd = moment(date).valueOf();
    const newRange = [range[0], newEnd];
    setRange(newRange);
    setDatesRange?.([
      moment(newRange[0]).format("YYYY-MM-DD"),
      moment(newRange[1]).format("YYYY-MM-DD"),
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
        min={minDate.valueOf()}
        max={maxDate.valueOf()}
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
            value={moment(range[0]).toDate()}
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
            value={moment(range[1]).toDate()}
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
