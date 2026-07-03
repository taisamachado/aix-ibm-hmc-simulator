// AIX Operational Commands Simulator
// Practice commands for day-to-day administration and troubleshooting

let activeScenario = null;
let scenarioStepIndex = 0;

const practiceScenarios = {
    slow_server: {
        title: 'Servidor lento',
        description: 'CPU/memória alta — investigar performance',
        steps: [
            { match: (cmd, args) => cmd === 'vmstat', hint: 'Próximo: svmon -G (memória detalhada)' },
            { match: (cmd, args) => cmd === 'svmon' && args.includes('-g'), hint: 'Próximo: errpt (log de erros)' },
            { match: (cmd, args) => cmd === 'errpt', hint: 'Cenário concluído! Servidor lento diagnosticado.' }
        ],
        startHint: 'Usuários reportam lentidão. Execute: vmstat 1 5'
    },
    service_down: {
        title: 'Serviço parado',
        description: 'SSH ou serviço crítico indisponível',
        steps: [
            { match: (cmd, args) => cmd === 'lssrc', hint: 'Próximo: ps -ef | grep sshd (ou: ps -ef)' },
            { match: (cmd, args) => cmd === 'ps', hint: 'Próximo: errpt -a (detalhes do erro)' },
            { match: (cmd, args) => cmd === 'errpt' && args.includes('-a'), hint: 'Cenário concluído! Identifique o serviço inativo e reinicie com startsrc.' }
        ],
        startHint: 'SSH não responde. Execute: lssrc -a'
    },
    disk_full: {
        title: 'Disco cheio',
        description: 'Filesystem /var com pouco espaço',
        steps: [
            { match: (cmd, args) => cmd === 'df', hint: 'Próximo: errpt (verificar erros de disco)' },
            { match: (cmd, args) => cmd === 'errpt', hint: 'Próximo: lslv -l (verificar LVs)' },
            { match: (cmd, args) => cmd === 'lslv', hint: 'Cenário concluído! Limpe /var/adm ou expanda o LV.' }
        ],
        startHint: 'Alerta de disco cheio. Execute: df -g'
    }
};

