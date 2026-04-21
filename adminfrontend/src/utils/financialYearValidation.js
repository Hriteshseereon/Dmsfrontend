import { getFYDateRange } from './financialYear';
import useSessionStore from '../store/sessionStore';

// Financial year validation function for DatePicker
export const validateFinancialYear = (currentDate, selectedFY) => {
  if (!currentDate || !selectedFY) return false;
  
  const { start, end } = getFYDateRange(selectedFY);
  const current = currentDate.startOf('day');
  
  return current.isBefore(start) || current.isAfter(end);
};

// Custom disabledDate function for DatePicker
export const createFinancialYearDisabledDate = (selectedFY) => {
  return (current) => {
    if (!current || !selectedFY) return false;
    
    const { start, end } = getFYDateRange(selectedFY);
    const currentDate = current.startOf('day');
    
    // Disable dates before financial year start or after financial year end
    return currentDate.isBefore(start) || currentDate.isAfter(end);
  };
};

// Hook to get selected financial year from session store
export const useSelectedFinancialYear = () => {
  return useSessionStore((state) => state.selectedFY);
};

// Validation message function
export const getFinancialYearValidationMessage = (selectedFY) => {
  if (!selectedFY) return "Please select a financial year first";
  
  const { start, end } = getFYDateRange(selectedFY);
  return `Date must be between ${start.format('DD-MMM-YYYY')} and ${end.format('DD-MMM-YYYY')}`;
};
