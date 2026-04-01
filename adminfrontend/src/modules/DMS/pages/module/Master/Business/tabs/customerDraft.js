export const getAllCustomerDrafts = () => {
  const result = [];

  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);

    if (key.startsWith("customer-form-")) {
      try {
        const value = JSON.parse(localStorage.getItem(key));

        if (value && value.name) {
          result.push({
            id: key,
            name: value.name,
            mobile: value.mobileNo,
            email: value.email,
          });
        }
      } catch (e) {}
    }
  }

  return result;
};

export const deleteCustomerDraft = (id) => {
  localStorage.removeItem(id);
};