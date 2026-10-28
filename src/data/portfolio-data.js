/**
 * Central Bilingual Data Layer (EN & PT-BR)
 * Francisco Araújo | Senior Backend Engineer Portfolio
 */

export const ORION_TABS_LIST = [
  {
    key: 'switch',
    icon: 'cpu',
    color: 'emerald',
    titleEn: 'Acquiring Switch & Core',
    subtitleEn: 'Java 21 • Sub-200ms Window • Outbox Pattern',
    titlePt: 'Acquiring Switch & Core',
    subtitlePt: 'Java 21 • Janela Sub-200ms • Outbox Pattern',
  },
  {
    key: 'softhsm',
    icon: 'shield',
    color: 'cyan',
    titleEn: 'C++ SoftHSM (Security Module)',
    subtitleEn: 'PIN Block Translation • 3DES/AES • KCV Checks',
    titlePt: 'C++ SoftHSM (Módulo de Segurança)',
    subtitlePt: 'Tradução de PIN Block • 3DES/AES • Validação KCV',
  },
  {
    key: 'visanet',
    icon: 'network',
    color: 'amber',
    titleEn: 'VisaNet Scheme Emulator',
    subtitleEn: 'ISO 8583 Base I • Bitmaps • Testbed Injection',
    titlePt: 'Emulador de Bandeira VisaNet',
    subtitlePt: 'ISO 8583 Base I • Bitmaps • Injeção de Testes',
  },
  {
    key: 'clearing',
    icon: 'coins',
    color: 'blue',
    titleEn: 'Clearing & Reconciliation',
    subtitleEn: 'Spring Batch • Positional TC50 File • Ledger',
    titlePt: 'Clearing & Conciliação Financeira',
    subtitlePt: 'Spring Batch • Arquivo Posicional TC50 • Ledger',
  },
  {
    key: 'softpos',
    icon: 'smartphone',
    color: 'indigo',
    titleEn: 'SoftPOS Mobile Contactless',
    subtitleEn: 'Android NFC • EMV L2 Kernel • APDU Commands',
    titlePt: 'SoftPOS Mobile Contactless',
    subtitlePt: 'Android NFC • Kernel EMV L2 • Comandos APDU',
  },
];

