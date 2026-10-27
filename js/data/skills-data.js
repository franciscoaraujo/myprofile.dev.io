/**
 * Technical Matrix & Regulatory Specializations Data
 * Francisco Araújo | Staff Backend Engineer
 */

const skillList = [
    // Payment Systems & Financial Protocols
    { name: "ISO 8583 Protocol", cat: "payment", badge: "Core", desc: "Bitmaps, LLVAR, MTI Parsing" },
    { name: "VisaNet (Base I & II)", cat: "payment", badge: "Protocol", desc: "Mensageria e Compensação" },
    { name: "SoftHSM / PKCS#11", cat: "payment", badge: "Security", desc: "Emulação de Hardware Criptográfico" },
    { name: "PIN Block Translation", cat: "payment", badge: "PCI-PIN", desc: "Tradução TMK para ZPK" },
    { name: "EMV Kernel & NFC", cat: "payment", badge: "Mobile", desc: "SoftPOS, APDU, AID, GPO" },
    { name: "Criptografia Simétrica", cat: "payment", badge: "Security", desc: "Triple DES, AES, KCV, LMK" },
    { name: "Clearing & Reconciliação", cat: "payment", badge: "Batch", desc: "TC50, Payout e Intercâmbio" },
    
    // Backend & Low-Latency Languages
    { name: "Java 21 / 17 / 11", cat: "backend", badge: "Expert", desc: "Virtual Threads, Concorrência" },
    { name: "C++ Moderno", cat: "backend", badge: "Low-Latency", desc: "Baixa latência, Sockets, OpenCV" },
    { name: "Spring Boot", cat: "backend", badge: "Framework", desc: "Web, Security, Data, AOP" },
    { name: "Spring Batch", cat: "backend", badge: "Batch", desc: "Processamento de arquivos massivos" },
    { name: "Apache Camel", cat: "backend", badge: "Integration", desc: "EIPs, Barramentos Bancários" },
    { name: "Keycloak & OAuth2", cat: "backend", badge: "Auth", desc: "Segurança de APIs e Tokens" },

    // Architecture & Distributed Consistency
    { name: "Sistemas Distribuídos", cat: "arch", badge: "Pattern", desc: "Alta disponibilidade (99.999%)" },
    { name: "Transactional Outbox", cat: "arch", badge: "Consistência", desc: "Garantia Zero Data Loss" },
    { name: "Event-Driven (EDA)", cat: "arch", badge: "Pattern", desc: "Arquitetura orientada a eventos" },
    { name: "Arquitetura Hexagonal", cat: "arch", badge: "Design", desc: "Ports & Adapters, Domínio Puro" },
    { name: "Domain-Driven Design", cat: "arch", badge: "Design", desc: "Bounded Contexts Financeiros" },

    // Infrastructure & ACID Databases
    { name: "PostgreSQL", cat: "infra", badge: "Database", desc: "Transações ACID, Índices, Tunning" },
    { name: "RabbitMQ", cat: "infra", badge: "Messaging", desc: "Exchanges, Dead Letter Queues, TTL" },
    { name: "Apache Kafka", cat: "infra", badge: "Streaming", desc: "Event streams e particionamento" },
    { name: "Debezium (CDC)", cat: "infra", badge: "Data", desc: "Change Data Capture em tempo real" },
    { name: "ShedLock", cat: "infra", badge: "Distributed", desc: "Locks distribuídos em cluster" },
    { name: "AWS Cloud", cat: "infra", badge: "Cloud", desc: "EC2, ECS, S3, RDS, IAM" },
    { name: "Docker & Containers", cat: "infra", badge: "DevOps", desc: "Empacotamento reproduzível" }
];
