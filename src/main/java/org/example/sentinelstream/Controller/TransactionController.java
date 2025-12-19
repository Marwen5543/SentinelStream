package org.example.sentinelstream.Controller;

import org.example.sentinelstream.model.Transaction;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import tools.jackson.databind.ObjectMapper;

@RestController
@RequestMapping("/api/transactions")
public class TransactionController {

    @Autowired
    private RabbitTemplate rabbitTemplate; // The tool to talk to CloudAMQP

    @Autowired
    private ObjectMapper objectMapper; // The tool to turn Objects into JSON strings

    @PostMapping
    public String createTransaction(@RequestBody Transaction transaction) {
        try {
            // 1. Mark as Pending
            transaction.setStatus("PENDING");

            // 2. Convert Java Object -> JSON String
            String jsonMessage = objectMapper.writeValueAsString(transaction);

            // 3. Send to RabbitMQ Queue named "fraud-check-queue"
            rabbitTemplate.convertAndSend("fraud-check-queue", jsonMessage);

            return "Payment Processing... (Sent to RabbitMQ)";
        } catch (Exception e) {
            return "Error: " + e.getMessage();
        }
    }
}
