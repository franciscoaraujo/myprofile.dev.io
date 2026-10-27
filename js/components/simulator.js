/**
 * OrionPay Datadog - Interactive Architectural Pipeline & Transactional Outbox Simulator
 * Directional arrows positioned in the middle between cards (not at the end of cards),
 * with the glowing data packet traveling strictly on top of the connecting lines & arrows,
 * traversing through the center of each service card.
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
    { id: 'pipe-pos-merchant', from: 'node-softpos', to: 'node-merchant', dir: 'right', color: '#38BDF8' },
    { id: 'pipe-merchant-switch', from: 'node-merchant', to: 'node-switch', dir: 'right', color: '#C084FC' },
    { id: 'pipe-switch-softhsm', from: 'node-switch', to: 'node-softhsm', dir: 'up', color: '#F87171', offset: -14 },
    { id: 'pipe-softhsm-switch', from: 'node-softhsm', to: 'node-switch', dir: 'down', color: '#60A5FA', offset: 14 },
    { id: 'pipe-switch-visa', from: 'node-switch', to: 'node-visagateway', dir: 'right', color: '#60A5FA' },
    { id: 'pipe-visa-visanet', from: 'node-visagateway', to: 'node-visanet', dir: 'right', color: '#3B82F6' },

    // Inter-Phase 1 -> 2: Orchestration & Commit
    { id: 'pipe-merchant-db', from: 'node-merchant', to: 'node-dboutbox', dir: 'down-step', color: '#A855F7' },
    { id: 'pipe-switch-relay', from: 'node-switch', to: 'node-outboxrelay', dir: 'down-step', color: '#FB923C' },

    // Phase 2: Asynchronous Messaging (Transactional Outbox & CDC)
    { id: 'pipe-db-relay', from: 'node-dboutbox', to: 'node-outboxrelay', dir: 'right', color: '#818CF8' },
    { id: 'pipe-relay-rmq', from: 'node-outboxrelay', to: 'node-rabbitmq', dir: 'right', color: '#FB923C' },
    { id: 'pipe-rmq-listener', from: 'node-rabbitmq', to: 'node-settlementlistener', dir: 'right', color: '#F59E0B' },

    // Inter-Phase: Scheme Confirmation -> Settlement Listener
    { id: 'pipe-visanet-listener', from: 'node-visanet', to: 'node-settlementlistener', dir: 'down-step', color: '#00D47E' },

    // Phase 3: Batch Settlement & Reconciliation (Batch / Pull)
    { id: 'pipe-relay-tc57', from: 'node-outboxrelay', to: 'node-tc57log', dir: 'down-step', color: '#64748B' },
    { id: 'pipe-tc57-batch', from: 'node-tc57log', to: 'node-springbatch', dir: 'down-step', color: '#FBBF24' },
    { id: 'pipe-batch-payout', from: 'node-springbatch', to: 'node-payout', dir: 'right', color: '#00D47E' }
];

document.addEventListener('DOMContentLoaded', () => {
    // Initial draw of directional arrows after layout settles
    setTimeout(() => {
        drawArchitectureArrows();
    }, 300);

    // Redraw on window resize
    window.addEventListener('resize', () => {
        drawArchitectureArrows();
    });

    if (window.lucide) {
        window.lucide.createIcons();
    }
});

/**
 * Draw all connecting paths and place directional arrows in the exact middle of the gap between cards
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

        // Node center coordinates
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

            // Arrow placed right in the middle between the two cards
            arrowX = (x1 + x2) / 2;
            arrowY = (y1 + y2) / 2;
            arrowAngle = 0;

            if (Math.abs(y1 - y2) < 4) {
                // Continuous path from center of card A to center of card B
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
        } else if (pipe.dir === 'down-step') {
            const y1 = (fRect.bottom - cRect.top) + container.scrollTop;
            const y2 = (tRect.top - cRect.top) + container.scrollTop;
            const midY = (y1 + y2) / 2;

            if (Math.abs(fromCenterX - toCenterX) < 6) {
                arrowX = fromCenterX;
                arrowY = midY;
                arrowAngle = 90;
                d = `M ${fromCenterX} ${fromCenterY} L ${toCenterX} ${toCenterY}`;
            } else {
                // Step path
                arrowX = fromCenterX;
                arrowY = midY;
                arrowAngle = 90;
                d = `M ${fromCenterX} ${fromCenterY} L ${fromCenterX} ${midY} L ${toCenterX} ${midY} L ${toCenterX} ${toCenterY}`;
            }
        }

        // Arrowhead polygon centered at (arrowX, arrowY)
        const arrowSvg = `
            <polygon class="arch-arrow-head" 
                     id="arrow-${pipe.id}"
                     points="-5,-5 6,0 -5,5" 
                     fill="${pipe.color}" 
                     transform="translate(${arrowX}, ${arrowY}) rotate(${arrowAngle})" />
        `;

        svgHtml += `
            <path id="${pipe.id}" 
                  class="arch-connector-line" 
                  d="${d}" 
                  stroke="${pipe.color}" />
            ${arrowSvg}
        `;
    });

    group.innerHTML = svgHtml;
}

/**
 * Animate the data packet strictly along an SVG pipe line,
 * starting inside the center of fromNode, passing right on top of the middle arrow,
 * and entering into the center of toNode.
 */
