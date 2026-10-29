/**
 * Portfolio Internationalization (i18n) Engine — English (EN) & Brazilian Portuguese (PT-BR)
 * Preserves deterministic simulator states, dynamic tabs, and lossless EN <-> PT switching.
 */

window.currentLang = localStorage.getItem('lang') === 'pt' ? 'pt' : 'en';

/**
 * Hero OrionPay 7-Stage Preview Translations (PT-BR)
 */
window.HERO_PT_STAGES = {
    'hero-stage-1': {
        shortTitle: '1. AUTHORIZATION REQUEST',
        title: '1. AUTHORIZATION REQUEST (Captura Sintética POS)',
        what: 'Recebe uma requisição sintética de pagamento contactless (`BRL 149.90`, PAN mascarado `4532 •••• 8891`) com `Idempotency-Key: idem-9f8a-7721` gerada pelo cliente.',
        why: 'Estabelece um identificador único de tentativa de requisição na borda antes de tocar no roteamento do switch ou em bloqueios de banco de dados.',
        scope: 'Execução local no navegador (`simulator.js`): nenhum cartão real ou terminal de hardware está conectado.'
    },
    'hero-stage-2': {
        shortTitle: '2. VALIDATION & CRYPTO',
        title: '2. VALIDATION & CRYPTO (ISO 8583 + SoftHSM Sim)',
        what: 'Valida os Data Elements obrigatórios da mensagem ISO 8583 `MTI 0100` (`DE3`, `DE4`, `DE11`, `DE41`, `DE52`) e simula a tradução de PIN Block `TMK -> ZPK` em memória.',
        why: 'Rejeita pacotes malformados antecipadamente e garante que dados de PIN nunca apareçam em texto aberto nos logs da aplicação.',
        scope: 'Simula validação de protocolo e tradução criptográfica localmente em JavaScript.'
    },
    'hero-stage-3': {
        shortTitle: '3. IDEMPOTENCY CHECK',
        title: '3. IDEMPOTENCY CHECK (Chave Sintética & Hash)',
        what: 'Consulta a chave `idem-9f8a-7721` e o hash SHA-256 do payload no armazenamento transacional simulado antes de invocar o autorizador.',
        why: 'Diferencia idempotência real de backend de um simples bloqueio visual de botão: se o cliente repetir a chamada após um timeout de rede, o servidor evita cobrança dupla.',
        scope: 'Simula uma tabela de bloqueio `idempotency_keys` em memória para esta sessão de demonstração.'
    },
    'hero-stage-4': {
        shortTitle: '4. TRANSACTION PERSISTENCE',
        title: '4. TRANSACTION PERSISTENCE (Registro de Autorização)',
        what: 'Após receber a aprovação sintética `MTI 0110 (DE39=00)`, prepara o registro de negócio `transactions` (`TX-84920`) para commit relacional.',
        why: 'Persiste o resultado imutável da autorização e o código de resposta para conciliação financeira e trilhas de auditoria.',
        scope: 'Diferencia o que é executado localmente (atualização de estado em memória) de um banco PostgreSQL real em produção.'
    },
    'hero-stage-5': {
        shortTitle: '5. TRANSACTIONAL OUTBOX',
        title: '5. TRANSACTIONAL OUTBOX (Mesma Transação de BD)',
        what: 'Registra o evento `outbox_events` (`EVT-501`) junto com a alteração de negócio na **mesma transação local de banco de dados** (`COMMIT`).',
        why: 'Elimina o problema de dual-write entre banco de dados e mensageria sem alegar atomicidade distribuída entre o banco e o broker.',
        scope: 'Modela o padrão Transactional Outbox localmente; nenhum broker externo é transacionado junto com o BD.'
    },
    'hero-stage-6': {
        shortTitle: '6. ASYNCHRONOUS MESSAGING',
        title: '6. ASYNCHRONOUS MESSAGING (Publicação & Consumo)',
        what: 'Demonstra a **publicação** do evento (`Outbox Relay -> Broker ACK`) e o **processamento assíncrono do consumidor** (`Settlement Listener` com deduplicação por `event_id`) como subetapas distintas.',
        why: 'Desacopla a latência de liquidação da resposta síncrona do POS e trata entregas At-Least-Once com segurança.',
        scope: 'Simulação local de relay e consumidor idempotente; nenhum broker RabbitMQ real está conectado.'
    },
    'hero-stage-7': {
        shortTitle: '7. RESULT',
        title: '7. RESULT (Fluxo Sintético Verificado)',
        what: 'Apresenta o estado final coerente: Autorização `APPROVED (DE39=00)`, registro persistido, Outbox `PUBLISHED` e recebível registrado sem duplicidade.',
        why: 'Confirma a consistência ponta a ponta entre a decisão síncrona de autorização e a fila assíncrona de liquidação.',
        scope: 'Resultado sintético determinístico — nenhum indicador fictício de produção é exibido.'
    }
};

/**
 * Simulator Scenario Summary Banners (PT-BR)
 */
window.SIM_PT_SUMMARIES = {
    'scenario-a': 'Demonstra o caminho padrão (happy path): a autorização síncrona conclui na Fase 1 e realiza commit atômico junto ao evento Outbox.',
    'scenario-b': 'Diferencia idempotência real de backend de uma simples trava visual na UI: requisições repetidas retornam o snapshot original sem cobrar duas vezes.',
    'scenario-c': 'Demonstra que Outbox + Relay garante entrega At-Least-Once (não Exactly-Once), exigindo confirmação do broker (ACK) e deduplicação no consumidor.',
    'scenario-d': 'A autorização apenas reserva saldo do portador; a compensação financeira, cálculo de taxas (MDR/Interchange) e liquidação ocorrem em janelas batch (Base II / TC50).'
};

/**
 * Simulator Step-by-Step Translations (PT-BR)
 */
