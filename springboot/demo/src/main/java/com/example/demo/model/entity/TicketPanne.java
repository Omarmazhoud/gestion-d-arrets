package com.example.demo.model.entity;

import java.util.Date;


import com.example.demo.model.enums.Priorite;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.model.enums.TypeExecuteur;
import com.example.demo.model.enums.TypePoste;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@Table(name = "ticket_panne")
public class TicketPanne {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    // ================= BON DE TRAVAIL =================
    private String nomPrenom;
    private String matricule;
    private String segment;
    private String equipement;
    private String numeroSerie;
    private Boolean equipementArret;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateArret;

    private String heureArret;

    @Column(length = 1000)
    private String remarque;

    // ================= PANNE =================
    private String typePanne;
    private String description;

    @Enumerated(EnumType.STRING)
    private TicketStatus statut;

    @Enumerated(EnumType.STRING)
    private Priorite priorite;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation;

    // ================= INTERVENTION =================
    private String commentaireVerification;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateDebutIntervention;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateFinIntervention;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateFermeture;

    private String commentaireIntervention;

    // ================= TYPE =================
    @Enumerated(EnumType.STRING)
    private TypePoste typePoste;

    private String secteurType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private TypeExecuteur typeExecuteur;

    @Column(columnDefinition = "TEXT")
    private String imagePanne;

    @Column(columnDefinition = "TEXT")
    private String imageIntervention;

    private String referencePiece;

    @Column(columnDefinition = "TEXT")
    private String commentaireIa;

    private Double duree; // Durée réelle en heures
    private Double dureeEstimee; // Durée estimée par l'IA en heures

    // ================= RELATIONS =================
    @ManyToOne
    @JoinColumn(name = "demandeur_id", nullable = false)
    private Utilisateur demandeur;

    @ManyToOne
    @JoinColumn(name = "executeur_id")
    private Utilisateur executeur;

    @ManyToOne
    @JoinColumn(name = "machine_id")
    private Machine machine;

    // ================= GETTERS / SETTERS =================

    public String getId() {
        return id;
    }

    public String getNomPrenom() {
        return nomPrenom;
    }

    public void setNomPrenom(String nomPrenom) {
        this.nomPrenom = nomPrenom;
    }

    public String getMatricule() {
        return matricule;
    }

    public void setMatricule(String matricule) {
        this.matricule = matricule;
    }

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

    public TicketStatus getStatut() {
        return statut;
    }

    public void setStatut(TicketStatus statut) {
        this.statut = statut;
    }

    public Priorite getPriorite() {
        return priorite;
    }

    public void setPriorite(Priorite priorite) {
        this.priorite = priorite;
    }

    public Date getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(Date dateCreation) {
        this.dateCreation = dateCreation;
    }

    public String getCommentaireVerification() {
        return commentaireVerification;
    }

    public void setCommentaireVerification(String commentaireVerification) {
        this.commentaireVerification = commentaireVerification;
    }

    public Date getDateDebutIntervention() {
        return dateDebutIntervention;
    }

    public void setDateDebutIntervention(Date dateDebutIntervention) {
        this.dateDebutIntervention = dateDebutIntervention;
    }

    public Date getDateFinIntervention() {
        return dateFinIntervention;
    }

    public void setDateFinIntervention(Date dateFinIntervention) {
        this.dateFinIntervention = dateFinIntervention;
    }

    public Date getDateFermeture() {
        return dateFermeture;
    }

    public void setDateFermeture(Date dateFermeture) {
        this.dateFermeture = dateFermeture;
    }

    public String getCommentaireIntervention() {
        return commentaireIntervention;
    }

    public void setCommentaireIntervention(String commentaireIntervention) {
        this.commentaireIntervention = commentaireIntervention;
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

    public Utilisateur getDemandeur() {
        return demandeur;
    }

    public void setDemandeur(Utilisateur demandeur) {
        this.demandeur = demandeur;
    }

    public Utilisateur getExecuteur() {
        return executeur;
    }

    public void setExecuteur(Utilisateur executeur) {
        this.executeur = executeur;
    }

    public Machine getMachine() {
        return machine;
    }

    public void setMachine(Machine machine) {
        this.machine = machine;
    }

    public String getImagePanne() {
        return imagePanne;
    }

    public void setImagePanne(String imagePanne) {
        this.imagePanne = imagePanne;
    }

    public String getImageIntervention() {
        return imageIntervention;
    }

    public void setImageIntervention(String imageIntervention) {
        this.imageIntervention = imageIntervention;
    }

    public String getReferencePiece() {
        return referencePiece;
    }

    public void setReferencePiece(String referencePiece) {
        this.referencePiece = referencePiece;
    }

    public String getCommentaireIa() {
        return commentaireIa;
    }

    public void setCommentaireIa(String commentaireIa) {
        this.commentaireIa = commentaireIa;
    }

    public Double getDuree() {
        return duree;
    }

    public void setDuree(Double duree) {
        this.duree = duree;
    }

    public Double getDureeEstimee() {
        return dureeEstimee;
    }

    public void setDureeEstimee(Double dureeEstimee) {
        this.dureeEstimee = dureeEstimee;
    }
}