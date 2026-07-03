// AIX Update/Patch Simulator Functions
// This file contains interactive update simulation functions

// Helper function to simulate download progress
function simulateDownload(updateType, callback) {
    const update = availableUpdates[updateType];
    let progress = 0;
    
    printLine('', 'info');
    printLine(`Downloading ${update.description}...`, 'info');
    printLine(`Size: ${update.size}`, 'info');
    printLine('', 'info');
    
    const interval = setInterval(() => {
        progress += 10;
        const bar = '█'.repeat(progress / 5) + '░'.repeat(20 - progress / 5);
        clearLastLines(1);
        printLine(`[${bar}] ${progress}%`, 'info');
        
        if (progress >= 100) {
            clearInterval(interval);
            printLine('', 'info');
            printLine('Download completed successfully!', 'success');
            printLine(`Files saved to: /updates/aix_${updateType.toLowerCase()}`, 'info');
            
            aixSystemState.updatesDownloaded = true;
            aixSystemState.updateType = updateType;
            aixSystemState.updateVersion = update.version;
            
            if (callback) callback();
        }
    }, 500);
}

// Helper function to simulate installation progress
function simulateInstallation(callback) {
    const update = availableUpdates[aixSystemState.updateType];
    let progress = 0;
    let currentFileset = 0;
    
    printLine('', 'info');
    printLine('Installing filesets...', 'info');
    printLine('', 'info');
    
    const interval = setInterval(() => {
        progress += 5;
        
        if (progress % 25 === 0 && currentFileset < update.filesets.length) {
            printLine(`Installing ${update.filesets[currentFileset].name} ${update.filesets[currentFileset].version}...`, 'info');
            currentFileset++;
        }
        
        if (progress >= 100) {
            clearInterval(interval);
            printLine('', 'info');
            printLine('Installation completed successfully!', 'success');
            printLine('', 'info');
            
            // Update system state
            aixSystemState.version = update.version;
            aixSystemState.tl = update.tl;
            aixSystemState.filesets = update.filesets.map(fs => ({
                name: fs.name,
                version: fs.version,
                state: 'APPLIED'
            }));
            aixSystemState.needsReboot = true;
            
            printLine('⚠️  System reboot required to complete installation', 'warning');
            printLine('Run: shutdown -Fr now', 'info');
            
            if (callback) callback();
        }
    }, 600);
}

// Command: suma with different options
function cmdSuma(args) {
    if (!args || args === '') {
        printLine('Service Update Management Assistant (SUMA)', 'info');
        printLine('', 'info');
        printLine('Usage: suma -x -a Action=<action> -a RqType=<type>', 'info');
        printLine('', 'info');
        printLine('Actions: Preview, Download', 'info');
        printLine('Types: TL (Technology Level), SP (Service Pack), Latest, Security', 'info');
        printLine('', 'info');
        printLine('Examples:', 'info');
        printLine('  suma -x -a Action=Preview -a RqType=TL', 'info');
        printLine('  suma -x -a Action=Download -a RqType=TL', 'info');
        printLine('  suma -x -a Action=Preview -a RqType=Security', 'info');
        showInput('# ');
        return;
    }
    
    // Parse suma command
    if (args.includes('Action=Preview')) {
        if (args.includes('RqType=TL') || args.includes('RqType=Latest')) {
            cmdSumaPreview('TL');
        } else if (args.includes('RqType=SP')) {
            cmdSumaPreview('SP');
        } else if (args.includes('RqType=Security')) {
            cmdSumaPreview('SECURITY');
        } else {
            printLine('Error: Invalid RqType. Use: TL, SP, Latest, or Security', 'error');
            showInput('# ');
        }
    } else if (args.includes('Action=Download')) {
        if (args.includes('RqType=TL') || args.includes('RqType=Latest')) {
            cmdSumaDownload('TL');
        } else if (args.includes('RqType=SP')) {
            cmdSumaDownload('SP');
        } else if (args.includes('RqType=Security')) {
            cmdSumaDownload('SECURITY');
        } else {
            printLine('Error: Invalid RqType. Use: TL, SP, Latest, or Security', 'error');
            showInput('# ');
        }
    } else {
        printLine('Error: Invalid Action. Use: Preview or Download', 'error');
        showInput('# ');
    }
}

