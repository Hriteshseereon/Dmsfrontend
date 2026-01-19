// Required positive number (Qty, Rate, etc.)
export const requiredPositiveNumber = (label) => [
  { required: true, message: `${label} is required` },
  {
    type: "number",
    min: 1,
    message: `${label} must be greater than 0`,
  },
];

// Optional positive number (Free Qty, Weight)
export const optionalPositiveNumber = (label) => [
  {
    type: "number",
    min: 0,
    message: `${label} cannot be negative`,
  },
];

// Percentage validation
export const percentageValidation = (label) => [
  {
    type: "number",
    min: 0,
    max: 100,
    message: `${label} must be between 0 and 100`,
  },
];
