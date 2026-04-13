package com.example.demo.repository;

import com.example.demo.model.entity.FournisseurEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FournisseurRepository extends JpaRepository<FournisseurEntity, String> {
}
