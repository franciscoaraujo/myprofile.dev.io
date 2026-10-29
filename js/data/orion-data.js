/**
 * OrionPay Case Study & Architecture Data
 * Detailed engineering case studies adhering to realistic evidence standards.
 * Francisco Araújo | Senior Backend Engineer
 */

const orionData = {
    switch: {
        title: "Acquiring Switch & Authorization Core",
        stack: "Java 21 • Spring Boot • PostgreSQL • ShedLock • RabbitMQ",
        status: "Engineering Prototype / Reference Architecture",
        summary: "High-throughput financial transaction switch designed with strict Separation of Concerns (SoC). Decouples synchronous online authorization from downstream clearing and accounting ledgers.",
        problem: "Dual-write vulnerabilities between transaction databases and message brokers can cause silent message loss or reconciliation drift during peak gateway load.",
        decisions: [
            {
                topic: "Transactional Outbox Pattern",
                detail: "Payment events are committed atomically to a dedicated 'outbox_events' table in PostgreSQL within the primary business transaction. A Change Data Capture (CDC) worker relays events to RabbitMQ, ensuring at-least-once delivery."
            },
            {
                topic: "Distributed Concurrency & Idempotency",
                detail: "ShedLock combined with unique idempotent request keys prevents race conditions on duplicate POS retries, ensuring strict ACID consistency without database deadlocks."
            },
            {
                topic: "Failure Handling & Dead Letter Queues (DLQ)",
                detail: "Circuit breakers isolate external scheme timeouts. Unprocessable payloads are forwarded to DLQs with exponential backoff retry metadata for automated reprocessing."
            }
        ],
        limitations: "Tested locally in simulated load harness. Production deployments would require multi-region distributed active-active database replication and hardware-grade physical HSMs.",
        flow: ["Terminal POS Request", "Switch Inbound Router", "SoftHSM (PIN Trans)", "Scheme Router", "Outbox CDC Relay"]
    },

    softhsm: {
        title: "C++ SoftHSM (Cryptographic Security Module)",
        stack: "C++ • POSIX TCP Sockets • 3DES / AES-CBC • PKCS#11 Concepts",
        status: "Engineering Simulation (Educational / Testbed)",
        summary: "A low-latency C++ socket daemon simulating Hardware Security Module (HSM) commands for cryptographic key rotation and PIN block translation.",
        problem: "Accessing physical HSMs (e.g., Thales payShield) in pre-production test environments incurs high licensing and hardware costs while stalling scheme integration test cycles.",
        decisions: [
            {
                topic: "In-Memory PIN Block Translation",
                detail: "Accepts ISO 9564 Format 0/1 PIN blocks encrypted under Terminal Master Key (TMK) and re-encrypts them under Zone PIN Key (ZPK) in volatile memory without persisting plain PINs."
            },
            {
                topic: "Master Key Hierarchy (LMK / TMK / ZPK)",
                detail: "Simulates Local Master Key (LMK) protection for storing terminal and interchange keys securely in encrypted key stores."
            },
            {
                topic: "Key Check Value (KCV) Verification",
                detail: "Computes 6-character hexadecimal KCVs via single-block encryption of binary zeros to validate key synchronization without revealing secrets."
            }
        ],
        limitations: "Software-based cryptographic simulator without tamper-responsive physical enclosures. Designed exclusively for integration testbeds and local protocol verification, not for live PCI production keys.",
        flow: ["Inbound Socket Command", "Verify TMK Header", "Decrypt PIN Block", "Re-encrypt with ZPK", "Generate KCV Check"]
    },

    visanet: {
        title: "VisaNet Scheme Emulator (ISO 8583 Base I)",
        stack: "Java 21 • ISO 8583 Protocol • TCP Sockets • Binary Bitmaps",
        status: "Protocol Verification Harness",
        summary: "Binary financial messaging engine emulating VisaNet Base I scheme endpoints for automated integration testing, stress testing, and response injection.",
        problem: "Simulating edge-case bank responses (e.g., scheme timeouts, partial approvals, fraud declines) against live card schemes during early-stage switch development is restricted and costly.",
        decisions: [
            {
                topic: "Binary Bitmap & Variable-Length Parsing",
                detail: "Implements strict parsing for primary and secondary bitmasks, BCD-packed amounts (DE4), and variable-length LLVAR / LLLVAR fields (DE48, DE55 EMV data)."
            },
            {
                topic: "Deterministic Response Injection",
                detail: "Configurable rule engine capable of returning RFC response codes (00 Approved, 51 Insufficient Funds, 05 Do Not Honor, 43 Lost/Stolen Card) based on test PANs."
            },
            {
                topic: "Simulated Concurrency Benchmarks",
                detail: "Provides high-frequency mock responses over persistent TCP sockets to benchmark Switch queuing behaviors under concurrent load spikes."
            }
        ],
        limitations: "Implements core authorization message sets (MTI 0100, 0110, 0420 reversals). Does not cover full administrative network management sets (MTI 0800) or Visa extended private subfields.",
        flow: ["Raw TCP Packet", "Unpack Bitmap", "Parse DE Fields", "Evaluate Test Rules", "Pack MTI 0110 & Return"]
    },

    clearing: {
        title: "Clearing & Financial Reconciliation Engine",
        stack: "Spring Batch • Positional TC50 File (Visa Base II) • PostgreSQL",
        status: "Batch Processing Architecture",
        summary: "Asynchronous batch pipeline processing settled transaction logs after end-of-day cut-off to generate interchange settlement files and compute merchant payout ledgers.",
        problem: "Reconciling millions of transactions post cut-off requires fault-tolerant chunk-oriented processing to avoid memory exhaustion and duplicate accounting entries.",
        decisions: [
            {
                topic: "Chunk-Oriented Batch Processing",
                detail: "Uses Spring Batch with parameterized reader/writer steps to stream transactions in configurable chunks (e.g., 2,000 items/commit), enabling safe restartability upon failures."
            },
            {
                topic: "Positional Record Generation (TC50 / Base II)",
                detail: "Formats debit and credit records into standardized positional text layouts with character-exact padding and checksum controls for clearing house ingestion."
            },
            {
                topic: "Fee Apuration & Ledger Balancing",
                detail: "Calculates interchange fees, scheme dues, and net merchant payouts, generating audit ledger entries that highlight discrepancies between online authorization and settled batches."
            }
        ],
        limitations: "Current implementation processes relational records into Visa TC50 format. Multi-scheme clearing (Mastercard IPM format) is architected via extensible interfaces but not fully implemented.",
        flow: ["Cut-off Trigger", "Chunk Stream Reader", "Interchange Pricing", "Generate TC50 Batch", "Commit Ledger State"]
    },

    softpos: {
        title: "SoftPOS Mobile NFC Contactless Capture",
        stack: "Android SDK • NFC • EMV Kernel L2 Concepts • APDU Commands",
        status: "Mobile Contactless Prototype",
        summary: "Android mobile prototype leveraging device Near Field Communication (NFC) to process contactless smartcard transactions without external dongles.",
        problem: "Enabling merchant contactless card capture on standard smartphones requires executing EMV Level 2 kernel state machines while protecting cardholder credentials in volatile memory.",
        decisions: [
            {
                topic: "APDU Command Sequence Orchestration",
                detail: "Executes standard EMV contactless sequences: Application Selection (Select AID), Application Initiation (Get Processing Options - GPO), and Read Records."
            },
            {
                topic: "Cryptogram (ARQC) Extraction",
                detail: "Extracts dynamic Application Cryptograms (ARQC) and Terminal Verification Results (TVR) from chip memory to forward to the Switch for issuer validation."
            },
            {
                topic: "Zero Plaintext Persistence",
                detail: "Isolates card PAN and expiry in transient memory structures, immediately formatting them into ISO 8583 payloads for TLS uplink transmission."
            }
        ],
        limitations: "Demonstration prototype executing basic EMV contactless APDU exchanges. Does not hold commercial PCI Mobile Payments on COTS (MPOC) lab certification.",
        flow: ["Contactless Tap", "Select AID APDU", "GPO Negotiation", "Read Chip Records", "Forward Cryptogram"]
    }
};

