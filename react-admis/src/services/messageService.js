import api from "./api";

export const getGroupConversation = () => {
  return api.get("/messages/groupe");
};

export const sendGroupMessage = (payload) => {
  return api.post("/messages/envoyer", payload);
};
