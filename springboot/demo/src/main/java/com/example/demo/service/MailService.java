package com.example.demo.service;

import java.io.UnsupportedEncodingException;

import org.springframework.mail.MailException;

import com.example.demo.model.entity.Utilisateur;

import jakarta.mail.internet.MimeMessage;

import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.MessagingException;

@Service
public class MailService {

    @org.springframework.beans.factory.annotation.Value("${spring.mail.username}")
    private String fromEmail;

    private final JavaMailSender mailSender;

    public MailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void envoyerValidationCompte(Utilisateur utilisateur) {

    try {

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

        helper.setTo(utilisateur.getEmail());
        helper.setSubject("✅ Votre compte LEONI est activé");
        helper.setFrom(fromEmail, "LEONI Support");

        String htmlContent =
                "<div style='font-family:Arial;'>"
                        + "<h2 style='color:#2563eb;'>Compte activé</h2>"
                        + "<p>Bonjour <b>" + utilisateur.getNom() + "</b>,</p>"
                        + "<p>Votre compte a été activé avec succès.</p>"
                        + "<p><b>Email :</b> " + utilisateur.getEmail() + "</p>"
                        + "<p><b>Mot de passe :</b> " + utilisateur.getPassword() + "</p>"
                        + "<br>"
                        + "<p style='color:red;'>⚠️ Changez votre mot de passe après connexion.</p>"
                        + "<br>"
                        + "<p style='font-size:12px;color:gray;'>LEONI IT Team</p>"
                        + "</div>";

        helper.setText(htmlContent, true);

        mailSender.send(message);

    } catch (MessagingException | UnsupportedEncodingException | MailException e) {
        System.err.println("ERREUR LORS DE L'ENVOI DU MAIL : " + e.getMessage());
        e.printStackTrace();
    }
}

}
