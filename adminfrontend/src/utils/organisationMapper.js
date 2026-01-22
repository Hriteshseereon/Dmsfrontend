export const mapOrganisationFromApi = (org) => ({
  id: org.id,
  name: org.registered_name,
  modules: (org.modules || []).map((m) => m.module),
});