const orionDataPt = {
    switch: {
        title: "Acquiring Switch & Núcleo de Autorização",
        stack: "Java 21 • Spring Boot • PostgreSQL • ShedLock • RabbitMQ",
        status: "Protótipo de Engenharia / Arquitetura de Referência",
        summary: "Switch de transações financeiras de alta vazão projetado com estrita Separação de Responsabilidades (SoC). Desacopla a autorização online síncrona das etapas posteriores de compensação (clearing) e razão contábil (ledger).",
        problem: "Vulnerabilidades de escrita dupla (dual-write) entre bancos de dados transacionais e brokers de mensageria podem causar perda silenciosa de eventos ou divergência de conciliação durante picos de carga no gateway.",
        decisions: [
            {
                topic: "Padrão Transactional Outbox",
                detail: "Eventos de pagamento são confirmados atomicamente em uma tabela dedicada 'outbox_events' no PostgreSQL dentro da mesma transação de negócio. Um worker de Change Data Capture (CDC) publica os eventos no RabbitMQ, garantindo entrega at-least-once."
            },
            {
                topic: "Concorrência Distribuída & Idempotência",
                detail: "ShedLock combinado com chaves únicas de idempotência evita condições de corrida em retentativas duplicadas do POS, assegurando consistência ACID sem deadlocks no banco."
            },
            {
                topic: "Tratamento de Falhas & Dead Letter Queues (DLQ)",
                detail: "Circuit breakers isolam timeouts de bandeiras externas. Payloads não processáveis são encaminhados para DLQs com metadados de backoff exponencial para reprocessamento seguro."
            }
        ],
        limitations: "Testado localmente em ambiente de carga simulada. Implantações em produção exigiriam replicação distribuída multi-região do banco de dados e HSMs físicos homologados.",
        flow: ["Requisição POS", "Roteador Switch", "SoftHSM (PIN Trans)", "Roteador Bandeira", "Relay Outbox CDC"]
    },

    softhsm: {
        title: "C++ SoftHSM (Módulo de Segurança Criptográfica)",
        stack: "C++ • Sockets TCP POSIX • 3DES / AES-CBC • Conceitos PKCS#11",
        status: "Simulação de Engenharia (Educacional / Testbed)",
        summary: "Daemon socket C++ de baixa latência que simula comandos de Hardware Security Module (HSM) para rotação de chaves criptográficas e tradução de PIN block.",
        problem: "O acesso a HSMs físicos (ex.: Thales payShield) em ambientes de pré-produção gera altos custos de licenciamento e hardware, atrasando ciclos de testes de integração com bandeiras.",
        decisions: [
            {
                topic: "Tradução de PIN Block em Memória Volátil",
                detail: "Aceita PIN blocks ISO 9564 Formato 0/1 criptografados sob a Terminal Master Key (TMK) e os recriptografa sob a Zone PIN Key (ZPK) em memória volátil sem jamais persistir PINs em texto aberto."
            },
            {
                topic: "Hierarquia de Chaves (LMK / TMK / ZPK)",
                detail: "Simula a proteção por Local Master Key (LMK) para armazenamento de chaves de terminais e de intercâmbio em cofres criptografados."
            },
            {
                topic: "Verificação de Key Check Value (KCV)",
                detail: "Calcula KCVs hexadecimais de 6 caracteres via criptografia de bloco único de zeros binários para validar sincronia de chaves sem expor segredos."
            }
        ],
        limitations: "Simulador criptográfico em software sem gabinete físico resistente a violação (tamper-responsive). Projetado exclusivamente para laboratórios de integração e verificação de protocolo, não para chaves PCI de produção.",
        flow: ["Comando Socket TCP", "Verificar Header TMK", "Decifrar PIN Block", "Recifrar com ZPK", "Validar KCV"]
    },

    visanet: {
        title: "Emulador de Bandeira VisaNet (ISO 8583 Base I)",
        stack: "Java 21 • Protocolo ISO 8583 • Sockets TCP • Bitmaps Binários",
        status: "Arneses de Verificação de Protocolo",
        summary: "Motor binário de mensageria financeira que emula endpoints da bandeira VisaNet Base I para testes automatizados de integração, testes de estresse e injeção determinística de respostas.",
        problem: "Simular respostas bancárias de borda (timeouts de bandeira, aprovações parciais, recusas de fraude) contra redes reais de cartões durante o desenvolvimento inicial do switch é restrito e oneroso.",
        decisions: [
            {
                topic: "Parsing de Bitmap Binário & Campos Variáveis",
                detail: "Implementa parsing estrito de bitmaps primário e secundário, valores compactados em BCD (DE4) e campos de tamanho variável LLVAR / LLLVAR (DE48, dados EMV DE55)."
            },
            {
                topic: "Injeção Determinística de Respostas",
                detail: "Motor de regras configurável capaz de retornar códigos de resposta ISO (00 Aprovado, 51 Saldo Insuficiente, 05 Não Autorizado, 43 Cartão Extraviado) com base em PANs de teste."
            },
            {
                topic: "Simulação de Concorrência em Sockets TCP",
                detail: "Fornece respostas simuladas de alta frequência sobre conexões TCP persistentes para avaliar o comportamento de enfileiramento do Switch sob picos de concorrência."
            }
        ],
        limitations: "Implementa o conjunto principal de mensagens de autorização (MTI 0100, 0110 e reversões 0420). Não cobre mensagens administrativas completas de rede (MTI 0800) ou subcampos privados estendidos.",
        flow: ["Pacote TCP Bruto", "Desempacotar Bitmap", "Ler Campos DE", "Avaliar Regras", "Empacotar MTI 0110"]
    },

    clearing: {
        title: "Motor de Clearing & Conciliação Financeira",
        stack: "Spring Batch • Arquivo Posicional TC50 (Visa Base II) • PostgreSQL",
        status: "Arquitetura de Processamento Batch",
        summary: "Pipeline batch assíncrono que processa logs de transações liquidadas após a janela diária de cut-off para gerar arquivos de compensação e calcular o livro-razão (ledger) de pagamento aos lojistas.",
        problem: "Conciliar grandes volumes de transações após o cut-off exige processamento orientado a chunks tolerante a falhas para evitar exaustão de memória e lançamentos contábeis duplicados.",
        decisions: [
            {
                topic: "Processamento Batch Orientado a Chunks",
                detail: "Utiliza Spring Batch com etapas parametrizadas de leitura/escrita para processar transações em lotes configuráveis (ex.: 2.000 itens/commit), permitindo retomada segura (restartability) em caso de falha."
            },
            {
                topic: "Geração de Registros Posicionais (TC50 / Base II)",
                detail: "Formata registros de débito e crédito em layouts posicionais padronizados com preenchimento exato de caracteres e controles de checksum para ingestão pela câmara de compensação."
            },
            {
                topic: "Apuração de Taxas & Balanceamento de Ledger",
                detail: "Calcula taxas de intercâmbio (interchange), MDR e valor líquido do lojista, gerando lançamentos contábeis de partidas dobradas auditáveis."
            }
        ],
        limitations: "A implementação atual processa registros relacionais para o formato Visa TC50. O clearing multibandeira (formato Mastercard IPM) é previsto via interfaces extensíveis, mas não está totalmente implementado.",
        flow: ["Gatilho Cut-Off", "Leitor de Chunks", "Cálculo de Taxas", "Gerar Lote TC50", "Confirmar Ledger"]
    },

    softpos: {
        title: "Captura Mobile NFC Contactless (SoftPOS)",
        stack: "Android SDK • NFC • Conceitos EMV Kernel L2 • Comandos APDU",
        status: "Protótipo Mobile Contactless",
        summary: "Protótipo mobile Android que utiliza a antena Near Field Communication (NFC) do dispositivo para processar transações de cartão sem contato sem necessidade de leitores externos.",
        problem: "Habilitar a captura de cartões sem contato em smartphones padrão requer orquestrar máquinas de estado EMV Nível 2 protegendo as credenciais do portador em memória volátil.",
        decisions: [
            {
                topic: "Orquestração de Sequência de Comandos APDU",
                detail: "Executa sequências padrão EMV contactless: Seleção de Aplicação (Select AID), Iniciação (Get Processing Options - GPO) e Leitura de Registros (Read Records)."
            },
            {
                topic: "Extração de Criptograma Dinâmico (ARQC)",
                detail: "Extrai Application Cryptograms (ARQC) dinâmicos e Terminal Verification Results (TVR) da memória do chip para envio ao Switch e validação pelo emissor."
            },
            {
                topic: "Zero Persistência em Texto Aberto",
                detail: "Isola PAN e validade em estruturas de memória transientes, formatando-os imediatamente em payloads para transmissão segura via TLS."
            }
        ],
        limitations: "Protótipo demonstrativo executando trocas básicas de APDU EMV contactless. Não possui certificação laboratorial comercial PCI Mobile Payments on COTS (MPOC).",
        flow: ["Aproximação NFC", "APDU Select AID", "Negociação GPO", "Ler Registros Chip", "Enviar Criptograma"]
    }
};
