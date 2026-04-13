package com.example.demo.controller;

import com.example.demo.model.entity.PieceRechangeEntity;
import com.example.demo.service.PieceRechangeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pieces-rechange")
@CrossOrigin("*")
public class PieceRechangeController {

    @Autowired
    private PieceRechangeService pieceRechangeService;

    @GetMapping
    public ResponseEntity<List<PieceRechangeEntity>> getAll() {
        return ResponseEntity.ok(pieceRechangeService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody PieceRechangeEntity pieceRechange) {
        try {
            return ResponseEntity.ok(pieceRechangeService.create(pieceRechange));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody PieceRechangeEntity newPiece) {
        try {
            return ResponseEntity.ok(pieceRechangeService.update(id, newPiece));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            pieceRechangeService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
