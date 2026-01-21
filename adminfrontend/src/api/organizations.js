export const getOrganizations = async () => {
    const res = await api.get("/organization/organizations/");
    return res.data;
}