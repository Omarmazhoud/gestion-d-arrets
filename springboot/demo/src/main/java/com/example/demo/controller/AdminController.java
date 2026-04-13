package com.example.demo.controller;

import com.example.demo.model.entity.Utilisateur;
import com.example.demo.service.UtilisateurService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final UtilisateurService utilisateurService;

    public AdminController(UtilisateurService utilisateurService) {
        this.utilisateurService = utilisateurService;
    }

    @PutMapping("/valider/{id}")
    public Utilisateur validerCompte(@PathVariable String id) {
        return utilisateurService.validerCompte(id);
    }
}