export const ORION_CASE_STUDIES = {
  en: {
    switch: {
      badge: 'CORE ENGINE • JAVA 21 & SPRING BOOT 3.2',
      title: 'Acquiring Switch & Transaction Orchestrator',
      subtitle:
        'High-concurrency authorization engine handling synchronous ISO 8583 routing, strict idempotency locks, and Transactional Outbox event persistence.',
      problem:
        'Payment switches must coordinate synchronous socket calls to card schemes while guaranteeing that network retries never double-charge a cardholder and that asynchronous settlement events are never lost if the message broker experiences a transient outage.',
      architecture: [
        'Non-blocking request pipeline in Java 21 with structured concurrency and bounded connection pools.',
        'Idempotency barrier backed by PostgreSQL unique constraints (`Idempotency-Key` + SHA-256 payload hash) returning deterministic cached snapshots on duplicate network retries.',
        'Transactional Outbox pattern committing the `transactions` state change and the `outbox_events` record within the exact same local ACID transaction.',
        'Resilience4j circuit breakers and strict socket read timeouts isolating slow downstream scheme connections.',
      ],
      tradeoffs: [
        'Chose strong local ACID consistency + Outbox eventual consistency over distributed 2-Phase Commit (2PC) to avoid blocking authorization threads on RabbitMQ availability.',
        'Requires downstream consumers to implement idempotent deduplication (`processed_events`) because Outbox + Relay guarantees At-Least-Once delivery rather than Exactly-Once.',
      ],
      stack: [
        'Java 21',
        'Spring Boot 3.2',
        'PostgreSQL 16',
        'Transactional Outbox',
        'RabbitMQ (DLQ)',
        'Resilience4j',
        'Testcontainers',
      ],
      metricsLabel1: 'Target Latency Window',
      metricsVal1: '< 200ms (Design Target; not a measured production SLA)',
      metricsLabel2: 'Delivery Guarantee',
      metricsVal2: 'At-Least-Once + Consumer Dedup',
      limitations:
        'Authorial reference architecture and protocol testbed. The sub-200ms latency is an architectural design target, not a measured production SLA across live telecom links. In this portfolio, the switch behavior is demonstrated via the client-side state machine in /simulator.',
    },
    softhsm: {
      badge: 'CRYPTOGRAPHIC SECURITY • MODERN C++17',
      title: 'C++ SoftHSM — Cryptographic Hardware Simulator',
      subtitle:
        'Low-latency software simulation of a Financial Hardware Security Module (HSM) performing PIN Block translation and key verification.',
      problem:
        'In payment acquiring, cardholder PIN blocks encrypted under a Terminal Master Key (TMK) at the POS must be translated to the card scheme Zone PIN Key (ZPK) without ever exposing plaintext PIN digits in application logs or JVM heap memory.',
      architecture: [
        'Written in Modern C++17 using OpenSSL EVP APIs for Triple-DES (3DES) and AES-256 symmetric key operations.',
        'Implements ISO 9564 Format 0 (ANSI X9.8) PIN Block XOR construction, decryption under TMK, and immediate re-encryption under ZPK inside isolated memory buffers.',
        'Validates Key Check Values (KCV) prior to key ceremony injection to prevent parity or key-mismatch errors during authorization.',
        'Exposes a lightweight binary TCP command interface inspired by Thales PayShield host commands.',
      ],
      tradeoffs: [
        'Software simulation enables deterministic local integration testing and CI/CD execution without physical PCI-PTS HSM appliances.',
        'Explicitly scoped as an educational/testing simulator: production acquiring environments require physical FIPS 140-3 Level 3 / PCI-HSM certified hardware.',
      ],
      stack: [
        'C++17',
        'OpenSSL Crypto',
        'ISO 9564 Format 0',
        '3DES / DUKPT / AES',
        'TMK -> ZPK Translation',
        'KCV Verification',
        'POSIX Sockets',
      ],
      metricsLabel1: 'Crypto Execution',
      metricsVal1: 'In-Memory Zero-Log Buffer',
      metricsLabel2: 'PIN Format Standard',
      metricsVal2: 'ISO 9564-1 Format 0',
      limitations:
        'Software simulator for architectural demonstration and testing; does not replace physical tamper-responsive HSM hardware in production PCI-PIN environments.',
    },
    visanet: {
      badge: 'SCHEME PROTOCOL • ISO 8583 BASE I',
      title: 'VisaNet Base I Scheme Emulator & Fault Injector',
      subtitle:
        'Binary ISO 8583 socket server emulating card scheme authorization responses (`0100`/`0110`) and reversal advice flows (`0420`/`0430`).',
      problem:
        'Developing and load-testing an acquiring switch against external card scheme sandboxes is slow and restrictive, especially when testing edge cases such as socket drops, corrupted bitmaps, or issuer timeout reversals.',
      architecture: [
        'Parses 2-byte big-endian length headers, primary/secondary 64-bit binary bitmaps, and variable-length LLVAR/LLLVAR fields (`DE2`, `DE3`, `DE4`, `DE11`, `DE39`, `DE41`, `DE52`).',
        'Rule-based response engine returning deterministic approval (`DE39=00`), insufficient funds (`DE39=51`), expired card (`DE39=54`), or simulated latency spikes.',
        'Supports automatic `MTI 0420` Acquirer Reversal Advice verification when the switch times out waiting for `0110`.',
      ],
      tradeoffs: [
        'Models core ISO 8583 Base I authorization and reversal data elements needed for switch verification rather than the full proprietary VisaNet VIP specification.',
        'Provides deterministic, reproducible responses ideal for automated integration tests and technical demonstrations.',
      ],
      stack: [
        'Java 21 NIO Sockets',
        'ISO 8583:1987',
        'Binary Bitmaps',
        'MTI 0100 / 0110 / 0420',
        'Fault Injection',
        'JUnit 5',
      ],
      metricsLabel1: 'Protocol Framing',
      metricsVal1: 'Binary Bitmap + 2-Byte Header',
      metricsLabel2: 'Test Scenarios',
      metricsVal2: 'Approve / Decline / Timeout',
      limitations:
        'Synthetic scheme emulator with no connection to Visa, Mastercard, or real issuing banks.',
    },
    clearing: {
      badge: 'BATCH SETTLEMENT • SPRING BATCH & LEDGER',
      title: 'Base II Clearing, Fee Engine & Double-Entry Settlement',
      subtitle:
        'End-of-day batch pipeline reconciling captured authorizations into positional clearing files (`TC50`/`TC57`) and balanced accounting entries.',
      problem:
        'Online authorization (`Base I`) only places a temporary hold on cardholder funds. Actual financial movement requires end-of-day batch clearing (`Base II`), calculating Merchant Discount Rate (MDR) and interchange fees, and booking balanced double-entry ledger payouts.',
      architecture: [
        'Chunk-oriented Spring Batch steps (`ItemReader` -> `FeeCalculationProcessor` -> `CompositeItemWriter`) with execution checkpoints persisted in PostgreSQL.',
        'Distributed job locking via ShedLock to guarantee that only one cluster node executes the daily cut-off window.',
        'Double-entry accounting model ensuring `Debit (Scheme Receivable)` strictly equals `Credit (Merchant Net Payout) + Credit (Acquirer MDR Revenue)`.',
        'Generates standardized fixed-width positional records inspired by Visa Base II TC50/TC57 layouts.',
      ],
      tradeoffs: [
        'Batch cut-off windows introduce scheduled latency (T+1 settlement) in exchange for high-throughput bulk reconciliation and lower per-transaction clearing overhead.',
        'Chunk checkpoints allow failed batch jobs to restart from the last committed chunk without duplicating ledger entries.',
      ],
      stack: [
        'Spring Batch 5',
        'ShedLock',
        'PostgreSQL Ledger',
        'Base II TC50 / TC57',
        'Double-Entry Accounting',
        'BigDecimal Half-Even',
      ],
      metricsLabel1: 'Accounting Model',
      metricsVal1: 'Balanced Double-Entry',
      metricsLabel2: 'Concurrency Control',
      metricsVal2: 'ShedLock + Chunk Checkpoints',
      limitations:
        'Demonstrated in Scenario D of the interactive simulator using synthetic batch records.',
    },
    softpos: {
      badge: 'EDGE CAPTURE • ANDROID NFC & EMV L2',
      title: 'SoftPOS Contactless Capture & Edge Idempotency',
      subtitle:
        'Android payment capture client exchanging APDU commands over NFC and initiating idempotent HTTPS authorization requests.',
      problem:
        'Mobile SoftPOS terminals operate over unstable cellular and Wi-Fi networks where packet drops after sending a payment request are common, requiring strict client-generated idempotency keys and envelope encryption at the edge.',
      architecture: [
        'Communicates with contactless smartcards via Android `IsoDep` NFC APIs using ISO/IEC 7816-4 APDU command-response pairs.',
        'Extracts EMV Tag data (`9F26` Application Cryptogram, `9F02` Amount Authorized, `5A` Masked PAN) and builds the encrypted transaction payload.',
        'Generates a deterministic `Idempotency-Key` (UUIDv4) per payment attempt before the first network packet leaves the device.',
      ],
      tradeoffs: [
        'Client-side UUID generation combined with server-side payload hash validation prevents accidental double charges when the mobile app retries after a socket timeout.',
        'In the web simulator, SoftPOS acts as the synthetic request origin node.',
      ],
      stack: [
        'Android SDK (Java/Kotlin)',
        'NFC IsoDep / APDU',
        'EMVCo L2 Tags',
        'TLS 1.3 + Idempotency-Key',
        'PIN Block Format 0',
      ],
      metricsLabel1: 'Card Interface',
      metricsVal1: 'ISO 14443-4 / APDU',
      metricsLabel2: 'Retry Safety',
      metricsVal2: 'Client UUIDv4 Idempotency Key',
      limitations:
        'Simulated as the origin node in the browser state machine using synthetic card and EMV data.',
    },
  },
  pt: {
    switch: {
      badge: 'MOTOR CENTRAL • JAVA 21 & SPRING BOOT 3.2',
      title: 'Acquiring Switch & Orquestrador de Transações',
      subtitle:
        'Motor de autorização de alta concorrência com roteamento síncrono ISO 8583, travas estritas de idempotência e persistência de eventos via Transactional Outbox.',
      problem:
        'Switches de pagamento precisam coordenar chamadas síncronas de socket para as bandeiras garantindo que retentativas de rede nunca cobrem o portador duas vezes e que eventos assíncronos de liquidação jamais se percam caso o broker de mensageria sofra uma queda temporária.',
      architecture: [
        'Pipeline de requisição em Java 21 com concorrência estruturada e pools de conexão dimensionados.',
        'Barreira de idempotência apoiada em restrições de unicidade no PostgreSQL (`Idempotency-Key` + hash SHA-256 do payload), devolvendo snapshots determinísticos em retentativas duplicadas.',
        'Padrão Transactional Outbox realizando commit da mudança de estado em `transactions` e do evento em `outbox_events` na mesma transação local ACID.',
        'Circuit breakers (Resilience4j) e timeouts rigorosos de leitura de socket isolando lentidões externas.',
      ],
      tradeoffs: [
        'Escolhida consistência ACID local forte + consistência eventual via Outbox em vez de Two-Phase Commit (2PC) distribuído para não bloquear threads de autorização caso o RabbitMQ oscile.',
        'Exige que os consumidores implementem deduplicação idempotente (`processed_events`), pois Outbox + Relay garante entrega At-Least-Once (pelo menos uma vez) e não Exactly-Once.',
      ],
      stack: [
        'Java 21',
        'Spring Boot 3.2',
        'PostgreSQL 16',
        'Transactional Outbox',
        'RabbitMQ (DLQ)',
        'Resilience4j',
        'Testcontainers',
      ],
      metricsLabel1: 'Janela Alvo de Latência',
      metricsVal1: '< 200ms (Meta de Arquitetura; não é SLA de produção)',
      metricsLabel2: 'Garantia de Entrega',
      metricsVal2: 'At-Least-Once + Dedup no Consumidor',
      limitations:
        'Arquitetura de referência autoral e bancada de testes de protocolo. O tempo sub-200ms é uma meta de projeto de arquitetura, e não um SLA de produção medido sob links de telecom de bandeiras. Neste portfólio, o comportamento do switch é demonstrado pela máquina de estados local na página /simulator.',
    },
    softhsm: {
      badge: 'SEGURANÇA CRIPTOGRÁFICA • MODERN C++17',
      title: 'C++ SoftHSM — Simulador de Hardware Criptográfico',
      subtitle:
        'Simulação em software de baixa latência de um Hardware Security Module (HSM) financeiro realizando tradução de PIN Block e verificação de chaves.',
      problem:
        'Na adquirência, os PIN blocks criptografados sob a chave do terminal (TMK) no POS precisam ser traduzidos para a chave de zona da bandeira (ZPK) sem jamais expor os dígitos do PIN em texto aberto em logs ou na memória heap da JVM.',
      architecture: [
        'Desenvolvido em C++17 moderno utilizando APIs OpenSSL EVP para operações simétricas Triple-DES (3DES) e AES-256.',
        'Implementa construção XOR de PIN Block ISO 9564 Formato 0 (ANSI X9.8), decriptografia sob TMK e recriptografia imediata sob ZPK em buffers isolados de memória.',
        'Valida Key Check Values (KCV) antes da injeção de chaves para evitar erros de paridade ou divergência criptográfica durante a autorização.',
        'Expõe interface TCP binária enxuta inspirada em comandos host de HSMs financeiros.',
      ],
      tradeoffs: [
        'A simulação em software viabiliza testes de integração locais determinísticos e execução em pipelines CI/CD sem depender de appliances físicos.',
        'Escopo explicitamente educacional e de testes: ambientes produtivos reais exigem hardware físico certificado FIPS 140-3 Nível 3 / PCI-HSM.',
      ],
      stack: [
        'C++17',
        'OpenSSL Crypto',
        'ISO 9564 Formato 0',
        '3DES / DUKPT / AES',
        'Tradução TMK -> ZPK',
        'Verificação KCV',
        'POSIX Sockets',
      ],
      metricsLabel1: 'Execução Criptográfica',
      metricsVal1: 'Buffer em Memória Zero-Log',
      metricsLabel2: 'Padrão de PIN Block',
      metricsVal2: 'ISO 9564-1 Formato 0',
      limitations:
        'Simulador em software para demonstração arquitetural e testes; não substitui hardware HSM físico certificado em ambientes produtivos PCI-PIN.',
    },
    visanet: {
      badge: 'PROTOCOLO DE BANDEIRA • ISO 8583 BASE I',
      title: 'Emulador de Bandeira VisaNet Base I & Injetor de Falhas',
      subtitle:
        'Servidor socket binário ISO 8583 emulando respostas de autorização (`0100`/`0110`) e fluxos de reversão automática (`0420`/`0430`).',
      problem:
        'Desenvolver e testar um switch adquirente contra sandboxes externos de bandeiras é lento e restritivo, especialmente para validar casos extremos como quedas de socket, bitmaps corrompidos ou reversões por timeout do emissor.',
      architecture: [
        'Interpreta cabeçalhos big-endian de 2 bytes, bitmaps binários primários/secundários de 64 bits e campos LLVAR/LLLVAR (`DE2`, `DE3`, `DE4`, `DE11`, `DE39`, `DE41`, `DE52`).',
        'Motor determinístico de regras retornando aprovação (`DE39=00`), saldo insuficiente (`DE39=51`), cartão vencido (`DE39=54`) ou picos simulados de latência.',
        'Suporta validação automática de mensagens de reversão `MTI 0420` quando o switch sofre timeout aguardando o `0110`.',
      ],
      tradeoffs: [
        'Modela os Data Elements centrais de autorização e reversão ISO 8583 Base I necessários para validação do switch, em vez da especificação proprietária completa.',
        'Oferece respostas determinísticas e reproduzíveis ideais para testes automatizados e demonstrações técnicas.',
      ],
      stack: [
        'Java 21 NIO Sockets',
        'ISO 8583:1987',
        'Bitmaps Binários',
        'MTI 0100 / 0110 / 0420',
        'Injeção de Falhas',
        'JUnit 5',
      ],
      metricsLabel1: 'Framing de Protocolo',
      metricsVal1: 'Bitmap Binário + Header 2 Bytes',
      metricsLabel2: 'Cenários de Teste',
      metricsVal2: 'Aprovação / Recusa / Timeout',
      limitations:
        'Emulador sintético de bandeira sem qualquer conexão com Visa, Mastercard ou bancos emissores reais.',
    },
    clearing: {
      badge: 'LIQUIDAÇÃO EM LOTE • SPRING BATCH & LEDGER',
      title: 'Clearing Base II, Motor de Tarifas & Ledger de Partidas Dobradas',
      subtitle:
        'Pipeline batch de fim de dia conciliando autorizações capturadas em arquivos posicionais (`TC50`/`TC57`) e lançamentos contábeis balanceados.',
      problem:
        'A autorização online (`Base I`) apenas reserva o limite do portador. A liquidação financeira real exige o processamento em lote (`Base II`) após o cut-off diário, calculando taxas de desconto (MDR) e intercâmbio e escriturando repasses em partidas dobradas.',
      architecture: [
        'Steps orientados a chunks no Spring Batch (`ItemReader` -> `FeeCalculationProcessor` -> `CompositeItemWriter`) com checkpoints persistidos no PostgreSQL.',
        'Trava distribuída via ShedLock garantindo que apenas um nó do cluster execute a janela diária de cut-off.',
        'Modelo contábil de partidas dobradas assegurando que `Débito (Recebível da Bandeira)` seja estritamente igual a `Crédito (Repasse Líquido ao Lojista) + Crédito (Receita MDR)`.',
        'Geração de registros posicionais padronizados inspirados nos layouts Visa Base II TC50/TC57.',
      ],
      tradeoffs: [
        'Janelas de cut-off em lote introduzem latência programada (liquidação D+1/D+30) em troca de alta vazão na conciliação em massa.',
        'Checkpoints por chunk permitem retomar jobs interrompidos a partir do último bloco gravado sem duplicar lançamentos no livro-razão (ledger).',
      ],
      stack: [
        'Spring Batch 5',
        'ShedLock',
        'PostgreSQL Ledger',
        'Base II TC50 / TC57',
        'Partidas Dobradas',
        'BigDecimal Half-Even',
      ],
      metricsLabel1: 'Modelo Contábil',
      metricsVal1: 'Partidas Dobradas Balanceadas',
      metricsLabel2: 'Controle de Concorrência',
      metricsVal2: 'ShedLock + Checkpoints de Chunk',
      limitations:
        'Demonstrado no Cenário D do simulador interativo utilizando registros sintéticos de lote.',
    },
    softpos: {
      badge: 'CAPTURA DE BORDA • ANDROID NFC & EMV L2',
      title: 'Captura Contactless SoftPOS & Idempotência na Borda',
      subtitle:
        'Cliente Android de captura trocando comandos APDU via NFC e iniciando requisições HTTPS idempotentes de autorização.',
      problem:
        'Terminais móveis SoftPOS operam em redes móveis 4G/5G e Wi-Fi sujeitas a quedas de pacotes logo após o envio do pagamento, exigindo chaves de idempotência geradas no cliente e criptografia de ponta.',
      architecture: [
        'Comunica-se com cartões contactless via API Android `IsoDep` NFC utilizando pares comando-resposta APDU (ISO/IEC 7816-4).',
        'Extrai tags EMV (`9F26` Application Cryptogram, `9F02` Valor Autorizado, `5A` PAN Mascarado) e monta o envelope transacional.',
        'Gera um `Idempotency-Key` determinístico (UUIDv4) por tentativa de pagamento antes que o primeiro pacote saia do dispositivo.',
      ],
      tradeoffs: [
        'A geração de UUID no cliente combinada à verificação de hash SHA-256 no servidor impede cobranças duplas quando o app repete a chamada após timeout.',
        'No simulador web, o SoftPOS atua como o nó sintético de origem da requisição.',
      ],
      stack: [
        'Android SDK (Java/Kotlin)',
        'NFC IsoDep / APDU',
        'Tags EMVCo L2',
        'TLS 1.3 + Idempotency-Key',
        'PIN Block Formato 0',
      ],
      metricsLabel1: 'Interface de Cartão',
      metricsVal1: 'ISO 14443-4 / APDU',
      metricsLabel2: 'Segurança em Retentativas',
      metricsVal2: 'Chave UUIDv4 no Cliente',
      limitations:
        'Simulado como nó de origem na máquina de estados do navegador utilizando dados sintéticos.',
    },
  },
};

