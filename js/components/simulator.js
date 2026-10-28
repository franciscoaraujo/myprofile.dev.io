/**
 * OrionPay Switch Lab — Deterministic Payment Architecture & Protocol Simulator
 * Client-side interactive state machine demonstrating:
 * - Scenario A: Approved ISO 8583 Authorization + Transactional Outbox + Async Consumer
 * - Scenario B: Duplicate Request Retry & Deterministic Idempotency Policy
 * - Scenario C: Messaging Broker Failure, Outbox Pending State, Backoff Retry & Consumer Deduplication
 * - Scenario D: End-of-Day Batch Settlement & Reconciliation (Base II / TC50)
 *
 * NOTE: 100% client-side educational simulation using synthetic payloads. No external network calls or real financial data.
 * Francisco Araújo | Senior Backend Engineer • Java & Payment Systems
 */

// Simulation State Machine
let simState = 'IDLE'; // 'IDLE' | 'RUNNING' | 'STEPPING' | 'COMPLETED'
let activeScenarioId = 'scenario-a';
let currentStepIndex = -1;
let activeTimers = [];
let activeRafId = null;
let timelineTimer = null;

// Session Counters (Explicitly scoped to local browser simulation session)
let liveTxCount = 0;
let liveVolume = 0.00;
let pendingDbCount = 0;
let queueRmqCount = 0;

// Simulated In-Memory Relational & Broker State for Live Inspection
let simulatedStorage = {
    idempotencyKeys: [],
    transactions: [],
    outboxEvents: [],
    consumerLedger: []
};

// Directional connection pipes configuration (Preserves desktop 3-phase mesh layout)
const ARCH_PIPES = [
    // Phase 1: Synchronous Authorization (Solid connectors)
    { id: 'pipe-pos-merchant', from: 'node-softpos', to: 'node-merchant', dir: 'right', color: '#38BDF8', mode: 'sync' },
    { id: 'pipe-merchant-switch', from: 'node-merchant', to: 'node-switch', dir: 'right', color: '#C084FC', mode: 'sync' },
    { id: 'pipe-switch-softhsm', from: 'node-switch', to: 'node-softhsm', dir: 'up', color: '#F87171', offset: -12, mode: 'sync' },
    { id: 'pipe-softhsm-switch', from: 'node-softhsm', to: 'node-switch', dir: 'down', color: '#60A5FA', offset: 12, mode: 'sync' },
    { id: 'pipe-switch-visa', from: 'node-switch', to: 'node-visagateway', dir: 'right', color: '#60A5FA', mode: 'sync' },
    { id: 'pipe-visa-visanet', from: 'node-visagateway', to: 'node-visanet', dir: 'right', color: '#3B82F6', mode: 'sync' },

    // Inter-Phase 1 -> 2: Direct vertical descent from Merchant Service to DB & Outbox (ACID Transaction & Idempotency Lock)
    { id: 'pipe-merchant-db', from: 'node-merchant', to: 'node-dboutbox', dir: 'down', color: '#A855F7', mode: 'sync' },

    // Phase 2: Asynchronous Messaging (Transactional Outbox & CDC - Dashed connectors)
    { id: 'pipe-db-relay', from: 'node-dboutbox', to: 'node-outboxrelay', dir: 'right', color: '#818CF8', mode: 'async' },
    { id: 'pipe-relay-rmq', from: 'node-outboxrelay', to: 'node-rabbitmq', dir: 'right', color: '#FB923C', mode: 'async' },
    { id: 'pipe-rmq-listener', from: 'node-rabbitmq', to: 'node-settlementlistener', dir: 'right', color: '#F59E0B', mode: 'async' },

    // Phase 2 Feedback Loop: Lower dashed return line pointing UP to DB & Outbox (Outbox status update)
    { id: 'pipe-feedback-db', from: 'node-outboxrelay', to: 'node-dboutbox', dir: 'feedback-up', color: '#64748B', mode: 'async' },

    // Phase 3: Batch Settlement & Reconciliation (Batch / Pull - Dashed connectors)
    { id: 'pipe-relay-tc57', from: 'node-outboxrelay', to: 'node-tc57log', dir: 'down', color: '#64748B', mode: 'batch' },
    { id: 'pipe-tc57-batch', from: 'node-tc57log', to: 'node-springbatch', dir: 'down', color: '#FBBF24', mode: 'batch' },
    { id: 'pipe-batch-payout', from: 'node-springbatch', to: 'node-payout', dir: 'right', color: '#00D47E', mode: 'batch' },

    // Settlement Listener down to Payout & Ledger
    { id: 'pipe-listener-payout', from: 'node-settlementlistener', to: 'node-payout', dir: 'listener-to-payout', color: '#00D47E', mode: 'async' }
];

// Technical Metadata per Architecture Node (For interactive click/keyboard inspection)
const ARCH_NODES_META = {
    'node-softpos': {
        name: 'SoftPOS (Merchant Capture App)',
        phase: 'Phase 1 • Synchronous Capture',
        what: 'Simulates an Android NFC terminal capturing EMV contactless card data and formatting an outbound payment authorization request with a unique client-generated Idempotency-Key.',
        why: 'Separates card capture protocol handling (APDU / EMV tags) from backend orchestration while tagging every logical payment attempt with a deterministic retry token.',
        risk: 'Mitigates unidentifiable client retries when mobile networks drop after request transmission.',
        component: 'SoftPOS Android Prototype (EMV L2 Concepts)',
        scope: 'Simulated locally via synthetic JSON/ISO 8583 request payloads. Not a PCI-MPOC certified terminal.',
        refLink: '#projects',
        refTab: 'softpos',
        refLabel: 'Inspect SoftPOS Case Study'
    },
    'node-merchant': {
        name: 'Merchant Service (Orchestrator API)',
        phase: 'Phase 1 • Synchronous Orchestration',
        what: 'Validates incoming synthetic payload structure, enforces idempotency key lookup/locking against PostgreSQL, coordinates synchronous switch calls, and commits the transaction + Outbox event.',
        why: 'Acts as the transactional boundary ensuring that duplicate retries are intercepted before invoking downstream cryptographic or card scheme services.',
        risk: 'Prevents double-charging cardholders on network retries and eliminates dual-write inconsistencies between PostgreSQL and RabbitMQ.',
        component: 'Acquiring Switch & Authorization Core (Java 21 / Spring Boot)',
        scope: 'Simulated in-browser state machine modeling atomic DB + Outbox commits and idempotency key checks.',
        refLink: '#projects',
        refTab: 'switch',
        refLabel: 'Inspect Switch & Outbox Case Study'
    },
    'node-switch': {
        name: 'Acquiring Switch (ISO 8583 Core)',
        phase: 'Phase 1 • Synchronous Routing',
        what: 'Packs and unpacks ISO 8583 messages (MTI 0100 request / MTI 0110 response), coordinates PIN block translation with the SoftHSM, and routes messages to the appropriate card scheme adapter.',
        why: 'Isolates low-level binary protocol bitmaps, field packing (BCD / LLVAR), and socket timeouts from high-level domain services.',
        risk: 'Reduces protocol parsing errors and isolates slow external scheme sockets via strict timeout budgets.',
        component: 'Acquiring Switch Router (Java 21 / TCP Sockets)',
        scope: 'Simulated step transition with illustrative ISO 8583 data elements (MTI 0100/0110, DE3, DE4, DE11, DE39, DE52).',
        refLink: '#projects',
        refTab: 'switch',
        refLabel: 'Inspect Acquiring Switch Architecture'
    },
    'node-softhsm': {
        name: 'SoftHSM (C++ Cryptographic Simulator)',
        phase: 'Phase 1 • Synchronous Crypto',
        what: 'Simulates PIN Block translation from Terminal Master Key (TMK) encryption to Zone PIN Key (ZPK) encryption in volatile memory, returning a translated block and Key Check Value (KCV).',
        why: 'In payment switches, PIN blocks encrypted by the terminal cannot be forwarded directly to card schemes without re-encryption under the interchange ZPK key shared with the scheme.',
        risk: 'Prevents plaintext PIN exposure in application logs or database storage during pre-production integration testing.',
        component: 'C++ SoftHSM Socket Daemon (3DES / AES-CBC / Key Hierarchy Sim)',
        scope: 'Educational software simulation concept. Does not use physical tamper-responsive HSM hardware or live PCI-PIN keys.',
        refLink: '#projects',
        refTab: 'softhsm',
        refLabel: 'Inspect C++ SoftHSM Case Study'
    },
    'node-visagateway': {
        name: 'Visa Gateway (Scheme Connector)',
        phase: 'Phase 1 • Synchronous Egress',
        what: 'Adapts internal switch structures into VisaNet Base I framing, managing persistent TCP socket framing and correlation IDs (STAN / DE11).',
        why: 'Decouples brand-specific framing rules (Visa Base I vs. Mastercard) from the core authorization engine.',
        risk: 'Prevents scheme-specific protocol changes from leaking into the core transaction domain.',
        component: 'Scheme Connector Adapter (ISO 8583 Base I Framing)',
        scope: 'Simulated connector step in browser walkthrough.',
        refLink: '#projects',
        refTab: 'visanet',
        refLabel: 'Inspect VisaNet Emulator Case Study'
    },
    'node-visanet': {
        name: 'VisaNet External (Scheme Emulator)',
        phase: 'Phase 1 • Synchronous Authorizer',
        what: 'Evaluates synthetic test card rules and returns an ISO 8583 MTI 0110 Authorization Response with DE39="00" (Approved) and a synthetic 6-digit authorization code (DE38).',
        why: 'Allows deterministic testing of approvals, declines, and latency edge cases without connecting to live card brand networks.',
        risk: 'Eliminates external dependency costs and sandbox instability during development and architectural demonstrations.',
        component: 'VisaNet Scheme Emulator (Java 21 Protocol Harness)',
        scope: 'Synthetic rule evaluation returning deterministic MTI 0110 response payloads.',
        refLink: '#projects',
        refTab: 'visanet',
        refLabel: 'Inspect VisaNet Emulator Details'
    },
    'node-dboutbox': {
        name: 'DB & Outbox (PostgreSQL ACID Core)',
        phase: 'Phase 1 & 2 • Transactional Persistence',
        what: 'Stores `idempotency_keys`, `transactions`, and `outbox_events` in the same relational database, committing business state and outbound event records in a single ACID transaction.',
        why: 'Writing to a database and publishing directly to a message broker (dual-write) is unsafe: if the broker is down or the process crashes between the two calls, state diverges.',
        risk: 'Eliminates lost events when RabbitMQ is unavailable (as demonstrated in Scenario C) and enforces unique constraints on Idempotency-Key (Scenario B).',
        component: 'PostgreSQL Relational Core (ACID + Transactional Outbox)',
        scope: 'Simulated via live in-memory tables (`idempotency_keys`, `transactions`, `outbox_events`) inspectable below.',
        refLink: '#projects',
        refTab: 'switch',
        refLabel: 'Inspect Outbox Pattern Design'
    },
    'node-outboxrelay': {
        name: 'Outbox Relay (CDC / Polling Worker)',
        phase: 'Phase 2 • Asynchronous Event Relay',
        what: 'Reads committed `PENDING` rows from `outbox_events`, publishes them to RabbitMQ, waits for Publisher Confirm (`ACK`), and updates the outbox row to `PUBLISHED` (or schedules backoff retry on failure).',
        why: 'Bridges the relational database and the message broker asynchronously without blocking the synchronous POS authorization response.',
        risk: 'Isolates the online authorization path from message broker outages or network partitions.',
        component: 'Outbox Relay Worker / Debezium CDC Pattern',
        scope: 'Simulated asynchronous relay demonstrating both normal publish (Scenario A) and broker failure + backoff recovery (Scenario C).',
        refLink: '#projects',
        refTab: 'switch',
        refLabel: 'Inspect Outbox & Relay Details'
    },
    'node-rabbitmq': {
        name: 'RabbitMQ (Quorum Queue & DLQ)',
        phase: 'Phase 2 • Asynchronous Broker',
        what: 'Routes published domain events (`payments.auth.completed.v1`) to downstream settlement consumers, supporting publisher confirms, retry queues, and Dead-Letter Queues (DLQ).',
        why: 'Decouples high-spike online authorization traffic from downstream ledger pre-allocation and accounting consumers.',
        risk: 'Prevents downstream consumer slowdowns from degrading synchronous payment authorization latency.',
        component: 'RabbitMQ Broker Topology (Exchanges, Quorum Queues & DLQ)',
        scope: 'Simulated broker queue counter and failure injection in Scenario C.',
        refLink: '#projects',
        refTab: 'switch',
        refLabel: 'Inspect Messaging & DLQ Architecture'
    },
    'node-settlementlistener': {
        name: 'Settlement Listener (Idempotent Consumer)',
        phase: 'Phase 2 • Asynchronous Consumer',
        what: 'Consumes authorization events from RabbitMQ, verifies `event_id` against a `processed_events` table to deduplicate redeliveries, and pre-allocates merchant receivable balances.',
        why: 'Because Transactional Outbox guarantees At-Least-Once delivery (not Exactly-Once), a relay retry can publish the same event more than once. The consumer must be idempotent.',
        risk: 'Prevents duplicate ledger credits when a message is redelivered after a network blip or consumer restart.',
        component: 'Settlement Event Consumer (Spring AMQP / Idempotent Dedup)',
        scope: 'Simulated consumer deduplication check and ledger state update.',
        refLink: '#projects',
        refTab: 'clearing',
        refLabel: 'Inspect Clearing & Settlement Case Study'
    },
    'node-tc57log': {
        name: 'Network Clearing Log (Base II / TC57)',
        phase: 'Phase 3 • Batch Ingestion',
        what: 'Represents the positional clearing log staging area where authorized transactions are grouped after the end-of-day cut-off window for interchange settlement.',
        why: 'Card payments separate real-time authorization (Base I: reserving cardholder funds) from batch clearing and settlement (Base II: actual financial clearing and fee calculation).',
        risk: 'Ensures immutable auditability between online authorizations and end-of-day clearing files.',
        component: 'Clearing Log Staging (Positional File / Relational Reader)',
        scope: 'Simulated batch input stage in Scenario D.',
        refLink: '#projects',
        refTab: 'clearing',
        refLabel: 'Inspect Clearing & Reconciliation Case Study'
    },
    'node-springbatch': {
        name: 'Spring Batch (Reconciliation Job)',
        phase: 'Phase 3 • Chunk-Oriented Batch',
        what: 'Processes staged transactions in deterministic chunks, calculates interchange and MDR fees, and coordinates execution across nodes via distributed locking (ShedLock).',
        why: 'Processing large end-of-day settlement volumes in a single transaction would exhaust memory; chunk-oriented processing allows safe checkpoint restarts.',
        risk: 'Prevents out-of-memory failures and duplicate batch execution across clustered instances.',
        component: 'Spring Batch Engine + ShedLock Coordination',
        scope: 'Simulated chunk processing walkthrough in Scenario D.',
        refLink: '#projects',
        refTab: 'clearing',
        refLabel: 'Inspect Spring Batch Architecture'
    },
    'node-payout': {
        name: 'Payout & Double-Entry Ledger',
        phase: 'Phase 3 • Financial Settlement',
        what: 'Books balanced debit/credit accounting entries and generates the final merchant payout instruction and positional Visa Base II (TC50) clearing output.',
        why: 'Maintains a verifiable double-entry accounting trail where gross transaction value equals net merchant payout plus MDR and interchange fees.',
        risk: 'Mitigates reconciliation drift between authorized totals and settled merchant payouts.',
        component: 'Financial Ledger & TC50 Generator',
        scope: 'Simulated ledger booking in Scenario D.',
        refLink: '#projects',
        refTab: 'clearing',
        refLabel: 'Inspect Ledger & Payout Details'
    }
};

