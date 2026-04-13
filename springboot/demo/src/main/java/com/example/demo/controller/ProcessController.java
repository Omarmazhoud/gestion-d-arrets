package com.example.demo.controller;

import com.example.demo.model.entity.ProcessEntity;
import com.example.demo.service.ProcessService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/processes")
@CrossOrigin("*") // Adjust appropriately for security
public class ProcessController {

    @Autowired
    private ProcessService processService;

    @GetMapping
    public ResponseEntity<List<ProcessEntity>> getAll() {
        return ResponseEntity.ok(processService.getAll());
    }

    @PostMapping
    public ResponseEntity<?> create(@RequestBody ProcessEntity process) {
        try {
            return ResponseEntity.ok(processService.create(process));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> update(@PathVariable String id, @RequestBody ProcessEntity newProcess) {
        try {
            return ResponseEntity.ok(processService.update(id, newProcess));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> delete(@PathVariable String id) {
        try {
            processService.delete(id);
            return ResponseEntity.ok().build();
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}
