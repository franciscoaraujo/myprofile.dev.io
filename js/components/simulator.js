/**
 * OrionPay Datadog - Interactive Architectural Pipeline & Transactional Outbox Simulator
 * Faithful replication of the 3-phase distributed payment architecture:
 * Phase 1: Synchronous Authorization (ISO 8583 / SoftHSM / VisaNet)
 * Phase 2: Asynchronous Messaging (PostgreSQL Outbox -> Debezium CDC -> RabbitMQ -> Settlement Listener)
 * Phase 3: Batch Settlement & Reconciliation (TC57 -> Spring Batch -> Payout & Ledger)
 * 
 * Francisco Araújo | Senior Backend Engineer • Java & Payment Systems
 */

let isSimulating = false;
let liveTxCount = 0;
let liveVolume = 0.00;
let pendingDbCount = 0;
let queueRmqCount = 0;
let timelineTimer = null;

document.addEventListener('DOMContentLoaded', () => {
    // Re-initialize Lucide icons if dynamically updated
    if (window.lucide) {
        window.lucide.createIcons();
    }
});

/**
 * Trigger simulation flow: 'auth' (Synchronous + Outbox) or 'settle' (Batch Reconciliation)
 */
function runTransactionSimulation(mode = 'auth') {
    if (isSimulating) return;
    isSimulating = true;

    const btnFire = document.getElementById('btn-fire-tx');
    const btnSettle = document.getElementById('btn-fire-settle');
    const latencyBadge = document.getElementById('sim-latency-badge');
    const consoleOut = document.getElementById('sim-console-output');
    const token = document.getElementById('data-packet-token');
    const timelineProgress = document.getElementById('sim-timeline-progress');
    const timelineTime = document.getElementById('sim-timeline-time');

    if (btnFire) btnFire.classList.add('opacity-50', 'cursor-not-allowed');
    if (btnSettle) btnSettle.classList.add('opacity-50', 'cursor-not-allowed');

    // Reset visual highlights
    clearNodeHighlights();

    if (mode === 'auth') {
        runAuthPipeline({ token, consoleOut, latencyBadge, timelineProgress, timelineTime, btnFire, btnSettle });
    } else {
        runBatchPipeline({ token, consoleOut, latencyBadge, timelineProgress, timelineTime, btnFire, btnSettle });
    }
}

/**
 * Execute Phase 1 (Synchronous Authorization) followed by Phase 2 (Transactional Outbox CDC)
 */
