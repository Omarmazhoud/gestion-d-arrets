package com.example.demo.model.entity;


import com.example.demo.model.enums.TypePoste;

import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;

@Entity
public class Poste {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    private String codePoste;
    private String nomPoste;
    private boolean enArret;

    @Enumerated(EnumType.STRING)
    private TypePoste typePoste;

    private String secteurType;

    // getters & setters

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getCodePoste() {
        return codePoste;
    }

    public void setCodePoste(String codePoste) {
        this.codePoste = codePoste;
    }

    public String getNomPoste() {
        return nomPoste;
    }

    public void setNomPoste(String nomPoste) {
        this.nomPoste = nomPoste;
    }

    public boolean isEnArret() {
        return enArret;
    }

    public void setEnArret(boolean enArret) {
        this.enArret = enArret;
    }

    public TypePoste getTypePoste() {
        return typePoste;
    }

    public void setTypePoste(TypePoste typePoste) {
        this.typePoste = typePoste;
    }

    public String getSecteurType() {
        return secteurType;
    }

    public void setSecteurType(String secteurType) {
        this.secteurType = secteurType;
    }
}
