package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.entity.Poste;
import com.example.demo.model.enums.TypePoste;

public interface PosteRepository extends JpaRepository<Poste, String> {
List<Poste> findByTypePoste(TypePoste typePoste);

}
