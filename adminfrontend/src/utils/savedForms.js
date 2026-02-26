export const getAllDraftOrganizations = () => {
  const result = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key.startsWith("form-")) {
      try {
        const value = JSON.parse(localStorage.getItem(key));
        if (value && value.registeredName) {
          result.push({
            id: key.replace("form-", ""),
            registered_name: value.registeredName,
          });
        }
      } catch (e) {}
    }
  }
  return result;
};