// Deterministic Scenarios Definition (Phase 3 & Phase 4 Requirements)
const SIM_SCENARIOS = {
    'scenario-a': {
        id: 'scenario-a',
        badge: 'SCENARIO A',
        title: 'Approved Authorization & Outbox Flow',
        subtitle: 'Synchronous ISO 8583 authorization (0100 -> 0110), atomic PostgreSQL + Outbox persistence, and asynchronous RabbitMQ consumer processing.',
        summaryBanner: 'Demonstrates the standard happy path: synchronous authorization completes in Phase 1 and commits atomically with an Outbox event, which is then relayed asynchronously in Phase 2.',
        steps: [
            {
                id: 'a-step-1',
                title: '1. Synthetic Request & Input Validation',
                pipe: 'pipe-pos-merchant',
                activeNode: 'node-merchant',
                nodeState: 'ok',
                badgeText: 'VALIDATED',
                mode: 'SYNCHRONOUS (HTTP/TLS)',
                component: 'SoftPOS -> Merchant Service',
                what: 'SoftPOS sends a synthetic contactless authorization request (`Amount: BRL 84.50`, `PAN: 4000••••••••1091 [TEST]`, `Idempotency-Key: idem-a104-9c82`). Merchant Service validates schema, merchant status, and mandatory fields.',
                why: 'Rejects malformed payloads at the API edge before allocating switch sockets or database transactions.',
                risk: 'Prevents invalid data elements from causing downstream protocol packing failures.',
                scope: 'Simulated synthetic request validation in browser memory.',
                refTab: 'softpos',
                log: '&gt; [STEP 1/7] SoftPOS -&gt; Merchant Service: Validated synthetic request (BRL 84.50 | PAN 4000****1091 | Idempotency-Key: idem-a104-9c82).',
                onExecute: () => {
                    setNodeStatusBadge('node-softpos', 'SENT', 'bg-cyan-600');
                    setNodeStatusBadge('node-merchant', 'VALIDATED', 'bg-emerald-600');
                }
            },
            {
                id: 'a-step-2',
                title: '2. Idempotency Key Verification (DB Miss)',
                pipe: 'pipe-merchant-db',
                activeNode: 'node-dboutbox',
                nodeState: 'ok',
                badgeText: 'KEY LOCKED',
                mode: 'SYNCHRONOUS (ACID LOCK)',
                component: 'Merchant Service -> PostgreSQL (idempotency_keys)',
                what: 'Merchant Service queries `idempotency_keys` for `idem-a104-9c82`. No prior record exists (`MISS`). Inserts a lock record with `status = IN_PROGRESS` and payload fingerprint `sha256:7f83b1`.',
                why: 'Acquiring an idempotency record before calling the external authorizer ensures concurrent or subsequent retries with the same key can be detected deterministically.',
                risk: 'Prevents race conditions if a client sends duplicate requests while the first request is still in flight.',
                scope: 'Simulated insert into in-memory `idempotency_keys` table.',
                refTab: 'switch',
                log: '&gt; [STEP 2/7] Idempotency Check: Key "idem-a104-9c82" is new (MISS). Registered state=IN_PROGRESS (payload_hash=sha256:7f83b1).',
                onExecute: () => {
                    simulatedStorage.idempotencyKeys = [{
                        key: 'idem-a104-9c82',
                        payloadHash: 'sha256:7f83b1',
                        status: 'IN_PROGRESS',
                        responseCode: '—',
                        replayed: 'No (1st Attempt)'
                    }];
                    setNodeStatusBadge('node-dboutbox', 'LOCK OK', 'bg-indigo-600');
                }
            },
            {
                id: 'a-step-3',
                title: '3. ISO 8583 Routing & SoftHSM PIN Translation',
                pipe: 'pipe-merchant-switch',
                secondaryPipes: ['pipe-switch-softhsm', 'pipe-softhsm-switch'],
                activeNode: 'node-softhsm',
                nodeState: 'ok',
                badgeText: 'ZPK OK',
                mode: 'SYNCHRONOUS (TCP SOCKET)',
                component: 'Acquiring Switch <-> C++ SoftHSM Simulator',
                what: 'Switch formats `MTI 0100` and invokes the C++ SoftHSM daemon over local TCP socket to translate the encrypted PIN block (`DE52`) from Terminal Master Key (`TMK`) to Zone PIN Key (`ZPK`) in volatile memory.',
                why: 'Card schemes cannot decrypt terminal-scoped keys (`TMK`); the acquirer switch must translate the PIN block to the scheme-shared interchange key (`ZPK`) without exposing the plaintext PIN.',
                risk: 'Mitigates plaintext PIN exposure in memory dumps, application logs, or database columns.',
                scope: 'Conceptual step simulation; no real cryptographic keys or PCI-PIN hardware are used.',
                refTab: 'softhsm',
                log: '&gt; [STEP 3/7] Switch &lt;-&gt; C++ SoftHSM: Packed MTI 0100. Translated DE52 PIN Block (TMK -&gt; ZPK in volatile memory, KCV verified).',
                onExecute: () => {
                    setNodeStatusBadge('node-switch', 'MTI 0100', 'bg-blue-600');
                    setNodeStatusBadge('node-softhsm', 'TMK->ZPK', 'bg-emerald-600');
                }
            },
            {
                id: 'a-step-4',
                title: '4. Authorizer Response (VisaNet MTI 0110)',
                pipe: 'pipe-switch-visa',
                secondaryPipes: ['pipe-visa-visanet'],
                activeNode: 'node-visanet',
                nodeState: 'ok',
                badgeText: '00 APPROVED',
                mode: 'SYNCHRONOUS (ISO 8583 BASE I)',
                component: 'Visa Gateway -> VisaNet Scheme Emulator',
                what: 'Forwards binary ISO 8583 `MTI 0100` (`DE3=000000`, `DE4=000000008450`, `DE11=482910`) to the VisaNet Emulator, which evaluates test rules and returns `MTI 0110` with `DE39="00"` (Approved) and `DE38="AUTH88"`.',
                why: 'Validates cardholder funds and issuer authorization rules synchronously while the cardholder is at the terminal.',
                risk: 'Detects issuer declines or socket timeouts before committing an approved sale.',
                scope: 'Simulated deterministic response from the local VisaNet emulator model.',
                refTab: 'visanet',
                log: '&gt; [STEP 4/7] VisaNet Emulator: Returned ISO 8583 MTI 0110 | DE39=00 (APPROVED) | AuthCode=AUTH88 | STAN=482910.',
                onExecute: () => {
                    setNodeStatusBadge('node-visagateway', 'BASE I', 'bg-blue-600');
                    setNodeStatusBadge('node-visanet', '00 OK', 'bg-emerald-600');
                }
            },
            {
                id: 'a-step-5',
                title: '5. Atomic ACID Persistence (Transaction + Outbox)',
                pipe: 'pipe-merchant-db',
                activeNode: 'node-dboutbox',
                nodeState: 'ok',
                badgeText: 'ACID COMMIT',
                mode: 'SYNCHRONOUS (SINGLE DB TX)',
                component: 'Merchant Service -> PostgreSQL (transactions + outbox_events)',
                what: 'Within a single PostgreSQL transaction (`BEGIN ... COMMIT`), inserts `TX-9041A` (`APPROVED`), inserts Outbox event `EVT-501` (`status = PENDING`), and updates `idem-a104-9c82` to `COMPLETED` with the cached `0110` response. Returns approval to SoftPOS.',
                why: 'Commiting the payment record and the outbound integration event in the same database transaction guarantees that an approved payment always has a corresponding event queued for downstream services.',
                risk: 'Eliminates the dual-write vulnerability where a DB commit succeeds but a direct broker publish fails.',
                scope: 'Updates simulated `transactions`, `outbox_events`, and `idempotency_keys` tables atomically.',
                refTab: 'switch',
                log: '&gt; [STEP 5/7] PostgreSQL ACID Commit: Saved TX-9041A (APPROVED) + Outbox EVT-501 (PENDING) + Idempotency COMPLETED. Synchronous POS flow done!',
                onExecute: () => {
                    pendingDbCount = 1;
                    simulatedStorage.idempotencyKeys[0].status = 'COMPLETED';
                    simulatedStorage.idempotencyKeys[0].responseCode = '00 (Auth: AUTH88)';
                    simulatedStorage.transactions = [{
                        txId: 'TX-9041A',
                        idemKey: 'idem-a104-9c82',
                        amount: 'BRL 84.50',
                        mti: '0110 (DE39=00)',
                        status: 'APPROVED'
                    }];
                    simulatedStorage.outboxEvents = [{
                        eventId: 'EVT-501',
                        aggregateId: 'TX-9041A',
                        topic: 'payments.auth.completed.v1',
                        attempts: 0,
                        status: 'PENDING'
                    }];
                    updateStatsUI();
                    setNodeBadge('node-dboutbox', pendingDbCount, 'bg-amber-500');
                    setNodeStatusBadge('node-dboutbox', 'COMMITTED', 'bg-emerald-600');
                }
            },
            {
                id: 'a-step-6',
                title: '6. Outbox Relay & Broker Publish (CDC / Worker)',
                pipe: 'pipe-db-relay',
                secondaryPipes: ['pipe-relay-rmq', 'pipe-feedback-db'],
                activeNode: 'node-rabbitmq',
                nodeState: 'ok',
                badgeText: 'PUBLISHED',
                mode: 'ASYNCHRONOUS (OUTBOX -> AMQP)',
                component: 'Outbox Relay -> RabbitMQ -> DB Feedback',
                what: 'Outbox Relay reads `EVT-501 (PENDING)`, publishes the event payload to RabbitMQ exchange `payments.events`, receives broker Publisher Confirm (`ACK`), and marks `EVT-501` as `PUBLISHED` in PostgreSQL.',
                why: 'Decouples message broker availability and latency from the customer-facing authorization response time.',
                risk: 'Ensures events are only marked `PUBLISHED` after the broker confirms durable persistence.',
                scope: 'Simulated asynchronous relay transition and Outbox state update.',
                refTab: 'switch',
                log: '&gt; [STEP 6/7] Outbox Relay -&gt; RabbitMQ: Published EVT-501 to "payments.auth.completed.v1". Broker ACK received -&gt; Outbox marked PUBLISHED.',
                onExecute: () => {
                    pendingDbCount = 0;
                    queueRmqCount = 1;
                    simulatedStorage.outboxEvents[0].attempts = 1;
                    simulatedStorage.outboxEvents[0].status = 'PUBLISHED (ACK)';
                    updateStatsUI();
                    setNodeBadge('node-dboutbox', 0, 'bg-amber-500');
                    setNodeBadge('node-rabbitmq', queueRmqCount, 'bg-amber-500');
                    setNodeStatusBadge('node-outboxrelay', 'RELAYED', 'bg-emerald-600');
                    setNodeStatusBadge('node-rabbitmq', 'ENQUEUED', 'bg-amber-600');
                }
            },
            {
                id: 'a-step-7',
                title: '7. Consumer Deduplication & Balance Pre-Allocation',
                pipe: 'pipe-rmq-listener',
                activeNode: 'node-settlementlistener',
                nodeState: 'ok',
                badgeText: 'CONSUMED',
                mode: 'ASYNCHRONOUS (IDEMPOTENT CONSUMER)',
                component: 'RabbitMQ -> Settlement Listener',
                what: 'Settlement Listener consumes `EVT-501`, verifies `event_id` is not in `processed_events`, records `EVT-501` as processed, pre-allocates merchant receivable balance (`BRL 84.50`), and acknowledges the message.',
                why: 'Even with an Outbox, network retries can cause At-Least-Once duplicate message delivery; tracking `event_id` makes the consumer idempotent.',
                risk: 'Prevents double-crediting merchant receivable balances on duplicate message delivery.',
                scope: 'Completes Scenario A and updates simulated session counters.',
                refTab: 'clearing',
                log: '&gt; [STEP 7/7] Settlement Listener: Verified EVT-501 not previously processed. Pre-allocated BRL 84.50 receivable. Scenario A COMPLETE.',
                onExecute: () => {
                    queueRmqCount = 0;
                    liveTxCount = 1;
                    liveVolume = 84.50;
                    simulatedStorage.consumerLedger = [{
                        eventId: 'EVT-501',
                        txId: 'TX-9041A',
                        dedupCheck: 'NEW EVENT (Processed)',
                        ledgerAction: 'Pre-Allocated BRL 84.50',
                        status: 'ACKED'
                    }];
                    updateStatsUI();
                    setNodeBadge('node-rabbitmq', 0, 'bg-amber-500');
                    setNodeStatusBadge('node-rabbitmq', 'DRAINED', 'bg-emerald-600');
                    setNodeStatusBadge('node-settlementlistener', 'ACKED', 'bg-emerald-600');
                }
            }
        ]
    },

    'scenario-b': {
        id: 'scenario-b',
        badge: 'SCENARIO B',
        title: 'Duplicate Request & Idempotency Policy',
        subtitle: 'Demonstrates how a duplicate POS retry carrying the same Idempotency-Key is deduplicated at the database/service layer without re-running authorization or creating duplicate charges.',
        summaryBanner: 'Contrasts backend transactional idempotency (unique key + payload hash + stored response replay) against a simple frontend visual check.',
        steps: [
            {
                id: 'b-step-1',
                title: '1. Attempt #1: Initial Request (Idempotency-Key: idem-dup-7741)',
                pipe: 'pipe-pos-merchant',
                secondaryPipes: ['pipe-merchant-db'],
                activeNode: 'node-dboutbox',
                nodeState: 'ok',
                badgeText: '1ST LOCK',
                mode: 'SYNCHRONOUS (ATTEMPT #1)',
                component: 'SoftPOS -> Merchant Service -> PostgreSQL',
                what: 'SoftPOS submits `MTI 0100` (`Amount: BRL 120.00`, `Idempotency-Key: idem-dup-7741`, `payload_hash: sha256:9b22e4`). `idempotency_keys` table has no match (`MISS`), so the key is inserted with `status = IN_PROGRESS`.',
                why: 'Establishes a database-level lock via unique constraint `UNIQUE(idempotency_key)` before executing any side effects.',
                risk: 'Prevents concurrent duplicate requests from bypassing validation in multi-instance deployments.',
                scope: 'Simulated database unique key lock acquisition.',
                refTab: 'switch',
                log: '&gt; [STEP 1/6] Attempt #1: Received Idempotency-Key "idem-dup-7741" (BRL 120.00). DB lookup=MISS -&gt; Locked as IN_PROGRESS.',
                onExecute: () => {
                    simulatedStorage.idempotencyKeys = [{
                        key: 'idem-dup-7741',
                        payloadHash: 'sha256:9b22e4',
                        status: 'IN_PROGRESS',
                        responseCode: '—',
                        replayed: 'No (1st Attempt)'
                    }];
                    setNodeStatusBadge('node-softpos', 'TRY #1', 'bg-cyan-600');
                    setNodeStatusBadge('node-merchant', 'KEY MISS', 'bg-blue-600');
                    setNodeStatusBadge('node-dboutbox', 'LOCKED', 'bg-indigo-600');
                }
            },
            {
                id: 'b-step-2',
                title: '2. Attempt #1: Authorization & Atomic Commit (Response Cached)',
                pipe: 'pipe-merchant-switch',
                secondaryPipes: ['pipe-switch-softhsm', 'pipe-softhsm-switch', 'pipe-switch-visa', 'pipe-visa-visanet', 'pipe-merchant-db'],
                activeNode: 'node-visanet',
                nodeState: 'ok',
                badgeText: '00 SAVED',
                mode: 'SYNCHRONOUS (COMMIT + SNAPSHOT)',
                component: 'Switch -> SoftHSM -> VisaNet -> PostgreSQL',
                what: 'Attempt #1 completes SoftHSM translation and receives `MTI 0110 (DE39=00, Auth=619042)` from VisaNet. PostgreSQL atomically commits `TX-7741A`, `EVT-774 (PENDING)`, and updates `idem-dup-7741` to `COMPLETED` with the serialized response snapshot.',
                why: 'Storing the canonical authorization response inside the `idempotency_keys` record allows the exact same response to be returned if the client never receives the first reply.',
                risk: 'Guarantees that if the response packet drops on the mobile network, the system knows the transaction already succeeded.',
                scope: 'Commits 1st transaction and stores response snapshot in `idempotency_keys`.',
                refTab: 'switch',
                log: '&gt; [STEP 2/6] Attempt #1 Approved &amp; Committed: TX-7741A + Outbox EVT-774 + Cached Response (Auth=619042) saved under key "idem-dup-7741".',
                onExecute: () => {
                    pendingDbCount = 1;
                    liveTxCount = 1;
                    liveVolume = 120.00;
                    simulatedStorage.idempotencyKeys[0].status = 'COMPLETED (Cached)';
                    simulatedStorage.idempotencyKeys[0].responseCode = '00 (Auth: 619042)';
                    simulatedStorage.transactions = [{
                        txId: 'TX-7741A',
                        idemKey: 'idem-dup-7741',
                        amount: 'BRL 120.00',
                        mti: '0110 (Auth: 619042)',
                        status: 'APPROVED'
                    }];
                    simulatedStorage.outboxEvents = [{
                        eventId: 'EVT-774',
                        aggregateId: 'TX-7741A',
                        topic: 'payments.auth.completed.v1',
                        attempts: 0,
                        status: 'PENDING'
                    }];
                    updateStatsUI();
                    setNodeBadge('node-dboutbox', pendingDbCount, 'bg-amber-500');
                    setNodeStatusBadge('node-visanet', 'AUTH 619042', 'bg-emerald-600');
                    setNodeStatusBadge('node-dboutbox', 'SNAPSHOT OK', 'bg-emerald-600');
                }
            },
            {
                id: 'b-step-3',
                title: '3. Client Timeout & Attempt #2 (Duplicate Retry with Same Key)',
                pipe: 'pipe-pos-merchant',
                activeNode: 'node-merchant',
                nodeState: 'warn',
                tokenClass: 'token-warn',
                pipeClass: 'warn-pipe',
                badgeText: 'DUP RETRY',
                mode: 'SYNCHRONOUS (CLIENT RETRY)',
                component: 'SoftPOS -> Merchant Service (Retry #2)',
                what: 'Simulates a client read timeout on Attempt #1: SoftPOS did not receive the response over mobile network and automatically retries the exact same request with `Idempotency-Key: idem-dup-7741` and `Amount: BRL 120.00`.',
                why: 'In distributed systems, network timeouts are ambiguous: the client cannot tell whether the request failed before reaching the server or after the server committed it. Retrying with the same key is the only safe recovery.',
                risk: 'Without backend idempotency, this automatic terminal retry would trigger a second authorization and double-charge the cardholder.',
                scope: 'Demonstrates why UI button disabling is insufficient—network-level retries happen automatically.',
                refTab: 'switch',
                log: '&gt; [STEP 3/6] WARN: Client read timeout on Attempt #1! SoftPOS sends Retry Attempt #2 with SAME Idempotency-Key "idem-dup-7741".',
                onExecute: () => {
                    setNodeStatusBadge('node-softpos', 'RETRY #2', 'bg-amber-600');
                    setNodeStatusBadge('node-merchant', 'DUP DETECT', 'bg-amber-600');
                }
            },
            {
                id: 'b-step-4',
                title: '4. Policy Lookup: Idempotency Cache Hit & Payload Hash Match',
                pipe: 'pipe-merchant-db',
                activeNode: 'node-dboutbox',
                nodeState: 'warn',
                tokenClass: 'token-warn',
                pipeClass: 'warn-pipe',
                badgeText: 'CACHE HIT',
                mode: 'SYNCHRONOUS (DEDUPLICATION)',
                component: 'Merchant Service -> PostgreSQL (idempotency_keys)',
                what: 'Merchant Service looks up `idem-dup-7741` in `idempotency_keys`, finds `status = COMPLETED`, and verifies `payload_hash == sha256:9b22e4`. Policy decision: **Reuse Original Response & Short-Circuit Downstream Calls**.',
                why: 'Unlike a visual UI check, backend idempotency validates both the key and the request fingerprint in PostgreSQL. (If the retry used the same key with a different amount, the policy would reject it with `422/409 Conflict`).',
                risk: 'Prevents duplicate calls to SoftHSM/VisaNet and prevents inserting a duplicate row in `transactions` or `outbox_events`.',
                scope: 'Note: Protects retries sharing the same key; does not automatically block two distinct physical card taps if the client generates a new key.',
                refTab: 'switch',
                log: '&gt; [STEP 4/6] IDEMPOTENCY HIT: Key "idem-dup-7741" already COMPLETED with matching payload_hash. Short-circuiting Switch/VisaNet!',
                onExecute: () => {
                    simulatedStorage.idempotencyKeys[0].replayed = 'Yes (Replayed on Retry #2)';
                    setNodeStatusBadge('node-dboutbox', 'IDEM HIT', 'bg-amber-600');
                    setNodeStatusBadge('node-switch', 'BYPASSED', 'bg-slate-600');
                    setNodeStatusBadge('node-visanet', 'BYPASSED', 'bg-slate-600');
                }
            },
            {
                id: 'b-step-5',
                title: '5. Deterministic Replay of Original Response to POS',
                pipe: 'pipe-pos-merchant',
                activeNode: 'node-softpos',
                nodeState: 'ok',
                tokenClass: 'token-warn',
                pipeClass: 'warn-pipe',
                badgeText: 'REPLAYED OK',
                mode: 'SYNCHRONOUS (IDEMPOTENT REPLAY)',
                component: 'Merchant Service -> SoftPOS',
                what: 'Merchant Service immediately returns the stored `MTI 0110 (DE39=00, Auth=619042, TX-7741A)` snapshot to SoftPOS with metadata flag `Idempotent-Replayed: true`. Total approved transactions remain `1` (`BRL 120.00`).',
                why: 'Allows the terminal to reconcile its local state and print the customer receipt using the original authorization code without creating a second financial charge.',
                risk: 'Eliminates orphaned authorizations and customer billing disputes caused by blind retries.',
                scope: 'Session counter remains 1 transaction (BRL 120.00) despite 2 inbound requests.',
                refTab: 'switch',
                log: '&gt; [STEP 5/6] Replayed cached response (TX-7741A | Auth=619042 | Idempotent-Replayed=true) to SoftPOS. Zero duplicate charges created.',
                onExecute: () => {
                    setNodeStatusBadge('node-softpos', 'REPLAYED 00', 'bg-emerald-600');
                    setNodeStatusBadge('node-merchant', 'REPLAY SENT', 'bg-emerald-600');
                }
            },
            {
                id: 'b-step-6',
                title: '6. Single Outbox Event Relayed & Consumed',
                pipe: 'pipe-db-relay',
                secondaryPipes: ['pipe-relay-rmq', 'pipe-rmq-listener'],
                activeNode: 'node-settlementlistener',
                nodeState: 'ok',
                badgeText: '1 EVENT ONLY',
                mode: 'ASYNCHRONOUS (OUTBOX -> CONSUMER)',
                component: 'Outbox Relay -> RabbitMQ -> Settlement Listener',
                what: 'Outbox Relay publishes the single `EVT-774` record from Attempt #1 to RabbitMQ, and `Settlement Listener` processes it once. Attempt #2 generated zero duplicate events.',
                why: 'Confirms end-to-end consistency across synchronous API, relational store, and asynchronous settlement stream.',
                risk: 'Prevents downstream settlement inflation from upstream API retries.',
                scope: 'Scenario B complete: 2 requests received, 1 transaction persisted, 1 event consumed.',
                refTab: 'clearing',
                log: '&gt; [STEP 6/6] Outbox Relay -&gt; Settlement Listener: Processed single event EVT-774 (BRL 120.00). Scenario B COMPLETE.',
                onExecute: () => {
                    pendingDbCount = 0;
                    queueRmqCount = 0;
                    simulatedStorage.outboxEvents[0].attempts = 1;
                    simulatedStorage.outboxEvents[0].status = 'PUBLISHED (ACK)';
                    simulatedStorage.consumerLedger = [{
                        eventId: 'EVT-774',
                        txId: 'TX-7741A',
                        dedupCheck: 'SINGLE EVENT (1st Attempt Only)',
                        ledgerAction: 'Pre-Allocated BRL 120.00 (Once)',
                        status: 'ACKED'
                    }];
                    updateStatsUI();
                    setNodeBadge('node-dboutbox', 0, 'bg-amber-500');
                    setNodeStatusBadge('node-outboxrelay', '1 PUBLISHED', 'bg-emerald-600');
                    setNodeStatusBadge('node-settlementlistener', 'ACKED ONCE', 'bg-emerald-600');
                }
            }
        ]
    },

    'scenario-c': {
        id: 'scenario-c',
        badge: 'SCENARIO C',
        title: 'Broker Failure, Outbox Pending & Recovery',
        subtitle: 'Simulates a RabbitMQ outage after authorization commit, demonstrating how Transactional Outbox preserves pending events for backoff retry and why consumers must still deduplicate (At-Least-Once delivery).',
        summaryBanner: 'Demonstrates fault isolation: synchronous card authorization succeeds even when RabbitMQ is down; the event waits in PostgreSQL Outbox and recovers via retry.',
        steps: [
            {
                id: 'c-step-1',
                title: '1. Synchronous Authorization Succeeds (MTI 0100 -> 0110)',
                pipe: 'pipe-pos-merchant',
                secondaryPipes: ['pipe-merchant-switch', 'pipe-switch-softhsm', 'pipe-softhsm-switch', 'pipe-switch-visa', 'pipe-visa-visanet'],
                activeNode: 'node-visanet',
                nodeState: 'ok',
                badgeText: '00 APPROVED',
                mode: 'SYNCHRONOUS (ONLINE PATH)',
                component: 'SoftPOS -> Switch -> SoftHSM -> VisaNet',
                what: 'Processes synthetic request (`Amount: BRL 65.00`, `Idempotency-Key: idem-f903-11c8`). SoftHSM translates PIN block and VisaNet Emulator returns `MTI 0110 (DE39=00 Approved, Auth=304918)`.',
                why: 'Online card authorization only depends on the synchronous path and local PostgreSQL availability, never on direct synchronous broker publishing.',
                risk: 'Prevents message broker maintenance or outages from taking down point-of-sale card acceptance.',
                scope: 'Simulated Phase 1 approval while RabbitMQ broker fault is armed.',
                refTab: 'switch',
                log: '&gt; [STEP 1/6] Phase 1 Online Auth: MTI 0110 Approved (BRL 65.00 | Auth=304918 | Key=idem-f903-11c8).',
                onExecute: () => {
                    simulatedStorage.idempotencyKeys = [{
                        key: 'idem-f903-11c8',
                        payloadHash: 'sha256:4c19a0',
                        status: 'IN_PROGRESS',
                        responseCode: '00 (Auth: 304918)',
                        replayed: 'No'
                    }];
                    setNodeStatusBadge('node-softpos', 'SENT', 'bg-cyan-600');
                    setNodeStatusBadge('node-visanet', '00 OK', 'bg-emerald-600');
                    setNodeStatusBadge('node-rabbitmq', 'BROKER DOWN', 'bg-red-600');
                }
            },
            {
                id: 'c-step-2',
                title: '2. Atomic DB Commit (Transaction Approved + Outbox PENDING)',
                pipe: 'pipe-merchant-db',
                activeNode: 'node-dboutbox',
                nodeState: 'ok',
                badgeText: 'SAVED IN DB',
                mode: 'SYNCHRONOUS (LOCAL ACID COMMIT)',
                component: 'Merchant Service -> PostgreSQL (DB & Outbox)',
                what: 'Commits `TX-9903C (APPROVED)` and `outbox_events` record `EVT-903 (status = PENDING, attempts = 0)` in PostgreSQL. SoftPOS immediately receives the `00 Approved` response.',
                why: 'By writing the event to the local `outbox_events` table instead of calling RabbitMQ directly inside the HTTP request thread, the sale succeeds cleanly.',
                risk: 'Eliminates lost settlement events when the message broker is down at the moment of sale.',
                scope: 'Persists `TX-9903C` and `EVT-903 (PENDING)` in simulated database state.',
                refTab: 'switch',
                log: '&gt; [STEP 2/6] PostgreSQL Commit: TX-9903C (APPROVED) + Outbox EVT-903 (status=PENDING) committed safely. POS receives approval.',
                onExecute: () => {
                    pendingDbCount = 1;
                    simulatedStorage.idempotencyKeys[0].status = 'COMPLETED';
                    simulatedStorage.transactions = [{
                        txId: 'TX-9903C',
                        idemKey: 'idem-f903-11c8',
                        amount: 'BRL 65.00',
                        mti: '0110 (Auth: 304918)',
                        status: 'APPROVED'
                    }];
                    simulatedStorage.outboxEvents = [{
                        eventId: 'EVT-903',
                        aggregateId: 'TX-9903C',
                        topic: 'payments.auth.completed.v1',
                        attempts: 0,
                        status: 'PENDING'
                    }];
                    updateStatsUI();
                    setNodeBadge('node-dboutbox', pendingDbCount, 'bg-amber-500');
                    setNodeStatusBadge('node-dboutbox', 'OUTBOX=1', 'bg-amber-600');
                }
            },
            {
                id: 'c-step-3',
                title: '3. Simulated Broker Failure on Publish Attempt #1',
                pipe: 'pipe-db-relay',
                secondaryPipes: ['pipe-relay-rmq'],
                activeNode: 'node-rabbitmq',
                nodeState: 'error',
                tokenClass: 'token-error',
                pipeClass: 'error-pipe',
                badgeText: 'CONN FAILED',
                mode: 'ASYNCHRONOUS (PUBLISH FAILURE)',
                component: 'Outbox Relay -x-> RabbitMQ (Connection Refused)',
                what: 'Outbox Relay reads `EVT-903` and attempts to publish to RabbitMQ, encountering a simulated `AMQPConnectionException / Broker Unreachable` error. No Publisher Confirm (`ACK`) is received.',
                why: 'Demonstrates that network partitions or broker restarts can happen asynchronously after a transaction is already committed.',
                risk: 'Without an Outbox table, an in-memory fire-and-forget publish would permanently lose `EVT-903` here.',
                scope: 'Simulated broker connection failure on `pipe-relay-rmq`.',
                refTab: 'switch',
                log: '&gt; [STEP 3/6] ERROR: Outbox Relay publish Attempt #1 for EVT-903 FAILED (RabbitMQ Broker Unreachable / Timeout). No ACK received!',
                onExecute: () => {
                    simulatedStorage.outboxEvents[0].attempts = 1;
                    simulatedStorage.outboxEvents[0].status = 'FAILED_ATTEMPT_1 (No ACK)';
                    setNodeStatusBadge('node-outboxrelay', 'PUB ERR #1', 'bg-red-600');
                    setNodeStatusBadge('node-rabbitmq', 'UNREACHABLE', 'bg-red-600');
                }
            },
            {
                id: 'c-step-4',
                title: '4. Outbox State Preserved (PENDING_RETRY & Backoff Scheduled)',
                pipe: 'pipe-feedback-db',
                activeNode: 'node-dboutbox',
                nodeState: 'warn',
                tokenClass: 'token-warn',
                pipeClass: 'warn-pipe',
                badgeText: 'PENDING RETRY',
                mode: 'ASYNCHRONOUS (BACKOFF & DLQ POLICY)',
                component: 'Outbox Relay -> PostgreSQL (outbox_events)',
                what: 'Outbox Relay records `attempts = 1`, `status = PENDING_RETRY`, and schedules exponential backoff (`next_retry_at = now + 2s`). The event remains safely persisted in PostgreSQL (`Outbox Pending = 1`).',
                why: 'Distinguishes transient infrastructure faults (retried from Outbox with exponential backoff + jitter) from poison payload errors (routed to a Dead-Letter Queue `payments.auth.dlq` after max consumer retries).',
                risk: 'Prevents tight retry loops (thundering herd) against a recovering broker while preserving durable state.',
                scope: 'Updates `EVT-903` to `PENDING_RETRY (Backoff)` in simulated table.',
                refTab: 'switch',
                log: '&gt; [STEP 4/6] Outbox Recovery Policy: EVT-903 kept in PostgreSQL (status=PENDING_RETRY, attempts=1, backoff=2s). Zero data loss.',
                onExecute: () => {
                    simulatedStorage.outboxEvents[0].status = 'PENDING_RETRY (Backoff 2s)';
                    setNodeBadge('node-dboutbox', 1, 'bg-red-500');
                    setNodeStatusBadge('node-dboutbox', 'PENDING RETRY', 'bg-amber-600');
                    setNodeStatusBadge('node-outboxrelay', 'BACKOFF 2S', 'bg-amber-600');
                }
            },
            {
                id: 'c-step-5',
                title: '5. Broker Recovery & Retry Attempt #2 Succeeds (Publisher ACK)',
                pipe: 'pipe-db-relay',
                secondaryPipes: ['pipe-relay-rmq', 'pipe-feedback-db'],
                activeNode: 'node-rabbitmq',
                nodeState: 'ok',
                badgeText: 'RECOVERED',
                mode: 'ASYNCHRONOUS (RETRY #2 -> ACK)',
                component: 'Outbox Relay -> RabbitMQ -> PostgreSQL',
                what: 'RabbitMQ connectivity recovers. On Retry Attempt #2, Outbox Relay publishes `EVT-903` (`x-attempt: 2`), receives broker Publisher Confirm (`ACK`), and updates `EVT-903` in PostgreSQL to `PUBLISHED`.',
                why: 'Confirms delivery to the broker before clearing the pending status in PostgreSQL (`Outbox Pending` drops from `1` to `0`).',
                risk: 'Ensures an event is never marked published until the broker durably acknowledges receipt.',
                scope: 'Simulated broker recovery and Outbox transition from `PENDING_RETRY` to `PUBLISHED`.',
                refTab: 'switch',
                log: '&gt; [STEP 5/6] RECOVERED: Retry Attempt #2 published EVT-903 to RabbitMQ. Broker ACK confirmed -&gt; Outbox updated to PUBLISHED.',
                onExecute: () => {
                    pendingDbCount = 0;
                    queueRmqCount = 1;
                    simulatedStorage.outboxEvents[0].attempts = 2;
                    simulatedStorage.outboxEvents[0].status = 'PUBLISHED (Retry #2 ACK)';
                    updateStatsUI();
                    setNodeBadge('node-dboutbox', 0, 'bg-red-500');
                    setNodeBadge('node-rabbitmq', 1, 'bg-amber-500');
                    setNodeStatusBadge('node-dboutbox', 'PUBLISHED', 'bg-emerald-600');
                    setNodeStatusBadge('node-outboxrelay', 'RETRY OK', 'bg-emerald-600');
                    setNodeStatusBadge('node-rabbitmq', 'ONLINE (1)', 'bg-emerald-600');
                }
            },
            {
                id: 'c-step-6',
                title: '6. At-Least-Once Consumer Processing & Idempotent Ledger Update',
                pipe: 'pipe-rmq-listener',
                activeNode: 'node-settlementlistener',
                nodeState: 'ok',
                badgeText: 'DEDUP & ACK',
                mode: 'ASYNCHRONOUS (AT-LEAST-ONCE -> IDEMPOTENT CONSUMER)',
                component: 'RabbitMQ -> Settlement Listener',
                what: 'Settlement Listener consumes `EVT-903`, verifies `event_id` in `processed_events` (`INSERT ... ON CONFLICT DO NOTHING`), books the `BRL 65.00` receivable, and sends consumer `ACK` (if a poison message failed after max retries, it would route to `DLQ`).',
                why: 'Transactional Outbox guarantees **At-Least-Once** delivery, NOT **Exactly-Once**: if the Relay crashed right after broker publish but before updating PostgreSQL, `EVT-903` would be published twice. Consumer deduplication by `event_id` makes processing safe.',
                risk: 'Prevents duplicate accounting entries during failure recovery and isolates unprocessable poison messages via DLQ.',
                scope: 'Scenario C complete: demonstrates full failure, pending state, retry recovery, and consumer deduplication.',
                refTab: 'clearing',
                log: '&gt; [STEP 6/6] Settlement Listener: Enforced consumer idempotency check (event_id=EVT-903), credited BRL 65.00 receivable, sent ACK. Scenario C COMPLETE.',
                onExecute: () => {
                    queueRmqCount = 0;
                    liveTxCount = 1;
                    liveVolume = 65.00;
                    simulatedStorage.consumerLedger = [{
                        eventId: 'EVT-903',
                        txId: 'TX-9903C',
                        dedupCheck: 'VERIFIED (At-Least-Once Safe)',
                        ledgerAction: 'Credited BRL 65.00 Receivable',
                        status: 'ACKED (Recovered)'
                    }];
                    updateStatsUI();
                    setNodeBadge('node-rabbitmq', 0, 'bg-amber-500');
                    setNodeStatusBadge('node-rabbitmq', 'DRAINED', 'bg-emerald-600');
                    setNodeStatusBadge('node-settlementlistener', 'RECOVERED OK', 'bg-emerald-600');
                }
            }
        ]
    },

    'scenario-d': {
        id: 'scenario-d',
        badge: 'SCENARIO D',
        title: 'Batch Settlement & Reconciliation (Phase 3)',
        subtitle: 'Demonstrates the distinction between real-time authorization (Base I) and end-of-day batch clearing & settlement (Base II / TC50) using Spring Batch and double-entry ledger booking.',
        summaryBanner: 'Authorization only reserves cardholder funds; actual financial clearing, fee calculation, and merchant payout occur asynchronously in scheduled batch windows.',
        steps: [
            {
                id: 'd-step-1',
                title: '1. End-of-Day Cut-Off & Clearing Log Staging (TC57 / Base II)',
                pipe: 'pipe-relay-tc57',
                activeNode: 'node-tc57log',
                nodeState: 'ok',
                badgeText: 'CUT-OFF LOG',
                mode: 'BATCH PULL (CLEARING CUT-OFF)',
                component: 'Settled Events -> Network Clearing Log (TC57)',
                what: 'Triggers the end-of-day clearing cut-off window, staging authorized transactions into positional clearing records (`TC57 / Visa Base II` layout) for batch reconciliation.',
                why: 'In card acquiring, synchronous authorization (`MTI 0100/0110`) only locks issuer funds; final financial clearing happens in batch cycles after daily cut-off.',
                risk: 'Prevents uncaptured or mismatched authorizations from entering financial settlement without audit staging.',
                scope: 'Simulated batch staging step in Phase 3 of the diagram.',
                refTab: 'clearing',
                log: '&gt; [STEP 1/3] Phase 3 Cut-Off: Staged settled transaction records into Network Clearing Log (TC57 / Base II positional format).',
                onExecute: () => {
                    simulatedStorage.transactions = [{
                        txId: 'BATCH-2026-EOD',
                        idemKey: 'cutoff-window-01',
                        amount: 'BRL 269.50 (3 Tx)',
                        mti: 'Base II (TC50/TC57)',
                        status: 'STAGED_FOR_CLEARING'
                    }];
                    setNodeStatusBadge('node-tc57log', 'STAGED', 'bg-blue-600');
                }
            },
            {
                id: 'd-step-2',
                title: '2. Chunk-Oriented Reconciliation & Fee Calculation (Spring Batch)',
                pipe: 'pipe-tc57-batch',
                activeNode: 'node-springbatch',
                nodeState: 'ok',
                badgeText: 'CHUNK OK',
                mode: 'BATCH PROCESSING (SHEDLOCK + CHUNKS)',
                component: 'Network Log -> Spring Batch Reconciliation Job',
                what: 'Executes a chunk-oriented batch step (`ItemReader -> FeeProcessor -> ItemWriter`), acquiring a distributed lock (`ShedLock`) and calculating MDR and interchange fees per transaction.',
                why: 'Chunk-oriented processing bounds memory consumption and stores execution checkpoints in `BATCH_STEP_EXECUTION` so failed batches can resume from the last committed chunk.',
                risk: 'Mitigates out-of-memory crashes on large settlement files and prevents concurrent execution across cluster nodes.',
                scope: 'Simulated Spring Batch chunk step and fee calculation.',
                refTab: 'clearing',
                log: '&gt; [STEP 2/3] Spring Batch: ShedLock acquired. Processed chunk records (Gross: BRL 269.50 | Interchange+MDR: BRL 5.93 | Net: BRL 263.57).',
                onExecute: () => {
                    simulatedStorage.outboxEvents = [{
                        eventId: 'JOB-EXEC-88',
                        aggregateId: 'BATCH-2026-EOD',
                        topic: 'spring.batch.chunk.commit',
                        attempts: 1,
                        status: 'COMPLETED (ShedLock)'
                    }];
                    setNodeStatusBadge('node-springbatch', 'RECON OK', 'bg-amber-600');
                }
            },
            {
                id: 'd-step-3',
                title: '3. Double-Entry Ledger Booking & TC50 Settlement Output',
                pipe: 'pipe-batch-payout',
                secondaryPipes: ['pipe-listener-payout'],
                activeNode: 'node-payout',
                nodeState: 'ok',
                badgeText: 'LEDGER BALANCED',
                mode: 'BATCH SETTLEMENT (DOUBLE-ENTRY)',
                component: 'Spring Batch -> Payout & Double-Entry Ledger',
                what: 'Books balanced debit/credit entries in the accounting ledger (`Debit: Scheme Receivable BRL 269.50` == `Credit: Merchant Payout BRL 263.57 + Acquirer Fee Revenue BRL 5.93`) and emits the positional `TC50` payout batch.',
                why: 'Enforces strict accounting conservation: every cent authorized and cleared must reconcile across merchant net payout and fee ledgers.',
                risk: 'Detects reconciliation drift before disbursing funds to merchant bank accounts.',
                scope: 'Simulated double-entry ledger balance in Scenario D.',
                refTab: 'clearing',
                log: '&gt; [STEP 3/3] Payout &amp; Ledger: Double-entry accounting balanced (Net BRL 263.57 + Fee BRL 5.93 = Gross BRL 269.50). Scenario D COMPLETE.',
                onExecute: () => {
                    simulatedStorage.transactions[0].status = 'SETTLED (TC50)';
                    simulatedStorage.consumerLedger = [{
                        eventId: 'LEDGER-EOD-01',
                        txId: 'BATCH-2026-EOD',
                        dedupCheck: 'CHUNK CHECKPOINT OK',
                        ledgerAction: 'Net BRL 263.57 | Fee BRL 5.93',
                        status: 'BALANCED'
                    }];
                    setNodeStatusBadge('node-payout', 'BALANCED', 'bg-emerald-600');
                }
            }
        ]
    }
};

