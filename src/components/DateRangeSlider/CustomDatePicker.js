import React, { useState, useRef } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const CustomDatePicker = () => {
  const [startDate, setStartDate] = useState(new Date());
  const inputRef = useRef(null);

  return (
    <div>
      <label htmlFor="datepicker">Select Date:</label>
      <DatePicker
        id="datepicker"
        selected={startDate}
        onChange={(date) => date && setStartDate(date)}
        onInputClick={() => {
          inputRef.current.setFocus();
        }}
        dateFormat="yyyy-MM-dd"
        showPopperArrow={false}
        popperPlacement="bottom-start"
        ref={inputRef}
        placeholderText="YYYY-MM-DD"
        isClearable
        todayButton="Today"
      />
    </div>
  );
};

export default CustomDatePicker;
