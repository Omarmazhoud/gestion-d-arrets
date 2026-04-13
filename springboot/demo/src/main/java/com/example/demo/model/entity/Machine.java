package com.example.demo.model.entity;


import com.example.demo.model.enums.TypePoste;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "machine")
public class Machine {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String secteur;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypePoste typePoste;

    @Column(nullable = true)

    private Boolean enArret = false; 

    @Column(nullable = true, unique = true)
    private String codeMachine;   // 🔥 nouveau


    @Column(nullable = true)
    private String process;       // 🔥 nouveau  // 🔥 IMPORTANT

    // ================= GETTERS & SETTERS =================

    public String getId() {
        return id;
    }

    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }

    public String getSecteur() {
        return secteur;
    }

    public void setSecteur(String secteur) {
        this.secteur = secteur;
    }

    public TypePoste getTypePoste() {
        return typePoste;
    }

    public void setTypePoste(TypePoste typePoste) {
        this.typePoste = typePoste;
    }

    public boolean isEnArret() {
        return Boolean.TRUE.equals(enArret);
    }

    public void setEnArret(boolean enArret) {
        this.enArret = enArret;
    }

    public String getCodeMachine() {
        return codeMachine;
    }

    public void setCodeMachine(String codeMachine) {
        this.codeMachine = codeMachine;
    }

    public String getProcess() {
        return process;
    }

    public void setProcess(String process) {
        this.process = process;
    }
}
