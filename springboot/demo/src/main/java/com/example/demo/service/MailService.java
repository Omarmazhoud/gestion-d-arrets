package com.example.demo.service;

import com.example.demo.model.entity.Utilisateur;
import com.sendgrid.*;
import com.sendgrid.helpers.mail.Mail;
import com.sendgrid.helpers.mail.objects.Content;
import com.sendgrid.helpers.mail.objects.Email;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
public class MailService {

    @Value("${spring.mail.password}")
    private String sendGridApiKey;

    @Value("${spring.mail.from:omar.mazhoud.est.ast@gmail.com}")
    private String fromEmail;

    @Async
    public void envoyerValidationCompte(Utilisateur utilisateur) {
        System.out.println("📬 [SENDGRID-API] Début envoi pour : " + utilisateur.getEmail());
        
        if (sendGridApiKey == null || sendGridApiKey.isEmpty() || sendGridApiKey.contains("${")) {
            System.err.println("❌ [SENDGRID-API] ERREUR : MAIL_PASSWORD non configuré !");
            return;
        }

        Email from = new Email(fromEmail);
        String subject = "✅ Votre compte LEONI est activé";
        Email to = new Email(utilisateur.getEmail());
        
        String htmlBody = "<html><body>"
                + "<div style='font-family:Arial;'>"
                + "<h2 style='color:#2563eb;'>Compte activé</h2>"
                + "<p>Bonjour <b>" + utilisateur.getNom() + "</b>,</p>"
                + "<p>Votre compte a été activé avec succès.</p>"
                + "<p><b>Email :</b> " + utilisateur.getEmail() + "</p>"
                + "<p><b>Mot de passe :</b> " + utilisateur.getPassword() + "</p>"
                + "<br>"
                + "<p style='color:red;'>⚠️ Changez votre mot de passe après connexion.</p>"
                + "<br>"
                + "<p style='font-size:12px;color:gray;'>LEONI IT Team</p>"
                + "</div></body></html>";
                
        Content content = new Content("text/html", htmlBody);
        Mail mail = new Mail(from, subject, to, content);

        SendGrid sg = new SendGrid(sendGridApiKey);
        Request request = new Request();
        
        try {
            request.setMethod(Method.POST);
            request.setEndpoint("mail/send");
            request.setBody(mail.build());
            
            System.out.println("📬 [SENDGRID-API] Envoi de la requête HTTP...");
            Response response = sg.api(request);
            
            System.out.println("📬 [SENDGRID-API] Code Status : " + response.getStatusCode());
            if (response.getStatusCode() >= 200 && response.getStatusCode() < 300) {
                System.out.println("✅ [SENDGRID-API] SUCCÈS : Email envoyé !");
            } else {
                System.err.println("❌ [SENDGRID-API] ÉCHEC : " + response.getBody());
            }
        } catch (IOException ex) {
            System.err.println("❌ [SENDGRID-API] ERREUR IO : " + ex.getMessage());
        }
    }
}
