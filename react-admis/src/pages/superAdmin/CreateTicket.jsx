import { useEffect, useState } from "react";
import { createTicket } from "../../services/ticketService";
import { getOnlineExecuteurs } from "../../services/userService";
import { getMachines } from "../../services/machineService";
import { getSecteurs } from "../../services/secteurService";

const TYPE_EXECUTEUR_LIST = [
  "maintenance", "informatique", "qualite", "logistique", "process", "batiment", "production", "autre"
];

const TYPE_PANNE_LIST = [
  "electrique", "mecanique", "hydraulique", "pneumatique", "moteur",
  "capteur", "courroie", "roulement", "surchauffe", "vibration",
  "reseau", "internet", "wifi", "logiciel", "systeme",
  "base_de_donnees", "materiel_informatique", "imprimante", "scanner",
  "securite", "produit_non_conforme", "defaut_fabrication",
  "probleme_controle", "non_conformite", "audit_qualite", "test_qualite",
  "probleme_stock", "rupture_stock", "livraison_retard", "erreur_livraison",
  "transport", "reception", "arret_production", "ralentissement_production",
  "probleme_process", "mauvaise_configuration", "optimisation_process",
  "procedure", "eclairage", "climatisation", "chauffage", "plomberie",
  "porte", "fenetre", "electricite_batiment", "fuite_eau", "autre"
];

const TYPE_POSTE_LIST = ["MACHINE", "MATIERE", "QUALITEE"];

