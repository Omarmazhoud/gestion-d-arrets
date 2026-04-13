package com.example.demo.dto;

import com.example.demo.model.enums.TicketStatus;

public class TicketPanneUpdateDTO {

    private TicketStatus statut;
    private String commentaireIntervention;
    private String commentaireVerification;

    public TicketStatus getStatut() {
        return statut;
    }

    public void setStatut(TicketStatus statut) {
        this.statut = statut;
    }

    public String getCommentaireIntervention() {
        return commentaireIntervention;
    }

    public void setCommentaireIntervention(String commentaireIntervention) {
        this.commentaireIntervention = commentaireIntervention;
    }

    public String getCommentaireVerification() {
        return commentaireVerification;
    }

    public void setCommentaireVerification(String commentaireVerification) {
        this.commentaireVerification = commentaireVerification;
    }
}