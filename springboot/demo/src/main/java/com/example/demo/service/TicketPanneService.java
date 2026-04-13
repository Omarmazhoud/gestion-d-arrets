package com.example.demo.service;

import java.util.Date;
import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.demo.model.entity.Machine;
import com.example.demo.model.entity.TicketPanne;
import com.example.demo.model.entity.Utilisateur;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.model.enums.TypeExecuteur;
import com.example.demo.model.enums.TypePoste;
import com.example.demo.repository.MachineRepository;
import com.example.demo.repository.TicketPanneRepository;
import com.example.demo.repository.UtilisateurRepository;
import com.example.demo.repository.PieceRechangeRepository;
import com.example.demo.model.entity.PieceRechangeEntity;

@Service
@Transactional
public class TicketPanneService {

    private final TicketPanneRepository ticketRepo;
    private final UtilisateurRepository utilisateurRepo;
    private final MachineRepository machineRepo;
    private final FcmService fcmService;
    private final PieceRechangeRepository pieceRechangeRepository;
    private final NotificationPieceInconnueService notifPieceService;

    @Value("${PYTHON_API_URL:http://127.0.0.1:5000}")
    private String pythonApiUrl;

    public TicketPanneService(
            TicketPanneRepository ticketRepo,
            UtilisateurRepository utilisateurRepo,
            MachineRepository machineRepo,
            FcmService fcmService,
            PieceRechangeRepository pieceRechangeRepository,
            NotificationPieceInconnueService notifPieceService) {

        this.ticketRepo = ticketRepo;
        this.utilisateurRepo = utilisateurRepo;
        this.machineRepo = machineRepo;
        this.fcmService = fcmService;
        this.pieceRechangeRepository = pieceRechangeRepository;
        this.notifPieceService = notifPieceService;
    }

    // ================= CREATE TICKET =================
    public TicketPanne declarerPanne(
            TicketPanne ticket,
            String demandeurId,
            String machineId,
            String executeurCibleId) {

        Utilisateur demandeur = utilisateurRepo.findById(demandeurId)
                .orElseThrow(() -> new RuntimeException("Demandeur introuvable"));

        if (!demandeur.isActif()) {
            throw new RuntimeException("Compte demandeur non activé");
        }

        // ===== AUTO INFOS DEMANDEUR =====
        ticket.setDemandeur(demandeur);
        ticket.setNomPrenom(demandeur.getNom());
        ticket.setMatricule(demandeur.getMatricule());

        // ===== MACHINE =====
        if (ticket.getTypePoste() == TypePoste.MACHINE) {

            if (machineId == null || machineId.isEmpty()) {
                throw new RuntimeException("Machine obligatoire pour type MACHINE");
            }

            Machine machine = machineRepo.findById(machineId)
                    .orElseThrow(() -> new RuntimeException("Machine introuvable"));

            if (machine.isEnArret()) {
                throw new RuntimeException("Machine déjà en arrêt");
            }

            machine.setEnArret(true);
            machineRepo.save(machine);

            ticket.setMachine(machine);
        }

        // ===== INFOS TICKET =====
        ticket.setStatut(TicketStatus.OUVERTE);
        ticket.setDateCreation(new Date());

        // ===== APPEL IA (PYTHON) =====
        try {
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            java.util.Map<String, String> request = new java.util.HashMap<>();
            request.put("type_poste", ticket.getTypePoste() != null ? ticket.getTypePoste().name() : "autre");
            request.put("type_panne", ticket.getTypePanne() != null ? ticket.getTypePanne() : "autre");

            java.util.Map<String, Object> response = restTemplate.postForObject(
                pythonApiUrl + "/predict-executeur", 
                request, 
                java.util.Map.class
            );

            if (response != null) {
                if (response.containsKey("commentaire_ia") && response.get("commentaire_ia") != null) {
                    ticket.setCommentaireIa(response.get("commentaire_ia").toString());
                }
                if (response.containsKey("duree_estimee") && response.get("duree_estimee") != null) {
                    ticket.setDureeEstimee(Double.parseDouble(response.get("duree_estimee").toString()));
                }
            }
        } catch (Exception e) {
            System.err.println("⚠️ Erreur d'appel à l'API Python (IA): " + e.getMessage());
            ticket.setCommentaireIa("L'IA est actuellement indisponible.");
            ticket.setDureeEstimee(0.0);
        }

        // ===== PRE-ASSIGNATION PAR ADMIN =====
        if (executeurCibleId != null && !executeurCibleId.isEmpty()) {
            Utilisateur cible = utilisateurRepo.findById(executeurCibleId).orElse(null);
            if (cible != null) {
                ticket.setExecuteur(cible);
            }
        }

        TicketPanne saved = ticketRepo.save(ticket);

        // ===== NOTIFICATION AUX EXÉCUTEURS =====
        if (ticket.getExecuteur() != null) {
            // Notification ciblée
            fcmService.sendNotification(
                    ticket.getExecuteur().getPushToken(),
                    "Nouveau Ticket Assigné",
                    "Un ticket vous a été assigné directement.");
        } else {
            // Notification de groupe
            List<Utilisateur> executeurs = utilisateurRepo.findByTypeExecuteur(ticket.getTypeExecuteur());
            for (Utilisateur ex : executeurs) {
                fcmService.sendNotification(
                        ex.getPushToken(),
                        "Nouveau Ticket",
                        "Un nouveau ticket " + ticket.getTypePanne() + " est disponible.");
            }
        }

        return saved;
    }

