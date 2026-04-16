// Get current financial year (based on today's date)
export const getCurrentFinancialYear = () => {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth(); // 0 = Jan, 3 = April

  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  } else {
    return `${year - 1}-${year.toString().slice(-2)}`;
  }
};

// Generate list of financial years (dropdown)
export const getFinancialYearOptions = (count = 5) => {
  const currentFY = getCurrentFinancialYear();
  const startYear = parseInt(currentFY.split("-")[0]);

  return Array.from({ length: count }, (_, i) => {
    const y = startYear - i;
    return `${y}-${(y + 1).toString().slice(-2)}`;
  });
};

// Get start & end date of a financial year
export const getFYDateRange = (fy) => {
  const [startYear] = fy.split("-").map(Number);

  return {
    start: new Date(startYear, 3, 1),     // April 1
    end: new Date(startYear + 1, 2, 31),  // March 31
  };
};