window.SIM_PT_STEPS = {
    'a-step-1': {
        title: '1. Captura Sintética POS & Validação do Payload',
        what: 'Recebe uma requisição sintética de pagamento contactless (`BRL 124.50`) originada do SoftPOS com cabeçalho explícito `Idempotency-Key: idem-8f91-a01`.',
        why: 'Valida campos obrigatórios (valor, identificador do lojista, token EMV e formato da chave de idempotência) antes de alocar recursos de banco ou switch.',
        risk: 'Impede que payloads malformados ou sem chave de rastreamento entrem no pipeline financeiro.',
        scope: 'Simula validação de borda localmente na máquina de estados em JavaScript.'
    },
    'a-step-2': {
        title: '2. Verificação de Chave de Idempotência (Cache Miss)',
        what: 'Consulta `idempotency_keys` pela chave `idem-8f91-a01`. Como não existe registro prévio (`MISS`), insere uma trava de processamento associada ao hash SHA-256 do payload.',
        why: 'Garante que retentativas concorrentes com a mesma chave não disparem autorizações duplicadas enquanto a chamada original está em trânsito.',
        risk: 'Mitiga condições de corrida (race conditions) e cobranças duplicadas em redes móveis instáveis.',
        scope: 'Atualiza a tabela simulada `idempotency_keys` em memória para `IN_PROGRESS`.'
    },
    'a-step-3': {
        title: '3. Roteamento ISO 8583 & Tradução de PIN Block no SoftHSM',
        what: 'Empacota a mensagem ISO 8583 `MTI 0100` e invoca o simulador C++ SoftHSM para traduzir o PIN Block ISO-0 da chave do terminal (`TMK`) para a chave de zona da bandeira (`ZPK`).',
        why: 'Isola operações criptográficas sensíveis em memória protegida para que o PIN aberto nunca transite pelos logs do switch.',
        risk: 'Evita exposição de dados criptográficos durante o roteamento entre adquirente e bandeira.',
        scope: 'Simula a chamada JNI/TCP ao módulo C++ SoftHSM e validação de Key Check Value (`KCV`).'
    },
    'a-step-4': {
        title: '4. Resposta do Emulador de Bandeira (MTI 0110 • DE39=00)',
        what: 'Transmite a requisição `MTI 0100` pelo Visa Gateway até o VisaNet Emulator, que avalia regras sintéticas do emissor e retorna `MTI 0110` com `DE39=00 (Approved)`.',
        why: 'Separa a montagem de mensagens ISO 8583 da conectividade de rede com a bandeira e do gerenciamento de sockets.',
        risk: 'Permite testar timeouts, códigos de recusa e bitmaps ISO 8583 sem depender de links reais de bandeira.',
        scope: 'Executa avaliação determinística local e retorna código de autorização sintético.'
    },
    'a-step-5': {
        title: '5. Persistência Atômica: Transação + Evento Outbox (ACID)',
        what: 'Executa uma única transação local `ACID` no PostgreSQL que grava a linha em `transactions` (`APPROVED`), insere o evento `outbox_events` (`PENDING`) e salva o snapshot em `idempotency_keys`.',
        why: 'Resolve o problema de dual-write: o registro financeiro e o evento de integração sofrem commit ou rollback juntos na mesma transação do banco.',
        risk: 'Elimina o estado inconsistente onde a transação é gravada no banco mas o evento se perde antes de chegar ao RabbitMQ.',
        scope: 'Atualiza simultaneamente as tabelas simuladas `transactions`, `outbox_events` e `idempotency_keys`.'
    },
    'a-step-6': {
        title: '6. Publicação Assíncrona pelo Outbox Relay (Broker ACK)',
        what: 'O worker Outbox Relay lê eventos `PENDING`, publica `EVT-501` na exchange do RabbitMQ, aguarda o `Publisher Confirm (ACK)` e atualiza o Outbox para `PUBLISHED`.',
        why: 'Garante que a thread HTTP de autorização retorne rápido ao lojista sem bloquear em I/O de mensageria.',
        risk: 'Evita perda silenciosa de mensagens exigindo confirmação explícita de persistência do broker antes de marcar como publicado.',
        scope: 'Simula publicação assíncrona e transição de status na tabela `outbox_events`.'
    },
    'a-step-7': {
        title: '7. Processamento do Consumidor & Deduplicação de Liquidação',
        what: 'O `Settlement Listener` consome `EVT-501`, valida `event_id` na tabela `processed_events`, registra o recebível para compensação e envia `ACK` ao broker.',
        why: 'Como o padrão Outbox garante entrega **At-Least-Once**, o consumidor precisa ser idempotente para ignorar eventuais reentregas.',
        risk: 'Impede lançamentos contábeis duplicados no livro-razão (ledger) de liquidação.',
        scope: 'Conclui o Cenário A atualizando a tabela simulada `processed_events`.'
    },
    'b-step-1': {
        title: '1. Execução da Requisição Original (Idempotency-Key: idem-dup-774)',
        what: 'Processa a primeira requisição (`BRL 89.00`, `idem-dup-774`): valida os dados, autoriza na bandeira (`DE39=00`) e persiste o snapshot da resposta junto à chave no PostgreSQL.',
        why: 'Cria o registro canônico da operação que servirá de âncora caso a resposta se perca na rede do cliente.',
        risk: 'Sem armazenar o snapshot da resposta associado à chave, o backend não saberia qual resultado devolver em uma retentativa.',
        scope: 'Popula o estado inicial aprovado para demonstrar a repetição na etapa seguinte.'
    },
    'b-step-2': {
        title: '2. Timeout de Rede no Cliente & Retentativa Automática',
        what: 'O app SoftPOS sofre uma queda momentânea de conexão móvel antes de receber o HTTP 200 e reenvia exatamente o mesmo payload com `Idempotency-Key: idem-dup-774`.',
        why: 'Em sistemas distribuídos de pagamento, retentativas automáticas são obrigatórias quando o cliente não sabe se a requisição chegou ao servidor.',
        risk: 'Apenas desabilitar o botão na interface (UI) não impede duplicidades causadas por retentativas de socket ou SDK.',
        scope: 'Simula a chegada de uma requisição HTTP duplicada no Merchant Service.'
    },
    'b-step-3': {
        title: '3. Detecção de Colisão de Chave & Validação de Hash SHA-256',
        what: 'O Merchant Service detecta que `idem-dup-774` já existe em `idempotency_keys` com status `COMPLETED` e compara o hash SHA-256 do payload recebido (`sha256:9c44e1`) com o original.',
        why: 'Garante que a mesma chave de idempotência não foi reutilizada acidentalmente com parâmetros diferentes (ex.: outro valor ou cartão).',
        risk: 'Se o hash divergir, a API deve rejeitar com `HTTP 422 Unprocessable Entity`; como o hash coincide, trata-se de uma retentativa legítima.',
        scope: 'Demonstra a política de deduplicação no inspetor de estado em memória.'
    },
    'b-step-4': {
        title: '4. Curto-Circuito Seguro & Reutilização da Resposta Original',
        what: 'Retorna imediatamente o snapshot original (`TX-9902A`, `DE39=00`) com flag `Idempotent-Replay: true` **sem** chamar o Acquiring Switch, SoftHSM, VisaNet ou criar novo evento Outbox.',
        why: 'Preserva o estado financeiro exato: o portador do cartão é cobrado apenas uma vez e o cliente recupera a confirmação perdida.',
        risk: 'Elimina dupla cobrança (double-charging) e evita poluição da fila de liquidação com eventos duplicados.',
        scope: 'Cenário B concluído: contador de transações aprovadas permanece em 1 (sem cobrança extra).'
    },
    'c-step-1': {
        title: '1. Autorização Síncrona Concluída Normalmente (Fase 1)',
        what: 'Processa e aprova a autorização `TX-9903C` (`BRL 65.00`) via Acquiring Switch e VisaNet Emulator (`MTI 0110 DE39=00`) dentro da janela síncrona.',
        why: 'A decisão de autorização online independe da disponibilidade momentânea do broker de mensageria assíncrona.',
        risk: 'Se o switch publicasse diretamente no RabbitMQ durante a requisição HTTP, uma queda do broker derrubaria as vendas na ponta.',
        scope: 'Executa a Fase 1 completa antes de injetar a falha no broker.'
    },
    'c-step-2': {
        title: '2. Commit Local no PostgreSQL (Transação + Outbox PENDING)',
        what: 'Persiste `TX-9903C` em `transactions` e `EVT-903` em `outbox_events` (`status = PENDING`, `attempts = 0`) na mesma transação local do PostgreSQL e responde sucesso ao POS.',
        why: 'Garante durabilidade do evento no disco do banco de dados antes de qualquer tentativa de comunicação via rede com o RabbitMQ.',
        risk: 'Impede perda de eventos caso o processo da aplicação ou o broker sofram falha logo após a autorização.',
        scope: 'Registra 1 evento pendente (`Outbox Pending = 1`) na tabela simulada.'
    },
    'c-step-3': {
        title: '3. Falha Simulada na Publicação ao Broker (Connection Refused)',
        what: 'O Outbox Relay tenta publicar `EVT-903` no RabbitMQ, mas encontra falha de conexão (`AMQP Socket Timeout / Broker Unreachable`).',
        why: 'Modela indisponibilidade real de infraestrutura de mensageria ou partição de rede entre o microsserviço e o cluster RabbitMQ.',
        risk: 'Sem o padrão Outbox, esta exceção descartaria a mensagem de liquidação permanentemente.',
        scope: 'Injeta falha determinística no nó RabbitMQ e registra o erro no trace.'
    },
    'c-step-4': {
        title: '4. Retenção em PENDING_RETRY & Agendamento de Backoff Exponencial',
        what: 'O Outbox Relay captura a exceção, mantém `EVT-903` persistido no PostgreSQL, incrementa `attempts = 1` e atualiza o status para `PENDING_RETRY (backoff: 2s + jitter)`.',
        why: 'O Exponential Backoff com Jitter evita sobrecarregar o broker com tempestades de reconexão (retry storms) durante sua recuperação.',
        risk: 'Protege o banco de dados e a rede interna contra exaustão de threads durante incidentes no broker.',
        scope: 'Atualiza a linha `EVT-903` na tabela simulada `outbox_events` para `PENDING_RETRY`.'
    },
    'c-step-5': {
        title: '5. Recuperação do Broker, Retentativa de Publicação & Confirm ACK',
        what: 'Na tentativa #2, a conexão com o RabbitMQ é restabelecida; o Relay publica `EVT-903`, recebe o `Publisher Confirm ACK` do broker e marca o Outbox como `PUBLISHED`.',
        why: 'Separa a entrega da mensagem ao broker (`Publisher Confirm`) do processamento pelo consumidor final.',
        risk: 'Garante que um evento nunca seja marcado como publicado antes do confirmação durável do broker.',
        scope: 'Simula recuperação do broker e transição de `PENDING_RETRY` para `PUBLISHED`.'
    },
    'c-step-6': {
        title: '6. Processamento At-Least-Once & Deduplicação no Consumidor (DLQ Ready)',
        what: 'O `Settlement Listener` consome `EVT-903`, verifica `event_id` em `processed_events` (`INSERT ... ON CONFLICT DO NOTHING`), contabiliza o recebível de `BRL 65.00` e envia `ACK` (mensagens corrompidas após limite de retries iriam para a `DLQ`).',
        why: 'Transactional Outbox garante entrega **At-Least-Once**, NÃO **Exactly-Once**: se o Relay caísse após publicar mas antes de atualizar o banco, `EVT-903` seria enviado duas vezes. A deduplicação no consumidor torna o processamento seguro.',
        risk: 'Evita duplicidade financeira na recuperação de falhas e isola poison messages em Dead-Letter Queue (DLQ).',
        scope: 'Cenário C concluído: demonstra falha, retenção segura, retry, confirmação e deduplicação.'
    },
    'd-step-1': {
        title: '1. Janela de Cut-Off Diário & Staging do Log de Clearing (TC57 / Base II)',
        what: 'Dispara a janela de cut-off do fim do dia, consolidando as transações autorizadas em registros posicionais de clearing (`layout TC57 / Visa Base II`) para conciliação em lote.',
        why: 'Na adquirência, a autorização síncrona (`MTI 0100/0110`) apenas sensibiliza o limite do portador; a compensação financeira ocorre em lotes após o cut-off.',
        risk: 'Impede que autorizações pendentes ou divergentes entrem na liquidação financeira sem validação prévia.',
        scope: 'Simula a etapa de staging em lote na Fase 3 do diagrama.'
    },
    'd-step-2': {
        title: '2. Conciliação Orientada a Chunks & Cálculo de Taxas (Spring Batch)',
        what: 'Executa um step orientado a chunks (`ItemReader -> FeeProcessor -> ItemWriter`), adquirindo trava distribuída (`ShedLock`) e calculando taxas de MDR e intercâmbio por transação.',
        why: 'O processamento em chunks limita o uso de memória RAM e grava checkpoints em `BATCH_STEP_EXECUTION` para retomada segura em caso de falha.',
        risk: 'Mitiga erros de OutOfMemory em arquivos grandes e impede execução duplicada em múltiplos nós do cluster.',
        scope: 'Simula execução de chunk do Spring Batch e cálculo de descontos (Bruto: BRL 269.50 -> Líquido: BRL 263.57).'
    },
    'd-step-3': {
        title: '3. Escrituração em Ledger de Partidas Dobradas & Arquivo TC50',
        what: 'Registra lançamentos contábeis balanceados de débito e crédito (`Débito: Recebível Bandeira BRL 269.50` == `Crédito: Repasse Lojista BRL 263.57 + Receita MDR BRL 5.93`) e emite o lote `TC50`.',
        why: 'Impõe conservação contábil estrita: cada centavo autorizado e compensado deve fechar perfeitamente entre repasse líquido e receitas de taxas.',
        risk: 'Detecta divergências de conciliação antes de liberar ordens de pagamento bancário aos lojistas.',
        scope: 'Cenário D concluído: livro-razão (ledger) de partidas dobradas conciliado e balanceado.'
    }
};

