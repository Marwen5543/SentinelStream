package org.example.sentinelstream.repository;

import org.example.sentinelstream.model.ChatMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChatMessageRepository extends JpaRepository<ChatMessage, Long> {
    List<ChatMessage> findByTransactionIdOrderByTimestampAsc(Long transactionId);
}
