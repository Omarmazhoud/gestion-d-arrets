package com.example.demo.task;

import com.example.demo.model.entity.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class UserPresenceTask {

    private final UtilisateurRepository utilisateurRepository;

    public UserPresenceTask(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    /**
     * S'exécute toutes les minutes pour déconnecter les utilisateurs inactifs.
     * Délai de sécurité : 30 minutes.
     */
    @Scheduled(fixedRate = 60000)
    public void cleanupInactiveUsers() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(30);
        
        // 1. Déconnecter ceux qui n'ont pas pingé depuis 30 min
        List<Utilisateur> inactiveUsers = utilisateurRepository.findByIsOnlineTrueAndDerniereActiviteBefore(threshold);
        
        // 2. Déconnecter les anciens (derniereActivite est nulle) qui sont marqués Online
        List<Utilisateur> orphanedUsers = utilisateurRepository.findByIsOnlineTrueAndDerniereActiviteIsNull();
        
        inactiveUsers.addAll(orphanedUsers);
        
        if (!inactiveUsers.isEmpty()) {
            System.out.println("CLEANUP: Déconnexion de " + inactiveUsers.size() + " utilisateur(s) inactif(s).");
            for (Utilisateur user : inactiveUsers) {
                user.setOnline(false);
            }
            utilisateurRepository.saveAll(inactiveUsers);
        }
    }
}
