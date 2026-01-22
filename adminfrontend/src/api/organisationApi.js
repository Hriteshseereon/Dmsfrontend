import axiosInstance from "./axiosInstance";

// 1. Organisation
export const createOrganisation = (payload) =>
    axiosInstance.post("/organisation/organisations/", payload);

export const selectOrganisation = (organisationId) =>
    axiosInstance.post("/organisation/select-organisation/", {
        organisation_id: organisationId,
    });

export const updateOrganisation = (id, payload) =>
    axiosInstance.patch(`/organisation/organisations/${id}/`, payload);

export const deleteOrganisation = (id) =>
    axiosInstance.delete(`/organisation/organisations/${id}/`);

export const getOrganisationList = () =>
    axiosInstance.get("/organisation/organisation-list/");

export const getOrganisations = () =>
    axiosInstance.get("/organisation/organisations/");


// 2. Address
export const createAddress = (payload) =>
    axiosInstance.post("/organisation/organisation-addresses/", payload);


// 3. Legal
export const createLegalDetails = (payload) =>
    axiosInstance.post("/organisation/organisation-legal-details/", payload);

// 4. Branch
export const createBranch = (payload) =>
    axiosInstance.post("/organisation/organisation-branches/", payload);

// 5. Depo
export const createDepo = (payload) =>
    axiosInstance.post("/organisation/organisation-depos/", payload);

// 6. Persons
export const createPerson = (payload) =>
    axiosInstance.post("/organisation/organisation-persons/", payload);

// 7. Enable Module
export const enableModule = (payload) =>
    axiosInstance.post("/organisation/organisation-modules/", payload);