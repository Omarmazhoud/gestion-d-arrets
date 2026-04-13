package com.example.demo.repository;

import com.example.demo.model.entity.MessageEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MessageRepository extends JpaRepository<MessageEntity, String> {

    @Query("SELECT m FROM MessageEntity m ORDER BY m.dateEnvoi ASC")
    List<MessageEntity> findGroupConversation();
}
