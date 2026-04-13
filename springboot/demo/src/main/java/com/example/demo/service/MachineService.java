package com.example.demo.service;

import com.example.demo.model.entity.Machine;

import com.example.demo.model.enums.TypePoste;
import com.example.demo.repository.MachineRepository;
import org.springframework.stereotype.Service;

import org.springframework.jdbc.core.JdbcTemplate;
import jakarta.annotation.PostConstruct;

import java.util.List;

@Service
public class MachineService {

    private final MachineRepository machineRepository;
    private final JdbcTemplate jdbcTemplate;

    public MachineService(MachineRepository machineRepository, JdbcTemplate jdbcTemplate) {
        this.machineRepository = machineRepository;
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostConstruct
    public void fixDatabaseConstraints() {
        try {
            System.out.println("Dropping old enum constraints on machine table...");
            jdbcTemplate.execute("ALTER TABLE machine DROP CONSTRAINT IF EXISTS machine_secteur_check;");
            jdbcTemplate.execute("ALTER TABLE machine DROP CONSTRAINT IF EXISTS machine_process_check;");
            System.out.println("Dropping old enum constraints on ticket_panne table...");
            jdbcTemplate.execute("ALTER TABLE ticket_panne DROP CONSTRAINT IF EXISTS ticket_panne_type_executeur_check;");
            System.out.println("SUCCESS: Old constraints removed.");
        } catch (Exception e) {
            System.err.println("Note: Could not drop constraints (they might not exist anymore).");
        }
    }

    // ================= CREATE =================
    public Machine create(Machine machine) {

        if (machine.getNom() == null || machine.getNom().isEmpty()) {
            throw new RuntimeException("Nom machine obligatoire");
        }

        if (machine.getSecteur() == null) {
            throw new RuntimeException("Secteur obligatoire");
        }

        if (machine.getTypePoste() == null) {
            throw new RuntimeException("TypePoste obligatoire");
        }

        machine.setEnArret(false);

        // Only check for duplicate code if a non-blank code was provided
        String code = machine.getCodeMachine();
        if (code != null && !code.isBlank()) {
            if (machineRepository.findByCodeMachine(code).isPresent()) {
                throw new RuntimeException("Code machine déjà utilisé");
            }
        } else {
            // Store null instead of empty string to avoid unique constraint issues
            machine.setCodeMachine(null);
        }

        return machineRepository.save(machine);
    }
   

    // ================= READ =================
    public List<Machine> findAll() {
        return machineRepository.findAll();
    }

    public Machine findById(String id) {
        return machineRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Machine introuvable"));
    }

    public List<Machine> findBySecteurAndPoste(String secteur, TypePoste typePoste) {
        return machineRepository.findBySecteurAndTypePoste(secteur, typePoste);
    }

    // ================= UPDATE =================
    public Machine update(String id, Machine updated) {

        Machine machine = findById(id);

        machine.setNom(updated.getNom());
        machine.setSecteur(updated.getSecteur());
        machine.setTypePoste(updated.getTypePoste());
        machine.setEnArret(updated.isEnArret());
        String updatedCode = updated.getCodeMachine();
        machine.setCodeMachine(updatedCode != null && !updatedCode.isBlank() ? updatedCode : null);
        machine.setProcess(updated.getProcess());

        return machineRepository.save(machine);
    }

    // ================= DELETE =================
    public void delete(String id) {

        Machine machine = findById(id);

        if (machine.isEnArret()) {
            throw new RuntimeException("Impossible de supprimer une machine en arrêt");
        }

        // Détacher les tickets pour éviter l'erreur de contrainte Foreign Key (500)
        jdbcTemplate.update("UPDATE ticket_panne SET machine_id = NULL WHERE machine_id = ?", id);

        machineRepository.delete(machine);
    }
}
