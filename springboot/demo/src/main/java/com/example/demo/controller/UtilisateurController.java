package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.entity.Utilisateur;
import com.example.demo.service.UtilisateurService;

@RestController
@RequestMapping("/api/utilisateurs")
@CrossOrigin(origins = "*")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    public UtilisateurController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    // CREATE
    @PostMapping
    public Utilisateur create(@RequestBody Utilisateur utilisateur) {
        return utilisateurService.create(utilisateur);
    }

    // GET ALL
    @GetMapping
    public List<Utilisateur> getAll() {
        return utilisateurService.findAll();
    }

    // GET ONLINE EXECUTEURS
    @GetMapping("/online/executeur/{type}")
    public List<Utilisateur> getOnlineExecuteurs(@PathVariable com.example.demo.model.enums.TypeExecuteur type) {
        return utilisateurService.getOnlineExecuteurs(type);
    }

    // GET BY ID
    @GetMapping("/{id}")
    public Utilisateur getById(@PathVariable String id) {
        return utilisateurService.findById(id);
    }

    // 🔥 VALIDATION (IMPORTANT)
    @PutMapping("/{id}/valider")
    public Utilisateur validateUser(@PathVariable String id) {
        return utilisateurService.validerCompte(id);
    }

    // DELETE
    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        utilisateurService.delete(id);
    }

    // 📱 PUSH TOKEN
    @PutMapping("/{id}/push-token")
    public void updatePushToken(
            @PathVariable String id,
            @RequestBody String token) {
        utilisateurService.updatePushToken(id, token);
    }
    @PutMapping("/{id}")
public Utilisateur update(@PathVariable String id, @RequestBody Utilisateur user) {
    return utilisateurService.update(id, user);
}
}
