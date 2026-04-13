
package com.example.demo.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
            utilisateur.setEmail(utilisateur.getEmail().trim().toLowerCase());
        }
        utilisateur.setActif(false); // en attente validation
        return utilisateurRepository.save(utilisateur);
    }

    public Utilisateur login(String email, String password) {
        String normalizedEmail = (email != null) ? email.trim().toLowerCase() : "";
        System.out.println("DEBUG: Tentative de login pour l'email: [" + normalizedEmail + "]");

        Utilisateur user = utilisateurRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: Utilisateur non trouvé pour [" + normalizedEmail + "]");
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
        return utilisateurRepository.save(user);
    }

    public void logout(String userId) {
        Utilisateur user = utilisateurRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        user.setOnline(false);
        utilisateurRepository.save(user);
    }
}
