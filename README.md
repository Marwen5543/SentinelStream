SentinelStream

Real-Time AI-Driven Transaction Monitoring System

A cloud-native, event-driven backend project demonstrating real-time stream processing, AI inference, and fault-tolerant microservice design using only free-tier technologies.

🚀 What This Project Shows

SentinelStream simulates a bank-grade transaction monitoring system where financial events are processed asynchronously and analyzed in real time using an AI model to detect suspicious behavior.

The project highlights how to:

Handle high-throughput data streams

Build non-blocking, event-driven systems

Integrate AI inference into backend pipelines

Design fault-tolerant architectures with Kafka

🧠 Core Idea

Instead of synchronously checking every transaction against a database (slow and unscalable), SentinelStream processes transactions as a stream:

A transaction is received via REST

The event is published to Kafka

A background consumer analyzes it using AI

Results are persisted and flagged automatically

🏗️ Architecture Overview
Client
  ↓
Spring Boot REST API (Producer)
  ↓
Kafka (Upstash)
  ↓
Spring Boot Consumer
  ↓
AI Inference (Hugging Face)
  ↓
PostgreSQL (Neon)

🧰 Tech Stack (100% Free Tier)

Java 21 / Spring Boot 3

Apache Kafka (Upstash – Serverless)

Hugging Face Inference API

PostgreSQL (Neon.tech)

Docker

Azure App Service (Free Tier)

⚙️ Key Components
Transaction Producer

REST API accepting transaction events

Publishes messages to Kafka

Immediate response → non-blocking design

Kafka Event Stream

Durable message queue

Decouples ingestion from processing

Ensures fault tolerance

AI-Powered Consumer

Listens to Kafka topic

Sends transaction context to an AI model

Classifies transactions as suspicious or normal

Persistence Layer

Stores cleared transactions

Flags suspicious activity for further analysis

🔐 Key Skills Demonstrated

Event-driven architecture

Stream processing with Kafka

Asynchronous backend design

AI integration via REST APIs

Cloud-native development

Free-tier system design (cost-aware engineering)

▶️ Running the Project
docker build -t sentinelstream .
docker run -p 8080:8080 sentinelstream


Requirements

Java 21

Docker

Kafka credentials (Upstash)

Hugging Face API token

Neon PostgreSQL credentials

📈 Possible Extensions

Real fraud datasets & fine-tuned models

Prometheus & Grafana monitoring

Dead-letter queues

OAuth2 / JWT security

Horizontal consumer scaling

👤 About This Project

SentinelStream is a portfolio project designed to demonstrate modern backend engineering, combining distributed systems, AI inference, and cloud-native architecture using production-grade tools.
