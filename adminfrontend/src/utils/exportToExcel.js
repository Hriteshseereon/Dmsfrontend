import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

/**
 * Export JSON data to Excel file
 * @param {Array} data - array of objects
 * @param {String} fileName - file name without extension
 * @param {String} sheetName - sheet name
 */
export const exportToExcel = (data = [], fileName = "data", sheetName = "Sheet1") => {
  if (!data.length) {
    console.warn("No data available for export");
    return;
  }

  // Convert JSON to worksheet
  const worksheet = XLSX.utils.json_to_sheet(data);

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, {
    bookType: "xlsx",
    type: "array",
  });

  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8",
  });

  saveAs(blob, `${fileName}.xlsx`);
};
