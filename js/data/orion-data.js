/**
 * OrionPay Platform Architecture & Deep Dive Data
 * Francisco Araújo | Staff Backend Engineer
 */

const orionData = {
    switch: {
        title: "Switch Adquirente & Core Transacional",
        stack: "Java 21 • Spring Boot • PostgreSQL • ShedLock • RabbitMQ",
        badge: "Ciclo Online < 180ms",
        summary: "Motor de autorização transacional de alta vazão concebido com separação estrita de conceitos (Separation of Concerns). Desenhado para isolar o fluxo online do processamento analítico e batch pós-corte.",
        highlights: [
            { label: "Transactional Outbox Pattern", desc: "Captura atômica de eventos de pagamento em banco relacional e publicação resiliente no RabbitMQ via Debezium, eliminando dual-writes e perda de dados contábeis." },
            { label: "Controle de Concorrência Distribuída", desc: "Aplicação de ShedLock e níveis de isolamento rigorosos no PostgreSQL para prevenir race conditions e garantir transações 100% ACID em picos de tráfego." },
            { label: "Resiliência & Retry Estratégico", desc: "Circuit breakers, Dead Letter Queues (DLQ) e mecanismos de contingência de mensageria com operadoras e emissores." }
        ],
        flow: ["Terminal / POS", "Switch Online Core", "SoftHSM (PIN Trans)", "VisaNet Emulator", "Database Outbox"]
    },
    softhsm: {
        title: "SoftHSM em C++ (Hardware Security Simulator)",
        stack: "C++ • Sockets TCP • PKCS#11 • 3DES / AES",
        badge: "PCI-PIN Compliant",
        summary: "Simulador de Hardware Security Module (HSM) desenvolvido em C++ de baixo nível para emular comandos criptográficos padrão de mercado (Thales/Safenet) com comunicação socket de alta velocidade.",
        highlights: [
            { label: "Tradução de PIN Block em Tempo Real", desc: "Conversão direta e segura do bloco criptografado de senha vindo do terminal (TMK - Terminal Master Key) para a chave de intercâmbio com a bandeira (ZPK - Zone PIN Key)." },
            { label: "Gerenciamento de Chaves Simétricas", desc: "Manipulação de chaves mestras e de sessão usando algoritmos Triple DES e AES, protegidas sob uma chave mestre local (LMK)." },
            { label: "Cálculo de KCV (Key Check Value)", desc: "Validação matemática de integridade e conferência de paridade de chaves criptográficas sem expor o segredo." }
        ],
        flow: ["Inbound Socket", "Verify TMK", "Decrypt PIN Block", "Re-encrypt with ZPK", "Generate KCV"]
    },
    visanet: {
        title: "Emulador de Bandeira (VisaNet ISO 8583)",
        stack: "Java 21 • ISO 8583 (Base I) • TCP Sockets • Bitmaps Parser",
        badge: "Homologação & Estresse",
        summary: "Engine de mensageria binária para emulação da rede VisaNet (Base I). Realiza o parsing, empacotamento e desempacotamento de campos e bitmaps primários/secundários em alta velocidade.",
        highlights: [
            { label: "Engenharia Reversa de Protocolo", desc: "Validação rigorosa de bitmask, empacotamento numérico BCD e campos de comprimento variável (LLVAR / LLLVAR)." },
            { label: "Simulador de Cenários de Teste", desc: "Injeção automática de respostas autorizativas (ex: 00 aprovada, 51 saldo insuficiente, 05 não honrar, 43 cartão extraviado/fraude)." },
            { label: "Testes de Carga Outbound", desc: "Permite submeter o Switch Adquirente a testes de estresse de 10.000+ tps sem custos operacionais ou taxas de rede real." }
        ],
        flow: ["ISO 8583 Ingest", "Bitmap Parser", "Rule Engine", "Response Code (00/51)", "ISO Pack & Return"]
    },
    clearing: {
        title: "Motor de Clearing & Reconciliação Financeira",
        stack: "Spring Batch • Arquivo Posicional TC50 (Base II) • PostgreSQL",
        badge: "Consistência Contábil Pós-Corte",
        summary: "Pipeline assíncrono para processamento em lote dos dados transacionais pós-horário de corte (Cut-off). Traduz os logs transacionais do Switch no formato regulatório de liquidação.",
        highlights: [
            { label: "Geração de Arquivo TC50 (Visa Base II)", desc: "Processamento e exportação posicional em conformidade com as especificações da bandeira para efetivação do fechamento financeiro diário." },
            { label: "Pricing Engine (Apuração de Tarifas)", desc: "Aplicação automatizada das tabelas de intercâmbio (Interchange Fee) e apuração do valor líquido a ser repassado ao estabelecimento (Payout & Ledger)." },
            { label: "Reconciliação e Bate de Lote", desc: "Algoritmos para confrontação contábil de transações autorizadas contra os recebíveis processados, apontando divergências instantaneamente." }
        ],
        flow: ["Cut-off Trigger", "Read Raw Ledger", "Calculate Fees", "Generate TC50 Batch", "Settle Payout"]
    },
    softpos: {
        title: "Captura Mobile (SoftPOS Android NFC/EMV)",
        stack: "Android SDK • NFC • EMV Kernel L2 • Criptogramas Dinâmicos",
        badge: "Tap to Pay no Smartphone",
        summary: "Módulo mobile que transforma qualquer dispositivo Android dotado de NFC em um terminal seguro de pagamento por aproximação (Tap to Pay), executando rotinas padrão de kernel EMV.",
        highlights: [
            { label: "Fluxo de Leitura EMV de Cartões", desc: "Orquestração completa dos comandos APDU: seleção de aplicação (AID), processamento de opções (GPO) e leitura de registros do chip." },
            { label: "Criptogramas Dinâmicos (ARQC/TC)", desc: "Captura e envio do Application Cryptogram dinâmico gerado pelo chip do cartão para validação segura no autorizador adquirente." },
            { label: "Segurança sem Hardware Dedicado", desc: "Implementação alinhada aos padrões de segurança de captura sem contato para dispositivos móveis de uso comercial." }
        ],
        flow: ["Contactless Tap", "APDU Commands", "Select AID / GPO", "Generate ARQC", "Forward to Switch"]
    }
};
