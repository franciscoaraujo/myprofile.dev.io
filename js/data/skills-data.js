/**
 * Technical Matrix & Specializations Data
 * Domain Grouping: Backend, Payments, Distributed Systems, Databases, Cloud & DevOps, Security
 * Francisco Araújo | Senior Backend Engineer
 */

const skillList = [
    // Backend Engineering
    { name: "Java 21 / 17 / 11", cat: "backend", badge: "Core", desc: "Virtual Threads, Concurrency, Performance Tuning" },
    { name: "Spring Boot", cat: "backend", badge: "Core", desc: "REST APIs, Security, Data JPA, AOP, Actuator" },
    { name: "C++ (Modern)", cat: "backend", badge: "Systems", desc: "Low-latency routines, TCP Sockets, POSIX" },
    { name: "Spring Batch", cat: "backend", badge: "Batch", desc: "High-volume transactional file processing" },
    { name: "Apache Camel", cat: "backend", badge: "Integration", desc: "Enterprise Integration Patterns (EIP) & Banking Buses" },
    { name: "RESTful API Design", cat: "backend", badge: "Design", desc: "Contract-first OpenAPI, idempotency, rate limiting" },

    // Payment Systems
    { name: "ISO 8583 Protocol", cat: "payment", badge: "Protocol", desc: "Primary & Secondary Bitmaps, LLVAR/LLLVAR, MTI Parsing" },
    { name: "VisaNet (Base I & II)", cat: "payment", badge: "Clearing", desc: "Authorization messaging and TC50 batch settlement" },
    { name: "Card Acquiring Core", cat: "payment", badge: "Domain", desc: "Transaction switches, capture routing, reconciliation" },
    { name: "EMV & Contactless", cat: "payment", badge: "Mobile", desc: "SoftPOS Level 2 kernel, APDU, AID/GPO, ARQC verification" },
    { name: "Financial Clearing", cat: "payment", badge: "Batch", desc: "Cut-off cycles, interchange fees, merchant payout ledgers" },
    { name: "SPB / Pix Integration", cat: "payment", badge: "Banking", desc: "Brazilian payment system protocols and bank messaging" },

    // Distributed Systems
    { name: "Distributed Consistency", cat: "distributed", badge: "Pattern", desc: "Idempotency keys, optimistic locking, race prevention" },
    { name: "Transactional Outbox", cat: "distributed", badge: "Pattern", desc: "At-least-once delivery, dual-write prevention with CDC" },
    { name: "Event-Driven Arch (EDA)", cat: "distributed", badge: "Pattern", desc: "Asynchronous decoupling and domain event publishing" },
    { name: "RabbitMQ", cat: "distributed", badge: "Messaging", desc: "Topic exchanges, Dead Letter Queues (DLQ), retry policies" },
    { name: "Apache Kafka", cat: "distributed", badge: "Streaming", desc: "Distributed log partitions, consumer groups, offset tracking" },
    { name: "ShedLock", cat: "distributed", badge: "Coordination", desc: "Distributed lock management across multi-node clusters" },
    { name: "Hexagonal Architecture", cat: "distributed", badge: "Design", desc: "Ports & Adapters, clean isolated core domain logic" },

    // Databases
    { name: "PostgreSQL", cat: "database", badge: "RDBMS", desc: "ACID transactions, isolation levels, query plan tuning" },
    { name: "Connection Pooling", cat: "database", badge: "Tuning", desc: "HikariCP sizing, transaction boundaries, leak prevention" },
    { name: "Database Migrations", cat: "database", badge: "DevOps", desc: "Flyway, Liquibase repeatable version-controlled schema" },
    { name: "Debezium (CDC)", cat: "database", badge: "Streaming", desc: "PostgreSQL WAL log-based change data capture" },

    // Cloud & DevOps
    { name: "AWS Services", cat: "cloud", badge: "Cloud", desc: "EC2, ECS, S3, RDS, IAM, CloudWatch, VPC" },
    { name: "Docker & Containers", cat: "cloud", badge: "Container", desc: "Multi-stage builds, rootless containers, compose" },
    { name: "CI/CD Pipelines", cat: "cloud", badge: "Automation", desc: "GitHub Actions, automated test suites, artifact packaging" },
    { name: "Linux / POSIX", cat: "cloud", badge: "OS", desc: "Production profiling, socket tuning, shell automation" },

    // Security & Cryptography
    { name: "HSM & PKCS#11", cat: "security", badge: "Crypto", desc: "Hardware security simulator, symmetric key management" },
    { name: "PIN Block Translation", cat: "security", badge: "PCI Scope", desc: "Re-encryption under TMK to ZPK in secure memory" },
    { name: "Symmetric Ciphers", cat: "security", badge: "Crypto", desc: "3DES, AES-CBC, Key Check Value (KCV), LMK separation" },
    { name: "OAuth2 & JWT", cat: "security", badge: "Auth", desc: "Keycloak, token validation, secure service-to-service auth" }
];
