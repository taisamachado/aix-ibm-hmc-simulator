// Load dashboard data
async function loadDashboard() {
    try {
        // Load stats
        const statsResponse = await fetch(`${API_BASE_URL}/dashboard/stats`, {
            headers: getAuthHeaders()
        });
        
        if (!statsResponse.ok) {
            handleApiError(null, statsResponse);
            return;
        }
        
        const stats = await statsResponse.json();
        updateStats(stats);
        
        // Load systems
        const systemsResponse = await fetch(`${API_BASE_URL}/systems`, {
            headers: getAuthHeaders()
        });
        
        if (!systemsResponse.ok) {
            handleApiError(null, systemsResponse);
            return;
        }
        
        const systems = await systemsResponse.json();
        updateSystemsTable(systems);
        
        // Load LPARs
        const lparsResponse = await fetch(`${API_BASE_URL}/lpars`, {
            headers: getAuthHeaders()
        });
        
        if (!lparsResponse.ok) {
            handleApiError(null, lparsResponse);
            return;
        }
        
        const lpars = await lparsResponse.json();
        updateLparsTable(lpars.filter(lpar => lpar.status === 'Running').slice(0, 10));
        
        // Load events
        const eventsResponse = await fetch(`${API_BASE_URL}/events`, {
            headers: getAuthHeaders()
        });
        
        if (!eventsResponse.ok) {
            handleApiError(null, eventsResponse);
            return;
        }
        
        const events = await eventsResponse.json();
        updateEventsList(events);
        
    } catch (error) {
        console.error('Error loading dashboard:', error);
    }
}

function updateStats(stats) {
    document.getElementById('totalSystems').textContent = stats.total_systems;
    document.getElementById('totalLpars').textContent = stats.total_lpars;
    document.getElementById('runningLpars').textContent = stats.running_lpars;
    document.getElementById('stoppedLpars').textContent = stats.stopped_lpars;
    
    const cpuPercent = Math.round((stats.used_cpu / stats.total_cpu) * 100);
    document.getElementById('cpuUtilization').textContent = `${cpuPercent}%`;
    document.getElementById('usedCpu').textContent = stats.used_cpu;
    document.getElementById('totalCpu').textContent = stats.total_cpu;
    document.getElementById('cpuProgress').style.width = `${cpuPercent}%`;
    
    const memoryPercent = Math.round((stats.used_memory / stats.total_memory) * 100);
    const totalMemoryGB = Math.round(stats.total_memory / 1024);
    const usedMemoryGB = Math.round(stats.used_memory / 1024);
    document.getElementById('memoryUtilization').textContent = `${memoryPercent}%`;
    document.getElementById('usedMemory').textContent = usedMemoryGB;
    document.getElementById('totalMemory').textContent = totalMemoryGB;
    document.getElementById('memoryProgress').style.width = `${memoryPercent}%`;
}

function updateSystemsTable(systems) {
    const tbody = document.getElementById('systemsTableBody');
    
    if (systems.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="loading">No systems found</td></tr>';
        return;
    }
    
    tbody.innerHTML = systems.map(system => {
        const cpuPercent = Math.round((system.cpu.used / system.cpu.total) * 100);
        const memoryPercent = Math.round((system.memory.used / system.memory.total) * 100);
        
        return `
            <tr>
                <td><strong>${system.name}</strong></td>
                <td>${system.type}</td>
                <td><span class="status-badge status-running">${system.status}</span></td>
                <td>${system.lpars_count}</td>
                <td>${cpuPercent}% (${system.cpu.used}/${system.cpu.total})</td>
                <td>${memoryPercent}% (${Math.round(system.memory.used/1024)}/${Math.round(system.memory.total/1024)} GB)</td>
            </tr>
        `;
    }).join('');
}

function updateLparsTable(lpars) {
    const tbody = document.getElementById('lparsTableBody');
    
    if (lpars.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8" class="loading">No active LPARs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = lpars.map(lpar => {
        const statusClass = lpar.status === 'Running' ? 'status-running' : 
                           lpar.status === 'Not Activated' ? 'status-stopped' : 'status-warning';
        
        return `
            <tr>
                <td><strong>${lpar.name}</strong></td>
                <td>${lpar.system_id.replace('sys_', '').replace(/_/g, '-').toUpperCase()}</td>
                <td>${lpar.os}</td>
                <td><span class="status-badge ${statusClass}">${lpar.status}</span></td>
                <td>${lpar.cpu.current} / ${lpar.cpu.max}</td>
                <td>${lpar.memory.current.toLocaleString()}</td>
                <td>${lpar.ip_address}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-secondary" onclick="viewLpar('${lpar.id}')">View</button>
                        ${lpar.status === 'Running' ? 
                            `<button class="btn btn-sm btn-danger" onclick="stopLpar('${lpar.id}', '${lpar.name}')">Stop</button>` :
                            `<button class="btn btn-sm btn-success" onclick="startLpar('${lpar.id}', '${lpar.name}')">Start</button>`
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function updateEventsList(events) {
    const eventsList = document.getElementById('eventsList');
    
    if (events.length === 0) {
        eventsList.innerHTML = '<div class="loading">No recent events</div>';
        return;
    }
    
    eventsList.innerHTML = events.slice(0, 10).map(event => {
        const severityClass = event.severity === 'ERROR' ? 'error-red' :
                             event.severity === 'WARNING' ? 'warning-yellow' :
                             event.severity === 'INFO' ? 'ibm-blue' : 'text-secondary';
        
        const timestamp = new Date(event.timestamp).toLocaleString();
        
        return `
            <div class="event-item">
                <div class="event-header">
                    <span class="event-severity" style="color: var(--${severityClass})">${event.severity}</span>
                    <span class="event-time">${timestamp}</span>
                </div>
                <div class="event-message">${event.message}</div>
                <div class="event-details">${event.source} - ${event.details}</div>
            </div>
        `;
    }).join('');
}

// LPAR Actions
async function startLpar(lparId, lparName) {
    if (!confirm(`Are you sure you want to start LPAR "${lparName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lpars/${lparId}/action`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ action: 'start' })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`LPAR "${lparName}" start operation initiated successfully`);
            loadDashboard(); // Reload dashboard
        } else {
            alert(`Failed to start LPAR: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error starting LPAR:', error);
        alert('Error starting LPAR. Please try again.');
    }
}

async function stopLpar(lparId, lparName) {
    if (!confirm(`Are you sure you want to stop LPAR "${lparName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lpars/${lparId}/action`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ action: 'stop' })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`LPAR "${lparName}" stop operation initiated successfully`);
            loadDashboard(); // Reload dashboard
        } else {
            alert(`Failed to stop LPAR: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error stopping LPAR:', error);
        alert('Error stopping LPAR. Please try again.');
    }
}

function viewLpar(lparId) {
    window.location.href = `lpars.html?id=${lparId}`;
}

// Load dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
    loadDashboard();
    
    // Refresh dashboard every 30 seconds
    setInterval(loadDashboard, 30000);
});

// Made with Bob
