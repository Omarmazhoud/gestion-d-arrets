package com.example.demo.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.example.demo.model.entity.Machine;

import com.example.demo.model.enums.TypePoste;

public interface MachineRepository extends JpaRepository<Machine, String> {
    List<Machine> findBySecteurAndTypePoste(String secteur, TypePoste typePoste);
    Optional<Machine> findByCodeMachine(String codeMachine);
}
    
