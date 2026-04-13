import { useEffect, useState } from "react";
import { getTickets, adminUpdateTicket } from "../../services/ticketService";
import TicketDetailModal from "../../components/TicketDetailModal";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);
  
  // Super Admin Edit
  const [editTicket, setEditTicket] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  const isSuperAdmin = user?.role === "SUPER_ADMIN";

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    const res = await getTickets();
    setTickets(res.data);
  };

  const filteredTickets = tickets
    .filter(ticket =>
      filter === "ALL" ? true : ticket.statut === filter
    )
    .filter(ticket =>
      ticket.description?.toLowerCase().includes(search.toLowerCase())
    );

  const getBadgeClass = (statut) => {
    switch (statut) {
      case "OUVERTE":
      case "OUVERT":
        return "bg-danger";
      case "PRISE":
      case "EN_COURS":
        return "bg-warning text-dark";
      case "FERMEE":
        return "bg-success";
      case "A_VERIFIER_QUALITE":
      case "A_VERIFIER_DEMANDEUR":
      case "A_VERIFIER":
        return "bg-info text-dark";
      default:
        return "bg-secondary";
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
                <option value="ALL">Tous</option>
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
            <div className="text-center text-muted py-4">
              Aucun ticket trouvé
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
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1050, display: "flex", justifyContent: "center", alignItems: "center" }}>
          <div style={{ background: "white", padding: "30px", borderRadius: "12px", width: "500px", maxWidth: "90%", maxHeight: "80vh", overflowY: "auto" }}>
            <h3 className="mb-4">Modifier le Ticket (Admin)</h3>
            
            <div className="mb-3">
              <label className="form-label">Type de Panne</label>
              <input className="form-control" value={editTicket.typePanne || ""} onChange={(e) => setEditTicket({...editTicket, typePanne: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea className="form-control" value={editTicket.description || ""} onChange={(e) => setEditTicket({...editTicket, description: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Référence Pièce</label>
              <input className="form-control" value={editTicket.referencePiece || ""} onChange={(e) => setEditTicket({...editTicket, referencePiece: e.target.value})} />
            </div>
            <div className="mb-3">
              <label className="form-label">Statut</label>
              <select className="form-select" value={editTicket.statut || ""} onChange={(e) => setEditTicket({...editTicket, statut: e.target.value})}>
                <option value="OUVERTE">Ouverte</option>
                <option value="EN_COURS">En cours</option>
                <option value="A_VERIFIER_QUALITE">À vérifier Qualité</option>
                <option value="REFUSE_QUALITE">Refusé Qualité</option>
                <option value="A_VERIFIER_DEMANDEUR">À vérifier Demandeur</option>
                <option value="REOUVERTE">Réouverte (Refus Demandeur)</option>
                <option value="FERMEE">Fermée</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label">Duree (H)</label>
              <input type="number" step="0.1" className="form-control" value={editTicket.duree || ""} onChange={(e) => setEditTicket({...editTicket, duree: parseFloat(e.target.value)})} />
            </div>
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button className="btn btn-secondary" onClick={() => setEditTicket(null)}>Annuler</button>
              <button className="btn btn-primary" onClick={handleSaveEdit}>Sauvegarder</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Tickets;
