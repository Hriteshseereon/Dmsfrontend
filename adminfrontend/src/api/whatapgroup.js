import api from "./axios";
import useSessionStore from "../store/sessionStore";

// ==========================================================
// WhatsApp Group Master APIs
// ==========================================================

// Create Group
export const addWhatsappGroup = async (data) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.post(
    "/whatsapps/whatsapp/groups/",
    data,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Get All Groups
export const getAllWhatsappGroups = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(
    "/whatsapps/whatsapp/groups/",
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Get Group By Id
export const getWhatsappGroupById = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(
    `/whatsapps/whatsapp/groups/${id}/`,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Update Group
export const updateWhatsappGroup = async (id, data) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.patch(
    `/whatsapps/whatsapp/groups/${id}/`,
    data,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Delete Group
export const deleteWhatsappGroup = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.delete(
    `/whatsapps/whatsapp/groups/${id}/`,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// ==========================================================
// WhatsApp Group Member APIs
// ==========================================================

// Create Member
export const addGroupMember = async (data) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.post(
    "/whatsapps/whatsapp/group-members/",
    data,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Get All Members
export const getGroupMembers = async () => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(
    "/whatsapps/whatsapp/group-members/",
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Get Member By Id
export const getGroupMemberById = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.get(
    `/whatsapps/whatsapp/group-members/${id}/`,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Update Member
export const updateGroupMember = async (id, data) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.patch(
    `/whatsapps/whatsapp/group-members/${id}/`,
    data,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};

// Delete Member
export const deleteGroupMember = async (id) => {
  const currentOrgId = useSessionStore.getState().currentOrgId;

  const res = await api.delete(
    `/whatsapps/whatsapp/group-members/${id}/`,
    {
      params: {
        organisation: currentOrgId,
      },
    }
  );

  return res.data;
};