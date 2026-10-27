/**
 * OrionPay Datadog - Interactive Architectural Pipeline & Transactional Outbox Simulator
 * Complete with indicative directional arrows, dynamic recalculation on resize,
 * live packet animation traversal, and real-time telemetry.
 * 
 * Francisco Araújo | Senior Backend Engineer • Java & Payment Systems
 */

let isSimulating = false;
let liveTxCount = 0;
let liveVolume = 0.00;
let pendingDbCount = 0;
let queueRmqCount = 0;
let timelineTimer = null;

// Directional connection pipes configuration
const ARCH_PIPES = [
    // Phase 1: Synchronous Authorization (Horizontal & Vertical HSM)
    { id: 'pipe-pos-merchant', from: 'node-softpos', to: 'node-merchant', dir: 'right', color: '#38BDF8', marker: 'arrow-cyan' },
    { id: 'pipe-merchant-switch', from: 'node-merchant', to: 'node-switch', dir: 'right', color: '#C084FC', marker: 'arrow-purple' },
    { id: 'pipe-switch-softhsm', from: 'node-switch', to: 'node-softhsm', dir: 'up', color: '#F87171', marker: 'arrow-red', offset: -12 },
    { id: 'pipe-softhsm-switch', from: 'node-softhsm', to: 'node-switch', dir: 'down', color: '#60A5FA', marker: 'arrow-blue', offset: 12 },
    { id: 'pipe-switch-visa', from: 'node-switch', to: 'node-visagateway', dir: 'right', color: '#60A5FA', marker: 'arrow-blue' },
    { id: 'pipe-visa-visanet', from: 'node-visagateway', to: 'node-visanet', dir: 'right', color: '#3B82F6', marker: 'arrow-blue' },

    // Inter-Phase 1 -> 2: Orchestration & Commit
    { id: 'pipe-merchant-db', from: 'node-merchant', to: 'node-dboutbox', dir: 'down-step', color: '#A855F7', marker: 'arrow-purple' },
    { id: 'pipe-switch-relay', from: 'node-switch', to: 'node-outboxrelay', dir: 'down-step', color: '#FB923C', marker: 'arrow-orange' },

    // Phase 2: Asynchronous Messaging (Transactional Outbox & CDC)
    { id: 'pipe-db-relay', from: 'node-dboutbox', to: 'node-outboxrelay', dir: 'right', color: '#818CF8', marker: 'arrow-purple' },
    { id: 'pipe-relay-rmq', from: 'node-outboxrelay', to: 'node-rabbitmq', dir: 'right', color: '#FB923C', marker: 'arrow-orange' },
    { id: 'pipe-rmq-listener', from: 'node-rabbitmq', to: 'node-settlementlistener', dir: 'right', color: '#F59E0B', marker: 'arrow-amber' },

    // Inter-Phase: Scheme Confirmation -> Settlement Listener
    { id: 'pipe-visanet-listener', from: 'node-visanet', to: 'node-settlementlistener', dir: 'down-step', color: '#00D47E', marker: 'arrow-green' },

    // Phase 3: Batch Settlement & Reconciliation (Batch / Pull)
    { id: 'pipe-relay-tc57', from: 'node-outboxrelay', to: 'node-tc57log', dir: 'down-step', color: '#64748B', marker: 'arrow-slate' },
    { id: 'pipe-tc57-batch', from: 'node-tc57log', to: 'node-springbatch', dir: 'down-step', color: '#FBBF24', marker: 'arrow-amber' },
    { id: 'pipe-batch-payout', from: 'node-springbatch', to: 'node-payout', dir: 'right', color: '#00D47E', marker: 'arrow-green' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Initial draw of directional arrows after layout settles
    setTimeout(() => {
        drawArchitectureArrows();
    }, 300);

    // Redraw on window resize or orientation change
    window.addEventListener('resize', () => {
        drawArchitectureArrows();
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
});

/**
 * Draw all connecting paths and directional arrowheads dynamically
 */
function drawArchitectureArrows() {
    const container = document.getElementById('arch-mesh-area');
    const group = document.getElementById('arch-connections-group');
    if (!container || !group) return;

    const cRect = container.getBoundingClientRect();
    let svgHtml = '';

    ARCH_PIPES.forEach(pipe => {
        const fromEl = document.getElementById(pipe.from);
        const toEl = document.getElementById(pipe.to);
        if (!fromEl || !toEl) return;

        const fRect = fromEl.getBoundingClientRect();
        const tRect = toEl.getBoundingClientRect();

        let x1, y1, x2, y2, d;

        if (pipe.dir === 'right') {
            x1 = fRect.right - cRect.left;
            y1 = fRect.top + fRect.height / 2 - cRect.top;
            x2 = tRect.left - cRect.left - 5;
            y2 = tRect.top + tRect.height / 2 - cRect.top;

            if (Math.abs(y1 - y2) < 4) {
                d = `M ${x1} ${y1} L ${x2} ${y2}`;
            } else {
                const midX = (x1 + x2) / 2;
                d = `M ${x1} ${y1} L ${midX} ${y1} L ${midX} ${y2} L ${x2} ${y2}`;
            }
        } else if (pipe.dir === 'up') {
            const offsetX = pipe.offset || 0;
            x1 = fRect.left + fRect.width / 2 - cRect.left + offsetX;
            y1 = fRect.top - cRect.top;
            x2 = tRect.left + tRect.width / 2 - cRect.left + offsetX;
            y2 = tRect.bottom - cRect.top + 5;
            d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (pipe.dir === 'down') {
            const offsetX = pipe.offset || 0;
            x1 = fRect.left + fRect.width / 2 - cRect.left + offsetX;
            y1 = fRect.bottom - cRect.top;
            x2 = tRect.left + tRect.width / 2 - cRect.left + offsetX;
            y2 = tRect.top - cRect.top - 5;
            d = `M ${x1} ${y1} L ${x2} ${y2}`;
        } else if (pipe.dir === 'down-step') {
            x1 = fRect.left + fRect.width / 2 - cRect.left;
            y1 = fRect.bottom - cRect.top;
            x2 = tRect.left + tRect.width / 2 - cRect.left;
            y2 = tRect.top - cRect.top - 5;

            if (Math.abs(x1 - x2) < 6) {
                d = `M ${x1} ${y1} L ${x2} ${y2}`;
            } else {
                const midY = (y1 + y2) / 2;
                d = `M ${x1} ${y1} L ${x1} ${midY} L ${x2} ${midY} L ${x2} ${y2}`;
            }
        }

        svgHtml += `
            <path id="${pipe.id}" 
                  class="arch-connector-line" 
                  d="${d}" 
                  stroke="${pipe.color}" 
                  marker-end="url(#${pipe.marker})" />
        `;
    });

    group.innerHTML = svgHtml;
}

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

    clearNodeHighlights();
    clearPipeHighlights();

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

    // 1. SoftPOS -> Merchant Service
    movePacketToNode('node-softpos', token, () => {
        highlightNode('node-softpos', '#38BDF8');
        highlightPipe('pipe-pos-merchant');
        logConsole(consoleOut, `&gt; [00:00:02] SoftPOS: Generated EMV TLV ARQC cryptogram. Encapsulating payload.`);
    });

    setTimeout(() => {
        movePacketToNode('node-merchant', token, () => {
            highlightNode('node-merchant', '#C084FC');
            highlightPipe('pipe-merchant-switch');
            logConsole(consoleOut, `&gt; [00:00:04] Merchant Service: Orchestrator validated Merchant ID &amp; API Auth. Forwarding to Switch.`);
        });
    }, 700);

    // 2. Merchant -> Switch Adq
    setTimeout(() => {
        movePacketToNode('node-switch', token, () => {
            highlightNode('node-switch', '#60A5FA');
            highlightPipe('pipe-switch-softhsm');
            logConsole(consoleOut, `&gt; [00:00:06] Switch Adq (C++): Parsing binary ISO 8583 MTI 0100. Acquired ShedLock.`);
        });
    }, 1400);

    // 3. Switch -> SoftHSM
    setTimeout(() => {
        movePacketToNode('node-softhsm', token, () => {
            highlightNode('node-softhsm', '#F87171');
            highlightPipe('pipe-softhsm-switch');
            logConsole(consoleOut, `&gt; [00:00:08] SoftHSM (C++ Socket): Decrypted TMK PIN block -&gt; Derived Scheme ZPK key via DUKPT.`);
        });
    }, 2100);

    // 4. SoftHSM -> Switch -> Gateway Visa
    setTimeout(() => {
        movePacketToNode('node-switch', token, () => {
            highlightNode('node-switch', '#60A5FA');
            highlightPipe('pipe-switch-visa');
        });
    }, 2700);

    setTimeout(() => {
        movePacketToNode('node-visagateway', token, () => {
            highlightNode('node-visagateway', '#3B82F6');
            highlightPipe('pipe-visa-visanet');
            logConsole(consoleOut, `&gt; [00:00:10] Gateway Visa: Formatted Base I 0100 packet. Forwarding across network.`);
        });
    }, 3300);

    // 5. Gateway Visa -> VisaNet (Scheme Response)
    setTimeout(() => {
        movePacketToNode('node-visanet', token, () => {
            highlightNode('node-visanet', '#00D47E');
            highlightPipe('pipe-merchant-db');
            highlightPipe('pipe-switch-relay');
            logConsole(consoleOut, `&gt; [00:00:12] VisaNet External: Returned ISO 8583 MTI 0110 - Response Code: 00 (APPROVED) - Auth: ${Math.floor(100000 + Math.random() * 900000)}`);
            
            pendingDbCount++;
            updateStatsUI();
            setNodeBadge('node-dboutbox', pendingDbCount, 'bg-red-500');
            highlightNode('node-dboutbox', '#818CF8');
            logConsole(consoleOut, `&gt; [00:00:13] DB &amp; Outbox: Committed ACID Transaction + Outbox Event payload (${txHash}).`);
        });
    }, 4000);

    // 6. Phase 2: Outbox Relay CDC
    setTimeout(() => {
        highlightPipe('pipe-db-relay');
        movePacketToNode('node-outboxrelay', token, () => {
            highlightNode('node-outboxrelay', '#FB923C');
            highlightPipe('pipe-relay-rmq');
            logConsole(consoleOut, `&gt; [00:00:14] Outbox Relay (CDC/Debezium): Read WAL record. Publishing to RabbitMQ exchange.`);
            
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
            highlightPipe('pipe-rmq-listener');
            highlightPipe('pipe-visanet-listener');
            logConsole(consoleOut, `&gt; [00:00:15] RabbitMQ: Enqueued in routing queue: 'payments.auth.completed.v1' (Durable, Quorum).`);
        });
    }, 5500);

    // 8. RabbitMQ -> Settlement Listener
    setTimeout(() => {
        movePacketToNode('node-settlementlistener', token, () => {
            highlightNode('node-settlementlistener', '#10B981');
            
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
 * Execute Phase 3: Batch Settlement & Reconciliation
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
    highlightPipe('pipe-relay-tc57');
    movePacketToNode('node-tc57log', token, () => {
        highlightNode('node-tc57log', '#94A3B8');
        highlightPipe('pipe-tc57-batch');
        logConsole(consoleOut, `&gt; [00:00:03] Log de Rede (TC57): Loaded positional clearing records from Base II interchange.`);
    });

    // Step 2: Spring Batch
    setTimeout(() => {
        movePacketToNode('node-springbatch', token, () => {
            highlightNode('node-springbatch', '#FBBF24');
            highlightPipe('pipe-batch-payout');
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

function movePacketToNode(nodeId, token, onComplete) {
    const node = document.getElementById(nodeId);
    const canvas = document.getElementById('arch-mesh-area') || document.getElementById('arch-canvas-container');
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

function highlightPipe(pipeId) {
    const pipe = document.getElementById(pipeId);
    if (!pipe) return;
    pipe.classList.add('active-pipe');
    setTimeout(() => {
        pipe.classList.remove('active-pipe');
    }, 900);
}

function clearPipeHighlights() {
    document.querySelectorAll('.arch-connector-line').forEach(p => {
        p.classList.remove('active-pipe');
    });
}

function clearNodeHighlights() {
    document.querySelectorAll('.arch-node').forEach(n => {
        n.classList.remove('active-node');
    });
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
    clearPipeHighlights();
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
