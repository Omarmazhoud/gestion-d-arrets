package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.entity.SecteurEntity;
import java.util.Optional;

public interface SecteurRepository extends JpaRepository<SecteurEntity, String> {
    Optional<SecteurEntity> findByNom(String nom);
    boolean existsByNom(String nom);
}
