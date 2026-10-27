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
