// AIX Installation Console Simulator
let currentStep = 0;
let currentScreen = 'boot';
let installationProgress = 0;
let lparData = null;

// AIX System State (for update simulation)
let aixSystemState = {
    version: '7300-00-00-0000',
    tl: '7300-00',
    filesets: [
        { name: 'bos.rte', version: '7.3.0.0', state: 'COMMITTED' },
        { name: 'bos.net.tcp.client', version: '7.3.0.0', state: 'COMMITTED' },
        { name: 'bos.perf.tools', version: '7.3.0.0', state: 'COMMITTED' },
        { name: 'xlC.rte', version: '16.1.0.0', state: 'COMMITTED' }
    ],
    updatesDownloaded: false,
    updateType: null, // 'TL', 'SP', or 'SECURITY'
    updateVersion: null,
    backupCreated: false,
    needsReboot: false
};

// Available updates
const availableUpdates = {
    'TL': {
        version: '7300-01-00-0000',
        tl: '7300-01',
        description: 'AIX 7.3 Technology Level 1',
        size: '4.2 GB',
        releaseDate: '2023-11-15',
        filesets: [
            { name: 'bos.rte', version: '7.3.1.0' },
            { name: 'bos.net.tcp.client', version: '7.3.1.0' },
            { name: 'bos.perf.tools', version: '7.3.1.0' },
            { name: 'xlC.rte', version: '16.1.0.1' }
        ]
    },
    'SP': {
        version: '7300-01-02-2148',
        tl: '7300-01',
        description: 'AIX 7.3 TL1 Service Pack 2',
        size: '1.8 GB',
        releaseDate: '2024-03-20',
        filesets: [
            { name: 'bos.rte', version: '7.3.1.2' },
            { name: 'bos.net.tcp.client', version: '7.3.1.2' },
            { name: 'bos.perf.tools', version: '7.3.1.2' },
            { name: 'xlC.rte', version: '16.1.0.2' }
        ]
    },
    'SECURITY': {
        version: '7300-00-01-2301',
        tl: '7300-00',
        description: 'Security Fix for CVE-2024-1234',
        size: '245 MB',
        releaseDate: '2024-06-15',
        filesets: [
            { name: 'bos.net.tcp.client', version: '7.3.0.1' }
        ]
    }
};

