package com.example.demo.service;

import com.example.demo.model.entity.FournisseurEntity;
import com.example.demo.model.entity.PieceRechangeEntity;
import com.example.demo.repository.FournisseurRepository;
import com.example.demo.repository.PieceRechangeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PieceRechangeService {

    @Autowired
    private PieceRechangeRepository pieceRechangeRepository;

    @Autowired
    private FournisseurRepository fournisseurRepository;

    public List<PieceRechangeEntity> getAll() {
        return pieceRechangeRepository.findAll();
    }

    public PieceRechangeEntity getById(String id) {
        return pieceRechangeRepository.findById(id).orElseThrow(() -> new RuntimeException("Pièce de rechange non trouvée"));
    }

    public PieceRechangeEntity create(PieceRechangeEntity pieceRechange) {
        if (pieceRechange.getFournisseur() != null && pieceRechange.getFournisseur().getId() != null) {
            FournisseurEntity f = fournisseurRepository.findById(pieceRechange.getFournisseur().getId())
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
            pieceRechange.setFournisseur(f);
        } else {
            pieceRechange.setFournisseur(null);
        }
        return pieceRechangeRepository.save(pieceRechange);
    }

    public PieceRechangeEntity update(String id, PieceRechangeEntity newPiece) {
        PieceRechangeEntity existing = getById(id);
        existing.setReference(newPiece.getReference());
        existing.setNom(newPiece.getNom());
        existing.setStock(newPiece.getStock());

        if (newPiece.getFournisseur() != null && newPiece.getFournisseur().getId() != null) {
            FournisseurEntity f = fournisseurRepository.findById(newPiece.getFournisseur().getId())
                .orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
            existing.setFournisseur(f);
        } else {
            existing.setFournisseur(null);
        }
        
        return pieceRechangeRepository.save(existing);
    }

    public void delete(String id) {
        if (!pieceRechangeRepository.existsById(id)) {
            throw new RuntimeException("Pièce de rechange non trouvée");
        }
        pieceRechangeRepository.deleteById(id);
    }
}
