package com.example.demo.service;

import com.example.demo.model.entity.FournisseurEntity;
import com.example.demo.repository.FournisseurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class FournisseurService {

    @Autowired
    private FournisseurRepository fournisseurRepository;

    public List<FournisseurEntity> getAll() {
        return fournisseurRepository.findAll();
    }

    public FournisseurEntity getById(String id) {
        return fournisseurRepository.findById(id).orElseThrow(() -> new RuntimeException("Fournisseur non trouvé"));
    }

    public FournisseurEntity create(FournisseurEntity fournisseur) {
        return fournisseurRepository.save(fournisseur);
    }

    public FournisseurEntity update(String id, FournisseurEntity newFournisseur) {
        FournisseurEntity existing = getById(id);
        existing.setNom(newFournisseur.getNom());
        existing.setNumeroTelephone(newFournisseur.getNumeroTelephone());
        existing.setAdresse(newFournisseur.getAdresse());
        existing.setEmail(newFournisseur.getEmail());
        existing.setLieu(newFournisseur.getLieu());
        return fournisseurRepository.save(existing);
    }

    public void delete(String id) {
        if (!fournisseurRepository.existsById(id)) {
            throw new RuntimeException("Fournisseur non trouvé");
        }
        fournisseurRepository.deleteById(id);
    }
}