export default function CreateTicket() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [machines, setMachines] = useState([]);
  const [secteursList, setSecteursList] = useState([]);
  const [selectedMachine, setSelectedMachine] = useState(null);
  const [selectedMachineTop, setSelectedMachineTop] = useState(null);

  const [form, setForm] = useState({
    segment: "",
    equipement: "",
    numeroSerie: "",
    equipementArret: false,
    remarque: "",
    typePanne: "",
    description: "",
    typePoste: "MACHINE",
    secteurType: "",
    typeExecuteur: "maintenance",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedExecuteurId, setSelectedExecuteurId] = useState("");

  useEffect(() => {
    getMachines().then(res => setMachines(res.data)).catch(console.error);
    getSecteurs().then(res => setSecteursList(res.data)).catch(console.error);
  }, []);

  useEffect(() => {
    if (form.typeExecuteur) {
      getOnlineExecuteurs(form.typeExecuteur).then(res => {
        setOnlineUsers(res);
        setSelectedExecuteurId("");
      }).catch(() => setOnlineUsers([]));
    }
  }, [form.typeExecuteur]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        demandeurId: user.id,
        executeurId: selectedExecuteurId || null,
        machineId: selectedMachine?.id || null,
        statut: "OUVERTE",
        dateCreation: new Date().toISOString(),
        secteurType: form.typePoste === "MACHINE" ? selectedMachine?.secteur || form.segment : form.segment,
        equipement: form.typePoste === "MACHINE" ? selectedMachine?.nom || form.equipement : form.equipement,
        equipementArret: form.equipementArret
      };

      await createTicket(user.id, payload, selectedMachine?.id, selectedExecuteurId);
      setSuccess("Ticket créé avec succès !");
      setForm({
        segment: "",
        equipement: "",
        numeroSerie: "",
        equipementArret: false,
        remarque: "",
        typePanne: "",
        description: "",
        typePoste: "MACHINE",
        secteurType: "",
        typeExecuteur: "maintenance",
      });
      setSelectedMachine(null);
      setSelectedMachineTop(null);
      setSelectedExecuteurId("");
    } catch (e) {
      setError("Erreur technique lors de la création.");
    } finally {
      setLoading(false);
    }
  };

  const handleIAAnalysis = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setSuccess("Analyse de l'image en cours...");
    setError("");

    try {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = async () => {
        const base64Image = reader.result;
        const PYTHON_URL = "https://leoni-ia.onrender.com"; // Votre IA sur Render
        
        // 1. Prédire le type d'arrêt via la photo
        const responseCv = await fetch(`${PYTHON_URL}/predict-panne-image`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ image: base64Image })
        });
        const dataCv = await responseCv.json();

        if (dataCv.error) throw new Error(dataCv.error);

        if (dataCv.type_panne === "Image non reconnue") {
          setError("L'IA n'a pas pu identifier la panne avec certitude.");
        } else {
          setForm(prev => ({ ...prev, typePanne: dataCv.type_panne }));
          
          // 2. Prédire le service (exécuteur) idéal
          const responseExec = await fetch(`${PYTHON_URL}/predict-executeur`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type_panne: dataCv.type_panne, type_poste: form.typePoste })
          });
          const dataExec = await responseExec.json();
          
          setForm(prev => ({ 
            ...prev, 
            typeExecuteur: dataExec.type_executeur,
            remarque: `(IA: Confiance ${(dataCv.confidence * 100).toFixed(1)}%) ${dataExec.commentaire_ia}`
          }));
          
          setSuccess(`IA : Panne identifiée comme "${dataCv.type_panne.toUpperCase()}"`);
        }
      };
    } catch (err) {
      setError("Le serveur d'IA est injoignable (Port 5000).");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = { width: "100%", padding: "8px 12px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px" };
  const labelStyle = { display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" };
  const fieldWrapper = { marginBottom: "18px" };

  return (
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        
        <h1 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "30px", fontSize: "28px" }}>
          <span>📋</span> Créer un Ticket
        </h1>

        {success && <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>{success}</div>}
        {error && <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>{error}</div>}

        <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>

          {/* === BON DE TRAVAIL === */}
          <h3 style={{ color: "#1e40af", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px" }}>Bon de Travail</h3>
          
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={fieldWrapper}>
              <label style={labelStyle}>Segment / CC *</label>
              <select name="segment" value={form.segment} onChange={handleChange} style={inputStyle} required>
                <option value="">-- Sélectionner --</option>
                {secteursList.map(s => <option key={s.id} value={s.nom}>{s.nom}</option>)}
              </select>
            </div>
            
            <div style={fieldWrapper}>
              <label style={labelStyle}>Équipement (Votre machine) *</label>
              <select 
                name="equipement"
                value={selectedMachineTop?.id || ""} 
                onChange={(e) => {
                  const m = machines.find(mac => mac.id.toString() === e.target.value);
                  setSelectedMachineTop(m);
                  setForm({...form, equipement: m?.nom || ""});
                }} 
                style={inputStyle}
                required
              >
                <option value="">-- Choisir votre machine --</option>
                {machines.filter(m => !form.segment || m.secteur === form.segment).map(m => (
                  <option key={m.id} value={m.id}>{m.nom} ({m.codeMachine})</option>
                ))}
              </select>
            </div>

            <div style={fieldWrapper}>
              <label style={labelStyle}>N° Série / Position</label>
              <input name="numeroSerie" value={form.numeroSerie} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          {/* === DÉTAILS PANNE === */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px", marginTop: "10px" }}>
            <h3 style={{ color: "#1e40af", margin: 0 }}>Détails de la Panne</h3>
            <label style={{ 
              background: "#1e293b", color: "white", padding: "6px 12px", borderRadius: "20px", fontSize: "11px", fontWeight: "700", cursor: "pointer", display: "flex", alignItems: "center", gap: "5px" 
            }}>
              📷 ANALYSER PHOTO (IA)
              <input type="file" accept="image/*" onChange={handleIAAnalysis} style={{ display: "none" }} />
            </label>
          </div>
          
          <div style={fieldWrapper}>
            <label style={labelStyle}>Type d'Arrêt *</label>
            <select name="typePanne" value={form.typePanne} onChange={handleChange} style={inputStyle} required>
              <option value="">-- Sélectionner le type d'arrêt --</option>
              {TYPE_PANNE_LIST.map(tp => <option key={tp} value={tp}>{tp.toUpperCase()}</option>)}
            </select>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "none" }} required />
          </div>

          {/* === AFFECTATION === */}
          <h3 style={{ color: "#1e40af", borderBottom: "1px solid #e2e8f0", paddingBottom: "10px", marginBottom: "20px", marginTop: "10px" }}>Affectation</h3>

          <div style={fieldWrapper}>
            <label style={labelStyle}>Type Poste *</label>
            <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
              {TYPE_POSTE_LIST.map(tp => (
                <button
                  key={tp} type="button"
                  onClick={() => {
                    setForm({...form, typePoste: tp});
                    if (tp !== "MACHINE") setSelectedMachine(null);
                  }}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "700",
                    background: form.typePoste === tp ? "#3b82f6" : "#f8fafc", color: form.typePoste === tp ? "white" : "#64748b"
                  }}
                >
                  {tp}
                </button>
              ))}
            </div>
          </div>

          {form.typePoste === "MACHINE" && (
            <div style={{ ...fieldWrapper, background: "#f8fafc", padding: "15px", borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <label style={labelStyle}>Sélectionner la Machine en Panne *</label>
              <select 
                value={selectedMachine?.id || ""} 
                onChange={(e) => {
                  const m = machines.find(mac => mac.id.toString() === e.target.value);
                  if (m?.enArret) {
                    alert("Interdit : Cette machine est déjà signalée en arrêt. Vous ne pouvez pas créer un autre ticket.");
                    return;
                  }
                  setSelectedMachine(m);
                }} 
                style={{ ...inputStyle, border: selectedMachine ? "2px solid #3b82f6" : "1px solid #ccc" }}
                required
              >
                <option value="">-- Choisir la machine --</option>
                {machines.filter(m => !form.segment || m.secteur === form.segment).map(m => (
                  <option 
                    key={m.id} 
                    value={m.id} 
                    style={{ color: m.enArret ? "red" : "black" }}
                  >
                    {m.nom} {m.enArret ? "(DÉJÀ EN ARRÊT ⛔)" : ""}
                  </option>
                ))}
              </select>
              {selectedMachine?.enArret && (
                <p style={{ color: "red", fontSize: "11px", marginTop: "5px", fontWeight: "bold" }}>
                  Attention: Cette machine est déjà signalée en arrêt.
                </p>
              )}
            </div>
          )}

          <div style={fieldWrapper}>
            <label style={labelStyle}>Type Exécuteur *</label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {TYPE_EXECUTEUR_LIST.map(te => (
                <button
                  key={te} type="button"
                  onClick={() => setForm({...form, typeExecuteur: te})}
                  style={{
                    padding: "8px 16px", borderRadius: "20px", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "700",
                    background: form.typeExecuteur === te ? "#3b82f6" : "#f8fafc", color: form.typeExecuteur === te ? "white" : "#64748b"
                  }}
                >
                  {te.charAt(0).toUpperCase() + te.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>Priorité *</label>
            <div style={{ display: "flex", gap: "10px" }}>
              {["BASSE", "MOYENNE", "HAUTE"].map(p => (
                <button
                  key={p} type="button"
                  onClick={() => setForm({...form, priorite: p})}
                  style={{
                    flex: 1, padding: "8px", borderRadius: "10px", border: "1px solid #e2e8f0", fontSize: "12px", fontWeight: "700",
                    background: form.priorite === p ? (p === 'HAUTE' ? '#ef4444' : p === 'MOYENNE' ? '#f59e0b' : '#10b981') : '#f8fafc',
                    color: form.priorite === p ? "white" : "#64748b"
                  }}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "#eff6ff", padding: "20px", borderRadius: "10px", marginTop: "20px" }}>
            <p style={{ fontSize: "13px", fontWeight: "700", color: "#1e40af", marginBottom: "5px" }}>Assignation Ciblée (Optionnel)</p>
            <p style={{ fontSize: "12px", color: "#60a5fa", marginBottom: "15px" }}>Sélectionnez un technicien en ligne pour lui assigner directement ce ticket.</p>
            
            {onlineUsers.length > 0 ? (
              <select value={selectedExecuteurId} onChange={(e) => setSelectedExecuteurId(e.target.value)} style={inputStyle}>
                <option value="">-- Sélectionner un technicien en ligne --</option>
                {onlineUsers.map(u => <option key={u.id} value={u.id}>{u.nom}</option>)}
              </select>
            ) : (
              <div style={{ background: "#f8fafc", padding: "10px", borderRadius: "6px", textAlign: "center", color: "#94a3b8", fontSize: "12px" }}>
                Aucun membre de ce département n'est actuellement en ligne.
              </div>
            )}
          </div>

          <div style={{ ...fieldWrapper, marginTop: "20px" }}>
            <label style={labelStyle}>Remarque Finale</label>
            <input name="remarque" value={form.remarque} onChange={handleChange} style={inputStyle} placeholder="Observations éventuelles..." />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            style={{ width: "100%", padding: "12px", marginTop: "15px", borderRadius: "8px", background: "#3b82f6", color: "white", fontWeight: "700", border: "none", cursor: "pointer" }}
          >
            🚀 Créer le Ticket
          </button>

        </form>
      </div>
    </div>
  );
}
