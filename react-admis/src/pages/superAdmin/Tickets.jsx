import { useEffect, useState } from "react";
import { getTickets, adminUpdateTicket } from "../../services/ticketService";
import { getUsers } from "../../services/userService";
import { getSecteurs } from "../../services/secteurService";
import { getProcesses } from "../../services/processService";
import TicketDetailModal from "../../components/TicketDetailModal";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [editTicket, setEditTicket] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [secteurs, setSecteurs] = useState([]);
  const [processes, setProcesses] = useState([]);

  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    loadTickets();
    if (isSuperAdmin) {
      loadUsers();
      loadSecteurs();
      loadProcesses();
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

  const loadProcesses = async () => {
    try {
      const res = await getProcesses();
      setProcesses(res.data);
    } catch (e) {
      console.error("Error loading processes", e);
    }
  };

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch = ticket.description
      ?.toLowerCase()
      .includes(search.toLowerCase());
    const matchesFilter = filter === "ALL" || ticket.statut === filter;
    return matchesSearch && matchesFilter;
  });

  const getBadgeClass = (statut) => {
    switch (statut) {
      case "OUVERTE":
        return "bg-danger";
      case "EN_COURS":
        return "bg-primary text-white";
      case "A_VERIFIER_QUALITE":
      case "A_VERIFIER_DEMANDEUR":
        return "bg-info text-dark";
      case "FERMEE":
        return "bg-success text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const getExecuteurConfig = (type) => {
    const baseClass = "badge border px-3 py-2 shadow-sm";
    switch (type?.toLowerCase()) {
      case "qualite":
        return {
          className: `${baseClass} text-dark`,
          style: { background: "linear-gradient(90deg, #198754 33.33%, white 33.33%, white 66.66%, #198754 66.66%)" }
        };
      case "production":
      case "matiere":
        return {
          className: `${baseClass} text-dark`,
          style: { background: "linear-gradient(90deg, #0d6efd 33.33%, white 33.33%, white 66.66%, #0d6efd 66.66%)" }
        };
      case "maintenance":
        return {
          className: `${baseClass} bg-primary text-white`,
          style: {}
        };
      default:
        return {
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
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Gestion des Tickets</h2>

      {/* 🔎 RECHERCHE + FILTRE */}
      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Rechercher par description..."
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="ALL">Tous les statuts</option>
                <option value="OUVERTE">Ouverte</option>
                <option value="EN_COURS">En cours</option>
                <option value="A_VERIFIER_QUALITE">À vérifier Qualité</option>
                <option value="A_VERIFIER_DEMANDEUR">À vérifier Demandeur</option>
                <option value="FERMEE">Fermée</option>
              </select>
            </div>
            <div className="col-md-3 d-flex align-items-center">
              <strong>Total : {filteredTickets.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* 📋 TABLEAU */}
      <div className="card shadow">
        <div className="card-header bg-white fw-bold">
          Liste des Tickets
        </div>
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Destinataire</th>
                <th>Description</th>
                <th>Statut</th>
                <th>Secteur</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.id.substring(0, 8)}</td>
                  <td>
                    {(() => {
                      const config = getExecuteurConfig(ticket.typeExecuteur);
                      return (
                        <span className={config.className} style={config.style}>
                          {ticket.typeExecuteur?.toUpperCase()}
                        </span>
                      );
                    })()}
                  </td>
                  <td>{ticket.description}</td>
                  <td>
                    <span className={`badge ${getBadgeClass(ticket.statut)}`}>
                      {ticket.statut}
                    </span>
                  </td>
                  <td>{ticket.secteurType}</td>
                  <td>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <button 
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => setSelectedTicket(ticket)}
                      >
                        Détails
                      </button>
                      {isSuperAdmin && (
                        <button 
                          className="btn btn-sm btn-outline-secondary"
                          onClick={() => setEditTicket({ ...ticket })}
                        >
                          Éditer
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTickets.length === 0 && (
            <div className="text-center text-muted py-4">Aucun ticket trouvé</div>
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
          <div style={{ background: "white", padding: "0", borderRadius: "20px", width: "900px", maxWidth: "95%", maxHeight: "90vh", overflow: "hidden", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)" }}>
            
            <div className="bg-dark text-white p-4 d-flex justify-content-between align-items-center">
              <h4 className="m-0 fw-bold">Modification Super Admin : Ticket {editTicket.id.substring(0,8)}</h4>
              <button className="btn-close btn-close-white" onClick={() => setEditTicket(null)}></button>
            </div>

            <div className="p-4 overflow-auto" style={{ maxHeight: "calc(90vh - 140px)" }}>
              <div className="row g-4">
                
                {/* 🔵 PARTIE DEMANDEUR */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm" style={{ background: "#f8fafc" }}>
                    <div className="card-header bg-primary text-white fw-bold py-3">
                      <i className="bi bi-person-fill me-2"></i>PARTIE DEMANDEUR
                    </div>
                    <div className="card-body p-4">
                      <div className="mb-3">
                        <label className="form-label fw-bold text-muted small">DEMANDEUR (Lecture seule)</label>
                        <input className="form-control bg-white border-0" value={editTicket.nomPrenom || "N/A"} readOnly />
                      </div>
                      
                      <div className="mb-3">
                        <label className="form-label fw-bold small text-primary">SECTEUR</label>
                        <select 
                          className="form-select border-primary shadow-sm" 
                          value={editTicket.secteurType || ""} 
                          onChange={(e) => setEditTicket({...editTicket, secteurType: e.target.value})}
                        >
                          <option value="">Sélectionner un secteur</option>
                          {secteurs.map(s => (
                            <option key={s.id} value={s.nom}>{s.nom}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold small text-primary">PROCESS</label>
                        <select 
                          className="form-select border-primary shadow-sm" 
                          value={editTicket.processNom || ""} 
                          onChange={(e) => setEditTicket({...editTicket, processNom: e.target.value})}
                        >
                          <option value="">Sélectionner un process</option>
                          {processes.map(p => (
                            <option key={p.id} value={p.nom}>{p.nom}</option>
                          ))}
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold small">TYPE DE PANNE</label>
                        <input className="form-control" value={editTicket.typePanne || ""} onChange={(e) => setEditTicket({...editTicket, typePanne: e.target.value})} />
                      </div>

                      <div className="mb-0">
                        <label className="form-label fw-bold small">DESCRIPTION</label>
                        <textarea className="form-control" rows={3} value={editTicket.description || ""} onChange={(e) => setEditTicket({...editTicket, description: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 🟢 PARTIE EXÉCUTEUR */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm" style={{ background: "#f8fafc" }}>
                    <div className="card-header bg-success text-white fw-bold py-3">
                      <i className="bi bi-tools me-2"></i>PARTIE EXÉCUTEUR
                    </div>
                    <div className="card-body p-4">
                      <div className="mb-3">
                        <label className="form-label fw-bold text-muted small">TECHNICIEN (Lecture seule)</label>
                        <input className="form-control bg-white border-0" value={editTicket.executeur?.nom || "Non assigné"} readOnly />
                      </div>

                      <div className="row g-3 mb-3">
                        <div className="col-6">
                          <label className="form-label fw-bold small">RÉF. PIÈCE</label>
                          <input className="form-control" value={editTicket.referencePiece || ""} onChange={(e) => setEditTicket({...editTicket, referencePiece: e.target.value})} />
                        </div>
                        <div className="col-6">
                          <label className="form-label fw-bold small text-success">DURÉE (H)</label>
                          <input type="number" step="0.1" className="form-control border-success" value={editTicket.duree || 0} onChange={(e) => setEditTicket({...editTicket, duree: parseFloat(e.target.value) || 0})} />
                        </div>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold small text-success">STATUT GLOBAL</label>
                        <select className="form-select border-success fw-bold" value={editTicket.statut || ""} onChange={(e) => setEditTicket({...editTicket, statut: e.target.value})}>
                          <option value="OUVERTE">OUVERTE</option>
                          <option value="EN_COURS">EN_COURS</option>
                          <option value="A_VERIFIER_QUALITE">A_VERIFIER_QUALITE</option>
                          <option value="A_VERIFIER_DEMANDEUR">A_VERIFIER_DEMANDEUR</option>
                          <option value="FERMEE">FERMEE</option>
                        </select>
                      </div>

                      <div className="mb-3">
                        <label className="form-label fw-bold small">COMMENTAIRES TRAVAUX</label>
                        <textarea className="form-control" rows={3} value={editTicket.commentaireIntervention || ""} onChange={(e) => setEditTicket({...editTicket, commentaireIntervention: e.target.value})} />
                      </div>

                      <div className="mb-0">
                        <label className="form-label fw-bold small text-warning">COMMENTAIRE VÉRIFICATION</label>
                        <textarea className="form-control border-warning" rows={2} value={editTicket.commentaireVerification || ""} onChange={(e) => setEditTicket({...editTicket, commentaireVerification: e.target.value})} />
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="p-4 bg-light text-end border-top">
              <button className="btn btn-outline-secondary me-3 px-4 shadow-sm" onClick={() => setEditTicket(null)}>Annuler</button>
              <button className="btn btn-primary px-5 shadow-sm fw-bold" onClick={handleSaveEdit}>Enregistrer les modifications</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