// Installation workflow
const installationFlow = {
    boot: {
        step: 1,
        hint: 'Press 1 to enter SMS Menu, or press 5 to continue boot',
        validInputs: ['1', '5'],
        nextScreen: {
            '1': 'sms_main',
            '5': 'sms_main'
        }
    },
    sms_main: {
        step: 1,
        hint: 'Select option 1 to configure boot options',
        validInputs: ['1', '2', '3', '4', '5'],
        nextScreen: {
            '1': 'sms_boot_options'
        }
    },
    sms_boot_options: {
        step: 2,
        hint: 'Select option 1 to choose installation device',
        validInputs: ['1', '2', '3', '4'],
        nextScreen: {
            '1': 'sms_device_type'
        }
    },
    sms_device_type: {
        step: 2,
        hint: 'Select 1 for CD/DVD installation media',
        validInputs: ['1', '2', '3', '4'],
        nextScreen: {
            '1': 'sms_select_media'
        }
    },
    sms_select_media: {
        step: 2,
        hint: 'Select 1 to boot from AIX 7.3 installation media',
        validInputs: ['1', '2'],
        nextScreen: {
            '1': 'sms_confirm_boot'
        }
    },
    sms_confirm_boot: {
        step: 2,
        hint: 'Select 1 to boot from this device',
        validInputs: ['1', '2'],
        nextScreen: {
            '1': 'aix_welcome'
        }
    },
    aix_welcome: {
        step: 3,
        hint: 'Type 1 to start AIX installation',
        validInputs: ['1', '2', '3'],
        nextScreen: {
            '1': 'aix_language'
        }
    },
    aix_language: {
        step: 3,
        hint: 'Select 1 for English or 2 for Portuguese',
        validInputs: ['1', '2', '3', '4', '5'],
        nextScreen: {
            '1': 'aix_install_type',
            '2': 'aix_install_type'
        }
    },
    aix_install_type: {
        step: 3,
        hint: 'Select 1 for New and Complete Overwrite installation',
        validInputs: ['1', '2', '3'],
        nextScreen: {
            '1': 'aix_select_disk'
        }
    },
    aix_select_disk: {
        step: 4,
        hint: 'Select 1 to install on hdisk0',
        validInputs: ['1'],
        nextScreen: {
            '1': 'aix_confirm_format'
        }
    },
    aix_confirm_format: {
        step: 4,
        hint: 'Type "yes" to confirm disk formatting (WARNING: All data will be lost!)',
        validInputs: ['yes', 'no'],
        nextScreen: {
            'yes': 'aix_disk_layout',
            'no': 'aix_select_disk'
        }
    },
    aix_disk_layout: {
        step: 4,
        hint: 'Select 1 for automatic disk layout (recommended)',
        validInputs: ['1', '2'],
        nextScreen: {
            '1': 'aix_installing'
        }
    },
    aix_installing: {
        step: 5,
        hint: 'Installation in progress... Please wait (this takes 15-20 minutes in real life)',
        validInputs: [],
        nextScreen: {}
    },
    aix_root_password: {
        step: 6,
        hint: 'Enter a strong password for root user (min 8 characters)',
        validInputs: ['*'],
        nextScreen: {
            '*': 'aix_complete'
        }
    },
    aix_complete: {
        step: 7,
        hint: 'Installation complete! Press Enter to reboot',
        validInputs: ['', 'enter'],
        nextScreen: {
            '': 'aix_first_boot',
            'enter': 'aix_first_boot'
        }
    },
    aix_first_boot: {
        step: 7,
        hint: 'AIX is booting... Wait for login prompt',
        validInputs: [],
        nextScreen: {}
    },
    aix_login: {
        step: 7,
        hint: 'Type "root" to login',
        validInputs: ['root'],
        nextScreen: {
            'root': 'aix_password'
        }
    },
    aix_password: {
        step: 7,
        hint: 'Enter the root password you configured',
        validInputs: ['*'],
        nextScreen: {
            '*': 'aix_shell'
        }
    },
    aix_shell: {
        step: 7,
        hint: 'You are now logged into AIX! Try commands like: oslevel, hostname, ifconfig',
        validInputs: ['*'],
        nextScreen: {}
    }
};

