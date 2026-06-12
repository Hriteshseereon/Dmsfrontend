import React from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { formatDateInput } from "../utils/dateInputFormatter";

const AppDatePicker = ({ value, onChange, ...props }) => {
  const handleChange = (date) => {
    onChange?.(date);
  };

  const handleKeyDown = (e) => {
    const key = e.key;
    const input = e.target;

    if (!input.tagName === "INPUT") return;

    // Allow control keys
    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(key)
    ) {
      return;
    }

    // Block non-digit keys
    if (!/^\d$/.test(key)) {
      e.preventDefault();
      return;
    }

    // Block typing beyond full date
    if (input.value.replace(/\D/g, "").length >= 8) {
      e.preventDefault();
      return;
    }
  };

  const handleKeyUp = (e) => {
    const input = e.target;
    if (input.tagName !== "INPUT") return;

    const formatted = formatDateInput(input.value);

    if (formatted !== input.value) {
      input.value = formatted;
    }

    if (formatted.length === 10) {
      const parsed = dayjs(formatted, "DD-MM-YYYY", true);
      if (parsed.isValid()) {
        onChange?.(parsed);
      }
    }
  };

  return (
    // Catch bubbled events from AntD's internal input
    <div onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <DatePicker
        {...props}
        value={value}
        format="DD-MM-YYYY"
        inputReadOnly={false}
        allowClear
        onChange={handleChange}
        className="w-full"
      />
    </div>
  );
};

export default AppDatePicker;
