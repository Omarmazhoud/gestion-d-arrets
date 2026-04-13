package com.example.demo.service;

import com.example.demo.model.entity.ProcessEntity;
import com.example.demo.repository.ProcessRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ProcessService {

    @Autowired
    private ProcessRepository processRepository;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    public List<ProcessEntity> getAll() {
        return processRepository.findAll();
    }

    @Transactional
    public ProcessEntity create(ProcessEntity process) {
        if (processRepository.existsByNom(process.getNom())) {
            throw new RuntimeException("Process already exists");
        }
        return processRepository.save(process);
    }

    @Transactional
    public ProcessEntity update(String id, ProcessEntity newProcess) {
        ProcessEntity process = processRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Process not found"));
        
        String oldName = process.getNom();
        String newName = newProcess.getNom();
        
        if (!oldName.equals(newName)) {
            if (processRepository.existsByNom(newName)) {
                throw new RuntimeException("Process name already exists");
            }
            process.setNom(newName);
            process = processRepository.save(process);
            
            // Cascade update to other tables using JdbcTemplate
            jdbcTemplate.update("UPDATE machine SET process = ? WHERE process = ?", newName, oldName);
            // Add similar updates to poste / ticket_panne if they store process
            // (Assuming only Machine uses process currently based on previous inspection)
        }
        
        return process;
    }

    @Transactional
    public void delete(String id) {
        ProcessEntity process = processRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Process not found"));
        processRepository.delete(process);
    }
}
