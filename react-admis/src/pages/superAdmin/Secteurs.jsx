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
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce secteur ?")) {
      try {
        await deleteSecteur(id);
        loadSecteurs();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filtered = secteurs.filter(s => s.nom.toLowerCase().includes(search.toLowerCase()));

  // Role check for read-only
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Gestion des Secteurs</h1>
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nom: "", nomChef: "", matricule: "" });
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
            + Ajouter Secteur
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

      <div style={{ marginTop: "25px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f5f9" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>Nom du Secteur</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Chef du Secteur</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Matricule</th>
              {isSuperAdmin && <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px" }}>{s.nom}</td>
                <td style={{ padding: "12px" }}>{s.nomChef}</td>
                <td style={{ padding: "12px" }}>{s.matricule}</td>
                {isSuperAdmin && (
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button onClick={() => handleOpenEdit(s)} style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", marginRight: "10px" }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(s.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 4 : 3} style={{ padding: "20px", textAlign: "center" }}>
                  Aucun secteur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && isSuperAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "400px" }}>
            <h3>{editingId ? "Modifier Secteur" : "Ajouter Secteur"}</h3>
            <div style={{ marginBottom: "15px", marginTop: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Nom *</label>
              <input name="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Chef du Secteur</label>
              <input name="nomChef" value={form.nomChef} onChange={(e) => setForm({ ...form, nomChef: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Matricule</label>
              <input name="matricule" value={form.matricule} onChange={(e) => setForm({ ...form, matricule: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
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
