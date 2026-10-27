/**
 * Live Financial Switch Simulator Component
 * Simulates end-to-end authorization cycle across cryptographic and message layers
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
            <div class="text-slate-400">&gt; Iniciando handshake de conexão com o terminal (${channel.toUpperCase()})...</div>
        `;
    }

    if (latencyBadge) {
        latencyBadge.textContent = "PROCESSANDO TRANSAÇÃO...";
        latencyBadge.className = "text-cyan-400 font-bold animate-pulse";
    }

    const txHash = 'TX-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    // Step 1: Inbound Capture
    setTimeout(() => {
        activateSimStep(1);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-cyan-300">&gt; [18ms] Captura ${channel.toUpperCase()}: MTI 0100 - PAN ************4921 - PROC: 000000</div>
            `;
        }
    }, 300);

    // Step 2: SoftHSM C++ PIN Block Translation
    setTimeout(() => {
        activateSimStep(2);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-amber-300">&gt; [64ms] SoftHSM Socket: TMK descriptografado -&gt; Re-criptografado ZPK com sucesso (KCV: A3F89C)</div>
            `;
        }
    }, 800);

    // Step 3: Switch Core Distributed Lock
    setTimeout(() => {
        activateSimStep(3);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-slate-200">&gt; [95ms] Switch Core: Lock distribuído [acc-4921] via ShedLock assegurado. Sem race conditions.</div>
            `;
        }
    }, 1300);

    // Step 4: Card Scheme Emulator (VisaNet Base I)
    setTimeout(() => {
        activateSimStep(4);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-[#00D47E]">&gt; [142ms] VisaNet Emulator: Resposta ISO 8583 MTI 0110 - RC: 00 (APROVADA) - AUTH_CODE: 839210</div>
            `;
        }
    }, 1800);

    // Step 5: Transactional Outbox & Ledger Settlement
    setTimeout(() => {
        activateSimStep(5);
        if (consoleOut) {
            consoleOut.innerHTML += `
                <div class="text-[#00D47E] font-bold">&gt; [168ms] SUCESSO TOTAL: Evento ${txHash} gravado em PostgreSQL ACID e despachado ao RabbitMQ!</div>
            `;
        }

        if (latencyBadge) {
            latencyBadge.textContent = "CICLO COMPLETO CONCLUÍDO (LATÊNCIA TOTAL: 168ms)";
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