    // ================= READ =================
    public List<TicketPanne> findAll() {
        return ticketRepo.findAll();
    }

    public TicketPanne findById(String id) {
        return ticketRepo.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket introuvable"));
    }

    public List<TicketPanne> findTicketsPourExecuteur(TypeExecuteur type, String executeurId) {
        Utilisateur exec = utilisateurRepo.findById(executeurId).orElse(null);

        if (type == TypeExecuteur.qualite) {
            return ticketRepo.findByStatutIn(List.of(TicketStatus.A_VERIFIER_QUALITE));
        }
        return ticketRepo.findPoolForExecuteur(
                type,
                List.of(TicketStatus.OUVERTE, TicketStatus.REFUSE_QUALITE, TicketStatus.REOUVERTE),
                exec);
    }

    public List<TicketPanne> findTicketsByExecuteur(String executeurId) {
        Utilisateur executeur = utilisateurRepo.findById(executeurId)
                .orElseThrow(() -> new RuntimeException("Executeur introuvable"));
        return ticketRepo.findByExecuteur(executeur);
    }

    public List<TicketPanne> findTicketsByDemandeur(String demandeurId) {
        Utilisateur demandeur = utilisateurRepo.findById(demandeurId)
                .orElseThrow(() -> new RuntimeException("Demandeur introuvable"));
        return ticketRepo.findByDemandeur(demandeur);
    }

    // ================= EXECUTEUR PREND TICKET =================
    public TicketPanne affecterExecuteur(String ticketId, String executeurId) {

        TicketPanne ticket = findById(ticketId);

        if (ticket.getExecuteur() != null) {
            throw new RuntimeException("Ticket déjà pris en charge");
        }

        if (ticket.getStatut() != TicketStatus.OUVERTE
                && ticket.getStatut() != TicketStatus.REFUSE_QUALITE
                && ticket.getStatut() != TicketStatus.REOUVERTE) {
            throw new RuntimeException("Le ticket ne peut pas être pris en charge dans son état actuel");
        }

        Utilisateur executeur = utilisateurRepo.findById(executeurId)
                .orElseThrow(() -> new RuntimeException("Exécuteur introuvable"));

        if (!executeur.isActif()) {
            throw new RuntimeException("Compte exécuteur non activé");
        }

        if (executeur.getTypeExecuteur() != ticket.getTypeExecuteur()) {
            throw new RuntimeException("Type d'exécuteur incompatible avec ce ticket");
        }

        ticket.setExecuteur(executeur);
        ticket.setStatut(TicketStatus.EN_COURS);
        ticket.setDateDebutIntervention(new Date());

        TicketPanne saved = ticketRepo.save(ticket);

        // Notification demandeur
        fcmService.sendNotification(
                ticket.getDemandeur().getPushToken(),
                "Ticket Pris en Charge",
                "Votre ticket a été pris en charge par " + executeur.getNom());

        return saved;
    }