/**
 * Architecture Diagram Node Inspector Translations (PT-BR)
 */
window.SIM_PT_NODES = {
    'node-softpos': {
        name: 'SoftPOS (Captura Mobile NFC)',
        what: 'Captura dados de cartão contactless via NFC (APDU / EMV L2), criptografa o PIN Block sob a chave do terminal (`TMK`) e anexa um `Idempotency-Key` único.',
        why: 'Inicia a requisição de pagamento na borda garantindo que toda tentativa de rede possua uma chave determinística de deduplicação.',
        risk: 'Impede envio de PAN/PIN desprotegidos e permite retentativas seguras em redes móveis instáveis.',
        scope: 'Simulado localmente como gerador de payloads sintéticos de origem.'
    },
    'node-merchant': {
        name: 'Merchant Service (Orquestrador & Barreira de Idempotência)',
        what: 'Valida o esquema do payload, verifica `Idempotency-Key` + hash SHA-256 no PostgreSQL e coordena o ciclo transacional.',
        why: 'Atua como barreira de idempotência na borda antes de acionar o core de mensageria ISO 8583 ou módulos criptográficos.',
        risk: 'Evita cobranças duplicadas caso o aplicativo mobile repita a requisição após um timeout de leitura.',
        scope: 'Simulado localmente via inspeção da tabela em memória `idempotency_keys`.'
    },
    'node-softhsm': {
        name: 'SoftHSM (Simulador C++ de Hardware Security Module)',
        what: 'Traduz PIN Blocks ISO 9564 Formato 0 da Terminal Master Key (`TMK`) para a Zone PIN Key (`ZPK`) da bandeira e valida Key Check Values (`KCV`).',
        why: 'Em adquirentes reais, o PIN nunca pode existir em texto aberto na memória da JVM; o HSM realiza a tradução de chaves em ambiente isolado.',
        risk: 'Mitiga vazamento de chaves criptográficas e exposição de PIN em logs ou dumps de memória.',
        scope: 'Representa o estudo de caso autoral em C++ (`SoftHSM`) documentado na seção de projetos.'
    },
    'node-switch': {
        name: 'Acquiring Switch (Motor Core ISO 8583)',
        what: 'Monta e interpreta mensagens financeiras ISO 8583 (`MTI 0100` / `0110`), gerencia bitmaps binários (`DE3`, `DE4`, `DE11`, `DE39`, `DE52`) e aplica regras de roteamento.',
        why: 'Centraliza a tradução entre APIs JSON modernas de captura e o protocolo binário legado exigido pelas bandeiras de cartão.',
        risk: 'Evita corrupção de bitmaps, falhas de correlação de STAN (`DE11`) e estouro de SLA de autorização.',
        scope: 'Simulado localmente na máquina de estados determinística.'
    },
    'node-visagateway': {
        name: 'Visa Gateway (Conector de Rede da Bandeira)',
        what: 'Gerencia framing TCP/IP, cabeçalhos de comprimento de 2 bytes e timeouts rigorosos de socket para comunicação com a bandeira.',
        why: 'Isola o gerenciamento de conexões persistentes de rede da lógica de domínio do switch autorizador.',
        risk: 'Impede que conexões presas ou lentas na bandeira esgotem o pool de threads do switch.',
        scope: 'Etapa de roteamento simulada localmente na Fase 1.'
    },
    'node-visanet': {
        name: 'VisaNet Emulator (Autorizador Sintético Base I)',
        what: 'Valida os campos da mensagem `MTI 0100`, simula regras de aprovação do banco emissor e devolve `MTI 0110` com `DE39=00`.',
        why: 'Permite testar fluxos completos de aprovação, recusa e reversão sem depender de ambiente externo de certificação da bandeira.',
        risk: 'Elimina dependências externas instáveis durante testes funcionais e demonstrações técnicas.',
        scope: 'Emulador determinístico local executado no navegador.'
    },
    'node-dboutbox': {
        name: 'PostgreSQL DB & Tabela Transactional Outbox',
        what: 'Executa o commit atômico de `transactions`, `outbox_events` e `idempotency_keys` dentro de uma única transação relacional `ACID`.',
        why: 'Garante que nenhum evento de liquidação seja perdido se o broker RabbitMQ estiver fora do ar no momento da venda.',
        risk: 'Elimina a vulnerabilidade de dual-write entre o banco de dados relacional e o broker de mensageria.',
        scope: 'Inspecionável em tempo real nas tabelas em memória logo abaixo.'
    },
    'node-outboxrelay': {
        name: 'Outbox Relay (Worker Assíncrono de Publicação & Backoff)',
        what: 'Lê eventos `PENDING` da tabela Outbox, publica no RabbitMQ aguardando `Publisher Confirm (ACK)` e aplica Exponential Backoff com Jitter em caso de falha.',
        why: 'Desacopla a disponibilidade do broker da latência da autorização síncrona, garantindo entrega At-Least-Once.',
        risk: 'Impede perda de mensagens durante quedas do broker e evita tempestades de reconexão (retry storms).',
        scope: 'Comportamento de falha, backoff e recuperação demonstrado no Cenário C.'
    },
    'node-rabbitmq': {
        name: 'RabbitMQ Broker (Quorum Queues & Roteamento DLQ)',
        what: 'Recebe eventos de liquidação publicados pelo Outbox Relay e os distribui aos consumidores com suporte a Dead-Letter Queue (`DLQ`).',
        why: 'Absorve picos de tráfego e isola mensagens inválidas (poison messages) após esgotar políticas de retentativa.',
        risk: 'Evita bloqueio da fila principal quando uma mensagem específica falha repetidamente.',
        scope: 'Fila simulada localmente com contadores visíveis no painel superior.'
    },
    'node-settlementlistener': {
        name: 'Settlement Listener (Consumidor Idempotente)',
        what: 'Consome eventos da fila, verifica se o `event_id` já consta em `processed_events` e registra o recebível antes de enviar o `ACK`.',
        why: 'Como o Outbox Relay pode entregar a mesma mensagem mais de uma vez após falhas de rede (At-Least-Once), o consumidor deve deduplicar por `event_id`.',
        risk: 'Impede duplicação de agendamentos financeiros para o lojista.',
        scope: 'Deduplicação visível na tabela `processed_events` abaixo.'
    },
    'node-tc57log': {
        name: 'Clearing Log (Staging Posicional Base II / TC57)',
        what: 'Consolida as transações capturadas ao longo do dia em registros posicionais padronizados para o processamento noturno de clearing.',
        why: 'Separa o fluxo online de autorização do processamento em lote de compensação interbancária.',
        risk: 'Garante integridade e auditabilidade do lote antes do cálculo de tarifas.',
        scope: 'Demonstrado na Fase 3 (Cenário D).'
    },
    'node-springbatch': {
        name: 'Spring Batch (Conciliação em Chunks & ShedLock)',
        what: 'Processa os registros em chunks transacionais com trava distribuída (`ShedLock`), calculando MDR e taxa de intercâmbio.',
        why: 'Permite processar grandes volumes financeiros com uso controlado de memória e retomada a partir do último chunk em caso de erro.',
        risk: 'Impede execução concorrente duplicada em clusters Kubernetes e evita estouro de memória.',
        scope: 'Demonstrado na Etapa 2 do Cenário D.'
    },
    'node-payout': {
        name: 'Payout & Ledger (Partidas Dobradas & Arquivo TC50)',
        what: 'Registra débitos e créditos balanceados no livro-razão (ledger) e gera o arquivo final de liquidação `TC50` para pagamento aos lojistas.',
        why: 'Garante que a soma dos repasses líquidos mais as taxas da adquirente seja exatamente igual ao valor bruto transacionado.',
        risk: 'Impede divergências financeiras e falhas de auditoria contábil.',
        scope: 'Demonstrado na Etapa 3 do Cenário D.'
    }
};