function initOperationalState(hostname) {
    const host = hostname || 'AIX-LPAR';
    Object.assign(aixSystemState, {
        hostname: host,
        uptimeDays: 14,
        uptimeHours: 6,
        uptimeMinutes: 32,
        bootTime: 'Jun 19 03:45',
        services: [
            { name: 'sshd', group: 'sshd', pid: 884210, status: 'active' },
            { name: 'cron', group: 'cron', pid: 661002, status: 'active' },
            { name: 'syslogd', group: 'syslogd', pid: 589440, status: 'active' },
            { name: 'sendmail', group: 'sendmail', pid: 0, status: 'inoperative' },
            { name: 'httpd', group: 'httpd', pid: 0, status: 'inoperative' }
        ],
        processes: [
            { user: 'root', pid: 1, ppid: 0, cpu: 0.0, args: '/etc/init' },
            { user: 'root', pid: 884210, ppid: 1, cpu: 0.1, args: '/usr/sbin/sshd' },
            { user: 'root', pid: 661002, ppid: 1, cpu: 0.0, args: '/usr/sbin/cron' },
            { user: 'oracle', pid: 1200344, ppid: 1, cpu: 78.5, args: 'oraclePROD (LOCAL=NO)' },
            { user: 'oracle', pid: 1200456, ppid: 1, cpu: 45.2, args: 'oraclePROD (LOCAL=NO)' },
            { user: 'root', pid: 589440, ppid: 1, cpu: 0.2, args: '/usr/sbin/syslogd' },
            { user: 'guest', pid: 1302100, ppid: 884210, cpu: 12.3, args: '-ksh' }
        ],
        errorLog: [
            { identifier: 'AA1B2C3D', timestamp: 'Thu Jul  3 08:15:22 2025', type: 'PERF', class: 'S', resource: 'CPU', description: 'CPU utilization exceeded 90% threshold' },
            { identifier: 'EE4F5G6H', timestamp: 'Thu Jul  3 07:42:10 2025', type: 'DISK', class: 'S', resource: 'hdisk0', description: '/var filesystem 92% full' },
            { identifier: 'II7J8K9L', timestamp: 'Wed Jul  2 22:30:05 2025', type: 'SOFT', class: 'S', resource: 'sendmail', description: 'Subprocess stopped unexpectedly' },
            { identifier: 'MM0N1O2P', timestamp: 'Wed Jul  2 18:05:44 2025', type: 'SOFT', class: 'S', resource: 'httpd', description: 'Subprocess stopped unexpectedly' }
        ],
        physicalVolumes: [
            { name: 'hdisk0', status: 'active', pvid: '000a2b3c4d5e6f70', vg: 'rootvg', size: '100 GB' },
            { name: 'hdisk1', status: 'active', pvid: '000f1e2d3c4b5a60', vg: 'datavg', size: '500 GB' }
        ],
        logicalVolumes: [
            { lv: 'hd4', vg: 'rootvg', type: 'jfs2', lps: 8, pps: 8, mount: '/' },
            { lv: 'hd2', vg: 'rootvg', type: 'jfs2', lps: 16, pps: 16, mount: '/usr' },
            { lv: 'hd9var', vg: 'rootvg', type: 'jfs2', lps: 8, pps: 8, mount: '/var' },
            { lv: 'hd3', vg: 'rootvg', type: 'jfs2', lps: 8, pps: 8, mount: '/tmp' },
            { lv: 'lvdata', vg: 'datavg', type: 'jfs2', lps: 128, pps: 128, mount: '/data' }
        ],
        routes: [
            { destination: 'default', gateway: '192.168.1.1', interface: 'en0', flags: 'U' },
            { destination: '192.168.1.0', gateway: '192.168.1.100', interface: 'en0', flags: 'U' },
            { destination: '127.0.0.0', gateway: '127.0.0.1', interface: 'lo0', flags: 'U' }
        ],
        listeningPorts: [
            { proto: 'tcp4', address: '*.22', state: 'LISTEN' },
            { proto: 'tcp4', address: '*.514', state: 'LISTEN' },
            { proto: 'tcp4', address: '127.0.0.1.25', state: 'LISTEN' },
            { proto: 'tcp4', address: '*.8080', state: 'CLOSED' }
        ],
        cronJobs: [
            '0 2 * * * /usr/local/bin/backup_daily.sh',
            '*/15 * * * * /usr/local/bin/check_disk.sh',
            '0 0 1 * * /usr/local/bin/monthly_report.sh'
        ],
        loginHistory: [
            { user: 'root', tty: 'pts/0', date: 'Thu Jul  3 09:12', from: '192.168.1.50' },
            { user: 'oracle', tty: 'pts/1', date: 'Thu Jul  3 08:45', from: '192.168.1.55' },
            { user: 'root', tty: 'pts/0', date: 'Wed Jul  2 17:30', from: '192.168.1.50' }
        ],
        currentUsers: [
            { user: 'root', tty: 'pts/0', date: 'Jul  3 09:12', from: '192.168.1.50' }
        ]
    });
}

function startScenario(scenarioId) {
    const scenario = practiceScenarios[scenarioId];
    if (!scenario) return;

    activeScenario = scenarioId;
    scenarioStepIndex = 0;
    updateScenarioPanel();
    updateHint(scenario.startHint);
    printLine('', 'info');
    printLine(`📋 Cenário: ${scenario.title}`, 'success');
    printLine(scenario.description, 'info');
    printLine(`💡 ${scenario.startHint}`, 'warning');
    printLine('', 'info');
}

function checkScenarioProgress(cmd, args) {
    if (!activeScenario) return;

    const scenario = practiceScenarios[activeScenario];
    const step = scenario.steps[scenarioStepIndex];

    if (step && step.match(cmd, args)) {
        scenarioStepIndex++;
        if (scenarioStepIndex >= scenario.steps.length) {
            printLine('', 'info');
            printLine('✅ Cenário concluído com sucesso!', 'success');
            activeScenario = null;
            scenarioStepIndex = 0;
            updateScenarioPanel();
            updateHint('Escolha outro cenário ou pratique comandos livremente.');
        } else {
            updateHint(scenario.steps[scenarioStepIndex - 1].hint);
            updateScenarioPanel();
        }
    }
}

