import { useEffect, useState } from "react";
import { getPiecesRechange, createPieceRechange, updatePieceRechange, deletePieceRechange } from "../../services/pieceRechangeService";
import { getFournisseurs } from "../../services/fournisseurService";
import { HiQrcode, HiDownload, HiPlus, HiSearch } from "react-icons/hi";
import { QRCodeCanvas } from "qrcode.react";

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

  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState("");
  const [qrTitle, setQrTitle] = useState("");

  const handleDownloadQr = () => {
    const canvas = document.getElementById("qr-canvas-piece");
    if (canvas) {
      const pngUrl = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream");
      let downloadLink = document.createElement("a");
      downloadLink.href = pngUrl;
      downloadLink.download = `${qrTitle.replace(/\s+/g, '_')}_QR.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    }
  };

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
    <div style={{ padding: "30px", background: "#f1f5f9", minHeight: "100vh", fontFamily: "'Inter', sans-serif" }}>
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <div>
          <h1 style={{ fontSize: "28px", fontWeight: "800", color: "#1e293b", margin: 0 }}>Stock de Pièces</h1>
          <p style={{ color: "#64748b", margin: "5px 0 0 0" }}>Inventaire des composants critiques pour la maintenance.</p>
        </div>
        
        {isSuperAdmin && (
          <button
            onClick={() => {
              setEditingId(null);
              setForm({ reference: "", nom: "", stock: 0, fournisseurId: "" });
              setShowModal(true);
            }}
            style={{
              background: "linear-gradient(135deg, #10b981, #059669)",
              color: "white",
              padding: "12px 24px",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "8px",
              boxShadow: "0 10px 15px -3px rgba(16, 185, 129, 0.3)",
              transition: "transform 0.2s"
            }}
          >
            <HiPlus size={20} /> Nouvelle Pièce
          </button>
        )}
      </div>

      <div style={{ background: "white", padding: "24px", borderRadius: "16px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)", marginBottom: "25px", display: "flex", gap: "20px", alignItems: "center" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: "400px" }}>
          <HiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Référence ou nom..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ 
                width: "100%", 
                padding: "12px 12px 12px 40px", 
                borderRadius: "10px", 
                border: "1px solid #e2e8f0", 
                outline: "none",
                fontSize: "14px",
                background: "#f8fafc"
            }}
          />
        </div>
        <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>
          Total : {filtered.length} articles
        </div>
      </div>

      <div style={{ background: "white", borderRadius: "16px", boxShadow: "0 10px 25px rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "2px solid #f1f5f9" }}>
            <tr>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Référence</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Désignation Pièce</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Stock</th>
              <th style={{ padding: "18px 24px", textAlign: "left", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Fournisseur</th>
              {isSuperAdmin && <th style={{ padding: "18px 24px", textAlign: "right", color: "#64748b", fontSize: "12px", fontWeight: "700", textTransform: "uppercase" }}>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map(p => (
              <tr key={p.id} style={{ borderBottom: "1px solid #f1f5f9", transition: "background 0.2s" }}>
                <td style={{ padding: "16px 24px", color: "#64748b", fontFamily: "monospace", fontWeight: "700" }}>{p.reference}</td>
                <td style={{ padding: "16px 24px", color: "#0f172a", fontWeight: "700" }}>{p.nom}</td>
                <td style={{ padding: "16px 24px" }}>
                  <div style={{ 
                    padding: "6px 12px", 
                    borderRadius: "8px", 
                    background: p.stock >= 5 ? (p.stock > 10 ? "#dcfce7" : "#fef08a") : "#fee2e2",
                    color: p.stock >= 5 ? (p.stock > 10 ? "#166534" : "#854d0e") : "#991b1b",
                    fontSize: "13px",
                    fontWeight: "800",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px"
                  }}>
                    {p.stock <= 5 && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#ef4444" }}></span>}
                    {p.stock} unités
                  </div>
                </td>
                <td style={{ padding: "16px 24px", color: "#475569" }}>
                  {p.fournisseur ? p.fournisseur.nom : <span style={{color: "#cbd5e1", fontStyle: "italic"}}>Non lié</span>}
                </td>
                {isSuperAdmin && (
                  <td style={{ padding: "16px 24px", textAlign: "right" }}>
                    <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                            onClick={() => {
                                setQrData(JSON.stringify({ type: "piece", nom: p.nom, reference: p.reference }));
                                setQrTitle(`QR: ${p.nom}`);
                                setShowQrModal(true);
                            }} 
                            style={{ background: "#f1f5f9", color: "#10b981", border: "none", padding: "8px", borderRadius: "8px", cursor: "pointer" }}
                            title="Code QR"
                        >
                            <HiQrcode size={18} />
                        </button>
                        <button 
                            onClick={() => handleOpenEdit(p)} 
                            style={{ background: "#f1f5f9", color: "#2563eb", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
                        >
                            Modifier
                        </button>
                        <button 
                            onClick={() => handleDelete(p.id)} 
                            style={{ background: "#fef2f2", color: "#ef4444", border: "none", padding: "8px 14px", borderRadius: "8px", cursor: "pointer", fontWeight: "600", fontSize: "13px" }}
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
            <h3 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#0f172a" }}>{editingId ? "Modifier Article" : "Nouvel Article"}</h3>
            <p style={{ color: "#64748b", fontSize: "14px", marginTop: "5px", marginBottom: "30px" }}>Gestion d'inventaire pièce de rechange.</p>
            
            <div className="row g-3">
                <div className="col-12">
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Référence Interne *</label>
                    <input value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} placeholder="Ex: PR-2024-001" style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }} />
                </div>
                <div className="col-12">
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Désignation Pièce *</label>
                    <input value={form.nom} onChange={(e) => setForm({ ...form, nom: e.target.value })} placeholder="Nom technique..." style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }} />
                </div>
                <div className="col-md-6">
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Quantité en Stock</label>
                    <input type="number" min="0" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none" }} />
                </div>
                <div className="col-md-6">
                    <label style={{ display: "block", fontSize: "11px", fontWeight: "800", color: "#475569", marginBottom: "6px", textTransform: "uppercase" }}>Fournisseur Principal</label>
                    <select value={form.fournisseurId} onChange={(e) => setForm({ ...form, fournisseurId: e.target.value })} style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", outline: "none", background: "white" }}>
                        <option value="">-- Sélectionner --</option>
                        {fournisseurs.map(f => <option key={f.id} value={f.id}>{f.nom}</option>)}
                    </select>
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
                style={{ flex: 1, background: "#10b981", color: "white", padding: "12px", border: "none", borderRadius: "12px", cursor: "pointer", fontWeight: "600", boxShadow: "0 4px 6px rgba(16,185,129,0.2)" }}>
                Enregistrer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR CODE */}
      {showQrModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.7)", backdropFilter: "blur(8px)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: "40px", borderRadius: "28px", width: "400px", textAlign: "center", boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)" }}>
            <h3 style={{ marginBottom: "25px", fontSize: "20px", fontWeight: "800", color: "#0f172a" }}>{qrTitle}</h3>
            
            <div style={{ display: "flex", justifyContent: "center", padding: "25px", background: "#f8fafc", borderRadius: "20px", marginBottom: "25px", border: "2px solid #f1f5f9" }}>
              <QRCodeCanvas 
                id="qr-canvas-piece"
                value={qrData} 
                size={220} 
                level={"H"}
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button 
                onClick={handleDownloadQr} 
                style={{ background: "#0f172a", color: "white", padding: "14px", border: "none", borderRadius: "14px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "10px" }}
              >
                <HiDownload size={20} /> Télécharger Image QR
              </button>
              <button 
                onClick={() => setShowQrModal(false)}
                style={{ padding: "14px", borderRadius: "14px", border: "1px solid #e2e8f0", background: "white", fontWeight: "700", cursor: "pointer", color: "#64748b" }}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
