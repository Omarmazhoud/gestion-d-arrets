package com.example.demo.service;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.demo.model.entity.Utilisateur;
import com.example.demo.model.enums.Role;
import com.example.demo.repository.UtilisateurRepository;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final MailService mailService; // 🔥 ACTIF

    // CONSTRUCTEUR
    public UtilisateurService(
            UtilisateurRepository utilisateurRepository,
            MailService mailService) {
        this.utilisateurRepository = utilisateurRepository;
        this.mailService = mailService; // 🔥 ACTIF
    }

    // =========================
    // CREATE
    // =========================
    public Utilisateur create(Utilisateur utilisateur) {

        if (utilisateur.getRole() == null) {
            throw new RuntimeException("Le rôle est obligatoire");
        }

        utilisateur.setActif(false);

        return utilisateurRepository.save(utilisateur);
    }

    // =========================
    // READ
    // =========================
    public List<Utilisateur> findAll() {
        return utilisateurRepository.findAll();
    }

    public List<Utilisateur> getOnlineExecuteurs(com.example.demo.model.enums.TypeExecuteur type) {
        return utilisateurRepository.findByRoleAndTypeExecuteurAndIsOnlineTrue(Role.EXECUTEUR, type);
    }

    public Utilisateur findById(String id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable"));
    }

    // =========================
    // VALIDATION ADMIN
    // =========================
    public Utilisateur validerCompte(String id) {

        Utilisateur user = findById(id);

        if (user.isActif()) {
            throw new RuntimeException("Compte déjà activé");
        }

        user.setActif(true);
        Utilisateur saved = utilisateurRepository.save(user);

        mailService.envoyerValidationCompte(saved);

        return saved;
    }
// =========================
// UPDATE
// =========================
public Utilisateur update(String id, Utilisateur newUser) {

    Utilisateur user = findById(id);

    user.setNom(newUser.getNom());
    user.setEmail(newUser.getEmail());
    user.setMatricule(newUser.getMatricule());
    user.setRole(newUser.getRole());

    // Si password non vide → modifier
    if (newUser.getPassword() != null && !newUser.getPassword().isEmpty()) {
        user.setPassword(newUser.getPassword());
    }

    return utilisateurRepository.save(user);
}
    // =========================
    // DELETE
    // =========================
    public void delete(String id) {
        utilisateurRepository.deleteById(id);
    }

    public void updatePushToken(String id, String token) {
        Utilisateur user = findById(id);
        user.setPushToken(token);
        utilisateurRepository.save(user);
    }

    // =========================
    // MÉTIER
    // =========================
    public boolean estDemandeur(Utilisateur u) {
        return u.getRole() == Role.DEMANDEUR;
    }

    public boolean estExecuteur(Utilisateur u) {
        return u.getRole() == Role.EXECUTEUR;
    }

    public boolean estAdmin(Utilisateur u) {
        return u.getRole() == Role.SUPER_ADMIN;
    }
}