function updateScenarioPanel() {
    const panel = document.getElementById('scenarioPanel');
    if (!panel) return;

    if (!activeScenario) {
        panel.innerHTML = `
            <p class="scenario-idle">Nenhum cenário ativo.</p>
            <button class="btn-scenario" onclick="startScenario('slow_server')">🐢 Servidor lento</button>
            <button class="btn-scenario" onclick="startScenario('service_down')">🔌 Serviço parado</button>
            <button class="btn-scenario" onclick="startScenario('disk_full')">💾 Disco cheio</button>
        `;
        return;
    }

    const scenario = practiceScenarios[activeScenario];
    const stepsHtml = scenario.steps.map((step, i) => {
        let cls = 'scenario-step pending';
        if (i < scenarioStepIndex) cls = 'scenario-step done';
        else if (i === scenarioStepIndex) cls = 'scenario-step active';
        return `<div class="${cls}">Passo ${i + 1}</div>`;
    }).join('');

    panel.innerHTML = `
        <p class="scenario-active-title">${scenario.title}</p>
        <div class="scenario-steps">${stepsHtml}</div>
        <button class="btn-scenario btn-scenario-cancel" onclick="cancelScenario()">Cancelar cenário</button>
    `;
}

function cancelScenario() {
    activeScenario = null;
    scenarioStepIndex = 0;
    updateScenarioPanel();
    updateHint('Cenário cancelado. Digite "help" para ver comandos.');
}

function updateSidebarForPracticeMode() {
    const progressPanel = document.querySelector('.progress-panel');
    if (progressPanel) progressPanel.style.display = 'none';

    const quickCommands = document.getElementById('quickCommands');
    if (quickCommands) {
        quickCommands.innerHTML = `
            <p><strong>Performance:</strong> vmstat, svmon -G</p>
            <p><strong>Logs:</strong> errpt, errpt -a</p>
            <p><strong>Serviços:</strong> lssrc -a</p>
            <p><strong>Rede:</strong> netstat -an, netstat -rn</p>
            <p><strong>Sistema:</strong> ps -ef, df -g, who</p>
            <p><strong>Help:</strong> help, scenario</p>
        `;
    }

    updateScenarioPanel();
}

function updateSidebarForInstallMode() {
    const progressPanel = document.querySelector('.progress-panel');
    if (progressPanel) progressPanel.style.display = 'block';

    const quickCommands = document.getElementById('quickCommands');
    if (quickCommands) {
        quickCommands.innerHTML = `
            <p><strong>SMS Menu:</strong> Press 1-5</p>
            <p><strong>Installation:</strong> Follow prompts</p>
            <p><strong>Help:</strong> Type 'help'</p>
        `;
    }

    const panel = document.getElementById('scenarioPanel');
    if (panel) {
        panel.innerHTML = '<p class="scenario-idle">Disponível no Modo Prática.</p>';
    }
}

function cmdErrpt(args) {
    if (args.includes('-a')) {
        aixSystemState.errorLog.forEach(entry => {
            printLine('LABEL: AA1B2C3D', 'info');
            printLine(`IDENTIFIER: ${entry.identifier}`, 'info');
            printLine(`Date/Time:       ${entry.timestamp}`, 'info');
            printLine(`Sequence Number: 100${entry.identifier.slice(0, 3)}`, 'info');
            printLine(`Machine Id:      000A2B3C4D5E`, 'info');
            printLine(`Class:           ${entry.class}`, 'info');
            printLine(`Type:            ${entry.type}`, 'info');
            printLine(`Resource Name:   ${entry.resource}`, 'info');
            printLine(`Description`, 'info');
            printLine(`  ${entry.description}`, 'warning');
            printLine('', 'info');
        });
    } else {
        printLine('IDENTIFIER  TIMESTAMP           T C RESOURCE_NAME  DESCRIPTION', 'info');
        printLine('AA1B2C3D    0703081522 2025 T S CPU            CPU utilization exceeded 90%', 'warning');
        printLine('EE4F5G6H    0703074210 2025 T S hdisk0         /var filesystem 92% full', 'warning');
        printLine('II7J8K9L    0702223005 2025 T S sendmail       Subprocess stopped unexpectedly', 'error');
        printLine('MM0N1O2P    0702180544 2025 T S httpd          Subprocess stopped unexpectedly', 'error');
    }
    checkScenarioProgress('errpt', args);
}

