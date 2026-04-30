import React, { useState } from "react";
import { forceUpdateStatus } from "../services/ticketService";

const TicketDetailModal = ({ ticket, onClose }) => {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  const formatOnlyDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('fr-FR');
  };

  const formatTime = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  // Calcul de la durée totale si non fournie
  const getDisplayDuree = () => {
    if (ticket.duree) return `${ticket.duree} h`;
    if (!ticket.dateDebutIntervention) return "En attente";
    
    const start = new Date(ticket.dateDebutIntervention);
    const end = ticket.dateFinIntervention ? new Date(ticket.dateFinIntervention) : new Date();
    const diffMs = end - start;
    const diffHrs = (diffMs / (1000 * 60 * 60)).toFixed(1);
    return `${diffHrs} h`;
  };

  return (
    <>
      {/* 🖥️ UI MODAL (Visible sur écran) */}
      <div className="modal show d-block no-print" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
        <div className="modal-dialog modal-xl modal-dialog-scrollable">
          <div className="modal-content border-0 shadow-lg">
            
            <div className="modal-header bg-dark text-white p-4">
              <div>
                <h5 className="modal-title mb-1">Détails de l'Intervention</h5>
                <p className="mb-0 small opacity-75">ID Ticket: {ticket.id}</p>
              </div>
              <div className="text-end">
                <span className={`badge p-2 px-3 fs-6 ${ticket.statut === 'FERMEE' ? 'bg-success' : 'bg-warning text-dark'}`}>
                  {ticket.statut}
                </span>
                <button type="button" className="btn-close btn-close-white ms-3" onClick={onClose}></button>
              </div>
            </div>

            <div className="modal-body p-4 bg-white">
              <div className="container-fluid">
                <div className="row g-4">
                  
                  {/* COLONNE GAUCHE: DEMANDEUR */}
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm bg-light">
                      <div className="card-header bg-primary text-white fw-bold">PARTIE DEMANDEUR</div>
                      <div className="card-body">
                        <table className="table table-sm table-borderless mb-0">
                          <tbody>
                            <tr><th width="45%">Nom & Prénom:</th><td>{ticket.nomPrenom}</td></tr>
                            <tr><th>Matricule:</th><td>{ticket.matricule}</td></tr>
                            <tr><th>Segment:</th><td>{ticket.segment || "N/A"}</td></tr>
                            <tr><th>Équipement:</th><td>{ticket.equipement || ticket.machine?.nom || "N/A"}</td></tr>
                            <tr><th>Type Poste:</th><td>{ticket.typePoste || "N/A"}</td></tr>
                            <tr><th>Poste:</th><td>{ticket.secteurType || "N/A"}</td></tr>
                            <tr className="table-warning">
                              <th>Équipement en arrêt:</th>
                              <td className="fw-bold">{ticket.equipementArret ? "OUI" : "NON"}</td>
                            </tr>
                          </tbody>
                        </table>
                        <hr />
                        <label className="fw-bold text-primary small d-block mb-1">Type d'Arrêts / Description:</label>
                        <p className="mb-2 p-2 bg-white rounded border">{ticket.typePanne} - {ticket.description}</p>
                      </div>
                    </div>
                  </div>

                  {/* COLONNE DROITE: MAINTENANCIER */}
                  <div className="col-md-6">
                    <div className="card h-100 border-0 shadow-sm bg-light">
                      <div className="card-header bg-success text-white fw-bold">PARTIE EXÉCUTEUR</div>
                      <div className="card-body">
                        {ticket.executeur ? (
                          <>
                            <table className="table table-sm table-borderless mb-0">
                              <tbody>
                                <tr><th width="45%">Intervenant:</th><td>{ticket.executeur.nom}</td></tr>
                                <tr><th>Référence Pièce:</th><td>{ticket.referencePiece || "N/A"}</td></tr>
                                <tr><th>Durée Réelle:</th><td className="fw-bold text-success">{getDisplayDuree()}</td></tr>
                              </tbody>
                            </table>
                            <hr />
                            <label className="fw-bold text-success small d-block mb-1">Travaux effectués:</label>
                            <p className="mb-0 p-2 bg-white rounded border" style={{ minHeight: "80px" }}>{ticket.commentaireIntervention || "Néant"}</p>
                          </>
                        ) : (
                          <div className="text-center py-5 text-muted">En attente de prise en charge...</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer bg-light p-3 d-flex justify-content-between no-print">
              <div>
                {JSON.parse(localStorage.getItem("user"))?.role === "SUPER_ADMIN" && (
                  <div className="d-flex align-items-center gap-2">
                    <select className="form-select form-select-sm" style={{ width: "160px" }} id="forceStatusSelect">
                      <option value="OUVERTE">OUVERTE</option>
                      <option value="EN_COURS">EN_COURS</option>
                      <option value="A_VERIFIER_QUALITE">A_VERIFIER_QUALITE</option>
                      <option value="A_VERIFIER_DEMANDEUR">A_VERIFIER_DEMANDEUR</option>
                      <option value="FERMEE">FERMEE</option>
                    </select>
                    <button className="btn btn-sm btn-danger" onClick={async () => {
                      const newStatus = document.getElementById("forceStatusSelect").value;
                      const adminId = JSON.parse(localStorage.getItem("user")).id;
                      if(window.confirm(`Forcer ?`)) {
                        try { await forceUpdateStatus(ticket.id, newStatus, adminId); window.location.reload(); } catch (e) { alert(e.message); }
                      }
                    }}>Forcer</button>
                  </div>
                )}
              </div>
              <div>
                <button type="button" className="btn btn-secondary me-2" onClick={onClose}>Fermer</button>
                <button type="button" className="btn btn-primary px-4 shadow-sm" onClick={handlePrint}>
                  <i className="bi bi-printer-fill me-2"></i>Imprimer / PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 📄 SECTION IMPRESSION (Format A4 Officiel) */}
      <div className="print-only">
        <div style={{ padding: "30px", fontFamily: "Segoe UI, sans-serif" }}>
          
          {/* HEADER RAPPORT */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "4px solid #1e40af", paddingBottom: "15px", marginBottom: "25px" }}>
            <div>
              <h1 style={{ margin: 0, color: "#1e40af", fontSize: "24px", fontWeight: "800" }}>RAPPORT D'INTERVENTION L-DTM</h1>
              <p style={{ margin: "4px 0 0 0", color: "#64748b", fontSize: "12px" }}>Système de Management de la Maintenance LEONI</p>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: "800", fontSize: "16px" }}>TICKET #{ticket.id.substring(0, 8)}</div>
              <div style={{ color: "#64748b", fontSize: "12px" }}>Imprimé le: {new Date().toLocaleString('fr-FR')}</div>
            </div>
          </div>

          {/* TIMELINE / CYCLE DE VIE (Cercles) */}
          <div style={{ marginBottom: "40px", padding: "10px 0" }}>
            <h3 style={{ fontSize: "14px", fontWeight: "700", color: "#64748b", textTransform: "uppercase", marginBottom: "20px" }}>Cycle de Vie du Ticket</h3>
            <div style={{ display: "flex", justifyContent: "space-between", position: "relative", padding: "0 40px" }}>
              {/* Ligne de fond */}
              <div style={{ position: "absolute", top: "15px", left: "60px", right: "60px", height: "3px", background: "#e2e8f0", zIndex: 1 }}></div>
              
              {/* Étape 1: Ouvert */}
              <div style={{ textAlign: "center", zIndex: 2, position: "relative", width: "100px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#ef4444", border: "4px solid white", margin: "0 auto", boxShadow: "0 0 0 2px #ef4444" }}></div>
                <div style={{ marginTop: "8px", fontWeight: "700", fontSize: "12px", color: "#ef4444" }}>OUVERT</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{formatOnlyDate(ticket.dateCreation)}<br/>{formatTime(ticket.dateCreation)}</div>
              </div>

              {/* Étape 2: Prise en charge */}
              <div style={{ textAlign: "center", zIndex: 2, position: "relative", width: "100px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: ticket.dateDebutIntervention ? "#2563eb" : "#cbd5e1", border: "4px solid white", margin: "0 auto", boxShadow: `0 0 0 2px ${ticket.dateDebutIntervention ? "#2563eb" : "#cbd5e1"}` }}></div>
                <div style={{ marginTop: "8px", fontWeight: "700", fontSize: "12px", color: ticket.dateDebutIntervention ? "#2563eb" : "#cbd5e1" }}>PRISE EN CHARGE</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{ticket.dateDebutIntervention ? `${formatOnlyDate(ticket.dateDebutIntervention)}` : "--/--/--"}<br/>{ticket.dateDebutIntervention ? formatTime(ticket.dateDebutIntervention) : "--:--"}</div>
              </div>

              {/* Étape 3: Clôturé / Vérifié */}
              <div style={{ textAlign: "center", zIndex: 2, position: "relative", width: "100px" }}>
                <div style={{ width: "30px", height: "30px", borderRadius: "50%", background: ticket.statut === 'FERMEE' ? "#16a34a" : "#cbd5e1", border: "4px solid white", margin: "0 auto", boxShadow: `0 0 0 2px ${ticket.statut === 'FERMEE' ? "#16a34a" : "#cbd5e1"}` }}></div>
                <div style={{ marginTop: "8px", fontWeight: "700", fontSize: "12px", color: ticket.statut === 'FERMEE' ? "#16a34a" : "#cbd5e1" }}>VÉRIFIÉ / FERMÉ</div>
                <div style={{ fontSize: "10px", color: "#94a3b8" }}>{ticket.dateFermeture ? formatOnlyDate(ticket.dateFermeture) : "--/--/--"}<br/>{ticket.dateFermeture ? formatTime(ticket.dateFermeture) : "--:--"}</div>
              </div>
            </div>
          </div>

          {/* INFOS GÉNÉRALES */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginBottom: "25px" }}>
            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ background: "#f1f5f9", padding: "10px 15px", fontWeight: "700", fontSize: "12px", borderBottom: "1px solid #e2e8f0" }}>INFORMATION DEMANDEUR</div>
              <div style={{ padding: "15px" }}>
                <table style={{ width: "100%", fontSize: "13px" }}>
                  <tbody>
                    <tr><td style={{ fontWeight: "700", color: "#64748b", padding: "4px 0" }}>Nom:</td><td>{ticket.nomPrenom}</td></tr>
                    <tr><td style={{ fontWeight: "700", color: "#64748b", padding: "4px 0" }}>Poste:</td><td style={{ fontWeight: "800", color: "#1e40af" }}>
                      {ticket.typePoste === "MACHINE" 
                        ? `Machine: ${ticket.machine?.nom || "N/A"}` 
                        : (ticket.typePoste || "N/A")
                      }
                    </td></tr>
                    <tr><td style={{ fontWeight: "700", color: "#64748b", padding: "4px 0" }}>Segment:</td><td>{ticket.secteurType || "N/A"}</td></tr>
                    <tr><td style={{ fontWeight: "700", color: "#64748b", padding: "4px 0" }}>État:</td><td>{ticket.equipementArret ? "❌ ARRÊTÉ" : "✅ MARCHE"}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ border: "1px solid #e2e8f0", borderRadius: "12px", overflow: "hidden" }}>
              <div style={{ background: "#f1f5f9", padding: "10px 15px", fontWeight: "700", fontSize: "12px", borderBottom: "1px solid #e2e8f0" }}>INFORMATION MAINTENANCE</div>
              <div style={{ padding: "15px" }}>
                <table style={{ width: "100%", fontSize: "13px" }}>
                  <tbody>
                    <tr><td style={{ fontWeight: "700", color: "#64748b", padding: "4px 0" }}>Technicien:</td><td>{ticket.executeur?.nom || "Non assigné"}</td></tr>
                    <tr><td style={{ fontWeight: "700", color: "#64748b", padding: "4px 0" }}>Durée:</td><td style={{ fontWeight: "800", color: "#16a34a" }}>{getDisplayDuree()}</td></tr>
                    <tr><td style={{ fontWeight: "700", color: "#64748b", padding: "4px 0" }}>Statut final:</td><td>{ticket.statut}</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* DÉTAILS PANNE */}
          <div style={{ marginBottom: "25px" }}>
            <div style={{ background: "#f1f5f9", padding: "10px 15px", fontWeight: "700", fontSize: "12px", border: "1px solid #e2e8f0", borderBottom: "none", borderRadius: "12px 12px 0 0" }}>DÉTAILS DE LA PANNE / ARRÊT</div>
            <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "0 0 12px 12px", fontSize: "13px", lineHeight: "1.5" }}>
              <strong>Type d'arrêt :</strong> {ticket.typePanne}<br/>
              <strong>Description :</strong> {ticket.description}
            </div>
          </div>

          {/* TRAVAUX EFFECTUÉS */}
          <div style={{ marginBottom: "40px" }}>
            <div style={{ background: "#f1f5f9", padding: "10px 15px", fontWeight: "700", fontSize: "12px", border: "1px solid #e2e8f0", borderBottom: "none", borderRadius: "12px 12px 0 0" }}>TRAVAUX EFFECTUÉS & COMMENTAIRES</div>
            <div style={{ border: "1px solid #e2e8f0", padding: "15px", borderRadius: "0 0 12px 12px", fontSize: "13px", minHeight: "80px", lineHeight: "1.5" }}>
              {ticket.commentaireIntervention || "Aucun commentaire renseigné."}
            </div>
          </div>

          {/* SIGNATURES */}
          <div style={{ marginTop: "60px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "100px" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #334155", width: "200px", margin: "0 auto 10px", height: "40px" }}></div>
              <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>Visa Demandeur</p>
            </div>
            <div style={{ textAlign: "center" }}>
              <div style={{ borderBottom: "1px solid #334155", width: "200px", margin: "0 auto 10px", height: "40px" }}></div>
              <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", color: "#64748b" }}>Visa Maintenance</p>
            </div>
          </div>

          <div style={{ position: "fixed", bottom: "30px", left: "30px", right: "30px", fontSize: "9px", color: "#94a3b8", textAlign: "center", borderTop: "1px solid #f1f5f9", paddingTop: "10px" }}>
            Document officiel LEONI - L-DTM Management System - Ne pas jeter sur la voie publique
          </div>
        </div>
      </div>

      <style>{`
        @media screen {
          .print-only { display: none; }
        }
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; width: 100%; display: block !important; }
          body { background: white !important; margin: 0 !important; }
          @page { size: A4; margin: 0; }
        }
      `}</style>
    </>
  );
};

export default TicketDetailModal;