function traversePipe(pipeId, token, onComplete) {
    const pipe = ARCH_PIPES.find(p => p.id === pipeId);
    if (!pipe) {
        if (onComplete) onComplete();
        return;
    }

    const fromNode = document.getElementById(pipe.from);
    const toNode = document.getElementById(pipe.to);
    const pathEl = document.getElementById(pipe.id);
    const arrowEl = document.getElementById(`arrow-${pipe.id}`);

    if (!fromNode || !toNode || !pathEl || !token) {
        if (onComplete) onComplete();
        return;
    }

    // Highlight source node, connecting line, and middle arrowhead
    fromNode.classList.add('active-node');
    pathEl.classList.add('active-pipe');
    if (arrowEl) arrowEl.classList.add('active-pipe');

    token.style.opacity = '1';

    const totalLen = pathEl.getTotalLength();
    const pStart = pathEl.getPointAtLength(0);
    token.style.left = `${pStart.x}px`;
    token.style.top = `${pStart.y}px`;

    const duration = 550; // ms
    const startTime = performance.now();

    function step(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Move strictly along the exact geometry of the SVG path
        const pt = pathEl.getPointAtLength(totalLen * progress);
        token.style.left = `${pt.x}px`;
        token.style.top = `${pt.y}px`;

        if (progress < 1) {
            requestAnimationFrame(step);
        } else {
            // Reached inside target card
            toNode.classList.add('active-node');

            setTimeout(() => {
                fromNode.classList.remove('active-node');
                pathEl.classList.remove('active-pipe');
                if (arrowEl) arrowEl.classList.remove('active-pipe');
                if (onComplete) onComplete();
            }, 80);
        }
    }

    requestAnimationFrame(step);
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
    traversePipe('pipe-pos-merchant', token, () => {
        logConsole(consoleOut, `&gt; [00:00:02] SoftPOS: Generated EMV TLV ARQC cryptogram. Forwarding to API.`);

        // 2. Merchant -> Switch Adq
        setTimeout(() => {
            traversePipe('pipe-merchant-switch', token, () => {
                logConsole(consoleOut, `&gt; [00:00:04] Merchant Service: Orchestrator validated Merchant ID &amp; API Auth. Parsing ISO 8583 MTI 0100.`);

                // 3. Switch -> SoftHSM
                setTimeout(() => {
                    traversePipe('pipe-switch-softhsm', token, () => {
                        logConsole(consoleOut, `&gt; [00:00:06] SoftHSM (C++ Socket): Decrypted TMK PIN block -&gt; Derived Scheme ZPK key via DUKPT.`);

                        // 4. SoftHSM -> Switch
                        setTimeout(() => {
                            traversePipe('pipe-softhsm-switch', token, () => {

                                // 5. Switch -> Gateway Visa
                                setTimeout(() => {
                                    traversePipe('pipe-switch-visa', token, () => {
                                        logConsole(consoleOut, `&gt; [00:00:09] Gateway Visa: Formatted Base I 0100 packet. Forwarding across network.`);

                                        // 6. Gateway Visa -> VisaNet
                                        setTimeout(() => {
                                            traversePipe('pipe-visa-visanet', token, () => {
                                                logConsole(consoleOut, `&gt; [00:00:11] VisaNet External: Returned ISO 8583 MTI 0110 - Response Code: 00 (APPROVED) - Auth: ${Math.floor(100000 + Math.random() * 900000)}`);

                                                // Commit in DB & Outbox
                                                pendingDbCount++;
                                                updateStatsUI();
                                                setNodeBadge('node-dboutbox', pendingDbCount, 'bg-red-500');
                                                logConsole(consoleOut, `&gt; [00:00:12] DB &amp; Outbox: Committed ACID Transaction + Outbox Event (${txHash}).`);

                                                // 7. Merchant -> DB Outbox
                                                setTimeout(() => {
                                                    traversePipe('pipe-merchant-db', token, () => {

                                                        // 8. DB & Outbox -> Outbox Relay
                                                        setTimeout(() => {
                                                            traversePipe('pipe-db-relay', token, () => {
                                                                logConsole(consoleOut, `&gt; [00:00:13] Outbox Relay (CDC/Debezium): Read WAL record. Publishing to RabbitMQ exchange.`);
                                                                pendingDbCount = Math.max(0, pendingDbCount - 1);
                                                                queueRmqCount++;
                                                                updateStatsUI();
                                                                setNodeBadge('node-dboutbox', pendingDbCount, 'bg-red-500');
                                                                setNodeBadge('node-rabbitmq', queueRmqCount, 'bg-amber-500');

                                                                // 9. Outbox Relay -> RabbitMQ
                                                                setTimeout(() => {
                                                                    traversePipe('pipe-relay-rmq', token, () => {
                                                                        logConsole(consoleOut, `&gt; [00:00:14] RabbitMQ: Enqueued in routing queue: 'payments.auth.completed.v1' (Quorum).`);

                                                                        // 10. RabbitMQ -> Settlement Listener
                                                                        setTimeout(() => {
                                                                            traversePipe('pipe-rmq-listener', token, () => {
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
                                                                        }, 150);
                                                                    });
                                                                }, 150);
                                                            });
                                                        }, 150);
                                                    });
                                                }, 150);
                                            });
                                        }, 150);
                                    });
                                }, 150);
                            });
                        }, 150);
                    });
                }, 150);
            });
        }, 150);
    });
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

    // Step 1: Outbox Relay -> Log de Rede TC57
    traversePipe('pipe-relay-tc57', token, () => {
        logConsole(consoleOut, `&gt; [00:00:03] Log de Rede (TC57): Loaded positional clearing records from Base II interchange.`);

        // Step 2: Log de Rede -> Spring Batch
        setTimeout(() => {
            traversePipe('pipe-tc57-batch', token, () => {
                logConsole(consoleOut, `&gt; [00:00:06] Spring Batch: Chunk processing (commit-interval: 500) &amp; fee calculation. ShedLock active.`);

                // Step 3: Spring Batch -> Payout & Ledger
                setTimeout(() => {
                    traversePipe('pipe-batch-payout', token, () => {
                        logConsole(consoleOut, `&gt; [00:00:09] Payout &amp; Ledger: Double-entry ledger booked. Net settlement transferred to merchant accounts.`);

                        if (latencyBadge) {
                            latencyBadge.textContent = "BATCH SETTLEMENT COMPLETED • LEDGER BALANCED";
                            latencyBadge.className = "text-[#00D47E] font-bold";
                        }

                        finishSimulation(btnFire, btnSettle, token);
                    });
                }, 200);
            });
        }, 200);
    });
}

function clearPipeHighlights() {
    document.querySelectorAll('.arch-connector-line').forEach(p => {
        p.classList.remove('active-pipe');
    });
    document.querySelectorAll('.arch-arrow-head').forEach(a => {
        a.classList.remove('active-pipe');
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
        clearNodeHighlights();
        clearPipeHighlights();
        isSimulating = false;
    }, 1200);
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
    clearNodeHighlights();
    const token = document.getElementById('data-packet-token');
    if (token) token.style.opacity = '0';
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