// Screen content templates
const screens = {
    boot: () => `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║              IBM PowerPC Firmware                            ║
║              Version: VH950_105                              ║
║                                                              ║
║              Copyright IBM Corporation 1990-2023             ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Initializing hardware...
[OK] CPU: 4 cores detected
[OK] Memory: 32768 MB
[OK] Network adapters: 1
[OK] Storage devices: 1

Press 1 for SMS Menu
Press 5 to continue boot

Waiting... (5 seconds)

`,
    
    sms_main: () => `
╔══════════════════════════════════════════════════════════════╗
║                    SMS Main Menu                             ║
╚══════════════════════════════════════════════════════════════╝

1. Select Boot Options
2. Setup Remote IPL (Initial Program Load)
3. Change SCSI Settings
4. Select Console
5. Exit to Open Firmware

Selection: `,

    sms_boot_options: () => `
╔══════════════════════════════════════════════════════════════╗
║                  Select Boot Options                         ║
╚══════════════════════════════════════════════════════════════╝

1. Select Install/Boot Device
2. Configure Boot Device Order
3. Multiboot
4. Return to Main Menu

Selection: `,

    sms_device_type: () => `
╔══════════════════════════════════════════════════════════════╗
║                  Select Device Type                          ║
╚══════════════════════════════════════════════════════════════╝

1. CD/DVD
2. Hard Drive
3. Network
4. Tape

Selection: `,

    sms_select_media: () => `
╔══════════════════════════════════════════════════════════════╗
║                    Select Media                              ║
╚══════════════════════════════════════════════════════════════╝

Available Devices:

1. SCSI CD-ROM (AIX 7.3 Installation Media)
   Location: U9117.MMA.10A1B2C-V1-C2
   
2. Virtual CD-ROM
   Location: U9117.MMA.10A1B2C-V1-C3

Selection: `,

    sms_confirm_boot: () => `
╔══════════════════════════════════════════════════════════════╗
║                  Confirm Boot Device                         ║
╚══════════════════════════════════════════════════════════════╝

Selected Device:
  SCSI CD-ROM
  AIX 7.3 Installation Media
  Location: U9117.MMA.10A1B2C-V1-C2

1. Boot from this device
2. Return to previous menu

Selection: `,

    aix_welcome: () => `

╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║         Welcome to AIX Installation and Maintenance          ║
║                                                              ║
║                    AIX Version 7.3                           ║
║                  Technology Level 00                         ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

Loading installation environment...
[████████████████████████████████████████] 100%

1. Start Installation
2. Start Maintenance Mode for System Recovery
3. Exit to AIX Shell

>>> `,

    aix_language: () => `
╔══════════════════════════════════════════════════════════════╗
║                    Select Language                           ║
╚══════════════════════════════════════════════════════════════╝

1. English (United States)
2. Portuguese (Brazil)
3. Spanish (Spain)
4. French (France)
5. German (Germany)

>>> `,

    aix_install_type: () => `
╔══════════════════════════════════════════════════════════════╗
║                   Installation Type                          ║
╚══════════════════════════════════════════════════════════════╝

1. New and Complete Overwrite
   - Installs a new copy of AIX
   - Destroys all existing data on target disk
   - Recommended for new installations

2. Preservation Install
   - Preserves existing user data
   - Updates AIX to new version

3. Migration Install
   - Migrates from older AIX version
   - Preserves configuration

>>> `,

    aix_select_disk: () => `
╔══════════════════════════════════════════════════════════════╗
║                   Select Target Disk                         ║
╚══════════════════════════════════════════════════════════════╝

Available Disks:

1. hdisk0
   Size: 100 GB
   Type: VIOS Virtual Disk
   Location: U9117.MMA.10A1B2C-V1-C4-T1
   Status: Available

>>> `,

    aix_confirm_format: () => `
╔══════════════════════════════════════════════════════════════╗
║                        WARNING!                              ║
╚══════════════════════════════════════════════════════════════╝

All data on hdisk0 will be DESTROYED!

This operation cannot be undone.

Target Disk: hdisk0 (100 GB)
Installation Type: New and Complete Overwrite

Are you sure you want to continue? (yes/no)

>>> `,

    aix_disk_layout: () => `
╔══════════════════════════════════════════════════════════════╗
║                     Disk Layout                              ║
╚══════════════════════════════════════════════════════════════╝

1. Automatic (Recommended)
   - / (root)        : 4096 MB
   - /usr            : 8192 MB
   - /var            : 4096 MB
   - /tmp            : 4096 MB
   - /home           : 2048 MB
   - /opt            : 4096 MB
   - swap            : 8192 MB
   - Remaining space : Available for expansion

2. Custom
   - Manually configure filesystem sizes

>>> `,

    aix_installing: (progress) => `
╔══════════════════════════════════════════════════════════════╗
║                Installing AIX 7.3...                         ║
╚══════════════════════════════════════════════════════════════╝

Progress: [${getProgressBar(progress)}] ${progress}%

Current Phase: ${getInstallPhase(progress)}

Elapsed Time: ${getElapsedTime(progress)}
Estimated Remaining: ${getRemainingTime(progress)}

Please wait... Do not power off the system!

${progress < 100 ? '\nInstalling packages...' : '\nInstallation complete!'}
`,

    aix_root_password: () => `
╔══════════════════════════════════════════════════════════════╗
║                  Set Root Password                           ║
╚══════════════════════════════════════════════════════════════╝

Enter new password for root user:

Password requirements:
  - Minimum 8 characters
  - At least 1 uppercase letter
  - At least 1 lowercase letter
  - At least 1 number
  - At least 1 special character (recommended)

New password: `,

    aix_complete: () => `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║            Installation Complete!                            ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝

AIX 7.3 has been successfully installed on ${lparData?.name || 'this LPAR'}

Installation Summary:
  - Operating System: AIX 7.3.0.0
  - Root Volume Group: rootvg
  - Total Disk Space: 100 GB
  - Filesystems Created: 7
  - Packages Installed: 1,247

The system will reboot in 10 seconds...

Press Enter to reboot now, or wait for automatic reboot.

`,

    aix_first_boot: () => `

Rebooting system...


╔══════════════════════════════════════════════════════════════╗
║              AIX Version 7.3                                 ║
║              Copyright IBM Corporation, 1982-2023            ║
╚══════════════════════════════════════════════════════════════╝

Booting AIX...

Loading kernel...                                          [OK]
Initializing devices...                                    [OK]
Configuring network interfaces...                          [OK]
Starting system services...
  - cron                                                   [OK]
  - syslogd                                                [OK]
  - sshd                                                   [OK]
  - sendmail                                               [OK]

System boot completed.

`,

    aix_login: () => `
AIX Version 7.3
${lparData?.name || 'AIX-LPAR'}

login: `,

    aix_password: () => `Password: `,

    aix_shell: () => `
*************************************
*                                   *
*    Welcome to AIX Version 7.3    *
*                                   *
*************************************

Last login: Never

You are now logged in as root.

Type 'help' for available commands, or try:
  - oslevel    : Check AIX version
  - vmstat 1 5 : CPU/memory stats
  - errpt      : Error log
  - lssrc -a   : Service status
  - ps -ef     : Process list
  - scenario   : Guided troubleshooting

# `
};

