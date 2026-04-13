package com.example.demo.controller;

import java.util.List;

import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.model.entity.TicketPanne;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.model.enums.TypeExecuteur;
import com.example.demo.service.TicketPanneService;

@RestController
@RequestMapping("/api/tickets")
public class TicketPanneController {

    private final TicketPanneService service;

    public TicketPanneController(TicketPanneService service) {
        this.service = service;
    }

    // ================= CREATE =================

    @PostMapping("/declarer/{demandeurId}")
    public TicketPanne declarerPanne(
            @RequestBody TicketPanne ticket,
            @PathVariable String demandeurId,
            @RequestParam(required = false) String machineId,
            @RequestParam(required = false) String executeurCibleId) {

        return service.declarerPanne(ticket, demandeurId, machineId, executeurCibleId);
    }

    // ================= READ =================

    @GetMapping
    public List<TicketPanne> getAll() {
        return service.findAll();
    }

    @GetMapping("/{id}")
    public TicketPanne getById(@PathVariable String id) {
        return service.findById(id);
    }

    // ================= EXECUTEUR =================

    @GetMapping("/executeur/{type}/{executeurId}")
    public List<TicketPanne> getTicketsPourExecuteur(
            @PathVariable TypeExecuteur type,
            @PathVariable String executeurId) {

        return service.findTicketsPourExecuteur(type, executeurId);
    }

    @PutMapping("/{id}/prendre/{executeurId}")
    public TicketPanne prendreEnCharge(
            @PathVariable("id") String id,
            @PathVariable("executeurId") String executeurId) {

        return service.affecterExecuteur(id, executeurId);
    }

    @PutMapping("/{id}/terminer")
    public TicketPanne terminer(
            @PathVariable String id,
            @RequestBody TicketPanne ticket,
            @RequestParam(defaultValue = "false") boolean envoyerQualite) {

        return service.terminerIntervention(
                id,
                ticket,
                envoyerQualite);
    }

    // ================= QUALITE =================

    @PutMapping("/{id}/validerQualite")
    public TicketPanne validerQualite(@PathVariable String id) {
        return service.validerQualite(id);
    }

    @PutMapping("/{id}/refuserQualite")
    public TicketPanne refuserQualite(
            @PathVariable String id,
            @RequestParam String message) {

        return service.refuserQualite(id, message);
    }

    // ================= DEMANDEUR =================

    @PutMapping("/{id}/valider")
    public TicketPanne valider(@PathVariable String id) {
        return service.validerCorrection(id);
    }

    @PutMapping("/{id}/refuser")
    public TicketPanne refuser(
            @PathVariable String id,
            @RequestParam String message) {

        return service.refuserCorrection(id, message);
    }

    @PutMapping("/{id}/intervention")
    public TicketPanne updateIntervention(
            @PathVariable String id,
            @RequestBody TicketPanne ticket) {
        return service.updateIntervention(id, ticket);
    }

    // ================= DELETE =================

    @DeleteMapping("/{id}")
    public void delete(@PathVariable String id) {
        service.delete(id);
    }

    @GetMapping("/executeurTickets/{executeurId}")
    public List<TicketPanne> getTicketsByExecuteur(
            @PathVariable String executeurId) {

        return service.findTicketsByExecuteur(executeurId);
    }

    @GetMapping("/demandeur/{demandeurId}")
    public List<TicketPanne> getByDemandeur(@PathVariable String demandeurId) {
        return service.findTicketsByDemandeur(demandeurId); // Changed service variable to 'service' to match existing
                                                            // code
    }

    @PutMapping("/{id}/force-status")
    public TicketPanne forceUpdateStatus(
            @PathVariable String id,
            @RequestParam TicketStatus newStatus,
            @RequestParam String adminId) {
        return service.forceUpdateStatus(id, newStatus, adminId);
    }

    @PutMapping("/{id}/admin-update")
    public TicketPanne adminUpdateTicket(
            @PathVariable String id,
            @RequestBody TicketPanne ticket,
            @RequestParam String adminId) {
        return service.adminUpdateTicket(id, ticket, adminId);
    }
}