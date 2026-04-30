import { useEffect, useState } from "react";
import { getSecteurs, createSecteur, updateSecteur, deleteSecteur } from "../../services/secteurService";

export default function Secteurs() {
  const [secteurs, setSecteurs] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nom: "", nomChef: "", matricule: "" });

  useEffect(() => {
    loadSecteurs();
  }, []);

  const loadSecteurs = async () => {
    try {
      const res = await getSecteurs();
      setSecteurs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (s) => {
    setEditingId(s.id);
    setForm({ nom: s.nom || "", nomChef: s.nomChef || "", matricule: s.matricule || "" });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim()) {
      alert("Le nom est obligatoire");
      return;
    }
    try {
      if (editingId) {
        await updateSecteur(editingId, form);
      } else {
        await createSecteur(form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ nom: "", nomChef: "", matricule: "" });
      loadSecteurs();
    } catch (error) {
      alert(error.response?.data || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce segment ?")) {
      try {
        await deleteSecteur(id);
        loadSecteurs();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filtered = secteurs.filter(s => s.nom.toLowerCase().includes(search.toLowerCase()));
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div style={{ padding: "30px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Gestion des Segments</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Supervisez les différentes zones de l'usine et leurs responsables.</p>
        </div>
        
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nom: "", nomChef: "", matricule: "" });
              setShowModal(true);
            }}
            style={{
              background: "linear-gradient(135deg, #0ea5e9, #0284c7)",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 10px 15px -3px rgba(14, 165, 233, 0.3)",
              transition: "transform 0.2s"
            }}
          >
            + Nouveau Segment
          </button>
        )}
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Rechercher un segment..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ 
              width: "300px", 
              padding: "12px 16px", 
              borderRadius: "10px", 
              border: "1px solid #e2e8f0", 
              outline: "none",
              fontSize: "14px",
              background: "#f8fafc"
          }}
        />
      </div>

      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
            <tr>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Nom du Segment</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Responsable (Chef)</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Matricule</th>
              {isSuperAdmin && <th style={{ padding: "18px 24px", textAlign: "right", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#0ea5e9" }}></div>
                    <span style={{ fontWeight: "700", color: "var(--primary-bg)" }}>{s.nom}</span>
                  </div>
                </td>
                <td style={{ padding: "16px 24px", color: "#475569", fontWeight: "500" }}>{s.nomChef || "Non défini"}</td>
                <td style={{ padding: "16px 24px", color: "#64748b", fontFamily: "monospace", fontSize: "14px" }}>{s.matricule || "-"}</td>
                {isSuperAdmin && (
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button 
                            onClick={() => handleOpenEdit(s)} 
                            style={{ background: "#f1f5f9", color: "#0284c7", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                        >
                            Modifier
                        </button>
                        <button 
                            onClick={() => handleDelete(s.id)} 
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
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "var(--primary-bg)" }}>{editingId ? "Modifier le Segment" : "Nouveau Segment"}</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px", marginBottom: "30px" }}>Veuillez configurer la zone de production.</p>
            
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>Désignation du Segment *</label>
              <input 
                name="nom" 
                value={form.nom} 
                onChange={(e) => setForm({ ...form, nom: e.target.value })} 
                placeholder="Ex: Section B1"
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px" }} 
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>Responsable (Chef)</label>
              <input 
                name="nomChef" 
                value={form.nomChef} 
                onChange={(e) => setForm({ ...form, nomChef: e.target.value })} 
                placeholder="Nom du responsable..."
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px" }} 
              />
            </div>

            <div style={{ marginBottom: "30px" }}>
              <label style={{ display: "block", fontSize: "12px", fontWeight: "700", color: "#475569", marginBottom: "8px", textTransform: "uppercase" }}>Matricule Responsable</label>
              <input 
                name="matricule" 
                value={form.matricule} 
                onChange={(e) => setForm({ ...form, matricule: e.target.value })} 
                placeholder="Code matricule..."
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", fontSize: "15px" }} 
              />
            </div>

            <div style={{ display: "flex", gap: "15px" }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ flex: 1, padding: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "white", cursor: "pointer", fontWeight: "600", color: "#64748b" }}>
                Annuler
              </button>
              <button 
                onClick={handleSave} 
                style={{ flex: 1, background: "#0ea5e9", color: "white", padding: "12px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 4px 6px rgba(14,165,233,0.2)" }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
