import { useEffect, useState } from "react";
import { getProcesses, createProcess, updateProcess, deleteProcess } from "../../services/processService";

export default function Processes() {
  const [processes, setProcesses] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nom: "", description: "", image: "" });

  useEffect(() => {
    loadProcesses();
  }, []);

  const loadProcesses = async () => {
    try {
      const res = await getProcesses();
      setProcesses(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setForm({ nom: p.nom || "", description: p.description || "", image: p.image || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim()) {
      alert("Le nom est obligatoire");
      return;
    }
    try {
      if (editingId) {
        await updateProcess(editingId, form);
      } else {
        await createProcess(form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ nom: "", description: "", image: "" });
      loadProcesses();
    } catch (error) {
      alert(error.response?.data || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce process ?")) {
      try {
        await deleteProcess(id);
        loadProcesses();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filtered = processes.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div style={{ padding: "30px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Gestion des Processes</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Configurez les lignes et flux de production de l'usine.</p>
        </div>
        
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nom: "", description: "", image: "" });
              setShowModal(true);
            }}
            style={{
              background: "linear-gradient(135deg, #2563eb, #1d4ed8)",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 10px 15px -3px rgba(37,99,235,0.3)",
              transition: "transform 0.2s"
            }}
          >
            + Nouveau Process
          </button>
        )}
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "25px" }}>
        <div style={{ position: "relative", width: "300px" }}>
          <input
            type="text"
            placeholder="Rechercher un process..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
                width: "100%", 
                padding: "12px 16px", 
                borderRadius: "10px", 
                border: "1px solid #e2e8f0", 
                outline: "none",
                fontSize: "14px",
                background: "#f8fafc"
            }}
          />
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
            <tr>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Aperçu</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Nom</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Description</th>
              {isSuperAdmin && <th style={{ padding: "18px 24px", textAlign: "right", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                <td style={{ padding: "16px 24px" }}>
                  {p.image ? (
                    <img src={p.image} alt={p.nom} style={{ width: "50px", height: "50px", borderRadius: "10px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "50px", height: "50px", background: "#f1f5f9", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8", fontWeight: "bold" }}>ICON</div>
                  )}
                </td>
                <td style={{ padding: "16px 24px", fontWeight: "700", color: "var(--primary-bg)" }}>{p.nom}</td>
                <td style={{ padding: "16px 24px", color: "#475569", fontSize: "14px" }}>{p.description || "-"}</td>
                {isSuperAdmin && (
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button 
                            onClick={() => handleOpenEdit(p)} 
                            style={{ background: "#f1f5f9", color: "#2563eb", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                        >
                            Modifier
                        </button>
                        <button 
                            onClick={() => handleDelete(p.id)} 
                            style={{ background: "#fef2f2", color: "#ef4444", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                        >
                            Supprimer
                        </button>
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && isSuperAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 2000, backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", padding: "35px", borderRadius: "24px", width: "450px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "var(--primary-bg)" }}>{editingId ? "Modifier le Process" : "Créer un Process"}</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px", marginBottom: "30px" }}>Veuillez remplir les informations ci-dessous.</p>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>Nom du Process *</label>
              <input 
                name="nom" 
                value={form.nom} 
                onChange={(e) => setForm({ ...form, nom: e.target.value })} 
                placeholder="Ex: Assemblage Final"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px" }} 
              />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>Description</label>
              <textarea 
                name="description" 
                value={form.description} 
                onChange={(e) => setForm({ ...form, description: e.target.value })} 
                rows={3} 
                placeholder="Détails sur ce flux..."
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px", resize: "none" }} 
              />
            </div>
            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>Illustration (Image)</label>
              <div style={{ display: "flex", gap: "15px", alignItems: "center" }}>
                  {form.image && <img src={form.image} alt="preview" style={{width: "60px", height: "60px", objectFit: "cover", borderRadius: "12px"}} />}
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onloadend = () => {
                          setForm({ ...form, image: reader.result });
                        };
                        reader.readAsDataURL(file);
                      }
                    }} 
                    style={{ flex: 1, fontSize: "13px" }} 
                  />
              </div>
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ flex: 1, padding: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "white", cursor: "pointer", fontWeight: "600", color: "#64748b" }}>
                Annuler
              </button>
              <button 
                onClick={handleSave} 
                style={{ flex: 1, background: "#2563eb", color: "white", padding: "12px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 4px 6px rgba(37,99,235,0.2)" }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
