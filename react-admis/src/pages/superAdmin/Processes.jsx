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

  // Role check for read-only (optional if Admin can view this page)
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Gestion des Processes</h1>
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ nom: "", description: "", image: "" });
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
            + Ajouter Process
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
              <th style={{ padding: "12px", textAlign: "left" }}>Image</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Nom du Process</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Description</th>
              {isSuperAdmin && <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px" }}>
                  {p.image ? (
                    <img src={p.image} alt={p.nom} style={{ width: "40px", height: "40px", borderRadius: "6px", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "40px", height: "40px", background: "#e2e8f0", borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "10px", color: "#94a3b8" }}>N/A</div>
                  )}
                </td>
                <td style={{ padding: "12px", fontWeight: "600" }}>{p.nom}</td>
                <td style={{ padding: "12px" }}>{p.description || "-"}</td>
                {isSuperAdmin && (
                  <td style={{ padding: "12px", textAlign: "right" }}>
                    <button onClick={() => handleOpenEdit(p)} style={{ background: "#2563eb", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", marginRight: "10px" }}>
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(p.id)} style={{ background: "#ef4444", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer" }}>
                      Supprimer
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={isSuperAdmin ? 4 : 3} style={{ padding: "20px", textAlign: "center" }}>
                  Aucun process trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && isSuperAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "400px" }}>
            <h3>{editingId ? "Modifier Process" : "Ajouter Process"}</h3>
            <div style={{ marginBottom: "15px", marginTop: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Nom *</label>
              <input name="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>
            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Description</label>
              <textarea name="description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc", resize: "vertical" }} />
            </div>
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Image (Fichier)</label>
              {form.image && <div style={{marginBottom: "10px"}}><img src={form.image} alt="preview" style={{width: "60px", height: "60px", objectFit: "cover", borderRadius: "6px"}} /></div>}
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
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} 
              />
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
