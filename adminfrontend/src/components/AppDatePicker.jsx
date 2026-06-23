import React, { forwardRef, useRef } from "react";
import { DatePicker } from "antd";
import dayjs from "dayjs";
import { formatDateInput } from "../utils/dateInputFormatter";

const AppDatePicker = forwardRef(
  ({ value, onChange, disabledDate, onTabComplete, ...props }, ref) => {
    const isFreshFocus = useRef(false);
    const hasAutoAdvanced = useRef(false); // ✅ NEW — double-fire rokne ke liye

    const handleChange = (date) => {
      onChange?.(date);
    };

    const handleFocus = (e) => {
      isFreshFocus.current = true;
      hasAutoAdvanced.current = false; // ✅ Reset on every fresh focus
      e.target.select();
    };

    const handleKeyDown = (e) => {
      const input = e.target;
      if (input.tagName !== "INPUT") return;

      if (e.key === "Tab") {
        e.preventDefault();
        e.stopPropagation();
        if (!hasAutoAdvanced.current) {
          // ✅ Sirf ek baar
          hasAutoAdvanced.current = true;
          onTabComplete?.();
        }
        return;
      }

      if (["Backspace", "Delete", "ArrowLeft", "ArrowRight"].includes(e.key)) {
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

      // Tab ka keyUp ignore karo — already handled in keyDown
      if (e.key === "Tab") return; // ✅ NEW

      const formatted = formatDateInput(input.value);
      if (formatted !== input.value) {
        input.value = formatted;
      }

      if (formatted.length === 10) {
        const parsed = dayjs(formatted, "DD-MM-YYYY", true);
        if (!parsed.isValid()) return;
        if (disabledDate && disabledDate(parsed)) {
          input.value = "";
          return;
        }
        onChange?.(parsed);

        // ✅ Auto-advance only once per fresh typing session
        if (!hasAutoAdvanced.current) {
          hasAutoAdvanced.current = true;
          onTabComplete?.();
        }
      }
    };

    return (
      <div
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      >
        <DatePicker
          ref={ref}
          {...props}
          disabledDate={disabledDate}
          value={value}
          format="DD-MM-YYYY"
          inputReadOnly={false}
          allowClear
          onChange={handleChange}
          className="w-full"
        />
      </div>
    );
  },
);

export default AppDatePicker;
