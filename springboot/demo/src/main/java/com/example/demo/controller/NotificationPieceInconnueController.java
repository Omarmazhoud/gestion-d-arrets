package com.example.demo.controller;

import com.example.demo.model.entity.NotificationPieceInconnue;
import com.example.demo.service.NotificationPieceInconnueService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications-pieces")
@CrossOrigin("*")
public class NotificationPieceInconnueController {

    @Autowired
    private NotificationPieceInconnueService service;

    @GetMapping
    public ResponseEntity<List<NotificationPieceInconnue>> getUnread() {
        return ResponseEntity.ok(service.getUnreadNotifications());
    }

    @GetMapping("/all")
    public ResponseEntity<List<NotificationPieceInconnue>> getAll() {
        return ResponseEntity.ok(service.getAllNotifications());
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable String id) {
        service.markAsRead(id);
        return ResponseEntity.ok().build();
    }
}
