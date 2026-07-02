let systems = [];
let lpars = [];

// Load LPARs and systems
async function loadLpars() {
    try {
        // Load systems first for the dropdown
        const systemsResponse = await fetch(`${API_BASE_URL}/systems`, {
            headers: getAuthHeaders()
        });
        
        if (systemsResponse.ok) {
            systems = await systemsResponse.json();
            populateSystemsDropdown();
        }
        
        // Load LPARs
        const lparsResponse = await fetch(`${API_BASE_URL}/lpars`, {
            headers: getAuthHeaders()
        });
        
        if (!lparsResponse.ok) {
            handleApiError(null, lparsResponse);
            return;
        }
        
        lpars = await lparsResponse.json();
        updateLparsTable(lpars);
        populateViosDropdown();
        
    } catch (error) {
        console.error('Error loading LPARs:', error);
    }
}

function populateSystemsDropdown() {
    const select = document.getElementById('systemId');
    select.innerHTML = '<option value="">Select a system...</option>' +
        systems.map(sys => `<option value="${sys.id}">${sys.name} (${sys.type})</option>`).join('');
}

function populateViosDropdown() {
    const select = document.getElementById('viosId');
    // Filter only VIOS LPARs
    const viosLpars = lpars.filter(lpar => lpar.os && lpar.os.includes('VIOS'));
    
    if (viosLpars.length === 0) {
        select.innerHTML = '<option value="">No VIOS available</option>';
        select.disabled = true;
    } else {
        select.innerHTML = '<option value="">Select a VIOS...</option>' +
            viosLpars.map(vios => {
                const systemName = systems.find(s => s.id === vios.system_id)?.name || vios.system_id;
                return `<option value="${vios.id}">${vios.name} (${systemName})</option>`;
            }).join('');
        select.disabled = false;
    }
}

function updateLparsTable(lpars) {
    const tbody = document.getElementById('lparsTableBody');
    
    if (lpars.length === 0) {
        tbody.innerHTML = '<tr><td colspan="9" class="loading">No LPARs found</td></tr>';
        return;
    }
    
    tbody.innerHTML = lpars.map(lpar => {
        const statusClass = lpar.status === 'Running' ? 'status-running' : 
                           lpar.status === 'Not Activated' ? 'status-stopped' : 
                           lpar.status === 'Shutdown' ? 'status-stopped' : 'status-warning';
        
        const systemName = systems.find(s => s.id === lpar.system_id)?.name || lpar.system_id;
        
        return `
            <tr>
                <td><strong>${lpar.name}</strong></td>
                <td>${systemName}</td>
                <td>${lpar.os}</td>
                <td><span class="status-badge ${statusClass}">${lpar.status}</span></td>
                <td>${lpar.cpu.current} / ${lpar.cpu.max}</td>
                <td>${lpar.memory.current.toLocaleString()}</td>
                <td>${lpar.ip_address}</td>
                <td>${lpar.uptime}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm" style="background-color: #0F62FE; color: white;" onclick="openConsole('${lpar.id}', '${lpar.name}')">🖥️ Console</button>
                        ${lpar.status === 'Running' ?
                            `<button class="btn btn-sm btn-danger" onclick="performAction('${lpar.id}', '${lpar.name}', 'stop')">Stop</button>
                             <button class="btn btn-sm btn-secondary" onclick="performAction('${lpar.id}', '${lpar.name}', 'restart')">Restart</button>` :
                            `<button class="btn btn-sm btn-success" onclick="performAction('${lpar.id}', '${lpar.name}', 'start')">Start</button>`
                        }
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

// LPAR Actions
async function performAction(lparId, lparName, action) {
    const actionText = action.charAt(0).toUpperCase() + action.slice(1);
    
    if (!confirm(`Are you sure you want to ${action} LPAR "${lparName}"?`)) {
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lpars/${lparId}/action`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ action })
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`LPAR "${lparName}" ${action} operation initiated successfully`);
            loadLpars(); // Reload table
        } else {
            alert(`Failed to ${action} LPAR: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error(`Error ${action}ing LPAR:`, error);
        alert(`Error ${action}ing LPAR. Please try again.`);
    }
}

// Modal functions
function showCreateLparModal() {
    document.getElementById('createLparModal').style.display = 'flex';
}

function hideCreateLparModal() {
    document.getElementById('createLparModal').style.display = 'none';
    document.getElementById('createLparForm').reset();
}

// Create LPAR
document.getElementById('createLparForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
        name: document.getElementById('lparName').value,
        system_id: document.getElementById('systemId').value,
        os: document.getElementById('osType').value,
        vios_id: document.getElementById('viosId').value,
        cpu_desired: parseInt(document.getElementById('cpuDesired').value),
        cpu_min: parseInt(document.getElementById('cpuMin').value),
        cpu_max: parseInt(document.getElementById('cpuMax').value),
        memory_desired: parseInt(document.getElementById('memoryDesired').value),
        memory_min: parseInt(document.getElementById('memoryMin').value),
        memory_max: parseInt(document.getElementById('memoryMax').value)
    };
    
    // Validate
    if (formData.cpu_min > formData.cpu_desired || formData.cpu_desired > formData.cpu_max) {
        alert('CPU values must be: Min ≤ Desired ≤ Max');
        return;
    }
    
    if (formData.memory_min > formData.memory_desired || formData.memory_desired > formData.memory_max) {
        alert('Memory values must be: Min ≤ Desired ≤ Max');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/lpars`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (response.ok && data.success) {
            alert(`LPAR "${formData.name}" created successfully!`);
            hideCreateLparModal();
            loadLpars(); // Reload table
        } else {
            alert(`Failed to create LPAR: ${data.error || 'Unknown error'}`);
        }
    } catch (error) {
        console.error('Error creating LPAR:', error);
        alert('Error creating LPAR. Please try again.');
    }
});

// Load LPARs on page load
document.addEventListener('DOMContentLoaded', () => {
    loadLpars();
});

// Made with Bob

// Open console for LPAR
function openConsole(lparId, lparName) {
    window.open(`console.html?lpar=${lparId}&name=${encodeURIComponent(lparName)}`, '_blank', 'width=1400,height=900');
}
