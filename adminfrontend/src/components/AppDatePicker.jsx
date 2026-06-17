import React, { forwardRef, useRef } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { formatDateInput } from "../utils/dateInputFormatter";

const AppDatePicker = forwardRef(({ value, onChange, ...props }, ref) => {
  const isFreshFocus = useRef(false);

  const handleChange = (date) => {
    onChange?.(date);
  };

  const handleFocus = (e) => {
    isFreshFocus.current = true;
    e.target.select();
  };

  const handleKeyDown = (e) => {
    const input = e.target;
    if (input.tagName !== "INPUT") return;

    if (
      ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"].includes(e.key)
    ) {
      return;
    }

    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
      return;
    }

    if (isFreshFocus.current) {
      input.value = "";
      isFreshFocus.current = false;
    }

    if (input.value.replace(/\D/g, "").length >= 8) {
      e.preventDefault();
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
    <div onFocus={handleFocus} onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
      <DatePicker
        ref={ref}
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
});

export default AppDatePicker;
