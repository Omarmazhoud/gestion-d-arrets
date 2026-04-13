package com.example.demo.service;

import com.example.demo.model.entity.SecteurEntity;
import com.example.demo.repository.SecteurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SecteurService {

    @Autowired
    private SecteurRepository secteurRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<SecteurEntity> getAll() {
        return secteurRepository.findAll();
    }

    @Transactional
    public SecteurEntity create(SecteurEntity secteur) {
        if (secteurRepository.existsByNom(secteur.getNom())) {
            throw new RuntimeException("Secteur already exists");
        }
        return secteurRepository.save(secteur);
    }

    @Transactional
    public SecteurEntity update(String id, SecteurEntity newSecteur) {
        SecteurEntity secteur = secteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Secteur not found"));
        
        String oldName = secteur.getNom();
        String newName = newSecteur.getNom();
        
        if (!oldName.equals(newName)) {
            if (secteurRepository.existsByNom(newName)) {
                throw new RuntimeException("Secteur name already exists");
            }
            secteur.setNom(newName);
            secteur = secteurRepository.save(secteur);
            
            // Cascade update to other tables
            jdbcTemplate.update("UPDATE machine SET secteur = ? WHERE secteur = ?", newName, oldName);
            jdbcTemplate.update("UPDATE poste SET secteur = ? WHERE secteur = ?", newName, oldName);
            jdbcTemplate.update("UPDATE ticket_panne SET secteur = ? WHERE secteur = ?", newName, oldName);
        }
        
        return secteur;
    }

    @Transactional
    public void delete(String id) {
        SecteurEntity secteur = secteurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Secteur not found"));
        secteurRepository.delete(secteur);
    }
}
