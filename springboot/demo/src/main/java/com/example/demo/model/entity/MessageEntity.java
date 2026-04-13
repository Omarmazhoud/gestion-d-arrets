package com.example.demo.model.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "messages_groupe")
public class MessageEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @ManyToOne
    @JoinColumn(name = "expediteur_id", nullable = false)
    private Utilisateur expediteur;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String contenu;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateEnvoi;

    public MessageEntity() {}

    public MessageEntity(Utilisateur expediteur, String contenu, String image) {
        this.expediteur = expediteur;
        this.contenu = contenu;
        this.image = image;
        this.dateEnvoi = new Date();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public Utilisateur getExpediteur() { return expediteur; }
    public void setExpediteur(Utilisateur expediteur) { this.expediteur = expediteur; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getImage() { return image; }
    public void setImage(String image) { this.image = image; }

    public Date getDateEnvoi() { return dateEnvoi; }
    public void setDateEnvoi(Date dateEnvoi) { this.dateEnvoi = dateEnvoi; }
}
