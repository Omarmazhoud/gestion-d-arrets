
package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

import com.example.demo.model.entity.Utilisateur;
import com.example.demo.repository.UtilisateurRepository;

@Service
@Transactional
public class AuthService {

    private final UtilisateurRepository utilisateurRepository;

    public AuthService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }

    public Utilisateur register(Utilisateur utilisateur) {
        if (utilisateur.getEmail() != null) {
            String email = utilisateur.getEmail().trim().toLowerCase();
            utilisateur.setEmail(email);
            
            // Check if email already exists for a non-deleted user
            if (utilisateurRepository.findFirstByEmailIgnoreCaseAndDeletedFalse(email).isPresent()) {
                throw new RuntimeException("Cet email est déjà utilisé");
            }
        }
        utilisateur.setActif(false); // en attente validation
        utilisateur.setDeleted(false);
        return utilisateurRepository.save(utilisateur);
    }

    public Utilisateur login(String email, String password) {
        String normalizedEmail = (email != null) ? email.trim().toLowerCase() : "";
        System.out.println("DEBUG: Tentative de login pour l'email: [" + normalizedEmail + "]");

        Utilisateur user = utilisateurRepository.findFirstByEmailIgnoreCaseAndDeletedFalse(normalizedEmail)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: Utilisateur non trouvé ou supprimé pour [" + normalizedEmail + "]");
                    return new RuntimeException("Email incorrect");
                });

        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Mot de passe incorrect");
        }

        // 🔒 RÈGLE MÉTIER CLÉ
        if (!user.isActif()) {
            throw new RuntimeException("Compte non validé par l’administrateur");
        }

        user.setOnline(true);
        user.setDerniereActivite(LocalDateTime.now());
        return utilisateurRepository.save(user);
    }

    public void logout(String userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setOnline(false);
        utilisateurRepository.save(user);
    }

    public void updateLastActivity(String userId) {
        Utilisateur user = utilisateurRepository.findById(userId).orElse(null);
        if (user != null) {
            user.setDerniereActivite(LocalDateTime.now());
            user.setOnline(true);
            utilisateurRepository.save(user);
        }
    }
}
