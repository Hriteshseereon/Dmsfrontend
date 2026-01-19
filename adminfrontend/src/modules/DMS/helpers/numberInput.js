// Prevents text input & allows only positive numbers
// export const positiveNumberInputProps = {
//   min: 0,
//   className: "w-full",

//   // removes all non-numeric characters
//   parser: (value) => {
//     if (!value) return "";
//     return value.replace(/[^\d.]/g, "");
//   },

//   // keep raw number display (no formatting noise)
//   formatter: (value) => value,
// };
// helpers/numberInput.js

/**
 * Blocks non-numeric keyboard input in real-time
 * Use with InputNumber: onKeyDown={blockNonNumericInput}
 */
export const blockNonNumericInput = (e) => {
  // Allow: backspace, delete, tab, escape, enter, decimal point, arrows
  const allowedKeys = [
    'Backspace',
    'Delete',
    'Tab',
    'Escape',
    'Enter',
    '.',
    'ArrowLeft',
    'ArrowRight',
    'ArrowUp',
    'ArrowDown',
    'Home',
    'End'
  ];

  if (allowedKeys.includes(e.key)) {
    return; // Allow these keys
  }

  // Allow Ctrl/Cmd shortcuts (Ctrl+A, Ctrl+C, Ctrl+V, etc.)
  if (e.ctrlKey || e.metaKey) {
    return;
  }

  // Block if not a number (0-9)
  if (!/[0-9]/.test(e.key)) {
    e.preventDefault();
  }
};

/**
 * Prevents text input & allows only positive numbers
 * Includes real-time text blocking via onKeyDown
 */
export const positiveNumberInputProps = {
  min: 0,
  className: "w-full",

  // Block non-numeric keys in real-time
  onKeyDown: blockNonNumericInput,

  // Removes all non-numeric characters (backup for paste events)
  parser: (value) => {
    if (!value) return "";
    return value.replace(/[^\d.]/g, "");
  },

  // Keep raw number display (no formatting noise)
  formatter: (value) => value,
};

/**
 * Props for number input WITHOUT the onKeyDown handler
 * Use this when you need to add custom onKeyDown logic
 */
export const positiveNumberInputPropsWithoutKeyDown = {
  min: 0,
  className: "w-full",

  parser: (value) => {
    if (!value) return "";
    return value.replace(/[^\d.]/g, "");
  },

  formatter: (value) => value,
};

/**
 * Props for percentage input (0-100)
 * Includes real-time text blocking
 */
export const percentageInputProps = {
  min: 0,
  max: 100,
  className: "w-full",
  onKeyDown: blockNonNumericInput,

  parser: (value) => {
    if (!value) return "";
    return value.replace(/[^\d.]/g, "");
  },

  formatter: (value) => value,
};

/**
 * Props for decimal/currency input
 * Allows negative numbers for scenarios like adjustments
 */
export const decimalInputProps = {
  className: "w-full",
  step: 0.01,
  precision: 2,

  onKeyDown: (e) => {
    const allowedKeys = [
      'Backspace', 'Delete', 'Tab', 'Escape', 'Enter', '.',
      'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown',
      'Home', 'End', '-'
    ];

    if (allowedKeys.includes(e.key)) return;
    if (e.ctrlKey || e.metaKey) return;

    if (!/[0-9]/.test(e.key)) {
      e.preventDefault();
    }
  },

  parser: (value) => {
    if (!value) return "";
    return value.replace(/[^\d.-]/g, "");
  },

  formatter: (value) => value,
};