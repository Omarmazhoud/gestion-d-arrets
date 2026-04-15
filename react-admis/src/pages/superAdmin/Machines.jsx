import { useEffect, useState } from "react";
import { getMachines, createMachine, deleteMachine, updateMachine } from "../../services/machineService";
import { getProcesses } from "../../services/processService";
import { getSecteurs } from "../../services/secteurService";
import { 
  HiPlus, 
  HiCheckCircle, 
  HiExclamationCircle,
  HiPencil,
  HiTrash,
  HiQrcode,
  HiDownload
} from "react-icons/hi";
import { QRCodeCanvas } from "qrcode.react";

function Machines() {

  const [machines, setMachines] = useState([]);
  const [processesList, setProcessesList] = useState([]);
  const [secteursList, setSecteursList] = useState([]);
  const [search, setSearch] = useState("");
  const isSuperAdmin = JSON.parse(localStorage.getItem("user"))?.role === "SUPER_ADMIN";
  const [filterSecteur, setFilterSecteur] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [showQrModal, setShowQrModal] = useState(false);
  const [qrData, setQrData] = useState("");
  const [qrTitle, setQrTitle] = useState("");

  const handleDownloadQr = () => {
    const canvas = document.getElementById("qr-canvas");
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

  const [form, setForm] = useState({
    codeMachine: "",
    nom: "",
    process: "",
    secteur: "COUPE",
    typePoste: "MACHINE",
    enArret: false
  });

  useEffect(() => {
    loadMachines();
    loadDropdownDatas();
  }, []);

  const loadDropdownDatas = async () => {
    try {
      const pRes = await getProcesses();
      const sRes = await getSecteurs();
      setProcessesList(pRes.data);
      setSecteursList(sRes.data);
    } catch (e) {
      console.error("Error loading dropdowns", e);
    }
  };

  const loadMachines = async () => {
    const res = await getMachines();
    setMachines(res.data);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleOpenEdit = (m) => {
    setEditingId(m.id);
    setForm({
      codeMachine: m.codeMachine || "",
      nom: m.nom || "",
      process: m.process || "",
      secteur: m.secteur || "COUPE",
      typePoste: m.typePoste || "MACHINE",
      enArret: m.enArret || false
    });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      if (editingId) {
        await updateMachine(editingId, form);
      } else {
        await createMachine(form);
      }
      setShowModal(false);
      setEditingId(null);
      loadMachines();
      setForm({
        codeMachine: "",
        nom: "",
        process: "",
        secteur: "COUPE",
        typePoste: "MACHINE",
        enArret: false
      });
    } catch (error) {
      const msg = error?.response?.data?.error || error?.message || "Erreur inconnue";
      console.error("Machine save error:", error?.response?.data ?? error);
      alert("Erreur: " + msg);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Supprimer cette machine ?")) {
      await deleteMachine(id);
      loadMachines();
    }
  };

  const filteredMachines = machines.filter((m) => {
    const matchesSearch =
      m.nom?.toLowerCase().includes(search.toLowerCase()) ||
      m.codeMachine?.toLowerCase().includes(search.toLowerCase());

    const matchesSecteur =
      filterSecteur === "" || m.secteur === filterSecteur;

    return matchesSearch && matchesSecteur;
  });

  return (
    <div style={{ padding: "10px", background: "#f8fafc" }}>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
           <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>Gestion des Machines</h1>
           <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0 0" }}>Pilotez le parc machines de l'usine LEONI.</p>
        </div>

        {isSuperAdmin && (
        <button
          onClick={() => {
            setEditingId(null);
            setForm({
              codeMachine: "",
              nom: "",
              process: "",
              secteur: "COUPE",
              typePoste: "MACHINE",
              enArret: false
            });
            setShowModal(true);
          }}
          style={{
            background: "#2563eb",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: "10px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontWeight: "600",
            boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)"
          }}
        >
          <HiPlus size={20} /> Ajouter Machine
        </button>
        )}
      </div>

      {/* 🔎 RECHERCHE + FILTRE */}
      <div style={{
        marginBottom: "24px",
        display: "flex",
        gap: "12px",
        alignItems: "center",
        background: "white",
        padding: "16px",
        borderRadius: "12px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
      }}>
        <div style={{ position: "relative", flex: 1 }}>
           <input
            type="text"
            placeholder="Rechercher par nom ou code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              padding: "10px 12px 10px 40px",
              borderRadius: "8px",
              border: "1px solid #e2e8f0",
              width: "100%",
              outline: "none"
            }}
          />
          <div style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }}>
             {/* HiSearch can be added here if needed */}
          </div>
        </div>

        <select
          value={filterSecteur}
          onChange={(e) => setFilterSecteur(e.target.value)}
          style={{
            padding: "10px 12px",
            borderRadius: "8px",
            border: "1px solid #e2e8f0",
            background: "white",
            outline: "none",
            minWidth: "200px"
          }}
        >
          <option value="">Tous les secteurs</option>
          {secteursList.map(s => (
            <option key={s.id} value={s.nom}>{s.nom}</option>
          ))}
        </select>
      </div>

      {/* TABLE */}
      <div style={{
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        border: "1px solid #f1f5f9"
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead style={{ background: "#f8fafc", borderBottom: "1px solid #f1f5f9" }}>
            <tr>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Nom</th>
              <th style={thStyle}>Process</th>
              <th style={thStyle}>Secteur</th>
              <th style={thStyle}>Statut</th>
              <th style={thStyle}>Action</th>
            </tr>
          </thead>

          <tbody>
            {filteredMachines.map((m) => (
              <tr key={m.id} style={tableRowStyle}>
                <td style={tdStyle}><span style={codeBadge}>{m.codeMachine || "N/A"}</span></td>
                <td style={tdStyle}><strong>{m.nom}</strong></td>
                <td style={tdStyle}>{m.process}</td>
                <td style={tdStyle}>{m.secteur}</td>
                <td style={tdStyle}>
                  {m.enArret ? (
                    <div style={badgeStyle("#fee2e2", "#ef4444")}>
                      <HiExclamationCircle /> En arrêt
                    </div>
                  ) : (
                    <div style={badgeStyle("#dcfce7", "#22c55e")}>
                      <HiCheckCircle /> Active
                    </div>
                  )}
                </td>
                <td style={tdStyle}>
                  {isSuperAdmin ? (
                    <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                      <button
                        onClick={() => handleOpenEdit(m)}
                        style={btnIconStyle("#2563eb")}
                        title="Modifier"
                      >
                        <HiPencil />
                      </button>
                      <button
                        onClick={() => handleDelete(m.id)}
                        style={btnIconStyle("#ef4444")}
                        title="Supprimer"
                      >
                        <HiTrash />
                      </button>
                      <button
                        onClick={() => {
                          setQrData(JSON.stringify({ type: "machine", id: m.id, nom: m.nom }));
                          setQrTitle(`Machine: ${m.nom}`);
                          setShowQrModal(true);
                        }}
                        style={btnIconStyle("#10b981")}
                        title="Générer QR Code"
                      >
                        <HiQrcode />
                      </button>
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8", fontSize: "12px", fontStyle: "italic" }}>Lecture seule</span>
                  )}
                </td>
              </tr>
            ))}

            {filteredMachines.length === 0 && (
              <tr>
                <td colSpan="6" style={{ padding: "40px", textAlign: "center", color: "#94a3b8" }}>
                  Aucune machine trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {showModal && (
        <div style={modalOverlay}>
          <div style={modalContent}>
            <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "700" }}>{editingId ? "Modifier Machine" : "Ajouter Machine"}</h3>

            <div style={inputGroup}>
              <label style={labelStyle}>Code Machine</label>
              <input
                name="codeMachine"
                placeholder="Ex: M123"
                value={form.codeMachine}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Nom Machine</label>
              <input
                name="nom"
                placeholder="Nom de la machine"
                value={form.nom}
                onChange={handleChange}
                style={inputStyle}
              />
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Process</label>
              <select
                name="process"
                value={form.process}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Sélectionner Process</option>
                {processesList.map(p => (
                  <option key={p.id} value={p.nom}>{p.nom}</option>
                ))}
              </select>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Secteur</label>
              <select
                name="secteur"
                value={form.secteur}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="">Sélectionner secteur</option>
                {secteursList.map(s => (
                  <option key={s.id} value={s.nom}>{s.nom}</option>
                ))}
              </select>
            </div>

            <div style={inputGroup}>
              <label style={labelStyle}>Type Poste</label>
              <select
                name="typePoste"
                value={form.typePoste}
                onChange={handleChange}
                style={inputStyle}
              >
                <option value="MACHINE">MACHINE</option>
                <option value="matiere">matiere</option>
                <option value="qualitee">qualitee</option>
              </select>
            </div>

            <div style={{ marginBottom: "24px", display: "flex", alignItems: "center", gap: "12px", background: form.enArret ? "#fef2f2" : "#f0fdf4", padding: "12px", borderRadius: "8px" }}>
              <input 
                type="checkbox" 
                name="enArret" 
                checked={form.enArret} 
                onChange={handleChange}
                id="enArretCheckbox"
                style={{ width: "18px", height: "18px" }}
              />
              <label htmlFor="enArretCheckbox" style={{ cursor: "pointer", color: form.enArret ? "#ef4444" : "#22c55e", fontWeight: "700", fontSize: "14px" }}>
                {form.enArret ? "Signalée en ARRÊT" : "Machine en SERVICE"}
              </label>
            </div>
             
            <div style={{ display: "flex", gap: "12px" }}>
              <button 
                onClick={() => {
                  setShowModal(false);
                  setEditingId(null);
                }}
                style={{ flex: 1, padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", fontWeight: "600", cursor: "pointer" }}
              >
                Annuler
              </button>
              <button 
                onClick={handleSave} 
                style={{ flex: 1, background: "#2563eb", color: "white", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer" }}
              >
                {editingId ? "Enregistrer" : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL QR CODE */}
      {showQrModal && (
        <div style={modalOverlay}>
          <div style={{...modalContent, width: "350px", textAlign: "center"}}>
            <h3 style={{ marginBottom: "20px", fontSize: "18px", fontWeight: "700" }}>{qrTitle}</h3>
            
            <div style={{ display: "flex", justifyContent: "center", padding: "20px", background: "#f8fafc", borderRadius: "12px", marginBottom: "20px" }}>
              <QRCodeCanvas 
                id="qr-canvas"
                value={qrData} 
                size={200} 
                level={"H"}
              />
            </div>
            
            <div style={{ display: "flex", gap: "12px", flexDirection: "column" }}>
              <button 
                onClick={handleDownloadQr} 
                style={{ background: "#10b981", color: "white", padding: "12px", border: "none", borderRadius: "10px", fontWeight: "600", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}
              >
                <HiDownload size={18} /> Télécharger / Imprimer
              </button>
              <button 
                onClick={() => setShowQrModal(false)}
                style={{ padding: "12px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", fontWeight: "600", cursor: "pointer" }}
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

/* ===== STYLES ===== */

const thStyle = {
  padding: "16px 12px",
  fontSize: "12px",
  fontWeight: "700",
  color: "#64748b",
  textTransform: "uppercase",
  letterSpacing: "1px",
};

const tableRowStyle = {
  borderBottom: "1px solid #f1f5f9",
  transition: "background 0.2s",
};

const tdStyle = {
  padding: "16px 12px",
  fontSize: "14px",
  color: "#334155",
  textAlign: "center"
};

const codeBadge = {
  background: "#f1f5f9",
  padding: "4px 8px",
  borderRadius: "6px",
  fontFamily: "monospace",
  fontWeight: "600",
  fontSize: "13px",
  color: "#475569",
};

const badgeStyle = (bg, color) => ({
  background: bg,
  color: color,
  padding: "6px 12px",
  borderRadius: "30px",
  fontSize: "11px",
  fontWeight: "700",
  display: "inline-flex",
  alignItems: "center",
  gap: "6px",
  textTransform: "uppercase",
  letterSpacing: "0.5px",
  margin: "0 auto"
});

const btnIconStyle = (color) => ({
  background: `${color}15`,
  color: color,
  border: "none",
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  cursor: "pointer",
  fontSize: "18px",
  transition: "0.2s",
});

const modalOverlay = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.5)",
  backdropFilter: "blur(4px)",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  zIndex: 1000,
};

const modalContent = {
  background: "white",
  padding: "32px",
  borderRadius: "20px",
  width: "450px",
  boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
};

const inputGroup = {
  marginBottom: "16px",
};

const labelStyle = {
  display: "block",
  fontSize: "12px",
  fontWeight: "700",
  color: "#64748b",
  marginBottom: "6px",
  textTransform: "uppercase",
};

const inputStyle = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "8px",
  border: "1px solid #e2e8f0",
  outline: "none",
  fontSize: "14px",
};

export default Machines;
