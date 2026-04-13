package com.example.demo.controller;

import com.example.demo.model.entity.SecteurEntity;
import com.example.demo.service.SecteurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/secteurs")
@CrossOrigin("*")
public class SecteurController {

    @Autowired
    private SecteurService secteurService;

    @GetMapping
    public ResponseEntity<List<SecteurEntity>> getAll() {
        return ResponseEntity.ok(secteurService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody SecteurEntity secteur) {
        try {
            return ResponseEntity.ok(secteurService.create(secteur));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody SecteurEntity newSecteur) {
        try {
            return ResponseEntity.ok(secteurService.update(id, newSecteur));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            secteurService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
