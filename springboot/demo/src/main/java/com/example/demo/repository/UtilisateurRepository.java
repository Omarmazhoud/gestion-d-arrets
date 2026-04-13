package com.example.demo.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.entity.Utilisateur;

public interface UtilisateurRepository extends JpaRepository<Utilisateur, String> {

    Optional<Utilisateur> findByEmailIgnoreCase(String email);

    long countByRole(com.example.demo.model.enums.Role role);
    long countByIsOnlineTrue();
    long countByIsOnlineTrueAndRole(com.example.demo.model.enums.Role role);

    java.util.List<Utilisateur> findByTypeExecuteur(com.example.demo.model.enums.TypeExecuteur type);
    java.util.List<Utilisateur> findByRoleAndTypeExecuteurAndIsOnlineTrue(com.example.demo.model.enums.Role role, com.example.demo.model.enums.TypeExecuteur type);
}