function cmdSumaPreview(type) {
    printLine('Connecting to IBM Fix Central...', 'info');
    setTimeout(() => {
        const update = availableUpdates[type];
        printLine('', 'info');
        printLine('═══════════════════════════════════════════════════════', 'info');
        printLine(`  Available Update: ${update.description}`, 'success');
        printLine('═══════════════════════════════════════════════════════', 'info');
        printLine(`  Version:      ${update.version}`, 'info');
        printLine(`  Size:         ${update.size}`, 'info');
        printLine(`  Release Date: ${update.releaseDate}`, 'info');
        printLine('', 'info');
        printLine('  Filesets included:', 'info');
        update.filesets.forEach(fs => {
            printLine(`    - ${fs.name} ${fs.version}`, 'info');
        });
        printLine('', 'info');
        printLine(`To download: suma -x -a Action=Download -a RqType=${type}`, 'info');
        showInput('# ');
    }, 2000);
}

function cmdSumaDownload(type) {
    printLine('Connecting to IBM Fix Central...', 'info');
    setTimeout(() => {
        simulateDownload(type, () => {
            showInput('# ');
        });
    }, 1500);
}

// Command: mksysb (backup)
function cmdMksysb(args) {
    if (!args || args === '') {
        printLine('Usage: mksysb [-i] backup_file', 'info');
        printLine('', 'info');
        printLine('Creates a backup of the root volume group (rootvg)', 'info');
        printLine('', 'info');
        printLine('Example: mksysb -i /backup/mksysb_backup.img', 'info');
        showInput('# ');
        return;
    }
    
    const filename = args.includes('/backup/') ? args.split('/backup/')[1].trim() : 'mksysb_backup.img';
    
    printLine('', 'info');
    printLine('Creating system backup...', 'info');
    printLine(`Target: /backup/${filename}`, 'info');
    printLine('', 'info');
    
    let progress = 0;
    const interval = setInterval(() => {
        progress += 10;
        const bar = '█'.repeat(progress / 5) + '░'.repeat(20 - progress / 5);
        clearLastLines(1);
        printLine(`[${bar}] ${progress}% - Backing up rootvg...`, 'info');
        
        if (progress >= 100) {
            clearInterval(interval);
            printLine('', 'info');
            printLine('✓ Backup completed successfully!', 'success');
            printLine(`  File: /backup/${filename}`, 'info');
            printLine(`  Size: 2.4 GB`, 'info');
            aixSystemState.backupCreated = true;
            showInput('# ');
        }
    }, 400);
}