/**
 * Exact Text-Node Dictionary (English -> Brazilian Portuguese)
 * Snapshots original English text nodes automatically so toggling back to EN is 100% lossless.
 */
const PT_TEXT_DICTIONARY = {
    // Header & Navigation
    'Skip to main engineering content': 'Pular para o conteúdo principal de engenharia',
    'Senior Backend Engineer': 'Engenheiro Backend Sênior',
    'Overview': 'Visão Geral',
    'Projects (Case Studies)': 'Projetos (Estudos de Caso)',
    'Payment Systems Lab': 'Payment Systems Lab',
    'Experience': 'Experiência',
    'Skills Matrix': 'Matriz de Habilidades',
    'Resume (PDF)': 'Currículo (PDF)',
    'Get in Touch': 'Entrar em Contato',

    // Hero Left Column
    'Senior Backend Engineer | Java & Payment Systems': 'Engenheiro Backend Sênior | Java & Sistemas de Pagamento',
    '13+ Years Experience': '13+ Anos de Experiência',
    'Payment Infrastructure': 'Infraestrutura de Pagamentos',
    'Backend Engineering for': 'Engenharia Backend para',
    'Mission-Critical Financial Systems': 'Sistemas Financeiros de Missão Crítica',
    '“I build reliable backend systems for payment processing, financial integrations, and distributed applications.”': '“Construo sistemas backend confiáveis para processamento de pagamentos, integrações financeiras e aplicações distribuídas.”',
    'Core Stack': 'Stack Principal',
    'Distributed': 'Sistemas Distribuídos',
    'Location & Work Scope': 'Localização & Escopo',
    'Barueri, Brazil • Remote World': 'Barueri, Brasil • Remoto Global',
    'View Projects': 'Ver Projetos',
    'Download Resume (CV)': 'Baixar Currículo (CV)',
    'Contact Me': 'Fale Comigo',

    // Hero Right Column (OrionPay Preview Card)
    'Payment Authorization Demo': 'Demo de Autorização de Pagamentos',
    'SIMULATION · SYNTHETIC DATA': 'SIMULAÇÃO · DADOS SINTÉTICOS',
    'Local Client-Side Execution (No Live Network)': 'Execução Local no Navegador (Sem Rede Externa)',
    'Select a stage or click Run Demo': 'Selecione uma etapa ou clique em Executar Demo',
    'SYNTHETIC TRACE': 'TRACE SINTÉTICO',
    'Run Demo': 'Executar Demo',
    'Reset': 'Resetar',
    'Explore the payment flow': 'Explorar o fluxo de pagamento',

    // Metrics Strip
    'Continuous Experience': 'Experiência Contínua',
    'Years': 'Anos',
    'Hands-on backend systems in acquirers, financial consulting, and enterprise banking.': 'Atuação prática em sistemas backend para adquirentes, consultorias financeiras e bancos corporativos.',
    'Authorization Window': 'Janela de Autorização',
    'End-to-end design target spanning terminal capture, crypto translation, and switch routing.': 'Meta de arquitetura ponta a ponta cobrindo captura no terminal, tradução criptográfica e roteamento no switch.',
    'Data Reliability': 'Confiabilidade de Dados',
    'Pattern': 'Pattern',
    'Dual-write elimination with atomic database commits and Change Data Capture (CDC).': 'Eliminação de dual-write com commits atômicos no banco de dados e Change Data Capture (CDC).',
    'Security Scope': 'Escopo de Segurança',
    'Concepts': 'Conceitos',
    '3DES, AES key management, TMK-to-ZPK PIN block re-encryption, and KCV math checks.': 'Gerenciamento de chaves 3DES/AES, recriptografia de PIN block TMK-para-ZPK e verificação matemática de KCV.',

    // Projects (OrionPay Case Studies)
    'Authorial Engineering Projects & Case Studies': 'Projetos Autorais de Engenharia & Estudos de Caso',
    'OrionPay: End-to-End Payment Architecture': 'OrionPay: Arquitetura de Pagamentos Ponta a Ponta',
    'An authorial reference architecture and integration testbed built to model the entire card payment lifecycle: from NFC mobile capture and C++ cryptographic simulation to synchronous ISO 8583 authorization and end-of-day clearing batch pipelines.': 'Uma arquitetura de referência autoral e bancada de testes construída para modelar todo o ciclo de vida do pagamento com cartão: da captura mobile NFC e simulação criptográfica em C++ até a autorização síncrona ISO 8583 e pipelines batch de compensação (clearing).',
    'Engineering Transparency Note:': 'Nota de Transparência de Engenharia:',
    'OrionPay is an authorial reference architecture and protocol verification harness developed to demonstrate distributed systems and financial messaging design patterns.': 'OrionPay é uma arquitetura de referência autoral e um ambiente de verificação de protocolos desenvolvido para demonstrar padrões de sistemas distribuídos e mensageria financeira.',
    'Acquiring Switch & Core': 'Acquiring Switch & Core',
    'Java 21 • Sub-200ms Window • Outbox Pattern': 'Java 21 • Janela Sub-200ms • Outbox Pattern',
    'C++ SoftHSM (Security Module)': 'C++ SoftHSM (Módulo de Segurança)',
    'PIN Block Translation • 3DES/AES • KCV Checks': 'Tradução de PIN Block • 3DES/AES • Validação KCV',
    'VisaNet Scheme Emulator': 'Emulador de Bandeira VisaNet',
    'ISO 8583 Base I • Bitmaps • Testbed Injection': 'ISO 8583 Base I • Bitmaps • Injeção de Testes',
    'Clearing & Reconciliation': 'Clearing & Conciliação Financeira',
    'Spring Batch • Positional TC50 File • Ledger': 'Spring Batch • Arquivo Posicional TC50 • Ledger',
    'SoftPOS Mobile Contactless': 'SoftPOS Mobile Contactless',
    'Android NFC • EMV L2 Kernel • APDU Commands': 'Android NFC • Kernel EMV L2 • Comandos APDU',

    // Simulator Section
    'SIMULATION · SYNTHETIC DATA · NO LIVE PAYMENT NETWORKS': 'SIMULAÇÃO · DADOS SINTÉTICOS · SEM REDES DE PAGAMENTO REAIS',
    'INTERACTIVE SIMULATION · SYNTHETIC DATA · NOT A PRODUCTION PAYMENT SYSTEM': 'SIMULAÇÃO INTERATIVA · DADOS SINTÉTICOS · NÃO É UM SISTEMA DE PAGAMENTOS EM PRODUÇÃO',
    'Explore payment authorization, transaction idempotency, the Transactional Outbox pattern, message recovery, and batch clearing through deterministic simulations.': 'Explore autorização de pagamentos, idempotência transacional, o padrão Transactional Outbox, recuperação de mensageria e clearing em lote por meio de simulações determinísticas.',
    'Interactive ISO 8583 & Distributed Outbox Laboratory': 'Laboratório Interativo ISO 8583 & Transactional Outbox',
    'Explore how a payment switch handles synchronous authorization, transactional idempotency on duplicate retries, Outbox persistence during broker outages, and batch clearing reconciliation.': 'Explore como um switch de pagamentos gerencia autorização síncrona, idempotência transacional em retentativas duplicadas, persistência Outbox durante quedas do broker e conciliação batch de clearing.',
    'Simulation Scope:': 'Escopo da Simulação:',
    'Select Engineering Scenario (Click a scenario, then Run or Step Forward):': 'Selecione o Cenário de Engenharia (Clique em um cenário e depois em Executar ou Avançar Etapa):',
    'Tip: Click any architecture node or stage card to inspect its technical rationale': 'Dica: Clique em qualquer nó da arquitetura ou card de etapa para inspecionar sua justificativa técnica',
    'Scenario A': 'Cenário A',
    'Approved Authorization': 'Autorização Aprovada',
    'ISO 8583 0100→0110, atomic DB + Outbox commit & async consumer.': 'ISO 8583 0100→0110, commit atômico BD + Outbox e consumidor assíncrono.',
    'Scenario B': 'Cenário B',
    'Duplicate Request (Idempotency)': 'Requisição Duplicada (Idempotência)',
    'Client retry with same Idempotency-Key & cached response replay.': 'Retentativa do cliente com mesma Idempotency-Key e reuso da resposta salva.',
    'Scenario C': 'Cenário C',
    'Broker Failure & Recovery': 'Falha e Recuperação da Mensageria',
    'RabbitMQ outage, Outbox PENDING_RETRY, backoff & consumer dedup.': 'Queda do RabbitMQ, Outbox PENDING_RETRY, backoff e deduplicação no consumidor.',
    'Scenario D': 'Cenário D',
    'Batch Clearing (Base II / TC50)': 'Clearing em Lote (Base II / TC50)',
    'End-of-day cut-off, Spring Batch chunks & double-entry ledger.': 'Cut-off diário, chunks no Spring Batch e livro-razão de partidas dobradas.',
    'Deterministic State Machine': 'Máquina de Estados Determinística',
    'Local Browser Runtime': 'Execução Local no Navegador',
    'SYNTHETIC PAYLOADS (NO LIVE NETWORK)': 'PAYLOADS SINTÉTICOS (SEM REDE EXTERNA)',
    'Sim Approved Tx': 'Tx Aprovadas (Sim)',
    'Synthetic (BRL)': 'Volume Sintético (BRL)',
    'Outbox Pending': 'Outbox Pendente',
    'Broker Queue': 'Fila do Broker',
    'Run Scenario': 'Executar Cenário',
    'Step Forward': 'Avançar Etapa',
    'Logs': 'Logs',
    'Sync Call': 'Chamada Síncrona',
    'Async / Outbox / Batch': 'Assíncrono / Outbox / Batch',
    'Retry / Dedup': 'Retry / Dedup',
    'Fault': 'Falha',
    'Mobile View: Vertical step cards active below': 'Visão Mobile: Cards verticais de etapas ativos abaixo',
    'Show Full Architecture Diagram (Scrollable)': 'Mostrar Diagrama Completo da Arquitetura (Rolável)',
    'Phase 1: Synchronous Authorization (Blocking Request / Response)': 'Fase 1: Autorização Síncrona (Requisição / Resposta Bloqueante)',
    'Merchant Capture': 'Captura Lojista',
    'Orchestrator & Idem': 'Orquestrador & Idem',
    'TMK → ZPK PIN Trans': 'Tradução PIN TMK → ZPK',
    'ISO 8583 Core': 'Core ISO 8583',
    'Scheme Connector': 'Conector Bandeira',
    'Base I Authorizer': 'Autorizador Base I',
    'Phase 2: Asynchronous Messaging (Transactional Outbox & At-Least-Once Relay)': 'Fase 2: Mensageria Assíncrona (Transactional Outbox & Relay At-Least-Once)',
    'Idempotent Consumer': 'Consumidor Idempotente',
    'Phase 3: Batch Clearing & Settlement (Cut-Off / Base II TC50)': 'Fase 3: Clearing & Liquidação em Lote (Cut-Off / Base II TC50)',
    'Base II Staging': 'Staging Base II',
    'Chunk Recon + ShedLock': 'Conciliação Chunk + ShedLock',
    'Double-Entry Settlement': 'Liquidação Partidas Dobradas',
    'TC50 Output': 'Saída TC50',
    'Scenario Stage Sequence (Click to Inspect)': 'Sequência de Etapas do Cenário (Clique para Inspecionar)',
    'Text Alternative': 'Alternativa Textual',
    'Simulated Persistence & State Inspector (In-Memory Model)': 'Inspetor de Persistência & Estado Simulado (Modelo em Memória)',
    'Updates per executed step': 'Atualizado a cada etapa executada',
    'SYNTHETIC EXECUTION TRACE • LOCAL CLIENT-SIDE STATE MACHINE LOGS': 'TRACE DE EXECUÇÃO SINTÉTICO • LOGS LOCAIS DA MÁQUINA DE ESTADOS',

    // Concepts Reference Guide
    'Architectural Reference Guide': 'Guia de Referência Arquitetural',
    'Payment Processing & Distributed Systems Concepts': 'Conceitos de Processamento de Pagamentos & Sistemas Distribuídos',
    'Conceptual Reference vs. Local Simulation Scope': 'Referência Conceitual vs. Escopo da Simulação Local',
    'ISO 8583 & MTI / Data Elements': 'ISO 8583 & MTI / Data Elements',
    'Idempotency vs. Visual Duplicate Check': 'Idempotência vs. Verificação Visual de Duplicidade',
    'Transactional Outbox Pattern': 'Padrão Transactional Outbox',
    'Delivery, Consumer Dedup & DLQ': 'Entrega, Deduplicação no Consumidor & DLQ',
    'Transactional Consistency Models': 'Modelos de Consistência Transacional',
    'Authorization vs. Settlement': 'Autorização vs. Liquidação (Settlement)',

    // Technical Evidence Panel
    'Technical Evidence, Source Links & Repository Scope': 'Evidências Técnicas, Links de Código & Escopo do Repositório',
    'Verified against current repository contents': 'Verificado em relação ao conteúdo atual do repositório',
    'Portfolio & Simulator Repo': 'Repositório do Portfólio & Simulador',
    'View GitHub Repository →': 'Ver Repositório no GitHub →',
    'State Machine Implementation': 'Implementação da Máquina de Estados',
    'Inspect Simulator Source →': 'Inspecionar Código do Simulador →',
    'Architecture Case Study Data': 'Dados dos Estudos de Caso de Arquitetura',
    'Inspect Architectural Specs →': 'Inspecionar Especificações →',
    'Author GitHub Profile': 'Perfil GitHub do Autor',
    'Browse Public Repositories →': 'Explorar Repositórios Públicos →',

    // Professional Experience Section
    'Verifiable Career Trajectory': 'Trajetória Profissional Verificável',
    'Professional Experience': 'Experiência Profissional',
    '13+ years delivering backend architectures across payments acquirers, stock exchange clearing infrastructure, and financial consulting.': 'Mais de 13 anos entregando arquiteturas backend em adquirentes de pagamentos, infraestrutura de compensação em bolsa de valores e consultoria financeira.',
    'Current Role': 'Cargo Atual',
    'Card Acquiring & FinTech': 'Adquirência de Cartões & FinTech',
    'Specialist Java Backend Engineer (Senior IC)': 'Engenheiro Backend Java Especialista (Senior IC)',
    'March 2023 – Present': 'Março 2023 – Presente',
    'Lead individual contributor driving the engineering and scalability of transaction acquiring gateways and high-availability messaging engines. Architected fault-tolerant asynchronous message processing using Java 17/21, AWS cloud infrastructure, and distributed RabbitMQ topologies with Dead Letter Queues (DLQ). Actively leveraged generative AI diagnostic tooling to accelerate root-cause analysis on distributed traces and optimize cryptographic routines.': 'Contribuidor individual sênior liderando a engenharia e a escalabilidade de gateways de captura de transações e motores de mensageria de alta disponibilidade. Arquitetou processamento assíncrono tolerante a falhas utilizando Java 17/21, infraestrutura em nuvem AWS e topologias distribuídas RabbitMQ com Dead Letter Queues (DLQ). Utilizou ferramentas de diagnóstico baseadas em IA generativa para acelerar análises de causa-raiz em traces distribuídos e otimizar rotinas criptográficas.',
    'Global Financial Technology Consulting': 'Consultoria Global em Tecnologia Financeira',
    'Senior Java Engineer': 'Engenheiro Java Sênior',
    'February 2019 – February 2023 (4 years)': 'Fevereiro 2019 – Fevereiro 2023 (4 anos)',
    'B3 – Brasil, Bolsa, Balcão (Brazilian Stock Exchange)': 'B3 – Brasil, Bolsa, Balcão (Bolsa de Valores Brasileira)',
    'Capital Markets': 'Mercado de Capitais',
    'Engineered core features for regulated financial credit receivables registration platforms. Developed high-throughput synchronous APIs, transaction validation engines, and rigorous audit trails conforming to Central Bank (BACEN) regulatory requirements.': 'Desenvolveu funcionalidades centrais para plataformas reguladas de registro de recebíveis de crédito financeiro. Implementou APIs síncronas de alta vazão, motores de validação transacional e trilhas de auditoria rigorosas em conformidade com as exigências regulatórias do Banco Central (BACEN).',
    'Rabobank Brasil (Multinational Banking)': 'Rabobank Brasil (Banco Multinacional)',
    'Corporate Banking': 'Banco Corporativo',
    'Designed and implemented secure banking integration middleware utilizing Apache Camel Enterprise Integration Patterns (EIP) and Spring Boot, implementing reliable financial message routing with retry and dead-letter patterns across distributed core banking endpoints.': 'Projetou e implementou middleware seguro de integração bancária utilizando Apache Camel (Enterprise Integration Patterns - EIP) e Spring Boot, garantindo roteamento confiável de mensagens financeiras com políticas de retry e dead-letter entre sistemas de core bancário.',
    'Serasa Experian (Credit Bureau)': 'Serasa Experian (Bureau de Crédito)',
    'Credit Risk & High Volume': 'Risco de Crédito & Alto Volume',
    'Executed migration of legacy monolithic Java EE services into decoupled Spring Boot microservices, eliminating architectural technical debt and improving response time predictability under high-concurrency credit score inquiry workloads.': 'Executou a migração de serviços legados monolíticos em Java EE para microsserviços desacoplados em Spring Boot, reduzindo dívida técnica arquitetural e melhorando a previsibilidade do tempo de resposta sob alta concorrência em consultas de score de crédito.',
    'Java Backend Developer': 'Desenvolvedor Backend Java',
    'June 2018 – November 2018': 'Junho 2018 – Novembro 2018',
    'Built robust RESTful APIs handling high-concurrency traffic bursts for sports entertainment platforms. Optimized PostgreSQL connection pooling (HikariCP) and resolved query bottlenecks on WildFly application server clusters.': 'Desenvolveu APIs RESTful robustas para suportar picos de tráfego de alta concorrência em plataformas de entretenimento esportivo. Otimizou pools de conexão PostgreSQL (HikariCP) e eliminou gargalos de consultas em clusters de servidores WildFly.',
    'C++ / Java Software Engineer': 'Engenheiro de Software C++ / Java',
    'May 2013 – April 2018 (5 years)': 'Maio 2013 – Abril 2018 (5 anos)',
    'Engineered high-performance biometric facial recognition engines in C++ utilizing OpenCV for digital certification and strict physical access control. Built automated data collectors in Java / JAX-RS and developed enterprise native Android mobile clients.': 'Desenvolveu motores biométricos de reconhecimento facial de alta performance em C++ utilizando OpenCV para certificação digital e controle rigoroso de acesso físico. Construiu coletores automatizados de dados em Java / JAX-RS e aplicativos corporativos nativos para Android.',

    // Skills Matrix Section
    'Verified Competencies': 'Competências Verificadas',
    'Technical Skills & Domain Expertise': 'Habilidades Técnicas & Domínio de Especialidade',
    'Core engineering competencies and protocols verified across 13+ years of enterprise production systems.': 'Competências centrais de engenharia e protocolos verificados ao longo de mais de 13 anos em sistemas corporativos de produção.',
    'All Domains': 'Todos os Domínios',
    'Backend & C++': 'Backend & C++',
    'Payment Systems': 'Meios de Pagamento',
    'Distributed Systems': 'Sistemas Distribuídos',
    'Databases': 'Bancos de Dados',
    'Cloud & DevOps': 'Cloud & DevOps',
    'Security': 'Segurança',

    // Engineering Pillars Section
    'Senior Engineering Value': 'Valor de Engenharia Sênior',
    'Why Hire for Your Core Backend?': 'Por Que Contratar para o Seu Core Backend?',
    'Transactional consistency between synchronous online authorization and batch clearing via Outbox pattern': 'Consistência transacional entre autorização online síncrona e clearing em lote via padrão Outbox',
    'Scheme emulator harnesses for cost-effective pre-certification load tests': 'Emuladores de bandeira para testes de carga e pré-certificação com excelente custo-benefício',
    'Troubleshooting distributed deadlocks and tuning PostgreSQL connection pools': 'Diagnóstico de deadlocks distribuídos e otimização fina de pools de conexão no PostgreSQL',
    'Language Proficiency:': 'Proficiência em Idiomas:',
    'English:': 'Inglês:',
    'English — A2/B1': 'Inglês — A2/B1',
    'Location: Barueri, SP, Brazil (UTC-3 / BRT) • Open to Remote Worldwide & Relocation': 'Localização: Barueri, SP, Brasil (UTC-3 / BRT) • Aberto a Remoto Global & Realocação',
    'Resilience': 'Resiliência',
    'Transactional Outbox & ShedLock': 'Transactional Outbox & ShedLock',
    'Preventing dual-write failures with relational outbox persistence, CDC streaming, and distributed locks for strict idempotency on duplicate gateway requests.': 'Prevenção de falhas de dual-write com persistência relacional Outbox, streaming CDC e travas distribuídas para idempotência estrita em requisições duplicadas de gateway.',
    'Cryptography': 'Criptografia',
    'Hardware Security Module (HSM) Simulation': 'Simulação de Hardware Security Module (HSM)',
    'Symmetric key management with TMK, ZPK, and LMK hierarchies. Translating PIN blocks in secure volatile memory without persisting cardholder PIN data.': 'Gerenciamento de chaves simétricas com hierarquias TMK, ZPK e LMK. Tradução de PIN blocks em memória volátil segura sem nunca persistir o PIN do portador.',
    'Clearing': 'Compensação (Clearing)',
    'Chunk-Oriented Batch Pipelines': 'Pipelines Batch Orientados a Chunks',
    'Spring Batch pipelines capable of streaming transactions into standardized positional layouts (Visa Base II TC50) with automated fee balancing.': 'Pipelines Spring Batch projetados para processar transações em layouts posicionais padronizados (Visa Base II TC50) com batimento automatizado de taxas.',
    'Modernization': 'Modernização',
    'Decoupled Domain Architecture': 'Arquitetura de Domínio Desacoplada',
    'Transitioning legacy Java EE monoliths to clean hexagonal microservices, improving throughput and maintainability under stringent banking regulations.': 'Transição de monólitos legados em Java EE para microsserviços em arquitetura hexagonal limpa, elevando a vazão e a manutenibilidade sob normas bancárias.',

    // Contact Section & Footer
    'Available for Senior Backend & Payments Engineering Roles': 'Disponível para Vagas de Engenheiro Backend Sênior & Pagamentos',
    'Let’s Connect for Senior Backend Opportunities': 'Vamos Conversar sobre Oportunidades Backend Sênior',
    'I am actively considering Senior Backend Engineer, Java Engineer, and Payments / Distributed Systems roles with Canadian and international teams (Remote Worldwide or Relocation).': 'Estou avaliando ativamente oportunidades como Senior Backend Engineer, Java Engineer e Engenheiro de Pagamentos / Sistemas Distribuídos em equipes internacionais e no Brasil (Remoto Global ou Realocação).',
    'Copy Email': 'Copiar E-mail',
    'LinkedIn Profile': 'Perfil no LinkedIn',
    'GitHub Repositories': 'Repositórios GitHub',
    'Timezone: UTC-3 (São Paulo / BRT)': 'Fuso Horário: UTC-3 (São Paulo / BRT)',
    '• Senior Backend Engineer': '• Engenheiro Backend Sênior'
};

