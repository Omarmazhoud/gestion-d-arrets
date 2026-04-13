package com.example.demo.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.example.demo.model.entity.ProcessEntity;
import java.util.Optional;

public interface ProcessRepository extends JpaRepository<ProcessEntity, String> {
    Optional<ProcessEntity> findByNom(String nom);
    boolean existsByNom(String nom);
}
