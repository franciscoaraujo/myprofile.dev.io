/**
 * Interactive ISO 8583 Protocol & Outbox Pipeline Demonstration
 * Provides an interactive step-by-step walkthrough of the payment authorization lifecycle.
 * Francisco Araújo | Senior Backend Engineer
 */

let isSimulating = false;

function runTransactionSimulation() {
    if (isSimulating) return;
    isSimulating = true;

    const btn = document.getElementById('btn-run-simulation');
    const latencyBadge = document.getElementById('sim-latency-badge');
    const consoleOut = document.getElementById('sim-console-output');
    const channelSelect = document.getElementById('sim-channel');
    const channel = channelSelect ? channelSelect.value : 'pos';

    if (btn) {
        btn.disabled = true;
        btn.classList.add('opacity-50', 'cursor-not-allowed');
    }

    // Reset step highlights
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`sim-step-${i}`);
        if (el) {
            el.classList.remove('border-[#00D47E]', 'bg-[#00D47E]/10', 'shadow-lg');
            const statusDot = el.querySelector('.step-status');
            if (statusDot) {
                statusDot.classList.remove('bg-[#00D47E]', 'animate-pulse');
                statusDot.classList.add('bg-slate-700');
            }
        }
    }

    if (consoleOut) {
        consoleOut.innerHTML = `
            <div class="text-slate-400">&gt; Establishing simulated TLS socket connection with inbound terminal (${channel.toUpperCase()})...</div>
        `;
    }

    if (latencyBadge) {
        latencyBadge.textContent = "SIMULATION RUNNING (ISO 8583 PIPELINE)...";
        latencyBadge.className = "text-cyan-400 font-bold animate-pulse";
    }

    const txHash = 'TX-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Step 1: Inbound Capture
    setTimeout(() => {
        activateSimStep(1);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-cyan-300">&gt; [Step 1: 18ms] Terminal Inbound: Received MTI 0100 (Auth Request) - Processing Code: 000000 (Purchase)</div>
            `;
        }
    }, 300);

    // Step 2: SoftHSM C++ PIN Block Translation
    setTimeout(() => {
        activateSimStep(2);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-amber-300">&gt; [Step 2: 64ms] SoftHSM C++ Socket: Ingested TMK PIN Block -&gt; Translated to Scheme ZPK (KCV validated: A3F89C)</div>
            `;
        }
    }, 800);

    // Step 3: Switch Core Distributed Lock
    setTimeout(() => {
        activateSimStep(3);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-slate-200">&gt; [Step 3: 95ms] Switch Core: Acquired distributed ShedLock [lock_key: tx-terminal-seq]. Enforcing idempotency.</div>
            `;
        }
    }, 1300);

    // Step 4: Card Scheme Emulator (VisaNet Base I)
    setTimeout(() => {
        activateSimStep(4);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-[#00D47E]">&gt; [Step 4: 142ms] VisaNet Emulator: Returned ISO 8583 MTI 0110 - RC: 00 (Approved) - Auth Code: 839210</div>
            `;
        }
    }, 1800);

    // Step 5: Transactional Outbox & Ledger Settlement
    setTimeout(() => {
        activateSimStep(5);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-[#00D47E] font-bold">&gt; [Step 5: 168ms] Outbox Event Persisted: ${txHash} committed to PostgreSQL ACID table and queued for RabbitMQ CDC relay!</div>
            `;
        }

        if (latencyBadge) {
            latencyBadge.textContent = "SIMULATED CYCLE COMPLETED (~168ms in test harness)";
            latencyBadge.className = "text-[#00D47E] font-bold";
        }

        if (btn) {
            btn.disabled = false;
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
        }
        isSimulating = false;
    }, 2300);
}

function activateSimStep(stepNumber) {
    const el = document.getElementById(`sim-step-${stepNumber}`);
    if (!el) return;
    el.classList.add('border-[#00D47E]', 'bg-[#00D47E]/10', 'shadow-lg');
    const statusDot = el.querySelector('.step-status');
    if (statusDot) {
        statusDot.classList.remove('bg-slate-700');
        statusDot.classList.add('bg-[#00D47E]', 'animate-pulse');
    }
}
