package com.example.demo.config;

import com.example.demo.model.entity.Utilisateur;
import com.example.demo.model.enums.Role;
import com.example.demo.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataInitializer {

    @Bean
    CommandLineRunner initDatabase(UtilisateurRepository repository) {
        return args -> {
            if (repository.count() == 0) {
                System.out.println("--- Initialisation de la base de données : Création du compte Super Admin ---");
                Utilisateur admin = new Utilisateur();
                admin.setNom("Super Admin");
                admin.setEmail("admin@leoni.com");
                admin.setPassword("admin"); // Mot de passe par défaut
                admin.setRole(Role.SUPER_ADMIN);
                admin.setActif(true); // Déjà validé
                admin.setMatricule("0000");
                repository.save(admin);
                System.out.println("Compte Super Admin créé avec succès : admin@leoni.com / admin");
            }
        };
    }
}
