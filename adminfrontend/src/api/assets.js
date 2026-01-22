import api from "./axios";

// add assse ctategory
export const addAssetCategory = async (data) => {
  const res = await api.post("/assets/categories/", data);
  return res.data;
}
export const getAssetCategories = async () => {
  const res = await api.get("/assets/categories/");
  return res.data;
}