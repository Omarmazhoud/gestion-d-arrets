package com.example.demo.repository;

import com.example.demo.model.entity.NotificationPieceInconnue;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationPieceInconnueRepository extends JpaRepository<NotificationPieceInconnue, String> {
    List<NotificationPieceInconnue> findByLuFalseOrderByDateCreationDesc();
}