// Helper functions
function getProgressBar(progress) {
    const filled = Math.floor(progress / 2.5);
    const empty = 40 - filled;
    return '█'.repeat(filled) + '░'.repeat(empty);
}

function getInstallPhase(progress) {
    if (progress < 10) return 'Preparing installation...';
    if (progress < 30) return 'Installing base operating system...';
    if (progress < 50) return 'Installing additional packages...';
    if (progress < 70) return 'Configuring system...';
    if (progress < 90) return 'Installing documentation...';
    if (progress < 100) return 'Finalizing installation...';
    return 'Installation complete!';
}

function getElapsedTime(progress) {
    const minutes = Math.floor(progress / 5);
    return `${minutes} minutes`;
}

function getRemainingTime(progress) {
    const remaining = Math.floor((100 - progress) / 5);
    return `~${remaining} minutes`;
}

// Console output functions
function printLine(text, className = 'system') {
    const output = document.getElementById('consoleOutput');
    const line = document.createElement('div');
    line.className = `console-line ${className}`;
    line.textContent = text;
    output.appendChild(line);
    scrollToBottom();
}

function printScreen(screenName, ...args) {
    const output = document.getElementById('consoleOutput');
    const screenContent = screens[screenName](...args);
    const lines = screenContent.split('\n');
    
    lines.forEach(line => {
        printLine(line, 'system');
    });
}

function clearConsole() {
    document.getElementById('consoleOutput').innerHTML = '';
}

function scrollToBottom() {
    const screen = document.getElementById('consoleScreen');
    screen.scrollTop = screen.scrollHeight;
}

function showInput(prompt = '>>> ') {
    const inputLine = document.getElementById('inputLine');
    const promptEl = document.getElementById('prompt');
    const input = document.getElementById('consoleInput');
    
    promptEl.textContent = prompt;
    inputLine.style.display = 'flex';
    input.value = '';
    input.focus();
    scrollToBottom();
}

function hideInput() {
    document.getElementById('inputLine').style.display = 'none';
}

function updateProgress(step) {
    const steps = document.querySelectorAll('.step');
    steps.forEach((stepEl, index) => {
        const stepNum = index + 1;
        stepEl.classList.remove('active', 'completed', 'pending');
        
        if (stepNum < step) {
            stepEl.classList.add('completed');
        } else if (stepNum === step) {
            stepEl.classList.add('active');
        } else {
            stepEl.classList.add('pending');
        }
    });
}

function updateHint(hint) {
    document.getElementById('currentHint').textContent = hint;
}

// Main installation logic
function startInstallation() {
    clearConsole();
    currentScreen = 'boot';
    currentStep = 1;
    activeScenario = null;
    scenarioStepIndex = 0;
    updateSidebarForInstallMode();
    updateProgress(1);
    
    document.getElementById('lparInfo').textContent =
        `LPAR ID: ${lparData?.id || 'N/A'} • Modo Instalação AIX 7.3`;
    
    printScreen('boot');
    
    setTimeout(() => {
        updateHint(installationFlow.boot.hint);
        showInput();
    }, 1000);
}

function startPracticeShell() {
    clearConsole();
    currentScreen = 'aix_shell';
    currentStep = 7;
    initOperationalState(lparData?.name);
    updateSidebarForPracticeMode();
    updateProgress(7);
    
    document.getElementById('lparInfo').textContent =
        `LPAR ID: ${lparData?.id || 'N/A'} • Modo Prática — Shell AIX 7.3`;
    
    printLine('', 'info');
    printLine('Modo Prática — Shell AIX 7.3', 'success');
    printLine('Digite "help" para ver todos os comandos.', 'info');
    printLine('Digite "scenario" para cenários guiados de troubleshooting.', 'info');
    printLine('', 'info');
    
    handleScreen('aix_shell');
}

