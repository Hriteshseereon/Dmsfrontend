import api from "./axios";
import useSessionStore from "../store/sessionStore";

/**
 * TDS Master (Administration module)
 *   GET    /administration/tds-master/            -> all configured policies
 *   GET    /administration/tds-master/current/    -> active policy for the current FY
 *   GET    /administration/tds-master/next/       -> scheduled policy for the next FY
 *   POST   /administration/tds-master/            -> create / schedule a policy
 *   PATCH  /administration/tds-master/<id>/       -> update a policy
 *   DELETE /administration/tds-master/<id>/       -> remove a policy
 */

const orgParams = () => {
  const { currentOrgId } = useSessionStore.getState();
  return currentOrgId ? { organisation: currentOrgId } : {};
};

export const getTdsMasters = async () => {
  const res = await api.get("/administration/tds-master/", {
    params: orgParams(),
  });
  return res.data;
};

export const getCurrentTdsMaster = async () => {
  const res = await api.get("/administration/tds-master/current/", {
    params: orgParams(),
  });
  return res.data;
};

export const getNextTdsMaster = async () => {
  const res = await api.get("/administration/tds-master/next/", {
    params: orgParams(),
  });
  return res.data;
};

export const addTdsMaster = async (payload) => {
  const res = await api.post(
    "/administration/tds-master/",
    { ...orgParams(), ...payload },
    { params: orgParams() },
  );
  return res.data;
};

export const updateTdsMaster = async (id, payload) => {
  const res = await api.patch(`/administration/tds-master/${id}/`, payload, {
    params: orgParams(),
  });
  return res.data;
};

export const deleteTdsMaster = async (id) => {
  const res = await api.delete(`/administration/tds-master/${id}/`, {
    params: orgParams(),
  });
  return res.data;
};
