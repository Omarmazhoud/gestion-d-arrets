package com.example.demo.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.stereotype.Service;

import com.example.demo.model.entity.Poste;
import com.example.demo.repository.PosteRepository;
import com.example.demo.repository.TicketPanneRepository;
import com.example.demo.repository.UtilisateurRepository;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.model.enums.Role;

@Service
public class StatsService {

    private final TicketPanneRepository ticketRepo;
    private final PosteRepository posteRepo;
    private final UtilisateurRepository utilisateurRepo;

    public StatsService(TicketPanneRepository ticketRepo,
            PosteRepository posteRepo,
            UtilisateurRepository utilisateurRepo) {
        this.ticketRepo = ticketRepo;
        this.posteRepo = posteRepo;
        this.utilisateurRepo = utilisateurRepo;
    }

    public Map<String, Object> getGlobalStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", utilisateurRepo.count());
        stats.put("totalTickets", ticketRepo.count());
        stats.put("ticketsOuverts", ticketRepo.countByStatut(TicketStatus.OUVERTE));
        stats.put("ticketsEnCours", ticketRepo.countByStatut(TicketStatus.EN_COURS));
        stats.put("ticketsVerifier",
                ticketRepo.countByStatut(TicketStatus.A_VERIFIER_QUALITE) +
                        ticketRepo.countByStatut(TicketStatus.A_VERIFIER_DEMANDEUR));
        stats.put("ticketsFermes", ticketRepo.countByStatut(TicketStatus.FERMEE));

        // Nouveaux stats présence en ligne
        stats.put("onlineTotal", utilisateurRepo.countByIsOnlineTrue());
        stats.put("onlineDemandeurs", utilisateurRepo.countByIsOnlineTrueAndRole(Role.DEMANDEUR));
        stats.put("onlineExecuteurs", utilisateurRepo.countByIsOnlineTrueAndRole(Role.EXECUTEUR));
        stats.put("onlineAdmins", 
            utilisateurRepo.countByIsOnlineTrueAndRole(Role.ADMIN) + 
            utilisateurRepo.countByIsOnlineTrueAndRole(Role.SUPER_ADMIN));
            
        return stats;
    }

    public List<Map<String, Object>> statsPostes() {
        List<Object[]> results = ticketRepo.countTicketsByTypePoste();
        List<Map<String, Object>> stats = new ArrayList<>();

        for (Object[] row : results) {
            com.example.demo.model.enums.TypePoste typePoste = (com.example.demo.model.enums.TypePoste) row[0];
            Long count = (Long) row[1];

            List<Poste> postes = posteRepo.findByTypePoste(typePoste);
            String label = (postes != null && !postes.isEmpty()) ? postes.get(0).getNomPoste() : typePoste.toString();

            Map<String, Object> map = new HashMap<>();
            map.put("poste", label);
            map.put("nombrePannes", count);

            stats.add(map);
        }

        return stats;
    }
}