function processInput() {
    const input = document.getElementById('consoleInput');
    const rawValue = input.value;
    const value = rawValue.trim().toLowerCase();
    
    hideInput();
    printLine(`${document.getElementById('prompt').textContent}${rawValue}`, 'prompt');
    input.value = '';
    
    if (currentScreen === 'aix_shell') {
        handleShellCommand(value);
        return;
    }
    
    const flow = installationFlow[currentScreen];
    
    if (!flow) {
        handleShellCommand(value);
        return;
    }
    
    // Special handling for password and shell
    if (currentScreen === 'aix_root_password' || currentScreen === 'aix_password') {
        if (value.length >= 8) {
            proceedToNext(value);
        } else {
            printLine('Password too short. Minimum 8 characters required.', 'error');
            setTimeout(() => showInput('New password: '), 500);
        }
        return;
    }
    
    // Validate input
    if (flow.validInputs.includes(value) || flow.validInputs.includes('*')) {
        proceedToNext(value);
    } else {
        printLine(`Invalid selection. Please try again.`, 'error');
        setTimeout(() => showInput(), 500);
    }
}

function proceedToNext(input) {
    const flow = installationFlow[currentScreen];
    let nextScreen = flow.nextScreen[input] || flow.nextScreen['*'];
    
    if (!nextScreen) {
        printLine('Invalid option', 'error');
        setTimeout(() => showInput(), 500);
        return;
    }
    
    currentScreen = nextScreen;
    
    // Update progress
    if (installationFlow[nextScreen]) {
        const newStep = installationFlow[nextScreen].step;
        if (newStep !== currentStep) {
            currentStep = newStep;
            updateProgress(currentStep);
        }
    }
    
    setTimeout(() => {
        handleScreen(nextScreen);
    }, 500);
}

function handleScreen(screenName) {
    switch (screenName) {
        case 'aix_installing':
            startInstallationProgress();
            break;
            
        case 'aix_first_boot':
            printScreen('aix_first_boot');
            setTimeout(() => {
                currentScreen = 'aix_login';
                printScreen('aix_login');
                updateHint(installationFlow.aix_login.hint);
                showInput('login: ');
            }, 3000);
            break;
            
        case 'aix_shell':
            initOperationalState(lparData?.name);
            updateSidebarForPracticeMode();
            document.getElementById('lparInfo').textContent =
                `LPAR ID: ${lparData?.id || 'N/A'} • Shell AIX 7.3 — digite "help"`;
            printScreen('aix_shell');
            updateHint(installationFlow.aix_shell.hint);
            showInput('# ');
            break;
            
        default:
            if (screens[screenName]) {
                printScreen(screenName);
                if (installationFlow[screenName]) {
                    updateHint(installationFlow[screenName].hint);
                    showInput();
                }
            }
    }
}

function startInstallationProgress() {
    printScreen('aix_installing', 0);
    installationProgress = 0;
    
    const interval = setInterval(() => {
        installationProgress += 5;
        
        if (installationProgress <= 100) {
            clearLastLines(20);
            printScreen('aix_installing', installationProgress);
        }
        
        if (installationProgress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                currentScreen = 'aix_root_password';
                printScreen('aix_root_password');
                updateHint(installationFlow.aix_root_password.hint);
                showInput('New password: ');
            }, 2000);
        }
    }, 800);
}

function clearLastLines(count) {
    const output = document.getElementById('consoleOutput');
    const lines = output.querySelectorAll('.console-line');
    const startIndex = Math.max(0, lines.length - count);
    
    for (let i = startIndex; i < lines.length; i++) {
        lines[i].remove();
    }
}