    // ================= TERMINER INTERVENTION =================
    public TicketPanne terminerIntervention(String ticketId, TicketPanne data, boolean envoyerQualite) {
        try {
            System.out.println("DEBUG: Terminer intervention pour ticket " + ticketId);

            TicketPanne ticket = findById(ticketId);
            System.out.println("DEBUG: Ticket statut actuel: " + ticket.getStatut());

            if (ticket.getStatut() != TicketStatus.EN_COURS) {
                throw new RuntimeException("Le ticket n'est pas en cours (statut actuel: " + ticket.getStatut() + ")");
            }

            // Mise à jour des données
            if (data != null) {
                ticket.setCommentaireIntervention(data.getCommentaireIntervention());
                ticket.setReferencePiece(data.getReferencePiece());
                ticket.setImageIntervention(data.getImageIntervention());

                // GESTION DU STOCK ET NOTIFICATIONS POUR PIECE
                if (data.getReferencePiece() != null && !data.getReferencePiece().trim().isEmpty()) {
                    String[] refs = data.getReferencePiece().split(",");
                    for (String ref : refs) {
                        String trimRef = ref.trim();
                        if (!trimRef.isEmpty()) {
                            java.util.Optional<PieceRechangeEntity> optPiece = pieceRechangeRepository.findByReference(trimRef);
                            if (optPiece.isPresent()) {
                                PieceRechangeEntity piece = optPiece.get();
                                if (piece.getStock() != null && piece.getStock() > 0) {
                                    piece.setStock(piece.getStock() - 1);
                                    pieceRechangeRepository.save(piece);
                                }
                            } else {
                                notifPieceService.createNotification(trimRef, ticketId);
                            }
                        }
                    }
                }
            }

            if (envoyerQualite) {
                ticket.setStatut(TicketStatus.A_VERIFIER_QUALITE);
            } else {
                ticket.setStatut(TicketStatus.A_VERIFIER_DEMANDEUR);
            }

            ticket.setDateFinIntervention(new Date());

            // Calcul de la durée réelle en heures
            if (ticket.getDateDebutIntervention() != null) {
                long diffMillis = ticket.getDateFinIntervention().getTime() - ticket.getDateDebutIntervention().getTime();
                double hours = diffMillis / (1000.0 * 60 * 60);
                // On arrondit à 2 décimales
                ticket.setDuree(Math.round(hours * 100.0) / 100.0);
            }

            TicketPanne saved = ticketRepo.save(ticket);
            System.out.println("DEBUG: Ticket sauvegardé avec succès");

            // Notification
            try {
                if (envoyerQualite) {
                    List<Utilisateur> qualites = utilisateurRepo.findByTypeExecuteur(TypeExecuteur.qualite);
                    for (Utilisateur q : qualites) {
                        fcmService.sendNotification(q.getPushToken(), "Vérification Qualité", "Un ticket est prêt.");
                    }
                } else if (ticket.getDemandeur() != null) {
                    fcmService.sendNotification(ticket.getDemandeur().getPushToken(), "Intervention Terminée",
                            "Veuillez vérifier.");
                }
            } catch (Exception e) {
                System.err.println("DEBUG: Erreur notification (non critique): " + e.getMessage());
            }

            return saved;
        } catch (Exception e) {
            e.printStackTrace();
            throw new RuntimeException("Erreur lors de la clôture de l'intervention: " + e.getMessage());
        }
    }

    // ================= QUALITE VALIDE =================
    public TicketPanne validerQualite(String ticketId) {
        TicketPanne ticket = findById(ticketId);

        if (ticket.getStatut() != TicketStatus.A_VERIFIER_QUALITE) {
            throw new RuntimeException("Ticket non en attente de validation qualité");
        }

        ticket.setStatut(TicketStatus.A_VERIFIER_DEMANDEUR);
        TicketPanne saved = ticketRepo.save(ticket);

        // Notification demandeur
        fcmService.sendNotification(
                ticket.getDemandeur().getPushToken(),
                "Validation Qualité OK",
                "Le service Qualité a validé l'intervention. À vous de vérifier.");

        return saved;
    }

    // ================= QUALITE REFUSE =================
    public TicketPanne refuserQualite(String ticketId, String message) {
        TicketPanne ticket = findById(ticketId);

        if (ticket.getStatut() != TicketStatus.A_VERIFIER_QUALITE) {
            throw new RuntimeException("Ticket non en attente de validation qualité");
        }

        ticket.setStatut(TicketStatus.REFUSE_QUALITE);
        ticket.setCommentaireVerification(message);

        TicketPanne saved = ticketRepo.save(ticket);

        // Notification exécuteur
        if (ticket.getExecuteur() != null) {
            fcmService.sendNotification(
                    ticket.getExecuteur().getPushToken(),
                    "Refus Qualité",
                    "La Qualité a refusé votre intervention : " + message);
        }

        return saved;
    }

    // ================= DEMANDEUR VALIDE =================
    public TicketPanne validerCorrection(String ticketId) {

        TicketPanne ticket = findById(ticketId);

        if (ticket.getStatut() != TicketStatus.A_VERIFIER_DEMANDEUR) {
            throw new RuntimeException("Ticket non en attente de validation demandeur");
        }

        ticket.setStatut(TicketStatus.FERMEE);
        ticket.setDateFermeture(new Date());

        if (ticket.getMachine() != null) {
            Machine machine = ticket.getMachine();
            machine.setEnArret(false);
            machineRepo.save(machine);
        }

        TicketPanne saved = ticketRepo.save(ticket);

        // Notification exécuteur
        if (ticket.getExecuteur() != null) {
            fcmService.sendNotification(
                    ticket.getExecuteur().getPushToken(),
                    "Ticket Fermé",
                    "Le demandeur a validé votre intervention.");
        }

        return saved;
    }

