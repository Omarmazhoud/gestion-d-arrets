import api from "./api";

export const getTickets = () => {
  return api.get("/tickets");
};

export const forceUpdateStatus = (id, newStatus, adminId) => {
  return api.put(`/tickets/${id}/force-status`, null, {
    params: { newStatus, adminId }
  });
};

export const createTicket = (demandeurId, payload, machineId, executeurCibleId) => {
  const params = {};
  if (machineId) params.machineId = machineId;
  if (executeurCibleId) params.executeurCibleId = executeurCibleId;

  return api.post(`/tickets/declarer/${demandeurId}`, payload, {
    params: params
  });
};

export const adminUpdateTicket = (id, payload, adminId) => {
  return api.put(`/tickets/${id}/admin-update`, payload, {
    params: { adminId }
  });
};