function handleShellCommand(command) {
    const parts = command.trim().split(/\s+/);
    const cmd = parts[0];
    const args = parts.slice(1).join(' ');
    
    if (handleOperationalCommand(cmd, args, command)) {
        setTimeout(() => showInput('# '), 100);
        return;
    }
    
    const commands = {
        'oslevel': () => {
            if (args === '-s') {
                printLine(aixSystemState.version, 'info');
            } else if (args === '-r') {
                printLine(aixSystemState.tl, 'info');
            } else {
                printLine(aixSystemState.version, 'info');
            }
        },
        'hostname': () => printLine(lparData?.name || 'AIX-LPAR', 'info'),
        'ifconfig': () => {
            printLine('lo0: flags=8000<LOOPBACK>', 'info');
            printLine('        inet 127.0.0.1 netmask 0xff000000', 'info');
            printLine('en0: flags=0<>', 'info');
            printLine('        inet 0.0.0.0 netmask 0x0', 'info');
        },
        'lsdev': () => {
            printLine('proc0 Available 00-00 Processor', 'info');
            printLine('mem0  Available    Memory', 'info');
            printLine('hdisk0 Available 00-08-00 16 Bit LVD SCSI Disk Drive', 'info');
        },
        'df': () => {
            printLine('Filesystem    GB blocks      Free %Used    Iused %Iused Mounted on', 'info');
            printLine('/dev/hd4           4.00      3.50   13%      156     1% /', 'info');
            printLine('/dev/hd2           8.00      5.20   35%     2341     3% /usr', 'info');
            printLine('/dev/hd9var        4.00      0.32   92%       89     1% /var', 'warning');
            printLine('/dev/hd3           4.00      3.95    2%       12     1% /tmp', 'info');
            checkScenarioProgress('df', args);
        },
        'lslpp': () => {
            if (args === '-L' || args === '-l') {
                printLine('  Fileset                      Level  State      Description', 'info');
                printLine('  ----------------------------------------------------------------------------', 'info');
                printLine('Path: /usr/lib/objrepos', 'info');
                aixSystemState.filesets.forEach(fs => {
                    const padding = ' '.repeat(Math.max(1, 30 - fs.name.length));
                    const versionPad = ' '.repeat(Math.max(1, 10 - fs.version.length));
                    printLine(`  ${fs.name}${padding}${fs.version}${versionPad}${fs.state}  ${fs.name === 'bos.rte' ? 'Base Operating System Runtime' : fs.name === 'bos.net.tcp.client' ? 'TCP/IP Client Support' : fs.name === 'bos.perf.tools' ? 'Performance Tools' : 'XL C/C++ Runtime'}`, 'info');
                });
            } else {
                printLine('Usage: lslpp -L (list all filesets)', 'info');
            }
        },
        'lppchk': () => {
            if (args === '-v') {
                printLine('Checking installed filesets...', 'info');
                setTimeout(() => {
                    printLine('All filesets are consistent.', 'success');
                    showInput('# ');
                }, 1500);
                return;
            }
            printLine('Usage: lppchk -v (verify filesets consistency)', 'info');
        },
        'instfix': () => {
            if (args === '-i') {
                printLine(`All filesets for ${aixSystemState.tl}_AIX_ML were found.`, 'info');
                printLine(`All filesets for ${aixSystemState.version} were found.`, 'info');
            } else {
                printLine('Usage: instfix -i (check installed fixes)', 'info');
            }
        },
        'suma': () => cmdSuma(args),
        'installp': () => cmdInstallp(args),
        'mksysb': () => cmdMksysb(args),
        'shutdown': () => cmdShutdown(args),
        'smitty': () => {
            printLine('Starting SMIT (System Management Interface Tool)...', 'info');
            printLine('', 'info');
            printLine('[Simulated] In real AIX, this would open the SMIT menu interface', 'info');
            printLine('', 'info');
            printLine('Common SMIT shortcuts:', 'info');
            printLine('  smitty install      - Install software', 'info');
            printLine('  smitty update_all   - Update all software', 'info');
            printLine('  smitty devices      - Device management', 'info');
            printLine('  smitty tcpip        - TCP/IP configuration', 'info');
        },
        'help': () => {
            printLine('═══════════════════════════════════════════════════════', 'info');
            printLine('  AIX COMMAND REFERENCE', 'success');
            printLine('═══════════════════════════════════════════════════════', 'info');
            printLine('', 'info');
            printLine('📊 System Information:', 'info');
            printLine('  oslevel      - Display AIX version', 'info');
            printLine('  oslevel -s   - Display detailed version', 'info');
            printLine('  oslevel -r   - Display Technology Level', 'info');
            printLine('  hostname     - Display system hostname', 'info');
            printLine('  lsdev        - List devices', 'info');
            printLine('', 'info');
            printLine('🌐 Network:', 'info');
            printLine('  ifconfig     - Display network configuration', 'info');
            printLine('', 'info');
            printLine('💾 Disk & Filesystem:', 'info');
            printLine('  df           - Display disk space', 'info');
            printLine('  df -g        - Display disk space in GB', 'info');
            printLine('', 'info');
            printLine('🔄 Software Management & Updates:', 'info');
            printLine('  lslpp -L     - List installed filesets', 'info');
            printLine('  lppchk -v    - Verify filesets consistency', 'info');
            printLine('  instfix -i   - Check installed fixes', 'info');
            printLine('', 'info');
            printLine('  📥 Download Updates:', 'info');
            printLine('    suma -x -a Action=Preview -a RqType=TL       # Preview TL', 'info');
            printLine('    suma -x -a Action=Preview -a RqType=SP       # Preview SP', 'info');
            printLine('    suma -x -a Action=Preview -a RqType=Security # Preview Security', 'info');
            printLine('    suma -x -a Action=Download -a RqType=TL      # Download TL', 'info');
            printLine('', 'info');
            printLine('  💿 Install Updates:', 'info');
            printLine('    mksysb -i /backup/backup.img    # Create backup FIRST!', 'info');
            printLine('    installp -apXd /updates all     # Preview installation', 'info');
            printLine('    installp -acgXd /updates all    # Install updates', 'info');
            printLine('    shutdown -Fr now                # Reboot to apply', 'info');
            printLine('    installp -c all                 # Commit updates', 'info');
            printLine('', 'info');
            printLine('  smitty       - System Management Interface', 'info');
            printLine('', 'info');
            printLine('🖥️  Console:', 'info');
            printLine('  clear        - Clear screen', 'info');
            printLine('  exit         - Exit console', 'info');
            printLine('', 'info');
            printLine('💡 TIP: Try the full update workflow!', 'success');
            printLine('   1. suma -x -a Action=Preview -a RqType=TL', 'info');
            printLine('   2. suma -x -a Action=Download -a RqType=TL', 'info');
            printLine('   3. mksysb -i /backup/backup.img', 'info');
            printLine('   4. installp -acgXd /updates all', 'info');
            printLine('   5. shutdown -Fr now', 'info');
            getOperationalHelpLines().forEach(line => printLine(line, 'info'));
        },
        'clear': () => clearConsole(),
        'exit': () => {
            printLine('Logging out...', 'info');
            setTimeout(() => closeConsole(), 1000);
        }
    };
    
    if (commands[cmd]) {
        commands[cmd]();
    } else if (command) {
        printLine(`${cmd}: command not found`, 'error');
        printLine('Type "help" for available commands.', 'info');
    }
    
    setTimeout(() => showInput('# '), 100);
}