export const SKILLS_DATA = [
  // Backend Engineering
  {
    name: 'Java 21 / 17 / 11',
    cat: 'backend',
    context: 'corporate',
    desc: 'Virtual Threads, Concurrency, JVM Tuning',
    descPt: 'Virtual Threads, Concorrência, Tuning de JVM',
    evidenceEn: 'Core tech at RedeFlex, GFT (B3, Rabobank) & OrionPay Switch core',
    evidencePt: 'Tecnologia central na RedeFlex, GFT (B3, Rabobank) e OrionPay Switch',
  },
  {
    name: 'Spring Boot 3.x',
    cat: 'backend',
    context: 'corporate',
    desc: 'Microservices, WebFlux, Actuator, Security',
    descPt: 'Microsserviços, WebFlux, Actuator, Security',
    evidenceEn: 'Production microservices at RedeFlex & Serasa Experian migration',
    evidencePt: 'Microsserviços em produção na RedeFlex e migração Serasa Experian',
  },
  {
    name: 'Spring Batch',
    cat: 'backend',
    context: 'authorial',
    desc: 'Chunk Processing, Settlement Pipelines',
    descPt: 'Processamento em Chunks, Pipelines de Liquidação',
    evidenceEn: 'OrionPay Base II settlement batch pipeline (Scenario D in /simulator)',
    evidencePt: 'Pipeline de liquidação Base II do OrionPay (Cenário D em /simulator)',
  },
  {
    name: 'C++ (Modern 17)',
    cat: 'backend',
    context: 'corporate',
    desc: 'Memory-Safe Crypto Buffers, SoftHSM, OpenCV',
    descPt: 'Buffers Criptográficos em Memória, SoftHSM, OpenCV',
    evidenceEn: '5 years at Grupo Criar (biometrics) & authorial SoftHSM simulator',
    evidencePt: '5 anos no Grupo Criar (biometria) e simulador autoral SoftHSM',
  },
  {
    name: 'Hibernate / JPA',
    cat: 'backend',
    context: 'corporate',
    desc: 'Optimistic Locking, Query Tuning, HikariCP',
    descPt: 'Lock Otimista, Otimização de Queries, HikariCP',
    evidenceEn: 'High-throughput persistence at Duel Midia, RedeFlex & GFT',
    evidencePt: 'Persistência de alta vazão na Duel Midia, RedeFlex e GFT',
  },
  {
    name: 'Java EE / Jakarta',
    cat: 'backend',
    context: 'corporate',
    desc: 'Legacy Monolith to Microservices Migration',
    descPt: 'Migração de Monólitos Legados para Microsserviços',
    evidenceEn: 'Legacy core modernization at Serasa Experian (4 years at GFT)',
    evidencePt: 'Modernização de sistemas legados na Serasa Experian (4 anos na GFT)',
  },

  // Payment Systems
  {
    name: 'ISO 8583 (Base I/II)',
    cat: 'payment',
    context: 'corporate',
    desc: '0100/0110 Auth, 0420 Reversals, Binary Bitmaps',
    descPt: 'Autorização 0100/0110, Reversão 0420, Bitmaps Binários',
    evidenceEn: 'RedeFlex card acquirer switch & OrionPay VisaNet emulator',
    evidencePt: 'Switch de adquirência RedeFlex e emulador VisaNet OrionPay',
  },
  {
    name: 'VisaNet / Scheme Protocols',
    cat: 'payment',
    context: 'standard',
    desc: 'Scheme Routing, TC50 Layouts, Stand-In Advice',
    descPt: 'Roteamento de Bandeiras, Layouts TC50, Stand-In Advice',
    evidenceEn: 'Acquiring switch routing design & Base II positional file specs',
    evidencePt: 'Design de roteamento adquirente e especificações Base II TC50',
  },
  {
    name: 'EMV & NFC / APDU',
    cat: 'payment',
    context: 'authorial',
    desc: 'Contactless L2 Kernel, ARQC / ARPC Tags',
    descPt: 'Kernel Contactless L2, Tags ARQC / ARPC',
    evidenceEn: 'OrionPay SoftPOS mobile capture & ISO 7816-4 APDU command flow',
    evidencePt: 'Captura mobile SoftPOS OrionPay e fluxo de comandos APDU ISO 7816-4',
  },
  {
    name: 'Double-Entry Ledger',
    cat: 'payment',
    context: 'authorial',
    desc: 'MDR / Interchange Split, Reconciliation',
    descPt: 'Split de MDR / Intercâmbio, Conciliação Contábil',
    evidenceEn: 'Balanced accounting engine in OrionPay Clearing (Debit = Credit + MDR)',
    evidencePt: 'Motor contábil balanceado no OrionPay Clearing (Débito = Crédito + MDR)',
  },

  // Distributed Systems
  {
    name: 'Transactional Outbox',
    cat: 'distributed',
    context: 'authorial',
    desc: 'Atomic DB + Event Commit, Relay Workers',
    descPt: 'Commit Atômico BD + Evento, Relay Workers',
    evidenceEn: 'OrionPay Core switch architecture & interactive simulator (Scenario C)',
    evidencePt: 'Arquitetura do OrionPay Switch e simulador interativo (Cenário C)',
  },
  {
    name: 'Idempotency & Locks',
    cat: 'distributed',
    context: 'corporate',
    desc: 'SHA-256 Payload Hashing, ShedLock, Redis',
    descPt: 'Hash SHA-256 de Payload, ShedLock, Redis',
    evidenceEn: 'Preventing duplicate charges at RedeFlex & OrionPay Scenario B',
    evidencePt: 'Prevenção de cobrança dupla na RedeFlex e Cenário B do OrionPay',
  },
  {
    name: 'Apache Camel (EIP)',
    cat: 'distributed',
    context: 'corporate',
    desc: 'Enterprise Integration Patterns, Core Banking',
    descPt: 'Enterprise Integration Patterns, Core Bancário',
    evidenceEn: 'Production integration middleware for Rabobank Brasil (GFT)',
    evidencePt: 'Middleware de integração bancária em produção no Rabobank Brasil (GFT)',
  },

  // Messaging & Persistence
  {
    name: 'RabbitMQ & AMQP',
    cat: 'messaging',
    context: 'corporate',
    desc: 'Quorum Queues, DLQ, Exponential Backoff',
    descPt: 'Quorum Queues, DLQ, Exponential Backoff',
    evidenceEn: 'High-availability messaging topologies with DLQ at RedeFlex',
    evidencePt: 'Topologias de mensageria de alta disponibilidade com DLQ na RedeFlex',
  },
  {
    name: 'Apache Kafka',
    cat: 'messaging',
    context: 'corporate',
    desc: 'Event Streaming, Consumer Groups, Partitions',
    descPt: 'Streaming de Eventos, Consumer Groups, Partições',
    evidenceEn: 'Event-driven financial architectures at GFT & financial messaging',
    evidencePt: 'Arquiteturas orientadas a eventos na GFT e mensageria financeira',
  },
  {
    name: 'PostgreSQL',
    cat: 'messaging',
    context: 'corporate',
    desc: 'ACID Transactions, Indexing, Partitioning',
    descPt: 'Transações ACID, Indexação, Particionamento',
    evidenceEn: 'Production tuning at RedeFlex, Duel Midia & OrionPay Core DB',
    evidencePt: 'Tuning de produção na RedeFlex, Duel Midia e OrionPay Core DB',
  },
  {
    name: 'Redis',
    cat: 'messaging',
    context: 'corporate',
    desc: 'Distributed Caching, Idempotency TTL Locks',
    descPt: 'Cache Distribuído, Travas de Idempotência com TTL',
    evidenceEn: 'Sub-millisecond token and idempotency lock caching at RedeFlex',
    evidencePt: 'Cache de tokens e travas de idempotência sub-milissegundo na RedeFlex',
  },
  {
    name: 'Oracle & SQL Server',
    cat: 'messaging',
    context: 'corporate',
    desc: 'PL/SQL, Financial Core Banking Schemas',
    descPt: 'PL/SQL, Schemas de Core Bancário Financeiro',
    evidenceEn: 'Receivables registration at B3 & corporate banking at Rabobank (GFT)',
    evidencePt: 'Registro de recebíveis na B3 e core bancário no Rabobank (GFT)',
  },
  {
    name: 'Flyway / Liquibase',
    cat: 'messaging',
    context: 'corporate',
    desc: 'Zero-Downtime Schema Migrations',
    descPt: 'Migrações de Schema sem Indisponibilidade',
    evidenceEn: 'Database versioning in production CI/CD pipelines at RedeFlex & GFT',
    evidencePt: 'Versionamento de banco de dados em pipelines CI/CD na RedeFlex e GFT',
  },

  // Security & Cryptography
  {
    name: 'HSM & Cryptography',
    cat: 'security',
    context: 'authorial',
    desc: '3DES, AES, TMK/ZPK/LMK Key Hierarchy',
    descPt: '3DES, AES, Hierarquia de Chaves TMK/ZPK/LMK',
    evidenceEn: 'OrionPay C++ SoftHSM open-source simulator with OpenSSL EVP',
    evidencePt: 'Simulador autoral C++ SoftHSM do OrionPay com OpenSSL EVP',
  },
  {
    name: 'PIN Block ISO 9564',
    cat: 'security',
    context: 'standard',
    desc: 'Format 0 Translation, KCV Validation',
    descPt: 'Tradução Formato 0, Validação de KCV',
    evidenceEn: 'ANSI X9.8 XOR buffer translation in memory without plaintext logging',
    evidencePt: 'Tradução de buffer ANSI X9.8 XOR em memória sem logs de texto aberto',
  },
  {
    name: 'PCI-DSS / PIN Principles',
    cat: 'security',
    context: 'standard',
    desc: 'PAN Masking, Zero-Plaintext Logging, TLS 1.3',
    descPt: 'Mascaramento de PAN, Logs Zero-Plaintext, TLS 1.3',
    evidenceEn: 'Security architecture guidelines enforced in acquirer switch services',
    evidencePt: 'Diretrizes de arquitetura de segurança aplicadas em switches adquirentes',
  },

  // Testing & Observability
  {
    name: 'CI/CD & Testcontainers',
    cat: 'observability',
    context: 'corporate',
    desc: 'GitHub Actions, JUnit 5, Integration Tests',
    descPt: 'GitHub Actions, JUnit 5, Testes de Integração',
    evidenceEn: 'Automated integration suites testing real PostgreSQL & RabbitMQ instances',
    evidencePt: 'Suítes de integração automatizadas com instâncias reais de Postgres e RabbitMQ',
  },
  {
    name: 'Observability & APM',
    cat: 'observability',
    context: 'corporate',
    desc: 'OpenTelemetry, Prometheus, Grafana, MDC Logs',
    descPt: 'OpenTelemetry, Prometheus, Grafana, Logs MDC',
    evidenceEn: 'Distributed tracing & root-cause diagnostics at RedeFlex & Datadog lab',
    evidencePt: 'Rastreamento distribuído e diagnósticos na RedeFlex e Datadog lab',
  },

  // Cloud & Infrastructure
  {
    name: 'AWS Cloud',
    cat: 'cloud',
    context: 'corporate',
    desc: 'ECS, RDS, SQS/SNS, IAM, CloudWatch',
    descPt: 'ECS, RDS, SQS/SNS, IAM, CloudWatch',
    evidenceEn: 'Cloud infrastructure hosting transaction gateways at RedeFlex',
    evidencePt: 'Infraestrutura em nuvem para gateways de transação na RedeFlex',
  },
  {
    name: 'Docker & Kubernetes',
    cat: 'cloud',
    context: 'corporate',
    desc: 'Container Orchestration, Helm, Readiness Probes',
    descPt: 'Orquestração de Containers, Helm, Probes de Saúde',
    evidenceEn: 'Microservices containerization and cluster deployment at RedeFlex & GFT',
    evidencePt: 'Conteinerização de microsserviços e deploy em cluster na RedeFlex e GFT',
  },
];

