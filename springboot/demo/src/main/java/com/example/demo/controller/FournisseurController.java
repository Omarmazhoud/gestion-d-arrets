package com.example.demo.controller;

import com.example.demo.model.entity.FournisseurEntity;
import com.example.demo.service.FournisseurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fournisseurs")
@CrossOrigin("*")
public class FournisseurController {

    @Autowired
    private FournisseurService fournisseurService;

    @GetMapping
    public ResponseEntity<List<FournisseurEntity>> getAll() {
        return ResponseEntity.ok(fournisseurService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody FournisseurEntity fournisseur) {
        try {
            return ResponseEntity.ok(fournisseurService.create(fournisseur));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody FournisseurEntity newFournisseur) {
        try {
            return ResponseEntity.ok(fournisseurService.update(id, newFournisseur));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            fournisseurService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
