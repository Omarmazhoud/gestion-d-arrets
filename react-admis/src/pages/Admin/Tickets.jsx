import { useEffect, useState } from "react";
import { getTickets } from "../../services/ticketService";
import TicketDetailModal from "../../components/TicketDetailModal";

function Tickets() {
  const [tickets, setTickets] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedTicket, setSelectedTicket] = useState(null);

  useEffect(() => {
    loadTickets();
  }, []);

  const loadTickets = async () => {
    try {
      const res = await getTickets();
      setTickets(res.data);
    } catch (err) {
      console.error("Erreur chargement tickets:", err);
    }
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

  const getPriorityBadge = (priorite) => {
    switch (priorite) {
      case "HAUTE": return "bg-danger";
      case "MOYENNE": return "bg-warning text-dark";
      case "BASSE": return "bg-success";
      default: return "bg-secondary";
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="fw-bold mb-4">Suivi des Tickets</h2>

      <div className="card shadow mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <input
                className="form-control"
                placeholder="Rechercher par description..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="col-md-3">
              <select
                className="form-select"
                value={filter}
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
          </div>
        </div>
      </div>

      <div className="card shadow">
        <div className="card-header bg-white fw-bold">Liste des Tickets</div>
        <div className="card-body table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Description</th>
                <th>Priorité</th>
                <th>Statut</th>
                <th>Poste</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTickets.map(ticket => (
                <tr key={ticket.id}>
                  <td>{ticket.id.substring(0, 8)}</td>
                  <td>{ticket.description}</td>
                  <td>
                    {ticket.priorite && (
                      <span className={`badge ${getPriorityBadge(ticket.priorite)}`}>
                        {ticket.priorite}
                      </span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${getBadgeClass(ticket.statut)}`}>
                      {ticket.statut}
                    </span>
                  </td>
                  <td>
                    {ticket.typePoste === "MACHINE" 
                      ? `Machine: ${ticket.machine?.nom || "Non spécifié"}`
                      : (ticket.typePoste || "Non spécifié")
                    }
                  </td>
                  <td>
                    <button 
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      Détails
                    </button>
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
    </div>
  );
}

export default Tickets;
