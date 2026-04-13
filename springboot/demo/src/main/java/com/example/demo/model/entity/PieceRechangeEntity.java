package com.example.demo.model.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "piece_rechange")
public class PieceRechangeEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String reference;

    @Column(nullable = false)
    private String nom;

    private Integer stock;

    @ManyToOne
    @JoinColumn(name = "fournisseur_id", nullable = true)
    private FournisseurEntity fournisseur;

    public PieceRechangeEntity() {
    }

    public PieceRechangeEntity(String reference, String nom, Integer stock, FournisseurEntity fournisseur) {
        this.reference = reference;
        this.nom = nom;
        this.stock = stock;
        this.fournisseur = fournisseur;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getReference() {
        return reference;
    }

    public void setReference(String reference) {
        this.reference = reference;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public Integer getStock() {
        return stock;
    }

    public void setStock(Integer stock) {
        this.stock = stock;
    }

    public FournisseurEntity getFournisseur() {
        return fournisseur;
    }

    public void setFournisseur(FournisseurEntity fournisseur) {
        this.fournisseur = fournisseur;
    }
}