export const EXPERIENCE_DATA = [
  {
    company: 'RedeFlex',
    current: true,
    badgeEn: 'Current Role',
    badgePt: 'Cargo Atual',
    domainEn: 'Card Acquiring & FinTech',
    domainPt: 'Adquirência de Cartões & FinTech',
    roleEn: 'Specialist Java Backend Engineer (Senior IC)',
    rolePt: 'Engenheiro Backend Java Especialista (Senior IC)',
    periodEn: 'March 2023 – Present',
    periodPt: 'Março 2023 – Presente',
    descEn:
      'Lead individual contributor driving the engineering and scalability of transaction acquiring gateways and high-availability messaging engines. Architected fault-tolerant asynchronous message processing using Java 17/21, AWS cloud infrastructure, and distributed RabbitMQ topologies with Dead Letter Queues (DLQ). Actively leveraged generative AI diagnostic tooling to accelerate root-cause analysis on distributed traces and optimize cryptographic routines.',
    descPt:
      'Contribuidor individual sênior liderando a engenharia e a escalabilidade de gateways de captura de transações e motores de mensageria de alta disponibilidade. Arquitetou processamento assíncrono tolerante a falhas utilizando Java 17/21, infraestrutura em nuvem AWS e topologias distribuídas RabbitMQ com Dead Letter Queues (DLQ). Utilizou ferramentas de diagnóstico baseadas em IA generativa para acelerar análises de causa-raiz em traces distribuídos e otimizar rotinas criptográficas.',
    tags: [
      'Java 17 / 21',
      'Spring Boot',
      'AWS Cloud',
      'RabbitMQ (DLQ / Retries)',
      'High-Availability Acquirer Switch',
    ],
  },
  {
    company: 'Grupo GFT',
    current: false,
    domainEn: 'Global Financial Technology Consulting',
    domainPt: 'Consultoria Global em Tecnologia Financeira',
    roleEn: 'Senior Java Engineer',
    rolePt: 'Engenheiro Java Sênior',
    periodEn: 'February 2019 – February 2023 (4 years)',
    periodPt: 'Fevereiro 2019 – Fevereiro 2023 (4 anos)',
    clients: [
      {
        nameEn: 'B3 – Brasil, Bolsa, Balcão (Brazilian Stock Exchange)',
        namePt: 'B3 – Brasil, Bolsa, Balcão (Bolsa de Valores Brasileira)',
        sectorEn: 'Capital Markets',
        sectorPt: 'Mercado de Capitais',
        color: 'emerald',
        descEn:
          'Engineered core features for regulated financial credit receivables registration platforms. Developed high-throughput synchronous APIs, transaction validation engines, and rigorous audit trails conforming to Central Bank (BACEN) regulatory requirements.',
        descPt:
          'Desenvolveu funcionalidades centrais para plataformas reguladas de registro de recebíveis de crédito financeiro. Implementou APIs síncronas de alta vazão, motores de validação transacional e trilhas de auditoria rigorosas em conformidade com as exigências regulatórias do Banco Central (BACEN).',
      },
      {
        nameEn: 'Rabobank Brasil (Multinational Banking)',
        namePt: 'Rabobank Brasil (Banco Multinacional)',
        sectorEn: 'Corporate Banking',
        sectorPt: 'Banco Corporativo',
        color: 'cyan',
        descEn:
          'Designed and implemented secure banking integration middleware utilizing Apache Camel Enterprise Integration Patterns (EIP) and Spring Boot, implementing reliable financial message routing with retry and dead-letter patterns across distributed core banking endpoints.',
        descPt:
          'Projetou e implementou middleware seguro de integração bancária utilizando Apache Camel (Enterprise Integration Patterns - EIP) e Spring Boot, garantindo roteamento confiável de mensagens financeiras com políticas de retry e dead-letter entre sistemas de core bancário.',
      },
      {
        nameEn: 'Serasa Experian (Credit Bureau)',
        namePt: 'Serasa Experian (Bureau de Crédito)',
        sectorEn: 'Credit Risk & High Volume',
        sectorPt: 'Risco de Crédito & Alto Volume',
        color: 'indigo',
        descEn:
          'Executed migration of legacy monolithic Java EE services into decoupled Spring Boot microservices, eliminating architectural technical debt and improving response time predictability under high-concurrency credit score inquiry workloads.',
        descPt:
          'Executou a migração de serviços legados monolíticos em Java EE para microsserviços desacoplados em Spring Boot, reduzindo dívida técnica arquitetural e melhorando a previsibilidade do tempo de resposta sob alta concorrência em consultas de score de crédito.',
      },
    ],
    tags: [
      'Java EE / Spring Boot',
      'Apache Camel (EIP)',
      'PostgreSQL Tuning',
      'Microservices Architecture',
    ],
  },
  {
    company: 'Duel Midia DV',
    current: false,
    roleEn: 'Java Backend Developer',
    rolePt: 'Desenvolvedor Backend Java',
    periodEn: 'June 2018 – November 2018',
    periodPt: 'Junho 2018 – Novembro 2018',
    descEn:
      'Built robust RESTful APIs handling high-concurrency traffic bursts for sports entertainment platforms. Optimized PostgreSQL connection pooling (HikariCP) and resolved query bottlenecks on WildFly application server clusters.',
    descPt:
      'Desenvolveu APIs RESTful robustas para suportar picos de tráfego de alta concorrência em plataformas de entretenimento esportivo. Otimizou pools de conexão PostgreSQL (HikariCP) e eliminou gargalos de consultas em clusters de servidores WildFly.',
    tags: ['Java EE', 'RESTful APIs', 'PostgreSQL / HikariCP', 'WildFly'],
  },
  {
    company: 'Grupo Criar',
    current: false,
    roleEn: 'C++ / Java Software Engineer',
    rolePt: 'Engenheiro de Software C++ / Java',
    periodEn: 'May 2013 – April 2018 (5 years)',
    periodPt: 'Maio 2013 – Abril 2018 (5 anos)',
    descEn:
      'Engineered high-performance biometric facial recognition engines in C++ utilizing OpenCV for digital certification and strict physical access control. Built automated data collectors in Java / JAX-RS and developed enterprise native Android mobile clients.',
    descPt:
      'Desenvolveu motores biométricos de reconhecimento facial de alta performance em C++ utilizando OpenCV para certificação digital e controle rigoroso de acesso físico. Construiu coletores automatizados de dados em Java / JAX-RS e aplicativos corporativos nativos para Android.',
    tags: ['C++ Modern', 'OpenCV', 'Java / JAX-RS', 'Native Android SDK'],
  },
];

