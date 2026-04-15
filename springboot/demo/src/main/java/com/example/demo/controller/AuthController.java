package com.example.demo.controller;

import com.example.demo.dto.LoginRequest;
import com.example.demo.model.entity.Utilisateur;
import com.example.demo.service.AuthService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // 🔵 LOGIN
    @PostMapping("/login")
    public Utilisateur login(@RequestBody LoginRequest request) {
        return authService.login(
                request.getEmail(),
                request.getPassword());
    }

    // 🔵 REGISTER (AJOUTE ÇA)
    @PostMapping("/register")
    public Utilisateur register(@RequestBody Utilisateur utilisateur) {
        return authService.register(utilisateur);
    }

    // 🔴 LOGOUT
    @PostMapping("/logout/{id}")
    public void logout(@PathVariable String id) {
        authService.logout(id);
    }

    // 💓 PING (HEARTBEAT)
    @PostMapping("/ping/{id}")
    public void ping(@PathVariable String id) {
        authService.updateLastActivity(id);
    }
}