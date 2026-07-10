import api from "./axios";
import useSessionStore from "../store/sessionStore";

// ------------------------- Transport Owner Master APIs -------------------------

// Create Transport Owner
export const addVehicleOwner = async (formData) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.post(
    "/transport/transport-owner-masters/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Get All Transport Owners
export const getAllVehicleOwner = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get("/transport/transport-owner-masters/", {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data;
};

// Get Single Transport Owner
export const getVehicleOwnerById = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(
    `/transport/transport-owner-masters/${id}/`,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Update Transport Owner
export const updateVehicleOwner = async (id, formData) => {
  const { currentOrgId } = useSessionStore.getState();

  const res = await api.patch(
    `/transport/transport-owner-masters/${id}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};
// Delete Transport Owner
export const deleteVehicleOwner = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.delete(
    `/transport/transport-owner-masters/${id}/`,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// ===================================================================
// ------------------------- Vehicle Master APIs ----------------------
// ===================================================================

// Create Vehicle
export const addVehicle = async (formData) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.post(
    "/transport/vehicle-masters/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Get All Vehicles
export const getAllVehicles = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get("/transport/vehicle-masters/", {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data;
};

// Get Vehicle By Id
export const getVehicleById = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(`/transport/vehicle-masters/${id}/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data;
};

// Update Vehicle
export const updateVehicle = async (id, formData) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.patch(
    `/transport/vehicle-masters/${id}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Delete Vehicle
export const deleteVehicle = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.delete(`/transport/vehicle-masters/${id}/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data;
};

// ===================================================================
// ------------------------- Driver Master APIs -----------------------
// ===================================================================

// Create Driver
export const addDriver = async (formData) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.post(
    "/transport/driver-masters/",
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};
// Get All Drivers
export const getAllDrivers = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get("/transport/driver-masters/", {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data;
};

// Get Driver By Id
export const getDriverById = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(`/transport/driver-masters/${id}/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data;
};

// Update Driver
export const updateDriver = async (id, formData) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.patch(
    `/transport/driver-masters/${id}/`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Delete Driver
export const deleteDriver = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.delete(`/transport/driver-masters/${id}/`, {
    params: {
      organisation: currentOrgId,
    },
  });

  return res.data;
};