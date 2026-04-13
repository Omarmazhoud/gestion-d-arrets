package com.example.demo.service;

import com.example.demo.model.entity.MessageEntity;
import com.example.demo.model.entity.Utilisateur;
import com.example.demo.model.enums.Role;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MessageService {

    private final MessageRepository messageRepo;
    private final UtilisateurRepository userRepo;
    private final FcmService fcmService;

    public MessageService(MessageRepository messageRepo, UtilisateurRepository userRepo, FcmService fcmService) {
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.fcmService = fcmService;
    }

    public MessageEntity sendGroupMessage(String expediteurId, String contenu, String image) {
        Utilisateur expediteur = userRepo.findById(expediteurId).orElseThrow(() -> new RuntimeException("Expéditeur introuvable"));

        MessageEntity message = new MessageEntity(expediteur, contenu != null ? contenu : "", image);
        MessageEntity saved = messageRepo.save(message);

        // Envoyer une notification Push à tous les autres utilisateurs
        String notificationText = (contenu != null && !contenu.trim().isEmpty()) ? contenu : "Une image a été envoyée";
        List<Utilisateur> allUsers = userRepo.findAll();
        for (Utilisateur u : allUsers) {
            if (!u.getId().equals(expediteurId) && u.getPushToken() != null && !u.getPushToken().isEmpty() &&
                (u.getRole() == Role.ADMIN || u.getRole() == Role.SUPER_ADMIN || u.getRole() == Role.EXECUTEUR)) {
                try {
                    fcmService.sendNotification(
                            u.getPushToken(),
                            "Groupe Maint. - " + expediteur.getNom(),
                            notificationText.length() > 40 ? notificationText.substring(0, 40) + "..." : notificationText
                    );
                } catch (Exception e) {
                    System.err.println("Erreur notification push messagerie: " + e.getMessage());
                }
            }
        }

        return saved;
    }

    public List<MessageEntity> getGroupConversation() {
        return messageRepo.findGroupConversation();
    }
}
