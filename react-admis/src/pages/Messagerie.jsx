import { useEffect, useState, useRef } from "react";
import { getGroupConversation, sendGroupMessage } from "../services/messageService";
import { FaPaperPlane, FaUsers, FaImage, FaTimes } from "react-icons/fa";

export default function Messagerie() {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageBase64, setImageBase64] = useState("");
  const messagesEndRef = useRef(null);

  const currentUser = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 3000); // refresh messages every 3s
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const res = await getGroupConversation();
      setMessages(res.data);
    } catch (e) {
      console.error("Error loading messages", e);
    }
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() && !imageBase64) return;

    const payload = {
      expediteurId: currentUser.id,
      contenu: newMessage,
      image: imageBase64 || null
    };

    try {
      setNewMessage(""); // clear input early for UX
      setImageFile(null);
      setImageBase64("");
      await sendGroupMessage(payload);
      loadMessages();
    } catch (error) {
      console.error("Error sending message", error);
    }
  };

  const handleImagePick = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageBase64(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 40px)", margin: "-20px", background: "#f8fafc" }}>
      
      {/* HEADER */}
      <div style={{ padding: "20px", background: "white", borderBottom: "1px solid #e2e8f0", display: "flex", alignItems: "center", gap: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.05)", zIndex: 10 }}>
        <div style={{ width: "45px", height: "45px", borderRadius: "50%", background: "#e0e7ff", display: "flex", alignItems: "center", justifyContent: "center", color: "#4f46e5" }}>
          <FaUsers size={24} />
        </div>
        <div>
          <h2 style={{ margin: 0, fontSize: "18px", color: "var(--primary-bg)" }}>Groupe Général de passation</h2>
          <p style={{ margin: 0, fontSize: "13px", color: "#64748b" }}>Admin, Super Admin, Exécuteurs</p>
        </div>
      </div>

      {/* CHAT AREA */}
      <div style={{ flex: 1, padding: "20px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
        {messages.length === 0 && (
          <div style={{ textAlign: "center", color: "#94a3b8", marginTop: "20px" }}>
            Aucun message. Commencez la discussion !
          </div>
        )}
        {messages.map(msg => {
          const isMe = msg.expediteur?.id === currentUser.id;
          return (
            <div key={msg.id} style={{ alignSelf: isMe ? "flex-end" : "flex-start", maxWidth: "60%" }}>
              {!isMe && (
                <div style={{ fontSize: "12px", color: "#64748b", marginBottom: "4px", marginLeft: "15px", fontWeight: "600" }}>
                  {msg.expediteur?.nom}
                </div>
              )}
              <div style={{
                background: isMe ? "#2563eb" : "white",
                color: isMe ? "white" : "#0f172a",
                padding: "12px 18px",
                borderRadius: isMe ? "18px 18px 0 18px" : "18px 18px 18px 0",
                fontSize: "15px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                border: isMe ? "none" : "1px solid #e2e8f0"
              }}>
                {msg.image && (
                  <img src={msg.image} alt="uploaded" style={{ maxWidth: "200px", borderRadius: "10px", marginBottom: msg.contenu ? "8px" : "0" }} />
                )}
                {msg.contenu && <div>{msg.contenu}</div>}
              </div>
              <div style={{ fontSize: "11px", color: "#94a3b8", marginTop: "6px", textAlign: isMe ? "right" : "left", marginLeft: isMe ? "0" : "15px", marginRight: isMe ? "15px" : "0" }}>
                {new Date(msg.dateEnvoi).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* INPUT AREA */}
      {imageBase64 && (
        <div style={{ padding: "10px 20px", background: "#f1f5f9", display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ position: "relative" }}>
            <img src={imageBase64} alt="preview" style={{ height: "60px", borderRadius: "8px" }} />
            <button 
              onClick={() => { setImageFile(null); setImageBase64(""); }}
              style={{ position: "absolute", top: "-5px", right: "-5px", background: "#ef4444", color: "white", border: "none", borderRadius: "50%", width: "20px", height: "20px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}
            >
              <FaTimes size={10} />
            </button>
          </div>
          <span style={{ fontSize: "13px", color: "#64748b" }}>Image prête à envoyer</span>
        </div>
      )}
      <form onSubmit={handleSend} style={{ padding: "15px 20px", background: "white", borderTop: "1px solid #e2e8f0", display: "flex", gap: "15px", alignItems: "center" }}>
        <label style={{ cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", width: "40px", height: "40px", borderRadius: "50%", background: "#f1f5f9", color: "#64748b", transition: "0.2s" }}>
          <FaImage size={20} />
          <input type="file" accept="image/*" onChange={handleImagePick} style={{ display: "none" }} />
        </label>
        
        <input 
          type="text" 
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder="Écrivez votre message..." 
          style={{ flex: 1, padding: "14px 20px", fontSize: "15px", borderRadius: "30px", border: "1px solid #cbd5e1", outline: "none", background: "#f8fafc" }}
        />
        <button 
          type="submit"
          disabled={!newMessage.trim() && !imageBase64}
          style={{ background: (newMessage.trim() || imageBase64) ? "#2563eb" : "#94a3b8", color: "white", border: "none", borderRadius: "50%", width: "50px", height: "50px", display: "flex", alignItems: "center", justifyContent: "center", cursor: (newMessage.trim() || imageBase64) ? "pointer" : "not-allowed", transition: "background 0.2s" }}
        >
          <FaPaperPlane size={18} style={{ marginLeft: "-2px", marginTop: "2px" }} />
        </button>
      </form>

    </div>
  );
}
