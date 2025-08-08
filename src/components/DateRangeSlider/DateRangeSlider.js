import React, { useMemo, useState, useEffect, useRef } from "react";
import Slider from "@mui/material/Slider";
import moment from "moment";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
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
  dateAccessor = (d) => d.Intake_Date,
  setDatesRange,
  type = "secure-detention",
}) => {
  const debounceTimeout = useRef();

  const filteredData = useMemo(() => {
    return records.filter((record) =>
      type === "secure-detention"
        ? record.Intake_Date && !isNaN(new Date(record.Intake_Date))
        : record.ATD_Entry_Date && !isNaN(new Date(record.ATD_Entry_Date))
    );
  }, [records, type]);

  const [minDate, maxDate] = useMemo(
    () => getMinMaxDates(filteredData, dateAccessor),
    [filteredData, dateAccessor]
  );

  const [range, setRange] = useState(() => {
    if (!minDate || !maxDate) return [0, 0];

    const startOfYear = moment(maxDate).startOf("year");
    const endOfYear = moment(maxDate).endOf("year").startOf("day");

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
    if (!date) return;
    const newStart = moment(date).valueOf();
    const newRange = [newStart, range[1]];
    setRange(newRange);
    setDatesRange?.([
      moment(newRange[0]).format("YYYY-MM-DD"),
      moment(newRange[1]).format("YYYY-MM-DD"),
    ]);
  };

  const updateEndDate = (date) => {
    if (!date) return;
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

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: "12px",
        }}
      >
        <div className="datepicker-wrapper">
          <DatePicker
            selected={moment(range[0]).toDate()}
            onChange={updateStartDate}
            minDate={minDate.toDate()}
            maxDate={maxDate.toDate()}
            dateFormat="MM/dd/yyyy"
            className="custom-datepicker"
            wrapperClassName="datepicker-wrapper"
            popperPlacement="bottom-start"
            popperModifiers={[
              {
                name: "offset",
                options: { offset: [0, 4] },
              },
            ]}
          />
        </div>

        <div className="datepicker-wrapper">
          <DatePicker
            selected={moment(range[1]).toDate()}
            onChange={updateEndDate}
            minDate={minDate.toDate()}
            maxDate={maxDate.toDate()}
            dateFormat="MM/dd/yyyy"
            className="custom-datepicker"
            wrapperClassName="datepicker-wrapper"
            popperPlacement="bottom-start"
            popperModifiers={[
              {
                name: "offset",
                options: { offset: [0, 4] },
              },
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default DateRangeSlider;