function cmdLssrc(args) {
    if (args.includes('-a') || args.includes('-l')) {
        printLine('Subsystem Group     PID     Status', 'info');
        aixSystemState.services.forEach(svc => {
            const pid = svc.pid || '';
            const statusClass = svc.status === 'active' ? 'success' : 'error';
            printLine(`${svc.name.padEnd(12)} ${svc.group.padEnd(12)} ${String(pid).padEnd(8)} ${svc.status}`, statusClass);
        });
    } else if (args.startsWith('-s')) {
        const name = args.replace('-s', '').trim();
        const svc = aixSystemState.services.find(s => s.name === name);
        if (svc) {
            printLine(`${svc.name} is ${svc.status}.`, svc.status === 'active' ? 'success' : 'error');
        } else {
            printLine(`${name}: Subsystem not found.`, 'error');
        }
    } else {
        printLine('Usage: lssrc -a (all) | lssrc -s <name> (specific)', 'info');
    }
    checkScenarioProgress('lssrc', args);
}

function cmdVmstat(args) {
    const parts = args.split(/\s+/).filter(Boolean);
    const interval = parts[0] ? parseInt(parts[0], 10) : 0;
    const count = parts[1] ? parseInt(parts[1], 10) : 1;
    const iterations = interval > 0 ? Math.min(count, 5) : 1;

    printLine('System configuration: lcpu=4 mem=32768MB', 'info');
    printLine('', 'info');
    printLine('kthr    memory              page              faults       cpu', 'info');
    printLine('----- ----------- ------------------------ ----------- -----------', 'info');
    printLine(' r  b   avm   fre  re  pi  po  fr   sr  cy  in   sy  cs us sy id wa', 'info');

    for (let i = 0; i < iterations; i++) {
        const r = i === 0 ? 3 : 2;
        const us = i === 0 ? 78 : 72;
        const sy = 15;
        const id = 100 - us - sy;
        printLine(`${String(r).padStart(2)}  0  8420  12400   0   0   0   0    0   0 142  890 320 ${String(us).padStart(2)} ${String(sy).padStart(2)} ${String(id).padStart(2)}  0`, 'info');
    }

    if (iterations > 0 && aixSystemState.processes) {
        printLine('', 'info');
        printLine('⚠️  High CPU detected — process "oracle" consuming ~78% CPU', 'warning');
    }
    checkScenarioProgress('vmstat', args);
}

function cmdSvmon(args) {
    if (args.includes('-g') || args.includes('-G')) {
        printLine('               size       inuse        free', 'info');
        printLine('memory         32768       28400        4368', 'info');
        printLine('pg space        8192        2100        6092', 'info');
        printLine('', 'info');
        printLine('               work        pers        clnt', 'info');
        printLine('pin              4200           0           0', 'info');
        printLine('in use          28400        1200         800', 'info');
        printLine('', 'info');
        printLine('Page Size: 4 KB', 'info');
        printLine('⚠️  Memory pressure: 87% in use', 'warning');
    } else {
        printLine('Usage: svmon -G (global memory summary)', 'info');
    }
    checkScenarioProgress('svmon', args);
}

