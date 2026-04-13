package com.example.demo.controller;

import com.example.demo.model.entity.Machine;

import com.example.demo.model.enums.TypePoste;
import com.example.demo.service.MachineService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/machines")
public class MachineController {

    private final MachineService machineService;

    public MachineController(MachineService machineService) {
        this.machineService = machineService;
    }

    @PostMapping
    public Machine create(@RequestBody Machine machine) {
        return machineService.create(machine);
    }

    @GetMapping
    public List<Machine> getAll() {
        return machineService.findAll();
    }

    @GetMapping("/filter")
    public List<Machine> getBySecteurAndPoste(
            @RequestParam String secteur,
            @RequestParam TypePoste typePoste) {
        return machineService.findBySecteurAndPoste(secteur, typePoste);
    }

    @PutMapping("/{id}")
    public Machine update(@PathVariable String id, @RequestBody Machine machine) {
        return machineService.update(id, machine);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        machineService.delete(id);
    }
}