function runAuthPipeline({ token, consoleOut, latencyBadge, timelineProgress, timelineTime, btnFire, btnSettle }) {
    const txAmount = (Math.random() * (120 - 15) + 15).toFixed(2);
    const txHash = 'TX-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    if (latencyBadge) {
        latencyBadge.textContent = "SYNCHRONOUS AUTH PIPELINE IN FLIGHT...";
        latencyBadge.className = "text-cyan-400 font-bold animate-pulse";
    }

    if (consoleOut) {
        consoleOut.innerHTML = `
            <div class="text-slate-400">&gt; [00:00:00] Inbound Contactless Tap detected on SoftPOS terminal. Amount: R$ ${txAmount}</div>
        `;
    }

    animateTimeline(16, timelineProgress, timelineTime);

    // Sequence of nodes with timing
    // 1. SoftPOS -> Merchant Service
    movePacketToNode('node-softpos', token, () => {
        highlightNode('node-softpos', '#38BDF8');
        logConsole(consoleOut, `&gt; [00:00:02] SoftPOS: Generated EMV TLV ARQC cryptogram. Encapsulating payload.`);
    });

    setTimeout(() => {
        movePacketToNode('node-merchant', token, () => {
            highlightNode('node-merchant', '#C084FC');
            logConsole(consoleOut, `&gt; [00:00:04] Merchant Service: Orchestrator validated Merchant ID &amp; API Auth. Forwarding to Switch.`);
        });
    }, 700);

    // 2. Merchant -> Switch Adq
    setTimeout(() => {
        movePacketToNode('node-switch', token, () => {
            highlightNode('node-switch', '#60A5FA');
            logConsole(consoleOut, `&gt; [00:00:06] Switch Adq (C++): Parsing binary ISO 8583 MTI 0100. Acquired ShedLock.`);
        });
    }, 1400);

    // 3. Switch -> SoftHSM (Crypto PIN Translation)
    setTimeout(() => {
        movePacketToNode('node-softhsm', token, () => {
            highlightNode('node-softhsm', '#F87171');
            logConsole(consoleOut, `&gt; [00:00:08] SoftHSM (C++ Socket): Decrypted TMK PIN block -&gt; Derived Scheme ZPK key via DUKPT.`);
        });
    }, 2100);

    // 4. SoftHSM returns to Switch -> Gateway Visa
    setTimeout(() => {
        movePacketToNode('node-switch', token, () => {
            highlightNode('node-switch', '#60A5FA');
        });
    }, 2700);

    setTimeout(() => {
        movePacketToNode('node-visagateway', token, () => {
            highlightNode('node-visagateway', '#3B82F6');
            logConsole(consoleOut, `&gt; [00:00:10] Gateway Visa: Formatted Base I 0100 packet. Forwarding across network.`);
        });
    }, 3300);

    // 5. Gateway Visa -> VisaNet (External Scheme)
    setTimeout(() => {
        movePacketToNode('node-visanet', token, () => {
            highlightNode('node-visanet', '#00D47E');
            logConsole(consoleOut, `&gt; [00:00:12] VisaNet External: Returned ISO 8583 MTI 0110 - Response Code: 00 (APPROVED) - Auth: ${Math.floor(100000 + Math.random() * 900000)}`);
            
            // Increment DB stuck counter before outbox relay picks it up
            pendingDbCount++;
            updateStatsUI();
            setNodeBadge('node-dboutbox', pendingDbCount, 'bg-red-500');
            highlightNode('node-dboutbox', '#818CF8');
            logConsole(consoleOut, `&gt; [00:00:13] DB &amp; Outbox: Committed ACID Transaction + Outbox Event payload (${txHash}).`);
        });
    }, 4000);

    // 6. Phase 2: Asynchronous Outbox Relay (Debezium Worker)
    setTimeout(() => {
        movePacketToNode('node-outboxrelay', token, () => {
            highlightNode('node-outboxrelay', '#FB923C');
            logConsole(consoleOut, `&gt; [00:00:14] Outbox Relay (CDC/Debezium): Read WAL record. Publishing to RabbitMQ exchange.`);
            
            // Deduct pending DB, add to RabbitMQ
            pendingDbCount = Math.max(0, pendingDbCount - 1);
            queueRmqCount++;
            updateStatsUI();
            setNodeBadge('node-dboutbox', pendingDbCount, 'bg-red-500');
            setNodeBadge('node-rabbitmq', queueRmqCount, 'bg-amber-500');
        });
    }, 4800);

    // 7. Outbox Relay -> RabbitMQ
    setTimeout(() => {
        movePacketToNode('node-rabbitmq', token, () => {
            highlightNode('node-rabbitmq', '#F59E0B');
            logConsole(consoleOut, `&gt; [00:00:15] RabbitMQ: Enqueued in routing queue: 'payments.auth.completed.v1' (Durable, Quorum).`);
        });
    }, 5500);

    // 8. RabbitMQ -> Settlement Listener
    setTimeout(() => {
        movePacketToNode('node-settlementlistener', token, () => {
            highlightNode('node-settlementlistener', '#10B981');
            
            // Listener consumed message
            queueRmqCount = Math.max(0, queueRmqCount - 1);
            liveTxCount++;
            liveVolume += parseFloat(txAmount);
            updateStatsUI();
            setNodeBadge('node-rabbitmq', queueRmqCount, 'bg-amber-500');

            logConsole(consoleOut, `&gt; [00:00:16] Settlement Listener: Event acknowledged. Merchant balance pre-allocated. Flow COMPLETE!`);
            
            if (latencyBadge) {
                latencyBadge.textContent = `COMPLETED • MTI 0100 &rarr; 0110 OK (~148ms Network Window)`;
                latencyBadge.className = "text-[#00D47E] font-bold";
            }

            finishSimulation(btnFire, btnSettle, token);
        });
    }, 6200);
}

/**
 * Execute Phase 3: Batch Settlement & Reconciliation (TC57 -> Spring Batch -> Payout Ledger)
 */
function runBatchPipeline({ token, consoleOut, latencyBadge, timelineProgress, timelineTime, btnFire, btnSettle }) {
    if (latencyBadge) {
        latencyBadge.textContent = "BATCH RECONCILIATION & SETTLEMENT PIPELINE RUNNING...";
        latencyBadge.className = "text-amber-400 font-bold animate-pulse";
    }

    if (consoleOut) {
        consoleOut.innerHTML = `
            <div class="text-amber-300">&gt; [00:00:00] Triggering Phase 3: Overnight Batch Settlement Job (Spring Batch)...</div>
        `;
    }

    animateTimeline(10, timelineProgress, timelineTime);

    // Step 1: Log de Rede TC57
    movePacketToNode('node-tc57log', token, () => {
        highlightNode('node-tc57log', '#94A3B8');
        logConsole(consoleOut, `&gt; [00:00:03] Log de Rede (TC57): Loaded positional clearing records from Base II interchange.`);
    });

    // Step 2: Spring Batch
    setTimeout(() => {
        movePacketToNode('node-springbatch', token, () => {
            highlightNode('node-springbatch', '#FBBF24');
            logConsole(consoleOut, `&gt; [00:00:06] Spring Batch: Chunk processing (commit-interval: 500) &amp; fee calculation. ShedLock active.`);
        });
    }, 1500);

    // Step 3: Payout & Ledger
    setTimeout(() => {
        movePacketToNode('node-payout', token, () => {
            highlightNode('node-payout', '#00D47E');
            logConsole(consoleOut, `&gt; [00:00:09] Payout &amp; Ledger: Double-entry ledger booked. Net settlement transferred to merchant accounts.`);

            if (latencyBadge) {
                latencyBadge.textContent = "BATCH SETTLEMENT COMPLETED • LEDGER BALANCED";
                latencyBadge.className = "text-[#00D47E] font-bold";
            }

            finishSimulation(btnFire, btnSettle, token);
        });
    }, 3000);
}

