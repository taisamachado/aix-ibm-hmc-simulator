// Load systems
async function loadSystems() {
    try {
        const response = await fetch(`${API_BASE_URL}/systems`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            handleApiError(null, response);
            return;
        }
        
        const systems = await response.json();
        displaySystems(systems);
        
    } catch (error) {
        console.error('Error loading systems:', error);
    }
}

function displaySystems(systems) {
    const grid = document.getElementById('systemsGrid');
    
    if (systems.length === 0) {
        grid.innerHTML = '<div class="loading" style="grid-column: 1 / -1;">No systems found</div>';
        return;
    }
    
    grid.innerHTML = systems.map(system => {
        const cpuPercent = Math.round((system.cpu.used / system.cpu.total) * 100);
        const memoryPercent = Math.round((system.memory.used / system.memory.total) * 100);
        const memoryGB = {
            total: Math.round(system.memory.total / 1024),
            used: Math.round(system.memory.used / 1024),
            available: Math.round(system.memory.available / 1024)
        };
        
        return `
            <div class="card">
                <div class="card-header">
                    <div>
                        <h2>${system.name}</h2>
                        <p style="color: var(--text-secondary); font-size: 14px; margin-top: 4px;">
                            ${system.type} • Serial: ${system.serial}
                        </p>
                    </div>
                    <span class="status-badge status-running">${system.status}</span>
                </div>
                <div class="card-body">
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 14px; font-weight: 500;">CPU Utilization</span>
                            <span style="font-size: 14px; color: var(--text-secondary);">
                                ${system.cpu.used} / ${system.cpu.total} cores (${cpuPercent}%)
                            </span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${cpuPercent}%; background-color: ${cpuPercent > 80 ? 'var(--error-red)' : cpuPercent > 60 ? 'var(--warning-yellow)' : 'var(--ibm-blue)'}"></div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 24px;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                            <span style="font-size: 14px; font-weight: 500;">Memory Utilization</span>
                            <span style="font-size: 14px; color: var(--text-secondary);">
                                ${memoryGB.used} / ${memoryGB.total} GB (${memoryPercent}%)
                            </span>
                        </div>
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${memoryPercent}%; background-color: ${memoryPercent > 80 ? 'var(--error-red)' : memoryPercent > 60 ? 'var(--warning-yellow)' : 'var(--ibm-blue)'}"></div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 24px;">
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">LPARs</div>
                            <div style="font-size: 24px; font-weight: 300;">${system.lpars_count}</div>
                        </div>
                        <div>
                            <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Firmware</div>
                            <div style="font-size: 16px; font-weight: 400;">${system.firmware}</div>
                        </div>
                    </div>
                    
                    <div style="padding-top: 16px; border-top: 1px solid var(--border-subtle);">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 4px;">Location</div>
                        <div style="font-size: 14px;">${system.location}</div>
                    </div>
                    
                    <div style="margin-top: 20px;">
                        <button class="btn btn-secondary" onclick="viewSystemLpars('${system.id}')" style="width: 100%;">
                            View LPARs
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

async function viewSystemLpars(systemId) {
    try {
        const response = await fetch(`${API_BASE_URL}/systems/${systemId}/lpars`, {
            headers: getAuthHeaders()
        });
        
        if (!response.ok) {
            handleApiError(null, response);
            return;
        }
        
        const lpars = await response.json();
        
        // Create modal to show LPARs
        const modal = document.createElement('div');
        modal.style.cssText = 'position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center;';
        
        modal.innerHTML = `
            <div style="background: white; padding: 32px; border-radius: 8px; max-width: 900px; width: 90%; max-height: 90vh; overflow-y: auto;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                    <h2>LPARs on System ${systemId}</h2>
                    <button onclick="this.closest('div[style*=fixed]').remove()" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-secondary);">&times;</button>
                </div>
                <div class="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Name</th>
                                <th>OS</th>
                                <th>Status</th>
                                <th>CPU</th>
                                <th>Memory (MB)</th>
                                <th>IP Address</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${lpars.length === 0 ? 
                                '<tr><td colspan="6" class="loading">No LPARs found on this system</td></tr>' :
                                lpars.map(lpar => {
                                    const statusClass = lpar.status === 'Running' ? 'status-running' : 'status-stopped';
                                    return `
                                        <tr>
                                            <td><strong>${lpar.name}</strong></td>
                                            <td>${lpar.os}</td>
                                            <td><span class="status-badge ${statusClass}">${lpar.status}</span></td>
                                            <td>${lpar.cpu.current} / ${lpar.cpu.max}</td>
                                            <td>${lpar.memory.current.toLocaleString()}</td>
                                            <td>${lpar.ip_address}</td>
                                        </tr>
                                    `;
                                }).join('')
                            }
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
    } catch (error) {
        console.error('Error loading system LPARs:', error);
        alert('Error loading LPARs for this system');
    }
}

// Load systems on page load
document.addEventListener('DOMContentLoaded', () => {
    loadSystems();
});

// Made with Bob
