export const updateItemComputedFields = (form, index, computeFn) => {
  const allValues = form.getFieldsValue();
  const computed = computeFn(allValues || {});
  const item = computed.items?.[index];

  if (!item) return;

  form.setFields([
    { name: ["items", index, "totalQty"], value: item.totalQty },
    { name: ["items", index, "grossAmount"], value: item.grossAmount },
    { name: ["items", index, "discountAmt"], value: item.discountAmt },
    { name: ["items", index, "totalGST"], value: item.totalGST },
    { name: ["items", index, "totalAmt"], value: item.totalAmt },
  ]);
};