document.addEventListener('DOMContentLoaded', () => {
    initSimulatorLab();

    setTimeout(() => {
        drawArchitectureArrows();
    }, 250);

    window.addEventListener('resize', () => {
        drawArchitectureArrows();
    });

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
});

/**
 * Initialize interactive node click/keyboard handlers and default scenario view
 */
function initSimulatorLab() {
    // Make all architecture diagram nodes interactive & keyboard accessible
    Object.keys(ARCH_NODES_META).forEach(nodeId => {
        const el = document.getElementById(nodeId);
        if (!el) return;
        el.setAttribute('tabindex', '0');
        el.setAttribute('role', 'button');
        el.setAttribute('aria-label', `Inspect component: ${ARCH_NODES_META[nodeId].name}`);

        el.addEventListener('click', () => {
            inspectArchitectureNode(nodeId);
        });
        el.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                inspectArchitectureNode(nodeId);
            }
        });
    });

    selectScenario('scenario-a', false);
    initHeroPreview();
}

/**
 * Check if user prefers reduced motion
 */
function prefersReducedMotion() {
    return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Clear all scheduled timeouts and animation frames to guarantee deterministic state
 */
function cancelAllActiveTimers() {
    activeTimers.forEach(t => clearTimeout(t));
    activeTimers = [];
    if (activeRafId) {
        cancelAnimationFrame(activeRafId);
        activeRafId = null;
    }
    if (timelineTimer) {
        clearInterval(timelineTimer);
        timelineTimer = null;
    }
}

function scheduleTimer(fn, delayMs) {
    let id = null;
    id = setTimeout(() => {
        activeTimers = activeTimers.filter(t => t !== id);
        fn();
    }, delayMs);
    activeTimers.push(id);
    return id;
}

/**
 * Select one of the interactive scenarios and reset state cleanly
 */
function selectScenario(scenarioId, autoRun = false) {
    if (!SIM_SCENARIOS[scenarioId]) return;
    cancelAllActiveTimers();
    activeScenarioId = scenarioId;
    simState = 'IDLE';
    currentStepIndex = -1;

    // Update scenario selector tab buttons
    document.querySelectorAll('.sim-scenario-btn').forEach(btn => {
        const isSelected = btn.getAttribute('data-scenario') === scenarioId;
        btn.setAttribute('aria-selected', isSelected ? 'true' : 'false');
        if (isSelected) {
            btn.classList.add('border-[#00D47E]', 'bg-[#081229]', 'text-white', 'shadow-lg');
            btn.classList.remove('border-[#152342]', 'bg-[#040816]/80', 'text-slate-300');
        } else {
            btn.classList.remove('border-[#00D47E]', 'bg-[#081229]', 'text-white', 'shadow-lg');
            btn.classList.add('border-[#152342]', 'bg-[#040816]/80', 'text-slate-300');
        }
    });

    // Reset visual & storage state for the selected scenario
    resetScenarioStateOnly();

    const scenario = SIM_SCENARIOS[scenarioId];
    const summaryEl = document.getElementById('sim-scenario-summary');
    if (summaryEl) {
        summaryEl.textContent = scenario.summaryBanner;
    }

    renderStepCardsList();
    renderStepInspector(0, false);
    renderSimulatedStorageTables();
    updateControlButtonsUI();

    if (autoRun) {
        runSelectedScenario();
    }
}

/**
 * Reset visual highlights, badges, and simulated storage without losing scenario selection
 */
function resetScenarioStateOnly() {
    liveTxCount = 0;
    liveVolume = 0.00;
    pendingDbCount = 0;
    queueRmqCount = 0;
    simulatedStorage = {
        idempotencyKeys: [],
        transactions: [],
        outboxEvents: [],
        consumerLedger: []
    };

    updateStatsUI();
    clearPipeHighlights();
    clearNodeHighlights();
    setNodeBadge('node-dboutbox', 0);
    setNodeBadge('node-rabbitmq', 0);

    const token = document.getElementById('data-packet-token');
    if (token) {
        token.style.opacity = '0';
        token.classList.remove('token-warn', 'token-error');
    }

    const timelineProgress = document.getElementById('sim-timeline-progress');
    const timelineTime = document.getElementById('sim-timeline-time');
    const timelineTotal = document.getElementById('sim-timeline-total');
    const scenario = SIM_SCENARIOS[activeScenarioId];
    if (timelineProgress) timelineProgress.style.width = '0%';
    if (timelineTime) timelineTime.textContent = 'STEP 0';
    if (timelineTotal && scenario) timelineTotal.textContent = `OF ${scenario.steps.length}`;

    const latencyBadge = document.getElementById('sim-latency-badge');
    if (latencyBadge) {
        latencyBadge.textContent = `STATE: IDLE • ${scenario ? scenario.badge : 'READY'}`;
        latencyBadge.className = 'text-slate-400 font-mono';
    }

    const consoleOut = document.getElementById('sim-console-output');
    if (consoleOut && scenario) {
        consoleOut.innerHTML = `
            <div class="text-slate-300">&gt; [${scenario.badge}] Initialized clean deterministic state: <strong class="text-white">${scenario.title}</strong>.</div>
            <div class="text-slate-400">&gt; Use <strong class="text-[#00D47E]">"Run Scenario"</strong> for automated playback or <strong class="text-cyan-300">"Step Forward"</strong> to walk through each stage manually.</div>
        `;
    }
}

/**
 * Public handler for the Reset button
 */
function resetSimulationStats() {
    cancelAllActiveTimers();
    simState = 'IDLE';
    currentStepIndex = -1;
    resetScenarioStateOnly();
    renderStepCardsList();
    renderStepInspector(0, false);
    renderSimulatedStorageTables();
    updateControlButtonsUI();
}

/**
 * Legacy compatibility wrapper if called by old onclick handlers
 */
function runTransactionSimulation(mode = 'auth') {
    if (mode === 'settle') {
        selectScenario('scenario-d', true);
    } else {
        selectScenario(activeScenarioId || 'scenario-a', true);
    }
}

/**
 * Run the currently selected scenario from start to finish automatically
 */
function runSelectedScenario() {
    if (simState === 'RUNNING') return;
    cancelAllActiveTimers();
    resetScenarioStateOnly();

    simState = 'RUNNING';
    currentStepIndex = -1;
    updateControlButtonsUI();

    const scenario = SIM_SCENARIOS[activeScenarioId];
    const latencyBadge = document.getElementById('sim-latency-badge');
    if (latencyBadge && scenario) {
        latencyBadge.textContent = `RUNNING • ${scenario.badge} IN FLIGHT...`;
        latencyBadge.className = 'text-cyan-400 font-bold animate-pulse';
    }

    executeNextStepAuto();
}

function executeNextStepAuto() {
    const scenario = SIM_SCENARIOS[activeScenarioId];
    if (!scenario || simState !== 'RUNNING') return;

    const nextIdx = currentStepIndex + 1;
    if (nextIdx >= scenario.steps.length) {
        completeScenarioExecution();
        return;
    }

    executeScenarioStep(nextIdx, () => {
        if (simState !== 'RUNNING') return;
        const stepPauseMs = prefersReducedMotion() ? 180 : 650;
        scheduleTimer(() => {
            executeNextStepAuto();
        }, stepPauseMs);
    });
}

/**
 * Advance exactly one step manually (Ideal for technical interview explanations)
 */
function stepScenarioForward() {
    const scenario = SIM_SCENARIOS[activeScenarioId];
    if (!scenario) return;

    // If currently auto-running, pause auto-run and switch to manual stepping mode
    if (simState === 'RUNNING') {
        cancelAllActiveTimers();
        simState = 'STEPPING';
        updateControlButtonsUI();
        return;
    }

    // If already completed, reset before stepping from step 1
    if (simState === 'COMPLETED' || currentStepIndex >= scenario.steps.length - 1) {
        resetScenarioStateOnly();
        currentStepIndex = -1;
    }

    simState = 'STEPPING';
    updateControlButtonsUI();

    const nextIdx = currentStepIndex + 1;
    const latencyBadge = document.getElementById('sim-latency-badge');
    if (latencyBadge) {
        latencyBadge.textContent = `STEP MODE • STAGE ${nextIdx + 1} OF ${scenario.steps.length}`;
        latencyBadge.className = 'text-amber-300 font-bold';
    }

    executeScenarioStep(nextIdx, () => {
        if (currentStepIndex >= scenario.steps.length - 1) {
            completeScenarioExecution();
        } else {
            simState = 'STEPPING';
            updateControlButtonsUI();
        }
    });
}

/**
 * Execute a single deterministic step `stepIdx` of the active scenario
 */
function executeScenarioStep(stepIdx, onStepDone) {
    const scenario = SIM_SCENARIOS[activeScenarioId];
    if (!scenario || !scenario.steps[stepIdx]) return;

    currentStepIndex = stepIdx;
    const step = scenario.steps[stepIdx];
    const token = document.getElementById('data-packet-token');
    const consoleOut = document.getElementById('sim-console-output');

    // Update progress bar
    const timelineProgress = document.getElementById('sim-timeline-progress');
    const timelineTime = document.getElementById('sim-timeline-time');
    const timelineTotal = document.getElementById('sim-timeline-total');
    const percent = Math.round(((stepIdx + 1) / scenario.steps.length) * 100);
    if (timelineProgress) timelineProgress.style.width = `${percent}%`;
    if (timelineTime) timelineTime.textContent = `STEP ${stepIdx + 1}`;
    if (timelineTotal) timelineTotal.textContent = `OF ${scenario.steps.length}`;

    // Clear previous transient active highlights while preserving status badges
    clearPipeHighlights();
    document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('active-node'));

    // Configure token visual style for this step
    if (token) {
        token.classList.remove('token-warn', 'token-error');
        if (step.tokenClass) token.classList.add(step.tokenClass);
    }

    // Highlight secondary pipes if present
    if (Array.isArray(step.secondaryPipes)) {
        step.secondaryPipes.forEach(pId => {
            const pEl = document.getElementById(pId);
            const aEl = document.getElementById(`arrow-${pId}`);
            const cls = step.pipeClass || 'active-pipe';
            if (pEl) pEl.classList.add(cls);
            if (aEl) aEl.classList.add(cls);
        });
    }

    // Traverse primary pipe and apply state mutations
    traversePipe(step.pipe, token, step.pipeClass || 'active-pipe', () => {
        if (typeof step.onExecute === 'function') {
            step.onExecute();
        }

        // Apply semantic node state class to active node
        const targetNode = document.getElementById(step.activeNode);
        if (targetNode) {
            targetNode.classList.remove('state-ok', 'state-warn', 'state-error');
            if (step.nodeState === 'ok') targetNode.classList.add('state-ok');
            if (step.nodeState === 'warn') targetNode.classList.add('state-warn');
            if (step.nodeState === 'error') targetNode.classList.add('state-error');
        }

        logConsole(consoleOut, step.log, step.nodeState);
        renderStepCardsList();
        renderStepInspector(stepIdx, true);
        renderSimulatedStorageTables();

        if (onStepDone) onStepDone();
    });
}