function cmdNetstat(args) {
    if (args.includes('-rn') || args === '-r') {
        printLine('Routing tables', 'info');
        printLine('Destination        Gateway            Flags   Refs     Use   If', 'info');
        aixSystemState.routes.forEach(r => {
            printLine(`${r.destination.padEnd(19)}${r.gateway.padEnd(19)}${r.flags.padEnd(8)}0       0    ${r.interface}`, 'info');
        });
    } else if (args.includes('-an') || args === '-a') {
        printLine('Active Internet connections (including servers)', 'info');
        printLine('Proto Recv-Q Send-Q  Local Address          Foreign Address        (state)', 'info');
        aixSystemState.listeningPorts.forEach(p => {
            const addr = p.address.padEnd(22);
            printLine(`${p.proto.padEnd(6)}      0      0  ${addr}*.*                    ${p.state}`, p.state === 'LISTEN' ? 'success' : 'error');
        });
        printLine('tcp4       0      0  192.168.1.100.22       192.168.1.50.49152     ESTABLISHED', 'info');
    } else {
        printLine('Usage: netstat -an (connections) | netstat -rn (routing)', 'info');
    }
}

function cmdPs(args) {
    if (args.includes('-ef') || args.includes('-e')) {
        printLine('     UID     PID    PPID   C    STIME    TTY  TIME CMD', 'info');
        aixSystemState.processes.forEach(p => {
            const uid = p.user.padEnd(9);
            printLine(`${uid}${String(p.pid).padStart(7)}${String(p.ppid).padStart(8)}${String(Math.floor(p.cpu)).padStart(4)} 09:00:00      -  0:00 ${p.args}`, p.cpu > 50 ? 'warning' : 'info');
        });
    } else {
        printLine('Usage: ps -ef (list all processes)', 'info');
    }
    checkScenarioProgress('ps', args);
}

function cmdCrontab(args) {
    if (args.includes('-l')) {
        printLine('# Crontab for root', 'info');
        aixSystemState.cronJobs.forEach(job => printLine(job, 'info'));
    } else {
        printLine('Usage: crontab -l (list cron jobs)', 'info');
    }
}

function cmdWho(args) {
    aixSystemState.currentUsers.forEach(u => {
        printLine(`${u.user}     ${u.tty}        ${u.date} (${u.from})`, 'info');
    });
}

function cmdLast(args) {
    const count = args.match(/^-(\d+)/) ? parseInt(args.match(/^-(\d+)/)[1], 10) : 5;
    aixSystemState.loginHistory.slice(0, count).forEach(entry => {
        printLine(`${entry.user.padEnd(8)} ${entry.tty.padEnd(6)} ${entry.from.padEnd(16)} ${entry.date}  still logged in`, 'info');
    });
}

function cmdUname(args) {
    if (args.includes('-a')) {
        printLine(`AIX ${aixSystemState.hostname} 3 7 00F1234567890 000A2B3C4D5E`, 'info');
    } else if (args.includes('-r')) {
        printLine('3', 'info');
    } else if (args.includes('-M')) {
        printLine('AIX', 'info');
    } else {
        printLine('AIX', 'info');
    }
}

function cmdUptime() {
    const { uptimeDays, uptimeHours, uptimeMinutes, bootTime } = aixSystemState;
    printLine(`  ${uptimeDays}:${String(uptimeHours).padStart(2, '0')}:${String(uptimeMinutes).padStart(2, '0')}   up ${uptimeDays} days, ${uptimeHours}:${String(uptimeMinutes).padStart(2, '0')},  1 user,  load average: 4.82, 3.15, 2.08`, 'info');
    printLine(`System booted: ${bootTime}`, 'info');
}

function cmdLspv(args) {
    aixSystemState.physicalVolumes.forEach(pv => {
        printLine(`PV NAME         PV STATE          TOTAL PPs   FREE PPs    PV ID`, 'info');
        printLine(`${pv.name.padEnd(16)}${pv.status.padEnd(18)}${String(128).padStart(10)}${String(42).padStart(10)}    ${pv.pvid}`, 'info');
        printLine(`VG NAME: ${pv.vg}                   SIZE: ${pv.size}`, 'info');
        printLine('', 'info');
    });
}