// Command: installp (install/update software)
function cmdInstallp(args) {
    if (!args || args === '') {
        printLine('Usage: installp [-options] fileset_name', 'info');
        printLine('', 'info');
        printLine('Common options:', 'info');
        printLine('  -a  Apply (install)', 'info');
        printLine('  -c  Commit changes', 'info');
        printLine('  -g  Install dependencies', 'info');
        printLine('  -X  Expand filesystems if needed', 'info');
        printLine('  -d  Source directory', 'info');
        printLine('  -p  Preview only', 'info');
        printLine('', 'info');
        printLine('Examples:', 'info');
        printLine('  installp -apXd /updates all          # Preview installation', 'info');
        printLine('  installp -acgXd /updates all         # Install updates', 'info');
        printLine('  installp -c all                      # Commit applied updates', 'info');
        showInput('# ');
        return;
    }
    
    // Preview mode
    if (args.includes('-ap') || args.includes('-p')) {
        if (!aixSystemState.updatesDownloaded) {
            printLine('Error: No updates downloaded. Run suma first.', 'error');
            showInput('# ');
            return;
        }
        
        const update = availableUpdates[aixSystemState.updateType];
        printLine('', 'info');
        printLine('Preview Mode - No changes will be made', 'info');
        printLine('', 'info');
        printLine('The following filesets will be installed:', 'info');
        update.filesets.forEach(fs => {
            printLine(`  ${fs.name} ${fs.version}`, 'info');
        });
        printLine('', 'info');
        printLine('To proceed with installation: installp -acgXd /updates all', 'info');
        showInput('# ');
        return;
    }
    
    // Commit mode
    if (args.includes('-c') && !args.includes('-acg')) {
        if (aixSystemState.filesets.every(fs => fs.state === 'COMMITTED')) {
            printLine('All filesets are already committed.', 'info');
            showInput('# ');
            return;
        }
        
        printLine('', 'info');
        printLine('Committing applied filesets...', 'info');
        setTimeout(() => {
            aixSystemState.filesets = aixSystemState.filesets.map(fs => ({
                ...fs,
                state: 'COMMITTED'
            }));
            printLine('✓ All filesets committed successfully!', 'success');
            printLine('', 'info');
            printLine('Updates are now permanent and cannot be rolled back.', 'info');
            showInput('# ');
        }, 2000);
        return;
    }
    
    // Installation mode
    if (args.includes('-acg') || args.includes('-ag')) {
        if (!aixSystemState.updatesDownloaded) {
            printLine('Error: No updates downloaded. Run suma first.', 'error');
            showInput('# ');
            return;
        }
        
        if (!aixSystemState.backupCreated) {
            printLine('⚠️  WARNING: No backup detected!', 'warning');
            printLine('It is strongly recommended to create a backup before updating.', 'warning');
            printLine('Run: mksysb -i /backup/mksysb_backup.img', 'info');
            printLine('', 'info');
            printLine('Continue anyway? (yes/no)', 'warning');
            // In a real implementation, we'd wait for user input here
            // For simulation, we'll proceed
        }
        
        simulateInstallation(() => {
            showInput('# ');
        });
        return;
    }
    
    printLine('Invalid options. Use: installp (without args) for help', 'error');
    showInput('# ');
}

// Command: shutdown (reboot)
function cmdShutdown(args) {
    if (args.includes('-Fr')) {
        if (aixSystemState.needsReboot) {
            printLine('', 'info');
            printLine('Shutting down system for reboot...', 'info');
            printLine('', 'info');
            
            setTimeout(() => {
                clearConsole();
                printLine('', 'info');
                printLine('╔══════════════════════════════════════════════════════════════╗', 'success');
                printLine('║                    SYSTEM REBOOTING                         ║', 'success');
                printLine('╚══════════════════════════════════════════════════════════════╝', 'success');
                printLine('', 'info');
                
                setTimeout(() => {
                    printLine('Booting AIX...', 'info');
                    printLine('Loading kernel...                                    [OK]', 'success');
                    printLine('Initializing devices...                              [OK]', 'success');
                    printLine('Starting system services...                          [OK]', 'success');
                    printLine('', 'info');
                    printLine('═══════════════════════════════════════════════════════', 'info');
                    printLine(`  AIX Version ${aixSystemState.version}`, 'success');
                    printLine(`  Copyright IBM Corporation, 1982-2024`, 'info');
                    printLine('═══════════════════════════════════════════════════════', 'info');
                    printLine('', 'info');
                    printLine(`${lparData?.name || 'AIX-LPAR'} login: root`, 'info');
                    printLine('Password: ********', 'info');
                    printLine('', 'info');
                    printLine('Last login: ' + new Date().toLocaleString(), 'info');
                    printLine('', 'info');
                    printLine('✓ System updated successfully!', 'success');
                    printLine(`  New version: ${aixSystemState.version}`, 'success');
                    printLine('', 'info');
                    
                    aixSystemState.needsReboot = false;
                    showInput('# ');
                }, 3000);
            }, 2000);
        } else {
            printLine('Rebooting system...', 'info');
            setTimeout(() => {
                printLine('System rebooted.', 'success');
                showInput('# ');
            }, 2000);
        }
    } else {
        printLine('Usage: shutdown -Fr [+minutes|now]', 'info');
        printLine('', 'info');
        printLine('Examples:', 'info');
        printLine('  shutdown -Fr now     # Reboot immediately', 'info');
        printLine('  shutdown -Fr +5      # Reboot in 5 minutes', 'info');
        showInput('# ');
    }
}

// Export functions to be used in console.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        cmdSuma,
        cmdMksysb,
        cmdInstallp,
        cmdShutdown
    };
}

// Made with Bob
