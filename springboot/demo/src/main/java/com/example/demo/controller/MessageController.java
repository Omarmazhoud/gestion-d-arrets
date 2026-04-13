package com.example.demo.controller;

import com.example.demo.model.entity.MessageEntity;
import com.example.demo.service.MessageService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/messages")
@CrossOrigin("*")
public class MessageController {

    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService = messageService;
    }

    static class MessagePayload {
        public String expediteurId;
        public String contenu;
        public String image;
    }

    @PostMapping("/envoyer")
    public MessageEntity envoyer(@RequestBody MessagePayload payload) {
        return messageService.sendGroupMessage(payload.expediteurId, payload.contenu, payload.image);
    }

    @GetMapping("/groupe")
    public List<MessageEntity> getGroupConversation() {
        return messageService.getGroupConversation();
    }
}
