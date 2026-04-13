package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.entity.Poste;
import com.example.demo.model.enums.TypePoste;
import com.example.demo.repository.PosteRepository;

@RestController
@RequestMapping("/api/postes")
@CrossOrigin(origins = "http://localhost:3000") // important pour React
public class PosteController {

    private final PosteRepository posteRepository;

    public PosteController(PosteRepository posteRepository) {
        this.posteRepository = posteRepository;
    }

    // 🔹 GET ALL
    @GetMapping
    public List<Poste> getAllPostes() {
        return posteRepository.findAll();
    }

    // 🔹 GET BY TYPE (IMPORTANT pour ton système dynamique)
    @GetMapping("/type/{type}")
    public List<Poste> getPostesByType(@PathVariable TypePoste type) {
        return posteRepository.findByTypePoste(type);
    }

    // 🔹 CREATE (Super Admin ajoute machine)
    @PostMapping
    public Poste createPoste(@RequestBody Poste poste) {
        return posteRepository.save(poste);
    }

    // 🔹 DELETE
    @DeleteMapping("/{id}")
    public void deletePoste(@PathVariable String id) {
        posteRepository.deleteById(id);
    }
}