// UI Controls
function restartInstallation() {
    if (currentScreen === 'aix_shell') {
        if (confirm('Reiniciar o shell de prática?')) {
            startPracticeShell();
        }
        return;
    }
    if (confirm('Are you sure you want to restart the installation? All progress will be lost.')) {
        startInstallation();
    }
}

function showHelp() {
    alert(`AIX Simulator — Ajuda

MODOS:
  Modo Prática  — Shell AIX com comandos (padrão ao abrir)
  Instalação    — Simula instalação completa do AIX 7.3

COMANDOS ESSENCIAIS:
  errpt, vmstat 1 5, svmon -G, lssrc -a, ps -ef
  netstat -an, df -g, who, crontab -l

CENÁRIOS GUIADOS (sidebar ou "scenario slow_server"):
  Servidor lento, Serviço parado, Disco cheio

Digite "help" no shell para referência completa.`);
}

function closeConsole() {
    if (confirm('Are you sure you want to close the console?')) {
        window.location.href = 'lpars.html';
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Get LPAR info from URL
    const params = new URLSearchParams(window.location.search);
    const lparId = params.get('lpar');
    const lparName = params.get('name') || 'Unknown LPAR';
    
    lparData = { id: lparId, name: lparName };
    
    document.getElementById('lparName').textContent = `Console: ${lparName}`;
    document.getElementById('lparInfo').textContent = `LPAR ID: ${lparId || 'N/A'} • AIX Installation Simulator`;
    
    // Setup input handler
    const input = document.getElementById('consoleInput');
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            processInput();
        }
    });
    
    const mode = params.get('mode') || 'practice';
    if (mode === 'install') {
        setTimeout(() => startInstallation(), 500);
    } else {
        setTimeout(() => startPracticeShell(), 500);
    }
});

// Made with Bob
