package com.example.demo.dto;

import java.util.Date;


import com.example.demo.model.enums.Priorite;
import com.example.demo.model.enums.TypeExecuteur;
import com.example.demo.model.enums.TypePoste;

public class TicketPanneCreateDTO {

    // ===== BON DE TRAVAIL =====
    private String segment;
    private String equipement;
    private String numeroSerie;
    private Boolean equipementArret;
    private Date dateArret;
    private String heureArret;
    private String remarque;

    // ===== PANNE =====
    private String typePanne;
    private String description;
    private Priorite priorite;

    // ===== TYPE =====
    private TypePoste typePoste;
    private String secteurType;
    private TypeExecuteur typeExecuteur;

    // ===== MACHINE =====
    private String machineId;

    // ===== GETTERS / SETTERS =====

    public String getSegment() {
        return segment;
    }

    public void setSegment(String segment) {
        this.segment = segment;
    }

    public String getEquipement() {
        return equipement;
    }

    public void setEquipement(String equipement) {
        this.equipement = equipement;
    }

    public String getNumeroSerie() {
        return numeroSerie;
    }

    public void setNumeroSerie(String numeroSerie) {
        this.numeroSerie = numeroSerie;
    }

    public Boolean getEquipementArret() {
        return equipementArret;
    }

    public void setEquipementArret(Boolean equipementArret) {
        this.equipementArret = equipementArret;
    }

    public Date getDateArret() {
        return dateArret;
    }

    public void setDateArret(Date dateArret) {
        this.dateArret = dateArret;
    }

    public String getHeureArret() {
        return heureArret;
    }

    public void setHeureArret(String heureArret) {
        this.heureArret = heureArret;
    }

    public String getRemarque() {
        return remarque;
    }

    public void setRemarque(String remarque) {
        this.remarque = remarque;
    }

    public String getTypePanne() {
        return typePanne;
    }

    public void setTypePanne(String typePanne) {
        this.typePanne = typePanne;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Priorite getPriorite() {
        return priorite;
    }

    public void setPriorite(Priorite priorite) {
        this.priorite = priorite;
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

    public TypeExecuteur getTypeExecuteur() {
        return typeExecuteur;
    }

    public void setTypeExecuteur(TypeExecuteur typeExecuteur) {
        this.typeExecuteur = typeExecuteur;
    }

    public String getMachineId() {
        return machineId;
    }

    public void setMachineId(String machineId) {
        this.machineId = machineId;
    }
}