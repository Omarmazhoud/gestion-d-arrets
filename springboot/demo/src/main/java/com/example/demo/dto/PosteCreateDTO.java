package com.example.demo.dto;

import com.example.demo.model.enums.TypePoste;

public class PosteCreateDTO {

    private String codePoste;
    private String nomPoste;
    private TypePoste typePoste;

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

    public TypePoste getTypePoste() {
        return typePoste;
    }

    public void setTypePoste(TypePoste typePoste) {
        this.typePoste = typePoste;
    }
}
