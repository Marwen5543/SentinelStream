package org.example.sentinelstream.Service;

import org.example.sentinelstream.model.Transaction;
import org.example.sentinelstream.repository.TransactionRepository;
import org.springframework.amqp.rabbit.annotation.Queue;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.messaging.MessageHeaders;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Map;

@Service
public class FraudDetectionService {

    @Autowired
    private TransactionRepository repository;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @Value("${app.ai.url}")
    private String aiUrl;

    @Value("${app.ai.token}")
    private String aiToken;

    @RabbitListener(queuesToDeclare = @Queue("fraud-check-queue"))
    public void processTransaction(String message) {
        try {
            Transaction txn = objectMapper.readValue(message, Transaction.class);

            System.out.println("🔍 Processing transaction for: " + txn.getUserId());

            // Run fraud detection rules
            boolean isFraud = detectFraud(txn);

            if (isFraud) {
                txn.setStatus("REJECTED");
                System.out.println("🚨 FRAUD DETECTED: " + txn.getAiAnalysis());
            } else {
                txn.setStatus("APPROVED");
                System.out.println("✅ Transaction approved");
            }

            repository.save(txn);

            // Send to WebSocket
            System.out.println("📤 About to send message to /topic/transactions for txn ID: " + txn.getId() + " status: " + txn.getStatus());
            messagingTemplate.convertAndSend("/topic/transactions", txn,
                    Map.of(MessageHeaders.CONTENT_TYPE, MimeTypeUtils.APPLICATION_JSON));
            System.out.println("📤 Sent to WebSocket: " + txn.getStatus());
            System.out.println("📤 Message sent successfully to broker");
        } catch (Exception e) {
            System.err.println("❌ Error processing transaction: " + e.getMessage());
            e.printStackTrace();
        }
    }

    /**
     * Advanced fraud detection using multiple rules
     */
    private boolean detectFraud(Transaction txn) {
        StringBuilder analysis = new StringBuilder();
        boolean isFraud = false;

        // Rule 1: High Amount Detection (>$5000)
        if (txn.getAmount() > 5000) {
            analysis.append("⚠️ High amount transaction ($").append(txn.getAmount()).append("). ");
            isFraud = true;
        }

        // Rule 2: Suspicious Merchants
        String merchant = txn.getMerchant().toLowerCase();
        if (merchant.contains("casino") || merchant.contains("crypto") ||
                merchant.contains("bitcoin") || merchant.contains("offshore")) {
            analysis.append("🎰 Suspicious merchant category. ");
            isFraud = true;
        }

        // Rule 3: High-Risk Locations
        String location = txn.getLocation().toLowerCase();
        if (location.contains("nigeria") || location.contains("russia") ||
                location.contains("unknown") || location.contains("tor")) {
            analysis.append("🌍 High-risk location detected. ");
            isFraud = true;
        }

        // Rule 4: Round Number Fraud Pattern (exactly $1000, $5000, etc.)
        if (txn.getAmount() % 1000 == 0 && txn.getAmount() >= 1000) {
            analysis.append("🔢 Suspicious round number pattern. ");
            isFraud = true;
        }

        // Rule 5: Luxury Goods Pattern
        if ((merchant.contains("luxury") || merchant.contains("jewelry") ||
                merchant.contains("rolex") || merchant.contains("gucci")) &&
                txn.getAmount() > 2000) {
            analysis.append("💎 High-value luxury purchase. ");
            isFraud = true;
        }

        // Rule 6: Electronics Fraud Pattern
        if (merchant.contains("electronics") && txn.getAmount() > 3000) {
            analysis.append("📱 Large electronics purchase - verify identity. ");
            isFraud = true;
        }

        // Rule 7: Foreign Transaction Pattern
        String currency = txn.getCurrency();
        if (!currency.equals("USD") && txn.getAmount() > 1000) {
            analysis.append("💱 Large foreign currency transaction. ");
            // Don't mark as fraud, just flag it
        }

        // Rule 8: Try AI Analysis as backup (optional)
        if (!isFraud) {
            String aiVerdict = askAI(txn);
            if (aiVerdict != null && (aiVerdict.toLowerCase().contains("suspicious") ||
                    aiVerdict.toLowerCase().contains("fraud") ||
                    aiVerdict.toLowerCase().contains("yes"))) {
                analysis.append("🤖 AI flagged as suspicious. ");
                isFraud = true;
            }
        }

        // Set analysis message
        if (isFraud) {
            txn.setAiAnalysis(analysis.toString().trim());
        } else {
            txn.setAiAnalysis("✅ Transaction appears legitimate - all checks passed.");
        }

        return isFraud;
    }

    /**
     * Ask AI for fraud analysis (optional - can be slow)
     */
    private String askAI(Transaction txn) {
        RestTemplate restTemplate = new RestTemplate();

        HttpHeaders headers = new HttpHeaders();
        headers.set("Authorization", aiToken);
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = String.format(
                "Is this transaction fraudulent? User %s spent $%.2f at %s in %s. Answer 'Yes' if suspicious, 'No' if safe.",
                txn.getUserId(), txn.getAmount(), txn.getMerchant(), txn.getLocation()
        );

        String body = "{\"inputs\": \"" + prompt + "\"}";
        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.postForEntity(aiUrl, request, String.class);
            return response.getBody();
        } catch (Exception e) {
            System.err.println("⚠️ AI service unavailable: " + e.getMessage());
            return null; // Don't fail the transaction if AI is down
        }
    }
}