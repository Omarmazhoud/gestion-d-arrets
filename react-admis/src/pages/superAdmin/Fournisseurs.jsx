import { useEffect, useState } from "react";
import { getFournisseurs, createFournisseur, updateFournisseur, deleteFournisseur } from "../../services/fournisseurService";

export default function Fournisseurs() {
  const [fournisseurs, setFournisseurs] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ nom: "", numeroTelephone: "", adresse: "", email: "", lieu: "" });

  useEffect(() => {
    loadFournisseurs();
  }, []);

  const loadFournisseurs = async () => {
    try {
      const res = await getFournisseurs();
      setFournisseurs(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (f) => {
    setEditingId(f.id);
    setForm({ 
      nom: f.nom || "", 
      numeroTelephone: f.numeroTelephone || "", 
      adresse: f.adresse || "", 
      email: f.email || "", 
      lieu: f.lieu || "" 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.nom.trim()) {
      alert("Le nom est obligatoire");
      return;
    }
    try {
      if (editingId) {
        await updateFournisseur(editingId, form);
      } else {
        await createFournisseur(form);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ nom: "", numeroTelephone: "", adresse: "", email: "", lieu: "" });
      loadFournisseurs();
    } catch (error) {
      alert(error.response?.data || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce fournisseur ?")) {
      try {
        await deleteFournisseur(id);
        loadFournisseurs();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filtered = fournisseurs.filter(f => f.nom.toLowerCase().includes(search.toLowerCase()));
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div style={{ padding: "30px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Annuaire Fournisseurs</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Gérez vos contacts et partenaires de maintenance.</p>
        </div>
        
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nom: "", numeroTelephone: "", adresse: "", email: "", lieu: "" });
              setShowModal(true);
            }}
            style={{
              background: "linear-gradient(135deg, #6366f1, #4f46e5)",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              boxShadow: "0 10px 15px -3px rgba(99, 102, 241, 0.3)",
              transition: "transform 0.2s"
            }}
          >
            + Ajouter Fournisseur
          </button>
        )}
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "25px" }}>
        <input
          type="text"
          placeholder="Rechercher par nom..."
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

      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "1000px" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
            <tr>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Nom / Entreprise</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Contact</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Email</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Lieu</th>
              {isSuperAdmin && <th style={{ padding: "18px 24px", textAlign: "right", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ fontWeight: "700", color: "var(--primary-bg)", fontSize: "15px" }}>{f.nom}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{f.adresse || "Pas d'adresse"}</div>
                </td>
                <td style={{ padding: "16px 24px", color: "#475569", fontWeight: "600" }}>{f.numeroTelephone || "-"}</td>
                <td style={{ padding: "16px 24px", color: "#2563eb", textDecoration: "underline", fontSize: "14px" }}>{f.email || "-"}</td>
                <td style={{ padding: "16px 24px" }}>
                  <span style={{ padding: "4px 10px", background: "#f1f5f9", borderRadius: "20px", fontSize: "12px", color: "#64748b", border: "1px solid #e2e8f0" }}>{f.lieu || "N/A"}</span>
                </td>
                {isSuperAdmin && (
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                        <button 
                            onClick={() => handleOpenEdit(f)} 
                            style={{ background: "#f1f5f9", color: "#6366f1", border: "none", padding: "8px 16px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                        >
                            Modifier
                        </button>
                        <button 
                            onClick={() => handleDelete(f.id)} 
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
          <div style={{ background: "white", padding: "35px", borderRadius: "24px", width: "500px", boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "var(--primary-bg)" }}>{editingId ? "Modifier Fournisseur" : "Nouveau Fournisseur"}</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px", marginBottom: "30px" }}>Détails de contact du partenaire.</p>
            
            <div className="row g-3">
                <div className="col-12">
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Nom complet / Entreprise *</label>
                <input 
                    value={form.nom} 
                    onChange={(e) => setForm({ ...form, nom: e.target.value })} 
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }} 
                />
                </div>
                <div className="col-md-6">
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Téléphone</label>
                <input 
                    value={form.numeroTelephone} 
                    onChange={(e) => setForm({ ...form, numeroTelephone: e.target.value })} 
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }} 
                />
                </div>
                <div className="col-md-6">
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Lieu / Ville</label>
                <input 
                    value={form.lieu} 
                    onChange={(e) => setForm({ ...form, lieu: e.target.value })} 
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }} 
                />
                </div>
                <div className="col-12">
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Email Professionnel</label>
                <input 
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm({ ...form, email: e.target.value })} 
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }} 
                />
                </div>
                <div className="col-12">
                <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Adresse Physique</label>
                <textarea 
                    value={form.adresse} 
                    onChange={(e) => setForm({ ...form, adresse: e.target.value })} 
                    rows={2}
                    style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", resize: "none" }} 
                />
                </div>
            </div>

            <div style={{ display: "flex", gap: "15px", marginTop: "30px" }}>
              <button 
                onClick={() => setShowModal(false)} 
                style={{ flex: 1, padding: "12px", border: "1px solid #e2e8f0", borderRadius: "12px", background: "white", cursor: "pointer", fontWeight: "600", color: "#64748b" }}>
                Annuler
              </button>
              <button 
                onClick={handleSave} 
                style={{ flex: 1, background: "#6366f1", color: "white", padding: "12px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 4px 6px rgba(99,102,241,0.2)" }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
