import { useEffect, useState } from "react";
import { getTickets, adminUpdateTicket } from "../../services/ticketService";
import { getUsers } from "../../services/userService";
import { getSecteurs } from "../../services/secteurService";
import { getMachines } from "../../services/machineService";
import TicketDetailModal from "../../components/TicketDetailModal";
import { 
  HiTicket, 
  HiSearch, 
  HiFilter, 
  HiEye, 
  HiPencil, 
  HiClock, 
  HiLightningBolt, 
  HiCheckCircle,
  HiExclamationCircle 
} from "react-icons/hi";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  // eslint-disable-next-line no-unused-vars
  const [allUsers, setAllUsers] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [machines, setMachines] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    loadTickets();
    if (isSuperAdmin) {
      loadUsers();
      loadSecteurs();
      loadMachines();
    }
  }, [isSuperAdmin]);

  const loadTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data);
    } catch (e) {
      console.error(e);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setAllUsers(data);
    } catch (e) {
      console.error("Error loading users", e);
    }
  };

  const loadSecteurs = async () => {
    try {
      const res = await getSecteurs();
      setSecteurs(res.data);
    } catch (e) {
      console.error("Error loading secteurs", e);
    }
  };

  const loadMachines = async () => {
    try {
      const res = await getMachines();
      setMachines(res.data);
    } catch (e) {
      console.error("Error loading machines", e);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.description?.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || ticket.statut === filter;
    return matchesSearch && matchesFilter;
  }).sort((a, b) => new Date(b.dateCreation) - new Date(a.dateCreation));

  const getStatusConfig = (statut) => {
    switch (statut) {
      case "OUVERTE":
        return { label: "Ouverte", bg: "#fee2e2", color: "#ef4444", icon: <HiExclamationCircle /> };
      case "EN_COURS":
        return { label: "En cours", bg: "#dbeafe", color: "#2563eb", icon: <HiClock /> };
      case "A_VERIFIER_QUALITE":
      case "A_VERIFIER_DEMANDEUR":
        return { label: "À vérifier", bg: "#fef3c7", color: "#d97706", icon: <HiLightningBolt /> };
      case "FERMEE":
        return { label: "Fermée", bg: "#dcfce7", color: "#16a34a", icon: <HiCheckCircle /> };
      default:
        return { label: statut, bg: "#f1f5f9", color: "#64748b", icon: null };
    }
  };

  const getPriorityConfig = (priorite) => {
    switch (priorite) {
      case "HAUTE":
        return { label: "Haute", color: "#ef4444", icon: "" };
      case "MOYENNE":
        return { label: "Moyenne", color: "#f59e0b", icon: "" };
      case "BASSE":
        return { label: "Basse", color: "#10b981", icon: "" };
      default:
        return { label: "N/A", color: "#94a3b8", icon: "" };
    }
  };

  const getExecuteurConfig = (type) => {
    const baseClass = "badge border px-3 py-2 shadow-sm";
    switch (type?.toLowerCase()) {
      case "qualite":
        return {
          label: "QUALITÉ",
          className: `${baseClass} text-dark`,
          style: { background: "linear-gradient(90deg, #198754 33.33%, white 33.33%, white 66.66%, #198754 66.66%)" }
        };
      case "production":
      case "matiere":
        return {
          label: "PRODUCTION",
          className: `${baseClass} text-dark`,
          style: { background: "linear-gradient(90deg, #0d6efd 33.33%, white 33.33%, white 66.66%, #0d6efd 66.66%)" }
        };
      case "maintenance":
        return {
          label: "MAINTENANCE",
          className: `${baseClass} bg-primary text-white`,
          style: {}
        };
      default:
        return {
          label: type?.toUpperCase() || "N/A",
          className: `${baseClass} bg-light text-dark`,
          style: {}
        };
    }
  };

  const handleSaveEdit = async () => {
    try {
      await adminUpdateTicket(editTicket.id, editTicket, user.id);
      setEditTicket(null);
      loadTickets();
      alert("Ticket mis à jour avec succès.");
    } catch (e) {
      alert("Erreur lors de la mise à jour: " + (e.response?.data || e.message));
    }
  };

  return (
    <div style={{ padding: "10px", width: "100%" }}>
      {/* HEADER SECTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ fontSize: "24px", fontWeight: "800", color: "#0f172a", margin: 0 }}>
            Gestion des Tickets
          </h1>
          <p style={{ color: "#64748b", fontSize: "14px", margin: "4px 0 0 0" }}>
            Supervision et contrôle des interventions en temps réel.
          </p>
        </div>
        <div style={{ background: "white", padding: "8px 16px", borderRadius: "12px", boxShadow: "0 1px 3px rgba(0,0,0,0.05)", border: "1px solid #f1f5f9" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>Total Actifs</span>
          <div style={{ fontSize: "20px", fontWeight: "800", color: "var(--primary-bg)" }}>{filteredTickets.length}</div>
        </div>
      </div>

      {/* 🔎 SEARCH & FILTER BAR */}
      <div style={{
        background: "white",
        padding: "16px",
        borderRadius: "16px",
        boxShadow: "0 4px 20px rgba(0,0,0,0.03)",
        border: "1px solid #f1f5f9",
        marginBottom: "24px",
        display: "flex",
        gap: "16px",
        alignItems: "center"
      }}>
        <div style={{ position: "relative", flex: 2 }}>
          <HiSearch style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#94a3b8" }} />
          <input
            type="text"
            placeholder="Rechercher par description, ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 12px 10px 40px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              outline: "none",
              background: "#f8fafc"
            }}
          />
        </div>
        
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}>
          <HiFilter style={{ color: "#64748b" }} />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            style={{
              width: "100%",
              padding: "10px",
              borderRadius: "10px",
              border: "1px solid #e2e8f0",
              fontSize: "14px",
              outline: "none",
              background: "white"
            }}
          >
            <option value="ALL">Tous les statuts</option>
            <option value="OUVERTE">Ouverte</option>
            <option value="EN_COURS">En cours</option>
            <option value="A_VERIFIER_QUALITE">À vérifier Qualité</option>
            <option value="A_VERIFIER_DEMANDEUR">À vérifier Demandeur</option>
            <option value="FERMEE">Fermée</option>
          </select>
        </div>
      </div>

      {/* 📋 TICKETS TABLE */}
      <div style={{
        background: "white",
        borderRadius: "20px",
        overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)",
        border: "1px solid #f1f5f9"
      }}>
        <div style={{ padding: "20px", borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h5 style={{ margin: 0, fontWeight: "700", color: "#334155" }}>
            <HiTicket style={{ marginRight: "8px", color: "var(--primary-bg)" }} /> Liste des Interventions
          </h5>
        </div>
        
        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" style={{ borderCollapse: "separate", borderSpacing: "0" }}>
            <thead style={{ background: "#f8fafc" }}>
              <tr>
                <th style={thStyle}>ID</th>
                <th style={thStyle}>Destinataire</th>
                <th style={thStyle}>Poste</th>
                <th style={thStyle}>Description</th>
                <th style={thStyle}>Priorité</th>
                <th style={thStyle}>Statut</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => {
                const status = getStatusConfig(ticket.statut);
                const priority = getPriorityConfig(ticket.priorite);
                const destConfig = getExecuteurConfig(ticket.typeExecuteur);
                
                return (
                  <tr key={ticket.id} style={{ transition: "all 0.2s" }}>
                    <td style={{ padding: "16px", fontSize: "13px", fontWeight: "600", color: "#64748b" }}>
                      #{ticket.id.substring(0, 8)}
                    </td>
                    <td style={{ padding: "16px" }}>
                      <span className={destConfig.className} style={destConfig.style}>{destConfig.label}</span>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", flexDirection: "column" }}>
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#94a3b8", textTransform: "uppercase" }}>{ticket.typePoste || "N/A"}</span>
                        <span style={{ fontSize: "14px", fontWeight: "600", color: "#334155" }}>
                          {ticket.typePoste === "MACHINE" ? (ticket.machine?.nom || "Non spécifiée") : (ticket.secteurType || "N/A")}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "16px", maxWidth: "300px" }}>
                      <div style={{ fontSize: "14px", color: "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }} title={ticket.description}>
                        {ticket.description}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px", color: priority.color, fontWeight: "700", fontSize: "13px" }}>
                        <span>{priority.icon}</span> {priority.label}
                      </div>
                    </td>
                    <td style={{ padding: "16px" }}>
                      <div style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        padding: "6px 12px",
                        borderRadius: "30px",
                        fontSize: "12px",
                        fontWeight: "700",
                        background: status.bg,
                        color: status.color
                      }}>
                        {status.icon} {status.label}
                      </div>
                    </td>
                    <td style={{ padding: "16px", textAlign: "right" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => setSelectedTicket(ticket)}
                          style={actionBtnStyle("#2563eb", "#eff6ff")}
                          title="Voir Détails"
                        >
                          <HiEye size={18} />
                        </button>
                        {isSuperAdmin && (
                          <button 
                            onClick={() => setEditTicket({ ...ticket })}
                            style={actionBtnStyle("#64748b", "#f8fafc")}
                            title="Modifier"
                          >
                            <HiPencil size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div style={{ padding: "60px", textAlign: "center", color: "#94a3b8" }}>
              <HiTicket size={48} style={{ opacity: 0.2, marginBottom: "16px" }} />
              <p style={{ margin: 0 }}>Aucun ticket ne correspond à votre recherche.</p>
            </div>
          )}
        </div>
      </div>

      {selectedTicket && (
        <TicketDetailModal 
          ticket={selectedTicket} 
          onClose={() => setSelectedTicket(null)} 
        />
      )}

      {/* MODAL ÉDITION SUPER ADMIN */}
      {editTicket && isSuperAdmin && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15, 23, 42, 0.6)", zIndex: 1050, display: "flex", justifyContent: "center", alignItems: "center", backdropFilter: "blur(4px)" }}>
          <div style={{ background: "white", padding: "0", borderRadius: "24px", width: "900px", maxWidth: "95%", maxHeight: "90vh", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            
            <div style={{ background: "#0f172a", color: "white", padding: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h4 style={{ margin: 0, fontWeight: "800", fontSize: "18px" }}>Modification Ticket</h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "12px", opacity: 0.7 }}>ID: {editTicket.id}</p>
              </div>
              <button className="btn-close btn-close-white" onClick={() => setEditTicket(null)}></button>
            </div>

            <div style={{ padding: "32px", overflowY: "auto", maxHeight: "calc(90vh - 140px)", background: "#f8fafc" }}>
              <div className="row g-4">
                
                {/* 🔵 PARTIE DEMANDEUR */}
                <div className="col-md-6">
                  <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", height: "100%" }}>
                    <h6 style={{ color: "var(--primary-bg)", fontWeight: "800", textTransform: "uppercase", fontSize: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "var(--primary-bg)" }}></span>
                      Origine de la demande
                    </h6>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted small">DEMANDEUR</label>
                      <input className="form-control bg-light border-0" value={editTicket.nomPrenom || "N/A"} readOnly style={{ borderRadius: "10px" }} />
                    </div>
                    
                    <div className="mb-3">
                      <label className="form-label fw-bold small text-primary">TYPE DE POSTE</label>
                      <select 
                        className="form-select" 
                        value={editTicket.typePoste || ""} 
                        onChange={(e) => {
                          const newType = e.target.value;
                          setEditTicket({
                            ...editTicket, 
                            typePoste: newType,
                            // Reset machine/segment if switching away from MACHINE
                            ...(newType !== "MACHINE" ? { machine: null } : {})
                          });
                        }}
                        style={{ borderRadius: "10px" }}
                      >
                        <option value="MACHINE">MACHINE</option>
                        <option value="matiere">matiere</option>
                        <option value="qualitee">qualitee</option>
                      </select>
                    </div>

                    {editTicket.typePoste === "MACHINE" ? (
                      <>
                        <div className="mb-3">
                          <label className="form-label fw-bold small text-primary">SEGMENT (Filtre)</label>
                          <select 
                            className="form-select" 
                            value={editTicket.machine?.secteur || ""} 
                            onChange={(e) => {
                              // We don't change the machine yet, just let the user filter
                              // But we need to store this "temp" segment in the editTicket state if we want to filter the next select
                              setEditTicket({...editTicket, _tempSegment: e.target.value});
                            }}
                            style={{ borderRadius: "10px" }}
                          >
                            <option value="">Tous les segments</option>
                            {secteurs.map(s => (
                              <option key={s.id} value={s.nom}>{s.nom}</option>
                            ))}
                          </select>
                        </div>

                        <div className="mb-3">
                          <label className="form-label fw-bold small text-primary">ÉQUIPEMENT (Machine)</label>
                          <select 
                            className="form-select" 
                            value={editTicket.machine?.id || ""} 
                            onChange={(e) => {
                              const m = machines.find(mac => mac.id.toString() === e.target.value);
                              setEditTicket({...editTicket, machine: m, secteurType: m?.secteur || editTicket.secteurType});
                            }}
                            style={{ borderRadius: "10px" }}
                          >
                            <option value="">Sélectionner une machine</option>
                            {machines
                              .filter(m => !editTicket._tempSegment || m.secteur === editTicket._tempSegment)
                              .map(m => (
                                <option key={m.id} value={m.id}>{m.nom} ({m.codeMachine})</option>
                              ))
                            }
                          </select>
                        </div>
                      </>
                    ) : (
                      <div className="mb-3">
                        <label className="form-label fw-bold small text-primary">VALEUR DU POSTE</label>
                        <select 
                          className="form-select" 
                          value={editTicket.secteurType || ""} 
                          onChange={(e) => setEditTicket({...editTicket, secteurType: e.target.value})}
                          style={{ borderRadius: "10px" }}
                        >
                          <option value="">Sélectionner...</option>
                          {secteurs.map(s => (
                            <option key={s.id} value={s.nom}>{s.nom}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label fw-bold small">TYPE D'ARRÊTS</label>
                      <input 
                        className="form-control" 
                        value={editTicket.typePanne || ""} 
                        onChange={(e) => setEditTicket({...editTicket, typePanne: e.target.value})}
                        style={{ borderRadius: "10px" }} 
                      />
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small">DESCRIPTION</label>
                      <textarea 
                        className="form-control" 
                        rows={3} 
                        value={editTicket.description || ""} 
                        onChange={(e) => setEditTicket({...editTicket, description: e.target.value})}
                        style={{ borderRadius: "10px" }} 
                      />
                    </div>

                    <div>
                      <label className="form-label fw-bold small text-primary">PRIORITÉ</label>
                      <select 
                        className="form-select" 
                        value={editTicket.priorite || "MOYENNE"} 
                        onChange={(e) => setEditTicket({...editTicket, priorite: e.target.value})}
                        style={{ borderRadius: "10px", fontWeight: "700" }}
                      >
                        <option value="BASSE">BASSE</option>
                        <option value="MOYENNE">MOYENNE</option>
                        <option value="HAUTE">HAUTE</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* 🟢 PARTIE EXÉCUTEUR */}
                <div className="col-md-6">
                  <div style={{ background: "white", borderRadius: "16px", padding: "24px", boxShadow: "0 4px 6px rgba(0,0,0,0.02)", height: "100%" }}>
                    <h6 style={{ color: "#16a34a", fontWeight: "800", textTransform: "uppercase", fontSize: "12px", marginBottom: "20px", display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#16a34a" }}></span>
                      Suivi d'Intervention
                    </h6>

                    <div className="mb-3">
                      <label className="form-label fw-bold text-muted small">TECHNICIEN ASSIGNÉ</label>
                      <input className="form-control bg-light border-0" value={editTicket.executeur?.nom || "Non assigné"} readOnly style={{ borderRadius: "10px" }} />
                    </div>

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <label className="form-label fw-bold small">RÉF. PIÈCE</label>
                        <input 
                          className="form-control" 
                          value={editTicket.referencePiece || ""} 
                          onChange={(e) => setEditTicket({...editTicket, referencePiece: e.target.value})}
                          style={{ borderRadius: "10px" }} 
                        />
                      </div>
                      <div className="col-6">
                        <label className="form-label fw-bold small text-success">DURÉE (H)</label>
                        <input 
                          type="number" 
                          step="0.1" 
                          className="form-control" 
                          value={editTicket.duree || 0} 
                          onChange={(e) => setEditTicket({...editTicket, duree: parseFloat(e.target.value) || 0})}
                          style={{ borderRadius: "10px" }} 
                        />
                      </div>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small text-success">STATUT DU TICKET</label>
                      <select 
                        className="form-select" 
                        value={editTicket.statut || ""} 
                        onChange={(e) => setEditTicket({...editTicket, statut: e.target.value})}
                        style={{ borderRadius: "10px", fontWeight: "700" }}
                      >
                        <option value="OUVERTE">OUVERTE</option>
                        <option value="EN_COURS">EN_COURS</option>
                        <option value="A_VERIFIER_QUALITE">À VÉRIFIER (QUALITÉ)</option>
                        <option value="A_VERIFIER_DEMANDEUR">À VÉRIFIER (DEMANDEUR)</option>
                        <option value="FERMEE">FERMÉE</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label fw-bold small">COMMENTAIRES TRAVAUX</label>
                      <textarea 
                        className="form-control" 
                        rows={3} 
                        value={editTicket.commentaireIntervention || ""} 
                        onChange={(e) => setEditTicket({...editTicket, commentaireIntervention: e.target.value})}
                        style={{ borderRadius: "10px" }} 
                      />
                    </div>

                    <div>
                      <label className="form-label fw-bold small text-warning">COMMENTAIRE VÉRIFICATION</label>
                      <textarea 
                        className="form-control border-warning" 
                        rows={2} 
                        value={editTicket.commentaireVerification || ""} 
                        onChange={(e) => setEditTicket({...editTicket, commentaireVerification: e.target.value})}
                        style={{ borderRadius: "10px" }} 
                      />
                    </div>
                  </div>
                </div>

              </div>

              <div style={{ padding: "24px 0", textAlign: "right", borderTop: "1px solid #f1f5f9", display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "24px" }}>
                <button 
                  onClick={() => setEditTicket(null)}
                  style={{ padding: "10px 24px", borderRadius: "10px", border: "1px solid #e2e8f0", background: "white", fontWeight: "600", cursor: "pointer" }}
                >
                  Annuler
                </button>
                <button 
                  onClick={handleSaveEdit}
                  style={{ padding: "10px 32px", borderRadius: "10px", background: "var(--primary-bg)", color: "white", border: "none", fontWeight: "700", cursor: "pointer", boxShadow: "0 4px 12px rgba(37, 99, 235, 0.2)" }}
                >
                  Enregistrer les modifications
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

/* ===== MODERN STYLES ===== */

const thStyle = {
  padding: "16px",
  fontSize: "11px",
  fontWeight: "800",
  color: "#94a3b8",
  textTransform: "uppercase",
  letterSpacing: "1px",
  borderBottom: "1px solid #f1f5f9"
};

const actionBtnStyle = (color, bg) => ({
  width: "36px",
  height: "36px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  border: "none",
  background: bg,
  color: color,
  cursor: "pointer",
  transition: "all 0.2s"
});

export default Tickets;
