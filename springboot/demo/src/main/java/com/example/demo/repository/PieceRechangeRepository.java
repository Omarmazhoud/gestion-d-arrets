package com.example.demo.repository;

import com.example.demo.model.entity.PieceRechangeEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PieceRechangeRepository extends JpaRepository<PieceRechangeEntity, String> {
    List<PieceRechangeEntity> findByFournisseurId(String fournisseurId);
    Optional<PieceRechangeEntity> findByReference(String reference);
}
