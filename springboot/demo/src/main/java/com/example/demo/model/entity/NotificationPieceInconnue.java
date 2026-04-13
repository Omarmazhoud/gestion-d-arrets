package com.example.demo.model.entity;

import jakarta.persistence.*;
import java.util.Date;

@Entity
@Table(name = "notification_piece_inconnue")
public class NotificationPieceInconnue {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(nullable = false)
    private String referencePiece;

    @Temporal(TemporalType.TIMESTAMP)
    private Date dateCreation;

    private boolean lu;

    private String ticketId;

    public NotificationPieceInconnue() {
    }

    public NotificationPieceInconnue(String referencePiece, String ticketId) {
        this.referencePiece = referencePiece;
        this.ticketId = ticketId;
        this.dateCreation = new Date();
        this.lu = false;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getReferencePiece() { return referencePiece; }
    public void setReferencePiece(String referencePiece) { this.referencePiece = referencePiece; }

    public Date getDateCreation() { return dateCreation; }
    public void setDateCreation(Date dateCreation) { this.dateCreation = dateCreation; }

    public boolean isLu() { return lu; }
    public void setLu(boolean lu) { this.lu = lu; }

    public String getTicketId() { return ticketId; }
    public void setTicketId(String ticketId) { this.ticketId = ticketId; }
}