function completeScenarioExecution() {
    simState = 'COMPLETED';
    const token = document.getElementById('data-packet-token');
    if (token) token.style.opacity = '0';

    const scenario = SIM_SCENARIOS[activeScenarioId];
    const latencyBadge = document.getElementById('sim-latency-badge');
    if (latencyBadge && scenario) {
        latencyBadge.textContent = `COMPLETED • ${scenario.badge} VERIFIED (${scenario.steps.length}/${scenario.steps.length} STEPS)`;
        latencyBadge.className = 'text-[#00D47E] font-bold';
    }

    renderStepCardsList();
    updateControlButtonsUI();
}

function updateControlButtonsUI() {
    const btnRun = document.getElementById('btn-fire-tx');
    const btnStep = document.getElementById('btn-step-tx');
    const btnReset = document.getElementById('btn-reset-tx');

    if (btnRun) {
        const isRunning = simState === 'RUNNING';
        btnRun.disabled = isRunning;
        if (isRunning) {
            btnRun.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            btnRun.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }

    if (btnStep) {
        const labelSpan = btnStep.querySelector('.step-btn-label');
        if (labelSpan) {
            if (simState === 'RUNNING') {
                labelSpan.textContent = 'Pause / Step';
            } else if (simState === 'STEPPING' && currentStepIndex >= 0) {
                labelSpan.textContent = 'Next Step';
            } else {
                labelSpan.textContent = 'Step Forward';
            }
        }
    }

    if (btnReset) {
        btnReset.disabled = false;
    }
}

/**
 * Render the interactive Step Sequence List (Used both as Mobile Vertical Pipeline & Desktop Step Selector)
 */
function renderStepCardsList() {
    const container = document.getElementById('sim-steps-list');
    if (!container) return;

    const scenario = SIM_SCENARIOS[activeScenarioId];
    if (!scenario) return;

    container.innerHTML = scenario.steps.map((step, idx) => {
        let statusLabel = 'PENDING';
        let statusClasses = 'bg-slate-800 text-slate-400 border-slate-700';
        let cardBorder = 'border-[#152342] bg-[#040711]/90';

        if (idx < currentStepIndex || (idx === currentStepIndex && simState === 'COMPLETED')) {
            statusLabel = step.badgeText || 'COMPLETED';
            if (step.nodeState === 'warn') {
                statusClasses = 'bg-amber-950/90 text-amber-300 border-amber-500/40';
                cardBorder = 'border-amber-500/40 bg-[#080E1E]';
            } else if (step.nodeState === 'error') {
                statusClasses = 'bg-red-950/90 text-red-300 border-red-500/40';
                cardBorder = 'border-red-500/40 bg-[#080E1E]';
            } else {
                statusClasses = 'bg-emerald-950/90 text-[#00D47E] border-[#00D47E]/40';
                cardBorder = 'border-[#00D47E]/40 bg-[#080E1E]';
            }
        } else if (idx === currentStepIndex) {
            statusLabel = step.badgeText || 'ACTIVE';
            if (step.nodeState === 'error') {
                statusClasses = 'bg-red-600 text-white border-red-400';
                cardBorder = 'border-red-500 bg-[#1A0B12] shadow-lg';
            } else if (step.nodeState === 'warn') {
                statusClasses = 'bg-amber-500 text-slate-950 border-amber-300';
                cardBorder = 'border-amber-400 bg-[#191207] shadow-lg';
            } else {
                statusClasses = 'bg-cyan-500 text-slate-950 border-cyan-300';
                cardBorder = 'border-cyan-400 bg-[#07152B] shadow-lg';
            }
        }

        return `
            <button type="button"
                    onclick="renderStepInspector(${idx}, true)"
                    class="w-full text-left p-3 rounded-xl border ${cardBorder} hover:border-cyan-400/60 transition-all flex items-start justify-between gap-2.5 group">
                <div class="min-w-0 flex-1">
                    <div class="flex items-center gap-2">
                        <span class="text-xs font-bold text-white group-hover:text-cyan-300 transition-colors truncate">${step.title}</span>
                    </div>
                    <div class="text-[10px] font-mono text-slate-400 mt-1 flex flex-wrap items-center gap-1.5">
                        <span class="text-cyan-300">${step.component}</span>
                        <span>•</span>
                        <span>${step.mode}</span>
                    </div>
                </div>
                <span class="shrink-0 px-2 py-0.5 rounded text-[9px] font-mono font-bold border ${statusClasses}">
                    ${statusLabel}
                </span>
            </button>
        `;
    }).join('');
}

/**
 * Render Phase 4 Technical Explanation for a selected step
 */
function renderStepInspector(stepIdx, isExecutedOrSelected = false) {
    const container = document.getElementById('sim-step-detail-card');
    if (!container) return;

    const scenario = SIM_SCENARIOS[activeScenarioId];
    if (!scenario || !scenario.steps[stepIdx]) return;

    const step = scenario.steps[stepIdx];
    const stateBadge = (stepIdx <= currentStepIndex)
        ? `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-[#00D47E] border border-[#00D47E]/40">${step.badgeText || 'EXECUTED'}</span>`
        : `<span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">STAGE PREVIEW</span>`;

    container.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#152342] pb-3">
            <div>
                <div class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">${scenario.badge} • ${step.mode}</div>
                <h4 class="text-sm sm:text-base font-bold text-white mt-0.5">${step.title}</h4>
            </div>
            ${stateBadge}
        </div>

        <div class="grid sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
                <div class="text-[10px] font-mono uppercase text-[#00D47E] font-bold">What Happens</div>
                <p class="text-slate-300 leading-relaxed">${step.what}</p>
            </div>
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
                <div class="text-[10px] font-mono uppercase text-cyan-400 font-bold">Why This Stage Exists</div>
                <p class="text-slate-300 leading-relaxed">${step.why}</p>
            </div>
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
                <div class="text-[10px] font-mono uppercase text-amber-400 font-bold">Technical Risk Mitigated</div>
                <p class="text-slate-300 leading-relaxed">${step.risk}</p>
            </div>
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1 flex flex-col justify-between">
                <div>
                    <div class="text-[10px] font-mono uppercase text-purple-300 font-bold">Responsible Component &amp; Scope</div>
                    <p class="text-white font-mono text-[11px] font-semibold mt-0.5">${step.component}</p>
                    <p class="text-slate-400 text-[11px] mt-1">${step.scope}</p>
                </div>
                <div class="pt-2 flex items-center justify-between border-t border-[#152342]/80 mt-2">
                    <a href="#projects" onclick="if(typeof switchOrionTab==='function'){switchOrionTab('${step.refTab || 'switch'}');}" class="text-[11px] font-mono font-bold text-[#00D47E] hover:underline inline-flex items-center gap-1">
                        <span>View Architecture Case Study</span>
                        <span>&rarr;</span>
                    </a>
                    <a href="https://github.com/franciscoaraujo/myprofile.dev.io/blob/master/js/components/simulator.js" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono text-slate-400 hover:text-white underline">
                        simulator.js
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Inspect an architecture node when clicked or activated via keyboard on the diagram
 */
function inspectArchitectureNode(nodeId) {
    const meta = ARCH_NODES_META[nodeId];
    const container = document.getElementById('sim-step-detail-card');
    if (!meta || !container) return;

    document.querySelectorAll('.arch-node').forEach(n => n.classList.remove('active-node'));
    const nodeEl = document.getElementById(nodeId);
    if (nodeEl) nodeEl.classList.add('active-node');

    container.innerHTML = `
        <div class="flex flex-wrap items-center justify-between gap-2 border-b border-[#152342] pb-3">
            <div>
                <div class="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">COMPONENT INSPECTOR • ${meta.phase}</div>
                <h4 class="text-sm sm:text-base font-bold text-white mt-0.5">${meta.name}</h4>
            </div>
            <span class="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-blue-950 text-blue-300 border border-blue-500/40">NODE SELECTED</span>
        </div>

        <div class="grid sm:grid-cols-2 gap-3 pt-1 text-xs">
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
                <div class="text-[10px] font-mono uppercase text-[#00D47E] font-bold">What Happens</div>
                <p class="text-slate-300 leading-relaxed">${meta.what}</p>
            </div>
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
                <div class="text-[10px] font-mono uppercase text-cyan-400 font-bold">Why It Exists</div>
                <p class="text-slate-300 leading-relaxed">${meta.why}</p>
            </div>
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1">
                <div class="text-[10px] font-mono uppercase text-amber-400 font-bold">Technical Risk Mitigated</div>
                <p class="text-slate-300 leading-relaxed">${meta.risk}</p>
            </div>
            <div class="p-3 rounded-xl bg-[#040711] border border-[#152342] space-y-1 flex flex-col justify-between">
                <div>
                    <div class="text-[10px] font-mono uppercase text-purple-300 font-bold">Responsible Module &amp; Simulation Scope</div>
                    <p class="text-white font-mono text-[11px] font-semibold mt-0.5">${meta.component}</p>
                    <p class="text-slate-400 text-[11px] mt-1">${meta.scope}</p>
                </div>
                <div class="pt-2 flex items-center justify-between border-t border-[#152342]/80 mt-2">
                    <a href="${meta.refLink}" onclick="if(typeof switchOrionTab==='function'){switchOrionTab('${meta.refTab}');}" class="text-[11px] font-mono font-bold text-[#00D47E] hover:underline inline-flex items-center gap-1">
                        <span>${meta.refLabel}</span>
                        <span>&rarr;</span>
                    </a>
                    <a href="https://github.com/franciscoaraujo/myprofile.dev.io/blob/master/js/data/orion-data.js" target="_blank" rel="noopener noreferrer" class="text-[10px] font-mono text-slate-400 hover:text-white underline">
                        orion-data.js
                    </a>
                </div>
            </div>
        </div>
    `;
}

/**
 * Render the Simulated Database, Idempotency & Outbox State Inspector tables
 */
function renderSimulatedStorageTables() {
    const tbodyIdem = document.getElementById('sim-table-idem');
    const tbodyTx = document.getElementById('sim-table-tx');
    const tbodyOutbox = document.getElementById('sim-table-outbox');
    const tbodyConsumer = document.getElementById('sim-table-consumer');

    if (tbodyIdem) {
        tbodyIdem.innerHTML = simulatedStorage.idempotencyKeys.length === 0
            ? `<tr><td colspan="4" class="py-2 px-2.5 text-slate-500 italic">No idempotency keys recorded in current scenario state.</td></tr>`
            : simulatedStorage.idempotencyKeys.map(r => `
                <tr class="border-t border-[#152342]/60">
                    <td class="py-1.5 px-2.5 text-cyan-300 font-bold">${r.key}</td>
                    <td class="py-1.5 px-2.5 text-slate-300">${r.payloadHash}</td>
                    <td class="py-1.5 px-2.5 text-[#00D47E] font-bold">${r.status}</td>
                    <td class="py-1.5 px-2.5 text-amber-300">${r.replayed}</td>
                </tr>
            `).join('');
    }

    if (tbodyTx) {
        tbodyTx.innerHTML = simulatedStorage.transactions.length === 0
            ? `<tr><td colspan="4" class="py-2 px-2.5 text-slate-500 italic">No persisted transactions yet.</td></tr>`
            : simulatedStorage.transactions.map(t => `
                <tr class="border-t border-[#152342]/60">
                    <td class="py-1.5 px-2.5 text-white font-bold">${t.txId}</td>
                    <td class="py-1.5 px-2.5 text-slate-300">${t.amount}</td>
                    <td class="py-1.5 px-2.5 text-cyan-300">${t.mti}</td>
                    <td class="py-1.5 px-2.5 text-[#00D47E] font-bold">${t.status}</td>
                </tr>
            `).join('');
    }

    if (tbodyOutbox) {
        tbodyOutbox.innerHTML = simulatedStorage.outboxEvents.length === 0
            ? `<tr><td colspan="4" class="py-2 px-2.5 text-slate-500 italic">Outbox table empty (0 events).</td></tr>`
            : simulatedStorage.outboxEvents.map(o => {
                const statusColor = o.status.includes('FAILED')
                    ? 'text-red-400'
                    : (o.status.includes('PENDING') ? 'text-amber-300' : 'text-[#00D47E]');
                return `
                    <tr class="border-t border-[#152342]/60">
                        <td class="py-1.5 px-2.5 text-purple-300 font-bold">${o.eventId}</td>
                        <td class="py-1.5 px-2.5 text-slate-300">${o.topic}</td>
                        <td class="py-1.5 px-2.5 text-slate-300">${o.attempts}</td>
                        <td class="py-1.5 px-2.5 font-bold ${statusColor}">${o.status}</td>
                    </tr>
                `;
            }).join('');
    }

    if (tbodyConsumer) {
        tbodyConsumer.innerHTML = simulatedStorage.consumerLedger.length === 0
            ? `<tr><td colspan="4" class="py-2 px-2.5 text-slate-500 italic">No consumer events processed yet.</td></tr>`
            : simulatedStorage.consumerLedger.map(c => `
                <tr class="border-t border-[#152342]/60">
                    <td class="py-1.5 px-2.5 text-emerald-300 font-bold">${c.eventId}</td>
                    <td class="py-1.5 px-2.5 text-cyan-300">${c.dedupCheck}</td>
                    <td class="py-1.5 px-2.5 text-slate-200">${c.ledgerAction}</td>
                    <td class="py-1.5 px-2.5 text-[#00D47E] font-bold">${c.status}</td>
                </tr>
            `).join('');
    }
}

/**
 * Draw all connecting paths and place directional arrows in the exact middle of the gap between cards
 */
function drawArchitectureArrows() {
    const container = document.getElementById('arch-mesh-area');
    const group = document.getElementById('arch-connections-group');
    if (!container || !group) return;

    const cRect = container.getBoundingClientRect();
    if (cRect.width === 0 || cRect.height === 0) return;

    let svgHtml = '';

    ARCH_PIPES.forEach(pipe => {
        const fromEl = document.getElementById(pipe.from);
        const toEl = document.getElementById(pipe.to);
        if (!fromEl || !toEl) return;

        const fRect = fromEl.getBoundingClientRect();
        const tRect = toEl.getBoundingClientRect();

        // Center coordinates inside container
        const fromCenterX = (fRect.left + fRect.width / 2 - cRect.left) + container.scrollLeft;
        const fromCenterY = (fRect.top + fRect.height / 2 - cRect.top) + container.scrollTop;
        const toCenterX = (tRect.left + tRect.width / 2 - cRect.left) + container.scrollLeft;
        const toCenterY = (tRect.top + tRect.height / 2 - cRect.top) + container.scrollTop;

        let d = '';
        let arrowX = 0;
        let arrowY = 0;
        let arrowAngle = 0;

        if (pipe.dir === 'right') {
            const x1 = (fRect.right - cRect.left) + container.scrollLeft;
            const y1 = fromCenterY;
            const x2 = (tRect.left - cRect.left) + container.scrollLeft;
            const y2 = toCenterY;

            arrowX = (x1 + x2) / 2;
            arrowY = (y1 + y2) / 2;
            arrowAngle = 0;

            if (Math.abs(y1 - y2) < 4) {
                d = `M ${fromCenterX} ${fromCenterY} L ${toCenterX} ${toCenterY}`;
            } else {
                d = `M ${fromCenterX} ${fromCenterY} L ${arrowX} ${fromCenterY} L ${arrowX} ${toCenterY} L ${toCenterX} ${toCenterY}`;
            }
        } else if (pipe.dir === 'up') {
            const offsetX = pipe.offset || 0;
            const x1 = fromCenterX + offsetX;
            const y1 = (fRect.top - cRect.top) + container.scrollTop;
            const x2 = toCenterX + offsetX;
            const y2 = (tRect.bottom - cRect.top) + container.scrollTop;

            arrowX = (x1 + x2) / 2;
            arrowY = (y1 + y2) / 2;
            arrowAngle = -90;

            d = `M ${fromCenterX + offsetX} ${fromCenterY} L ${toCenterX + offsetX} ${toCenterY}`;
        } else if (pipe.dir === 'down') {
            const offsetX = pipe.offset || 0;
            const x1 = fromCenterX + offsetX;
            const y1 = (fRect.bottom - cRect.top) + container.scrollTop;
            const x2 = toCenterX + offsetX;
            const y2 = (tRect.top - cRect.top) + container.scrollTop;

            arrowX = (x1 + x2) / 2;
            arrowY = (y1 + y2) / 2;
            arrowAngle = 90;

            d = `M ${fromCenterX + offsetX} ${fromCenterY} L ${toCenterX + offsetX} ${toCenterY}`;
        } else if (pipe.dir === 'feedback-up') {
            const bottomY = (fRect.bottom - cRect.top) + container.scrollTop + 14;
            const targetBottomY = (tRect.bottom - cRect.top) + container.scrollTop;

            arrowX = toCenterX;
            arrowY = (bottomY + targetBottomY) / 2;
            arrowAngle = -90;

            d = `M ${fromCenterX} ${fromCenterY} L ${fromCenterX} ${bottomY} L ${toCenterX} ${bottomY} L ${toCenterX} ${toCenterY}`;
        } else if (pipe.dir === 'listener-to-payout') {
            const startX = fromCenterX;
            const startY = fromCenterY;
            const endX = toCenterX;
            const endY = toCenterY;
            const midY = (startY + endY) / 2;

            arrowX = startX;
            arrowY = midY;
            arrowAngle = 90;

            d = `M ${startX} ${startY} L ${startX} ${endY} L ${endX} ${endY}`;
        }

        const modeClass = pipe.mode === 'sync' ? 'sync-pipe' : 'async-pipe';
        const arrowSvg = `
            <polygon class="arch-arrow-head" 
                     id="arrow-${pipe.id}"
                     points="-6,-4.5 5,0 -6,4.5" 
                     fill="${pipe.color}" 
                     transform="translate(${arrowX}, ${arrowY}) rotate(${arrowAngle})" />
        `;

        svgHtml += `
            <path id="${pipe.id}" 
                  class="arch-connector-line ${modeClass}" 
                  d="${d}" 
                  stroke="${pipe.color}" />
            ${arrowSvg}
        `;
    });

    group.innerHTML = svgHtml;
}

/**
 * Animate the data packet along an SVG pipe line, respecting prefers-reduced-motion
 */
function traversePipe(pipeId, token, highlightClass, onComplete) {
    const pipe = ARCH_PIPES.find(p => p.id === pipeId);
    if (!pipe) {
        if (onComplete) onComplete();
        return;
    }

    const fromNode = document.getElementById(pipe.from);
    const toNode = document.getElementById(pipe.to);
    const pathEl = document.getElementById(pipe.id);
    const arrowEl = document.getElementById(`arrow-${pipe.id}`);
    const cls = highlightClass || 'active-pipe';

    if (fromNode) fromNode.classList.add('active-node');
    if (pathEl) pathEl.classList.add(cls);
    if (arrowEl) arrowEl.classList.add(cls);

    // If element is hidden (e.g. mobile compact view) or user prefers reduced motion, complete without frame loop
    if (!fromNode || !toNode || !pathEl || !token || prefersReducedMotion() || pathEl.getBoundingClientRect().width === 0) {
        if (toNode) toNode.classList.add('active-node');
        scheduleTimer(() => {
            if (fromNode) fromNode.classList.remove('active-node');
            if (onComplete) onComplete();
        }, prefersReducedMotion() ? 20 : 120);
        return;
    }

    token.style.opacity = '1';
    const totalLen = pathEl.getTotalLength();
    const duration = 380; // crisp, responsive duration
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const pt = pathEl.getPointAtLength(totalLen * progress);
        const ptAhead = pathEl.getPointAtLength(Math.min(totalLen, totalLen * progress + 2));
        const ptBehind = pathEl.getPointAtLength(Math.max(0, totalLen * progress - 2));
        const angle = Math.atan2(ptAhead.y - ptBehind.y, ptAhead.x - ptBehind.x) * 180 / Math.PI;

        token.style.left = `${pt.x}px`;
        token.style.top = `${pt.y}px`;
        token.style.transform = `translate(-50%, -50%) rotate(${angle}deg)`;

        if (progress < 1) {
            activeRafId = requestAnimationFrame(step);
        } else {
            activeRafId = null;
            toNode.classList.add('active-node');
            scheduleTimer(() => {
                fromNode.classList.remove('active-node');
                if (onComplete) onComplete();
            }, 60);
        }
    }

    activeRafId = requestAnimationFrame(step);
}

function clearPipeHighlights() {
    document.querySelectorAll('.arch-connector-line').forEach(p => {
        p.classList.remove('active-pipe', 'warn-pipe', 'error-pipe');
    });
    document.querySelectorAll('.arch-arrow-head').forEach(a => {
        a.classList.remove('active-pipe', 'warn-pipe', 'error-pipe');
    });
}

function clearNodeHighlights() {
    document.querySelectorAll('.arch-node').forEach(n => {
        n.classList.remove('active-node', 'state-ok', 'state-warn', 'state-error');
        const statusPill = n.querySelector('.node-status-pill');
        if (statusPill) statusPill.remove();
    });
}

/**
 * Add or update a semantic text status pill on an architecture node (Does not rely solely on color)
 */
function setNodeStatusBadge(nodeId, text, bgClass) {
    const node = document.getElementById(nodeId);
    if (!node) return;
    let pill = node.querySelector('.node-status-pill');
    if (!pill) {
        pill = document.createElement('span');
        node.appendChild(pill);
    }
    pill.className = `node-status-pill absolute -top-2.5 left-2 px-1.5 py-0.5 rounded text-[8px] font-mono font-bold text-white shadow ${bgClass}`;
    pill.textContent = text;
}

function setNodeBadge(nodeId, count, bgClass) {
    const node = document.getElementById(nodeId);
    if (!node) return;

    // Also synchronize static #badge-rmq-count if targeting node-rabbitmq
    if (nodeId === 'node-rabbitmq') {
        const staticRmqBadge = document.getElementById('badge-rmq-count');
        if (staticRmqBadge) {
            staticRmqBadge.textContent = count;
        }
    }

    let badge = node.querySelector('.node-badge');
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            node.appendChild(badge);
        }
        badge.className = `node-badge absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-lg arch-badge-pulse ${bgClass || 'bg-amber-500'}`;
        badge.textContent = count;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

function updateStatsUI() {
    const elLive = document.getElementById('stat-live-tx');
    const elVol = document.getElementById('stat-volume');
    const elDb = document.getElementById('stat-db-stuck');
    const elRmq = document.getElementById('stat-rmq-queue');

    if (elLive) elLive.textContent = liveTxCount;
    if (elVol) elVol.textContent = liveVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (elDb) elDb.textContent = pendingDbCount;
    if (elRmq) elRmq.textContent = queueRmqCount;
}

function logConsole(consoleOut, messageHtml, stateType) {
    if (!consoleOut) return;
    const div = document.createElement('div');
    if (stateType === 'error') {
        div.className = 'text-red-400 font-semibold';
    } else if (stateType === 'warn') {
        div.className = 'text-amber-300';
    } else {
        div.className = 'text-emerald-300';
    }
    div.innerHTML = messageHtml;
    consoleOut.appendChild(div);
    consoleOut.scrollTop = consoleOut.scrollHeight;
}

function toggleTerminalView() {
    const term = document.getElementById('sim-terminal-container');
    if (!term) return;
    term.classList.toggle('hidden');
}

function toggleMobileDiagramView() {
    const wrapper = document.getElementById('arch-desktop-diagram-wrapper');
    const btnText = document.getElementById('btn-mobile-diagram-text');
    if (!wrapper) return;
    const isHidden = wrapper.classList.contains('hidden');
    if (isHidden) {
        wrapper.classList.remove('hidden');
        if (btnText) btnText.textContent = 'Hide Full Architecture Diagram';
        setTimeout(() => drawArchitectureArrows(), 60);
    } else {
        wrapper.classList.add('hidden');
        if (btnText) btnText.textContent = 'Show Full Architecture Diagram (Scrollable)';
    }
}

/* ============================================================================
   HERO ORIONPAY COMPACT INTERACTIVE PREVIEW (REUSES SHARED SCENARIO A CONTEXT)
   ============================================================================ */
let heroPreviewState = 'IDLE'; // 'IDLE' | 'RUNNING' | 'COMPLETED'
let heroCurrentStage = -1;
let heroTimers = [];

const HERO_PREVIEW_STAGES = [
    {
        num: 1,
        code: 'AUTHORIZATION REQUEST',
        shortBadge: 'REQ',
        summary: 'Synthetic request received: Amount BRL 84.50, Token tok_synth_4091, Idempotency-Key idem-a104-9c82.',
        detail: 'Uses strictly non-sensitive synthetic data in browser memory. No real PAN, PIN, or cryptographic keys are transmitted.',
        log: '&gt; [1/7] AUTHORIZATION REQUEST: Inbound synthetic payload (amount=BRL 84.50, token=tok_synth_4091, idem_key=idem-a104-9c82).'
    },
    {
        num: 2,
        code: 'VALIDATION',
        shortBadge: 'VALID',
        summary: 'Schema & mandatory field validation: verifies amount > 0, currency=BRL, merchant_id, and idempotency key format.',
        detail: 'Fails fast at the API boundary before acquiring database locks or invoking downstream switch components.',
        log: '&gt; [2/7] VALIDATION: Mandatory fields &amp; synthetic payload contract verified (status=VALID).'
    },
    {
        num: 3,
        code: 'IDEMPOTENCY CHECK',
        shortBadge: 'IDEM',
        summary: 'Verifies synthetic key "idem-a104-9c82" + payload hash (sha256:7f83b1). Status transitions from MISS to IN_PROGRESS.',
        detail: 'Deduplicates network retries carrying the same key. Note: key-based idempotency does not prevent duplicates if a client generates a new key.',
        log: '&gt; [3/7] IDEMPOTENCY CHECK: Key "idem-a104-9c82" lookup=MISS -&gt; lock registered as IN_PROGRESS (hash=sha256:7f83b1).'
    },
    {
        num: 4,
        code: 'TRANSACTION PERSISTENCE',
        shortBadge: 'DB TX',
        summary: 'Models persisting transaction TX-9041A (APPROVED) after simulated authorizer response (MTI 0110 / DE39=00).',
        detail: 'Executed here as an in-memory browser state transition illustrating relational PostgreSQL persistence in the reference architecture.',
        log: '&gt; [4/7] TRANSACTION PERSISTENCE: Simulated local record TX-9041A staged as APPROVED (illustrative in-memory state).'
    },
    {
        num: 5,
        code: 'TRANSACTIONAL OUTBOX',
        shortBadge: 'OUTBOX',
        summary: 'Registers event EVT-501 (status=PENDING) in the same local database transaction as the business state change (TX-9041A).',
        detail: 'Ensures consistency between the transaction row and the outbox row in PostgreSQL—without claiming atomic transactions across DB and broker.',
        log: '&gt; [5/7] TRANSACTIONAL OUTBOX: Event EVT-501 recorded atomically with TX-9041A in simulated DB (status=PENDING).'
    },
    {
        num: 6,
        code: 'ASYNCHRONOUS MESSAGING',
        shortBadge: 'ASYNC',
        summary: 'Separates Outbox Relay publication (PUBLISHED) from consumer processing (CONSUMED + event_id deduplication).',
        detail: 'Simulated locally (no live broker). Models At-Least-Once delivery where consumer deduplication guards against redeliveries.',
        log: '&gt; [6/7] ASYNCHRONOUS MESSAGING: Local sim relay published EVT-501 -&gt; Consumer verified event_id &amp; acknowledged (At-Least-Once).'
    },
    {
        num: 7,
        code: 'RESULT',
        shortBadge: 'RESULT',
        summary: 'Synthetic authorization flow completed: TX-9041A approved, response snapshot cached under idem-a104-9c82, and Outbox event processed.',
        detail: 'All stages executed in the local browser simulator. Use "Explore the payment flow" below to test duplicate retries and broker outages.',
        log: '&gt; [7/7] RESULT: Synthetic flow complete (TX-9041A | SIMULATED APPROVAL | Outbox EVT-501 consumed).'
    }
];

function clearHeroTimers() {
    heroTimers.forEach(t => clearTimeout(t));
    heroTimers = [];
}

function initHeroPreview() {
    const container = document.getElementById('hero-orionpay-card');
    if (!container) return;
    resetHeroPreviewDemo();
}

function renderHeroPreviewUI(inspectedIndex = null) {
    const stagesGrid = document.getElementById('hero-stages-list');
    const activeDetail = document.getElementById('hero-stage-detail');
    const resultBanner = document.getElementById('hero-result-banner');
    const statusPill = document.getElementById('hero-sim-status-pill');
    const btnRun = document.getElementById('btn-hero-run');

    if (!stagesGrid) return;

    const focusIdx = inspectedIndex !== null ? inspectedIndex : (heroCurrentStage >= 0 ? heroCurrentStage : 0);

    stagesGrid.innerHTML = HERO_PREVIEW_STAGES.map((stg, idx) => {
        let stateText = 'IDLE';
        let badgeStyle = 'bg-slate-800/90 text-slate-400 border-slate-700';
        let rowStyle = 'border-[#152342] bg-[#040711]/80 text-slate-300';

        if (idx < heroCurrentStage || (idx === heroCurrentStage && heroPreviewState === 'COMPLETED')) {
            stateText = 'DONE';
            badgeStyle = 'bg-emerald-950 text-[#00D47E] border-[#00D47E]/40';
            rowStyle = 'border-[#00D47E]/40 bg-[#071526] text-white';
        } else if (idx === heroCurrentStage && heroPreviewState === 'RUNNING') {
            stateText = 'ACTIVE';
            badgeStyle = 'bg-cyan-500 text-slate-950 border-cyan-300';
            rowStyle = 'border-cyan-400 bg-[#0A1931] text-white shadow-md';
        }

        const isFocused = (idx === focusIdx && heroCurrentStage >= 0) || (idx === inspectedIndex);
        const focusRing = isFocused ? 'ring-1 ring-cyan-400/60' : '';

        return `
            <button type="button"
                    onclick="inspectHeroStage(${idx})"
                    aria-label="Stage ${stg.num}: ${stg.code} - Status: ${stateText}"
                    class="w-full text-left px-2.5 py-1.5 rounded-lg border ${rowStyle} ${focusRing} hover:border-cyan-400/60 transition-all flex items-center justify-between gap-2 font-mono">
                <span class="text-[11px] font-bold truncate">
                    <span class="text-cyan-400">${stg.num}.</span> ${stg.code}
                </span>
                <span class="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold border ${badgeStyle}">
                    ${stateText}
                </span>
            </button>
        `;
    }).join('');

    if (activeDetail) {
        if (heroCurrentStage === -1 && inspectedIndex === null) {
            activeDetail.innerHTML = `
                <div class="flex items-center justify-between text-[10px] font-mono text-slate-400">
                    <span class="text-cyan-300 font-bold">STAGE INSPECTOR (READY)</span>
                    <span>LOCAL BROWSER STATE MACHINE</span>
                </div>
                <p class="text-xs text-slate-200 mt-1 leading-relaxed">
                    Click <strong class="text-[#00D47E]">"Run Demo"</strong> to execute the 7-stage synthetic authorization walkthrough, or select any stage above to inspect its engineering role.
                </p>
                <p class="text-[11px] text-slate-400 mt-1 leading-snug">
                    Payload ready: <code class="text-cyan-300">BRL 84.50</code> &bull; <code class="text-cyan-300">idem-a104-9c82</code> &bull; <code class="text-cyan-300">tok_synth_4091</code> (Non-sensitive synthetic data).
                </p>
            `;
        } else {
            const stg = HERO_PREVIEW_STAGES[focusIdx] || HERO_PREVIEW_STAGES[0];
            const modeLabel = (focusIdx <= heroCurrentStage) ? 'EXECUTED IN LOCAL SIM' : 'STAGE PREVIEW';
            activeDetail.innerHTML = `
                <div class="flex items-center justify-between text-[10px] font-mono">
                    <span class="text-[#00D47E] font-bold">${stg.num}. ${stg.code}</span>
                    <span class="text-slate-400">${modeLabel}</span>
                </div>
                <p class="text-xs text-slate-200 mt-1 leading-relaxed">${stg.summary}</p>
                <p class="text-[11px] text-slate-400 mt-1 leading-snug">${stg.detail}</p>
            `;
        }
    }

    if (resultBanner) {
        if (heroPreviewState === 'COMPLETED') {
            resultBanner.className = 'px-3 py-2 rounded-lg border border-[#00D47E]/50 bg-emerald-950/40 font-mono text-[11px] flex items-center justify-between gap-2';
            resultBanner.innerHTML = `
                <span class="text-[#00D47E] font-bold flex items-center gap-1.5">
                    <span class="w-2 h-2 rounded-full bg-[#00D47E]"></span>
                    RESULT: SIMULATED APPROVAL (TX-9041A)
                </span>
                <span class="text-slate-300 text-[10px]">Outbox EVT-501 Relayed &amp; Consumed</span>
            `;
        } else if (heroPreviewState === 'RUNNING') {
            resultBanner.className = 'px-3 py-2 rounded-lg border border-cyan-500/40 bg-cyan-950/30 font-mono text-[11px] flex items-center justify-between gap-2';
            resultBanner.innerHTML = `
                <span class="text-cyan-300 font-bold">EXECUTING STAGE ${heroCurrentStage + 1} OF 7...</span>
                <span class="text-slate-400 text-[10px]">Pending completion</span>
            `;
        } else {
            resultBanner.className = 'px-3 py-2 rounded-lg border border-[#152342] bg-[#040711] font-mono text-[11px] flex items-center justify-between gap-2';
            resultBanner.innerHTML = `
                <span class="text-slate-400">RESULT: AWAITING EXECUTION</span>
                <span class="text-slate-500 text-[10px]">No authorization result generated yet</span>
            `;
        }
    }

    if (statusPill) {
        if (heroPreviewState === 'RUNNING') {
            statusPill.textContent = `RUNNING (${heroCurrentStage + 1}/7)`;
            statusPill.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/40 font-bold';
        } else if (heroPreviewState === 'COMPLETED') {
            statusPill.textContent = 'COMPLETED (7/7)';
            statusPill.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950 text-[#00D47E] border border-[#00D47E]/40 font-bold';
        } else {
            statusPill.textContent = 'IDLE (0/7)';
            statusPill.className = 'text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700 font-bold';
        }
    }

    if (btnRun) {
        const isRunning = heroPreviewState === 'RUNNING';
        btnRun.disabled = isRunning;
        if (isRunning) {
            btnRun.classList.add('opacity-50', 'cursor-not-allowed');
        } else {
            btnRun.classList.remove('opacity-50', 'cursor-not-allowed');
        }
    }
}

function inspectHeroStage(idx) {
    if (idx < 0 || idx >= HERO_PREVIEW_STAGES.length) return;
    renderHeroPreviewUI(idx);
}

function runHeroPreviewDemo() {
    if (heroPreviewState === 'RUNNING') return;
    clearHeroTimers();

    heroPreviewState = 'RUNNING';
    heroCurrentStage = -1;

    const logEl = document.getElementById('hero-terminal-log');
    if (logEl) {
        logEl.innerHTML = `<div class="text-slate-400">// Starting local synthetic authorization sequence...</div>`;
    }

    const stepDelayMs = prefersReducedMotion() ? 60 : 420;

    function advanceHeroStage() {
        const nextIdx = heroCurrentStage + 1;
        if (nextIdx >= HERO_PREVIEW_STAGES.length) {
            heroPreviewState = 'COMPLETED';
            renderHeroPreviewUI();
            return;
        }

        heroCurrentStage = nextIdx;
        const stg = HERO_PREVIEW_STAGES[nextIdx];
        if (logEl) {
            const line = document.createElement('div');
            line.className = nextIdx === HERO_PREVIEW_STAGES.length - 1 ? 'text-[#00D47E] font-bold' : 'text-slate-300';
            line.innerHTML = stg.log;
            logEl.appendChild(line);
            logEl.scrollTop = logEl.scrollHeight;
        }

        renderHeroPreviewUI();

        if (nextIdx < HERO_PREVIEW_STAGES.length - 1) {
            const tid = setTimeout(advanceHeroStage, stepDelayMs);
            heroTimers.push(tid);
        } else {
            heroPreviewState = 'COMPLETED';
            renderHeroPreviewUI();
        }
    }

    advanceHeroStage();
}

function resetHeroPreviewDemo() {
    clearHeroTimers();
    heroPreviewState = 'IDLE';
    heroCurrentStage = -1;

    const logEl = document.getElementById('hero-terminal-log');
    if (logEl) {
        logEl.innerHTML = `
            <div class="text-slate-400">// Local browser simulation standby (no external network calls)</div>
            <div class="text-slate-300">&gt; Click <strong class="text-white">"Run Demo"</strong> to execute stages 1–7 with synthetic data.</div>
        `;
    }

    renderHeroPreviewUI();
}

function exploreFullSimulatorFlow() {
    if (typeof selectScenario === 'function' && simState === 'IDLE') {
        selectScenario('scenario-a', false);
    }
    const simSection = document.getElementById('simulator');
    if (simSection && typeof simSection.scrollIntoView === 'function') {
        simSection.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }
}
