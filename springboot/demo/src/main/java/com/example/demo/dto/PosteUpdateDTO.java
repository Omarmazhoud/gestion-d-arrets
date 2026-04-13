package com.example.demo.dto;


import com.example.demo.model.enums.TypePoste;

public class PosteUpdateDTO {

    private String nomPoste;
    private TypePoste typePoste;
    private Boolean enArret; // nullable pour update partiel

    public String getNomPoste() {
        return nomPoste;
    }

    public void setNomPoste(String nomPoste) {
        this.nomPoste = nomPoste;
    }

    public TypePoste getTypePoste() {
        return typePoste;
    }

    public void setTypePoste(TypePoste typePoste) {
        this.typePoste = typePoste;
    }

    public Boolean getEnArret() {
        return enArret;
    }

    public void setEnArret(Boolean enArret) {
        this.enArret = enArret;
    }
}