/**
 * Helpers for visual animation and node positioning
 */
function movePacketToNode(nodeId, token, onComplete) {
    const node = document.getElementById(nodeId);
    const canvas = document.getElementById('arch-canvas-container');
    if (!node || !canvas || !token) {
        if (onComplete) onComplete();
        return;
    }

    const canvasRect = canvas.getBoundingClientRect();
    const nodeRect = node.getBoundingClientRect();

    const targetX = (nodeRect.left + nodeRect.width / 2) - canvasRect.left;
    const targetY = (nodeRect.top + nodeRect.height / 2) - canvasRect.top;

    token.style.opacity = '1';
    token.style.left = `${targetX}px`;
    token.style.top = `${targetY}px`;

    setTimeout(() => {
        if (onComplete) onComplete();
    }, 400);
}

function highlightNode(nodeId, colorHex) {
    const node = document.getElementById(nodeId);
    if (!node) return;
    node.classList.add('active-node');
    node.style.borderColor = colorHex;
    node.style.boxShadow = `0 0 20px ${colorHex}80`;

    setTimeout(() => {
        node.classList.remove('active-node');
    }, 800);
}

function setNodeBadge(nodeId, count, bgClass) {
    const node = document.getElementById(nodeId);
    if (!node) return;
    let badge = node.querySelector('.node-badge');
    if (count > 0) {
        if (!badge) {
            badge = document.createElement('span');
            badge.className = `node-badge absolute -top-2 -right-2 w-5 h-5 rounded-full text-white text-[10px] font-bold font-mono flex items-center justify-center shadow-lg arch-badge-pulse ${bgClass}`;
            node.appendChild(badge);
        }
        badge.textContent = count;
        badge.style.display = 'flex';
    } else if (badge) {
        badge.style.display = 'none';
    }
}

function clearNodeHighlights() {
    const nodes = document.querySelectorAll('.arch-node');
    nodes.forEach(n => {
        n.classList.remove('active-node');
    });
}

function updateStatsUI() {
    const elLive = document.getElementById('stat-live-tx');
    const elVol = document.getElementById('stat-volume');
    const elDb = document.getElementById('stat-db-stuck');
    const elRmq = document.getElementById('stat-rmq-queue');

    if (elLive) elLive.textContent = liveTxCount;
    if (elVol) elVol.textContent = liveVolume.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    if (elDb) elDb.textContent = pendingDbCount;
    if (elRmq) elRmq.textContent = queueRmqCount;
}

function logConsole(consoleOut, messageHtml) {
    if (!consoleOut) return;
    const div = document.createElement('div');
    div.innerHTML = messageHtml;
    consoleOut.appendChild(div);
    consoleOut.scrollTop = consoleOut.scrollHeight;
}

function animateTimeline(durationSec, timelineProgress, timelineTime) {
    if (timelineTimer) clearInterval(timelineTimer);
    let currentSec = 0;
    if (timelineProgress) timelineProgress.style.width = '0%';
    if (timelineTime) timelineTime.textContent = '00:00:00';

    timelineTimer = setInterval(() => {
        currentSec++;
        const percent = Math.min(100, (currentSec / durationSec) * 100);
        if (timelineProgress) timelineProgress.style.width = `${percent}%`;
        const formattedSec = currentSec < 10 ? `0${currentSec}` : `${currentSec}`;
        if (timelineTime) timelineTime.textContent = `00:00:${formattedSec}`;

        if (currentSec >= durationSec) {
            clearInterval(timelineTimer);
        }
    }, 400);
}

function finishSimulation(btnFire, btnSettle, token) {
    setTimeout(() => {
        if (btnFire) btnFire.classList.remove('opacity-50', 'cursor-not-allowed');
        if (btnSettle) btnSettle.classList.remove('opacity-50', 'cursor-not-allowed');
        if (token) token.style.opacity = '0';
        isSimulating = false;
    }, 1000);
}

function resetSimulationStats() {
    liveTxCount = 0;
    liveVolume = 0.00;
    pendingDbCount = 0;
    queueRmqCount = 0;
    updateStatsUI();
    setNodeBadge('node-dboutbox', 0);
    setNodeBadge('node-rabbitmq', 0);
    const consoleOut = document.getElementById('sim-console-output');
    if (consoleOut) {
        consoleOut.innerHTML = `<div>&gt; Pipeline telemetry reset to clean state. Ready for trigger...</div>`;
    }
}

function toggleTerminalView() {
    const term = document.getElementById('sim-terminal-container');
    if (!term) return;
    term.classList.toggle('hidden');
}
