import api from "./axios";
import useSessionStore from "../store/sessionStore";

/**
 * Dispatch Distance Master (Administration module)
 *   GET    /administration/dispatch-distance-master/                        -> all routes
 *   POST   /administration/dispatch-distance-master/                        -> one route, or { rows: [...] } for many
 *   PATCH  /administration/dispatch-distance-master/<id>/                   -> update a route
 *   DELETE /administration/dispatch-distance-master/<id>/                   -> remove a route
 *   GET    .../default-dispatch-from/                                       -> { dispatch_from } for the next row
 *   GET    .../dispatch-from-options/                                       -> { options: [...] }
 *   GET    .../dispatch-to-options/?dispatch_from=                          -> { options: [...] }
 *   GET    .../lookup-distance/?dispatch_from=&dispatch_to=                 -> { found, distance_km }
 */

const BASE = "/administration/dispatch-distance-master/";

const orgParams = () => {
  const { currentOrgId } = useSessionStore.getState();
  return currentOrgId ? { organisation: currentOrgId } : {};
};

export const getDispatchDistances = async () => {
  const res = await api.get(BASE, { params: orgParams() });
  return res.data;
};

/** rows: [{ dispatch_from, dispatch_to, distance_km }] - a blank dispatch_from reuses the previous row's */
export const addDispatchDistanceRows = async (rows) => {
  // Every row carries the organisation: the serializer's unique (organisation, from, to) check treats it
  // as required and rejects the row with "organisation: This field is required." when it is missing.
  const params = orgParams();
  const body = rows.map((row) => ({ ...params, ...row }));
  const res = await api.post(BASE, { rows: body }, { params });
  return res.data;
};

export const updateDispatchDistance = async (id, payload) => {
  const res = await api.patch(`${BASE}${id}/`, payload, { params: orgParams() });
  return res.data;
};

export const deleteDispatchDistance = async (id) => {
  const res = await api.delete(`${BASE}${id}/`, { params: orgParams() });
  return res.data;
};

export const getDefaultDispatchFrom = async () => {
  const res = await api.get(`${BASE}default-dispatch-from/`, { params: orgParams() });
  return res.data?.dispatch_from ?? null;
};

export const getDispatchFromOptions = async () => {
  const res = await api.get(`${BASE}dispatch-from-options/`, { params: orgParams() });
  return res.data?.options || [];
};

export const getDispatchToOptions = async (dispatchFrom) => {
  const res = await api.get(`${BASE}dispatch-to-options/`, {
    params: { ...orgParams(), ...(dispatchFrom ? { dispatch_from: dispatchFrom } : {}) },
  });
  return res.data?.options || [];
};

/** Resolves to the distance in km (number) or null when the route is not in the master */
export const lookupDispatchDistance = async (dispatchFrom, dispatchTo) => {
  const res = await api.get(`${BASE}lookup-distance/`, {
    params: { ...orgParams(), dispatch_from: dispatchFrom, dispatch_to: dispatchTo },
  });
  const d = res.data;
  return d?.found && d.distance_km !== null && d.distance_km !== undefined
    ? Number(d.distance_km)
    : null;
};