/**
 * Rich HTML Paragraph Translations (for paragraphs containing inline <strong>/<code> tags)
 */
const PT_HTML_FRAGMENTS = [
    {
        enMatch: 'Specialized Individual Contributor with',
        ptHtml: 'Contribuidor Individual Especialista com <strong class="text-white font-semibold">mais de 13 anos de experiência em desenvolvimento backend</strong> no ecossistema Java, switches de autorização transacional (<span class="font-mono text-cyan-300">ISO 8583 / VisaNet</span>), simulação de hardware criptográfico (<span class="font-mono text-[#00D47E]">C++ SoftHSM, Tradução de PIN Block</span>), clearing em lote de alto volume e mensageria distribuída.'
    },
    {
        enMatch: 'All scenarios execute locally in a deterministic client-side browser state machine',
        ptHtml: '<strong class="text-slate-200">Escopo da Simulação:</strong> Todos os cenários são executados localmente em uma máquina de estados determinística no navegador (<code class="text-cyan-300">js/components/simulator.js</code>) utilizando payloads sintéticos. Nenhum servidor externo, rede de bandeira real ou transação financeira de produção está envolvido.'
    },
    {
        enMatch: 'International standard for card-originated financial messages.',
        ptHtml: 'Padrão internacional para mensagens financeiras originadas por cartão. Cada mensagem inicia com um <strong>Message Type Indicator (MTI)</strong> de 4 dígitos (ex.: <code class="text-white">0100</code> Requisição de Autorização, <code class="text-white">0110</code> Resposta de Autorização, <code class="text-white">0420</code> Desfazimento/Reversal) seguido por um bitmap binário indicando quais <strong>Data Elements (DE)</strong> estão presentes (como <code class="text-white">DE3</code> Código de Processamento, <code class="text-white">DE4</code> Valor da Transação, <code class="text-white">DE11</code> STAN, <code class="text-white">DE39</code> Código de Resposta e <code class="text-white">DE52</code> Dados de PIN).'
    },
    {
        enMatch: 'Disabling a submit button in the UI only prevents accidental double clicks;',
        ptHtml: 'Desabilitar um botão de envio na interface (UI) evita apenas cliques duplos acidentais; não impede retentativas de rede quando um socket móvel sofre timeout após o servidor já ter processado a requisição. A verdadeira <strong>idempotência de backend</strong> impõe uma restrição de unicidade sobre <code class="text-white">Idempotency-Key</code> no PostgreSQL, valida o hash do payload e armazena atomicamente o snapshot da resposta para devolver o resultado original sem reexecutar efeitos colaterais.'
    },
    {
        enMatch: 'Solves the dual-write problem between a relational database and a message broker.',
        ptHtml: 'Resolve o problema de dual-write entre um banco de dados relacional e um broker de mensageria. Em vez de publicar diretamente no RabbitMQ dentro da thread HTTP, o serviço insere tanto a linha em <code class="text-white">transactions</code> quanto o evento em <code class="text-white">outbox_events</code> na mesma transação local <code class="text-white">ACID</code> do PostgreSQL. Um worker assíncrono (Relay) publica os eventos pendentes em seguida.'
    },
    {
        enMatch: 'Broker confirmation (',
        ptHtml: 'A confirmação do broker (<code class="text-white">Publisher Confirm ACK</code>) significa que o RabbitMQ persistiu a mensagem; a execução do consumidor significa que o listener a processou; o <code class="text-white">ACK</code> do consumidor remove a mensagem da fila. Como Outbox + Relay garante entrega <strong>At-Least-Once</strong> (pelo menos uma vez, e não <em>Exactly-Once</em>), os consumidores devem deduplicar por <code class="text-white">event_id</code>. Mensagens que falham repetidamente por erros irrecuperáveis são encaminhadas para uma <strong>Dead-Letter Queue (DLQ)</strong>.'
    },
    {
        enMatch: 'Combines <strong>strong local ACID consistency</strong>',
        ptHtml: 'Combina <strong>consistência ACID local forte</strong> para o registro síncrono da autorização e trava de idempotência no PostgreSQL com <strong>consistência eventual</strong> para a pré-alocação de liquidação via Outbox Relay. Isso evita commits distribuídos de duas fases (2PC) entre infraestruturas heterogêneas, preservando total auditabilidade.'
    },
    {
        enMatch: '<strong>Authorization (Base I / Online)</strong> verifies cardholder funds',
        ptHtml: 'A <strong>Autorização (Base I / Online)</strong> verifica o saldo do portador e sensibiliza o limite em milissegundos enquanto o cliente aguarda no POS. O <strong>Clearing &amp; Liquidação (Base II / Lote TC50)</strong> ocorre de forma assíncrona após o cut-off diário, calculando tarifas de intercâmbio/MDR e contabilizando repasses em livro-razão (ledger) de partidas dobradas.'
    },
    {
        enMatch: 'Static HTML5/ES6 repository compatible with GitHub Pages',
        ptHtml: '<strong class="text-slate-200">Execução Local &amp; Verificação:</strong> Repositório estático HTML5/ES6 compatível com GitHub Pages (<code class="text-cyan-300">npx serve .</code> ou <code class="text-cyan-300">python -m http.server 8080</code>). Os módulos backend Java/C++ descritos nos estudos de caso do OrionPay são representados aqui como especificações arquiteturais e simulações determinísticas locais; nenhum número de benchmark não verificado ou link externo quebrado é exibido.'
    },
    {
        enMatch: 'Experience with payment standards',
        ptHtml: 'Experiência prática com padrões de meios de pagamento (<span class="font-mono text-cyan-300">ISO 8583 e EMV</span>), aliada ao desenvolvimento backend em Java e C++, permitindo tratar casos de borda antes que se tornem divergências de conciliação ou problemas de concorrência.'
    }
];

