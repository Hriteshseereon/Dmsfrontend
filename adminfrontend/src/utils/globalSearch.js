import dayjs from "dayjs";

export const globalSearch = (data, searchText) => {
  if (!searchText) return data;

  const search = searchText.trim().toLowerCase();

  const formatValue = (value) => {
    if (!value) return "";

    if (dayjs.isDayjs(value)) return value.format("YYYY-MM-DD");

    if (typeof value === "string" && dayjs(value).isValid())
      return dayjs(value).format("YYYY-MM-DD");

    return value.toString();
  };

  return data.filter((row) =>
    Object.entries(row).some(([key, value]) => {
      if (key === "key") return false;

      return formatValue(value).toLowerCase().includes(search);
    })
  );
};