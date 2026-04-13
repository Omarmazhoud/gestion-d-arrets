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
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Gestion des Fournisseurs</h1>
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nom: "", numeroTelephone: "", adresse: "", email: "", lieu: "" });
              setShowModal(true);
            }}
            style={{
              background: "#2563eb",
              color: "white",
              padding: "10px 20px",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer"
            }}
          >
            + Ajouter Fournisseur
          </button>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Rechercher..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "250px" }}
        />
      </div>

      <div style={{ marginTop: "25px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", overflowX: "auto" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", minWidth: "800px" }}>
          <thead style={{ background: "#f1f5f9" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>Nom</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Téléphone</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Adresse</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Email</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Lieu</th>
              {isSuperAdmin && <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(f => (
              <tr key={f.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px", fontWeight: "600" }}>{f.nom}</td>
                <td style={{ padding: "12px" }}>{f.numeroTelephone}</td>
                <td style={{ padding: "12px" }}>{f.adresse}</td>
                <td style={{ padding: "12px" }}>{f.email}</td>
                <td style={{ padding: "12px" }}>{f.lieu}</td>
                {isSuperAdmin && (
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button onClick={() => handleOpenEdit(f)} style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", marginRight: "10px" }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(f.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 6 : 5} style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  Aucun fournisseur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && isSuperAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "450px" }}>
            <h3>{editingId ? "Modifier Fournisseur" : "Ajouter Fournisseur"}</h3>
            <div style={{ marginBottom: "15px", marginTop: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Nom *</label>
              <input name="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Téléphone</label>
              <input name="numeroTelephone" value={form.numeroTelephone} onChange={(e) => setForm({ ...form, numeroTelephone: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Adresse</label>
              <input name="adresse" value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Email</label>
              <input type="email" name="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Lieu</label>
              <input name="lieu" value={form.lieu} onChange={(e) => setForm({ ...form, lieu: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setShowModal(false)} style={{ padding: "8px 15px", border: "1px solid #ccc", borderRadius: "6px", background: "white", cursor: "pointer" }}>Annuler</button>
              <button onClick={handleSave} style={{ background: "#2563eb", color: "white", padding: "8px 15px", border: "none", borderRadius: "6px", cursor: "pointer" }}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
