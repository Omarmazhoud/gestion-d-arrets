import { useEffect, useState } from "react";
import { createTicket } from "../../services/ticketService";
import { getOnlineExecuteurs } from "../../services/userService";
import { getMachines } from "../../services/machineService";
import { getSecteurs } from "../../services/secteurService";

const TYPE_EXECUTEUR_LIST = [
  "maintenance", "informatique", "qualite",
  "logistique", "process", "batiment", "production", "autre"
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

const TYPE_POSTE_LIST = ["MACHINE", "matiere", "qualitee"];

export default function CreateTicket() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [machines, setMachines] = useState([]);
  const [secteursList, setSecteursList] = useState([]);
  const [machineSearch, setMachineSearch] = useState("");
  const [selectedMachine, setSelectedMachine] = useState(null);

  const [form, setForm] = useState({
    segment: "",
    equipement: "",
    numeroSerie: "",
    equipementArret: false,
    dateArret: "",
    heureArret: "",
    remarque: "",
    typePanne: "",
    description: "",
    typePoste: "",
    secteurType: "",
    typeExecuteur: "",
  });

  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getMachines().then(res => setMachines(res.data)).catch(console.error);
    getSecteurs().then(res => setSecteursList(res.data)).catch(console.error);
  }, []);

  const [onlineUsers, setOnlineUsers] = useState([]);
  const [selectedExecuteurId, setSelectedExecuteurId] = useState("");

  useEffect(() => {
    if (form.typeExecuteur) {
      getOnlineExecuteurs(form.typeExecuteur).then(res => {
        setOnlineUsers(res);
        setSelectedExecuteurId(""); // Reset whenever type changes
      }).catch(console.error);
    } else {
      setOnlineUsers([]);
      setSelectedExecuteurId("");
    }
  }, [form.typeExecuteur]);



  const filteredMachines = machines.filter(m =>
    m.nom.toLowerCase().includes(machineSearch.toLowerCase())
  );

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
    if (name === "typePoste" && value !== "MACHINE") {
      setSelectedMachine(null);
      setMachineSearch("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!form.typePanne || !form.description || !form.typePoste || !form.typeExecuteur) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    let dateArretISO = null;
    let heureArretFinal = null;

    if (form.equipementArret) {
      const now = new Date();
      dateArretISO = now.toISOString();
      heureArretFinal =
        now.getHours().toString().padStart(2, "0") +
        ":" +
        now.getMinutes().toString().padStart(2, "0");
    }

    const payload = {
      segment: form.segment || null,
      equipement: form.equipement || null,
      numeroSerie: form.numeroSerie || null,
      equipementArret: form.equipementArret,
      dateArret: dateArretISO,
      heureArret: heureArretFinal,
      remarque: form.remarque || null,
      typePanne: form.typePanne,
      description: form.description,
      typePoste: form.typePoste,
      secteurType: form.typePoste === "MACHINE" ? selectedMachine?.secteur || null : form.secteurType || null,
      typeExecuteur: form.typeExecuteur
    };

    setLoading(true);
    try {
      await createTicket(user.id, payload, selectedMachine?.id || null, selectedExecuteurId || null);
      setSuccess("✅ Ticket créé avec succès !");
      setForm({
        segment: "", equipement: "", numeroSerie: "",
        equipementArret: false, dateArret: "", heureArret: "", remarque: "",
        typePanne: "", description: "", typePoste: "", secteurType: "", typeExecuteur: "",
      });
      setSelectedMachine(null);
      setMachineSearch("");
      setSelectedExecuteurId("");
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du ticket.");
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "8px 12px", borderRadius: "6px",
    border: "1px solid #ccc", fontSize: "14px", marginBottom: "0"
  };
  const labelStyle = { display: "block", fontSize: "13px", fontWeight: "600", color: "#475569", marginBottom: "6px" };
  const fieldWrapper = { marginBottom: "18px" };

  return (
    <div style={{ padding: "40px", background: "#f8fafc", minHeight: "100vh" }}>
      <div style={{ maxWidth: "700px", margin: "0 auto" }}>
        <h1 style={{ marginBottom: "30px" }}>📋 Créer un Ticket</h1>

        {success && (
          <div style={{ background: "#dcfce7", color: "#166534", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
            {success}
          </div>
        )}
        {error && (
          <div style={{ background: "#fee2e2", color: "#991b1b", padding: "12px", borderRadius: "8px", marginBottom: "20px" }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ background: "white", padding: "30px", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.07)" }}>

          {/* === BON DE TRAVAIL === */}
          <h3 style={{ color: "#1e40af", borderBottom: "2px solid #dbeafe", paddingBottom: "8px", marginBottom: "20px" }}>
            Bon de Travail
          </h3>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={fieldWrapper}>
              <label style={labelStyle}>Segment / CC</label>
              <input name="segment" value={form.segment} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={fieldWrapper}>
              <label style={labelStyle}>Équipement</label>
              <input name="equipement" value={form.equipement} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={fieldWrapper}>
              <label style={labelStyle}>N° Série / Position</label>
              <input name="numeroSerie" value={form.numeroSerie} onChange={handleChange} style={inputStyle} />
            </div>
            <div style={fieldWrapper}>
              <label style={labelStyle}>Remarque</label>
              <input name="remarque" value={form.remarque} onChange={handleChange} style={inputStyle} />
            </div>
          </div>

          <div style={{ ...fieldWrapper, display: "flex", alignItems: "center", gap: "12px" }}>
            <input type="checkbox" name="equipementArret" id="equipementArret" checked={form.equipementArret} onChange={handleChange} style={{ width: "16px", height: "16px" }} />
            <label htmlFor="equipementArret" style={{ ...labelStyle, marginBottom: 0, cursor: "pointer", color: form.equipementArret ? "#dc2626" : "#475569" }}>
              {form.equipementArret ? "🔴 Équipement en ARRÊT" : "🟢 Équipement en MARCHE"}
            </label>
          </div>

          {/* === PANNE === */}
          <h3 style={{ color: "#1e40af", borderBottom: "2px solid #dbeafe", paddingBottom: "8px", marginBottom: "20px", marginTop: "10px" }}>
            Détails de la Panne
          </h3>

          <div style={fieldWrapper}>
            <label style={labelStyle}>Type de Panne *</label>
            <select name="typePanne" value={form.typePanne} onChange={handleChange} style={inputStyle} required>
              <option value="">-- Sélectionner le type de panne --</option>
              {TYPE_PANNE_LIST.map(tp => (
                <option key={tp} value={tp}>
                  {tp.replace(/_/g, " ").charAt(0).toUpperCase() + tp.replace(/_/g, " ").slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div style={fieldWrapper}>
            <label style={labelStyle}>Description *</label>
            <textarea name="description" value={form.description} onChange={handleChange} rows={3} style={{ ...inputStyle, resize: "vertical" }} required />
          </div>

          {/* === TYPE POSTE === */}
          <h3 style={{ color: "#1e40af", borderBottom: "2px solid #dbeafe", paddingBottom: "8px", marginBottom: "20px", marginTop: "10px" }}>
            Affectation
          </h3>

          <div style={fieldWrapper}>
            <label style={labelStyle}>Type Poste *</label>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {TYPE_POSTE_LIST.map(tp => (
                <label key={tp} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: form.typePoste === tp ? "#2563eb" : "#f1f5f9", color: form.typePoste === tp ? "white" : "#334155", padding: "8px 16px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                  <input type="radio" name="typePoste" value={tp} checked={form.typePoste === tp} onChange={handleChange} style={{ display: "none" }} />
                  {tp.toUpperCase()}
                </label>
              ))}
            </div>
          </div>

          {/* Machine selection */}
          {form.typePoste === "MACHINE" && (
            <div style={fieldWrapper}>
              <label style={labelStyle}>Sélectionner la Machine</label>
              {selectedMachine ? (
                <div style={{ background: "#eff6ff", border: "1px solid #93c5fd", padding: "12px", borderRadius: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <div style={{ fontWeight: "600" }}>{selectedMachine.nom}</div>
                    <div style={{ fontSize: "12px", color: "#64748b" }}>{selectedMachine.secteur} – {selectedMachine.process}</div>
                  </div>
                  <button type="button" onClick={() => { setSelectedMachine(null); setMachineSearch(""); }} style={{ background: "none", border: "1px solid #2563eb", color: "#2563eb", padding: "4px 10px", borderRadius: "6px", cursor: "pointer" }}>
                    Changer
                  </button>
                </div>
              ) : (
                <>
                  <input placeholder="Rechercher une machine..." value={machineSearch} onChange={e => setMachineSearch(e.target.value)} style={inputStyle} />
                  <div style={{ maxHeight: "180px", overflowY: "auto", border: "1px solid #e2e8f0", borderRadius: "6px", marginTop: "4px" }}>
                    {filteredMachines.map(m => (
                      <div key={m.id} onClick={() => setSelectedMachine(m)} style={{ padding: "10px 12px", cursor: "pointer", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between" }}>
                        <span style={{ fontWeight: "500" }}>{m.nom}</span>
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>{m.secteur}</span>
                      </div>
                    ))}
                    {filteredMachines.length === 0 && <div style={{ padding: "10px", color: "#94a3b8", textAlign: "center" }}>Aucune machine trouvée</div>}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Secteur (if not MACHINE) */}
          {form.typePoste && form.typePoste !== "MACHINE" && (
            <div style={fieldWrapper}>
              <label style={labelStyle}>Secteur</label>
              <select name="secteurType" value={form.secteurType} onChange={handleChange} style={inputStyle}>
                <option value="">Sélectionner un secteur</option>
                {secteursList.map(s => (
                  <option key={s.id} value={s.nom}>{s.nom}</option>
                ))}
              </select>
            </div>
          )}



          {/* Type Exécuteur */}
          <div style={fieldWrapper}>
            <label style={labelStyle}>Type Exécuteur *</label>
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
              {TYPE_EXECUTEUR_LIST.map(exec => (
                <label key={exec} style={{ display: "flex", alignItems: "center", gap: "6px", cursor: "pointer", background: form.typeExecuteur === exec ? "#2563eb" : "#f1f5f9", color: form.typeExecuteur === exec ? "white" : "#334155", padding: "7px 14px", borderRadius: "20px", fontSize: "13px", fontWeight: "600" }}>
                  <input type="radio" name="typeExecuteur" value={exec} checked={form.typeExecuteur === exec} onChange={handleChange} style={{ display: "none" }} />
                  {exec.charAt(0).toUpperCase() + exec.slice(1)}
                </label>
              ))}
            </div>
          </div>

          {/* Target Executeur (Online) */}
          {form.typeExecuteur && (
            <div style={fieldWrapper}>
              <label style={labelStyle}>Assignation Ciblée (Optionnel)</label>
              <div style={{fontSize: "13px", color: "#64748b", marginBottom: "8px"}}>
                Sélectionnez un technicien en ligne pour lui assigner directement ce ticket, ou ne choisissez personne pour notifier tout le groupe.
              </div>
              {onlineUsers.length === 0 ? (
                <div style={{padding: "10px", background: "#f1f5f9", borderRadius: "6px", color: "#64748b", fontSize: "14px"}}>
                  Aucun membre de ce département n'est actuellement en ligne.
                </div>
              ) : (
                <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <div
                    onClick={() => setSelectedExecuteurId("")}
                    style={{
                      padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500",
                      background: selectedExecuteurId === "" ? "#2563eb" : "#f1f5f9",
                      color: selectedExecuteurId === "" ? "white" : "#334155"
                    }}
                  >
                    Assigner au groupe ({onlineUsers.length} en ligne)
                  </div>
                  {onlineUsers.map(u => (
                    <div
                      key={u.id}
                      onClick={() => setSelectedExecuteurId(u.id)}
                      style={{
                        padding: "8px 12px", borderRadius: "6px", cursor: "pointer", fontSize: "13px", fontWeight: "500",
                        display: "flex", alignItems: "center", gap: "6px",
                        background: selectedExecuteurId === u.id ? "#2563eb" : "#f0fdf4",
                        color: selectedExecuteurId === u.id ? "white" : "#166534",
                        border: selectedExecuteurId === u.id ? "none" : "1px solid #bbf7d0"
                      }}
                    >
                      <div style={{width: "8px", height: "8px", borderRadius: "50%", background: selectedExecuteurId === u.id ? "white" : "#22c55e"}}></div>
                      {u.nom}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{ width: "100%", background: loading ? "#93c5fd" : "#2563eb", color: "white", padding: "12px", border: "none", borderRadius: "8px", fontSize: "15px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px" }}
          >
            {loading ? "Envoi en cours..." : "🚀 Créer le Ticket"}
          </button>
        </form>
      </div>
    </div>
  );
}