let trackedTextNodes = [];
let trackedHtmlElements = [];
let domSnapshotInitialized = false;

/**
 * Capture a one-time snapshot of translatable DOM text nodes and HTML blocks
 */
function ensureDomSnapshot() {
    if (domSnapshotInitialized || !document.body) return;
    domSnapshotInitialized = true;

    // 1. Track ONLY leaf <p> elements (never <div> or <span> containers)
    const candidateParagraphs = document.querySelectorAll('p');
    candidateParagraphs.forEach(el => {
        const html = (el.innerHTML || '').trim();
        for (const frag of PT_HTML_FRAGMENTS) {
            if (html.includes(frag.enMatch)) {
                el.setAttribute('data-i18n-rich', 'true');
                trackedHtmlElements.push({
                    el,
                    enHtml: el.innerHTML,
                    ptHtml: frag.ptHtml
                });
                break;
            }
        }
    });

    // 2. Walk all text nodes in document.body (skipping rich HTML blocks already tracked above)
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) {
        const parent = node.parentElement;
        if (!parent) continue;
        const tag = parent.tagName;
        if (tag === 'SCRIPT' || tag === 'STYLE' || tag === 'CODE') continue;
        if (parent.closest && parent.closest('[data-i18n-rich="true"]')) continue;

        const raw = node.nodeValue;
        const normalized = raw.replace(/\s+/g, ' ').trim();
        if (!normalized) continue;

        if (Object.prototype.hasOwnProperty.call(PT_TEXT_DICTIONARY, normalized)) {
            const leadingSpace = /^\s/.test(raw) ? ' ' : '';
            const trailingSpace = /\s$/.test(raw) ? ' ' : '';
            trackedTextNodes.push({
                node,
                enText: raw,
                ptText: `${leadingSpace}${PT_TEXT_DICTIONARY[normalized]}${trailingSpace}`
            });
        }
    }
}

