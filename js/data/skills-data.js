/**
 * Technical Matrix & Specializations Data
 * Domain Grouping: Backend, Payments, Distributed Systems, Databases, Cloud & DevOps, Security
 * Francisco Araújo | Senior Backend Engineer
 */

const skillList = [
    // Backend Engineering
    { name: "Java 21 / 17 / 11", cat: "backend", badge: "Core", desc: "Virtual Threads, Concurrency, Performance Tuning", descPt: "Virtual Threads, Concorrência e Tuning de Performance" },
    { name: "Spring Boot", cat: "backend", badge: "Core", desc: "REST APIs, Security, Data JPA, AOP, Actuator", descPt: "APIs REST, Security, Data JPA, AOP e Actuator" },
    { name: "C++ (Modern)", cat: "backend", badge: "Systems", desc: "Low-latency routines, TCP Sockets, POSIX", descPt: "Rotinas de baixa latência, Sockets TCP e POSIX" },
    { name: "Spring Batch", cat: "backend", badge: "Batch", desc: "High-volume transactional file processing", descPt: "Processamento transacional de arquivos em alto volume" },
    { name: "Apache Camel", cat: "backend", badge: "Integration", desc: "Enterprise Integration Patterns (EIP) & Banking Buses", descPt: "Enterprise Integration Patterns (EIP) e Barramentos Bancários" },
    { name: "RESTful API Design", cat: "backend", badge: "Design", desc: "Contract-first OpenAPI, idempotency, rate limiting", descPt: "OpenAPI contract-first, idempotência e rate limiting" },

    // Payment Systems
    { name: "ISO 8583 Protocol", cat: "payment", badge: "Protocol", desc: "Primary & Secondary Bitmaps, LLVAR/LLLVAR, MTI Parsing", descPt: "Bitmaps Primário/Secundário, LLVAR/LLLVAR e Parsing MTI" },
    { name: "VisaNet (Base I & II)", cat: "payment", badge: "Clearing", desc: "Authorization messaging and TC50 batch settlement", descPt: "Mensageria de autorização e liquidação batch TC50" },
    { name: "Card Acquiring Core", cat: "payment", badge: "Domain", desc: "Transaction switches, capture routing, reconciliation", descPt: "Switches transacionais, roteamento de captura e conciliação" },
    { name: "EMV & Contactless", cat: "payment", badge: "Mobile", desc: "SoftPOS Level 2 kernel, APDU, AID/GPO, ARQC verification", descPt: "Kernel SoftPOS Nível 2, APDU, AID/GPO e validação ARQC" },
    { name: "Financial Clearing", cat: "payment", badge: "Batch", desc: "Cut-off cycles, interchange fees, merchant payout ledgers", descPt: "Ciclos de cut-off, taxas de intercâmbio e ledger de lojistas" },
    { name: "SPB / Pix Integration", cat: "payment", badge: "Banking", desc: "Brazilian payment system protocols and bank messaging", descPt: "Protocolos do Sistema de Pagamentos Brasileiro e mensageria" },

    // Distributed Systems
    { name: "Distributed Consistency", cat: "distributed", badge: "Pattern", desc: "Idempotency keys, optimistic locking, race prevention", descPt: "Chaves de idempotência, lock otimista e prevenção de corridas" },
    { name: "Transactional Outbox", cat: "distributed", badge: "Pattern", desc: "At-least-once delivery, dual-write prevention with CDC", descPt: "Entrega at-least-once e prevenção de dual-write com CDC" },
    { name: "Event-Driven Arch (EDA)", cat: "distributed", badge: "Pattern", desc: "Asynchronous decoupling and domain event publishing", descPt: "Desacoplamento assíncrono e publicação de eventos de domínio" },
    { name: "RabbitMQ", cat: "distributed", badge: "Messaging", desc: "Topic exchanges, Dead Letter Queues (DLQ), retry policies", descPt: "Topic exchanges, Dead Letter Queues (DLQ) e políticas de retry" },
    { name: "Apache Kafka", cat: "distributed", badge: "Streaming", desc: "Distributed log partitions, consumer groups, offset tracking", descPt: "Partições distribuídas, grupos de consumidores e controle de offset" },
    { name: "ShedLock", cat: "distributed", badge: "Coordination", desc: "Distributed lock management across multi-node clusters", descPt: "Coordenação de locks distribuídos em clusters multi-nós" },
    { name: "Hexagonal Architecture", cat: "distributed", badge: "Design", desc: "Ports & Adapters, clean isolated core domain logic", descPt: "Ports & Adapters e isolamento limpo do domínio de negócio" },

    // Databases
    { name: "PostgreSQL", cat: "database", badge: "RDBMS", desc: "ACID transactions, isolation levels, query plan tuning", descPt: "Transações ACID, níveis de isolamento e tuning de queries" },
    { name: "Connection Pooling", cat: "database", badge: "Tuning", desc: "HikariCP sizing, transaction boundaries, leak prevention", descPt: "Dimensionamento HikariCP, escopo transacional e prevenção de leaks" },
    { name: "Database Migrations", cat: "database", badge: "DevOps", desc: "Flyway, Liquibase repeatable version-controlled schema", descPt: "Versionamento determinístico de schema com Flyway e Liquibase" },
    { name: "Debezium (CDC)", cat: "database", badge: "Streaming", desc: "PostgreSQL WAL log-based change data capture", descPt: "Captura de dados modificados baseada no WAL do PostgreSQL" },

    // Cloud & DevOps
    { name: "AWS Services", cat: "cloud", badge: "Cloud", desc: "EC2, ECS, S3, RDS, IAM, CloudWatch, VPC", descPt: "EC2, ECS, S3, RDS, IAM, CloudWatch e VPC" },
    { name: "Docker & Containers", cat: "cloud", badge: "Container", desc: "Multi-stage builds, rootless containers, compose", descPt: "Builds multi-stage, containers rootless e Docker Compose" },
    { name: "CI/CD Pipelines", cat: "cloud", badge: "Automation", desc: "GitHub Actions, automated test suites, artifact packaging", descPt: "GitHub Actions, suítes de testes automatizados e empacotamento" },
    { name: "Linux / POSIX", cat: "cloud", badge: "OS", desc: "Production profiling, socket tuning, shell automation", descPt: "Profiling de produção, tuning de sockets e automação shell" },

    // Security & Cryptography
    { name: "HSM & PKCS#11 Concepts", cat: "security", badge: "Crypto Sim", desc: "Software security simulator, symmetric key management", descPt: "Simulador criptográfico em software e gestão de chaves simétricas" },
    { name: "PIN Block Translation", cat: "security", badge: "Key Hierarchy", desc: "Simulated re-encryption under TMK to ZPK in memory", descPt: "Tradução simulada de PIN block de TMK para ZPK em memória" },
    { name: "Symmetric Ciphers", cat: "security", badge: "Crypto", desc: "3DES, AES-CBC, Key Check Value (KCV), LMK separation", descPt: "3DES, AES-CBC, Key Check Value (KCV) e segregação por LMK" },
    { name: "OAuth2 & JWT", cat: "security", badge: "Auth", desc: "Keycloak, token validation, secure service-to-service auth", descPt: "Keycloak, validação de tokens e autenticação entre microsserviços" }
];
