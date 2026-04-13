package com.example.demo.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.example.demo.model.entity.TicketPanne;
import com.example.demo.model.entity.Utilisateur;
import com.example.demo.model.enums.TicketStatus;
import com.example.demo.model.enums.TypeExecuteur;
import org.springframework.data.jpa.repository.EntityGraph;

public interface TicketPanneRepository extends JpaRepository<TicketPanne, String> {

    long countByStatut(TicketStatus statut);

    @Query("SELECT t.typePoste, COUNT(t) FROM TicketPanne t GROUP BY t.typePoste")
    List<Object[]> countTicketsByTypePoste();

    @EntityGraph(attributePaths = {"demandeur", "executeur", "machine"})
    List<TicketPanne> findAll();

    @EntityGraph(attributePaths = {"demandeur", "executeur", "machine"})
    List<TicketPanne> findByStatutIn(List<TicketStatus> statuts);

    @EntityGraph(attributePaths = {"demandeur", "executeur", "machine"})
    @Query("SELECT t FROM TicketPanne t WHERE t.typeExecuteur = :type AND t.statut IN :statuts AND (t.executeur IS NULL OR t.executeur = :executeur)")
    List<TicketPanne> findPoolForExecuteur(
        @org.springframework.data.repository.query.Param("type") TypeExecuteur type,
        @org.springframework.data.repository.query.Param("statuts") List<TicketStatus> statuts,
        @org.springframework.data.repository.query.Param("executeur") Utilisateur executeur
    );

    @EntityGraph(attributePaths = {"demandeur", "executeur", "machine"})
    List<TicketPanne> findByExecuteur(Utilisateur executeur);

    @EntityGraph(attributePaths = {"demandeur", "executeur", "machine"})
    List<TicketPanne> findByDemandeur(Utilisateur demandeur);

}