/**
 * Update the Language Toggle Button UI in the header
 */
function updateLangToggleUI(lang) {
    const langBtn = document.getElementById('lang-toggle');
    const langText = document.getElementById('lang-text');
    if (langText) {
        langText.textContent = lang === 'pt' ? 'PT' : 'EN';
    }
    if (langBtn) {
        langBtn.setAttribute(
            'title',
            lang === 'pt' ? 'Alternar idioma para Inglês (EN)' : 'Switch language to Portuguese (PT-BR)'
        );
        langBtn.setAttribute(
            'aria-label',
            lang === 'pt' ? 'Idioma atual: Português. Clique para Inglês.' : 'Current language: English. Click for Portuguese.'
        );
    }
}

/**
 * Apply language ('en' or 'pt') across static DOM and all dynamic interactive components
 */
function setLanguage(lang) {
    const targetLang = lang === 'pt' ? 'pt' : 'en';
    window.currentLang = targetLang;
    localStorage.setItem('lang', targetLang);
    document.documentElement.setAttribute('lang', targetLang === 'pt' ? 'pt-BR' : 'en');

    ensureDomSnapshot();

    // 1. Update rich HTML elements
    trackedHtmlElements.forEach(item => {
        item.el.innerHTML = targetLang === 'pt' ? item.ptHtml : item.enHtml;
    });

    // 2. Update static text nodes
    trackedTextNodes.forEach(item => {
        item.node.nodeValue = targetLang === 'pt' ? item.ptText : item.enText;
    });

    // 3. Update Header Toggle Button
    updateLangToggleUI(targetLang);

    // 4. Refresh Theme Toggle Label (Dark/Light <-> Escuro/Claro)
    if (typeof setTheme === 'function') {
        const currentTheme = document.documentElement.classList.contains('light-mode') ? 'light' : 'dark';
        setTheme(currentTheme);
    }

    // 5. Refresh OrionPay Architecture Case Study Tab
    if (typeof switchOrionTab === 'function') {
        switchOrionTab(window.activeOrionTab || 'switch');
    }

    // 6. Refresh Technical Skills Matrix
    if (typeof filterSkills === 'function') {
        filterSkills(window.activeSkillCategory || 'all');
    }

    // 7. Refresh Simulator & Hero Preview UI without losing current step/scenario state
    if (typeof renderHeroPreviewUI === 'function') {
        renderHeroPreviewUI();
    }
    if (typeof renderStepCardsList === 'function') {
        renderStepCardsList();
    }
    if (typeof renderStepInspector === 'function') {
        const stepIdx = (typeof currentStepIndex === 'number' && currentStepIndex >= 0) ? currentStepIndex : 0;
        renderStepInspector(stepIdx, false);
    }
    if (typeof renderSimulatedStorageTables === 'function') {
        renderSimulatedStorageTables();
    }
    if (typeof updateControlButtonsUI === 'function') {
        updateControlButtonsUI();
    }
    const summaryEl = document.getElementById('sim-scenario-summary');
    if (summaryEl && typeof activeScenarioId === 'string' && typeof SIM_SCENARIOS === 'object' && SIM_SCENARIOS[activeScenarioId]) {
        summaryEl.textContent = (targetLang === 'pt' && window.SIM_PT_SUMMARIES && window.SIM_PT_SUMMARIES[activeScenarioId])
            ? window.SIM_PT_SUMMARIES[activeScenarioId]
            : SIM_SCENARIOS[activeScenarioId].summaryBanner;
    }

    if (typeof drawArchitectureArrows === 'function') {
        drawArchitectureArrows();
    }

    if (window.lucide && typeof window.lucide.createIcons === 'function') {
        window.lucide.createIcons();
    }
}

/**
 * Toggle between English ('en') and Brazilian Portuguese ('pt')
 */
function toggleLanguage() {
    const nextLang = window.currentLang === 'pt' ? 'en' : 'pt';
    setLanguage(nextLang);
}

/**
 * Initialize language on page load
 */
function initLanguage() {
    const saved = localStorage.getItem('lang');
    const initialLang = saved === 'pt' ? 'pt' : 'en';
    setLanguage(initialLang);
}