function cmdLslv(args) {
    if (args.includes('-l')) {
        aixSystemState.logicalVolumes.forEach(lv => {
            printLine(`LOGICAL VOLUME:     ${lv.lv}                   VOLUME GROUP: ${lv.vg}`, 'info');
            printLine(`LV STATE:           open/syncd    TYPE:         ${lv.type}`, 'info');
            printLine(`MOUNT POINT:        ${lv.mount}          LPs/PVs/PPs:  ${lv.lps}/${lv.pps}/${lv.pps}`, 'info');
            printLine('', 'info');
        });
    } else {
        printLine('LV NAME               TYPE       LPs   PPs   PVs  LV STATE      MOUNT POINT', 'info');
        aixSystemState.logicalVolumes.forEach(lv => {
            printLine(`${lv.lv.padEnd(22)}${lv.type.padEnd(11)}${String(lv.lps).padStart(4)}  ${String(lv.pps).padStart(4)}     1  open/syncd    ${lv.mount}`, 'info');
        });
    }
    checkScenarioProgress('lslv', args);
}

function cmdPing(args) {
    const host = args.trim() || '192.168.1.1';
    printLine(`PING ${host}: (56) data bytes`, 'info');
    printLine('', 'info');
    for (let i = 1; i <= 3; i++) {
        printLine(`64 bytes from ${host}: icmp_seq=${i} ttl=255 time=0.${i} ms`, 'success');
    }
    printLine('', 'info');
    printLine(`----${host} PING Statistics----`, 'info');
    printLine('3 packets transmitted, 3 packets received, 0% packet loss', 'success');
}

function cmdScenario(args) {
    if (!args) {
        printLine('Cenários disponíveis:', 'info');
        printLine('  scenario slow_server   - Servidor lento (vmstat → svmon → errpt)', 'info');
        printLine('  scenario service_down  - Serviço parado (lssrc → ps → errpt)', 'info');
        printLine('  scenario disk_full     - Disco cheio (df → errpt → lslv)', 'info');
        return;
    }
    if (practiceScenarios[args]) {
        startScenario(args);
    } else {
        printLine(`Cenário "${args}" não encontrado.`, 'error');
    }
}

function handleOperationalCommand(cmd, args, fullCommand) {
    const handlers = {
        errpt: () => cmdErrpt(args),
        lssrc: () => cmdLssrc(args),
        vmstat: () => cmdVmstat(args),
        svmon: () => cmdSvmon(args),
        netstat: () => cmdNetstat(args),
        ps: () => cmdPs(args),
        crontab: () => cmdCrontab(args),
        who: () => cmdWho(args),
        last: () => cmdLast(args),
        uname: () => cmdUname(args),
        uptime: () => cmdUptime(args),
        lspv: () => cmdLspv(args),
        lslv: () => cmdLslv(args),
        ping: () => cmdPing(args),
        scenario: () => cmdScenario(args)
    };

    if (handlers[cmd]) {
        handlers[cmd]();
        return true;
    }
    return false;
}

function getOperationalHelpLines() {
    return [
        '',
        '🔍 Troubleshooting & Performance:',
        '  errpt        - Error log summary',
        '  errpt -a     - Detailed error report',
        '  vmstat 1 5   - CPU/memory statistics',
        '  svmon -G     - Global memory usage',
        '  lssrc -a     - All subsystem status',
        '  ps -ef       - Process list',
        '',
        '🌐 Network:',
        '  netstat -an  - Active connections',
        '  netstat -rn  - Routing table',
        '  ping <host>  - Test connectivity',
        '',
        '💾 Storage:',
        '  lspv         - Physical volumes',
        '  lslv -l      - Logical volumes detail',
        '',
        '👤 Users & Scheduling:',
        '  who          - Logged in users',
        '  last         - Login history',
        '  crontab -l   - Scheduled jobs',
        '',
        '📊 System:',
        '  uname -a     - System information',
        '  uptime       - System uptime & load',
        '',
        '🎯 Guided Scenarios:',
        '  scenario slow_server   - Practice slow server diagnosis',
        '  scenario service_down  - Practice service troubleshooting',
        '  scenario disk_full     - Practice disk space issues'
    ];
}
