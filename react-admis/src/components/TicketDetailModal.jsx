import React, { useRef } from "react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { forceUpdateStatus } from "../services/ticketService";

const TicketDetailModal = ({ ticket, onClose }) => {
  const contentRef = useRef();

  if (!ticket) return null;

  const handleDownloadPDF = async () => {
    const element = contentRef.current;
    
    // On cache temporairement les boutons pour le PDF
    const footer = element.querySelector('.modal-footer-pdf');
    if (footer) footer.style.display = 'none';

    try {
      const canvas = await html2canvas(element, { 
        scale: 2,
        useCORS: true,
        logging: false
      });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      
      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, "PNG", 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }
      
      pdf.save(`Rapport_Ticket_${ticket.id.substring(0, 8)}.pdf`);
    } catch (error) {
      console.error("Erreur PDF:", error);
    } finally {
      if (footer) footer.style.display = 'block';
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleString('fr-FR');
  };

  const formatOnlyDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('fr-FR');
  };

  return (
    <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.6)", zIndex: 1050 }}>
      <div className="modal-dialog modal-xl modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg" ref={contentRef}>
          
          {/* HEADER */}
          <div className="modal-header bg-dark text-white p-4">
            <div>
              <h5 className="modal-title mb-1">Rapport d'Intervention Maintenance</h5>
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
                    <div className="card-header bg-primary text-white fw-bold">
                      <i className="bi bi-person-fill me-2"></i>PARTIE DEMANDEUR
                    </div>
                    <div className="card-body">
                      <table className="table table-sm table-borderless mb-0">
                        <tbody>
                          <tr><th width="40%">Nom & Prénom:</th><td>{ticket.nomPrenom}</td></tr>
                          <tr><th>Matricule:</th><td>{ticket.matricule}</td></tr>
                          <tr><th>Segment:</th><td>{ticket.segment || "N/A"}</td></tr>
                          <tr><th>Équipement:</th><td>{ticket.equipement || ticket.machine?.nom || "N/A"}</td></tr>
                          <tr><th>N° Série:</th><td>{ticket.numeroSerie || "N/A"}</td></tr>
                          <tr><th>Type Poste:</th><td>{ticket.typePoste || "N/A"}</td></tr>
                          <tr><th>Secteur:</th><td>{ticket.secteurType || "N/A"}</td></tr>
                          <tr className="table-warning">
                            <th>Équipement en arrêt:</th>
                            <td className="fw-bold">{ticket.equipementArret ? "OUI" : "NON"}</td>
                          </tr>
                          {ticket.equipementArret && (
                            <>
                              <tr><th>Date d'arrêt:</th><td>{formatOnlyDate(ticket.dateArret)}</td></tr>
                              <tr><th>Heure d'arrêt:</th><td>{ticket.heureArret || "N/A"}</td></tr>
                            </>
                          )}
                        </tbody>
                      </table>
                      <hr />
                      <div className="mb-3">
                        <label className="fw-bold text-primary small d-block mb-1">Type de Panne:</label>
                        <p className="mb-2 p-2 bg-white rounded border">{ticket.typePanne}</p>
                        
                        <label className="fw-bold text-primary small d-block mb-1">Description:</label>
                        <p className="mb-3 p-2 bg-white rounded border" style={{ minHeight: "60px" }}>{ticket.description}</p>

                        {ticket.commentaireIa && (
                          <div className="p-3 border rounded shadow-sm" style={{ backgroundColor: "#f0f9ff", borderColor: "#bae6fd" }}>
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <label className="fw-bold small d-block mb-0" style={{ color: "#0ea5e9" }}>
                                <i className="bi bi-robot me-2 fs-6"></i>Analyse de l'IA:
                              </label>
                              {ticket.dureeEstimee && (
                                <span className="badge rounded-pill" style={{ backgroundColor: "#0ea5e9" }}>
                                  <i className="bi bi-clock-history me-1"></i>Est: {ticket.dureeEstimee}h
                                </span>
                              )}
                            </div>
                            <p className="mb-0 small text-dark fst-italic">« {ticket.commentaireIa} »</p>
                          </div>
                        )}
                      </div>

                      {ticket.imagePanne && (
                        <div className="text-center mt-3">
                          <label className="fw-bold text-muted small d-block mb-2">Photo de la panne:</label>
                          <img src={ticket.imagePanne} className="img-fluid rounded border shadow-sm" style={{ maxHeight: "250px" }} alt="Panne" />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* COLONNE DROITE: MAINTENANCIER */}
                <div className="col-md-6">
                  <div className="card h-100 border-0 shadow-sm bg-light">
                    <div className="card-header bg-success text-white fw-bold">
                      <i className="bi bi-tools me-2"></i>PARTIE EXÉCUTEUR (Maintenance)
                    </div>
                    <div className="card-body">
                      {ticket.executeur ? (
                        <>
                          <table className="table table-sm table-borderless mb-0">
                            <tbody>
                              <tr><th width="40%">Intervenant:</th><td>{ticket.executeur.nom}</td></tr>
                              <tr><th>Type Exécuteur:</th><td>{ticket.typeExecuteur || "N/A"}</td></tr>
                              <tr><th>Référence Pièce:</th><td>{ticket.referencePiece || "N/A"}</td></tr>
                               <tr><th>Date Début:</th><td>{formatDate(ticket.dateDebutIntervention)}</td></tr>
                              <tr><th>Date Fin:</th><td>{formatDate(ticket.dateFinIntervention)}</td></tr>
                              {ticket.duree && (
                                <tr className="table-success">
                                  <th>Durée Réelle:</th>
                                  <td className="fw-bold text-success">{ticket.duree} heures</td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                          <hr />
                          <div className="mb-3">
                            <label className="fw-bold text-success small d-block mb-1">Commentaires Travaux:</label>
                            <p className="mb-0 p-2 bg-white rounded border" style={{ minHeight: "80px" }}>{ticket.commentaireIntervention || "Aucun commentaire renseigné."}</p>
                          </div>

                          {ticket.imageIntervention && (
                            <div className="text-center mt-3">
                              <label className="fw-bold text-muted small d-block mb-2">Photo de la pièce / intervention:</label>
                              <img src={ticket.imageIntervention} className="img-fluid rounded border shadow-sm" style={{ maxHeight: "250px" }} alt="Intervention" />
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="text-center py-5 text-muted">
                          <i className="bi bi-hourglass-split display-4 d-block mb-3"></i>
                          Prise en charge en attente...
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* BAS: TIMELINE & VALIDATION */}
                <div className="col-12 mt-4">
                  <div className="card border-0 shadow-sm">
                    <div className="card-body p-4">
                      <div className="row">
                        <div className="col-12 ps-4">
                          <h6 className="fw-bold text-muted mb-4 text-uppercase small">Cycle de Vie du Ticket</h6>
                          <div className="timeline-steps position-relative">
                            
                            {/* ÉTAPE : CRÉATION */}
                            <div className="d-flex mb-4">
                              <div className="timeline-icon bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: "35px", height: "35px" }}>
                                <i className="bi bi-plus-circle fs-6"></i>
                              </div>
                              <div className="border-bottom pb-2 w-100">
                                <span className="badge bg-light text-primary border float-end">{formatOnlyDate(ticket.dateCreation)}</span>
                                <p className="mb-0 fw-bold small text-primary text-uppercase">Ouverture du Ticket</p>
                                <p className="text-muted small mb-0">Créé à {new Date(ticket.dateCreation).toLocaleTimeString()}</p>
                              </div>
                            </div>

                            {/* ÉTAPE : PRISE EN CHARGE */}
                            <div className="d-flex mb-4 opacity-75">
                              <div className={`timeline-icon ${ticket.dateDebutIntervention ? 'bg-success' : 'bg-secondary'} text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm`} style={{ width: "35px", height: "35px" }}>
                                <i className="bi bi-play-fill fs-5"></i>
                              </div>
                              <div className="border-bottom pb-2 w-100">
                                {ticket.dateDebutIntervention ? (
                                  <>
                                    <span className="badge bg-light text-success border float-end">{formatOnlyDate(ticket.dateDebutIntervention)}</span>
                                    <p className="mb-0 fw-bold small text-success text-uppercase">Prise en charge</p>
                                    <p className="text-muted small mb-0">Par {ticket.executeur?.nom} à {new Date(ticket.dateDebutIntervention).toLocaleTimeString()}</p>
                                  </>
                                ) : (
                                  <p className="mb-0 text-muted small fst-italic">En attente d'un technicien...</p>
                                )}
                              </div>
                            </div>

                            {/* ÉTAPE : FIN RÉPARATION */}
                            <div className="d-flex mb-4">
                              <div className={`timeline-icon ${ticket.dateFinIntervention ? 'bg-info' : 'bg-secondary text-opacity-50'} text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm`} style={{ width: "35px", height: "35px" }}>
                                <i className="bi bi-tools fs-6"></i>
                              </div>
                              <div className="border-bottom pb-2 w-100">
                                {ticket.dateFinIntervention ? (
                                  <>
                                    <span className="badge bg-light text-info border float-end">{formatOnlyDate(ticket.dateFinIntervention)}</span>
                                    <p className="mb-0 fw-bold small text-info text-uppercase">Réparation Terminée</p>
                                    <p className="text-muted small mb-0">Signalé à {new Date(ticket.dateFinIntervention).toLocaleTimeString()}</p>
                                  </>
                                ) : (
                                  <p className="mb-0 text-muted small fst-italic">Intervention non achevée.</p>
                                )}
                              </div>
                            </div>

                            {/* ÉTAPE : VALIDATION (Phase actuelle ou passée) */}
                            {['A_VERIFIER_QUALITE', 'A_VERIFIER_DEMANDEUR', 'FERMEE'].includes(ticket.statut) && (
                              <div className="d-flex mb-4">
                                <div className="timeline-icon bg-warning text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm" style={{ width: "35px", height: "35px" }}>
                                  <i className="bi bi-clipboard-check fs-6"></i>
                                </div>
                                <div className="border-bottom pb-2 w-100">
                                  <p className="mb-0 fw-bold small text-warning text-uppercase">Phase de Validation</p>
                                  <p className="text-muted small mb-0">
                                    {ticket.statut === 'A_VERIFIER_QUALITE' && "En attente du service Qualité."}
                                    {ticket.statut === 'A_VERIFIER_DEMANDEUR' && "En attente du demandeur."}
                                    {ticket.statut === 'FERMEE' && "Validation validée avec succès."}
                                  </p>
                                </div>
                              </div>
                            )}

                            {/* ÉTAPE : CLÔTURE */}
                            <div className="d-flex mb-0">
                              <div className={`timeline-icon ${ticket.dateFermeture ? 'bg-dark' : 'bg-secondary text-opacity-50'} text-white rounded-circle d-flex align-items-center justify-content-center me-3 shadow-sm`} style={{ width: "35px", height: "35px" }}>
                                <i className="bi bi-flag-fill fs-6"></i>
                              </div>
                              <div className="w-100">
                                {ticket.dateFermeture ? (
                                  <>
                                    <span className="badge bg-dark text-white border-0 float-end">{formatOnlyDate(ticket.dateFermeture)}</span>
                                    <p className="mb-0 fw-bold small text-dark text-uppercase">Clôture Finale</p>
                                    <p className="text-muted small mb-0">Ticket fermé à {new Date(ticket.dateFermeture).toLocaleTimeString()}</p>
                                  </>
                                ) : (
                                  <p className="mb-0 text-muted small fst-italic">Cycle non terminé.</p>
                                )}
                              </div>
                            </div>

                          </div>
                        </div>
                        <div className="col-md-6 ps-4">
                          <h6 className="fw-bold text-muted mb-3 text-uppercase small">Validation & Qualité</h6>
                          {ticket.commentaireVerification ? (
                            <div className="p-3 bg-warning bg-opacity-10 border border-warning rounded">
                              <p className="mb-0 text-dark small">
                                <i className="bi bi-info-circle-fill text-warning me-2"></i>
                                <strong>Commentaire de vérification:</strong><br />
                                {ticket.commentaireVerification}
                              </p>
                            </div>
                          ) : (
                            <p className="text-muted small italic">Aucun commentaire de vérification pour le moment.</p>
                          )}

                          <div className="mt-4">
                            <label className="fw-bold text-muted small d-block mb-1">Remarque additionnelle:</label>
                            <p className="text-dark small border-bottom">{ticket.remarque || "Néant"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>

          <div className="modal-footer bg-light p-3 modal-footer-pdf d-flex justify-content-between">
            <div>
              {JSON.parse(localStorage.getItem("user"))?.role === "SUPER_ADMIN" && (
                <div className="d-flex align-items-center gap-2">
                  <select 
                    className="form-select form-select-sm" 
                    style={{ width: "200px" }}
                    id="forceStatusSelect"
                  >
                    <option value="OUVERTE">OUVERTE</option>
                    <option value="EN_COURS">EN_COURS</option>
                    <option value="A_VERIFIER_QUALITE">A_VERIFIER_QUALITE</option>
                    <option value="A_VERIFIER_DEMANDEUR">A_VERIFIER_DEMANDEUR</option>
                    <option value="FERMEE">FERMEE</option>
                    <option value="REOUVERTE">REOUVERTE</option>
                  </select>
                  <button 
                    className="btn btn-sm btn-danger"
                    onClick={async () => {
                      const newStatus = document.getElementById("forceStatusSelect").value;
                      const adminId = JSON.parse(localStorage.getItem("user")).id;
                      if(window.confirm(`Forcer le statut à ${newStatus} ?`)) {
                        try {
                          await forceUpdateStatus(ticket.id, newStatus, adminId);
                          alert("Statut mis à jour !");
                          window.location.reload();
                        } catch (e) {
                          alert("Erreur : " + e.message);
                        }
                      }
                    }}
                  >
                    Forcer Statut
                  </button>
                </div>
              )}
            </div>
            <div>
              <button type="button" className="btn btn-secondary border-0 px-4 me-2" onClick={onClose}>Fermer</button>
              <button type="button" className="btn btn-primary border-0 px-4 shadow-sm" onClick={handleDownloadPDF}>
                <i className="bi bi-file-earmark-pdf-fill me-2"></i>Générer le Rapport PDF
              </button>
            </div>
          </div>

        </div>
      </div>
      
      {/* Styles inline pour assurer un bon rendu PDF */}
      <style>{`
        .modal-body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .card-header { font-size: 0.9rem; letter-spacing: 0.5px; }
        .table-sm th { color: #6c757d; font-size: 0.85rem; font-weight: 600; }
        .table-sm td { font-size: 0.9rem; font-weight: 500; }
        @media print {
          .modal-footer { display: none !important; }
        }
      `}</style>
    </div>
  );
};

export default TicketDetailModal;
