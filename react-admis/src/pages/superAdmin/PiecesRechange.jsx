import { useEffect, useState } from "react";
import { getPiecesRechange, createPieceRechange, updatePieceRechange, deletePieceRechange } from "../../services/pieceRechangeService";
import { getFournisseurs } from "../../services/fournisseurService";

export default function PiecesRechange() {
  const [pieces, setPieces] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [form, setForm] = useState({ 
    reference: "", 
    nom: "", 
    stock: 0, 
    fournisseurId: "" 
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const resPieces = await getPiecesRechange();
      setPieces(resPieces.data);
      const resFournisseurs = await getFournisseurs();
      setFournisseurs(resFournisseurs.data);
    } catch (e) {
      console.error(e);
    }
  };

  const handleOpenEdit = (p) => {
    setEditingId(p.id);
    setForm({ 
      reference: p.reference || "", 
      nom: p.nom || "", 
      stock: p.stock || 0, 
      fournisseurId: p.fournisseur ? p.fournisseur.id : "" 
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    if (!form.reference.trim() || !form.nom.trim()) {
      alert("La référence et le nom sont obligatoires");
      return;
    }
    
    // Construct payload matching Spring Boot entity structure
    const payload = {
      reference: form.reference,
      nom: form.nom,
      stock: parseInt(form.stock, 10) || 0,
      fournisseur: form.fournisseurId ? { id: form.fournisseurId } : null
    };

    try {
      if (editingId) {
        await updatePieceRechange(editingId, payload);
      } else {
        await createPieceRechange(payload);
      }
      setShowModal(false);
      setEditingId(null);
      setForm({ reference: "", nom: "", stock: 0, fournisseurId: "" });
      loadData();
    } catch (error) {
      alert(error.response?.data || "Erreur lors de l'enregistrement");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cette pièce ?")) {
      try {
        await deletePieceRechange(id);
        loadData();
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const filtered = pieces.filter(p => 
    p.nom.toLowerCase().includes(search.toLowerCase()) || 
    p.reference.toLowerCase().includes(search.toLowerCase())
  );

  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  return (
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h1>Pièces de Rechange</h1>
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ reference: "", nom: "", stock: 0, fournisseurId: "" });
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
            + Ajouter Pièce
          </button>
        )}
      </div>

      <div style={{ marginTop: "20px" }}>
        <input
          type="text"
          placeholder="Rechercher (Nom ou Réf)..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", width: "250px" }}
        />
      </div>

      <div style={{ marginTop: "25px", background: "white", padding: "20px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f1f5f9" }}>
            <tr>
              <th style={{ padding: "12px", textAlign: "left" }}>Référence</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Nom</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Stock</th>
              <th style={{ padding: "12px", textAlign: "left" }}>Fournisseur</th>
              {isSuperAdmin && <th style={{ padding: "12px", textAlign: "right" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                <td style={{ padding: "12px", fontWeight: "600", color: "#475569" }}>{p.reference}</td>
                <td style={{ padding: "12px", fontWeight: "600" }}>{p.nom}</td>
                <td style={{ padding: "12px" }}>
                  <span style={{ 
                    padding: "4px 8px", 
                    borderRadius: "12px", 
                    background: p.stock >= 5 ? (p.stock > 10 ? "#dcfce7" : "#fef08a") : "#fee2e2",
                    color: p.stock >= 5 ? (p.stock > 10 ? "#166534" : "#854d0e") : "#991b1b",
                    fontSize: "13px",
                    fontWeight: "600",
                    display: "inline-block",
                    minWidth: "30px",
                    textAlign: "center"
                  }}>
                    {p.stock}
                  </span>
                </td>
                <td style={{ padding: "12px" }}>{p.fournisseur ? p.fournisseur.nom : <span style={{color: "#94a3b8", fontStyle: "italic"}}>Non assigné</span>}</td>
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
                <td colSpan={isSuperAdmin ? 5 : 4} style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  Aucune pièce trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && isSuperAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "450px" }}>
            <h3>{editingId ? "Modifier Pièce" : "Ajouter Pièce"}</h3>
            
            <div style={{ marginBottom: "15px", marginTop: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Référence *</label>
              <input name="reference" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Nom *</label>
              <input name="nom" value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>

            <div style={{ marginBottom: "15px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Stock</label>
              <input type="number" min="0" name="stock" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }} />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", fontSize: "12px", color: "#666", marginBottom: "5px" }}>Fournisseur</label>
              <select 
                value={form.fournisseurId} 
                onChange={(e) => setForm({ ...form, fournisseurId: e.target.value })}
                style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
              >
                <option value="">-- Sans Fournisseur --</option>
                {fournisseurs.map(f => (
                  <option key={f.id} value={f.id}>{f.nom} ({f.lieu})</option>
                ))}
              </select>
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
