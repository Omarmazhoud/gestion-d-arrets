package com.example.demo.service;

import com.example.demo.model.entity.NotificationPieceInconnue;
import com.example.demo.repository.NotificationPieceInconnueRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationPieceInconnueService {

    @Autowired
    private NotificationPieceInconnueRepository repository;

    public List<NotificationPieceInconnue> getUnreadNotifications() {
        return repository.findByLuFalseOrderByDateCreationDesc();
    }

    public List<NotificationPieceInconnue> getAllNotifications() {
        return repository.findAll();
    }

    public void markAsRead(String id) {
        NotificationPieceInconnue notif = repository.findById(id).orElse(null);
        if (notif != null) {
            notif.setLu(true);
            repository.save(notif);
        }
    }

    public void createNotification(String referencePiece, String ticketId) {
        NotificationPieceInconnue notif = new NotificationPieceInconnue(referencePiece, ticketId);
        repository.save(notif);
    }
}