    // ================= DEMANDEUR REFUSE =================
    public TicketPanne refuserCorrection(String ticketId, String message) {

        TicketPanne ticket = findById(ticketId);

        if (ticket.getStatut() != TicketStatus.A_VERIFIER_DEMANDEUR) {
            throw new RuntimeException("Ticket non en attente de validation demandeur");
        }

        ticket.setStatut(TicketStatus.REOUVERTE);
        ticket.setCommentaireVerification(message);

        TicketPanne saved = ticketRepo.save(ticket);

        // Notification exécuteur
        if (ticket.getExecuteur() != null) {
            fcmService.sendNotification(
                    ticket.getExecuteur().getPushToken(),
                    "Intervention Refusée",
                    "Le demandeur a refusé la correction : " + message);
        }

        return saved;
    }

    // ================= UPDATE INTERVENTION DATA =================
    public TicketPanne updateIntervention(String ticketId, TicketPanne data) {
        TicketPanne ticket = findById(ticketId);

        // On met à jour les champs techniques
        ticket.setCommentaireIntervention(data.getCommentaireIntervention());
        ticket.setReferencePiece(data.getReferencePiece());
        ticket.setImageIntervention(data.getImageIntervention());

        // Note: d'autres champs techniques (codes défauts) pourraient être ajoutés ici
        // si on veut les stocker proprement

        return ticketRepo.save(ticket);
    }

    // ================= DELETE =================
    public void delete(String id) {

        TicketPanne ticket = findById(id);

        if (ticket.getStatut() == TicketStatus.FERMEE) {
            throw new RuntimeException("Impossible de supprimer un ticket fermé");
        }

        ticketRepo.delete(ticket);
    }

    // ================= SUPER ADMIN FORCE UPDATE =================
    public TicketPanne forceUpdateStatus(String ticketId, TicketStatus newStatus, String adminId) {
        Utilisateur admin = utilisateurRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Administrateur introuvable"));

        if (admin.getRole() != com.example.demo.model.enums.Role.SUPER_ADMIN && 
            admin.getRole() != com.example.demo.model.enums.Role.ADMIN) {
            throw new RuntimeException("Accès refusé : Seul un administrateur peut forcer le statut.");
        }

        TicketPanne ticket = findById(ticketId);
        
        // Si on ferme le ticket, on libère aussi la machine
        if (newStatus == TicketStatus.FERMEE && ticket.getMachine() != null) {
            Machine m = ticket.getMachine();
            m.setEnArret(false);
            machineRepo.save(m);
        }

        if (newStatus == TicketStatus.FERMEE) {
            ticket.setDateFermeture(new Date());
        }

        ticket.setStatut(newStatus);
        return ticketRepo.save(ticket);
    }

    // ================= SUPER ADMIN UPDATE TICKET DATA =================
    public TicketPanne adminUpdateTicket(String ticketId, TicketPanne data, String adminId) {
        Utilisateur admin = utilisateurRepo.findById(adminId)
                .orElseThrow(() -> new RuntimeException("Administrateur introuvable"));

        if (admin.getRole() != com.example.demo.model.enums.Role.SUPER_ADMIN) {
            throw new RuntimeException("Accès refusé : Seul le super administrateur peut modifier complètement le ticket.");
        }

        TicketPanne ticket = findById(ticketId);
        
        if (data.getTypePanne() != null) ticket.setTypePanne(data.getTypePanne());
        if (data.getDescription() != null) ticket.setDescription(data.getDescription());
        if (data.getSegment() != null) ticket.setSegment(data.getSegment());
        if (data.getEquipement() != null) ticket.setEquipement(data.getEquipement());
        if (data.getNumeroSerie() != null) ticket.setNumeroSerie(data.getNumeroSerie());
        if (data.getReferencePiece() != null) ticket.setReferencePiece(data.getReferencePiece());
        if (data.getRemarque() != null) ticket.setRemarque(data.getRemarque());
        if (data.getCommentaireIntervention() != null) ticket.setCommentaireIntervention(data.getCommentaireIntervention());
        if (data.getCommentaireVerification() != null) ticket.setCommentaireVerification(data.getCommentaireVerification());
        if (data.getDuree() != null) ticket.setDuree(data.getDuree());

        // Update statut if changed and handle machine state if closing
        if (data.getStatut() != null && data.getStatut() != ticket.getStatut()) {
            if (data.getStatut() == TicketStatus.FERMEE && ticket.getMachine() != null) {
                Machine m = ticket.getMachine();
                m.setEnArret(false);
                machineRepo.save(m);
                ticket.setDateFermeture(new Date());
            }
            ticket.setStatut(data.getStatut());
        }

        return ticketRepo.save(ticket);
    }
}